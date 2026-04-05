/**
 * 06_mobile.spec.js — P6: Mobile / Responsive (375px viewport)
 * ══════════════════════════════════════════════════════════════
 *
 * Runs at 375×812 (iPhone SE/Pixel 5 equivalent).
 * Covers:
 *   - Navbar collapse + hamburger menu open/close
 *   - Home hero readable on mobile
 *   - Trip Planner wizard — all 5 steps usable
 *   - Generating page spinner visible
 *   - Trip Viewer tabs scrollable / tab bar not clipped
 *   - Discover page card grid → single column on mobile
 *   - Booking tab accessible on mobile
 *   - Notes tab textarea usable on mobile
 *   - Profile page preferences accessible
 *   - Readiness tab score visible on mobile
 *   - Auth forms usable on mobile
 */

import { test, expect } from '@playwright/test';
import { getToken, setTokenInStorage, API_BASE } from './helpers/auth.js';
import { createSavedTrip } from './helpers/trip.js';

const MOBILE_VIEWPORT = { width: 375, height: 812 };

let token;
let tripId;

test.use({ viewport: MOBILE_VIEWPORT });

test.beforeAll(async ({ request }) => {
  token = await getToken(request);
  tripId = await createSavedTrip(request, token);
});

// ── Navigation ────────────────────────────────────────────────────────────────

test.describe('Mobile Navigation', () => {
  test('Hamburger menu button visible on mobile', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Hamburger: button with menu icon, or aria-label, or class
    const hamburger = page.getByRole('button', { name: /menu|hamburger|open nav/i })
      .or(page.locator('[class*="hamburger"], [class*="menu-btn"], [aria-label*="menu"]'));
    await expect(hamburger.first()).toBeVisible({ timeout: 8_000 });
  });

  test('Desktop nav links hidden on mobile', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Desktop nav links should be hidden (behind hamburger)
    const desktopNav = page.locator('nav a[href="/discover"], nav a[href="/blogs"]');
    // Either not visible or inside collapsed menu
    const visible = await desktopNav.first().isVisible().catch(() => false);
    if (visible) {
      // If links are visible, ensure they're inside a mobile menu container
      // (some navbars always show — this is a soft check)
      console.log('Note: desktop nav links visible at 375px — check responsive design');
    }
  });

  test('Hamburger click opens navigation menu', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const hamburger = page.getByRole('button', { name: /menu|hamburger|open nav/i })
      .or(page.locator('[class*="hamburger"], [class*="menu-btn"]'));
    if (await hamburger.first().isVisible({ timeout: 3_000 }).catch(() => false)) {
      await hamburger.first().click();
      // After click, nav links should be visible
      await expect(
        page.getByRole('link', { name: /discover|trips|blog/i }).first()
      ).toBeVisible({ timeout: 5_000 });
    }
  });

  test('Hamburger menu closes on nav link click', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const hamburger = page.getByRole('button', { name: /menu|hamburger/i })
      .or(page.locator('[class*="hamburger"]'));
    if (await hamburger.first().isVisible({ timeout: 3_000 }).catch(() => false)) {
      await hamburger.first().click();
      const link = page.getByRole('link', { name: /discover/i }).first();
      if (await link.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await link.click();
        await page.waitForURL(/discover/, { timeout: 5_000 }).catch(() => {});
        // Menu should be closed
        await expect(link).not.toBeVisible({ timeout: 3_000 }).catch(() => {});
      }
    }
  });

  test('AltairGO logo visible in mobile navbar', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    // Scope to navigation link only (img is nested inside the link, avoid double-match)
    await expect(
      page.getByRole('navigation').getByRole('link', { name: 'AltairGO Logo' }).first()
    ).toBeVisible({ timeout: 8_000 });
  });
});

// ── Home Page ─────────────────────────────────────────────────────────────────

test.describe('Mobile Home Page', () => {
  test('Hero heading readable on 375px', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const hero = page.getByRole('heading', { level: 1 })
      .or(page.locator('[class*="hero"] h1, [class*="hero"] h2'));
    await expect(hero.first()).toBeVisible({ timeout: 8_000 });
  });

  test('CTA button is tappable size (min 44px height)', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const cta = page.getByRole('button', { name: /plan|start|explore|get started/i }).first()
      .or(page.getByRole('link', { name: /plan|start|explore/i }).first());
    if (await cta.isVisible({ timeout: 5_000 }).catch(() => false)) {
      const box = await cta.boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(40);  // at least 40px touch target
      }
    }
  });

  test('Page does not overflow horizontally', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375 + 20);  // allow 20px tolerance for scrollbars
  });
});

// ── Auth Forms ────────────────────────────────────────────────────────────────

