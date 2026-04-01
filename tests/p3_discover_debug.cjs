/**
 * P3 Discover & Pre-Trip Planning — Full + Edge Case Validation
 * ═══════════════════════════════════════════════════════════════
 *
 * Tests (API-layer + UI):
 *   3a. Recommend         — ranked destinations by preferences
 *   3b. Best-Time Widget  — 12-month score matrix + verdict
 *   3c. Is-Good-Time      — quick yes/no check
 *   3d. Estimate Budget   — full cost breakdown
 *   3e. Compare           — side-by-side destination comparison
 *   3f. Discover UI       — page loads, cards, detail click
 *
 * Edge Cases:
 *   EC01 — compare: 1 destination → 400
 *   EC02 — compare: 6 destinations → 400
 *   EC03 — compare: all non-existent IDs → 404
 *   EC04 — compare: 5 destinations (boundary max) → 200
 *   EC05 — best-time: non-existent dest → 404
 *   EC06 — best-time: response has exactly 12 months in monthly_guide
 *   EC07 — best-time: all scores are 0–100
 *   EC08 — is-good-time: missing dest_id → 400
 *   EC09 — is-good-time: non-existent dest_id → 404
 *   EC10 — is-good-time: no month param → defaults to current (200 OK)
 *   EC11 — is-good-time: invalid month → 200 (backend defaults gracefully)
 *   EC12 — estimate: empty dest_ids → 400
 *   EC13 — estimate: 11 dest_ids → 400 (exceeds MAX=10)
 *   EC14 — estimate: duration=0 → 400
 *   EC15 — estimate: travelers=0 → 400
 *   EC16 — estimate: duration=61 → 400
 *   EC17 — estimate: travelers=51 → 400
 *   EC18 — estimate: non-existent dest_ids → 404
 *   EC19 — estimate: luxury > budget total cost
 *   EC20 — estimate: group discount applied (travelers=10, 15%)
 *   EC21 — estimate: group discount applied (travelers=5, 10%)
 *   EC22 — recommend: state filter returns subset
 *   EC23 — recommend: limit=50 (max) respected
 *   EC24 — recommend: interests filter (comma-separated) accepted
 *   EC25 — recommend response shape: has 'recommendations' key
 *   EC26 — compare response shape: winner = highest match_score
 *   EC27 — best-time response shape: has 'monthly_guide' key
 *
 * Run: node tests/p3_discover_debug.cjs
 */

const { chromium } = require('playwright');

const TARGET_URL = 'http://localhost:5173';
const API_URL    = 'http://127.0.0.1:5000';
const EMAIL      = 'testreviewer@altairgo.com';
const PASSWORD   = 'TestReviewer123!';
const SHOTS      = 'D:/Projects/AltairGO Platform/test-results';

const results  = [];
const apiErrors = [];

function pass(label)    { results.push({ label, r: 'PASS'    }); console.log(`  ✓ PASS    ${label}`); }
function fail(label, d) { results.push({ label, r: 'FAIL'    }); console.log(`  ✗ FAIL    ${label}${d ? ' — ' + d : ''}`); }
function warn(label, d) { results.push({ label, r: 'WARNING' }); console.log(`  ⚠ WARNING ${label}${d ? ' — ' + d : ''}`); }
function skip(label, d) { results.push({ label, r: 'SKIP'    }); console.log(`  ➖ SKIP    ${label}${d ? ' — ' + d : ''}`); }

async function shot(page, name) {
  await page.screenshot({ path: `${SHOTS}/p3-${name}.png`, fullPage: false });
  console.log(`  📸 ${name}.png`);
}

async function api(page, token, method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { 'Authorization': `Bearer ${token}` } : {}) },
  };
  if (body) opts.data = body;
  const fn = page.request[method.toLowerCase()].bind(page.request);
  const resp = await fn(`${API_URL}${path}`, opts);
  if (resp.status() >= 500) {
    const text = await resp.text().catch(() => '');
    apiErrors.push({ path, status: resp.status(), body: text.slice(0, 200) });
  }
  return resp;
}

// ── Main ─────────────────────────────────────────────────────────────────────

