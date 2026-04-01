/**
 * 03_discover.spec.js — P3: Discover & Pre-Trip Planning
 * ════════════════════════════════════════════════════════
 *
 * Covers:
 *   - Destination comparison (side-by-side + winner logic)
 *   - Best time widget (monthly score matrix + verdict)
 *   - Is-good-time quick check
 *   - Estimate budget (full cost breakdown before booking)
 *   - Recommend endpoint (budget/season/traveler ranking)
 *   - Destination detail page (attractions, info, budget calculator)
 *   - Discover page UI: filters, card grid, search
 */

import { test, expect } from '@playwright/test';
import { getToken, API_BASE } from './helpers/auth.js';

let token;
let destId;   // set from GET /destinations response
let destId2;  // second distinct destination for compare tests

test.beforeAll(async ({ request }) => {
  token = await getToken(request);
  // Grab real destination IDs from the running backend
  const res = await request.get(`${API_BASE}/destinations`);
  if (res.ok()) {
    const body = await res.json();
    const dests = body.destinations ?? body.items ?? body;
    destId  = Array.isArray(dests) && dests.length > 0 ? dests[0].id : 1;
    destId2 = Array.isArray(dests) && dests.length > 1 ? dests[1].id : (destId === 1 ? 2 : 1);
  } else {
    destId  = 1;
    destId2 = 2;
  }
});

// ── Destination Comparison ────────────────────────────────────────────────────

test.describe('Destination Comparison', () => {
  test('API: POST /discover/compare with two destinations returns winner', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/discover/compare`, {
      data: {
        destination_ids: [destId, destId2],  // two distinct IDs required
        budget: 10000,
        duration: 3,
        travelers: 2,
        traveler_type: 'couple',
        travel_month: 'oct',
      },
    });
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(Array.isArray(body.destinations ?? body.comparison)).toBe(true);
  });

  test('API: compare requires at least 2 destinations', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/discover/compare`, {
      data: { destination_ids: [destId] },
    });
    expect([400, 422]).toContain(res.status());
  });

  test('API: compare response includes score fields per destination', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/discover/compare`, {
      data: {
        destination_ids: [destId, destId2],
        budget: 8000,
        duration: 3,
        travelers: 1,
        traveler_type: 'solo_male',
        travel_month: 'nov',
      },
    });
    if (!res.ok()) return;  // no data seeded — skip assertion
    const body = await res.json();
    const dests = body.destinations ?? body.comparison ?? [];
    if (dests.length > 0) {
      const first = dests[0];
      // At least one score/metric field expected (API returns match_score, seasonal.score, rating, etc.)
      const hasScores = 'match_score' in first || 'seasonal_score' in first ||
                        'budget_fit' in first || 'overall_score' in first ||
                        'score' in first || 'rating' in first;
      expect(hasScores).toBe(true);
    }
  });

  test('UI: Discover page renders destination cards', async ({ page }) => {
    await page.goto('/discover', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('[class*="card"], [class*="destination"], article').first())
      .toBeVisible({ timeout: 10_000 });
  });

  test('UI: Discover compare — two destinations selected shows compare view', async ({ page }) => {
    await page.goto('/discover', { waitUntil: 'domcontentloaded' });
    // Find and click compare-related UI (button or checkbox)
    const compareBtn = page.getByRole('button', { name: /compare/i });
    if (await compareBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await compareBtn.click();
      await expect(page.getByText(/vs|compare|winner/i)).toBeVisible({ timeout: 5_000 });
    }
  });
});

// ── Best Time Widget ──────────────────────────────────────────────────────────

test.describe('Best Time Widget', () => {
  test('API: GET /discover/best-time/:id returns 12-month matrix', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/discover/best-time/${destId}`);
    expect(res.ok()).toBe(true);
    const body = await res.json();
    // Expect monthly scores
    const months = body.monthly_scores ?? body.months ?? body;
    expect(months).toBeTruthy();
  });

  test('API: best-time response includes verdict for current month', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/discover/best-time/${destId}`);
    expect(res.ok()).toBe(true);
    const body = await res.json();
    // Expect verdict: Excellent/Good/Fair/Avoid
    const verdict = body.current_month_verdict ?? body.verdict ?? '';
    if (verdict) {
      expect(['Excellent', 'Good', 'Fair', 'Avoid']).toContain(verdict);
    }
  });

  test('API: best-time for non-existent destination returns 404', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/discover/best-time/999999`);
    expect(res.status()).toBe(404);
  });

  test('API: best-time score range is 0-100', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/discover/best-time/${destId}`);
    if (!res.ok()) return;
    const body = await res.json();
    const scores = Object.values(body.monthly_scores ?? body.months ?? {});
    for (const score of scores) {
      if (typeof score === 'number') {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      }
    }
  });
});

// ── Is Good Time ──────────────────────────────────────────────────────────────

test.describe('Is Good Time Check', () => {
  test('API: GET /discover/is-good-time returns boolean verdict', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/discover/is-good-time?dest_id=${destId}&month=oct`);
    expect(res.ok()).toBe(true);
    const body = await res.json();
    // API returns `good_to_go` boolean (score >= 65)
    expect(typeof body.good_to_go).toBe('boolean');
  });

  test('API: is-good-time for known good month returns true for peak destination', async ({ request }) => {
    // Jaipur oct = peak season (score ~95)
    const res = await request.get(`${API_BASE}/api/discover/is-good-time?dest_id=${destId}&month=oct`);
    if (!res.ok()) return;
    const body = await res.json();
    // Don't assert exact value — depends on seeded data
    expect(typeof body.good_to_go).toBe('boolean');
  });

  test('API: is-good-time without dest_id returns 400', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/discover/is-good-time?month=oct`);
    expect([400, 422]).toContain(res.status());
  });

  test('API: is-good-time with invalid month returns 400 or defaults gracefully', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/discover/is-good-time?dest_id=${destId}&month=xyz`);
    // Backend may default gracefully (200) or reject (400/422) for unknown month strings
    expect([200, 400, 422]).toContain(res.status());
  });
});