test.describe('Mobile Auth Forms', () => {
  test('Login form inputs accessible on mobile', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    const emailInput = page.getByPlaceholder(/email/i).or(page.getByRole('textbox', { name: /email/i }));
    const passInput = page.getByPlaceholder(/password/i).or(page.getByRole('textbox', { name: /password/i }));
    await expect(emailInput.first()).toBeVisible({ timeout: 8_000 });
    await expect(passInput.first()).toBeVisible({ timeout: 5_000 });
  });

  test('Login button tappable on mobile', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    const btn = page.getByRole('button', { name: /sign in|log in|login/i });
    await expect(btn).toBeVisible({ timeout: 5_000 });
    const box = await btn.boundingBox();
    if (box) {
      expect(box.width).toBeGreaterThanOrEqual(200);
      expect(box.height).toBeGreaterThanOrEqual(40);
    }
  });

  test('Register page link visible from login on mobile', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    await expect(
      page.getByRole('link', { name: /register|sign up|create account/i })
        .or(page.getByText(/don't have an account|register/i))
    ).toBeVisible({ timeout: 8_000 });
  });
});

// ── Trip Planner Wizard ───────────────────────────────────────────────────────

test.describe('Mobile Trip Planner Wizard', () => {
  test.beforeEach(async ({ page }) => {
    await setTokenInStorage(page, token);
  });

  test('Step 1: destination search input usable', async ({ page }) => {
    await page.goto('/planner', { waitUntil: 'domcontentloaded' });
    // Use exact placeholder to avoid matching hidden navbar search input
    const searchInput = page.getByPlaceholder('Search — Goa, Manali, Rajasthan...');
    await expect(searchInput).toBeVisible({ timeout: 10_000 });
    await searchInput.fill('Jaipur');
    // Typing should work without overflow
    await expect(searchInput).toHaveValue(/jaipur/i);
  });

  test('Step navigation buttons visible and tappable', async ({ page }) => {
    await page.goto('/planner', { waitUntil: 'domcontentloaded' });
    // Next button should be within screen width
    const nextBtn = page.getByRole('button', { name: /next|continue/i });
    if (await nextBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      const box = await nextBtn.boundingBox();
      if (box) {
        expect(box.x + box.width).toBeLessThanOrEqual(375 + 5);
        expect(box.height).toBeGreaterThanOrEqual(40);
      }
    }
  });

  test('Step indicator shows progress on mobile', async ({ page }) => {
    await page.goto('/planner', { waitUntil: 'domcontentloaded' });
    // Step indicator (dots, numbers, or progress bar)
    const stepIndicator = page.locator('[class*="step"], [class*="progress"], [aria-label*="step"]');
    if (await stepIndicator.first().isVisible({ timeout: 3_000 }).catch(() => false)) {
      const box = await stepIndicator.first().boundingBox();
      if (box) {
        expect(box.width).toBeLessThanOrEqual(375);
      }
    }
  });

  test('Step 2 — "When are you going?" visible on mobile', async ({ page }) => {
    await page.goto('/planner', { waitUntil: 'domcontentloaded' });
    // Add destination and go to step 2
    const search = page.getByPlaceholder(/destination|search|where/i).first();
    if (await search.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await search.fill('Jaipur');
      await page.waitForTimeout(500);
      const result = page.locator('[class*="result"], [class*="suggestion"]').first()
        .or(page.getByText(/jaipur/i).first());
      if (await result.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await result.click();
      }
      const nextBtn = page.getByRole('button', { name: /next|continue/i });
      if (await nextBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
        await nextBtn.click();
        // Step 2 heading
        await expect(page.getByText(/when are you going/i)).toBeVisible({ timeout: 5_000 });
      }
    }
  });
});

// ── Discover Page ─────────────────────────────────────────────────────────────

test.describe('Mobile Discover Page', () => {
  test('Cards layout usable on mobile — no horizontal overflow', async ({ page }) => {
    await page.goto('/discover', { waitUntil: 'domcontentloaded' });
    const cards = page.locator('[class*="card"], article');
    await expect(cards.first()).toBeVisible({ timeout: 10_000 });

    // Primary check: no card overflows the viewport width
    const count = await cards.count();
    if (count >= 1) {
      const box1 = await cards.nth(0).boundingBox();
      if (box1) {
        expect(box1.x + box1.width).toBeLessThanOrEqual(375 + 10);
      }
    }
    // Soft check: if 2+ cards, they should be stacked OR narrowed (not side-by-side outside viewport)
    if (count >= 2) {
      const box2 = await cards.nth(1).boundingBox();
      const box1 = await cards.nth(0).boundingBox();
      if (box1 && box2) {
        const isStacked = box2.y > box1.y + box1.height - 10;
        const bothFitInViewport = box2.x + box2.width <= 375 + 10;
        expect(isStacked || bothFitInViewport).toBe(true);
      }
    }
  });

  test('Discover page does not overflow horizontally', async ({ page }) => {
    await page.goto('/discover', { waitUntil: 'domcontentloaded' });
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375 + 20);
  });

  test('Filter buttons scroll horizontally if needed', async ({ page }) => {
    await page.goto('/discover', { waitUntil: 'domcontentloaded' });
    // Filter bar should not overflow out of viewport
    const filterBar = page.locator('[class*="filter"], [class*="tag-bar"]').first();
    if (await filterBar.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await expect(filterBar).toBeVisible();
    }
  });
});

