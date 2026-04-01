/**
 * P2 Trip Editor — Full + Edge Case Validation
 *
 * Tests (UI where possible, API-layer for features with no UI):
 *   2a. Hotel Swap   — custom hotel via API → reload → verify displayed
 *   2b. Add/Remove Activity — via API → reload → verify itinerary updated
 *   2c. Edit Activity — cost change via API → reload → verify new cost shown + is_customized
 *   2d. Notes        — via UI: type → save → reload → verify persistence
 *
 * Edge Cases:
 *   EC1 — Custom hotel: blank name rejected (400)
 *   EC2 — Add activity: missing name rejected (400)
 *   EC3 — Remove activity: wrong name returns 404
 *   EC4 — Edit activity: non-existent activity returns 404
 *   EC5 — Notes: empty note body rejected (400)
 *   EC6 — Notes: onBlur auto-save
 *   EC7 — is_customized flag set after any edit
 *   EC8 — Hotel swap from DB (hotel_id form)
 *   EC9 — Zero unexpected API errors
 *
 * Pre-req: Trip 388 (Jaipur 3-day, clean/uncustomized) has valid itinerary_json
 *
 * Run: node tests/p2_trip_editor.cjs
 */
const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:5173';
const API_URL    = 'http://127.0.0.1:5000';
const EMAIL      = 'testreviewer@altairgo.com';
const PASSWORD   = 'TestReviewer123!';
const SHOTS      = 'D:/Projects/AltairGO Platform/test-results';
const TRIP_ID    = 388;

const results  = [];
const apiErrors = [];

function pass(label)    { results.push({ label, r: 'PASS'    }); console.log(`  ✓ PASS    ${label}`); }
function fail(label, d) { results.push({ label, r: 'FAIL'    }); console.log(`  ✗ FAIL    ${label}${d ? ' — ' + d : ''}`); }
function warn(label, d) { results.push({ label, r: 'WARNING' }); console.log(`  ⚠ WARNING ${label}${d ? ' — ' + d : ''}`); }

async function shot(page, name) {
  await page.screenshot({ path: `${SHOTS}/p2-${name}.png`, fullPage: false });
  console.log(`  📸 ${name}.png`);
}

async function apiCall(page, token, method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
  };
  if (body) opts.data = body;
  return page.request[method.toLowerCase()](
    `${API_URL}${path}`, opts
  );
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

