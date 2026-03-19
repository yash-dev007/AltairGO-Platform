# AltairGO-Platform — CLAUDE.md

> Complete technical reference for Claude Code. Read this before making any changes to this project.

---

## 1. What This Project Is

**AltairGO-Platform** is the production traveler-facing React frontend for AltairGO Travel Intelligence. It was built by merging the UI design language of `D:\Projects\AltairGo-Intelligence` with the full engine capabilities of `D:\Projects\AltairGO-Engine-main`.

This project is a **standalone React SPA** — it has no backend of its own. All data comes from the Flask backend at `D:\Projects\AltairGO-Engine-main` (runs on port 5000).

**Do NOT modify the backend (`AltairGO-Engine-main`) from within this project.** Backend changes go in `D:\Projects\AltairGO-Engine-main`. Refer to that project's `CLAUDE.md` for all API, model, and engine documentation.

---

## 2. Tech Stack

| Tool | Version | Notes |
|------|---------|-------|
| React | 19.2 | |
| Vite | 8.0 | Dev server port 5174 |
| React Router | v7 | v6-style `<Routes>` API used |
| Framer Motion | 12 | Page transitions + card animations |
| Lucide React | 0.577 | All icons |
| Recharts | 3 | Bar charts in best-time, expenses |
| @dnd-kit | 6/10/3 | Drag-and-drop (activity reorder) |
| react-hot-toast | 2.6 | All user notifications |
| CSS Modules | — | Per-component `.module.css` files |

---

## 3. Repository Structure

```
AltairGO-Platform/
├── index.html                  # Poppins font, "AltairGO — Travel Intelligently"
├── vite.config.js              # Dev proxy to :5000 + manualChunks code splitting
├── package.json
└── src/
    ├── main.jsx                # React 19 entry, StrictMode
    ├── App.jsx                 # All routes + Toaster + ProtectedRoute + AdminRoute
    ├── App.css                 # Minimal resets
    ├── index.css               # DESIGN SYSTEM — all CSS variables + keyframes (see §4)
    ├── config.js               # export const API_BASE_URL = import.meta.env.VITE_API_URL || ''
    ├── context/
    │   └── AuthContext.jsx     # Unified auth — ag_token / ag_admin_token in localStorage
    ├── services/
    │   └── api.js              # 50+ named API functions (see §6)
    ├── components/
    │   ├── Navbar/
    │   │   ├── Navbar.jsx      # Sticky frosted glass + search dropdown + user menu + mobile
    │   │   └── Navbar.module.css
    │   ├── Footer/
    │   │   ├── Footer.jsx      # Dark navy footer, newsletter, social icons
    │   │   └── Footer.module.css
    │   ├── DestinationCard/
    │   │   ├── DestinationCard.jsx     # Bento card with size prop (large/wide/tall/default)
    │   │   └── DestinationCard.module.css
    │   ├── Skeleton/
    │   │   └── Skeleton.jsx    # Shimmer skeleton loader
    │   ├── LoadingOverlay.jsx  # Full-screen loading spinner
    │   └── ErrorBoundary.jsx   # React error boundary
    └── pages/
        ├── Home.jsx                        # Landing — hero, features, real destinations, stats
        ├── auth/
        │   ├── LoginPage.jsx               # Split-screen — travel photo left, form right
        │   ├── RegisterPage.jsx            # Same split-screen, password strength bar
        │   └── Auth.module.css             # Complete auth split-screen styles
        ├── destinations/
        │   ├── DestinationsPage.jsx        # Bento grid + filters + AI recommend
        │   ├── DestinationsPage.module.css
        │   └── DestinationDetails.jsx      # 4-tab detail — overview/best-time/attractions/budget
        ├── trips/
        │   ├── TripPlannerPage.jsx         # 5-step wizard (Where/When/Budget/About/Review)
        │   ├── GeneratingPage.jsx          # Polling screen with stage messages + auto-save
        │   ├── TripViewerPage.jsx          # 5-tab viewer — itinerary/bookings/expenses/readiness/notes
        │   ├── DashboardPage.jsx           # My Trips grid
        │   └── DailyBriefingPage.jsx       # Day-of briefing — carry list, weather, SOS
        ├── profile/
        │   └── ProfilePage.jsx             # GET/PUT /api/user/profile + danger zone
        ├── shared/
        │   └── SharedTripPage.jsx          # Public read-only trip view (/trip/shared/:token)
        └── admin/
            ├── AdminLogin.jsx              # POST /api/admin/verify-key
            └── AdminDashboard.jsx          # Stats, job triggers, SSE feed, engine config
```