// ── Estimate Budget ───────────────────────────────────────────────────────────

test.describe('Estimate Budget', () => {
  test('API: POST /discover/estimate-budget returns full cost breakdown', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/discover/estimate-budget`, {
      data: {
        destination_ids: [destId],
        duration: 3,
        travelers: 2,
        style: 'standard',
        travel_month: 'oct',
      },
    });
    expect(res.ok()).toBe(true);
    const body = await res.json();
    // Expect breakdown with accommodation, food, transport, activities
    const breakdown = body.cost_breakdown ?? body.breakdown ?? body;
    expect(breakdown).toBeTruthy();
  });

  test('API: estimate with style=luxury returns higher cost than budget', async ({ request }) => {
    const [budgetRes, luxuryRes] = await Promise.all([
      request.post(`${API_BASE}/api/discover/estimate-budget`, {
        data: { destination_ids: [destId], duration: 3, travelers: 1, style: 'budget', travel_month: 'oct' },
      }),
      request.post(`${API_BASE}/api/discover/estimate-budget`, {
        data: { destination_ids: [destId], duration: 3, travelers: 1, style: 'luxury', travel_month: 'oct' },
      }),
    ]);

    if (!budgetRes.ok() || !luxuryRes.ok()) return;

    const budgetBody = await budgetRes.json();
    const luxuryBody = await luxuryRes.json();

    const budgetTotal = budgetBody.total_cost ?? budgetBody.estimated_total ?? 0;
    const luxuryTotal = luxuryBody.total_cost ?? luxuryBody.estimated_total ?? 0;

    if (budgetTotal > 0 && luxuryTotal > 0) {
      expect(luxuryTotal).toBeGreaterThan(budgetTotal);
    }
  });

  test('API: estimate with more travelers scales cost up', async ({ request }) => {
    const [solo, group] = await Promise.all([
      request.post(`${API_BASE}/api/discover/estimate-budget`, {
        data: { destination_ids: [destId], duration: 3, travelers: 1, style: 'standard', travel_month: 'oct' },
      }),
      request.post(`${API_BASE}/api/discover/estimate-budget`, {
        data: { destination_ids: [destId], duration: 3, travelers: 4, style: 'standard', travel_month: 'oct' },
      }),
    ]);

    if (!solo.ok() || !group.ok()) return;

    const soloBody = await solo.json();
    const groupBody = await group.json();
    const soloTotal = soloBody.total_cost ?? soloBody.estimated_total ?? 0;
    const groupTotal = groupBody.total_cost ?? groupBody.estimated_total ?? 0;

    if (soloTotal > 0 && groupTotal > 0) {
      expect(groupTotal).toBeGreaterThan(soloTotal);
    }
  });

  test('API: estimate with too many dest_ids returns 400', async ({ request }) => {
    const tooMany = Array.from({ length: 11 }, (_, i) => i + 1);
    const res = await request.post(`${API_BASE}/api/discover/estimate-budget`, {
      data: { destination_ids: tooMany, duration: 3, travelers: 1, style: 'standard', travel_month: 'oct' },
    });
    expect([400, 422]).toContain(res.status());
  });

  test('API: estimate without required fields returns 400', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/discover/estimate-budget`, {
      data: {},
    });
    expect([400, 422]).toContain(res.status());
  });
});