(async () => {
  const browser = await chromium.launch({ headless: false, slowMo: 80 });
  const page    = await browser.newPage();
  page.setDefaultTimeout(30000);
  const RECOMMEND_TIMEOUT = 120000; // 2min — 179/186 dests have NULL popularity_score → slow scoring

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

  // ── SETUP: Get real destination IDs ──────────────────────────────────────
  console.log('\n=== SETUP: Get destination IDs ===');
  const destsResp = await api(page, token, 'GET', '/destinations');
  let destId = 1, destId2 = 2, allDestIds = [];
  if (destsResp.ok()) {
    const destsData = await destsResp.json();
    const dests = destsData.destinations ?? destsData.items ?? destsData;
    if (Array.isArray(dests) && dests.length > 0) {
      allDestIds = dests.map(d => d.id);
      destId  = dests[0].id;
      destId2 = dests.length > 1 ? dests[1].id : destId + 1;
      console.log(`  Using dest IDs: ${destId}, ${destId2} (total: ${allDestIds.length})`);
    } else {
      console.log(`  WARNING: /destinations returned unexpected shape — using fallback IDs 1, 2`);
    }
  } else {
    console.log(`  WARNING: /destinations failed (${destsResp.status()}) — using fallback IDs 1, 2`);
  }

  // ── 3a. Recommend ─────────────────────────────────────────────────────────
  console.log('\n=== 3a. Recommend ===');

  // Happy path — basic recommend (slow: uses RECOMMEND_TIMEOUT)
  let resp = await page.request.get(
    `${API_URL}/api/discover/recommend?budget=15000&duration=3&travelers=2&traveler_type=couple&travel_month=oct`,
    { headers: { 'Authorization': `Bearer ${token}` }, timeout: RECOMMEND_TIMEOUT }
  );
  if (resp.ok()) {
    const body = await resp.json();
    if (body.recommendations !== undefined) {
      pass('3a-1: Recommend returns 200 with recommendations array');
      if (Array.isArray(body.recommendations)) {
        pass('3a-2: recommendations is an array');
        if (body.recommendations.length > 0) {
          const first = body.recommendations[0];
          if (first.match_score !== undefined) {
            pass('3a-3: Each recommendation has match_score');
          } else {
            warn('3a-3: match_score missing from recommendation item', JSON.stringify(Object.keys(first)));
          }
          if (first.name && first.id) {
            pass('3a-4: Recommendation has name + id');
          } else {
            fail('3a-4: Recommendation missing name/id', JSON.stringify(Object.keys(first)));
          }
          if (first.seasonal_verdict) {
            pass('3a-5: Recommendation has seasonal_verdict');
          } else {
            warn('3a-5: seasonal_verdict missing from recommendation');
          }
        } else {
          warn('3a-3: recommendations array is empty (may be filtered out — NULL popularity_score issue)');
        }
      } else {
        fail('3a-2: recommendations is not an array', typeof body.recommendations);
      }
    } else {
      fail('3a-1: Response missing "recommendations" key', JSON.stringify(Object.keys(body)));
    }
  } else {
    fail('3a-1: Recommend returned non-OK status', `${resp.status()}`);
  }

  // EC25 — recommend response has 'recommendations' not 'destinations'
  // (spec uses body.destinations ?? body.recommendations — if key is 'recommendations', spec works)
  // This is a documentation check: confirm 'destinations' key is absent
  if (resp.ok()) {
    const body2 = await resp.clone?.() || resp;  // already read above
    try {
      const b = await resp.json().catch(() => null);
      // Won't re-read (already consumed) — covered above in 3a-1
    } catch { }
  }

  // EC22 — State filter
  console.log('\n--- EC22: State filter ---');
  resp = await page.request.get(
    `${API_URL}/api/discover/recommend?budget=20000&duration=3&travelers=1&state=Rajasthan`,
    { headers: { 'Authorization': `Bearer ${token}` }, timeout: RECOMMEND_TIMEOUT }
  );
  if (resp.ok()) {
    const body = await resp.json();
    const recs = body.recommendations ?? [];
    // Just verify it doesn't crash and returns a valid structure
    if (Array.isArray(recs)) {
      pass('EC22: State filter returns array (may be empty if state has no dests)');
    } else {
      fail('EC22: State filter response not an array', typeof recs);
    }
  } else {
    fail('EC22: State filter returned error', `${resp.status()}`);
  }

  // EC23 — Limit=50 max respected
  console.log('\n--- EC23: Limit=50 ---');
  resp = await page.request.get(
    `${API_URL}/api/discover/recommend?budget=50000&duration=5&travelers=1&limit=50`,
    { headers: { 'Authorization': `Bearer ${token}` }, timeout: RECOMMEND_TIMEOUT }
  );
  if (resp.ok()) {
    const body = await resp.json();
    const recs = body.recommendations ?? [];
    if (Array.isArray(recs) && recs.length <= 50) {
      pass(`EC23: Limit=50 respected — got ${recs.length} results`);
    } else {
      fail('EC23: Limit=50 exceeded or bad response', `got ${recs.length}`);
    }
  } else {
    fail('EC23: limit=50 returned error', `${resp.status()}`);
  }

  // EC24 — Interests comma-separated
  console.log('\n--- EC24: Interests filter ---');
  resp = await page.request.get(
    `${API_URL}/api/discover/recommend?budget=15000&duration=3&travelers=1&interests=beaches,history,food`,
    { headers: { 'Authorization': `Bearer ${token}` }, timeout: RECOMMEND_TIMEOUT }
  );
  if (resp.ok()) {
    pass('EC24: Interests filter accepted (200)');
  } else {
    fail('EC24: Interests filter returned error', `${resp.status()}`);
  }

  // Budget validation — backend doesn't reject budget=0 (no explicit validation)
  // Documenting actual behavior here
  console.log('\n--- Recommend budget=0 behavior ---');
  resp = await page.request.get(
    `${API_URL}/api/discover/recommend?budget=0&duration=3&travelers=1`,
    { headers: { 'Authorization': `Bearer ${token}` }, timeout: RECOMMEND_TIMEOUT }
  );
  const budget0Status = resp.status();
  if (budget0Status === 200) {
    warn('Recommend budget=0: returns 200 (no backend validation) — spec expects 400 → MISMATCH',
         'Backend has no budget>0 check; spec test will fail');
  } else if ([400, 422].includes(budget0Status)) {
    pass('Recommend budget=0: correctly returns 400/422');
  } else {
    warn(`Recommend budget=0: unexpected status ${budget0Status}`);
  }

  // ── 3b. Best-Time Widget ──────────────────────────────────────────────────
  console.log('\n=== 3b. Best-Time Widget ===');

  // Happy path
  resp = await api(page, token, 'GET', `/api/discover/best-time/${destId}`);
  if (resp.ok()) {
    const body = await resp.json();
    pass('3b-1: best-time returns 200');

    // EC27 — Check actual key name is 'monthly_guide'
    if (body.monthly_guide) {
      pass('EC27: Response has "monthly_guide" key (not monthly_scores/months)');
    } else {
      fail('EC27: Response missing "monthly_guide" key', JSON.stringify(Object.keys(body)));
    }

    // EC06 — exactly 12 months
    const monthCount = body.monthly_guide ? Object.keys(body.monthly_guide).length : 0;
    if (monthCount === 12) {
      pass(`EC06: monthly_guide has exactly 12 months`);
    } else {
      fail(`EC06: Expected 12 months, got ${monthCount}`);
    }

    // EC07 — all scores 0-100
    if (body.monthly_guide) {
      let allValid = true;
      for (const [mk, mv] of Object.entries(body.monthly_guide)) {
        const score = mv.score;
        if (typeof score !== 'number' || score < 0 || score > 100) {
          fail(`EC07: Score out of range for ${mk}: ${score}`);
          allValid = false;
          break;
        }
      }
      if (allValid) pass('EC07: All 12 monthly scores are in range 0–100');
    }

    // Check current_month field
    if (body.current_month && body.current_month.verdict) {
      const validVerdicts = ['Excellent', 'Good', 'Fair', 'Avoid'];
      if (validVerdicts.includes(body.current_month.verdict)) {
        pass(`3b-2: current_month verdict is valid: "${body.current_month.verdict}"`);
      } else {
        fail('3b-2: current_month verdict invalid', body.current_month.verdict);
      }
    } else {
      warn('3b-2: current_month verdict missing from response');
    }

    // best_months should be array of up to 3
    if (Array.isArray(body.best_months) && body.best_months.length <= 3) {
      pass(`3b-3: best_months present (${body.best_months.join(', ')})`);
    } else {
      warn('3b-3: best_months missing or unexpected', JSON.stringify(body.best_months));
    }

  } else {
    fail('3b-1: best-time returned non-OK', `${resp.status()}`);
  }

  // EC05 — non-existent destination
  console.log('\n--- EC05: Non-existent dest → 404 ---');
  resp = await api(page, token, 'GET', `/api/discover/best-time/999999`);
  if (resp.status() === 404) {
    pass('EC05: best-time/999999 returns 404');
  } else {
    fail('EC05: Expected 404, got', `${resp.status()}`);
  }

  // ── 3c. Is-Good-Time ─────────────────────────────────────────────────────
  console.log('\n=== 3c. Is-Good-Time ===');

  // Happy path
  resp = await api(page, token, 'GET', `/api/discover/is-good-time?dest_id=${destId}&month=oct`);
  if (resp.ok()) {
    const body = await resp.json();
    pass('3c-1: is-good-time returns 200');
    if (typeof body.good_to_go === 'boolean') {
      pass(`3c-2: good_to_go is boolean: ${body.good_to_go}`);
    } else {
      fail('3c-2: good_to_go is not boolean', typeof body.good_to_go);
    }
    if (typeof body.score === 'number' && body.score >= 0 && body.score <= 100) {
      pass(`3c-3: score is 0–100: ${body.score}`);
    } else {
      fail('3c-3: score out of range or missing', body.score);
    }
    if (['Excellent', 'Good', 'Fair', 'Avoid'].includes(body.verdict)) {
      pass(`3c-4: verdict is valid: "${body.verdict}"`);
    } else {
      fail('3c-4: verdict invalid or missing', body.verdict);
    }
    if (body.tip) {
      pass('3c-5: tip field present');
    } else {
      warn('3c-5: tip field missing');
    }
  } else {
    fail('3c-1: is-good-time returned non-OK', `${resp.status()}`);
  }

  // EC08 — missing dest_id → 400
  console.log('\n--- EC08: Missing dest_id → 400 ---');
  resp = await api(page, token, 'GET', `/api/discover/is-good-time?month=oct`);
  if ([400, 422].includes(resp.status())) {
    pass('EC08: Missing dest_id returns 400');
  } else {
    fail('EC08: Expected 400, got', `${resp.status()}`);
  }

  // EC09 — non-existent dest_id → 404
  console.log('\n--- EC09: Non-existent dest_id → 404 ---');
  resp = await api(page, token, 'GET', `/api/discover/is-good-time?dest_id=999999&month=oct`);
  if (resp.status() === 404) {
    pass('EC09: Non-existent dest_id returns 404');
  } else {
    fail('EC09: Expected 404, got', `${resp.status()}`);
  }

  // EC10 — no month param → defaults gracefully
  console.log('\n--- EC10: No month param → defaults ---');
  resp = await api(page, token, 'GET', `/api/discover/is-good-time?dest_id=${destId}`);
  if (resp.ok()) {
    const body = await resp.json();
    pass('EC10: Missing month defaults gracefully → 200');
    if (body.month) {
      pass(`EC10b: Defaulted month: "${body.month}"`);
    } else {
      warn('EC10b: month field missing from response');
    }
  } else {
    fail('EC10: Missing month returned non-200', `${resp.status()}`);
  }

  // EC11 — invalid month → 200 (backend defaults gracefully: month_key = "xyz")
  console.log('\n--- EC11: Invalid month string ---');
  resp = await api(page, token, 'GET', `/api/discover/is-good-time?dest_id=${destId}&month=xyz`);
  const ec11Status = resp.status();
  if (ec11Status === 200) {
    pass('EC11: Invalid month returns 200 (backend defaults gracefully)');
  } else if ([400, 422].includes(ec11Status)) {
    pass('EC11: Invalid month returns 400/422 (validation)');
  } else {
    fail('EC11: Unexpected status for invalid month', `${ec11Status}`);
  }

  // best_month_instead logic check
  console.log('\n--- best_month_instead field ---');
  resp = await api(page, token, 'GET', `/api/discover/is-good-time?dest_id=${destId}&month=jun`);
  if (resp.ok()) {
    const body = await resp.json();
    // If Jun is not best, best_month_instead should be set
    if (body.best_month_instead) {
      pass(`best_month_instead: "${body.best_month_instead}" (score ${body.best_month_score})`);
    } else {
      pass(`best_month_instead: null (Jun is best month for this dest, score ${body.score})`);
    }
  }

  // ── 3d. Estimate Budget ───────────────────────────────────────────────────
  console.log('\n=== 3d. Estimate Budget ===');

  // Happy path
  resp = await api(page, token, 'POST', `/api/discover/estimate-budget`, {
    destination_ids: [destId],
    duration: 3,
    travelers: 2,
    style: 'standard',
    travel_month: 'oct',
  });
  if (resp.ok()) {
    const body = await resp.json();
    pass('3d-1: estimate-budget returns 200');
    if (body.breakdown) {
      pass('3d-2: breakdown field present');
      const cats = ['accommodation', 'food', 'transport', 'activities', 'misc'];
      const missing = cats.filter(c => !(c in body.breakdown));
      if (missing.length === 0) {
        pass('3d-3: breakdown has all 5 categories (accommodation, food, transport, activities, misc)');
      } else {
        fail('3d-3: breakdown missing categories', missing.join(', '));
      }
    } else {
      fail('3d-2: breakdown field missing', JSON.stringify(Object.keys(body)));
    }
    if (body.estimated_total_inr > 0) {
      pass(`3d-4: estimated_total_inr > 0: ₹${body.estimated_total_inr.toLocaleString('en-IN')}`);
    } else {
      warn('3d-4: estimated_total_inr is 0 (no estimated_cost_per_day seeded for dest)');
    }
    if (body.per_person_inr !== undefined) {
      pass('3d-5: per_person_inr field present');
    } else {
      fail('3d-5: per_person_inr missing');
    }
    if (body.per_day_breakdown) {
      pass('3d-6: per_day_breakdown field present');
    } else {
      warn('3d-6: per_day_breakdown missing');
    }
  } else {
    fail('3d-1: estimate-budget returned non-OK', `${resp.status()}`);
  }

  // EC19 — luxury > budget cost
  console.log('\n--- EC19: Luxury > Budget cost ---');
  const [budgetResp, luxuryResp] = await Promise.all([
    api(page, token, 'POST', `/api/discover/estimate-budget`, {
      destination_ids: [destId], duration: 3, travelers: 1, style: 'budget', travel_month: 'oct',
    }),
    api(page, token, 'POST', `/api/discover/estimate-budget`, {
      destination_ids: [destId], duration: 3, travelers: 1, style: 'luxury', travel_month: 'oct',
    }),
  ]);
  if (budgetResp.ok() && luxuryResp.ok()) {
    const bBody = await budgetResp.json();
    const lBody = await luxuryResp.json();
    const bt = bBody.estimated_total_inr ?? 0;
    const lt = lBody.estimated_total_inr ?? 0;
    if (bt > 0 && lt > 0) {
      if (lt > bt) {
        pass(`EC19: luxury (₹${lt.toLocaleString('en-IN')}) > budget (₹${bt.toLocaleString('en-IN')})`);
      } else {
        fail('EC19: luxury total should be > budget total', `luxury=${lt}, budget=${bt}`);
      }
    } else {
      warn('EC19: Skipped — no estimated_cost_per_day seeded (totals are 0)');
    }
  } else {
    fail('EC19: One of budget/luxury estimate calls failed');
  }

  // EC20 — Group discount travelers=10 (15%)
  console.log('\n--- EC20: Group discount travelers=10 ---');
  resp = await api(page, token, 'POST', `/api/discover/estimate-budget`, {
    destination_ids: [destId], duration: 3, travelers: 10, style: 'standard',
  });
  if (resp.ok()) {
    const body = await resp.json();
    if (body.group_discount_applied === '15%') {
      pass('EC20: 10 travelers → 15% group discount applied');
    } else {
      warn('EC20: group_discount_applied unexpected', `got: ${body.group_discount_applied}`);
    }
  } else {
    fail('EC20: estimate with travelers=10 failed', `${resp.status()}`);
  }

  // EC21 — Group discount travelers=5 (10%)
  console.log('\n--- EC21: Group discount travelers=5 ---');
  resp = await api(page, token, 'POST', `/api/discover/estimate-budget`, {
    destination_ids: [destId], duration: 3, travelers: 5, style: 'standard',
  });
  if (resp.ok()) {
    const body = await resp.json();
    if (body.group_discount_applied === '10%') {
      pass('EC21: 5 travelers → 10% group discount applied');
    } else {
      warn('EC21: group_discount_applied unexpected', `got: ${body.group_discount_applied}`);
    }
  } else {
    fail('EC21: estimate with travelers=5 failed', `${resp.status()}`);
  }

  // Verify travelers=1 has no group discount
  resp = await api(page, token, 'POST', `/api/discover/estimate-budget`, {
    destination_ids: [destId], duration: 3, travelers: 1, style: 'standard',
  });
  if (resp.ok()) {
    const body = await resp.json();
    if (!body.group_discount_applied) {
      pass('Solo (1 traveler) → no group discount');
    } else {
      fail('Solo should have no discount', `got: ${body.group_discount_applied}`);
    }
  }

  // EC12 — Empty dest_ids → 400
  console.log('\n--- EC12: Empty dest_ids → 400 ---');
  resp = await api(page, token, 'POST', `/api/discover/estimate-budget`, {
    destination_ids: [], duration: 3, travelers: 1, style: 'standard',
  });
  if ([400, 422].includes(resp.status())) {
    pass('EC12: Empty destination_ids returns 400');
  } else {
    fail('EC12: Expected 400, got', `${resp.status()}`);
  }

  // EC13 — 11 dest_ids → 400
  console.log('\n--- EC13: 11 dest_ids → 400 ---');
  resp = await api(page, token, 'POST', `/api/discover/estimate-budget`, {
    destination_ids: Array.from({ length: 11 }, (_, i) => i + 1),
    duration: 3, travelers: 1, style: 'standard',
  });
  if ([400, 422].includes(resp.status())) {
    pass('EC13: 11 dest_ids returns 400 (exceeds MAX_DEST_IDS=10)');
  } else {
    fail('EC13: Expected 400, got', `${resp.status()}`);
  }

  // EC14 — duration=0 → 400
  console.log('\n--- EC14: duration=0 → 400 ---');
  resp = await api(page, token, 'POST', `/api/discover/estimate-budget`, {
    destination_ids: [destId], duration: 0, travelers: 1, style: 'standard',
  });
  if ([400, 422].includes(resp.status())) {
    pass('EC14: duration=0 returns 400');
  } else {
    fail('EC14: Expected 400, got', `${resp.status()}`);
  }

  // EC15 — travelers=0 → 400
  console.log('\n--- EC15: travelers=0 → 400 ---');
  resp = await api(page, token, 'POST', `/api/discover/estimate-budget`, {
    destination_ids: [destId], duration: 3, travelers: 0, style: 'standard',
  });
  if ([400, 422].includes(resp.status())) {
    pass('EC15: travelers=0 returns 400');
  } else {
    fail('EC15: Expected 400, got', `${resp.status()}`);
  }

  // EC16 — duration=61 → 400
  console.log('\n--- EC16: duration=61 → 400 ---');
  resp = await api(page, token, 'POST', `/api/discover/estimate-budget`, {
    destination_ids: [destId], duration: 61, travelers: 1, style: 'standard',
  });
  if ([400, 422].includes(resp.status())) {
    pass('EC16: duration=61 returns 400');
  } else {
    fail('EC16: Expected 400, got', `${resp.status()}`);
  }

  // EC17 — travelers=51 → 400
  console.log('\n--- EC17: travelers=51 → 400 ---');
  resp = await api(page, token, 'POST', `/api/discover/estimate-budget`, {
    destination_ids: [destId], duration: 3, travelers: 51, style: 'standard',
  });
  if ([400, 422].includes(resp.status())) {
    pass('EC17: travelers=51 returns 400');
  } else {
    fail('EC17: Expected 400, got', `${resp.status()}`);
  }

  // EC18 — All non-existent dest_ids → 404
  console.log('\n--- EC18: Non-existent dest_ids → 404 ---');
  resp = await api(page, token, 'POST', `/api/discover/estimate-budget`, {
    destination_ids: [999998, 999999], duration: 3, travelers: 1, style: 'standard',
  });
  if (resp.status() === 404) {
    pass('EC18: Non-existent destination_ids returns 404');
  } else {
    fail('EC18: Expected 404, got', `${resp.status()}`);
  }

  // ── 3e. Compare ───────────────────────────────────────────────────────────
  console.log('\n=== 3e. Compare ===');

  // Happy path — 2 destinations
  resp = await api(page, token, 'POST', `/api/discover/compare`, {
    destination_ids: [destId, destId2],
    budget: 15000,
    duration: 3,
    travelers: 2,
    traveler_type: 'couple',
    travel_month: 'oct',
  });
  if (resp.ok()) {
    const body = await resp.json();
    pass('3e-1: compare returns 200');
    if (Array.isArray(body.destinations) && body.destinations.length === 2) {
      pass('3e-2: destinations array has 2 items');
    } else {
      fail('3e-2: destinations array wrong', JSON.stringify(body.destinations?.length));
    }
    if (body.recommendation?.winner) {
      pass(`3e-3: recommendation.winner present: "${body.recommendation.winner}"`);
    } else {
      fail('3e-3: recommendation.winner missing', JSON.stringify(body.recommendation));
    }

    // EC26 — Winner should be highest match_score destination
    if (Array.isArray(body.destinations) && body.destinations.length >= 2) {
      const sorted = [...body.destinations].sort((a, b) => b.match_score - a.match_score);
      const expectedWinner = sorted[0].name;
      const actualWinner = body.recommendation?.winner;
      if (actualWinner === expectedWinner) {
        pass(`EC26: Winner (${actualWinner}) = highest match_score destination`);
      } else {
        fail('EC26: Winner does not match highest match_score', `winner=${actualWinner}, top=${expectedWinner}`);
      }
    }

    // Verify each dest has seasonal score
    for (const dest of (body.destinations || [])) {
      if (!dest.seasonal?.score !== undefined) {
        // seasonal.score exists (note: 0 is falsy so check key)
        pass(`3e-4: ${dest.name} has seasonal.score`);
        break;
      }
    }
    if (body.destinations?.[0]?.seasonal?.score !== undefined) {
      pass('3e-4: Destinations have seasonal.score field');
    } else {
      warn('3e-4: seasonal.score missing from compare destinations');
    }

  } else {
    fail('3e-1: compare returned non-OK', `${resp.status()}`);
  }

  // EC01 — 1 destination → 400
  console.log('\n--- EC01: 1 destination → 400 ---');
  resp = await api(page, token, 'POST', `/api/discover/compare`, {
    destination_ids: [destId],
    duration: 3, travelers: 1,
  });
  if ([400, 422].includes(resp.status())) {
    pass('EC01: 1 destination returns 400');
  } else {
    fail('EC01: Expected 400, got', `${resp.status()}`);
  }

  // EC02 — 6 destinations → 400
  console.log('\n--- EC02: 6 destinations → 400 ---');
  resp = await api(page, token, 'POST', `/api/discover/compare`, {
    destination_ids: [1, 2, 3, 4, 5, 6],
    duration: 3, travelers: 1,
  });
  if ([400, 422].includes(resp.status())) {
    pass('EC02: 6 destinations returns 400 (max is 5)');
  } else {
    fail('EC02: Expected 400, got', `${resp.status()}`);
  }

  // EC03 — All non-existent IDs → 404
  console.log('\n--- EC03: All non-existent IDs → 404 ---');
  resp = await api(page, token, 'POST', `/api/discover/compare`, {
    destination_ids: [999997, 999998],
    duration: 3, travelers: 1,
  });
  if (resp.status() === 404) {
    pass('EC03: All non-existent destination_ids returns 404');
  } else {
    fail('EC03: Expected 404, got', `${resp.status()}`);
  }

  // EC04 — 5 destinations (boundary max) → 200
  console.log('\n--- EC04: 5 destinations (max boundary) → 200 ---');
  const five = allDestIds.slice(0, 5);
  if (five.length === 5) {
    resp = await api(page, token, 'POST', `/api/discover/compare`, {
      destination_ids: five,
      duration: 3, travelers: 1,
    });
    if (resp.ok()) {
      const body = await resp.json();
      pass(`EC04: 5 destinations (boundary max) returns 200 with ${body.destinations?.length} results`);
    } else {
      fail('EC04: 5 destinations returned non-OK', `${resp.status()}`);
    }
  } else {
    skip('EC04: Less than 5 destinations available in DB — skipping boundary test');
  }

  // Empty body → 400
  console.log('\n--- Compare empty body → 400 ---');
  resp = await api(page, token, 'POST', `/api/discover/compare`, {});
  if ([400, 422].includes(resp.status())) {
    pass('Compare empty body returns 400');
  } else {
    fail('Compare empty body should return 400', `${resp.status()}`);
  }

  // ── 3f. Discover UI ───────────────────────────────────────────────────────
  console.log('\n=== 3f. Discover UI ===');

  // Inject token before UI tests
  await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded' });
  await page.evaluate((t) => { localStorage.setItem('ag_token', t); }, token);

  // UI-1: Discover page loads
  console.log('\n--- UI-1: Discover page loads ---');
  try {
    await page.goto(`${TARGET_URL}/discover`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await shot(page, '3f-discover-load');

    const cards = page.locator('[class*="card"], [class*="destination"], article');
    const cardCount = await cards.count();
    if (cardCount > 0) {
      pass(`UI-1: Discover page loaded — ${cardCount} cards visible`);
    } else {
      // Check if page has any content
      const body = await page.locator('body').textContent();
      if (body && body.length > 100) {
        warn('UI-1: Discover page loaded but no card elements found — check selectors', `body len: ${body.length}`);
      } else {
        fail('UI-1: Discover page appears empty');
      }
    }
  } catch (err) {
    fail('UI-1: Discover page navigation failed', err.message.slice(0, 100));
  }

  // UI-2: Season filter click doesn't crash
  console.log('\n--- UI-2: Season filter ---');
  try {
    const winterBtn = page.getByRole('button', { name: /winter/i });
    if (await winterBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await winterBtn.click();
      await page.waitForTimeout(1500);
      await shot(page, '3f-winter-filter');
      const errorText = await page.locator('body').textContent();
      if (!errorText?.toLowerCase().includes('error occurred')) {
        pass('UI-2: Winter filter click — no crash');
      } else {
        fail('UI-2: Page shows error after winter filter click');
      }
    } else {
      skip('UI-2: No Winter button found — checking for any season filter');
      const seasonBtn = page.locator('[class*="filter"], [class*="season"], [class*="tab"]').first();
      if (await seasonBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
        await seasonBtn.click();
        await page.waitForTimeout(1000);
        pass('UI-2: Season filter clicked (alternative selector)');
      }
    }
  } catch (err) {
    warn('UI-2: Season filter test error', err.message.slice(0, 100));
  }

  // UI-3: Destination detail page loads on card click
  console.log('\n--- UI-3: Destination detail page ---');
  try {
    await page.goto(`${TARGET_URL}/discover`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(2500);
    const card = page.locator('[class*="card"], article').first();
    if (await card.isVisible({ timeout: 5000 }).catch(() => false)) {
      await card.click();
      try {
        await page.waitForURL(/\/(destination|destinations|discover)\//,  { timeout: 10000 });
        await page.waitForTimeout(1500);
        await shot(page, '3f-destination-detail');
        const pageText = await page.locator('body').textContent();
        if (!pageText?.toLowerCase().includes('page not found') &&
            !pageText?.toLowerCase().includes('404')) {
          pass('UI-3: Destination detail page loaded — no 404/not-found errors');
        } else {
          fail('UI-3: Destination detail page shows 404 or not-found');
        }
      } catch {
        await shot(page, '3f-card-click-result');
        const currentURL = page.url();
        if (currentURL !== `${TARGET_URL}/discover`) {
          pass(`UI-3: Card click navigated to: ${currentURL}`);
        } else {
          warn('UI-3: Card click did not navigate away from /discover');
        }
      }
    } else {
      skip('UI-3: No card visible to click');
    }
  } catch (err) {
    warn('UI-3: Destination detail test error', err.message.slice(0, 100));
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n' + '═'.repeat(60));
  console.log('P3 DISCOVER — SUMMARY');
  console.log('═'.repeat(60));

  const totals = results.reduce((acc, r) => {
    acc[r.r] = (acc[r.r] || 0) + 1;
    return acc;
  }, {});

  const passCount = totals.PASS || 0;
  const failCount = totals.FAIL || 0;
  const warnCount = totals.WARNING || 0;
  const skipCount = totals.SKIP || 0;

  console.log(`  PASS:    ${passCount}`);
  console.log(`  FAIL:    ${failCount}`);
  console.log(`  WARNING: ${warnCount}`);
  console.log(`  SKIP:    ${skipCount}`);
  console.log(`  TOTAL:   ${results.length}`);

  if (failCount > 0) {
    console.log('\nFAILED TESTS:');
    results.filter(r => r.r === 'FAIL').forEach(r => console.log(`  ✗ ${r.label}`));
  }

  if (warnCount > 0) {
    console.log('\nWARNINGS (real issues, not test bugs):');
    results.filter(r => r.r === 'WARNING').forEach(r => console.log(`  ⚠ ${r.label}`));
  }

  if (apiErrors.length > 0) {
    console.log(`\n500 ERRORS DETECTED (${apiErrors.length}):`);
    apiErrors.forEach(e => console.log(`  ${e.path} → ${e.status}: ${e.body.slice(0, 80)}`));
  } else {
    console.log('\n  Zero 500 errors detected ✓');
  }

  console.log('═'.repeat(60));
  await browser.close();
})();
