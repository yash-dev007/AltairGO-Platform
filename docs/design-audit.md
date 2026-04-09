# AltairGO Frontend Design Audit

This report inventories the current design state of the AltairGO Platform and provides a specification for a unified design token system.

## 1. Color Inventory

### Primary & Accent
- **Primary:** `#1E293B` (slate-900), `#475569` (slate-600), `#0F172A` (slate-950)
- **Primary Light:** `#4F46E5` (indigo-600) - found in stats and some icons.
- **Accent (Lime/Green):** `#65A30D` (lime-600), `#4D7C0F` (lime-700), `#ECFCCB` (lime-100), `#4ade80` (green-400).
- **Secondary Accent (Amber):** `#f59e0b` (amber-500), `#d97706` (amber-600), `#92400e` (amber-800), `#fffbeb` (amber-50), `#fde68a` (amber-200).

### Neutrals & Surfaces
- **Background:** `#FFFFFF`, `#f8fafc` (slate-50).
- **Surface/Card:** `#FFFFFF`, `#F1F5F9` (slate-100), `#ede9fe` (violet-100 - used in stats).
- **Borders:** `#E2E8F0` (slate-200), `#f1f5f9` (slate-100), `#ede9fe` (violet-100), `#bae6fd` (sky-200).

### Semantic Colors
- **Success:** `#10b981` (emerald-500), `#065f46` (emerald-800), `#f0fdf4` (emerald-50).
- **Error:** `#dc2626` (red-600), `#ef4444` (red-500), `#fef2f2` (red-50).
- **Warning:** `#f59e0b` (amber-500), `#fffbeb` (amber-50).
- **Info:** `#0284c7` (sky-600), `#f0f9ff` (sky-50), `#3b82f6` (blue-500).

---

## 2. Typography Inventory

### Font Family
- **Main:** 'Poppins', sans-serif (Google Fonts).

### Text Sizes (Hardcoded patterns)
- **Display:** `clamp(2.5rem, 6vw, 4.25rem)` (Hero title), `clamp(1.75rem, 4vw, 2.5rem)` (Section titles).
- **H1/H2:** `2.75rem` (Stats), `2.25rem` (Dashboard header), `2rem` (Trip titles).
- **H3/H4:** `1.75rem` (Planner headers), `1.5rem` (Auth titles), `1.1rem` (Card titles).
- **Body:** `1.1rem` (Subtitles), `1.05rem` (Descriptive text), `1rem` (Standard body), `0.95rem` (Small body).
- **Captions/Labels:** `0.9rem`, `0.85rem`, `0.8rem`, `0.78rem`, `0.75rem`.

### Font Weights
- **Bold/Extrabold:** `800`, `700`.
- **Medium/Semibold:** `600`, `500`.
- **Regular:** `400`.
- **Light:** `300`.

---

## 3. Spacing Patterns

- **Grid Unit:** Implicitly 4px or 8px base (0.25rem / 0.5rem).
- **Section Padding:** `5rem`, `3.5rem`.
- **Container Margins:** `40px`, `2rem`, `1.5rem`.
- **Card Padding:** `2.5rem`, `2rem`, `1.5rem`, `1.25rem`.
- **Gap Patterns:** `3rem`, `2.5rem`, `1.5rem`, `1rem`, `0.75rem`, `0.5rem`.

---

## 4. Component Inventory

- **Buttons:**
    - **Primary:** pill-shaped, slate-900 background, white text.
    - **Accent:** pill-shaped, lime-600 background, white text.
    - **Outline:** pill-shaped, white border, white text.
    - **Action Buttons:** small, border-radius 10px or 50px, mixed colors.
- **Cards:**
    - **Trip Card:** 20px radius, shadow-sm, slate-200 border, hover lift animation.
    - **Feature/Step Card:** 16px-20px radius, shadow-sm, white background.
    - **Destination Card:** Image-heavy, overlay text, 24px radius.
- **Form Fields:**
    - **Inputs:** 12px-14px radius, 1.5px slate-200 border, Poppins font.
    - **Selects/Checkboxes:** Custom styled with border and background tokens.
