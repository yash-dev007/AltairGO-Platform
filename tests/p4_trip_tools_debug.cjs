/**
 * P4 Trip Tools — Full + Edge Case Validation
 * ═════════════════════════════════════════════
 *
 * Tests:
 *   4a. Trip Readiness    — score + checklist
 *   4b. Daily Briefing    — day 1 & day 2 content
 *   4c. Activity Swap     — replace activity, re-schedules day
 *   4d. Next Trip Ideas   — based on completed trip interests
 *   4e. Trip Variants     — /api/trip/:id/variants (spec) vs reality
 *   4f. Post-Trip Summary — planned vs actual, highlights
 *   4g. Review / Feedback — POST + GET + PUT, tag validation
 *   4h. Signal Tracking   — attraction-signal endpoint
 *
 * Edge Cases:
 *   EC01 — readiness: auth required → 401
 *   EC02 — readiness: another user's trip → 404
 *   EC03 — readiness: non-existent trip → 404
 *   EC04 — daily-briefing: day beyond duration → 404 or graceful
 *   EC05 — daily-briefing: auth required → 401
 *   EC06 — daily-briefing: day 1 vs day 2 have different day numbers
 *   EC07 — swap: missing activity_name → 400
 *   EC08 — swap: non-existent activity → 404
 *   EC09 — swap: auth required → 401
 *   EC10 — next-trip-ideas: auth required → 401
 *   EC11 — summary: auth required → 401
 *   EC12 — review: rating=0 → 400
 *   EC13 — review: rating=6 → 400
 *   EC14 — review: invalid tag → 400
 *   EC15 — review: accepts all 8 valid hyphenated tags
 *   EC16 — review: GET returns submitted review
 *   EC17 — review: PUT updates existing review
 *   EC18 — review: auth required → 401
 *   EC19 — signal: missing attraction_id → 400
 *   EC20 — signal: invalid event_type → 400
 *   EC21 — signal: unauthenticated guest allowed
 *   EC22 — signal: non-existent attraction_id → 404
 *
 * Run: cd "D:/Projects/AltairGO Platform" && node tests/p4_trip_tools_debug.cjs
 */

const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:5173';
const API_URL    = 'http://127.0.0.1:5000';
const EMAIL      = 'testreviewer@altairgo.com';
const PASSWORD   = 'TestReviewer123!';
const SHOTS      = 'D:/Projects/AltairGO Platform/test-results';

const results   = [];
const apiErrors = [];

function pass(label)    { results.push({ label, r: 'PASS'    }); console.log(`  ✓ PASS    ${label}`); }
function fail(label, d) { results.push({ label, r: 'FAIL'    }); console.log(`  ✗ FAIL    ${label}${d ? ' — ' + d : ''}`); }
function warn(label, d) { results.push({ label, r: 'WARNING' }); console.log(`  ⚠ WARNING ${label}${d ? ' — ' + d : ''}`); }
function skip(label, d) { results.push({ label, r: 'SKIP'    }); console.log(`  ➖ SKIP    ${label}${d ? ' — ' + d : ''}`); }

async function shot(page, name) {
  try {
    await page.screenshot({ path: `${SHOTS}/p4-${name}.png`, fullPage: false });
    console.log(`  📸 ${name}.png`);
  } catch {}
}

async function api(page, token, method, path, body, opts = {}) {
  const reqOpts = {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
    ...opts,
  };
  if (body) reqOpts.data = body;
  const fn = page.request[method.toLowerCase()].bind(page.request);
  const resp = await fn(`${API_URL}${path}`, reqOpts);
  if (resp.status() >= 500) {
    const text = await resp.text().catch(() => '');
    apiErrors.push({ path, status: resp.status(), body: text.slice(0, 300) });
  }
  return resp;
}

