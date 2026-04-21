<div align="center">

<img src="https://img.shields.io/badge/AltairGO-Platform-4F46E5?style=for-the-badge&logo=react&logoColor=white" alt="AltairGO Platform" />

# AltairGO Platform

**Traveler-facing React frontend for AltairGO Travel Intelligence — AI itinerary planning, full booking management, and destination discovery.**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![React Router](https://img.shields.io/badge/React%20Router-v7-CA4245?style=flat-square&logo=reactrouter&logoColor=white)](https://reactrouter.com)
[![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Playwright](https://img.shields.io/badge/Playwright-E2E-45BA4B?style=flat-square&logo=playwright&logoColor=white)](https://playwright.dev)

<br/>

[Features](#-features) &bull; [Getting Started](#-getting-started) &bull; [Routes](#-routing-overview) &bull; [Testing](#-testing) &bull; [Design System](#-design-system)

</div>

---

## Overview

AltairGO Platform is a production-grade React SPA connecting to the [AltairGO Engine](https://github.com/yash-dev007/AltairGO-Engine) Flask backend. It covers the full traveler journey: discover destinations, generate AI itineraries via SSE, manage bookings, track expenses, and review trips.

---

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| React | 19 | UI framework |
| Vite | 8 | Build tool + dev server |
| React Router | v7 | Client-side routing |
| Framer Motion | 12 | Page transitions + animations |
| Recharts | 3 | Charts (expenses, best-time widget) |
| @dnd-kit | 6/10/3 | Drag-and-drop activity reorder |
| Lucide React | 0.577 | Icon library |
| react-hot-toast | 2.6 | Toast notifications |
| CSS Modules | — | Scoped per-component styles |

---

## Features

### Landing Page & Aesthetic
- **Fluid Animations**: Configured Framer Motion staggered entrance and viewport scroll-triggered transitions across Heroes, Destinations, Capabilities, and Journal modules for a premium feel.
- **Premium Design System**: Built with modern CSS features including glassmorphic pills, deeply responsive grids dropping down fluidly for mobile, cohesive light/dark gradients using `oklch` and custom properties scoped uniquely via CSS Modules.

### Trip Planning
- **5-step planner wizard** — destination search + AI recommendations, dates/duration, budget slider (live ₹/person/day hint), interests chips, advanced options (dietary, fitness, accessibility)
- **AI itinerary generation** — real-time SSE stream via `EventSource`; auto-saves on completion; 2s polling fallback

### Itinerary Viewer (6 tabs)
- **Itinerary** — pending bookings banner, day briefing links, collapsible activity cards
- **Bookings** — 3-step explainer, status pills, booking refs, "Confirm & Book All Approved" CTA, approve/reject/cancel per booking
- **Expenses** — planned vs actual spend per category with Recharts bar chart
- **Readiness** — 0–100% checklist (documents, bookings, packing, health)
- **Notes** — per-trip and per-day notes with auto-save
- **Post-trip** — summary stats, highlights, star + tag chip review form

### Destination Discovery
- Bento grid with season/budget/category filters
- AI semantic search (`q=` via text embeddings)
- Destination detail: 4-tab deep-dive (overview, best time, attractions, budget)
- Best-time widget — 12-month score matrix with Excellent/Good/Fair/Avoid verdicts
- Side-by-side destination comparison with winner

### Other
- **Trip sharing** — public read-only view via share token
- **Daily briefing** — day-of carry list, weather, crowd warnings, SOS contacts
- **Admin dashboard** — stats, job triggers, SSE live feed, engine config, feature flags CRUD
- **JWT auth** — auto token refresh; `ag:unauthorized` CustomEvent auto-logout

---

## Getting Started

### Prerequisites

- Node.js 18+
- **AltairGO Engine** running on `http://127.0.0.1:5000`

### Install & Run

```bash
npm install
npm run dev
# → http://localhost:5173
```

The Vite dev server proxies `/api/*`, `/auth/*`, and all engine routes to `http://127.0.0.1:5000` automatically.

### Optional: Custom backend URL

```env
# .env.local
VITE_API_URL=http://127.0.0.1:5000
```

### Build for Production

```bash
npm run build   # output → dist/
```

---

## Routing Overview

| Path | Page | Auth |
|------|------|------|
| `/` | Home | Public |
| `/discover` | Destinations bento grid | Public |
| `/destination/:id` | Destination detail (4 tabs) | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/trip/shared/:token` | Shared trip (read-only) | Public |
| `/planner` | Trip planner wizard | Protected |
| `/planner/generating/:jobId` | SSE generation progress | Protected |
| `/trips` | My trips dashboard | Protected |
| `/trip/:id` | Trip viewer (6 tabs) | Protected |
| `/trip/:id/briefing/:day` | Daily briefing | Protected |
| `/profile` | User profile | Protected |
| `/admin` | Admin dashboard | Admin only |

---

## Project Structure

```
src/
├── App.jsx                  # All routes + ProtectedRoute + AdminRoute
├── index.css                # Design system — CSS variables + keyframes
├── context/
│   └── AuthContext.jsx      # JWT auth state + auto-refresh + logout event
├── services/
│   └── api.js               # 50+ named API functions
├── components/
│   ├── Navbar/
│   ├── DestinationCard/     # Bento card (large/wide/tall/default sizes)
│   └── ...                  # Footer, Skeleton, LoadingOverlay, ErrorBoundary
└── pages/
    ├── Home.jsx
    ├── auth/                # Login + Register
    ├── destinations/        # DestinationsPage + DestinationDetails
    ├── trips/               # Planner, Generating, Viewer, Dashboard, Briefing
    ├── profile/
    ├── shared/              # Public shared trip view
    └── admin/               # AdminLogin + AdminDashboard
```

---

## Testing

### Unit Tests

```bash
python -m pytest ../AltairGO-Engine/backend/tests/ -q  # 188 passed (backend)
```

### E2E Tests (Playwright)

Full browser-level E2E suite — 334 tests across 6 spec files. **Requires both backend + frontend running.**

```bash
# Individual suites
npm run test:booking    # P1 — booking flow (create, approve, execute, cancel)
npm run test:editor     # P2 — trip editor (hotel swap, activity CRUD, notes)
npm run test:discover   # P3 — discover (recommend, best-time, compare, estimate)
npm run test:tools      # P4 — trip tools (readiness, briefing, swap, review)
npm run test:admin      # P5 — admin panel (auth, stats, flags, engine config)
npm run test:mobile     # P6 — mobile (375px viewport, no overflow, all flows)

# All tests
npm run test:e2e

# Interactive UI mode
npm run test:e2e:ui
```

| Suite | Priority | Coverage |
|-------|----------|----------|
| `01_booking_flow.spec.js` | P1 | Full booking lifecycle + edge cases |
| `02_trip_editor.spec.js` | P2 | Hotel swap, activity CRUD, notes |
| `03_discover.spec.js` | P3 | Recommend, best-time, compare, estimate |
| `04_trip_tools.spec.js` | P4 | Readiness, briefing, activity swap, review |
| `05_admin.spec.js` | P5 | Admin CRUD, feature flags, engine settings |
| `06_mobile.spec.js` | P6 | Pixel 5 viewport — all pages no overflow |

**Debug scripts** (headless: false, with screenshots):

```bash
node tests/p1_booking_debug.cjs     # P1 — 13/13 PASS
node tests/p2_trip_editor.cjs       # P2 — 29 PASS, 4 warnings
node tests/p3_discover_debug.cjs    # P3 — 57 PASS, 0 FAIL
```

Screenshots output to `test-results/`.

---

## Design System

Tokens defined in `src/index.css`:

| Token | Value | Use |
|-------|-------|-----|
| `--primary` | `#4F46E5` | Main CTA, active states |
| `--accent` | `#F59E0B` | Highlights, badges |
| `--background` | `#F8FAFC` | Page background |
| `--surface` | `#F1F5F9` | Section backgrounds |
| `--border` | `#E2E8F0` | Dividers |

Font: **Poppins** (300–700) via Google Fonts. Currency: `₹{n.toLocaleString('en-IN')}`.

---

## API Integration Notes

All API calls go through `src/services/api.js`. Key field names to know:

| Endpoint | Gotcha |
|----------|--------|
| `PUT /api/trip/<id>/notes` | Body must be `{ trip: "...", days: {...} }` — not `{ notes: "..." }` |
| `GET /get-trip/<id>` | `user_notes` is `{ trip: "...", days: {...} }` — extract `.trip` for display |
| `PUT /api/trip/<id>/day/<n>/activity/edit` | Use `cost_override` (not `cost`), `user_note` (not `notes`) |
| `GET /api/user/trips` | Response is `{ items: [...] }` — not `{ trips: [...] }` |
| `GET /api/discover/best-time/<id>` | Monthly scores are under `monthly_guide` key |
| `GET /api/discover/recommend` | Results are under `recommendations` key |

---

## Related

| Project | Role |
|---------|------|
| [AltairGO-Engine](https://github.com/yash-dev007/AltairGO-Engine) | Flask backend — API, DB, Celery, Gemini AI |

---

## License

Private — All rights reserved.