---

## 4. Design System (`src/index.css`)

All styles use CSS custom properties defined in `:root`. **Never hardcode colours — always use these variables.**

### Colour Palette (from AltairGo-Intelligence reference)
```css
--primary:       #1E293B   /* Slate 900 — main text, primary buttons */
--primary-light: #475569   /* Slate 600 — secondary text */
--accent:        #65A30D   /* Lime/olive green — CTAs, highlights */
--accent-hover:  #4D7C0F
--accent-light:  #ECFCCB

--background:    #FFFFFF
--surface:       #F1F5F9   /* Slate 100 — section backgrounds */
--surface-card:  #FFFFFF
--text-main:     #1E293B
--text-inverse:  #FFFFFF
--text-muted:    #94A3B8
--border:        #E2E8F0
--shadow-sm:     0 1px 3px rgba(0,0,0,0.08)
--shadow-card:   0 4px 24px rgba(0,0,0,0.08)
```

### Typography
```css
Font: Poppins (300, 400, 500, 600, 700) — loaded via Google Fonts in index.html
--text-xs:   0.75rem
--text-sm:   0.875rem
--text-base: 1rem
--text-lg:   1.125rem
--text-xl:   1.25rem
--text-2xl:  1.5rem
--text-3xl:  1.875rem
--text-4xl:  2.25rem
--text-5xl:  3rem
```

### Spacing
```css
--spacing-xs: 0.5rem  --spacing-sm: 1rem   --spacing-md: 1.5rem
--spacing-lg: 2rem    --spacing-xl: 4rem
```

### Border Radius
```css
--radius-sm: 0.5rem   --radius-md: 0.75rem
--radius-lg: 1.5rem   --radius-full: 9999px
```

### Keyframe Animations
- `fadeInUp` — translateY(20px)→0, opacity 0→1
- `slideDown` — translateY(-10px)→0, opacity 0→1
- `shakeIn` — horizontal shake for form errors
- `pulse` — opacity 1→0.6→1
- `spin` — 360deg (loading spinners)
- `shimmer` — background-position slide (skeleton)

---

## 5. Routing (`src/App.jsx`)

### Public routes (no auth required)
| Path | Component |
|------|-----------|
| `/` | Home |
| `/discover` | DestinationsPage |
| `/destination/:id` | DestinationDetails |
| `/login` | LoginPage |
| `/register` | RegisterPage |
| `/trip/shared/:token` | SharedTripPage |

### Protected routes (require `isAuthenticated`)
| Path | Component |
|------|-----------|
| `/planner` | TripPlannerPage |
| `/planner/generating/:jobId` | GeneratingPage |
| `/trips` | DashboardPage |
| `/trip/:id` | TripViewerPage |
| `/trip/:id/briefing/:day` | DailyBriefingPage |
| `/profile` | ProfilePage |

### Admin routes (require `isAdmin`)
| Path | Component |
|------|-----------|
| `/admin/login` | AdminLogin |
| `/admin` | AdminDashboard |

`<ProtectedRoute>` redirects unauthenticated users to `/login`.
`<AdminRoute>` redirects non-admins to `/admin/login`.

---

## 6. Authentication (`src/context/AuthContext.jsx`)

### localStorage keys
- `ag_token` — traveler JWT access token
- `ag_refresh_token` — traveler JWT refresh token
- `ag_admin_token` — admin JWT

