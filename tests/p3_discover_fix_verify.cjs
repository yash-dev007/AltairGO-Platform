/**
 * P3 Discover — Fix Verification (budget=0 guard)
 * Opens the browser, navigates to /discover, then verifies the fix + edge cases.
 *
 * Run: node tests/p3_discover_fix_verify.cjs
 */
const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:5173';
const API_URL    = 'http://127.0.0.1:5000';
const EMAIL      = 'testreviewer@altairgo.com';
const PASSWORD   = 'TestReviewer123!';
const SHOTS      = 'D:/Projects/AltairGO Platform/test-results';
const RECOMMEND_TIMEOUT = 120000;

const results = [];
function pass(label)    { results.push({ label, r: 'PASS'    }); console.log(`  ✓ PASS    ${label}`); }
function fail(label, d) { results.push({ label, r: 'FAIL'    }); console.log(`  ✗ FAIL    ${label}${d ? ' — ' + d : ''}`); }
function warn(label, d) { results.push({ label, r: 'WARNING' }); console.log(`  ⚠ WARNING ${label}${d ? ' — ' + d : ''}`); }

async function shot(page, name) {
  await page.screenshot({ path: `${SHOTS}/p3-fix-${name}.png`, fullPage: false });
  console.log(`  📸 p3-fix-${name}.png`);
}

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 80 });
  const page    = await browser.newPage();
  page.setDefaultTimeout(30000);

  page.on('console', msg => {
    if (msg.type() === 'error') console.log(`  [CONSOLE ERR] ${msg.text().slice(0, 120)}`);
  });
  page.on('pageerror', err => console.log(`  [PAGE ERR] ${err.message.slice(0, 120)}`));

  // ── SETUP: Login + navigate to Discover in browser ────────────────────────
  console.log('\n=== SETUP: Login + Open Discover page in browser ===');
  const loginResp = await page.request.post(`${API_URL}/auth/login`, {
    data: { email: EMAIL, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  });
  const loginData = await loginResp.json();
  const token = loginData.token;
  if (!token) {
    console.log(`  FAIL: No token — ${JSON.stringify(loginData).slice(0, 80)}`);
    await browser.close();
    return;
  }
  console.log(`  Got token: ${token.slice(0, 20)}...`);

  // Inject token and navigate to Discover page in browser
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate((t) => { localStorage.setItem('ag_token', t); }, token);
  await page.goto(`${TARGET_URL}/discover`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2500);
  await shot(page, '00-discover-open');
  console.log(`  Browser now at: ${page.url()}`);

  // Verify Discover page is live
  const cards = page.locator('[class*="card"], [class*="destination"], article');
  const cardCount = await cards.count();
  if (cardCount > 0) {
    pass(`Browser: Discover page visible with ${cardCount} destination cards`);
  } else {
    warn('Browser: Discover page loaded but no cards found (check selector)');
  }

  // Get a real dest ID for testing
  const destsResp = await page.request.get(`${API_URL}/destinations`,
    { headers: { 'Authorization': `Bearer ${token}` } });
  const destsData = await destsResp.json();
  const dests = destsData.destinations ?? destsData.items ?? destsData;
  const destId = Array.isArray(dests) && dests.length > 0 ? dests[0].id : 1;
  console.log(`  Using dest ID: ${destId}`);

  // ── FIX VERIFICATION: budget=0 now returns 400 ────────────────────────────
  console.log('\n=== FIX: budget=0 guard ===');

  // budget=0 → must now return 400
  let resp = await page.request.get(
    `${API_URL}/api/discover/recommend?budget=0&duration=3&travelers=1`,
    { headers: { 'Authorization': `Bearer ${token}` }, timeout: RECOMMEND_TIMEOUT }
  );
  if (resp.status() === 400) {
    const body = await resp.json();
    pass(`FIX-1: budget=0 returns 400 — "${body.error}"`);
  } else {
    fail('FIX-1: budget=0 should return 400', `got ${resp.status()}`);
  }

  // budget=-100 → must also return 400
  resp = await page.request.get(
    `${API_URL}/api/discover/recommend?budget=-100&duration=3&travelers=1`,
    { headers: { 'Authorization': `Bearer ${token}` }, timeout: RECOMMEND_TIMEOUT }
  );
  if (resp.status() === 400) {
    pass('FIX-2: budget=-100 returns 400');
  } else {
    fail('FIX-2: budget=-100 should return 400', `got ${resp.status()}`);
  }

  // budget=1 (minimum valid) → must return 200
  resp = await page.request.get(
    `${API_URL}/api/discover/recommend?budget=1&duration=3&travelers=1`,
    { headers: { 'Authorization': `Bearer ${token}` }, timeout: RECOMMEND_TIMEOUT }
  );
  if (resp.ok()) {
    pass('FIX-3: budget=1 (minimum valid) returns 200');
  } else {
    fail('FIX-3: budget=1 should return 200', `got ${resp.status()}`);
  }

  // budget omitted entirely → still returns 200 (budget is optional)
  resp = await page.request.get(
    `${API_URL}/api/discover/recommend?duration=3&travelers=1`,
    { headers: { 'Authorization': `Bearer ${token}` }, timeout: RECOMMEND_TIMEOUT }
  );
  if (resp.ok()) {
    pass('FIX-4: budget omitted (optional) → 200 — no regression');
  } else {
    fail('FIX-4: budget omitted should still return 200', `got ${resp.status()}`);
  }

  // budget=string ("abc") → Flask type=float parses as None → 200 (no budget filter applied)
  resp = await page.request.get(
    `${API_URL}/api/discover/recommend?budget=abc&duration=3&travelers=1`,
    { headers: { 'Authorization': `Bearer ${token}` }, timeout: RECOMMEND_TIMEOUT }
  );
  const budgetStringStatus = resp.status();
  if (budgetStringStatus === 200) {
    pass('FIX-5: budget=abc (non-numeric) → Flask parses as None → 200 (graceful)');
  } else if (budgetStringStatus === 400) {
    pass('FIX-5: budget=abc returns 400 (strict validation)');
  } else {
    warn('FIX-5: budget=abc unexpected status', `${budgetStringStatus}`);
  }

  await shot(page, '01-after-api-checks');

  // ── SMOKE: Confirm other recommend paths still work ───────────────────────
  console.log('\n=== SMOKE: Core recommend still works after fix ===');

  resp = await page.request.get(
    `${API_URL}/api/discover/recommend?budget=15000&duration=3&travelers=2&traveler_type=couple&travel_month=oct`,
    { headers: { 'Authorization': `Bearer ${token}` }, timeout: RECOMMEND_TIMEOUT }
  );
  if (resp.ok()) {
    const body = await resp.json();
    const count = body.recommendations?.length ?? 0;
    pass(`SMOKE-1: Recommend with valid budget → 200, ${count} results`);
  } else {
    fail('SMOKE-1: Recommend with valid budget failed', `${resp.status()}`);
  }

  // ── UI: Scroll through Discover page in browser ───────────────────────────
  console.log('\n=== UI: Discover page scroll + screenshot ===');
  await page.goto(`${TARGET_URL}/discover`, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(1000);
  await shot(page, '02-discover-scrolled');
  pass('UI: Discover page scrolled and screenshotted');

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(55));
  console.log('P3 FIX VERIFY — SUMMARY');
  console.log('═'.repeat(55));
  const totals = results.reduce((acc, r) => { acc[r.r] = (acc[r.r] || 0) + 1; return acc; }, {});
  console.log(`  PASS:    ${totals.PASS || 0}`);
  console.log(`  FAIL:    ${totals.FAIL || 0}`);
  console.log(`  WARNING: ${totals.WARNING || 0}`);
  if ((totals.FAIL || 0) > 0) {
    console.log('\nFAILED:');
    results.filter(r => r.r === 'FAIL').forEach(r => console.log(`  ✗ ${r.label}`));
  }
  console.log('═'.repeat(55));

  await browser.close();
})();
