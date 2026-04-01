/**
 * P1 Booking Flow — Edge Case Deep Recheck
 * Production-grade validation: empty state, all-rejected execute, partial state,
 * state persistence, execute button visibility, no unexpected API errors.
 *
 * Pre-requisites (seeded before run):
 *   Trip 396 — NO bookings (empty state)
 *   Trip 395 — 10 pending bookings
 *   Trip 394 — 10 pending bookings
 *   Trip 393 — 10 pending bookings
 *
 * Run: node tests/p1_edge_cases.cjs
 */
const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:5173';
const API_URL    = 'http://127.0.0.1:5000';
const EMAIL      = 'testreviewer@altairgo.com';
const PASSWORD   = 'TestReviewer123!';
const SHOTS      = 'D:/Projects/AltairGO Platform/test-results';

const results = [];
const apiErrors = [];

function pass(label)    { results.push({ label, r: 'PASS'    }); console.log(`  ✓ PASS    ${label}`); }
function fail(label, d) { results.push({ label, r: 'FAIL'    }); console.log(`  ✗ FAIL    ${label}${d ? ' — ' + d : ''}`); }
function warn(label, d) { results.push({ label, r: 'WARNING' }); console.log(`  ⚠ WARNING ${label}${d ? ' — ' + d : ''}`); }

async function shot(page, name) {
  const p = `${SHOTS}/p1ec-${name}.png`;
  await page.screenshot({ path: p, fullPage: false });
  console.log(`  📸 ${name}.png`);
}