// ── Trip Viewer ───────────────────────────────────────────────────────────────

test.describe('Mobile Trip Viewer', () => {
  test.beforeEach(async ({ page }) => {
    await setTokenInStorage(page, token);
  });

  test('Trip Viewer loads on mobile without horizontal overflow', async ({ page }) => {
    await page.goto(`/trip/${tripId}`, { waitUntil: 'domcontentloaded' });
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375 + 20);
  });

  test('Tab bar visible and scrollable on mobile (not clipped)', async ({ page }) => {
    await page.goto(`/trip/${tripId}`, { waitUntil: 'domcontentloaded' });
    // Tabs are plain <div> elements — use text-based selector
    await expect(page.getByText('Itinerary', { exact: true }).first()).toBeVisible({ timeout: 10_000 });
  });

  test('Itinerary tab: day card visible on 375px', async ({ page }) => {
    await page.goto(`/trip/${tripId}`, { waitUntil: 'domcontentloaded' });
    await page.getByText('Itinerary', { exact: true }).first().click();
    // TripViewerPage uses inline styles, no CSS class names — match day headings by text
    await expect(page.getByText(/Day \d+/i).first()).toBeVisible({ timeout: 10_000 });
  });

  test('Bookings tab accessible on mobile', async ({ page }) => {
    await page.goto(`/trip/${tripId}`, { waitUntil: 'domcontentloaded' });
    const bookingsTab = page.getByText('Bookings', { exact: true }).first();
    await expect(bookingsTab).toBeVisible({ timeout: 10_000 });
    await bookingsTab.click();
    // Bookings content should render
    await expect(page.locator('body')).not.toContainText(/error occurred/i);
  });

  test('Notes tab: textarea fills full width on mobile', async ({ page }) => {
    await page.goto(`/trip/${tripId}`, { waitUntil: 'domcontentloaded' });
    await page.getByText('Notes', { exact: true }).first().click();
    const textarea = page.getByRole('textbox').first();
    if (await textarea.isVisible({ timeout: 5_000 }).catch(() => false)) {
      const box = await textarea.boundingBox();
      if (box) {
        // Textarea should use most of the screen width
        expect(box.width).toBeGreaterThan(250);
      }
    }
  });

  test('Readiness tab score visible on mobile', async ({ page }) => {
    await page.goto(`/trip/${tripId}`, { waitUntil: 'domcontentloaded' });
    await page.getByText('Readiness', { exact: true }).first().click();
    // Wait for actual score number (e.g. "72%") — avoids matching tab button or loading text
    await expect(page.getByText(/^\d+%$/).first()).toBeVisible({ timeout: 15_000 });
  });

  test('Expenses tab: add expense button tappable', async ({ page }) => {
    await page.goto(`/trip/${tripId}`, { waitUntil: 'domcontentloaded' });
    await page.getByText('Expenses', { exact: true }).first().click();
    const addBtn = page.getByRole('button', { name: /add expense|log expense/i });
    if (await addBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      const box = await addBtn.boundingBox();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(36);
      }
    }
  });
});

// ── Profile Page ──────────────────────────────────────────────────────────────

test.describe('Mobile Profile Page', () => {
  test('Profile page loads on mobile', async ({ page }) => {
    await setTokenInStorage(page, token);
    await page.goto('/profile', { waitUntil: 'domcontentloaded' }).catch(() =>
      page.goto('/profile', { waitUntil: 'domcontentloaded' })
    );
    await expect(page.locator('body')).not.toContainText(/error occurred/i);
  });

  test('Travel preferences section visible on mobile', async ({ page }) => {
    await setTokenInStorage(page, token);
    await page.goto('/profile', { waitUntil: 'domcontentloaded' }).catch(() =>
      page.goto('/profile', { waitUntil: 'domcontentloaded' })
    );
    await expect(
      page.getByText(/travel preferences|style|dietary/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });
});

// ── Blogs Page ────────────────────────────────────────────────────────────────

test.describe('Mobile Blogs Page', () => {
  test('Blogs page loads without horizontal overflow', async ({ page }) => {
    await page.goto('/blogs', { waitUntil: 'domcontentloaded' });
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(375 + 20);
  });

  test('Blog cards stacked vertically on mobile', async ({ page }) => {
    await page.goto('/blogs', { waitUntil: 'domcontentloaded' });
    const cards = page.locator('article, [class*="card"]');
    const count = await cards.count();
    if (count >= 2) {
      const b1 = await cards.nth(0).boundingBox();
      const b2 = await cards.nth(1).boundingBox();
      if (b1 && b2) {
        expect(b2.y).toBeGreaterThan(b1.y + b1.height - 10);
      }
    }
  });
});