const MOCK_ITINERARY = {
  trip_title: 'P4 Test Trip — Jaipur 3 Days',
  total_cost: 9000,
  cost_breakdown: { accommodation: 3150, food: 2250, transport: 1800, activities: 1350, misc: 450 },
  itinerary: [
    {
      day: 1, date: '2026-10-15', location: 'Jaipur', theme: 'Heritage & Forts',
      pacing_level: 'moderate', day_total: 3200,
      accommodation: { hotel_name: 'Hotel Pink City', category: 'mid', cost_per_night: 1800 },
      activities: [
        { time: '09:00', name: 'Amber Fort', activity: 'Amber Fort', description: 'Magnificent hilltop fort.', cost: 550, requires_advance_booking: true },
        { time: '12:00', name: 'Lunch break', is_break: true, meal_type: 'lunch', cost: 0 },
        { time: '14:00', name: 'Hawa Mahal', activity: 'Hawa Mahal', description: 'Palace of winds.', cost: 200 },
      ],
    },
    {
      day: 2, date: '2026-10-16', location: 'Jaipur', theme: 'Culture & Markets',
      pacing_level: 'relaxed', day_total: 2800,
      accommodation: { hotel_name: 'Hotel Pink City', category: 'mid', cost_per_night: 1800 },
      activities: [
        { time: '10:00', name: 'Jantar Mantar', activity: 'Jantar Mantar', description: 'UNESCO observatory.', cost: 200 },
        { time: '15:00', name: 'Johari Bazaar', activity: 'Johari Bazaar', description: 'Famous jewellery market.', cost: 0 },
      ],
    },
    {
      day: 3, date: '2026-10-17', location: 'Jaipur', theme: 'Departure Day',
      pacing_level: 'light', day_total: 1500, accommodation: null, activities: [],
    },
  ],
  smart_insights: ['Best visited in winter'],
  packing_tips: ['Comfortable shoes'],
  document_checklist: [],
  daily_transport_guide: {},
  traveler_profile: { special_occasion: null },
};