### Context values exposed
```js
{ user, isAuthenticated, isAdmin, loading, login, register, logout, adminLogin, adminLogout }
```

### Behaviour
- On mount: if `ag_token` exists → calls `GET /auth/me` to hydrate `user`
- On mount: if `ag_admin_token` exists → sets `isAdmin = true`
- `login(email, pw)` → POST /auth/login → saves `ag_token` + `ag_refresh_token`
- `register(name, email, pw)` → POST /auth/register → saves `ag_token`
- `adminLogin(key)` → POST /api/admin/verify-key → saves `ag_admin_token`
- `logout()` / `adminLogout()` → clears respective tokens
- `ag:unauthorized` event (dispatched by api.js on 401) → auto-clears state

---

## 7. API Service (`src/services/api.js`)

All API calls go through the `req()` helper which:
- Attaches `Authorization: Bearer <token>` from `ag_token` (or `ag_admin_token` when `admin:true`)
- Dispatches `ag:unauthorized` event on 401
- Throws enriched `Error` with `.status` and `.data` on non-2xx

### Key schema gotchas (backend-specific)
- `selected_destinations` must be `[{name: "Jaipur"}]` — NOT `["Jaipur"]`
- `travel_month` must be a **string** (`"12"`) — NOT a number

### Exported functions by domain

**Auth:** `register`, `login`, `refreshToken`, `getMe`
**Admin auth:** `adminLogin`
**Profile:** `getProfile`, `updateProfile`, `deleteAccount`
**Search:** `search(q, type)` → `/api/search`
**Destinations:** `getDestinations`, `getDestination`, `getCountries`
**Discovery:** `getRecommendations`, `getBestTime`, `isGoodTime`, `estimateBudget`, `compareDestinations`
**Trips:** `generateItinerary`, `getItineraryStatus`, `saveTrip`, `getUserTrips`, `getTrip`, `generateVariants`
**Sharing:** `shareTrip`, `revokeShare`, `getSharedTrip`
**Bookings:** `getBookingPlan`, `approveBooking`, `rejectBooking`, `executeAllBookings`, `cancelBooking`, `getBookings`, `customizeBooking`, `addCustomBooking`
**Expenses:** `addExpense`, `getExpenses`, `deleteExpense`
**Trip Tools:** `getTripReadiness`, `getDailyBriefing`, `swapActivity`, `getNextTripIdeas`
**Trip Editor:** `getHotelOptions`, `changeHotel`, `addActivity`, `removeActivity`, `editActivity`, `reorderActivities`, `saveTripNotes`
**Signals:** `logSignal`
**Admin:** `getAdminStats`, `getDashboardSummary`, `triggerJob`, `triggerAgent`, `getEngineConfig`, `updateEngineConfig`, `getAdminDestinations`, `createDestination`, `updateDestination`, `deleteDestination`, `getAdminUsers`, `getAdminTrips`, `getDestinationRequests`, `approveRequest`, `rejectRequest`

---

## 8. Key Page Flows

### Trip Generation Flow
```
/planner  (TripPlannerPage — 5 steps)
  Step 1: Select destinations (search + AI recommend)
  Step 2: Dates + duration + from city IATA
  Step 3: Budget (₹) + style chips + travelers count
  Step 4: Traveler type + dietary + fitness + special occasion
  Step 5: Review + budget estimate + "Generate" button
    → POST /generate-itinerary → get jobId → navigate to /planner/generating/:jobId

/planner/generating/:jobId  (GeneratingPage)
  → Poll GET /get-itinerary-status/:jobId every 2s
  → Show rotating stage messages + progress bar
  → On completed: POST /api/save-trip → navigate to /trip/:savedTripId
  → On failed: show error + retry button
```

### Itinerary View Flow
```
/trip/:id  (TripViewerPage)
  → GET /get-trip/:id
  → 5 tabs:
    Itinerary  — day accordion + activities + hotel swap + add/swap/remove activity
    Bookings   — approve/reject/execute-all/cancel/add-custom
    Expenses   — recharts bar chart + log expense form
    Readiness  — 0-100% score + checklist
    Notes      — auto-save textarea
```