async function getTrip(page, token) {
  const r = await page.request.get(`${API_URL}/get-trip/${TRIP_ID}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return r.json();
}

async function goItineraryTab(page) {
  await page.goto(`${TARGET_URL}/trip/${TRIP_ID}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('button:has-text("Itinerary")', { timeout: 20000 });
  // Itinerary is the default tab, but click explicitly
  const itineraryBtn = page.locator('button', { hasText: 'Itinerary' }).first();
  if (await itineraryBtn.count() > 0) await itineraryBtn.click();
  await page.waitForTimeout(1500);
}

async function goNotesTab(page) {
  await page.goto(`${TARGET_URL}/trip/${TRIP_ID}`, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('button:has-text("Notes")', { timeout: 20000 });
  await page.locator('button', { hasText: 'Notes' }).first().click();
  await page.waitForTimeout(1500);
}

// ─────────────────────────────────────────────────────────────────────────────
(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 80 });
  const page    = await browser.newPage();
  page.setDefaultTimeout(25000);

  page.on('response', resp => {
    const status = resp.status();
    const url    = resp.url();
    if (url.includes('127.0.0.1:5000') && status >= 400 && status !== 400) {
      // 400 expected for edge case validation, only track 401/403/404/5xx that aren't expected
      apiErrors.push(`${status} ${url}`);
    }
  });

  // ── SETUP ─────────────────────────────────────────────────────────────────
  console.log('\n=== SETUP: inject token ===');
  const token = await injectToken(page);

  // Reset trip notes to empty before test
  await page.request.put(`${API_URL}/api/trip/${TRIP_ID}/notes`, {
    data: { trip: '' },
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  });
  console.log(`  Using trip ${TRIP_ID} (Jaipur 3-day)`);

  // ══════════════════════════════════════════════════════════════════════════
  // 2a. HOTEL SWAP — Custom hotel via API, verify UI reflects it
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n=== 2a. Hotel Swap ===');

  // Get initial hotel name
  const tripBefore = await getTrip(page, token);
  const daysBefore = (tripBefore.itinerary_json?.itinerary || []);
  const hotelBefore = daysBefore[0]?.accommodation?.hotel_name || 'unknown';
  console.log(`  Current hotel: "${hotelBefore}"`);

  // 2a-1: Custom hotel swap (Form B)
  const customResp = await page.request.put(`${API_URL}/api/trip/${TRIP_ID}/hotel`, {
    data: { custom_hotel_name: 'Haveli Dharampura', cost_per_night: 3500, category: 'luxury', notes: 'Rooftop restaurant' },
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  });
  const customData = await customResp.json();
  console.log(`  Custom hotel swap: ${customResp.status()} — ${customData.hotel_changed_to || customData.error}`);
  customResp.status() === 200
    ? pass('2a.1 custom hotel swap API returns 200')
    : fail('2a.1 custom hotel swap failed', customData.error);

  const daysAfterCustom = (await getTrip(page, token))?.itinerary_json?.itinerary || [];
  const allDaysUpdated = daysAfterCustom.every(d => d?.accommodation?.hotel_name === 'Haveli Dharampura');
  allDaysUpdated
    ? pass('2a.2 hotel updated across ALL days in itinerary JSON')
    : fail('2a.2 hotel not updated on all days', JSON.stringify(daysAfterCustom.map(d => d?.accommodation?.hotel_name)));

  // 2a-2: Verify UI shows new hotel name after reload
  await goItineraryTab(page);
  const hotelOnPage = await page.locator('text=Haveli Dharampura').count();
  await shot(page, '2a-custom-hotel');
  hotelOnPage > 0
    ? pass('2a.3 custom hotel name visible in itinerary UI after reload')
    : fail('2a.3 custom hotel name not shown in UI');

  // 2a-3: Swap from DB hotel (Form A — hotel_id)
  const dbHotelResp = await page.request.put(`${API_URL}/api/trip/${TRIP_ID}/hotel`, {
    data: { hotel_id: 3 }, // Hotel Pearl Palace (mid)
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  });
  const dbHotelData = await dbHotelResp.json();
  console.log(`  DB hotel swap (id=3): ${dbHotelResp.status()} — ${dbHotelData.hotel_changed_to || dbHotelData.error}`);
  dbHotelResp.status() === 200
    ? pass('2a.4 DB hotel_id swap returns 200')
    : fail('2a.4 DB hotel_id swap failed', dbHotelData.error);

  // Reload UI and verify
  await goItineraryTab(page);
  const dbHotelOnPage = await page.locator('text=Hotel Pearl Palace').count();
  await shot(page, '2a-db-hotel');
  dbHotelOnPage > 0
    ? pass('2a.5 DB hotel name visible in UI after reload')
    : fail('2a.5 DB hotel not shown in UI');

  // ─ EC1: blank custom_hotel_name → 400 ──────────────────────────────────
  console.log('\n  [EC1] Blank custom hotel name should return 400');
  const blankHotelResp = await page.request.put(`${API_URL}/api/trip/${TRIP_ID}/hotel`, {
    data: { custom_hotel_name: '   ' },
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  });
  console.log(`  EC1 blank hotel: ${blankHotelResp.status()}`);
  blankHotelResp.status() === 400
    ? pass('EC1 blank custom_hotel_name correctly returns 400')
    : fail('EC1 blank hotel not rejected', `got ${blankHotelResp.status()}`);

  // ─ EC8: invalid hotel_id → 404 ─────────────────────────────────────────
  console.log('\n  [EC8] Non-existent hotel_id should return 404');
  const badHotelResp = await page.request.put(`${API_URL}/api/trip/${TRIP_ID}/hotel`, {
    data: { hotel_id: 99999 },
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  });
  console.log(`  EC8 bad hotel_id: ${badHotelResp.status()}`);
  badHotelResp.status() === 404
    ? pass('EC8 invalid hotel_id correctly returns 404')
    : fail('EC8 invalid hotel_id not 404', `got ${badHotelResp.status()}`);

  // ══════════════════════════════════════════════════════════════════════════
  // 2b. ADD / REMOVE ACTIVITY — via API, verify UI reflects changes
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n=== 2b. Add / Remove Activity ===');

  // Get current Day 1 activity count
  const tripForActs = await getTrip(page, token);
  const day1Before  = tripForActs.itinerary_json?.itinerary?.[0] || {};
  const actsBefore  = (day1Before.activities || []).filter(a => !a.is_break);
  console.log(`  Day 1 non-break activities before: ${actsBefore.length}`);

  // 2b-1: Add custom activity to Day 1
  const addResp = await page.request.post(`${API_URL}/api/trip/${TRIP_ID}/day/1/activity/add`, {
    data: {
      name: 'Playwright Test Activity',
      description: 'Added by automated test',
      type: 'cultural',
      scheduled_time: '16:00',
      duration_minutes: 60,
      cost: 750,
      notes: 'Verify this appears in UI'
    },
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  });
  const addData = await addResp.json();
  console.log(`  Add activity: ${addResp.status()} — ${addData.activity_added || addData.error}`);
  addResp.status() === 200
    ? pass('2b.1 add activity API returns 200')
    : fail('2b.1 add activity failed', addData.error);

  // 2b-2: Verify added activity is in the JSON by name
  const tripAfterAdd = await getTrip(page, token);
  const actsAfterAdd = (tripAfterAdd.itinerary_json?.itinerary?.[0]?.activities || []);
  const addedInJson  = actsAfterAdd.some(a => a.name === 'Playwright Test Activity');
  console.log(`  Added activity in JSON: ${addedInJson}`);
  addedInJson
    ? pass('2b.2 added activity present in itinerary JSON by name')
    : fail('2b.2 added activity not found in itinerary JSON');

  // 2b-3: Verify UI shows new activity
  await goItineraryTab(page);
  const actOnPage = await page.locator('text=Playwright Test Activity').count();
  await shot(page, '2b-add-activity');
  actOnPage > 0
    ? pass('2b.3 new activity name visible in itinerary UI')
    : fail('2b.3 added activity not visible in UI');

  // 2b-4: Remove the activity
  const removeResp = await page.request.delete(`${API_URL}/api/trip/${TRIP_ID}/day/1/activity/remove`, {
    data: { activity_name: 'Playwright Test Activity' },
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  });
  const removeData = await removeResp.json();
  console.log(`  Remove activity: ${removeResp.status()} — ${removeData.activity_removed || removeData.error}`);
  removeResp.status() === 200
    ? pass('2b.4 remove activity API returns 200')
    : fail('2b.4 remove activity failed', removeData.error);

  // 2b-5: Verify removed activity is gone from JSON by name
  const tripAfterRemove = await getTrip(page, token);
  const actsAfterRemove = (tripAfterRemove.itinerary_json?.itinerary?.[0]?.activities || []);
  const removedFromJson = !actsAfterRemove.some(a => a.name === 'Playwright Test Activity');
  console.log(`  Removed activity gone from JSON: ${removedFromJson}`);
  removedFromJson
    ? pass('2b.5 removed activity absent from itinerary JSON')
    : fail('2b.5 removed activity still in itinerary JSON');

  // 2b-5b: Regression — check original activities not lost during reoptimize
  const originalActNames = actsBefore.map(a => a.name);
  const actsAfterRemoveNames = actsAfterRemove.filter(a => !a.is_break).map(a => a.name);
  const lostActs = originalActNames.filter(n => !actsAfterRemoveNames.includes(n));
  console.log(`  Original acts: [${originalActNames.join(', ')}], after remove: [${actsAfterRemoveNames.join(', ')}]`);
  lostActs.length === 0
    ? pass('2b.5b no original activities lost during add/remove cycle')
    : warn('2b.5b reoptimize dropped original activities', `lost: ${lostActs.join(', ')}`);

  // 2b-6: Verify UI no longer shows removed activity
  await goItineraryTab(page);
  const actGone = await page.locator('text=Playwright Test Activity').count();
  await shot(page, '2b-remove-activity');
  actGone === 0
    ? pass('2b.6 removed activity no longer visible in UI')
    : fail('2b.6 removed activity still visible in UI');

  // ─ EC2: add activity with missing name → 400 ────────────────────────────
  console.log('\n  [EC2] Add activity with missing name → 400');
  const noNameResp = await page.request.post(`${API_URL}/api/trip/${TRIP_ID}/day/1/activity/add`, {
    data: { description: 'No name provided', cost: 200 },
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  });
  console.log(`  EC2 no name: ${noNameResp.status()}`);
  noNameResp.status() === 400
    ? pass('EC2 add activity without name correctly returns 400')
    : fail('EC2 missing name not rejected', `got ${noNameResp.status()}`);

  // ─ EC3: remove non-existent activity → 404 ──────────────────────────────
  console.log('\n  [EC3] Remove non-existent activity → 404');
  const badRemoveResp = await page.request.delete(`${API_URL}/api/trip/${TRIP_ID}/day/1/activity/remove`, {
    data: { activity_name: 'This Activity Does Not Exist XYZ' },
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  });
  console.log(`  EC3 bad remove: ${badRemoveResp.status()}`);
  badRemoveResp.status() === 404
    ? pass('EC3 remove non-existent activity correctly returns 404')
    : fail('EC3 non-existent activity not 404', `got ${badRemoveResp.status()}`);

  // ══════════════════════════════════════════════════════════════════════════
  // 2c. EDIT ACTIVITY — cost change, verify persisted + is_customized set
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n=== 2c. Edit Activity ===');

  const tripForEdit = await getTrip(page, token);
  const firstAct = (tripForEdit.itinerary_json?.itinerary?.[0]?.activities || []).find(a => !a.is_break);
  const actName  = firstAct?.name;
  const costBefore = firstAct?.cost || firstAct?.estimated_cost || 0;
  console.log(`  Editing "${actName}" — cost before: ₹${costBefore}`);

  // 2c-1: Edit cost
  const editResp = await page.request.put(`${API_URL}/api/trip/${TRIP_ID}/day/1/activity/edit`, {
    data: { activity_name: actName, cost_override: 9999, user_note: 'Playwright override cost' },
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  });
  const editData = await editResp.json();
  console.log(`  Edit activity: ${editResp.status()} — ${editData.message || editData.error}`);
  editResp.status() === 200
    ? pass('2c.1 edit activity API returns 200')
    : fail('2c.1 edit activity failed', editData.error);

  // 2c-2: Verify new cost in DB
  const tripAfterEdit = await getTrip(page, token);
  const editedAct = (tripAfterEdit.itinerary_json?.itinerary?.[0]?.activities || []).find(
    a => a.name === actName
  );
  const costAfter = editedAct?.cost || editedAct?.estimated_cost || 0;
  console.log(`  Cost after edit: ₹${costAfter}`);
  costAfter === 9999
    ? pass('2c.2 edited cost persisted in itinerary JSON')
    : fail('2c.2 edited cost not persisted', `got ${costAfter}`);

  // 2c-3: is_customized flag set
  const isCustomized = tripAfterEdit.is_customized;
  console.log(`  is_customized: ${isCustomized}`);
  isCustomized
    ? pass('2c.3 is_customized flag set after activity edit')
    : fail('2c.3 is_customized not set after edit');

  // 2c-4: Reload UI and verify cost shown (₹9,999)
  await goItineraryTab(page);
  // Activities show costs — look for the edited cost value
  const costVisible = await page.locator('text=9,999').count() + await page.locator('text=9999').count();
  await shot(page, '2c-edit-activity');
  costVisible > 0
    ? pass('2c.4 edited cost value visible in itinerary UI')
    : warn('2c.4 edited cost not visible in UI (may be formatted differently)');

  // ─ EC4: edit non-existent activity → 404 ────────────────────────────────
  console.log('\n  [EC4] Edit non-existent activity → 404');
  const badEditResp = await page.request.put(`${API_URL}/api/trip/${TRIP_ID}/day/1/activity/edit`, {
    data: { activity_name: 'Nonexistent Activity ABC', cost: 500 },
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  });
  console.log(`  EC4 bad edit: ${badEditResp.status()}`);
  badEditResp.status() === 404
    ? pass('EC4 edit non-existent activity correctly returns 404')
    : fail('EC4 non-existent edit not 404', `got ${badEditResp.status()}`);

  // ══════════════════════════════════════════════════════════════════════════
  // 2d. NOTES — full UI flow + persistence
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n=== 2d. Notes — UI save + persist ===');
  const testNote = `P2 test note — written at ${new Date().toISOString().slice(11, 19)}`;

  await goNotesTab(page);
  await shot(page, '2d-notes-empty');

  // 2d-1: Type note in textarea
  const textarea = page.locator('textarea').first();
  const textareaCount = await textarea.count();
  textareaCount > 0
    ? pass('2d.1 Notes textarea present')
    : fail('2d.1 Notes textarea not found');

  if (textareaCount > 0) {
    await textarea.fill(testNote);
    console.log(`  Typed note: "${testNote}"`);

    // 2d-2: Click "Save Notes" button
    const saveBtn = page.locator('button:has-text("Save Notes")');
    const saveBtnVisible = await saveBtn.count() > 0;
    saveBtnVisible
      ? pass('2d.2 Save Notes button present')
      : fail('2d.2 Save Notes button not found');

    if (saveBtnVisible) {
      await saveBtn.click();
      await page.waitForTimeout(2000);
      await shot(page, '2d-notes-saved');

      // Verify success toast
      const successToast = await page.locator('text=Notes saved').count();
      successToast > 0
        ? pass('2d.3 "Notes saved" toast shown after save')
        : warn('2d.3 "Notes saved" toast not detected (may have faded)');

      // 2d-4: Hard reload — verify note persists
      await page.reload({ waitUntil: 'domcontentloaded' });
      await page.waitForSelector('button:has-text("Notes")', { timeout: 20000 });
      await page.locator('button', { hasText: 'Notes' }).first().click();
      await page.waitForTimeout(2000);
      await shot(page, '2d-notes-after-reload');

      const noteAfterReload = await page.locator('textarea').first().inputValue();
      console.log(`  Note after reload: "${noteAfterReload.slice(0, 50)}"`);
      noteAfterReload === testNote
        ? pass('2d.4 note persists correctly after hard reload')
        : fail('2d.4 note not persisted', `got: "${noteAfterReload.slice(0, 60)}"`);
    }
  }

  // ─ EC5: save empty note → 400 from API ─────────────────────────────────
  console.log('\n  [EC5] Empty note body returns 400');
  const emptyNoteResp = await page.request.put(`${API_URL}/api/trip/${TRIP_ID}/notes`, {
    data: {},
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
  });
  console.log(`  EC5 empty notes body: ${emptyNoteResp.status()}`);
  emptyNoteResp.status() === 400
    ? pass('EC5 empty notes body correctly returns 400')
    : fail('EC5 empty notes not rejected', `got ${emptyNoteResp.status()}`);

  // ─ EC6: onBlur auto-save ──────────────────────────────────────────────
  console.log('\n  [EC6] onBlur auto-save');
  await goNotesTab(page);
  const textarea2 = page.locator('textarea').first();
  if (await textarea2.count() > 0) {
    const blurNote = `onBlur test — ${Date.now()}`;
    await textarea2.fill(blurNote);
    // Blur the textarea (click elsewhere) to trigger onBlur handler
    await page.locator('h3:has-text("Trip Notes")').click();
    await page.waitForTimeout(2000);
    const blurToast = await page.locator('text=Notes saved').count();
    console.log(`  onBlur toast: ${blurToast}`);
    blurToast > 0
      ? pass('EC6 onBlur triggers auto-save (toast shown)')
      : warn('EC6 onBlur auto-save toast not visible (may have faded)');

    // Verify persisted
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForSelector('button:has-text("Notes")', { timeout: 20000 });
    await page.locator('button', { hasText: 'Notes' }).first().click();
    await page.waitForTimeout(2000);
    const blurNoteAfterReload = await page.locator('textarea').first().inputValue();
    blurNoteAfterReload === blurNote
      ? pass('EC6a onBlur-saved note persists after reload')
      : fail('EC6a onBlur note not persisted', `got: "${blurNoteAfterReload.slice(0, 60)}"`);
  }

  // ─ EC7: is_customized flag verified after hotel edit ────────────────────
  console.log('\n  [EC7] is_customized flag set after all edits');
  const finalTrip = await getTrip(page, token);
  finalTrip.is_customized
    ? pass('EC7 is_customized=true after hotel+activity+notes edits')
    : fail('EC7 is_customized not set');

  // ─ EC9: API error audit ──────────────────────────────────────────────────
  console.log('\n=== EC9: API error audit ===');
  const unexpectedErrors = apiErrors.filter(e => !e.startsWith('429'));
  unexpectedErrors.length === 0
    ? pass('EC9 zero unexpected server errors across all P2 tests')
    : fail('EC9 unexpected API errors', unexpectedErrors.join(', '));

  // ══════════════════════════════════════════════════════════════════════════
  // MISSING UI AUDIT
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n=== UI GAP AUDIT ===');
  await goItineraryTab(page);
  const hasChangeHotel  = await page.locator('button:has-text("Change Hotel"), button:has-text("Swap Hotel")').count();
  const hasAddActivity  = await page.locator('button:has-text("Add Activity")').count();
  const hasEditActivity = await page.locator('button:has-text("Edit"), [aria-label*="edit"]').count();

  hasChangeHotel > 0
    ? pass('UI: Hotel swap button present')
    : warn('UI GAP: No "Change Hotel" button — hotel swap only possible via API');
  hasAddActivity > 0
    ? pass('UI: Add Activity button present')
    : warn('UI GAP: No "Add Activity" button — activity management only possible via API');
  hasEditActivity > 0
    ? pass('UI: Edit activity button present')
    : warn('UI GAP: No activity edit button in itinerary UI');
  await shot(page, '2d-ui-gap-check');

  // ══════════════════════════════════════════════════════════════════════════
  // SUMMARY
  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n' + '═'.repeat(60));
  console.log('P2 TRIP EDITOR RESULTS');
  console.log('═'.repeat(60));
  const passed = results.filter(r => r.r === 'PASS').length;
  const failed = results.filter(r => r.r === 'FAIL').length;
  const warned = results.filter(r => r.r === 'WARNING').length;
  results.forEach(r => {
    const icon = r.r === 'PASS' ? '✓' : r.r === 'FAIL' ? '✗' : '⚠';
    console.log(`  ${icon} ${r.r.padEnd(8)} ${r.label}`);
  });
  console.log('─'.repeat(60));
  console.log(`  ${passed} PASS  |  ${warned} WARNING  |  ${failed} FAIL`);
  console.log('═'.repeat(60));

  await page.waitForTimeout(3000);
  await browser.close();
})();