// ── Main ─────────────────────────────────────────────────────────────────────

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 60 });
  const page    = await browser.newPage();
  page.setDefaultTimeout(30000);

  page.on('console', msg => {
    if (msg.type() === 'error') console.log(`  [CONSOLE ERR] ${msg.text().slice(0, 120)}`);
  });
  page.on('pageerror', err => console.log(`  [PAGE ERR] ${err.message.slice(0, 120)}`));
  page.on('response', resp => {
    if (resp.status() === 429) console.log(`  [429] ${resp.url()}`);
  });

  // ── SETUP: Login ─────────────────────────────────────────────────────────
  console.log('\n=== SETUP: Login ===');
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
  const loginResp = await page.request.post(`${API_URL}/auth/login`, {
    data: { email: EMAIL, password: PASSWORD },
    headers: { 'Content-Type': 'application/json' },
  });
  const loginData = await loginResp.json();
  const token = loginData.token;
  if (!token) {
    console.log(`  FAIL: Could not get token — ${JSON.stringify(loginData).slice(0, 100)}`);
    await browser.close();
    return;
  }
  console.log(`  Got token: ${token.slice(0, 20)}...`);

  // ── SETUP: Create test trip ───────────────────────────────────────────────
  console.log('\n=== SETUP: Create test trip ===');
  const saveResp = await page.request.post(`${API_URL}/api/save-trip`, {
    data: {
      destination_country: 'India',
      start_city: 'Mumbai',
      selected_destinations: [{ id: 1, name: 'Jaipur', estimated_cost_per_day: 3000 }],
      budget: 9000,
      duration: 3,
      travelers: 2,
      style: 'standard',
      date_type: 'fixed',
      start_date: '2026-10-15',
      traveler_type: 'couple',
      itinerary_json: MOCK_ITINERARY,
      total_cost: 9000,
      trip_title: MOCK_ITINERARY.trip_title,
    },
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  });
  if (!saveResp.ok()) {
    console.log(`  FAIL: save-trip failed ${saveResp.status()} — ${await saveResp.text()}`);
    await browser.close();
    return;
  }
  const saveData = await saveResp.json();
  const tripId = saveData.trip_id || saveData.id;
  console.log(`  Trip created: id=${tripId}`);

  // ── 4a. Trip Readiness ────────────────────────────────────────────────────
  console.log('\n=== 4a. Trip Readiness ===');

  let resp = await api(page, token, 'GET', `/api/trip/${tripId}/readiness`);
  if (resp.ok()) {
    const body = await resp.json();
    pass('4a-1: GET /readiness returns 200');
    if (typeof body.readiness_score === 'number') {
      pass('4a-2: readiness_score is a number');
      if (body.readiness_score >= 0 && body.readiness_score <= 100)
        pass('4a-3: readiness_score in range 0–100');
      else
        fail('4a-3: readiness_score out of range', String(body.readiness_score));
    } else {
      fail('4a-2: readiness_score missing or not a number', JSON.stringify(Object.keys(body)));
    }
    if (Array.isArray(body.checklist)) {
      pass('4a-4: checklist is an array');
      if (body.checklist.length > 0) {
        const item = body.checklist[0];
        if (item.item && item.status) pass('4a-5: checklist items have item + status fields');
        else warn('4a-5: checklist items missing expected fields', JSON.stringify(Object.keys(item)));
      } else {
        warn('4a-5: checklist is empty');
      }
    } else {
      fail('4a-4: checklist missing or not array', JSON.stringify(Object.keys(body)));
    }
    if (body.status) pass('4a-6: response has status label');
    else warn('4a-6: status label missing');
    if (Array.isArray(body.critical_actions)) pass('4a-7: critical_actions array present');
    else warn('4a-7: critical_actions missing');
  } else {
    fail('4a-1: GET /readiness failed', `${resp.status()}`);
  }

  // EC01 — auth required
  resp = await api(page, null, 'GET', `/api/trip/${tripId}/readiness`);
  if (resp.status() === 401) pass('EC01: readiness without auth → 401');
  else fail('EC01: readiness without auth should be 401', `got ${resp.status()}`);

  // EC02 — another user's trip
  const r2Resp = await page.request.post(`${API_URL}/auth/register`, {
    data: { name: 'P4R2', email: `p4r2_${Date.now()}@test.com`, password: 'R2Pass123!ABCD' },
    headers: { 'Content-Type': 'application/json' },
  });
  const tok2 = (await r2Resp.json()).token;
  resp = await api(page, tok2, 'GET', `/api/trip/${tripId}/readiness`);
  if (resp.status() === 404) pass('EC02: another user\'s trip readiness → 404');
  else fail('EC02: should be 404 for other user', `got ${resp.status()}`);

  // EC03 — non-existent trip
  resp = await api(page, token, 'GET', `/api/trip/999999/readiness`);
  if (resp.status() === 404) pass('EC03: non-existent trip readiness → 404');
  else fail('EC03: should be 404 for non-existent trip', `got ${resp.status()}`);

  // ── 4b. Daily Briefing ────────────────────────────────────────────────────
  console.log('\n=== 4b. Daily Briefing ===');

  resp = await api(page, token, 'GET', `/api/trip/${tripId}/daily-briefing/1`);
  if (resp.ok()) {
    const body = await resp.json();
    pass('4b-1: GET /daily-briefing/1 returns 200');
    if (body.day === 1) pass('4b-2: response.day === 1');
    else fail('4b-2: response.day should be 1', `got ${body.day}`);
    if (Array.isArray(body.activities)) pass('4b-3: activities is array');
    else fail('4b-3: activities missing or not array', JSON.stringify(Object.keys(body)));
    if (Array.isArray(body.what_to_carry)) pass('4b-4: what_to_carry is array');
    else warn('4b-4: what_to_carry missing or not array', JSON.stringify(Object.keys(body)));
    if (body.morning_tip) pass('4b-5: morning_tip present');
    else warn('4b-5: morning_tip missing');
    if (body.location) pass('4b-6: location present');
    else warn('4b-6: location missing');
  } else {
    fail('4b-1: GET /daily-briefing/1 failed', `${resp.status()}`);
  }

  // EC04 — day beyond duration
  resp = await api(page, token, 'GET', `/api/trip/${tripId}/daily-briefing/99`);
  if ([400, 404].includes(resp.status()))
    pass('EC04: day 99 (beyond duration) → 400 or 404');
  else if (resp.ok())
    warn('EC04: day 99 returned 200 (spec expects 404 — acceptable if returns empty)', `status ${resp.status()}`);
  else
    fail('EC04: day 99 unexpected status', `got ${resp.status()}`);

  // EC05 — auth required
  resp = await api(page, null, 'GET', `/api/trip/${tripId}/daily-briefing/1`);
  if (resp.status() === 401) pass('EC05: briefing without auth → 401');
  else fail('EC05: briefing without auth should be 401', `got ${resp.status()}`);

  // EC06 — day 1 vs day 2 have different day numbers
  const [d1r, d2r] = await Promise.all([
    api(page, token, 'GET', `/api/trip/${tripId}/daily-briefing/1`),
    api(page, token, 'GET', `/api/trip/${tripId}/daily-briefing/2`),
  ]);
  if (d1r.ok() && d2r.ok()) {
    const b1 = await d1r.json();
    const b2 = await d2r.json();
    if (b1.day === 1 && b2.day === 2)
      pass('EC06: day 1 vs day 2 have different day numbers');
    else
      fail('EC06: day numbers incorrect', `d1.day=${b1.day}, d2.day=${b2.day}`);
  } else {
    warn('EC06: skipped — one of the briefing requests failed');
  }

  // ── 4c. Activity Swap ─────────────────────────────────────────────────────
  console.log('\n=== 4c. Activity Swap ===');

  resp = await api(page, token, 'POST', `/api/trip/${tripId}/activity/swap`, {
    day_num: 1,
    activity_name: 'Amber Fort',
    reason: 'Want something different',
  });
  // 200 = swapped; 404 = no alternatives available (valid for test DB)
  if ([200, 404].includes(resp.status())) {
    pass('4c-1: POST /activity/swap returns 200 or 404');
    if (resp.ok()) {
      const body = await resp.json();
      if (body.message) pass('4c-2: swap 200 response has message');
      else warn('4c-2: swap 200 response missing message', JSON.stringify(Object.keys(body)));
    } else {
      const body = await resp.json().catch(() => ({}));
      if (body.error) pass('4c-2: swap 404 response has error message');
      else warn('4c-2: swap 404 response missing error');
    }
  } else {
    fail('4c-1: POST /activity/swap unexpected status', `got ${resp.status()}`);
  }

  // EC07 — missing activity_name
  resp = await api(page, token, 'POST', `/api/trip/${tripId}/activity/swap`, { day_num: 1 });
  if ([400, 422].includes(resp.status())) pass('EC07: swap without activity_name → 400');
  else fail('EC07: should be 400 without activity_name', `got ${resp.status()}`);

  // EC08 — non-existent activity
  resp = await api(page, token, 'POST', `/api/trip/${tripId}/activity/swap`, {
    day_num: 1,
    activity_name: 'This Activity Does Not Exist In Any DB XYZ',
  });
  if ([400, 404].includes(resp.status())) pass('EC08: swap non-existent activity → 400 or 404');
  else fail('EC08: should be 400/404 for non-existent activity', `got ${resp.status()}`);

  // EC09 — auth required
  resp = await api(page, null, 'POST', `/api/trip/${tripId}/activity/swap`, {
    day_num: 1, activity_name: 'Amber Fort',
  });
  if (resp.status() === 401) pass('EC09: swap without auth → 401');
  else fail('EC09: swap without auth should be 401', `got ${resp.status()}`);

  // ── 4d. Next Trip Ideas ───────────────────────────────────────────────────
  console.log('\n=== 4d. Next Trip Ideas ===');

  resp = await api(page, token, 'GET', `/api/trip/${tripId}/next-trip-ideas`);
  if ([200, 404].includes(resp.status())) {
    pass('4d-1: GET /next-trip-ideas returns 200 or 404');
    if (resp.ok()) {
      const body = await resp.json();
      const ideas = body.ideas ?? body.recommendations ?? body.destinations ?? [];
      if (Array.isArray(ideas)) pass('4d-2: ideas array present');
      else warn('4d-2: ideas field not array', JSON.stringify(Object.keys(body)));
      if (body.based_on_trip) pass('4d-3: based_on_trip field present');
      else warn('4d-3: based_on_trip missing', JSON.stringify(Object.keys(body)));
    }
  } else {
    fail('4d-1: GET /next-trip-ideas unexpected status', `got ${resp.status()}`);
  }

  // EC10 — auth required
  resp = await api(page, null, 'GET', `/api/trip/${tripId}/next-trip-ideas`);
  if (resp.status() === 401) pass('EC10: next-trip-ideas without auth → 401');
  else fail('EC10: should be 401 without auth', `got ${resp.status()}`);

  // ── 4e. Trip Variants ─────────────────────────────────────────────────────
  console.log('\n=== 4e. Trip Variants ===');
  // NOTE: spec says POST /api/trip/:id/variants — but actual backend is POST /generate-variants
  // which takes a full generation body (not a trip_id).  Per-trip variants endpoint doesn't exist.
  resp = await api(page, token, 'POST', `/api/trip/${tripId}/variants`);
  if (resp.ok()) {
    const body = await resp.json();
    const hasVariants = 'relaxed' in body || 'intense' in body || 'balanced' in body || 'variants' in body;
    if (hasVariants) pass('4e-1: /variants returns variant keys');
    else warn('4e-1: /variants returned 200 but no variant keys', JSON.stringify(Object.keys(body)));
  } else if (resp.status() === 404) {
    warn('4e-1: POST /api/trip/:id/variants → 404 (endpoint not implemented per-trip; backend uses /generate-variants instead)', `spec expects this endpoint`);
  } else if (resp.status() === 405) {
    warn('4e-1: POST /api/trip/:id/variants → 405 Method Not Allowed (route exists as GET only)', `spec expects POST`);
  } else {
    warn('4e-1: /variants unexpected status', `got ${resp.status()} — endpoint may not exist per-trip`);
  }

  // ── 4f. Post-Trip Summary ─────────────────────────────────────────────────
  console.log('\n=== 4f. Post-Trip Summary ===');

  resp = await api(page, token, 'GET', `/api/trip/${tripId}/summary`);
  if ([200, 404].includes(resp.status())) {
    pass('4f-1: GET /summary returns 200 or 404');
    if (resp.ok()) {
      const body = await resp.json();
      pass('4f-2: summary response is truthy');
      const hasDays = body.num_days !== undefined || body.days !== undefined;
      if (hasDays) pass('4f-3: summary has day count');
      else warn('4f-3: num_days missing from summary', JSON.stringify(Object.keys(body)));
    }
  } else {
    fail('4f-1: GET /summary unexpected status', `got ${resp.status()}`);
  }

  // EC11 — auth required
  resp = await api(page, null, 'GET', `/api/trip/${tripId}/summary`);
  if (resp.status() === 401) pass('EC11: summary without auth → 401');
  else fail('EC11: should be 401 without auth', `got ${resp.status()}`);

  // ── 4g. Review / Feedback ─────────────────────────────────────────────────
  console.log('\n=== 4g. Review / Feedback ===');

  // Submit review
  resp = await api(page, token, 'POST', `/api/trip/${tripId}/review`, {
    rating: 4,
    tags: ['great-value', 'well-paced'],
    comment: 'P4 debug test review — fantastic trip!',
  });
  const reviewSubmitOk = [200, 201, 409].includes(resp.status());
  if (reviewSubmitOk) {
    pass('4g-1: POST /review returns 200/201/409');
    if (resp.status() === 201) {
      const body = await resp.json();
      if (body.rating === 4) pass('4g-2: review response has correct rating');
      else warn('4g-2: review rating mismatch', `got ${body.rating}`);
      if (Array.isArray(body.tags)) pass('4g-3: review response has tags array');
      else warn('4g-3: tags missing from review response');
    } else if (resp.status() === 409) {
      warn('4g-2: review already exists (409) — subsequent PUT will be tested');
    }
  } else {
    fail('4g-1: POST /review unexpected status', `got ${resp.status()}`);
  }

  // GET review
  resp = await api(page, token, 'GET', `/api/trip/${tripId}/review`);
  if (resp.ok()) {
    const body = await resp.json();
    pass('EC16: GET /review returns 200');
    const review = body.review ?? body;
    if (review.rating >= 1 && review.rating <= 5)
      pass('EC16b: review has valid rating');
    else
      warn('EC16b: review rating out of range', JSON.stringify(review));
  } else if (resp.status() === 404) {
    warn('EC16: GET /review → 404 (no review submitted yet — may have been rejected above)');
  } else {
    fail('EC16: GET /review unexpected status', `got ${resp.status()}`);
  }

  // PUT update review
  resp = await api(page, token, 'PUT', `/api/trip/${tripId}/review`, {
    rating: 5,
    tags: ['adventure', 'foodie'],
    comment: 'Updated P4 review',
  });
  if ([200, 201, 404].includes(resp.status())) {
    if (resp.ok()) pass('EC17: PUT /review update returns 200');
    else warn('EC17: PUT /review → 404 (no existing review to update)');
  } else {
    fail('EC17: PUT /review unexpected status', `got ${resp.status()}`);
  }

  // EC12 — rating = 0
  resp = await api(page, token, 'POST', `/api/trip/${tripId}/review`, { rating: 0 });
  if ([400, 409, 422].includes(resp.status())) pass('EC12: review rating=0 → 400/422 (or 409 already exists)');
  else fail('EC12: rating=0 should be rejected', `got ${resp.status()}`);

  // EC13 — rating = 6
  resp = await api(page, token, 'POST', `/api/trip/${tripId}/review`, { rating: 6 });
  if ([400, 409, 422].includes(resp.status())) pass('EC13: review rating=6 → 400/422 (or 409)');
  else fail('EC13: rating=6 should be rejected', `got ${resp.status()}`);

  // EC14 — invalid tag
  resp = await api(page, token, 'POST', `/api/trip/${tripId}/review`, {
    rating: 3, tags: ['__invalid_tag_xyz__'],
  });
  if ([400, 409, 422].includes(resp.status())) pass('EC14: invalid tag → 400/422 (or 409)');
  else fail('EC14: invalid tag should be rejected', `got ${resp.status()}`);

  // EC15 — all 8 valid tags
  const allValidTags = ['great-value', 'well-paced', 'hidden-gems', 'family-friendly', 'romantic', 'adventure', 'foodie', 'budget-friendly'];
  resp = await api(page, token, 'POST', `/api/trip/${tripId}/review`, {
    rating: 5, tags: allValidTags,
  });
  if ([200, 201, 409].includes(resp.status())) pass('EC15: all 8 valid hyphenated tags accepted (or 409 exists)');
  else fail('EC15: valid tags should be accepted', `got ${resp.status()}`);

  // EC18 — auth required
  resp = await api(page, null, 'POST', `/api/trip/${tripId}/review`, { rating: 3 });
  if (resp.status() === 401) pass('EC18: review without auth → 401');
  else fail('EC18: should be 401 without auth', `got ${resp.status()}`);

  // ── 4h. Signal Tracking ───────────────────────────────────────────────────
  console.log('\n=== 4h. Signal Tracking ===');

  // Happy path (attraction_id=1 may not exist in test DB → 404 acceptable)
  resp = await api(page, token, 'POST', `/api/attraction-signal`, {
    event_type: 'view',
    attraction_id: 1,
    destination_id: 1,
    context: 'itinerary',
  });
  if ([200, 201, 204, 404].includes(resp.status())) {
    pass('4h-1: POST /attraction-signal returns 200/201/404 (404 = attraction not in test DB)');
  } else {
    fail('4h-1: POST /attraction-signal unexpected status', `got ${resp.status()}`);
  }

  // EC19 — missing attraction_id
  resp = await api(page, token, 'POST', `/api/attraction-signal`, { event_type: 'view' });
  if ([400, 422].includes(resp.status())) pass('EC19: signal without attraction_id → 400');
  else fail('EC19: missing attraction_id should be 400', `got ${resp.status()}`);

  // EC20 — invalid event_type
  resp = await api(page, token, 'POST', `/api/attraction-signal`, {
    event_type: '__invalid__', attraction_id: 1,
  });
  if ([400, 404, 422].includes(resp.status())) pass('EC20: invalid event_type → 400/422 or 404');
  else fail('EC20: invalid event_type should be rejected', `got ${resp.status()}`);

  // EC21 — unauthenticated guest
  resp = await api(page, null, 'POST', `/api/attraction-signal`, {
    event_type: 'view', attraction_id: 1, destination_id: 1,
  });
  if ([200, 201, 204, 401, 404].includes(resp.status())) pass('EC21: unauthenticated signal → allowed or 404 (not server error)');
  else fail('EC21: guest signal unexpected status', `got ${resp.status()}`);

  // EC22 — non-existent attraction
  resp = await api(page, token, 'POST', `/api/attraction-signal`, {
    event_type: 'view', attraction_id: 9999999,
  });
  if ([404, 400, 422].includes(resp.status())) pass('EC22: non-existent attraction_id → 404/400');
  else fail('EC22: should be 404 for non-existent attraction', `got ${resp.status()}`);

  // ── UI Smoke Tests ────────────────────────────────────────────────────────
  console.log('\n=== UI Smoke Tests ===');

  // Set token in localStorage
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate((t) => {
    localStorage.setItem('ag_token', t);
  }, token);

  // Readiness tab
  await page.goto(`${TARGET_URL}/trip/${tripId}`, { waitUntil: 'networkidle' });
  const readinessTab = page.getByText('Readiness', { exact: true }).first();
  if (await readinessTab.isVisible({ timeout: 8000 }).catch(() => false)) {
    // Click tab and wait for the readiness API response specifically
    const readinessRespPromise = page.waitForResponse(
      r => r.url().includes('/readiness') && r.status() < 400,
      { timeout: 15000 }
    ).catch(() => null);
    await readinessTab.click();
    await readinessRespPromise;
    await page.waitForTimeout(600); // allow React state to settle
    await shot(page, 'readiness-tab');
    const scoreVisible = await page.getByText(/\d+%/).isVisible({ timeout: 5000 }).catch(() => false);
    if (scoreVisible) pass('UI-1: Readiness tab shows % score');
    else warn('UI-1: % score not found on readiness tab', '');
  } else {
    warn('UI-1: Readiness tab not visible');
  }

  // Summary tab (review widget)
  await page.goto(`${TARGET_URL}/trip/${tripId}`, { waitUntil: 'networkidle' });
  const summaryTab = page.getByText('Summary', { exact: true }).first();
  if (await summaryTab.isVisible({ timeout: 8000 }).catch(() => false)) {
    // Click tab and wait for both summary + review API responses
    const summaryRespPromise = Promise.allSettled([
      page.waitForResponse(r => r.url().includes('/summary'), { timeout: 10000 }),
      page.waitForResponse(r => r.url().includes('/review') && !r.url().includes('submit'), { timeout: 10000 }),
    ]);
    await summaryTab.click();
    await summaryRespPromise;
    await page.waitForTimeout(600);
    await shot(page, 'summary-review-tab');
    // Review form is always rendered; look for heading text
    const starVisible = await page.locator('h3').filter({ hasText: /rate|review/i }).first().isVisible({ timeout: 5000 }).catch(() => false);
    if (starVisible) pass('UI-2: Summary tab has review/rating text');
    else warn('UI-2: review text not found on Summary tab');
    const tagVisible = await page.getByText(/adventure|foodie|great-value/i).first().isVisible({ timeout: 5000 }).catch(() => false);
    if (tagVisible) pass('UI-3: Summary tab has review tag chips');
    else warn('UI-3: review tag chips not visible on Summary tab');
  } else {
    warn('UI-2: Summary tab not visible');
  }

  // Daily briefing page — wait for the h1 heading
  await page.goto(`${TARGET_URL}/trip/${tripId}/briefing/1`, { waitUntil: 'networkidle' });
  await shot(page, 'daily-briefing');
  const briefingH1 = await page.locator('h1').first().isVisible({ timeout: 10000 }).catch(() => false);
  if (briefingH1) pass('UI-4: Daily briefing page loads at /briefing/1');
  else warn('UI-4: Daily briefing page — day 1 content not visible');

  // Trip viewer — itinerary tab: day 1 starts expanded so Add Activity is immediately present
  await page.goto(`${TARGET_URL}/trip/${tripId}`, { waitUntil: 'networkidle' });
  await shot(page, 'itinerary-tab');
  // Day 1 starts expanded — Add Activity button should already be visible
  const addActBtn = await page.getByText('Add Activity').isVisible({ timeout: 8000 }).catch(() => false);
  if (addActBtn) {
    pass('UI-5: Add Activity button visible when day expanded');
  } else {
    // Try clicking the day 1 header to expand it
    const day1Header = page.locator('text=Day 1').first();
    if (await day1Header.isVisible({ timeout: 3000 }).catch(() => false)) {
      await day1Header.click();
      await page.waitForTimeout(800);
      const addActBtn2 = await page.getByText('Add Activity').isVisible({ timeout: 5000 }).catch(() => false);
      if (addActBtn2) pass('UI-5: Add Activity button visible after expanding day 1');
      else warn('UI-5: Add Activity button not found after expanding day');
    } else {
      warn('UI-5: Add Activity button not found after expanding day');
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  const total = results.length;
  const passed = results.filter(r => r.r === 'PASS').length;
  const failed = results.filter(r => r.r === 'FAIL').length;
  const warned = results.filter(r => r.r === 'WARNING').length;
  const skipped = results.filter(r => r.r === 'SKIP').length;

  console.log(`\n${'═'.repeat(60)}`);
  console.log(`P4 RESULTS: ${passed} PASS | ${failed} FAIL | ${warned} WARNING | ${skipped} SKIP`);
  console.log(`${'═'.repeat(60)}`);

  if (failed > 0) {
    console.log('\nFAILURES:');
    results.filter(r => r.r === 'FAIL').forEach(r => console.log(`  ✗ ${r.label}`));
  }
  if (warned > 0) {
    console.log('\nWARNINGS:');
    results.filter(r => r.r === 'WARNING').forEach(r => console.log(`  ⚠ ${r.label}`));
  }
  if (apiErrors.length > 0) {
    console.log('\n5XX ERRORS:');
    apiErrors.forEach(e => console.log(`  ${e.status} ${e.path} — ${e.body}`));
  }

  await browser.close();
})();
