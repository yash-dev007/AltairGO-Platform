# AltairGO — Playwright MCP Debug Phases

> Use these phases with the Playwright MCP browser tools (headed Chrome).
> Prerequisites: backend on :5000, frontend on :5173, Redis running.
> Test user: testreviewer@altairgo.com / TestReviewer123!
> Admin key: test-admin-key-2026

---

## Setup: Auth State

Before any phase, inject the token via localStorage so pages load logged in:

```
1. Navigate to http://localhost:5173/login
2. Fill email: testreviewer@altairgo.com
3. Fill password: TestReviewer123!
4. Click "Sign In"
5. Verify redirect to /dashboard
```

---

## Phase 1 — P1: Booking Flow (Critical)
**File:** `tests/01_booking_flow.spec.js`

### 1a. Create Booking Plan
```
1. Navigate to http://localhost:5173/trips
2. Click any saved trip card
3. Click "Bookings" tab
4. Verify "Create Plan" button OR existing plan items shown
5. Click "Create Plan" → wait for items to load (up to 15s)
6. Screenshot: booking items list with flight, hotel, activities
```

### 1b. Approve / Reject
```
1. On the Bookings tab with plan loaded
2. Click "Approve" on first item → verify status badge changes
3. Click "Reject" on second item → verify status badge changes
4. Screenshot: mixed approved/rejected state
```

### 1c. Execute All
```
1. Approve all remaining items
2. Click "Execute All" / "Book All" button
3. Wait for booking refs to appear (simulated, instant)
4. Screenshot: all items showing "booked" + booking_ref codes
```

### 1d. Cancel
```
1. Click cancel on any booked item
2. Verify item shows "cancelled" status
3. Re-cancel same item → verify idempotent (no error)
```

**What to watch for:**
- Plan creation spinner stuck → backend timeout
- Approve buttons not visible → wrong tab or auth issue
- Execute All not appearing → no approved items in state

---

## Phase 2 — P2: Trip Editor
**File:** `tests/02_trip_editor.spec.js`

### 2a. Hotel Swap
```
1. Open any trip → "Itinerary" or "Edit" tab
2. Find hotel section for Day 1
3. Click "Change Hotel" / "Hotel Options"
4. Verify hotel list loads (may be empty if no HotelPrice rows)
5. Try custom hotel entry: name="Test Hotel", cost=2500
6. Save → verify hotel name updated in itinerary
```

### 2b. Add / Remove Activity
```
1. In trip editor, Day 1
2. Click "Add Activity"
3. Fill: name="Test Activity", cost=500, time="10:00"
4. Save → verify activity appears in day list
5. Click delete/remove on the activity
6. Verify it disappears
```

### 2c. Edit Activity
```
1. Click edit on an existing activity
2. Change cost value
3. Save → verify new cost shown
4. Verify is_customized flag (check via API: GET /api/trip/:id)
```

### 2d. Notes
```
1. Find "Trip Notes" or "Day Notes" input
2. Type a note, save
3. Reload page → verify note persists
```

**What to watch for:**
- Hotel options 422 → destination name not resolving from itinerary JSON
- Activity proxy error → check trip_editor.py Proxy shim

---

## Phase 3 — P3: Discover
**File:** `tests/03_discover.spec.js`

### 3a. Compare Destinations
```
1. Navigate to http://localhost:5173/discover
2. Select 2 destinations via checkboxes / compare toggle
3. Click "Compare" → verify side-by-side card
4. Screenshot: comparison view
```

### 3b. Best Time Widget
```
1. On a destination card, find "Best Time" section
2. Verify months shown (not blank)
3. Click "Is this a good time?" for current month
4. Verify thumbs up/down response
```

### 3c. Budget Estimate
```
1. Click "Estimate Budget" on any destination
2. Fill travelers=2, duration=3 days
3. Submit → verify cost breakdown shown
```

**What to watch for:**
- Discover page blank → destinations not seeded / API error
- Budget estimate 422 → HotelPrice rows missing for that destination

---

## Phase 4 — P4: Trip Tools
**File:** `tests/04_trip_tools.spec.js`

### 4a. Readiness Check
```
1. Open a saved trip → Tools / Smart tab
2. Click "Check Readiness" or "Trip Readiness"
3. Verify readiness score + checklist items appear
```