- **Loading States:**
    - **Spinners:** CSS border animations.
    - **Skeletons:** Linear-gradient shimmer effects, hardcoded widths/heights.
- **Modals/Overlays:**
    - **Backdrop:** `rgba(0,0,0,0.45)` or `rgba(0,0,0,0.08)`.
    - **Dialog:** 20px-24px radius, white background, shadow-xl.
- **Empty States:**
    - **Centered Icon:** Large emoji or icon, descriptive text, CTA button.

---

## 5. Problems Found

1. **Hardcoded Inline Styles:** Extensively used in `DashboardPage`, `TripPlannerPage`, `TripViewerPage`, and `ItineraryTab`. This makes theme switching and maintenance difficult.
2. **Color Inconsistency:** Multiple variations of slate and indigo used interchangeably (e.g., `#1e293b` vs `#1E293B` vs `#0f172a`).
3. **Accessibility Gaps:**
    - Many buttons are `div` or `button` without `aria-label` or proper contrast.
    - Focus states are inconsistent or missing.
    - Interactive elements sometimes lack `cursor: pointer` or hover feedback.
4. **Duplicated Logic:** Carousel, card layouts, and skeleton patterns are redefined in multiple places.
5. **Mobile Responsiveness:** Heavy use of fixed paddings and widths in some areas leads to overflow or cramped layouts.

---

## 6. Recommended Token Set

```css
:root {
  /* ── Colors ── */
  --color-primary:        #4F46E5; /* Indigo-600 */
  --color-primary-dark:   #3730A3;
  --color-primary-light:  #818CF8;
  
  --color-accent:         #F59E0B; /* Amber-500 */
  --color-accent-dark:    #D97706;
  
  --color-bg:             #0F172A; /* Slate-900 for dark base */
  --color-bg-subtle:      #1E293B; /* Slate-800 */
  --color-bg-elevated:    #1E293B;
  
  --color-text:           #F8FAFC; /* Slate-50 */
  --color-text-muted:     #94A3B8; /* Slate-400 */
  --color-text-inverted:  #0F172A; /* Slate-900 */
  
  --color-border:         #334155; /* Slate-700 */
  --color-border-subtle:  #1E293B;
  
  --color-success:        #10B981;
  --color-warning:        #F59E0B;
  --color-error:          #EF4444;
  --color-info:           #3B82F6;

  /* ── Spacing (4px base grid) ── */
  --space-1: 0.25rem;  /* 4px */
  --space-2: 0.5rem;   /* 8px */
  --space-3: 0.75rem;  /* 12px */
  --space-4: 1rem;     /* 16px */
  --space-5: 1.25rem;  /* 20px */
  --space-6: 1.5rem;   /* 24px */
  --space-8: 2rem;     /* 32px */
  --space-10: 2.5rem;  /* 40px */
  --space-12: 3rem;    /* 48px */
  --space-16: 4rem;    /* 64px */

  /* ── Radius ── */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
  --radius-2xl: 1.5rem;
  --radius-full: 9999px;

  /* ── Shadows ── */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);

  /* ── Typography ── */
  --font-size-xs:   0.75rem;
  --font-size-sm:   0.875rem;
  --font-size-base: 1rem;
  --font-size-lg:   1.125rem;
  --font-size-xl:   1.25rem;
  --font-size-2xl:  1.5rem;
  --font-size-3xl:  1.875rem;
  --font-size-4xl:  2.25rem;

  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-bold:   700;
}
```

---

## 7. Page Redesign Priorities

1. **HomePage (High):** First impression, needs the most visual "pop" and branding.
2. **PlannerPage (High):** Critical user flow, needs better multi-step wizardry and clear progress tracking.
3. **TripViewerPage (Medium):** Core product value, needs to feel premium and organized (better tab navigation).
4. **DashboardPage (Medium):** Hub for returning users, needs a clean grid and helpful stats.
5. **Auth Pages (Low):** Standardized split-panel layout for professional feel.
6. **Blogs/Discover (Low):** Content discovery, can use standardized card patterns.