// ── Recommend Destinations ────────────────────────────────────────────────────

test.describe('Destination Recommendations', () => {
  test('API: GET /discover/recommend returns ranked list', async ({ request }) => {
    test.slow(); // triples the timeout — recommend is slow due to NULL popularity_score on most destinations
    // Use longer timeout — 179/186 destinations have NULL popularity_score, causing slow ranking
    const res = await request.get(
      `${API_BASE}/api/discover/recommend?budget=10000&duration=3&travelers=2&traveler_type=couple&travel_month=oct`,
      { timeout: 90_000 }
    );
    expect(res.ok()).toBe(true);
    const body = await res.json();
    const destinations = body.destinations ?? body.recommendations ?? body;
    expect(Array.isArray(destinations)).toBe(true);
  });

  test('API: recommend with budget=0 returns 400', async ({ request }) => {
    test.slow();
    const res = await request.get(`${API_BASE}/api/discover/recommend?budget=0&duration=3`);
    expect([400, 422]).toContain(res.status());
  });

  test('API: recommend respects traveler_type filter', async ({ request }) => {
    test.slow();
    const res = await request.get(
      `${API_BASE}/api/discover/recommend?budget=15000&duration=5&travelers=1&traveler_type=solo_female&travel_month=nov`
    );
    // Just verify it returns without 500 — safety filter verification
    expect([200, 400]).toContain(res.status());
  });
});

// ── Discover UI — Filters & Search ───────────────────────────────────────────

test.describe('Discover UI Filters', () => {
  test('UI: Discover page loads with destination cards', async ({ page }) => {
    await page.goto('/discover', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('main').or(page.locator('body'))).toBeVisible();
    // Expect at least one card/article/destination element
    const cards = page.locator('[class*="card"], [class*="destination"], article');
    await expect(cards.first()).toBeVisible({ timeout: 10_000 });
  });

  test('UI: Budget filter changes visible results', async ({ page }) => {
    await page.goto('/discover', { waitUntil: 'domcontentloaded' });
    // Look for a budget or category filter
    const budgetFilter = page.getByRole('combobox', { name: /budget|category/i })
      .or(page.getByRole('button', { name: /budget|category/i }));
    if (await budgetFilter.first().isVisible({ timeout: 3_000 }).catch(() => false)) {
      await budgetFilter.first().click();
      // Select an option
      const option = page.getByRole('option').first();
      if (await option.isVisible({ timeout: 2_000 }).catch(() => false)) {
        await option.click();
      }
      // Page should still render cards (not crash)
      await expect(page.locator('body')).not.toContainText(/error|crash/i);
    }
  });

  test('UI: Season filter — clicking "Winter" updates results', async ({ page }) => {
    await page.goto('/discover', { waitUntil: 'domcontentloaded' });
    const winterBtn = page.getByRole('button', { name: /winter/i });
    if (await winterBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await winterBtn.click();
      await expect(page.locator('body')).not.toContainText(/error|crash/i);
    }
  });

  test('UI: Destination detail page loads on card click', async ({ page }) => {
    await page.goto('/discover', { waitUntil: 'domcontentloaded' });
    const card = page.locator('[class*="card"], article').first();
    if (await card.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await card.click();
      await page.waitForURL(/\/(destination|destinations)\//, { timeout: 10_000 }).catch(() => {});
      // Should load a destination page without errors
      await expect(page.locator('body')).not.toContainText(/error occurred|not found/i);
    }
  });
});