### 4b. Daily Briefing
```
1. Click "Daily Briefing" for Day 1
2. Verify weather, crowd level, top activities shown
```

### 4c. Activity Swap
```
1. On an activity, click "Suggest Alternative"
2. Verify AI returns 1-3 swap options
3. Click "Use This" on one option → verify itinerary updated
```

### 4d. Post-Trip Summary
```
1. On a past/completed trip, click "Generate Summary"
2. Verify summary text appears (Gemini/Ollama powered)
```

### 4e. Submit Review
```
1. Navigate to trip → Reviews tab
2. Select tags: great-value, well-paced
3. Submit → verify success toast
4. Re-submit same trip → verify no duplicate
```

**What to watch for:**
- AI tools returning empty → Gemini quota hit, check Ollama fallback
- Tags rejected → backend `_VALID_TAGS` list mismatch

---

## Phase 5 — P5: Admin Panel
**File:** `tests/05_admin.spec.js`

### 5a. Admin Login
```
1. Navigate to http://localhost:5173/admin
2. Enter key: test-admin-key-2026
3. Verify admin dashboard loads with stats
```

### 5b. Destinations Management
```
1. Admin → Destinations tab
2. Verify list loads (186 expected)
3. Click a destination → verify edit form
4. Submit a destination request approval
```

### 5c. Feature Flags
```
1. Admin → Feature Flags
2. Toggle a flag on/off
3. Verify change reflected in GET /api/admin/feature-flags
```

### 5d. Engine Settings
```
1. Admin → Engine Settings
2. Change THEME_THRESHOLD value
3. Save → verify new value persists (GET /api/admin/engine-settings)
```

### 5e. Blog CRUD
```
1. Admin → Blogs
2. Create a new blog post (title + content)
3. Verify it appears in list
4. Edit → update title → verify change
5. Delete → verify removed
```

**What to watch for:**
- Admin key rejected → ADMIN_ACCESS_KEY env var mismatch
- Stats all zero → DB connection issue
- Feature flags 60s cache → changes may not appear immediately

---

## Phase 6 — P6: Mobile
**File:** `tests/06_mobile.spec.js`

### Setup: Resize to 375px
```
In browser DevTools → Device toolbar → 375×812 (iPhone SE)
OR use Playwright MCP viewport parameter
```

### 6a. Navbar
```
1. Navigate to http://localhost:5173
2. Verify hamburger menu icon visible (not full nav)
3. Click hamburger → verify menu opens
4. Click a link → verify navigation works + menu closes
```

### 6b. No Overflow
```
1. Check each main page: /, /dashboard, /trips, /discover, /admin
2. Verify no horizontal scrollbar
3. Screenshot each page
```

### 6c. Planner Wizard
```
1. Navigate to http://localhost:5173 → "Plan Trip"
2. Step 1: Select destination
3. Step 2: "When are you going?" (exact heading text)
4. Step 3: Budget / travelers
5. Verify all steps fit within 375px without overflow
```

### 6d. Trip Viewer Tabs
```
1. Open a saved trip on mobile
2. Tap "Itinerary", "Bookings", "Tools" tabs
3. Verify content renders within viewport
4. Verify card layouts stack vertically
```

**What to watch for:**
- Step 2 heading text: MUST be "When are you going?" (exact, tests rely on this)
- Horizontal overflow on desktop-only Flexbox components
- Tap targets too small → action buttons < 44px

---

## Quick Debug Commands

```bash
# Run one phase headlessly with trace
cd "D:/Projects/AltairGO Platform"
npx playwright test tests/01_booking_flow.spec.js --headed --trace on

# Open last report in browser
npm run test:e2e:report

# Run with Playwright Inspector (step-through)
PWDEBUG=1 npx playwright test tests/01_booking_flow.spec.js --headed

# Run single test by name
npx playwright test -g "Create booking plan via UI" --headed
```

---

## Known Pitfalls (from prior runs)

| Issue | Cause | Fix |
|-------|-------|-----|
| `waitForURL` timeout on login | SSE keeps network busy | Already using `domcontentloaded` |
| Step 2 selector fails | Wrong heading text | Use `"When are you going?"` exact |
| Share test fails | Clipboard needs permission | Check toast, not input value |
| Hotel options 422 | Destination name mismatch | Acceptable — test handles it |
| Booking plan 15s spinner | Gemini/Ollama slow | Increase `timeout` or use mock |
