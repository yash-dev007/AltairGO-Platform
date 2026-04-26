# Graph Report - .  (2026-04-26)

## Corpus Check
- 74 files · ~98,819 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 255 nodes · 314 edges · 66 communities detected
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 15 edges (avg confidence: 0.82)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 47|Community 47]]
- [[_COMMUNITY_Community 48|Community 48]]
- [[_COMMUNITY_Community 49|Community 49]]
- [[_COMMUNITY_Community 50|Community 50]]
- [[_COMMUNITY_Community 51|Community 51]]
- [[_COMMUNITY_Community 52|Community 52]]
- [[_COMMUNITY_Community 53|Community 53]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 56|Community 56]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]
- [[_COMMUNITY_Community 60|Community 60]]
- [[_COMMUNITY_Community 61|Community 61]]
- [[_COMMUNITY_Community 62|Community 62]]
- [[_COMMUNITY_Community 63|Community 63]]
- [[_COMMUNITY_Community 64|Community 64]]
- [[_COMMUNITY_Community 65|Community 65]]

## God Nodes (most connected - your core abstractions)
1. `req()` - 84 edges
2. `useAuth()` - 12 edges
3. `TripPlannerPage()` - 7 edges
4. `ErrorBoundary` - 6 edges
5. `AdminDashboard()` - 6 edges
6. `TripViewerPage()` - 6 edges
7. `ProfilePage()` - 5 edges
8. `DashboardPage()` - 5 edges
9. `Skeleton()` - 4 edges
10. `RegisterPage()` - 4 edges

## Surprising Connections (you probably didn't know these)
- `Playwright Debug Phases` --conceptually_related_to--> `TripViewerPage()`  [INFERRED]
  tests/DEBUG_PHASES.md → src\pages\trips\TripViewerPage.jsx
- `React SPA Architecture` --rationale_for--> `req()`  [EXTRACTED]
  CLAUDE.md → src\services\api.js
- `PageLoader()` --semantically_similar_to--> `LoadingOverlay()`  [INFERRED] [semantically similar]
  src\App.jsx → src\components\LoadingOverlay.jsx
- `LoadingOverlay()` --semantically_similar_to--> `Skeleton()`  [INFERRED] [semantically similar]
  src\components\LoadingOverlay.jsx → src\components\ui\Skeleton.jsx
- `Navbar()` --calls--> `useAuth()`  [INFERRED]
  src\components\Navbar\Navbar.jsx → src\context\AuthContext.jsx

## Hyperedges (group relationships)
- **UI Component Library** — badge_badge, button_button, card_card, emptystate_emptystate, input_input, modal_modal [EXTRACTED 1.00]
- **Loading State Skeletons** — skeleton_skeleton, skeleton_cardskeleton, skeleton_tripcardskeleton, skeleton_dashboardskeleton, skeleton_blogcardskeleton, skeleton_detailpageskeleton [EXTRACTED 1.00]
- **User Authentication Flow** — loginpage_loginpage, registerpage_registerpage, authcontext_authprovider, authcontext_useauth [INFERRED 0.85]
- **Trip Generation Flow** — tripplannerpage_tripplannerpage, generatingpage_generatingpage, api_generateitinerary, api_savetrip [INFERRED 0.85]
- **Trip Viewer Tabs Pattern** — tripviewerpage_tripviewerpage, bookingstab_bookingstab, itinerarytab_itinerarytab [INFERRED 0.85]
- **Project Branding Assets** — logo_image, logo_upload, favicon_svg [INFERRED 0.90]
- **Social Media Icons** — icons_bluesky_icon, icons_discord_icon, icons_github_icon, icons_x_icon, icons_social_icon [INFERRED 0.85]

## Communities

### Community 0 - "Community 0"
Cohesion: 0.07
Nodes (60): addActivity(), addCustomBooking(), addExpense(), adminApproveRequest(), adminCreateBlog(), adminCreateDestination(), adminCreateFeatureFlag(), adminDeleteBlog() (+52 more)

### Community 1 - "Community 1"
Cohesion: 0.14
Nodes (10): AdminLogin(), AdminRoute(), ProtectedRoute(), AuthProvider(), jwtExpiry(), safeLS, useAuth(), LoginPage() (+2 more)

### Community 2 - "Community 2"
Cohesion: 0.18
Nodes (4): PageLoader(), LoadingOverlay(), injectShimmer(), Skeleton()

### Community 3 - "Community 3"
Cohesion: 0.2
Nodes (3): Hero(), Home(), ItineraryCard()

### Community 4 - "Community 4"
Cohesion: 0.22
Nodes (9): generateItinerary(), getCountries(), getDestinations(), recommend(), search(), DestinationsPage(), getCardVariant(), getBudgetLabel() (+1 more)

### Community 5 - "Community 5"
Cohesion: 0.25
Nodes (4): BookingsTab(), Playwright Debug Phases, ItineraryTab(), TripViewerPage()

### Community 6 - "Community 6"
Cohesion: 0.29
Nodes (2): Rationale: Capture Error State, ErrorBoundary

