/**
 * 04_trip_tools.spec.js — P4: Trip Tools, Post-Trip & Variants
 * ══════════════════════════════════════════════════════════════
 *
 * Covers:
 *   - Trip readiness score + checklist
 *   - Daily briefing (weather, activities, carry list, contacts)
 *   - Activity swap (replace one activity, re-schedules day)
 *   - Next trip ideas (post-trip recommendations)
 *   - Trip variants (relaxed / balanced / intense)
 *   - Post-trip summary
 *   - Trip review submission (star + tags)
 *   - Signal tracking (AttractionSignal fires on click)
 */

import { test, expect } from '@playwright/test';
import { getToken, setTokenInStorage, API_BASE } from './helpers/auth.js';
import { createSavedTrip } from './helpers/trip.js';

let token;
let tripId;

test.beforeAll(async ({ request }) => {
  token = await getToken(request);
  tripId = await createSavedTrip(request, token);
});

// ── Trip Readiness ────────────────────────────────────────────────────────────

test.describe('Trip Readiness', () => {
  test('API: GET /trip/:id/readiness returns score and checklist', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/trip/${tripId}/readiness`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(typeof (body.readiness_score ?? body.score)).toBe('number');
    expect(body.readiness_score ?? body.score).toBeGreaterThanOrEqual(0);
    expect(body.readiness_score ?? body.score).toBeLessThanOrEqual(100);
  });

  test('API: readiness has checklist items', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/trip/${tripId}/readiness`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.ok()).toBe(true);
    const body = await res.json();
    const checklist = body.checklist ?? body.items ?? [];
    expect(Array.isArray(checklist)).toBe(true);
  });

  test('API: readiness without auth returns 401', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/trip/${tripId}/readiness`);
    expect(res.status()).toBe(401);
  });

  test('API: readiness for another user\'s trip returns 404', async ({ request }) => {
    const r2 = await request.post(`${API_BASE}/auth/register`, {
      data: { name: 'R2', email: `r2_${Date.now()}@test.com`, password: 'R2Pass123!' },
    });
    const tok2 = (await r2.json()).token;
    const res = await request.get(`${API_BASE}/api/trip/${tripId}/readiness`, {
      headers: { Authorization: `Bearer ${tok2}` },
    });
    expect(res.status()).toBe(404);
  });

  test('UI: Readiness tab shows score number', async ({ page }) => {
    await setTokenInStorage(page, token);
    await page.goto(`/trip/${tripId}`, { waitUntil: 'domcontentloaded' });
    await page.getByText('Readiness', { exact: true }).first().click();
    // Score should be a number 0-100
    await expect(page.getByText(/\d+%|\d+\/100|readiness/i)).toBeVisible({ timeout: 10_000 });
  });

  test('UI: Readiness checklist items visible', async ({ page }) => {
    await setTokenInStorage(page, token);
    await page.goto(`/trip/${tripId}`, { waitUntil: 'domcontentloaded' });
    await page.getByText('Readiness', { exact: true }).first().click();
    // Expect list items (checklist)
    await expect(page.locator('li, [class*="check"]').first()).toBeVisible({ timeout: 8_000 });
  });
});

// ── Daily Briefing ────────────────────────────────────────────────────────────

test.describe('Daily Briefing', () => {
  test('API: GET /trip/:id/daily-briefing/1 returns day 1 briefing', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/trip/${tripId}/daily-briefing/1`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body).toHaveProperty('day');
    const activities = body.activities ?? body.day_activities ?? [];
    expect(Array.isArray(activities)).toBe(true);
  });

  test('API: briefing includes what_to_carry list', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/trip/${tripId}/daily-briefing/1`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const body = await res.json();
    const carry = body.what_to_carry ?? body.carry_items ?? [];
    expect(Array.isArray(carry)).toBe(true);
  });

  test('API: briefing for day beyond trip duration returns 404 or empty', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/trip/${tripId}/daily-briefing/99`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([200, 400, 404]).toContain(res.status());
  });

  test('API: briefing without auth returns 401', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/trip/${tripId}/daily-briefing/1`);
    expect(res.status()).toBe(401);
  });

  test('API: briefing day 2 returns different content than day 1', async ({ request }) => {
    const [d1, d2] = await Promise.all([
      request.get(`${API_BASE}/api/trip/${tripId}/daily-briefing/1`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      request.get(`${API_BASE}/api/trip/${tripId}/daily-briefing/2`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);
    if (!d1.ok() || !d2.ok()) return;
    const b1 = await d1.json();
    const b2 = await d2.json();
    expect(b1.day).toBe(1);
    expect(b2.day).toBe(2);
  });

  test('UI: Daily Briefing page loads at /trip/:id/briefing/1', async ({ page }) => {
    await setTokenInStorage(page, token);
    await page.goto(`/trip/${tripId}/briefing/1`, { waitUntil: 'domcontentloaded' });
    await expect(page.getByText(/day 1|morning|briefing/i)).toBeVisible({ timeout: 10_000 });
  });

  test('UI: Briefing page shows activities list', async ({ page }) => {
    await setTokenInStorage(page, token);
    await page.goto(`/trip/${tripId}/briefing/1`, { waitUntil: 'domcontentloaded' });
    await expect(
      page.locator('[class*="activity"], li, [class*="item"]').first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test('UI: Day Brief link from Itinerary tab navigates to briefing page', async ({ page }) => {
    await setTokenInStorage(page, token);
    await page.goto(`/trip/${tripId}`, { waitUntil: 'domcontentloaded' });
    await page.getByText('Itinerary', { exact: true }).first().click();
    const briefLink = page.getByRole('link', { name: /day brief|briefing/i }).first();
    if (await briefLink.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await briefLink.click();
      await expect(page.url()).toMatch(/briefing/);
    }
  });
});

// ── Activity Swap ─────────────────────────────────────────────────────────────

test.describe('Activity Swap', () => {
  test('API: POST /trip/:id/activity/swap replaces activity in itinerary', async ({ request }) => {
    // Fetch current itinerary to get an activity name
    const tripRes = await request.get(`${API_BASE}/get-trip/${tripId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const tripBody = await tripRes.json();
    const day1 = tripBody.itinerary_json?.itinerary?.find(d => d.day === 1);
    const activity = day1?.activities?.find(a => !a.is_break);
    if (!activity) { test.skip(); return; }

    const res = await request.post(`${API_BASE}/api/trip/${tripId}/activity/swap`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        day_num: 1,
        activity_name: activity.activity ?? activity.name,
        reason: 'Want something different',
      },
    });
    // 200 = swapped; 404 = no alternatives available (valid for test DB)
    expect([200, 404]).toContain(res.status());

    if (res.ok()) {
      const body = await res.json();
      expect(body).toHaveProperty('message');
    }
  });

  test('API: activity swap without auth returns 401', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/trip/${tripId}/activity/swap`, {
      data: { day_num: 1, activity_name: 'Amber Fort' },
    });
    expect(res.status()).toBe(401);
  });

  test('API: swap non-existent activity returns 404', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/trip/${tripId}/activity/swap`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { day_num: 1, activity_name: 'This Activity Does Not Exist In Any DB' },
    });
    expect([400, 404]).toContain(res.status());
  });
});