---

## 9. Component Patterns

### DestinationCard (Bento grid)
```jsx
<DestinationCard destination={d} size="large" />
// size prop: "large" (2×2), "wide" (2×1), "tall" (1×2), "default" (1×1)
// Hover: translateY(-8px) + image scale(1.1) + content slide up
// Image fallback: CSS gradient bg when no image
```

### CSS Modules pattern
Every page/component that needs scoped styles uses a `.module.css` file:
```jsx
import styles from './MyComponent.module.css';
<div className={styles.container}>
```

### Error handling pattern
```jsx
try {
  const data = await someApiCall();
} catch (err) {
  toast.error(err.message || 'Something went wrong');
}
```

### Currency formatting
```js
`₹${amount.toLocaleString('en-IN')}`
```

### Date formatting
```js
new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(dateStr))
```

---

## 10. Vite Config

### Dev proxy (all routes forwarded to Flask :5000)
```
/api/*              → http://127.0.0.1:5000
/auth/*             → http://127.0.0.1:5000
/generate-itinerary → http://127.0.0.1:5000
/get-itinerary-status/* → http://127.0.0.1:5000
/get-trip/*         → http://127.0.0.1:5000
/countries          → http://127.0.0.1:5000
/health             → http://127.0.0.1:5000
/destinations/*     → http://127.0.0.1:5000 (with HTML bypass for SPA routing)
```

### Code splitting (manualChunks)
```
react-vendor  — react + react-dom + react-router-dom
ui-vendor     — framer-motion + lucide-react + react-hot-toast
chart-vendor  — recharts + d3
dnd-vendor    — @dnd-kit/*
```

---

## 11. How to Run

```bash
# Prerequisites: AltairGO-Engine-main Flask backend must be running on port 5000
# Start backend first (from AltairGO-Engine-main):
.venv/Scripts/python.exe -m flask --app backend.app:create_app run --port 5000 --reload

# Start this frontend:
cd D:\Projects\AltairGO-Platform
npm run dev          # → http://localhost:5173 (or 5174 if 5173 is taken)
```

### Environment variable (optional)
```bash
# .env.local (create if you need to point to a different backend)
VITE_API_URL=http://127.0.0.1:5000
```
If `VITE_API_URL` is not set, `src/config.js` defaults to `''` (empty string) which lets the Vite proxy handle all API calls.

---

## 12. Related Projects

| Project | Path | Role |
|---------|------|------|
| **AltairGO-Engine-main** | `D:\Projects\AltairGO-Engine-main` | Flask backend — all API endpoints, DB, Celery, Gemini |
| **AltairGo-Intelligence** | `D:\Projects\AltairGo-Intelligence` | Original UI reference — do not modify |
| **This project** | `D:\Projects\AltairGO-Platform` | Production traveler frontend |

For backend API reference, engine pipeline docs, DB schema, and all endpoint specs → read `D:\Projects\AltairGO-Engine-main\CLAUDE.md`.

---

## 13. Important Rules When Editing This Project

1. **Never hardcode colours** — always use CSS variables from `src/index.css`
2. **Never fetch directly** — always use the named functions from `src/services/api.js`
3. **Always use CSS Modules** for component-scoped styles (`.module.css`)
4. **Never add raw `<img>` without a fallback** — always handle missing images with a CSS gradient
5. **Every button that calls an API must have a loading state** (disable + spinner while pending)
6. **All API errors must show a toast** — `toast.error(err.message)`
7. **Currency always** `₹${n.toLocaleString('en-IN')}` — never `Rs.` or `INR`
8. **selected_destinations schema** — always send `[{name: "City"}]` to the generate endpoint, never plain strings
9. **travel_month** — always send as string `"12"` not number `12`
10. **Do not duplicate pages in AltairGo-Intelligence** — that project is a read-only reference