### Community 7 - "Community 7"
Cohesion: 0.29
Nodes (1): Navbar()

### Community 8 - "Community 8"
Cohesion: 0.4
Nodes (5): AdminDashboard(), StatCard(), adminGetOpsSummary(), adminGetStats(), adminTriggerJob()

### Community 9 - "Community 9"
Cohesion: 0.4
Nodes (4): estimateBudget(), getBestTime(), getDestination(), DestinationDetails()

### Community 10 - "Community 10"
Cohesion: 0.4
Nodes (4): deleteAccount(), getProfile(), updateProfile(), ProfilePage()

### Community 11 - "Community 11"
Cohesion: 0.5
Nodes (4): getUserTrips(), shareTrip(), DashboardPage(), TripCard()

### Community 12 - "Community 12"
Cohesion: 0.67
Nodes (2): ToastContainer(), ToastProvider()

### Community 13 - "Community 13"
Cohesion: 0.5
Nodes (3): getItineraryStatus(), saveTrip(), GeneratingPage()

### Community 14 - "Community 14"
Cohesion: 0.5
Nodes (0): 

### Community 15 - "Community 15"
Cohesion: 0.5
Nodes (0): 

### Community 16 - "Community 16"
Cohesion: 0.67
Nodes (0): 

### Community 17 - "Community 17"
Cohesion: 0.67
Nodes (2): getBlog(), BlogDetails()

### Community 18 - "Community 18"
Cohesion: 0.67
Nodes (2): getBlogs(), BlogsPage()

### Community 19 - "Community 19"
Cohesion: 0.67
Nodes (2): getSharedTrip(), SharedTripPage()

### Community 20 - "Community 20"
Cohesion: 0.67
Nodes (2): getDailyBriefing(), DailyBriefingPage()

### Community 21 - "Community 21"
Cohesion: 0.67
Nodes (3): Site Favicon, Project Logo, Uploaded Logo

### Community 22 - "Community 22"
Cohesion: 1.0
Nodes (0): 

### Community 23 - "Community 23"
Cohesion: 1.0
Nodes (0): 

### Community 24 - "Community 24"
Cohesion: 1.0
Nodes (0): 

### Community 25 - "Community 25"
Cohesion: 1.0
Nodes (0): 

### Community 26 - "Community 26"
Cohesion: 1.0
Nodes (0): 

### Community 27 - "Community 27"
Cohesion: 1.0
Nodes (0): 

### Community 28 - "Community 28"
Cohesion: 1.0
Nodes (0): 

### Community 29 - "Community 29"
Cohesion: 1.0
Nodes (0): 

### Community 30 - "Community 30"
Cohesion: 1.0
Nodes (0): 

### Community 31 - "Community 31"
Cohesion: 1.0
Nodes (0): 

### Community 32 - "Community 32"
Cohesion: 1.0
Nodes (0): 

### Community 33 - "Community 33"
Cohesion: 1.0
Nodes (0): 

### Community 34 - "Community 34"
Cohesion: 1.0
Nodes (0): 

### Community 35 - "Community 35"
Cohesion: 1.0
Nodes (0): 

### Community 36 - "Community 36"
Cohesion: 1.0
Nodes (0): 

### Community 37 - "Community 37"
Cohesion: 1.0
Nodes (2): Playwright Config, Rationale: Use domcontentloaded

### Community 38 - "Community 38"
Cohesion: 1.0
Nodes (2): React SPA Architecture, Color Tokens Inventory

### Community 39 - "Community 39"
Cohesion: 1.0
Nodes (2): Altairgo Hero Prototype, Design Handoff Instructions

### Community 40 - "Community 40"
Cohesion: 1.0
Nodes (2): UI Mockup Diagram, App UI Screenshot

### Community 41 - "Community 41"
Cohesion: 1.0
Nodes (2): React Logo, Vite Logo

### Community 42 - "Community 42"
Cohesion: 1.0
Nodes (0): 

### Community 43 - "Community 43"
Cohesion: 1.0
Nodes (0): 

### Community 44 - "Community 44"
Cohesion: 1.0
Nodes (0): 

### Community 45 - "Community 45"
Cohesion: 1.0
Nodes (0): 

### Community 46 - "Community 46"
Cohesion: 1.0
Nodes (0): 

### Community 47 - "Community 47"
Cohesion: 1.0
Nodes (0): 

### Community 48 - "Community 48"
Cohesion: 1.0
Nodes (0): 

### Community 49 - "Community 49"
Cohesion: 1.0
Nodes (0): 

### Community 50 - "Community 50"
Cohesion: 1.0
Nodes (0): 

### Community 51 - "Community 51"
Cohesion: 1.0
Nodes (0): 

### Community 52 - "Community 52"
Cohesion: 1.0
Nodes (0): 

### Community 53 - "Community 53"
Cohesion: 1.0
Nodes (1): ESLint Config

### Community 54 - "Community 54"
Cohesion: 1.0
Nodes (1): Vite Config

### Community 55 - "Community 55"
Cohesion: 1.0
Nodes (1): API_BASE_URL

