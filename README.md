# AltairGO Platform

> Traveler-facing React frontend for AltairGO Travel Intelligence.

AltairGO Platform is a production-grade React SPA that delivers AI-powered trip planning, itinerary management, destination discovery, and travel briefings. It connects to the [AltairGO Engine](https://github.com/yash-dev007) Flask backend for all data and AI operations.

---

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| React | 19.2 | UI framework |
| Vite | 8.0 | Build tool + dev server (port 5174) |
| React Router | v7 | Client-side routing |
| Framer Motion | 12 | Page transitions + animations |
| Lucide React | 0.577 | Icon library |
| Recharts | 3 | Charts (expenses, best-time) |
| @dnd-kit | 6/10/3 | Drag-and-drop activity reorder |
| react-hot-toast | 2.6 | User notifications |
| CSS Modules | — | Scoped per-component styles |

---

## Features

- **Trip Planning Wizard** — 5-step flow: destinations, dates, budget, traveler profile, review
- **AI Itinerary Generation** — Live polling with progress stages, auto-save on completion
- **Itinerary Viewer** — 5-tab view: itinerary, bookings, expenses, readiness checklist, notes
- **Destination Discovery** — Bento grid with filters, AI recommendations, budget estimator
- **Destination Details** — 4-tab deep-dive: overview, best time to visit, attractions, budget
- **Daily Briefing** — Day-of carry list, weather, SOS contacts
- **Trip Sharing** — Public read-only trip view via share token
- **Admin Dashboard** — Stats, job triggers, SSE live feed, engine config
- **Auth** — JWT-based login/register with auto token refresh

---

## Project Structure

```
src/
├── App.jsx                  # All routes + ProtectedRoute + AdminRoute
├── index.css                # Design system — CSS variables + keyframes
├── config.js                # API base URL config
├── context/
│   └── AuthContext.jsx      # Unified auth state
├── services/
│   └── api.js               # 50+ named API functions
├── components/
│   ├── Navbar/
│   ├── Footer/
│   ├── DestinationCard/     # Bento card (large/wide/tall/default sizes)
│   ├── Skeleton/
│   ├── LoadingOverlay.jsx
│   └── ErrorBoundary.jsx
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

## Getting Started

### Prerequisites

- Node.js 18+
- **AltairGO Engine** Flask backend running on port 5000

### Install & Run

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
# → http://localhost:5174
```

The Vite dev server proxies all `/api/*`, `/auth/*`, and engine routes to `http://127.0.0.1:5000` automatically — no extra config needed.

### Optional: Custom backend URL

```bash
# .env.local
VITE_API_URL=http://127.0.0.1:5000
```

If `VITE_API_URL` is not set, the Vite proxy handles all API calls.

### Build for Production

```bash
npm run build
# Output → dist/
```

---

## Routing Overview

| Path | Page | Auth |
|------|------|------|
| `/` | Home | Public |
| `/discover` | Destinations | Public |
| `/destination/:id` | Destination Details | Public |
| `/login` | Login | Public |
| `/register` | Register | Public |
| `/trip/shared/:token` | Shared Trip | Public |
| `/planner` | Trip Planner | Protected |
| `/planner/generating/:jobId` | Generating | Protected |
| `/trips` | My Trips Dashboard | Protected |
| `/trip/:id` | Trip Viewer | Protected |
| `/trip/:id/briefing/:day` | Daily Briefing | Protected |
| `/profile` | Profile | Protected |
| `/admin` | Admin Dashboard | Admin |

---

## Design System

All styles use CSS custom properties from `src/index.css`. Key tokens:

| Token | Value | Use |
|-------|-------|-----|
| `--primary` | `#1E293B` | Main text, primary buttons |
| `--accent` | `#65A30D` | CTAs, highlights |
| `--surface` | `#F1F5F9` | Section backgrounds |
| `--border` | `#E2E8F0` | Dividers |

Font: **Poppins** (300–700) via Google Fonts.

---

## Related Projects

| Project | Role |
|---------|------|
| **AltairGO-Engine-main** | Flask backend — API, DB, Celery, Gemini AI |
| **AltairGo-Intelligence** | Original UI reference (read-only) |

---

## License

Private — All rights reserved.
