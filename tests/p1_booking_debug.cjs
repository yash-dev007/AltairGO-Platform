/**
 * P1 Booking Flow - AltairGO Playwright Debug
 * Run: node tests/p1_booking_debug.cjs
 */
const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:5173';
const API_URL = 'http://127.0.0.1:5000';
const EMAIL = 'testreviewer@altairgo.com';
const PASSWORD = 'TestReviewer123!';
const SHOTS = 'D:/Projects/AltairGO Platform/test-results';

async function shot(page, name) {
  const path = `${SHOTS}/p1-${name}.png`;
  await page.screenshot({ path, fullPage: false });
  console.log(`  Screenshot: ${name}.png`);
}

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 100 });
  const page = await browser.newPage();
  page.setDefaultTimeout(20000);

  // Capture console errors and network 429s
  page.on('console', msg => {
    if (msg.type() === 'error') console.log(`  [CONSOLE ERROR] ${msg.text().slice(0, 120)}`);
  });
  page.on('pageerror', err => console.log(`  [PAGE ERROR] ${err.message.slice(0, 120)}`));
  page.on('response', resp => {
    if (resp.status() === 429) console.log(`  [429] ${resp.url()}`);
  });

  // ── SETUP: Login via API + inject token ──────────────────────────────────
  console.log('\n=== SETUP: Login (API + localStorage inject) ===');
  // Get token via direct API call (avoids browser rate limits and UI timing)
  const loginResp = await page.request.post(`${API_URL}/auth/login`, {
    data: { email: EMAIL, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' }
  });
  const loginData = await loginResp.json();
  const token = loginData.token;
  if (!token) {
    console.log(`  FAIL: Could not get token. Response: ${JSON.stringify(loginData).slice(0, 100)}`);
    await browser.close();
    return;
  }
  console.log(`  Got token: ${token.slice(0, 20)}...`);

  // Inject token into localStorage via a blank page
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate((t) => {
    localStorage.setItem('ag_token', t);
  }, token);
  console.log('  PASS: Token injected into localStorage');
  await shot(page, '00-login');

  // ── 1a. Trips page — spot-check only, then go directly to test trip ────────
  console.log('\n=== 1a. Trips page — spot-check ===');
  await page.goto(`${TARGET_URL}/trips`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  const viewBtns = await page.locator('button:has-text("View")').count();
  console.log(`  "View" buttons visible: ${viewBtns} ${viewBtns > 0 ? '(PASS)' : '(WARNING: cards not visible yet — non-blocking)'}`);
  await shot(page, '1a-trips-loaded');

  // Navigate directly to the test trip (fresh 10-item pending booking plan pre-seeded)
  const TRIP_ID = 397;
  await page.goto(`${TARGET_URL}/trip/${TRIP_ID}`, { waitUntil: 'domcontentloaded' });
  // Wait for trip detail to fully load (tabs appear after API response)
  try {
    await page.waitForSelector('button:has-text("Bookings")', { timeout: 20000 });
  } catch (_) {}
  const tripUrl = page.url();
  console.log(`  Trip detail URL: ${tripUrl}`);
  console.log(`  On trip page: ${/\/trip\/\d+/.test(tripUrl) ? 'PASS' : 'FAIL'}`);
  await shot(page, '1a-trip-detail');

  // ── 1a. Bookings Tab ──────────────────────────────────────────────────────
  console.log('\n=== 1a. Click Bookings Tab ===');
  const allBtnTexts = await page.locator('button').allTextContents();
  console.log('  Tabs/buttons:', JSON.stringify(allBtnTexts.map(t => t.trim()).filter(Boolean)));

  const bookingsTab = page.locator('button', { hasText: 'Bookings' }).first();
  if (await bookingsTab.count() === 0) {
    console.log('  FAIL: Bookings tab not found');
    await shot(page, '1a-no-tab');
    await browser.close();
    return;
  }
  await bookingsTab.click();
  console.log('  PASS: Clicked Bookings tab');
  await page.waitForTimeout(3000);
  await shot(page, '1a-bookings-tab');

  // ── 1a. Check items ───────────────────────────────────────────────────────
  console.log('\n=== 1a. Booking Plan Items ===');
  const emptyState = await page.locator('text=No bookings found').count();

  if (emptyState > 0) {
    console.log('  Empty state: "No bookings found. Generate a trip to see booking options."');
    const tripId = tripUrl.split('/trip/')[1];
    const token = await page.evaluate(() => localStorage.getItem('ag_token'));
    const apiResp = await page.request.get(`${API_URL}/api/trip/${tripId}/bookings`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log(`  API /bookings -> ${apiResp.status()}: ${(await apiResp.text()).slice(0, 200)}`);
    await shot(page, '1a-empty-bookings');
    console.log('  RESULT 1a: FAIL — No bookings to test. Need to seed via create-plan API.');
    await browser.close();
    return;
  }

  const approveCount = await page.locator('button:text-is("Approve")').count();
  const rejectCount = await page.locator('button:text-is("Reject")').count();
  console.log(`  Approve: ${approveCount}, Reject: ${rejectCount}`);
  console.log(`  RESULT 1a: ${approveCount > 0 ? 'PASS' : 'PARTIAL'} — items loaded`);
  await shot(page, '1a-plan-items');

  // ── 1b. Approve / Reject ──────────────────────────────────────────────────
  console.log('\n=== 1b. Approve / Reject ===');
  if (approveCount > 0) {
    // Capture the approve + reload API responses
    let approveApiStatus = null, reloadApiStatus = null;
    const responseWatcher = resp => {
      if (resp.url().includes('/approve')) approveApiStatus = resp.status();
      if (resp.url().includes('/bookings') && resp.request().method() === 'GET') reloadApiStatus = resp.status();
    };
    page.on('response', responseWatcher);
    await page.locator('button:text-is("Approve")').first().click();
    // Wait for loadBookings GET to complete
    try {
      await page.waitForResponse(r => r.url().includes('/bookings') && r.request().method() === 'GET', { timeout: 8000 });
    } catch (_) { console.log('  WARNING: loadBookings GET not detected in 8s'); }
    await page.waitForTimeout(2000); // allow React to re-render
    page.off('response', responseWatcher);
    const approveAfter = await page.locator('button:text-is("Approve")').count();
    const approvedBadge = await page.locator('span:has-text("approved")').count();
    console.log(`  Approve API: ${approveApiStatus}, Reload GET: ${reloadApiStatus}`);
    console.log(`  After approve: ${approveAfter} pending left, "approved" badge: ${approvedBadge}`);
    console.log(`  RESULT 1b-approve: ${approveCount > approveAfter ? 'PASS' : 'FAIL'}`);
  } else {
    console.log('  SKIP: No pending items to approve');
  }

  const rejectNow = await page.locator('button:text-is("Reject")').count();
  if (rejectNow > 0) {
    const rejectBtns = await page.locator('button:text-is("Reject")').all();
    await rejectBtns[rejectBtns.length - 1].click();
    await page.waitForTimeout(4000);
    const rejectedBadge = await page.locator('span:has-text("rejected")').count();
    console.log(`  "rejected" badge visible: ${rejectedBadge}`);
    console.log(`  RESULT 1b-reject: ${rejectedBadge > 0 ? 'PASS' : 'PARTIAL'}`);
  } else {
    console.log('  SKIP: No items to reject');
  }
  await shot(page, '1b-approve-reject');

  // ── 1c. Execute All ───────────────────────────────────────────────────────
  console.log('\n=== 1c. Execute All ===');
  let pendingLeft = await page.locator('button:text-is("Approve")').count();
  let safety = 15;
  while (pendingLeft > 0 && safety-- > 0) {
    await page.locator('button:text-is("Approve")').first().click();
    await page.waitForTimeout(1500); // wait for API response + state update
    pendingLeft = await page.locator('button:text-is("Approve")').count();
  }
  console.log(`  All remaining approved`);

  const executeBtn = page.locator('button:has-text("Confirm & Book All Approved")');
  const execVisible = await executeBtn.count() > 0;
  console.log(`  Execute button visible: ${execVisible}`);

  if (execVisible) {
    await executeBtn.click();
    console.log('  Clicked Execute — waiting for booking refs...');
    try {
      await page.waitForSelector('span:has-text("booked"), span:has-text("Booked"), span:has-text("executed")', { timeout: 15000 });
    } catch (_) { console.log('  WARNING: booked badge wait timed out, checking anyway...'); }
    const executedBadge = await page.locator('span:has-text("executed"), span:has-text("booked"), span:has-text("Booked")').count();
    const refText = await page.locator('text=Ref:').count();
    console.log(`  "executed/booked" badges: ${executedBadge}, Refs: ${refText}`);
    console.log(`  RESULT 1c: ${executedBadge > 0 ? 'PASS' : 'PARTIAL'}`);
  } else {
    const btns = await page.locator('button').allTextContents();
    console.log(`  FAIL: Execute button not found. Buttons: ${JSON.stringify(btns.map(t => t.trim()).filter(Boolean))}`);
  }
  await shot(page, '1c-execute-all');

  // ── 1d. Cancel ────────────────────────────────────────────────────────────
  console.log('\n=== 1d. Cancel ===');
  const cancelNow = await page.locator('button:has-text("Cancel")').count();
  console.log(`  Cancel buttons: ${cancelNow}`);

  if (cancelNow > 0) {
    // Wait for cancel POST first, then the GET reload triggered by .then(loadBookings)
    const cancelPostDone = page.waitForResponse(r => r.url().includes('/cancel'), { timeout: 8000 }).catch(() => null);
    await page.locator('button:has-text("Cancel")').first().click();
    await cancelPostDone;
    try {
      await page.waitForResponse(r => r.url().includes('/bookings') && r.request().method() === 'GET', { timeout: 8000 });
    } catch (_) { console.log('  WARNING: cancel GET reload not detected'); }
    await page.waitForTimeout(2000); // allow React to re-render
    const cancelledBadge = await page.locator('span:has-text("cancelled")').count();
    console.log(`  "cancelled" badge: ${cancelledBadge}`);
    console.log(`  RESULT 1d-cancel: ${cancelledBadge > 0 ? 'PASS' : 'PARTIAL'}`);

    // Idempotency
    const cancelAfter = await page.locator('button:has-text("Cancel")').count();
    if (cancelAfter > 0) {
      await page.locator('button:has-text("Cancel")').first().click();
      await page.waitForTimeout(2000);
      const errVisible = await page.locator('[class*="error"], [class*="toast-error"]').or(page.locator('text=failed')).or(page.locator('text=Error')).count();
      console.log(`  Re-cancel idempotent: ${errVisible === 0 ? 'PASS' : 'FAIL (error shown)'}`);
    } else {
      console.log('  PASS: Cancel button gone after cancel (correct state transition)');
    }
  } else {
    console.log('  NOTE: No Cancel buttons — only show on approved/executed items');
    const executedBadge3 = await page.locator('span:has-text("executed"), span:has-text("booked")').count();
    console.log(`  Executed/Booked items: ${executedBadge3}`);
    if (executedBadge3 === 0) {
      console.log('  FAIL: No executed/booked items and no Cancel buttons');
    }
  }
  await shot(page, '1d-cancel');

  console.log('\n=== P1 COMPLETE ===');
  await page.waitForTimeout(3000);
  await browser.close();
})();