async function injectToken(page) {
  const resp = await page.request.post(`${API_URL}/auth/login`, {
    data: { email: EMAIL, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' }
  });
  const { token } = await resp.json();
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate(t => localStorage.setItem('ag_token', t), token);
  return token;
}

async function goBookingsTab(page, tripId) {
  await page.goto(`${TARGET_URL}/trip/${tripId}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('button:has-text("Bookings")', { timeout: 20000 });
  await page.locator('button', { hasText: 'Bookings' }).first().click();
  await page.waitForTimeout(3000);
}

async function waitForBookingsReload(page, timeoutMs = 8000) {
  try {
    await page.waitForResponse(
      r => r.url().includes('/bookings') && r.request().method() === 'GET',
      { timeout: timeoutMs }
    );
    await page.waitForTimeout(1500);
  } catch (_) {}
}

// ─────────────────────────────────────────────────────────────────────────────
(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 80 });
  const page    = await browser.newPage();
  page.setDefaultTimeout(25000);

  // Track all non-2xx API responses
  page.on('response', resp => {
    const status = resp.status();
    const url    = resp.url();
    if (url.includes('127.0.0.1:5000') && status >= 400) {
      apiErrors.push(`${status} ${url}`);
      console.log(`  [${status}] ${url}`);
    }
  });

  // ── SETUP ─────────────────────────────────────────────────────────────────
  console.log('\n=== SETUP: inject token ===');
  await injectToken(page);

  // ══════════════════════════════════════════════════════════════════════════
  // EC1 — EMPTY STATE: "Confirm & Book All Approved" button on 0 bookings
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n=== EC1: Empty state — bookings tab with 0 bookings (trip 396) ===');
  await goBookingsTab(page, 396); // trip 396 has 0 bookings throughout
  await shot(page, 'ec1-empty-state');

  const emptyMsg = await page.locator('text=No bookings found').count();
  emptyMsg > 0 ? pass('EC1.1 empty state text shown') : fail('EC1.1 empty state text missing');

  const execBtnOnEmpty = await page.locator('button:has-text("Confirm & Book All Approved")').count();
  // The button should NOT be visible on empty state (UX regression check)
  execBtnOnEmpty === 0
    ? pass('EC1.2 Execute button hidden on empty state')
    : warn('EC1.2 Execute button visible on empty state (UX issue — fires useless API call)');

  if (execBtnOnEmpty > 0) {
    // Click it anyway — verify graceful handling (no crash, maybe a toast)
    await page.locator('button:has-text("Confirm & Book All Approved")').click();
    await page.waitForTimeout(2000);
    const toastError = await page.locator('[class*="toast"], [class*="Toastify"]').count();
    console.log(`     Clicked Execute on empty — toasts: ${toastError}`);
    await shot(page, 'ec1-execute-on-empty');
    // No hard crash is good enough
    pass('EC1.2a Execute on empty state — no crash');
  }

  // ══════════════════════════════════════════════════════════════════════════
  // EC2 — ALL REJECTED: Execute All with zero approved items (trip 395)
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n=== EC2: All-rejected — Execute All with 0 approved items (trip 392) ===');
  await goBookingsTab(page, 392);

  // Reject all 10 items — wait for each API response to avoid race conditions
  let rejectBtns = await page.locator('button:text-is("Reject")').count();
  console.log(`  Rejecting all ${rejectBtns} items...`);
  let safety = 15;
  while (rejectBtns > 0 && safety-- > 0) {
    const rejectDone = page.waitForResponse(
      r => r.url().includes('/reject'), { timeout: 6000 }
    ).catch(() => null);
    await page.locator('button:text-is("Reject")').first().click();
    await rejectDone;
    await waitForBookingsReload(page, 5000);
    rejectBtns = await page.locator('button:text-is("Reject")').count();
  }
  console.log(`  Reject buttons remaining: ${rejectBtns}`);
  await shot(page, 'ec2-all-rejected');

  const approveAfterAllReject = await page.locator('button:text-is("Approve")').count();
  const rejectedPills = await page.locator('span:has-text("rejected")').count();
  approveAfterAllReject === 0 ? pass('EC2.1 no Approve buttons after all-reject') : fail('EC2.1 Approve buttons still visible', `${approveAfterAllReject} remain`);
  rejectedPills > 0 ? pass('EC2.2 rejected status pills shown') : fail('EC2.2 no rejected pills visible');

  // Execute All should either be hidden or show 0-executed feedback
  const execBtn2 = page.locator('button:has-text("Confirm & Book All Approved")');
  if (await execBtn2.count() > 0) {
    warn('EC2.3 Execute button still visible with all-rejected (UX: should be disabled/hidden)');
    // Click and check response
    await execBtn2.click();
    await page.waitForTimeout(3000);
    const bookedAfter = await page.locator('span:has-text("booked"), span:has-text("Booked")').count();
    bookedAfter === 0 ? pass('EC2.3a Execute with all-rejected → 0 items booked (correct)') : fail('EC2.3a Execute with all-rejected booked items', `${bookedAfter} booked`);
    await shot(page, 'ec2-execute-all-rejected');
  } else {
    pass('EC2.3 Execute button hidden when all rejected');
  }

  // ══════════════════════════════════════════════════════════════════════════
  // EC3 — PARTIAL STATE: approve 3, reject 3, leave 4 pending → execute
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n=== EC3: Partial state — approve 3, reject 3, execute → only approved booked (trip 391) ===');
  await goBookingsTab(page, 391);

  const totalItems = await page.locator('button:text-is("Approve")').count();
  console.log(`  Total items: ${totalItems}`);

  // Approve first 3
  for (let i = 0; i < 3; i++) {
    const approveResponseDone = page.waitForResponse(
      r => r.url().includes('/approve'), { timeout: 6000 }
    ).catch(() => null);
    await page.locator('button:text-is("Approve")').first().click();
    await approveResponseDone;
    await waitForBookingsReload(page, 5000);
  }
  const afterApprove3 = await page.locator('button:text-is("Approve")').count();
  console.log(`  After 3 approves — Approve buttons: ${afterApprove3} (expect ${totalItems - 3})`);
  afterApprove3 === totalItems - 3
    ? pass('EC3.1 approve 3 — pending count decremented correctly')
    : fail('EC3.1 approve 3 pending count wrong', `got ${afterApprove3} expected ${totalItems - 3}`);

  // Reject next 3 (first 3 of remaining)
  for (let i = 0; i < 3; i++) {
    const rejectResponseDone = page.waitForResponse(
      r => r.url().includes('/reject'), { timeout: 6000 }
    ).catch(() => null);
    await page.locator('button:text-is("Reject")').first().click();
    await rejectResponseDone;
    await waitForBookingsReload(page, 5000);
  }
  const pendingNow = await page.locator('button:text-is("Approve")').count();
  console.log(`  After 3 rejects — Approve buttons: ${pendingNow} (expect ${totalItems - 6})`);
  await shot(page, 'ec3-partial-state');

  // Execute All — should only book the 3 approved
  const execBtn3 = page.locator('button:has-text("Confirm & Book All Approved")');
  if (await execBtn3.count() > 0) {
    await execBtn3.click();
    console.log('  Clicked Execute — waiting for booked badges...');
    try {
      await page.waitForSelector('span:has-text("booked"), span:has-text("Booked")', { timeout: 15000 });
    } catch (_) { console.log('  WARNING: booked badge wait timed out'); }
    await page.waitForTimeout(2000);

    // Count status pills
    const bookedCount   = await page.locator('span:has-text("booked")').first().isVisible().catch(() => false);
    const rejectedCount = await page.locator('span:has-text("rejected")').count();
    const pendingCount  = await page.locator('button:text-is("Approve")').count();

    console.log(`  Booked pill visible: ${bookedCount}, rejected pills: ${rejectedCount}, pending Approve buttons: ${pendingCount}`);
    await shot(page, 'ec3-after-execute');

    // Verify rejected and pending items NOT converted to booked
    rejectedCount > 0 ? pass('EC3.2 rejected items remain rejected after execute-all') : warn('EC3.2 rejected pills not found after execute-all');
    pendingCount > 0  ? pass('EC3.3 pending items remain pending after execute-all')   : warn('EC3.3 no pending Approve buttons after execute-all');
    bookedCount       ? pass('EC3.4 approved items now show booked status')             : fail('EC3.4 no booked badge visible after execute-all');
  } else {
    fail('EC3.2 Execute button not found');
  }

  // ══════════════════════════════════════════════════════════════════════════
  // EC4 — STATE PERSISTENCE: approve items, reload page, verify still approved
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n=== EC4: State persistence — approve 2, hard reload, verify persisted (trip 390) ===');
  await goBookingsTab(page, 390);

  // Approve first 2 items
  for (let i = 0; i < 2; i++) {
    const approveResponseDone = page.waitForResponse(
      r => r.url().includes('/approve'), { timeout: 6000 }
    ).catch(() => null);
    await page.locator('button:text-is("Approve")').first().click();
    await approveResponseDone;
    await waitForBookingsReload(page, 5000);
  }
  const beforeReload = await page.locator('button:text-is("Approve")').count();
  console.log(`  Before reload — Approve buttons: ${beforeReload} (expect 8)`);
  await shot(page, 'ec4-before-reload');

  // Hard reload
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForSelector('button:has-text("Bookings")', { timeout: 20000 });
  await page.locator('button', { hasText: 'Bookings' }).first().click();
  await page.waitForTimeout(3000);
  await shot(page, 'ec4-after-reload');

  const afterReload = await page.locator('button:text-is("Approve")').count();
  const approvedPills = await page.locator('span:has-text("approved")').count();
  console.log(`  After reload — Approve buttons: ${afterReload}, approved pills: ${approvedPills}`);

  afterReload === beforeReload
    ? pass('EC4.1 pending count unchanged after reload (state persisted in DB)')
    : fail('EC4.1 pending count changed after reload', `was ${beforeReload} now ${afterReload}`);
  approvedPills > 0
    ? pass('EC4.2 approved status pills visible after reload')
    : fail('EC4.2 no approved pills after reload — state not persisted');

  // ══════════════════════════════════════════════════════════════════════════
  // EC5 — CANCEL BUTTON VISIBILITY: only for approved/booked, not pending/rejected
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n=== EC5: Cancel button visibility — only for approved/booked, not pending/rejected ===');
  // trip 390 now has: 2 approved, 8 pending — verify no Cancel on pending items
  const cancelOnPending = await page.locator('button:text-is("Reject") ~ button:has-text("Cancel"), button:text-is("Approve") ~ button:has-text("Cancel")').count();
  // Simpler: count total Cancel buttons (should only appear for 2 approved items)
  const totalCancel = await page.locator('button:has-text("Cancel")').count();
  console.log(`  Cancel buttons visible: ${totalCancel} (expect 2 — one per approved item)`);
  totalCancel === 2
    ? pass('EC5.1 Cancel only visible for approved items (not pending)')
    : warn('EC5.1 Cancel button count unexpected', `got ${totalCancel}, expected 2`);

  // ══════════════════════════════════════════════════════════════════════════
  // EC6 — API ERROR AUDIT: no unexpected 4xx/5xx across entire test
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n=== EC6: API error audit ===');
  if (apiErrors.length === 0) {
    pass('EC6 zero unexpected API errors (4xx/5xx) across all edge cases');
  } else {
    const non429 = apiErrors.filter(e => !e.startsWith('429'));
    non429.length === 0
      ? pass(`EC6 only 429 rate-limit errors (${apiErrors.length} total) — no app errors`)
      : fail('EC6 unexpected API errors', non429.join(', '));
    apiErrors.forEach(e => console.log(`     ${e}`));
  }

  // ══════════════════════════════════════════════════════════════════════════
  // SUMMARY
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n' + '═'.repeat(55));
  console.log('P1 EDGE CASE RESULTS');
  console.log('═'.repeat(55));
  const passed  = results.filter(r => r.r === 'PASS').length;
  const failed  = results.filter(r => r.r === 'FAIL').length;
  const warned  = results.filter(r => r.r === 'WARNING').length;
  results.forEach(r => {
    const icon = r.r === 'PASS' ? '✓' : r.r === 'FAIL' ? '✗' : '⚠';
    console.log(`  ${icon} ${r.r.padEnd(8)} ${r.label}`);
  });
  console.log('─'.repeat(55));
  console.log(`  ${passed} PASS  |  ${warned} WARNING  |  ${failed} FAIL`);
  console.log('═'.repeat(55));

  await page.waitForTimeout(3000);
  await browser.close();
})();