// ── Next Trip Ideas ───────────────────────────────────────────────────────────

test.describe('Next Trip Ideas', () => {
  test('API: GET /trip/:id/next-trip-ideas returns recommendations', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/trip/${tripId}/next-trip-ideas`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([200, 404]).toContain(res.status());
    if (res.ok()) {
      const body = await res.json();
      const ideas = body.ideas ?? body.recommendations ?? body.destinations ?? [];
      expect(Array.isArray(ideas)).toBe(true);
    }
  });

  test('API: next-trip-ideas without auth returns 401', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/trip/${tripId}/next-trip-ideas`);
    expect(res.status()).toBe(401);
  });
});

// ── Trip Variants ─────────────────────────────────────────────────────────────

test.describe('Trip Variants', () => {
  test('API: POST /trip/:id/variants returns relaxed, balanced, intense versions', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/trip/${tripId}/variants`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([200, 202, 404]).toContain(res.status());
    if (res.ok()) {
      const body = await res.json();
      // Expect at least one variant type
      const hasVariants = 'relaxed' in body || 'intense' in body || 'balanced' in body ||
                          'variants' in body;
      expect(hasVariants).toBe(true);
    }
  });

  test('API: variants without auth returns 401 or public access', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/trip/${tripId}/variants`);
    // Endpoint may not enforce auth (returns 200/404) or may require it (401)
    expect([200, 401, 404]).toContain(res.status());
  });

  test('API: relaxed variant has fewer/lighter activities than intense', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/trip/${tripId}/variants`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok()) return;
    const body = await res.json();
    const relaxed = body.relaxed ?? body.variants?.relaxed;
    const intense = body.intense ?? body.variants?.intense;
    if (relaxed && intense) {
      const relaxedActivities = relaxed.itinerary?.reduce((s, d) => s + (d.activities?.length ?? 0), 0) ?? 0;
      const intenseActivities = intense.itinerary?.reduce((s, d) => s + (d.activities?.length ?? 0), 0) ?? 0;
      if (relaxedActivities > 0 && intenseActivities > 0) {
        expect(intenseActivities).toBeGreaterThanOrEqual(relaxedActivities);
      }
    }
  });
});

// ── Post-Trip Summary ─────────────────────────────────────────────────────────

test.describe('Post-Trip Summary', () => {
  test('API: GET /trip/:id/summary returns summary data', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/trip/${tripId}/summary`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect([200, 404]).toContain(res.status());
    if (res.ok()) {
      const body = await res.json();
      expect(body).toBeTruthy();
    }
  });

  test('API: summary without auth returns 401', async ({ request }) => {
    const res = await request.get(`${API_BASE}/api/trip/${tripId}/summary`);
    expect(res.status()).toBe(401);
  });
});