### Community 56 - "Community 56"
Cohesion: 1.0
Nodes (1): Root Rendering

### Community 57 - "Community 57"
Cohesion: 1.0
Nodes (1): fadeUp

### Community 58 - "Community 58"
Cohesion: 1.0
Nodes (1): Bluesky Icon

### Community 59 - "Community 59"
Cohesion: 1.0
Nodes (1): Discord Icon

### Community 60 - "Community 60"
Cohesion: 1.0
Nodes (1): Documentation Icon

### Community 61 - "Community 61"
Cohesion: 1.0
Nodes (1): GitHub Icon

### Community 62 - "Community 62"
Cohesion: 1.0
Nodes (1): Social Icon

### Community 63 - "Community 63"
Cohesion: 1.0
Nodes (1): X Icon

### Community 64 - "Community 64"
Cohesion: 1.0
Nodes (1): Hero Image (Outdoor Camping Scene)

### Community 65 - "Community 65"
Cohesion: 1.0
Nodes (1): AltairGO Logo

## Knowledge Gaps
- **27 isolated node(s):** `ESLint Config`, `Playwright Config`, `Rationale: Use domcontentloaded`, `Vite Config`, `API_BASE_URL` (+22 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **Thin community `Community 22`** (2 nodes): `BlogContent()`, `BlogContent.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 23`** (2 nodes): `DestinationCard()`, `DestinationCard.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 24`** (2 nodes): `Footer()`, `Footer.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 25`** (2 nodes): `Badge()`, `Badge.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 26`** (2 nodes): `Button()`, `Button.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 27`** (2 nodes): `Card()`, `Card.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 28`** (2 nodes): `EmptyState()`, `EmptyState.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 29`** (2 nodes): `Input()`, `Input.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 30`** (2 nodes): `Modal()`, `Modal.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 31`** (2 nodes): `ProgressBar()`, `ProgressBar.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 32`** (2 nodes): `ExpensesTab()`, `ExpensesTab.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 33`** (2 nodes): `NotesTab()`, `NotesTab.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 34`** (2 nodes): `ReadinessTab()`, `ReadinessTab.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 35`** (2 nodes): `SummaryTab.jsx`, `SummaryTab()`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 36`** (2 nodes): `adminAuth()`, `05_admin.spec.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 37`** (2 nodes): `Playwright Config`, `Rationale: Use domcontentloaded`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 38`** (2 nodes): `React SPA Architecture`, `Color Tokens Inventory`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 39`** (2 nodes): `Altairgo Hero Prototype`, `Design Handoff Instructions`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 40`** (2 nodes): `UI Mockup Diagram`, `App UI Screenshot`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 41`** (2 nodes): `React Logo`, `Vite Logo`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 42`** (1 nodes): `eslint.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 43`** (1 nodes): `playwright.config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 44`** (1 nodes): `config.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 45`** (1 nodes): `main.jsx`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 46`** (1 nodes): `index.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 47`** (1 nodes): `animations.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 48`** (1 nodes): `01_booking_flow.spec.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 49`** (1 nodes): `02_trip_editor.spec.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 50`** (1 nodes): `03_discover.spec.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 51`** (1 nodes): `04_trip_tools.spec.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 52`** (1 nodes): `06_mobile.spec.js`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 53`** (1 nodes): `ESLint Config`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 54`** (1 nodes): `Vite Config`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 55`** (1 nodes): `API_BASE_URL`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 56`** (1 nodes): `Root Rendering`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 57`** (1 nodes): `fadeUp`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 58`** (1 nodes): `Bluesky Icon`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 59`** (1 nodes): `Discord Icon`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 60`** (1 nodes): `Documentation Icon`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 61`** (1 nodes): `GitHub Icon`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 62`** (1 nodes): `Social Icon`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 63`** (1 nodes): `X Icon`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 64`** (1 nodes): `Hero Image (Outdoor Camping Scene)`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.
- **Thin community `Community 65`** (1 nodes): `AltairGO Logo`
  Too small to be a meaningful cluster - may be noise or needs more connections extracted.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `req()` connect `Community 0` to `Community 4`, `Community 5`, `Community 38`, `Community 8`, `Community 9`, `Community 10`, `Community 11`, `Community 13`, `Community 17`, `Community 18`, `Community 19`, `Community 20`?**
  _High betweenness centrality (0.213) - this node is a cross-community bridge._
- **Why does `useAuth()` connect `Community 1` to `Community 4`, `Community 5`, `Community 7`, `Community 8`, `Community 10`, `Community 11`?**
  _High betweenness centrality (0.152) - this node is a cross-community bridge._
- **Why does `TripViewerPage()` connect `Community 5` to `Community 0`, `Community 1`?**
  _High betweenness centrality (0.130) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `useAuth()` (e.g. with `ProtectedRoute()` and `AdminRoute()`) actually correct?**
  _`useAuth()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ESLint Config`, `Playwright Config`, `Rationale: Use domcontentloaded` to the rest of the system?**
  _27 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.14 - nodes in this community are weakly interconnected._