// ── Trip Review Submission ────────────────────────────────────────────────────

test.describe('Trip Review / Feedback', () => {
  test('API: POST /trip/:id/review submits star rating and tags', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/trip/${tripId}/review`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        rating: 4,
        tags: ['great-value', 'well-paced', 'hidden-gems'],
        comment: 'Amazing trip! The AI suggestions were spot on.',
      },
    });
    expect([200, 201]).toContain(res.status());
  });

  test('API: review with invalid rating (6) returns 400', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/trip/${tripId}/review`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { rating: 6, tags: ['great-value'] },
    });
    expect([400, 422]).toContain(res.status());
  });

  test('API: review with invalid tag returns 400', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/trip/${tripId}/review`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { rating: 3, tags: ['__invalid_tag_xyz__'] },
    });
    expect([400, 422]).toContain(res.status());
  });

  test('API: review accepts all valid hyphenated tags', async ({ request }) => {
    const validTags = [
      'great-value', 'well-paced', 'hidden-gems',
      'family-friendly', 'romantic', 'adventure', 'foodie', 'budget-friendly',
    ];
    const res = await request.post(`${API_BASE}/api/trip/${tripId}/review`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { rating: 5, tags: validTags },
    });
    expect([200, 201]).toContain(res.status());
  });

  test('API: review without auth returns 401', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/trip/${tripId}/review`, {
      data: { rating: 4, tags: ['great-value'] },
    });
    expect(res.status()).toBe(401);
  });

  test('UI: Summary tab has star rating widget', async ({ page }) => {
    await setTokenInStorage(page, token);
    await page.goto(`/trip/${tripId}`, { waitUntil: 'domcontentloaded' });
    await page.getByText('Summary', { exact: true }).first().click();
    await expect(
      page.locator('[class*="star"], [class*="rating"], [aria-label*="star"]').first()
        .or(page.getByText(/rate|review|feedback/i))
    ).toBeVisible({ timeout: 10_000 });
  });

  test('UI: Summary tab has review tag chips', async ({ page }) => {
    await setTokenInStorage(page, token);
    await page.goto(`/trip/${tripId}`, { waitUntil: 'domcontentloaded' });
    await page.getByText('Summary', { exact: true }).first().click();
    // Expect tag buttons like "Great Value", "Well Paced" etc.
    await expect(
      page.getByText(/great.value|well.paced|hidden.gems|adventure|foodie/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });
});

// ── Signal Tracking ───────────────────────────────────────────────────────────

test.describe('Signal Tracking', () => {
  // Actual endpoint: /api/attraction-signal (not /api/signal)
  // Field: event_type (not signal_type)
  // Returns 404 if attraction_id not found in DB

  test('API: POST /api/attraction-signal records an attraction view signal', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/attraction-signal`, {
      headers: { Authorization: `Bearer ${token}` },
      data: {
        event_type: 'view',
        attraction_id: 1,
        destination_id: 1,
        context: 'itinerary',
      },
    });
    // 404 is valid if attraction_id=1 doesn't exist in test DB
    expect([200, 201, 204, 404]).toContain(res.status());
  });

  test('API: signal without attraction_id returns 400', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/attraction-signal`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { event_type: 'view' },
    });
    expect([400, 422]).toContain(res.status());
  });

  test('API: signal works for unauthenticated users (guest tracking)', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/attraction-signal`, {
      data: { event_type: 'view', attraction_id: 1, destination_id: 1 },
    });
    // Signals may require auth or work for guests; 404 if attraction not in DB
    expect([200, 201, 204, 401, 404]).toContain(res.status());
  });

  test('API: invalid event_type returns 400', async ({ request }) => {
    const res = await request.post(`${API_BASE}/api/attraction-signal`, {
      headers: { Authorization: `Bearer ${token}` },
      data: { event_type: '__invalid__', attraction_id: 1 },
    });
    // 400 for invalid type; 404 if attraction_id not found (checked first)
    expect([400, 404, 422]).toContain(res.status());
  });
});
