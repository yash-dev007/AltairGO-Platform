# AltairGo Intelligence Design System

**Version:** 3.1 (Final / Audited)
**Name:** AltairGo Intelligence
**Description:** An AI-powered trip planner platform focused on smart, seamless travel planning and intelligent recommendations.
**Design Principles:** Calm · Clean · Editorial · Warm · Trustworthy

**Snapshot:**
- **Colors:** Sage (#A3B18A), Warm Beige (#E9DFC6), Oat (#F6F1E6), Sand (#D6C4AB), Coral/Terracotta (#E7A27B), Charcoal (#2E2E2E)
- **Typography:** Copernicus (Headings — Display, H1–H4), StyreneB (Body + UI + Footer)
- **Radius:** 8px (inputs / dropdown items), 12px (buttons / action items), 16px (cards / hero / modals / imagery), 9999px (pills, badges, toggles, avatars)
- **Spacing:** 4px base unit — `4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96`
- **Container:** max-width 1280px

> **Consolidation Note (v3.0):** Final unified specification merging v2.1 (radius grid, focus-visible, shadow opacity, max-width, info/success differentiation, H2 weight lock) and v2.2 (button text contrast fix, primary-button focus override, AI Pick badge contrast fix, Small weight lock, card/button radius separation, secondary button states, input disabled state). Dark mode removed from scope. Font family preserved: Copernicus + StyreneB.

> **Audit Note (v3.1):** Contrast values re-verified against the WCAG 2.x sRGB relative-luminance formula. Three corrections applied:
> 1. **Primary-button active-state text** changed from `#FFFFFF` to `#2E2E2E`. White on `#7A9463` ≈ **3.4:1** — passes AA-large/UI only, fails AA-normal. Dark text yields ~4.0:1 (AA-large/UI) and stays consistent across the button lifecycle.
> 2. **Active green (#7A9463) white-text caveat** clarified — passes for ≥18px or ≥14px-bold text and UI components, **not** for normal-size body labels.
> 3. **Numeric contrast values** in Section 10.2 retuned to formula-accurate values; the *direction* (pass / fail) was correct in v3.0, the magnitudes were rough.
>
> Five-state contract gaps closed: **Filter Chip**, **Default Pill**, **Toggle**, **Dropdown items** now have full state matrices. Added **Tooltip** (was referenced in Motion but never specified), **Skeleton/Loading** (downgraded from a P0 gap), **Empty State**, and a **Z-Index scale**. Cross-references and small inconsistencies (snapshot vs. body, font-family scope, nav weight) reconciled.

---

## Table of Contents

1. Overview & Design Philosophy
2. Color System
3. Typography
4. Layout, Grid & Spacing
5. Elevation & Depth
6. Shape & Border Radius
7. Iconography
8. Motion & Transitions
9. Components
10. Accessibility & Focus States
11. Imagery & Mood Direction
12. Z-Index Scale
13. Do's & Don'ts
14. Responsive Behavior
15. Quick Reference Tokens
16. Known Gaps & Roadmap
- Appendix A — Migration Notes from v2.x
- Appendix B — Implementation: CSS Variables & Tailwind Config
- Appendix C — Code Source Header

---

## 01. Overview & Design Philosophy

AltairGo Intelligence is an AI-powered travel companion. The interface should feel like a **premium travel journal** — calm, considered, and editorially confident — while still surfacing intelligent recommendations with clarity.

### Key Characteristics

| Principle | Expression in UI |
| :--- | :--- |
| **Clean & Intelligent** | Refined aesthetic that makes complex AI-driven data feel simple and approachable. |
| **Explorative & Nature-Inspired** | A palette of sage, sand, and terracotta evoking world travel and natural landscapes. |
| **Trustworthy & Editorial** | High-quality serif typography paired with stable grid layouts, reminiscent of premium travel journals. |
| **Calm Planning** | Reduces "choice overload" through spacious layouts and soft visual cues. |
| **Confident AI Voice** | AI guidance is visually distinct from confirmation — never pretends to be the user's decision. |

### Voice & Tone
- **Warm, never corporate.** "Let's plan your trip" — not "Initiate planning workflow."
- **Confident, never pushy.** Recommend, don't insist.
- **Specific, never vague.** "Sun-drenched coastal town" beats "great place."

---

## 02. Color System

The palette is intentionally narrow. Every interactive surface uses a known, contrast-verified pairing — **never invent new combinations.**

### 2.1 Brand & Accent

| Token | HEX | Usage |
| :--- | :--- | :--- |
| `{colors.primary}` | `#A3B18A` | **Sage Green.** Primary action backgrounds, branding, success states. **Pair with `{colors.text.primary}` `#2E2E2E` — never white.** |
| `{colors.accent}` | `#E7A27B` | **Coral/Terracotta.** Highlights, "AI Pick" badges, special offers. **Pair with `{colors.text.primary}` `#2E2E2E` — never white.** |
| `{colors.hover}` | `#8FA876` | **Hover Green.** Hover state for primary buttons and nav links. |
| `{colors.active}` | `#7A9463` | **Active Green.** Pressed states, active nav indicators, AI info/guidance states. **Pair with `{colors.text.primary}` `#2E2E2E` for body-size text.** White text passes only for ≥18px or ≥14px-bold and UI components (≈3.4:1). |

> **Why primary and accent require dark text (verified contrast):**
> - `#FFFFFF` on `#A3B18A` ≈ **2.3:1** — fails WCAG AA at every size.
> - `#2E2E2E` on `#A3B18A` ≈ **6.0:1** — passes WCAG AA for normal text and AAA for large text.
> - `#FFFFFF` on `#E7A27B` ≈ **2.1:1** — fails WCAG AA at every size.
> - `#2E2E2E` on `#E7A27B` ≈ **6.4:1** — passes WCAG AA for normal text.
> - `#FFFFFF` on `#7A9463` ≈ **3.4:1** — AA-large / UI components only. Not for body-size labels.
> - `#2E2E2E` on `#7A9463` ≈ **4.0:1** — AA-large / UI components only; preferred for consistency.
>
> This is a **structural property** of warm, mid-value palettes — not a stylistic choice. The system does not bend on this point.

### 2.2 Surfaces

| Token | HEX | Usage |
| :--- | :--- | :--- |
| `{colors.bg.main}` | `#E9DFC6` | **Warm Beige.** Core page background. |
| `{colors.bg.soft}` | `#F6F1E6` | **Oat / Cream.** Card surfaces, info callouts, secondary content blocks, dropdown menus, modal surfaces. |
| `{colors.bg.surface}` | `#D6C4AB` | **Sand Brown.** Input fields, footer, decorative depth layers, skeleton placeholders. |

### 2.3 Text

| Token | HEX | Contrast on `bg.main` | Usage |
| :--- | :--- | :--- | :--- |
| `{colors.text.primary}` | `#2E2E2E` | ~10.2:1 ✅ AAA | **Charcoal.** Headings, body copy, all button/badge text on Sage, Coral, or Active surfaces. |
| `{colors.text.secondary}` | `#5A5A5A` | ~5.2:1 ✅ AA | **Dark Grey.** Captions, metadata, placeholders, disabled-state text. |
| `{colors.text.inverse}` | `#FFFFFF` | — | **White.** Use **only** on `{colors.semantic.error}` `#C0574A` (≈4.5:1, AA borderline). |

> **Never use `#6F6F6F`** — the legacy v1.0 secondary text color failed WCAG AA at ~3.4:1 on `#E9DFC6`.

### 2.4 Semantic

| Token | Foreground HEX | Surface HEX | Usage |
| :--- | :--- | :--- | :--- |
| `{colors.semantic.success}` | `{colors.primary}` `#A3B18A` | `{colors.bg.soft}` `#F6F1E6` | Saved itineraries, confirmation toasts, completed states. |
| `{colors.semantic.info}` | `{colors.active}` `#7A9463` | `{colors.bg.soft}` `#F6F1E6` | AI recommendations, guidance, tips. **Visually distinct from success.** |
| `{colors.semantic.error}` | `#C0574A` | `#F5EBE8` | Validation errors, "Trip Not Found", destructive actions. |
| `{colors.semantic.warning}` | `#C9883B` | `#F5EBD8` | Soft alerts (e.g., "Selected dates are peak season"). Use sparingly. |

> **Why info ≠ success:** An AI recommendation and a saved-trip confirmation are **distinct user states** and must be distinguishable at a glance. Aliasing both to `#A3B18A` collapsed them. `#7A9463` is already in the palette, requires no new color, and is perceptually darker — communicating *active guidance* vs. *passive confirmation*.

### 2.5 Border & Divider

| Token | HEX / RGBA | Usage |
| :--- | :--- | :--- |
| `{colors.border.subtle}` | `rgba(46, 46, 46, 0.08)` | Card outlines, list dividers, table cell separators. |
| `{colors.border.strong}` | `rgba(46, 46, 46, 0.18)` | Form field borders at rest (when surface fill is insufficient). |
| `{colors.border.focus}` | `#A3B18A` | Form field focus border (1.5px). |

---

## 03. Typography

> **Locked decision:** The system uses **exactly two typefaces** — Copernicus and StyreneB. A third typeface requires a documented architectural reason. This is non-negotiable.

### 3.1 Font Families

- **Heading Font:** `Copernicus, Tiempos Headline, serif` — Sophisticated, editorial authority across **all heading levels (Display, H1, H2, H3, H4)**.
- **Body & UI Font:** `StyreneB, Inter, sans-serif` — Optimized for clarity in dense itinerary details, UI labels, captions, and footer text.

### 3.2 Font Substitutes (Fallback Chain)

| Primary | Fallback 1 | Fallback 2 |
| :--- | :--- | :--- |
| Copernicus | Tiempos Headline | `serif` |
| StyreneB | Inter | `system-ui, sans-serif` |

### 3.3 Type Hierarchy

| Level | Font | Size | Weight | Line Height | Letter Spacing |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display** | Copernicus | 64px | 600 | 1.1 | -0.01em |
| **H1** | Copernicus | 48px | 600 | 1.2 | 0 |
| **H2** | Copernicus | 32px | 600 | 1.2 | 0 |
| **H3** | Copernicus | 24px | 500 | 1.3 | 0 |
| **H4** | Copernicus | 20px | 500 | 1.35 | 0 |
| **Body Large** | StyreneB | 18px | 400 | 1.6 | 0 |
| **Body** | StyreneB | 16px | 400 | 1.6 | 0 |
| **Body Small** | StyreneB | 14px | 400 | 1.5 | 0 |
| **Caption** | StyreneB | 12px | 400 | 1.5 | `0.01em` |
| **UI Label / Footer** | StyreneB | 14px | 400 | 1.5 | `0.02em` |
| **Nav Link** | StyreneB | 16px | 500 | 1.4 | 0 |
| **Button Label** | StyreneB | 16px | 500 | 1 | `0.01em` |
| **Overline** | StyreneB | 12px | 500 | 1.4 | `0.08em` (UPPERCASE) |

### 3.4 Locked Weights — No Ranges

A weight range like `400–500` is a **deferred decision, not a token** — every developer would resolve it differently. All weights below are locked:

| Element | Weight | Notes |
| :--- | :--- | :--- |
| Display, H1, H2 | `600` | Editorial authority. |
| H3, H4 | `500` | Sub-section anchoring. |
| Body, Body Large, Body Small, Caption | `400` | Default reading. |
| UI Label, Footer, Tag default | `400` | |
| Nav Link, Button Label, Active Filter Pill, AI-Pick Badge, Overline | `500` | Documented exceptions to default 400 — interactive emphasis. |

### 3.5 Typography Principles

- **Warmth Through Serifs.** All Display + H1–H4 must use Copernicus to ground the AI technology in a human, editorial feel.
- **Readability Over Density.** Body text uses `line-height: 1.6` — tight enough for UI, generous enough for multi-line itinerary descriptions.
- **No Italic Serif Below 18px.** Copernicus italic loses clarity at small sizes. Use StyreneB italic for inline emphasis instead.
- **Numbers Are Tabular.** Itinerary times, prices, and dates use `font-variant-numeric: tabular-nums` for vertical alignment in lists.
- **Truncation.** Multi-line summaries clamp to 2 lines (`-webkit-line-clamp: 2`), single-line labels use `text-overflow: ellipsis` — never both at once.

---

## 04. Layout, Grid & Spacing

### 4.1 Spacing Scale (4px base)

| Token | Value | Usage |
| :--- | :--- | :--- |
| `space-1` | 4px | Icon gaps, tight internal padding |
| `space-2` | 8px | Tag inner padding, small component gaps |
| `space-3` | 12px | Input padding, compact list gaps |
| `space-4` | 16px | Standard component padding |
| `space-6` | 24px | Section separators, card inner spacing |
| `space-8` | 32px | Between card components |
| `space-12` | 48px | Between page sections |
| `space-16` | 64px | Major page-level separations |
| `space-24` | 96px | Hero-to-content separation on desktop |

### 4.2 Container & Grid

| Property | Value |
| :--- | :--- |
| **Max-width** | `1280px` (centered, hard cap — content must not exceed this at any viewport) |
| **Desktop (>1024px)** | 12-column grid · `gutter: 24px` · `padding-inline: 48px` |
| **Tablet (768–1024px)** | 8-column grid · `gutter: 20px` · `padding-inline: 24px` |
| **Mobile (<768px)** | 4-column grid · `gutter: 16px` · `padding-inline: 16px` |

> **Why the cap:** Without `max-width: 1280px`, layouts visibly break on displays ≥1440px — line lengths exceed comfortable reading measure (~75 characters), and editorial composition collapses into a stretched horizontal band.

### 4.3 Whitespace Philosophy

Layouts should never feel packed. Every recommendation is given room to breathe.

> **The Rule:** If content becomes too dense, **increase whitespace — never decrease font size.** Shrinking type to fit content into a fixed area is the opposite of editorial design.

### 4.4 Alignment

- Optical alignment takes precedence over mathematical alignment where they conflict (e.g., visually-centered icons inside circular buttons may sit 1px off geometric center).
- Body content is left-aligned. Center-alignment is reserved for hero sections, empty states, and modal headers.

---

## 05. Elevation & Depth

### 5.1 Shadow Scale

| Token | Value | Usage |
| :--- | :--- | :--- |
| `shadow-xs` | `0 1px 2px rgba(46, 46, 46, 0.06)` | Pressed-down state, ghost separators, sticky-header shadow |
| `shadow-sm` | `0 2px 8px rgba(46, 46, 46, 0.08)` | Card default / resting state, secondary button rest |
| `shadow-md` | `0 8px 24px rgba(46, 46, 46, 0.11)` | Card hover, dropdown menus, popovers |
| `shadow-lg` | `0 16px 40px rgba(46, 46, 46, 0.14)` | Modals, drawers, elevated overlays |
| `shadow-xl` | `0 24px 64px rgba(46, 46, 46, 0.18)` | Full-screen takeovers, AI generation overlay |

> All shadows use **brand charcoal** `rgba(46, 46, 46, ...)` — never default black. Black shadows on warm beige read as cold and synthetic.

### 5.2 Decorative Depth

Layered surfaces (Beige → Oat → Sand) establish depth through **color**, not weight. Avoid heavy borders or dark dropshadows for hierarchy.

```
Background hierarchy (bottom → top):
  bg.main (#E9DFC6) → bg.soft (#F6F1E6) → bg.surface (#D6C4AB) → white-tinted overlays
```

---

## 06. Shape & Border Radius

### 6.1 Radius Scale

The radius system is a **clean 4-point scale**: `8 / 12 / 16 / pill`. No off-grid values (10px is permanently retired).

| Token | Value | Usage |
| :--- | :--- | :--- |
| `radius-sm` | 8px | Input fields, dropdown items, error helper blocks, code blocks |
| `radius-lg` | 12px | **Buttons and action items only** |
| `radius-xl` | 16px | Destination cards, content sections, hero containers, modals, imagery, info callouts |
| `radius-pill` | 9999px | Tags, chips, badges, filter pills, toggles, avatars, progress bars |

> **Why cards and buttons differ:** When both shared `radius-lg: 12px`, the visual hierarchy between *interactive controls* and *content containers* flattened. Cards are now `radius-xl: 16px` (aligned with hero/modals/imagery) and buttons retain `radius-lg: 12px`. The shape itself communicates "this is a target" vs. "this is a vessel."

> **Tags vs. inputs:** Tags and chips are always `radius-pill` (fully rounded). The "tag-like" shape with `radius-sm` (8px) is reserved for input fields and dropdown items. If a label-style element needs rectangular corners, it is an input — not a tag.

### 6.2 Photography Treatment
All images use `radius-xl` (16px). Hero imagery uses `radius-xl`; never higher.

---

## 07. Iconography

### 7.1 Style
- **Stroke:** 2px, rounded line caps and joins.
- **Style:** Outline only — no filled icons except status badges (success check, error warning).
- **Grid:** 24×24 base, 2px padding inside the bounding box.
- **Color:** Inherits from `currentColor` (typically `text.primary` or `text.secondary`).

### 7.2 Sizes

| Size | Pixel | Usage |
| :--- | :--- | :--- |
| `icon-xs` | 16px | Inline with body text, tag prefixes, helper-text icons |
| `icon-sm` | 20px | Form inputs (chevron, password toggle), dense lists |
| `icon-md` | 24px | Default — buttons, navigation, cards |
| `icon-lg` | 32px | Empty states, feature highlights |
| `icon-xl` | 48px | Hero icons, illustration accents |

### 7.3 Icon Set Reference
Recommended families: **Lucide** or **Phosphor (Regular weight)**. Both ship outlined 2px-stroke families that match the editorial-warm voice. Avoid Material icons (too geometric) and Font Awesome (too generic).

> **Implementation:** Inline SVG with `stroke="currentColor"` and `stroke-width="2"` — never icon fonts (no a11y, no color inheritance precision).

---

## 08. Motion & Transitions

### 8.1 Easing — `linear` and default `ease` are PROHIBITED

| Purpose | Duration | Curve | Token |
| :--- | :--- | :--- | :--- |
| Micro-interactions (hover, focus, button press) | 150ms | `cubic-bezier(0.4, 0, 0.2, 1)` | `transition-fast` |
| Standard reveals (tooltips, badges, card hover) | 200ms | `cubic-bezier(0.4, 0, 0.2, 1)` | `transition-normal` |
| Scale-in (chips, toggle thumbs, switch state) | 250ms | `cubic-bezier(0.4, 0, 0.2, 1)` | `transition-scale` |
| Fade (content load, page transitions) | 250ms | `cubic-bezier(0.4, 0, 0.2, 1)` | `transition-fade` |
| Rise (dropdown menus, popover entrance) | 300ms | `cubic-bezier(0.4, 0, 0.2, 1)` | `transition-rise` |
| Modal / drawer entrance | 350ms | `cubic-bezier(0.4, 0, 0.2, 1)` | `transition-slow` |
| **Slide-up (AI result presentation)** | **400ms** | **`cubic-bezier(0.16, 1, 0.3, 1)`** | **`transition-slide`** |
| Skeleton shimmer (indeterminate loading) | 1400ms loop | `cubic-bezier(0.4, 0, 0.6, 1)` | `transition-shimmer` |

> **Why Expo Out for AI results:** The `cubic-bezier(0.16, 1, 0.3, 1)` curve decelerates sharply at the end — it communicates "AI thinking → result delivered." Standard ease curves feel mechanical for this moment. The motion *is* part of the story.

> **`transition-normal` covers card hover.** Earlier drafts had a separate `transition-card` token at the same 200ms / same curve — consolidated to `transition-normal` to remove redundancy. Card hover, tooltip entrance, and badge reveal share one token because they share one perceptual class: "subtle reveal."

### 8.2 Motion Principles

- **Reduced motion:** Honor `prefers-reduced-motion: reduce` — disable slide and scale, keep opacity-only fades at 100ms.
- **No bounce.** This system is calm, not playful. Never use spring physics with overshoot.
- **No more than 2 simultaneous animations** in a viewport. The eye cannot track more without anxiety.
- **Hover translate maximum:** `translateY(-2px)`. Never lift further — content cards are not menu items in a launchpad.
- **No animation on first paint.** Suppress entrance animations during initial hydration; play only on user-triggered or async-resolved transitions.

---

## 09. Components

> **Five-state contract:** Every interactive component MUST define `default`, `hover`, `active` (pressed), `focus-visible`, and `disabled`. Components missing any state are not shippable.

### 9.1 Buttons

#### Variants

| Variant | Background | Text | Radius | Min Height | Padding-X |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Primary** | `{colors.primary}` `#A3B18A` | `#2E2E2E` *(not white)* | `radius-lg` (12px) | 44px | 24px |
| **Secondary** | `{colors.bg.soft}` `#F6F1E6` | `#2E2E2E` | `radius-lg` (12px) | 44px | 24px |
| **Tertiary (Text)** | transparent | `{colors.active}` `#7A9463` | `radius-lg` (12px) | 44px | 12px |
| **Destructive** | `{colors.semantic.error}` `#C0574A` | `#FFFFFF` | `radius-lg` (12px) | 44px | 24px |
| **Icon** | transparent | `text.primary` | `radius-lg` (12px) | 44 × 44px | — *(icon-md `24px` centered)* |

> **Label spec:** All button labels use **Button Label** type token (StyreneB 16px / 500 / 0.01em letter-spacing). On mobile, padding-X may reduce to 16px to fit narrow viewports; min-height stays 44px.

#### Primary Button — All States

| State | Background | Text | Shadow | Other |
| :--- | :--- | :--- | :--- | :--- |
| `default` | `#A3B18A` | `#2E2E2E` | none | — |
| `hover` | `#8FA876` | `#2E2E2E` | `shadow-sm` | `transition-fast` |
| `active` (pressed) | `#7A9463` | `#2E2E2E` *(consistency, ~4.0:1 AA-large)* | `shadow-xs` | — |
| `focus-visible` | `#A3B18A` | `#2E2E2E` | none | `outline: 2px solid #2E2E2E; outline-offset: 3px` |
| `disabled` | `#A3B18A` @ 40% opacity | `#2E2E2E` @ 40% | none | `cursor: not-allowed`, no hover |
| `loading` | `#A3B18A` | spinner `#2E2E2E` (icon-sm) replaces label | none | `pointer-events: none`, `aria-busy="true"` |

#### Secondary Button — All States

| State | Background | Text | Shadow | Other |
| :--- | :--- | :--- | :--- | :--- |
| `default` | `#F6F1E6` | `#2E2E2E` | `shadow-sm` | — |
| `hover` | `#D6C4AB` | `#2E2E2E` | `shadow-md` | `transition-fast` |
| `active` | `#D6C4AB` | `#2E2E2E` | `shadow-xs` | — |
| `focus-visible` | `#F6F1E6` | `#2E2E2E` | `shadow-sm` | `outline: 2px solid #A3B18A; outline-offset: 3px` |
| `disabled` | `#F6F1E6` @ 40% | `#2E2E2E` @ 40% | none | `cursor: not-allowed` |

#### Tertiary Button (Text Link) — All States

| State | Text | Decoration | Notes |
| :--- | :--- | :--- | :--- |
| `default` | `#7A9463` | none | Trailing arrow `→` for "Read More" pattern |
| `hover` | `#5F7A4B` | underline 1px, offset 3px | — |
| `active` | `#5F7A4B` | underline | — |
| `focus-visible` | `#7A9463` | underline | `outline: 2px solid #A3B18A; outline-offset: 3px`, `border-radius: 4px` on outline |
| `disabled` | `#7A9463` @ 40% | none | — |

#### Destructive Button — All States

| State | Background | Text | Shadow | Other |
| :--- | :--- | :--- | :--- | :--- |
| `default` | `#C0574A` | `#FFFFFF` | none | — |
| `hover` | `#A6493D` | `#FFFFFF` | `shadow-sm` | `transition-fast` |
| `active` | `#8E3D32` | `#FFFFFF` | `shadow-xs` | — |
| `focus-visible` | `#C0574A` | `#FFFFFF` | none | `outline: 2px solid #2E2E2E; outline-offset: 3px` |
| `disabled` | `#C0574A` @ 40% | `#FFFFFF` @ 60% | none | `cursor: not-allowed` |

> **Why primary button focus uses `#2E2E2E`:** A `#A3B18A` outline on a `#A3B18A` surface produces a 1:1 contrast ratio — zero perceptible difference. The override to `#2E2E2E` restores WCAG 2.1 SC 1.4.11 (3:1 minimum between focus indicator and adjacent color). Use the default Sage outline on all beige/oat/surface backgrounds where it is visible.

---

### 9.2 Inputs & Forms

#### Default

| Property | Value |
| :--- | :--- |
| Background | `{colors.bg.surface}` `#D6C4AB` |
| Radius | `radius-sm` (8px) |
| Text | `#2E2E2E` |
| Placeholder | `#5A5A5A` |
| Border | none at rest (the surface fill *is* the boundary) |
| Padding | `12px 16px` |
| Min height | 44px |
| Font | StyreneB 16px / 400 |

#### Hover (cursor only — no styling change)
- Cursor `text` for text inputs. No background or border change at rest.

#### Focus
- Border: `1.5px solid #A3B18A`
- Outline: `2px solid #A3B18A`, `outline-offset: 3px`
- Background unchanged.
- Animate border with `transition-fast`.

#### Error
- Border: `1.5px solid #C0574A`
- Helper message in `#C0574A`, StyreneB 14px, below the field, with leading `icon-xs` warning icon.
- `aria-invalid="true"`, `aria-describedby` linked to helper-text id.

#### Disabled
- Background: `{colors.bg.surface}` @ 50% opacity
- Text: `#5A5A5A`
- Border: none
- Cursor: `not-allowed`
- Used during AI generation to indicate the platform is processing.

#### Read-only
- Background: transparent
- Border: 1px dashed `{colors.border.strong}`
- Cursor: default
- No focus border (still focusable for screen readers).

#### Field Spacing
- Label → Input: `8px`
- Input → Helper text: `4px`
- Field → Field (vertical stack): `20px`
- Inline icon (search, password toggle) → input edge: `12px`, icon-sm (20px).

#### Validation Trigger
- **On-blur** for first validation pass (less aggressive than on-change).
- **On-change** after first error appears (real-time correction).
- **On-submit** as a final guard.

---

### 9.3 Cards & Containers

#### Destination Card

- **Image:** Full-width, top, `radius-xl: 16px` rounded (the card itself shares the radius — image and card top corners align via `overflow: hidden` on parent).
- **Title:** Copernicus 24px / 500, `#2E2E2E`.
- **Summary:** StyreneB 16px / 400, `#5A5A5A`, max 2 lines with ellipsis.
- **CTA (optional):** Tertiary button "Read More →"
- **Padding:** `24px` (card body, below image).
- **Radius:** `radius-xl` (16px).
- **Aspect ratio (image):** `4 / 3` default, `16 / 9` for hero variants.

#### Card States

| State | Background | Shadow | Transform |
| :--- | :--- | :--- | :--- |
| `default` | `{colors.bg.soft}` `#F6F1E6` | `shadow-sm` | none |
| `hover` | `{colors.bg.soft}` | `shadow-md` | `translateY(-2px)` · `transition-normal` |
| `focus-visible` | `{colors.bg.soft}` | `shadow-md` | `outline: 2px solid #A3B18A; outline-offset: 3px` |
| `active` (pressed) | `{colors.bg.soft}` | `shadow-xs` | `translateY(0)` |
| `disabled` (rare) | `{colors.bg.soft}` @ 50% | none | none — `cursor: not-allowed` |

> **Hover lift cap:** Never exceed `translateY(-2px)`. Cards are content vessels, not hover-launchpad apps. A taller lift breaks the "calm" principle.

> **Whole-card link pattern:** Use `<a>` wrapping the card with the visible CTA inside. Avoid nested `<a>` tags. For non-clickable cards, omit `tabindex` — don't make a card focusable just for visual consistency.

---

### 9.4 Top Navigation

- **Layout:** Left-aligned logo (AltairGo) · Center-aligned links (Explore, My Trips, Journal) · Right-aligned Profile/Avatar.
- **Height:** 72px desktop, 64px tablet, 56px mobile.
- **Background:** `{colors.bg.main}` `#E9DFC6`. Sticky on scroll with subtle `shadow-xs` after `40px` scrolled.
- **Link style:** **Nav Link** type token (StyreneB 16px / 500, `#2E2E2E`).
- **Active state:** `{colors.active}` `#7A9463` underline indicator (2px, offset 6px below baseline). **Text color does not change.**
- **Hover state:** Underline appears in `{colors.hover}` `#8FA876`, 1px, offset 6px, `transition-fast`.

> **Why one indicator, not two:** Applying both an underline *and* a text color shift on a 4px-tall element produces chromatic noise on the beige nav background. One indicator is sufficient; two compete.

---

### 9.5 Tags, Chips & Badges

> All variants share `radius-pill` (9999px). The shape is not the differentiator — color and content are.

#### Default Pill (Tag) — All States

| State | Background | Text | Border |
| :--- | :--- | :--- | :--- |
| `default` | `{colors.bg.surface}` `#D6C4AB` | `#2E2E2E` | none |
| `hover` (clickable) | `#C8B498` | `#2E2E2E` | none |
| `active` | `#BAA585` | `#2E2E2E` | none |
| `focus-visible` | `{colors.bg.surface}` | `#2E2E2E` | `outline: 2px solid #A3B18A; outline-offset: 2px` |
| `disabled` | `{colors.bg.surface}` @ 50% | `#5A5A5A` | none |

- **Font:** StyreneB 14px / 400.
- **Padding:** `6px 14px`.
- **Optional leading icon:** `icon-xs` (16px), 2px stroke, `currentColor`.

#### Filter Chip — All States (Active variant)

| State | Background | Text | Notes |
| :--- | :--- | :--- | :--- |
| `default` (unselected) | `{colors.bg.surface}` `#D6C4AB` | `#2E2E2E` | matches Default Pill default |
| `hover` (unselected) | `#C8B498` | `#2E2E2E` | — |
| `selected (default)` | `{colors.primary}` `#A3B18A` | `#2E2E2E` | leading check icon `icon-xs` |
| `selected hover` | `#8FA876` | `#2E2E2E` | — |
| `focus-visible` | inherit selection | `#2E2E2E` | `outline: 2px solid #2E2E2E; outline-offset: 2px` *(Sage-on-Sage override)* |
| `disabled` | `{colors.bg.surface}` @ 50% | `#5A5A5A` | — |

- **Active filter pill text weight:** 500 (documented exception per Section 3.4).

#### AI Pick / Recommended Badge

- **Background:** `{colors.accent}` `#E7A27B`.
- **Text:** `#2E2E2E`, weight 500.
- **Use:** Sparingly — only "Smart Recommendations," "AI Picks," "Special Offers."
- **Not interactive** — badges are non-clickable status markers, no hover/active states.

---

### 9.6 AI Recommendation / Info Callout

- **Background:** `{colors.bg.soft}` `#F6F1E6`.
- **Left accent:** 4px solid `{colors.semantic.info}` `#7A9463`, applied as `border-left` on the callout container.
- **Text:** `#2E2E2E`, Body Large preferred for the headline + Body for description.
- **Optional badge prefix:** "AI Pick" using the AI Pick badge spec above, placed at the top-left of the callout content.
- **Padding:** `16px 20px` (left padding visually 24px because of the 4px border).
- **Radius:** `radius-xl` (16px).

#### Implementation

```css
.ai-callout {
  background: var(--color-bg-soft);
  border-left: 4px solid var(--color-semantic-info);
  border-radius: var(--radius-xl);
  padding: 16px 20px;
  overflow: hidden; /* clips the border at the rounded corner */
}
```

The border-left is clipped by the parent's `border-radius` — no pseudo-element gymnastics required. Verified in all evergreen browsers.

> **Distinct from success:** Info uses `#7A9463`. Success uses `#A3B18A`. **Never conflate them.** AI guidance and saved-state confirmation are different user moments.

---

### 9.7 Error State (Block)

| Property | Value |
| :--- | :--- |
| Surface | `#F5EBE8` |
| Text | `#C0574A`, StyreneB 14px |
| Icon | Outline warning, 2px stroke, `#C0574A`, `icon-sm` (20px) |
| Heading (optional) | Copernicus 20px / 500, `#C0574A` |
| Use cases | "Trip Not Found" · validation failures · connectivity errors · form submission errors |
| Radius | `radius-xl` (16px) for full surface, `radius-sm` (8px) for inline field errors |
| Padding | `16px 20px` (block) — inline field error has no surface, just helper text |

> Inline field errors are specified in Section 9.2 — use the block error only for full-feature failures (page-level, modal-level).

---

### 9.8 Progress Bar

| Property | Value |
| :--- | :--- |
| Track | `{colors.bg.surface}` `#D6C4AB` |
| Fill | `{colors.primary}` `#A3B18A` |
| Height | 8px |
| Radius | `radius-pill` (9999px) on track and fill |
| Animation (determinate) | Width transition `400ms cubic-bezier(0.16, 1, 0.3, 1)` |
| Label | StyreneB 14px / 500 above-right (e.g., "75%") |
| Indeterminate | Shimmer band moves left→right across track, 1400ms loop, `transition-shimmer` |
| ARIA | `role="progressbar"` + `aria-valuenow`, `aria-valuemin`, `aria-valuemax` |

---

### 9.9 Dropdown / Select

#### Trigger
- Inherits **Input** styles (Section 9.2).
- Trailing chevron icon, `icon-sm` (20px), rotates 180° when open (`transition-fast`).
- `aria-haspopup="listbox"`, `aria-expanded` toggled.

#### Menu

| Property | Value |
| :--- | :--- |
| Background | `{colors.bg.soft}` `#F6F1E6` |
| Shadow | `shadow-md` |
| Radius | `radius-xl` (16px) |
| Padding | `8px` |
| Min-width | matches trigger width |
| Max-height | `320px`, scrollable |
| Animation | `transition-rise` (300ms fade + 4px translate-up) |
| Z-index | `z-popover` (see Section 12) |

#### Item — All States

| State | Background | Text | Notes |
| :--- | :--- | :--- | :--- |
| `default` | transparent | `#2E2E2E` | — |
| `hover` | `{colors.bg.surface}` `#D6C4AB` | `#2E2E2E` | — |
| `active` (pressed) | `#C8B498` | `#2E2E2E` | — |
| `focus-visible` (keyboard) | `{colors.bg.surface}` | `#2E2E2E` | no outline — background acts as indicator inside the menu |
| `selected` | `{colors.bg.surface}` | `#2E2E2E` | leading check `icon-xs` `#7A9463` |
| `disabled` | transparent | `#5A5A5A` | `cursor: not-allowed`, `aria-disabled="true"` |

- **Item padding:** `12px 16px`.
- **Item radius:** `radius-sm` (8px).
- **Item height:** 44px minimum (touch target).
- **Section divider** (between item groups): 1px `{colors.border.subtle}`, `margin: 4px 0`.

---

### 9.10 Toggle / Switch

#### Geometry
- Track: 44 × 24px, `radius-pill`.
- Thumb: 20px circle, `#FFFFFF`, `shadow-sm`. Inset 2px from track edge.

#### States

| State | Off (track / thumb) | On (track / thumb) |
| :--- | :--- | :--- |
| `default` | `#D6C4AB` / `#FFFFFF` | `#A3B18A` / `#FFFFFF` |
| `hover` | `#C8B498` / `#FFFFFF` | `#8FA876` / `#FFFFFF` |
| `active` (pressed) | `#BAA585` / `#FFFFFF` | `#7A9463` / `#FFFFFF` |
| `focus-visible` | inherit | inherit (`outline: 2px solid #A3B18A; outline-offset: 3px`) |
| `disabled` | `#D6C4AB` @ 40% / `#FFFFFF` @ 60% | `#A3B18A` @ 40% / `#FFFFFF` @ 60% |

- **Thumb position transition:** `transition-scale` (250ms) — affects `transform: translateX()` and track background concurrently.
- **Label:** Always paired with a visible label (left or right of the track). Standalone toggles fail accessibility.
- **ARIA:** `role="switch"` + `aria-checked`.

---

### 9.11 Modal / Drawer

| Property | Desktop Modal | Mobile Drawer (<768px) |
| :--- | :--- | :--- |
| Backdrop | `rgba(46, 46, 46, 0.4)` + `backdrop-filter: blur(4px)` | same |
| Surface | `{colors.bg.soft}` `#F6F1E6` | same |
| Radius | `radius-xl` (16px) | `radius-xl` on **top corners only** (`16px 16px 0 0`) |
| Shadow | `shadow-lg` | `shadow-lg` (top edge only — visual cue) |
| Width | `560px` default · `720px` wide variant | `100vw` (full width) |
| Height | auto, max `min(720px, 90vh)` | `auto`, max `90vh`, scrollable body |
| Position | viewport-centered | bottom-anchored |
| Padding | `32px` | `24px` body, with sticky header (16px) and sticky footer (16px) for actions |
| Entrance | Backdrop `transition-fade`; surface `transition-slow` (350ms) + 16px translate-up | Backdrop `transition-fade`; surface `transition-slow` slide from `translateY(100%)` to `0` |
| Drag-to-dismiss | not applicable | optional — drag handle (4×40px pill) at top, dismiss when dragged >120px |
| Close | ESC, backdrop click, close icon (top-right, 44×44 hit target) | ESC, backdrop tap, close icon, drag-to-dismiss |
| Focus | First focusable element on open; trap inside; restore to trigger on close | same |
| Z-index | `z-modal` (see Section 12) | same |

---

### 9.12 Footer

- **Background:** `{colors.bg.surface}` `#D6C4AB`.
- **Text:** StyreneB 14px, `letter-spacing: 0.02em`, color `#5A5A5A`.
- **Padding:** `48px 0` desktop, `32px 0` mobile.
- **Branding line:** *"Warm. Calm. Editorial. Premium."* — StyreneB 14px, centered, `#5A5A5A`.
- **Link rows:** Grouped by category (Product · Company · Resources · Legal), 4 columns desktop, stacked mobile.
- **Link hover:** `#2E2E2E` text, no underline (footer text is dense — underlines clutter).

---

### 9.13 Tooltip

| Property | Value |
| :--- | :--- |
| Background | `#2E2E2E` (charcoal — only inverted surface in the system) |
| Text | `#FFFFFF`, StyreneB 14px / 400 |
| Radius | `radius-sm` (8px) |
| Padding | `8px 12px` |
| Max-width | `240px` |
| Shadow | `shadow-md` |
| Arrow | 6px equilateral triangle, same fill as background |
| Distance from target | 8px |
| Entrance | `transition-normal` (200ms fade + 4px translate from anchor edge) |
| Delay (show) | 400ms hover/focus before reveal |
| Delay (hide) | 150ms |
| Z-index | `z-tooltip` (see Section 12) |
| ARIA | `role="tooltip"`, target has `aria-describedby` |

> **When to use a tooltip:** explanatory metadata only ("Last updated 2 days ago"). **Never** for primary actions, error messages, or critical info — those need persistent UI.

---

### 9.14 Skeleton / Loading States

> Resolves the v3.0 P0 known gap. The `transition-slide` AI result animation needs a runway — this is it.

#### Skeleton Block

| Property | Value |
| :--- | :--- |
| Background | `{colors.bg.surface}` `#D6C4AB` |
| Shimmer overlay | linear gradient `90deg, transparent 0%, rgba(255,255,255,0.35) 50%, transparent 100%`, animated `transition-shimmer` (1400ms loop) |
| Radius | matches the element being replaced (`radius-sm` for input/text, `radius-xl` for card image, `radius-pill` for tags) |
| Heights (text placeholders) | `12px` for caption, `16px` for body, `24px` for H3, `32px` for H2 |
| Width (text placeholders) | `100%` for first line, `60–80%` for last line (creates natural rag) |
| Spacing | match the type's line-height — skeleton lines stack at `1.6 × text-height` |

#### Card Skeleton Composition
1. Image placeholder — full-width, `aspect-ratio: 4/3`, `radius-xl`.
2. Title placeholder — 24px tall, 70% width, `margin-top: 24px`.
3. Summary placeholders — 2 lines, 16px tall, 100% / 60% width, `margin-top: 12px`.

#### Behavior
- **Min duration:** 400ms even if content arrives sooner — prevents flash of skeleton.
- **Max duration:** 8s — beyond this, swap to error or "still working" state.
- **Not interactive:** `aria-busy="true"` on the container, `aria-hidden="true"` on the skeleton blocks themselves.
- **Reduced motion:** Static placeholder (no shimmer), opacity pulse at 100% → 70% → 100% over 2000ms.

---

### 9.15 Empty State

For lists, search results, or new-user surfaces with no content.

| Property | Value |
| :--- | :--- |
| Layout | center-aligned, `max-width: 480px`, vertically centered in the empty container |
| Icon | `icon-xl` (48px), outline, `{colors.text.secondary}` `#5A5A5A` |
| Title | Copernicus 24px / 500, `#2E2E2E`, `margin-top: 16px` |
| Description | StyreneB 16px / 400, `#5A5A5A`, `margin-top: 8px`, max 2 lines |
| CTA (optional) | Primary or Secondary button, `margin-top: 24px` |
| Spacing from container edges | `64px` minimum top/bottom padding |

> **Tone:** Empty states are an opportunity to set the tone. "No saved trips yet — let's plan your first one." not "No data found."

---

### 9.16 Avatar

| Property | Value |
| :--- | :--- |
| Shape | `radius-pill` (circle) |
| Sizes | `sm` 24px, `md` 32px, `lg` 48px, `xl` 72px |
| Image | `object-fit: cover`, `aspect-ratio: 1` |
| Fallback (no image) | `{colors.bg.surface}` background, initials in Copernicus 500 (size scales with avatar) |
| Border (optional, for stacks) | 2px solid `{colors.bg.main}` to separate overlapping avatars |
| Status dot (optional) | 25% of avatar size, `radius-pill`, bottom-right anchored, 2px white inset border |

---

## 10. Accessibility & Focus States

> **Non-negotiable: WCAG 2.1 AA across the entire system.**

### 10.1 Focus-Visible Specification

Every interactive element must implement a visible focus indicator using the `:focus-visible` selector (not `:focus` — that fires on mouse click and creates visual noise).

#### Default Focus
```css
:focus-visible {
  outline: 2px solid #A3B18A;  /* {colors.primary} */
  outline-offset: 3px;
}
```

#### Primary Button & Sage-on-Sage Override
```css
.btn-primary:focus-visible,
.filter-chip[aria-pressed="true"]:focus-visible {
  outline: 2px solid #2E2E2E;  /* Sage on Sage = invisible — override required */
  outline-offset: 3px;
}
```

Applies to: buttons, inputs, navigation links, cards with `tabindex`, toggles, dropdown triggers, filter chips, and any keyboard-reachable element.

### 10.2 Contrast Audit Reference

> Values computed via WCAG 2.x sRGB relative-luminance formula. `AA-normal` = 4.5:1, `AA-large` = 3:1 (≥18px or ≥14px-bold), `UI components` = 3:1.

| Pairing | Ratio | Status |
| :--- | :--- | :--- |
| `#2E2E2E` on `#E9DFC6` | ~10.2:1 | ✅ AAA |
| `#2E2E2E` on `#F6F1E6` | ~11.0:1 | ✅ AAA |
| `#2E2E2E` on `#D6C4AB` | ~7.8:1 | ✅ AAA |
| `#5A5A5A` on `#E9DFC6` | ~5.2:1 | ✅ AA-normal |
| `#5A5A5A` on `#F6F1E6` | ~5.6:1 | ✅ AA-normal |
| `#2E2E2E` on `#A3B18A` | ~6.0:1 | ✅ AA-normal |
| `#2E2E2E` on `#E7A27B` | ~6.4:1 | ✅ AA-normal |
| `#2E2E2E` on `#7A9463` | ~4.0:1 | ⚠️ AA-large / UI only |
| `#FFFFFF` on `#7A9463` | ~3.4:1 | ⚠️ AA-large / UI only |
| `#FFFFFF` on `#C0574A` | ~4.5:1 | ✅ AA-normal (borderline) |
| `#C0574A` on `#F5EBE8` | ~4.7:1 | ✅ AA-normal |
| ❌ `#FFFFFF` on `#A3B18A` | ~2.3:1 | ❌ FAIL |
| ❌ `#FFFFFF` on `#E7A27B` | ~2.1:1 | ❌ FAIL |
| ❌ `#6F6F6F` on `#E9DFC6` | ~3.4:1 | ❌ FAIL (legacy v1.0) |

### 10.3 Other A11y Requirements

- **Touch targets:** 44×44px minimum for all interactive elements.
- **Keyboard nav:** All flows completable without a mouse. Tab order matches visual order.
- **Reduced motion:** Honor `prefers-reduced-motion: reduce`.
- **Screen reader labels:** All icon-only buttons must have `aria-label`. Form inputs must have associated `<label>` (visible or `sr-only`).
- **Focus trap:** Modals and drawers trap focus until dismissed.
- **Skip link:** "Skip to main content" link, visible on focus, before nav.
- **Color is never the only signifier.** Errors include an icon. Active nav has an underline. Status badges include text.
- **ARIA live regions:** Use `aria-live="polite"` for AI result announcements, `aria-live="assertive"` only for blocking errors.
- **Heading hierarchy:** No skipped levels (no H1 → H3 jumps). Each page has exactly one H1.

---

## 11. Imagery & Mood Direction

### 11.1 Photographic Voice
- **Subject:** Natural landscapes, candid travel moments, considered domestic interiors. Avoid stock-photo gestures (high-fives, fake laughter, business handshakes).
- **Light:** Warm golden-hour or soft overcast. Avoid harsh midday flash and saturated digital filters.
- **Composition:** Generous negative space — the system's "calm" principle extends into imagery.
- **Color treatment:** Slight warm grade (+5 temp, -3 saturation) so images harmonize with the beige/sage palette rather than competing with it.

### 11.2 Imagery Don'ts
- No oversaturated travel-influencer aesthetics.
- No drone hero shots that lack human scale.
- No "AI-generated" looking imagery (extra fingers, melted geometry) — even if AI-generated, regenerate until clean.
- No imagery with hard black shadows or pure-white blowouts that clash with the warm palette.

### 11.3 Image Treatment
- All imagery uses `radius-xl` (16px).
- Subtle inner ring `inset 0 0 0 1px rgba(46, 46, 46, 0.06)` to define edge against beige backgrounds.
- Lazy-load below-the-fold; use blurred LQIP placeholder in `{colors.bg.surface}` tone during load (see Skeleton, Section 9.14).
- Specify `width` and `height` (or `aspect-ratio`) on every `<img>` to prevent CLS.

---

## 12. Z-Index Scale

> A flat, semantic z-index scale prevents the `z-index: 99999` arms race. Every layered element maps to one of these tokens.

| Token | Value | Usage |
| :--- | :--- | :--- |
| `z-base` | 0 | Default in-flow content |
| `z-raised` | 10 | Raised cards, sticky table headers |
| `z-dropdown` | 100 | Dropdown menus, autocomplete results |
| `z-sticky` | 200 | Sticky top navigation, sticky CTAs |
| `z-popover` | 300 | Popovers, date pickers, custom select panels |
| `z-overlay` | 400 | Backdrop / scrim under modals |
| `z-modal` | 500 | Modal surfaces, drawers |
| `z-toast` | 600 | Notifications, toasts (above modals so a save-confirmation can appear over a closing modal) |
| `z-tooltip` | 700 | Tooltips — always topmost so they can clarify any UI |

> **Rule:** Never use a numeric z-index outside this scale. Never use `z-index: 99999`. If a new layer is needed, add a token here and document its place in the stack.

---

## 13. Do's & Don'ts

### Do

- ✅ Use Coral (`#E7A27B`) **sparingly** — only for "Smart Recommendations," "AI Picks," or "Special Offers."
- ✅ Allow images to occupy significant real estate to inspire exploration.
- ✅ Define **all five** interactive states (default, hover, active, focus-visible, disabled) for every interactive component.
- ✅ Verify contrast ratios before shipping any color pairing — minimum 4.5:1 for body text, 3:1 for large text and UI components.
- ✅ Constrain all layouts to `max-width: 1280px`.
- ✅ Use `{colors.text.primary}` `#2E2E2E` for all text on Sage, Coral, and Active surfaces.
- ✅ Use `:focus-visible` (not `:focus`) for keyboard focus indicators.
- ✅ Honor `prefers-reduced-motion`.
- ✅ Specify `width`, `height`, or `aspect-ratio` on every image to prevent CLS.
- ✅ Use the Z-Index scale (Section 12) — never numeric z-index outside it.

### Don't

- ❌ Don't use white text (`#FFFFFF`) on `{colors.primary}` `#A3B18A` — fails WCAG AA at ~2.3:1.
- ❌ Don't use white text on `{colors.accent}` `#E7A27B` — fails WCAG AA at ~2.1:1.
- ❌ Don't use white text on `{colors.active}` `#7A9463` for body-size labels — only AA-large (≥18px or ≥14px-bold).
- ❌ Don't use pure black (`#000000`) or neon colors — they violate the Natural design principle.
- ❌ Don't use sharp corners — `border-radius: 0` is never acceptable in this system.
- ❌ Don't use `linear` or default `ease` for transitions — always specify a `cubic-bezier` curve.
- ❌ Don't introduce a third typeface without a documented architectural reason.
- ❌ Don't use `#6F6F6F` on `#E9DFC6` — fails WCAG AA at 3.4:1.
- ❌ Don't use `border-radius: 10px` — off-grid, permanently retired.
- ❌ Don't alias `info` and `success` to the same color — distinct user states demand distinct colors.
- ❌ Don't omit `:focus-visible` — keyboard accessibility is non-negotiable.
- ❌ Don't apply both underline and text color shift on nav active states — one indicator only.
- ❌ Don't use a weight range (`400–500`, `500–600`) — ranges are deferred decisions, not tokens.
- ❌ Don't lift cards more than `translateY(-2px)` on hover.
- ❌ Don't use shadows with default black — always use `rgba(46, 46, 46, ...)`.
- ❌ Don't use tooltips for critical info — they're for explanatory metadata only.
- ❌ Don't show a skeleton for less than 400ms — produces a jarring flash.

---

## 14. Responsive Behavior

### 14.1 Breakpoints

| Breakpoint | Range | Grid | Padding-X | Notes |
| :--- | :--- | :--- | :--- | :--- |
| Mobile | <768px | 4-column | 16px | Nav collapses to menu icon; sticky bottom bar for "Plan Trip" CTA |
| Tablet | 768–1024px | 8-column | 24px | Cards stack 2-up; inputs full-width |
| Desktop | >1024px | 12-column | 48px | Standard layout, max-width 1280px |
| Wide | ≥1440px | 12-column | auto (margins absorb) | Layout caps at 1280px; whitespace expands |

### 14.2 Touch Targets
- **Minimum:** 44×44px for all interactive elements — buttons, links, icons, form controls, toggles.

### 14.3 Collapsing Strategy

- Top nav collapses to hamburger on mobile.
- Primary "Plan Trip" CTA stays accessible via **sticky bottom bar** (mobile) or **persistent header button** (tablet/desktop).
- Multi-column card grids reflow: 3-up → 2-up → 1-up at desktop → tablet → mobile.
- Modals on mobile become **bottom drawers** (sheet pattern) per Section 9.11 with rounded top corners only.
- Tooltips on touch devices: long-press triggers (500ms hold) — or omit and rely on persistent helper text.

### 14.4 Type Scaling
- Display, H1 reduce one step on mobile (Display 64→48px, H1 48→36px).
- H2, H3, H4, body sizes do **not** scale down — readability is preserved across breakpoints.

---

## 15. Quick Reference Tokens

```
SPACING SCALE (4px base):
  4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 px

TYPE SCALE:
  Display:     64px / 600 / lh:1.1 / -0.01em
  H1:          48px / 600 / lh:1.2
  H2:          32px / 600 / lh:1.2     ← weight locked
  H3:          24px / 500 / lh:1.3
  H4:          20px / 500 / lh:1.35
  Body L:      18px / 400 / lh:1.6
  Body:        16px / 400 / lh:1.6
  Small:       14px / 400 / lh:1.5     ← weight locked
  Caption:     12px / 400 / lh:1.5
  UI/Footer:   14px / 400 / lh:1.5 / 0.02em
  Nav Link:    16px / 500 / lh:1.4
  Button:      16px / 500 / lh:1   / 0.01em
  Overline:    12px / 500 / 0.08em UPPERCASE

FONTS:
  Headings (Display, H1–H4):  Copernicus, Tiempos Headline, serif
  Body / UI / Footer:         StyreneB, Inter, sans-serif

BORDER RADIUS:
  sm:   8px      → inputs, dropdown items, error helpers
  lg:   12px     → buttons & action items only
  xl:   16px     → cards, hero, modals, imagery, callouts
  pill: 9999px   → tags, chips, badges, toggles, avatars, progress

SHADOWS (always rgba(46,46,46,...)):
  xs: 0 1px 2px  /0.06   sm: 0 2px 8px  /0.08
  md: 0 8px 24px /0.11   lg: 0 16px 40px /0.14   xl: 0 24px 64px /0.18

COLORS:
  Primary:        #A3B18A  (button bg, success — DARK text #2E2E2E)
  Accent:         #E7A27B  (badges, highlights — DARK text #2E2E2E)
  Hover:          #8FA876
  Active:         #7A9463  (pressed, info/AI — DARK text #2E2E2E preferred)
  BG Main:        #E9DFC6
  BG Soft:        #F6F1E6
  BG Surface:     #D6C4AB
  Text Primary:   #2E2E2E  (AAA on bg.main, AA on Sage/Coral)
  Text Secondary: #5A5A5A  (AA on bg.main)
  Text Inverse:   #FFFFFF  (only on Error #C0574A)
  Error:          #C0574A   |  Surface: #F5EBE8
  Warning:        #C9883B   |  Surface: #F5EBD8
  Info:           #7A9463   |  Surface: #F6F1E6
  Success:        #A3B18A   |  Surface: #F6F1E6
  Tooltip BG:     #2E2E2E  (only inverted surface in system)

SEMANTIC TOKENS:
  success → #A3B18A  (saved, confirmed)
  info    → #7A9463  (AI tips, guidance)
  warning → #C9883B  (soft alerts)
  error   → #C0574A  (validation, destructive)

BUTTON TEXT (CRITICAL — all dark except destructive):
  Primary  bg #A3B18A      → text #2E2E2E   ← NOT WHITE (any state)
  Secondary bg #F6F1E6     → text #2E2E2E
  Tertiary bg transparent  → text #7A9463
  Destructive bg #C0574A   → text #FFFFFF
  Active state bg #7A9463  → text #2E2E2E   ← changed in v3.1 for AA-normal

BADGE TEXT:
  AI Pick / Recommended bg #E7A27B → text #2E2E2E  ← NOT WHITE

TRANSITIONS:
  Fast (hover):     150ms cubic-bezier(0.4, 0, 0.2, 1)
  Normal (reveal):  200ms cubic-bezier(0.4, 0, 0.2, 1)  ← also: card hover
  Scale (chips):    250ms cubic-bezier(0.4, 0, 0.2, 1)
  Fade (load):      250ms cubic-bezier(0.4, 0, 0.2, 1)
  Rise (entrance):  300ms cubic-bezier(0.4, 0, 0.2, 1)
  Slow (modal):     350ms cubic-bezier(0.4, 0, 0.2, 1)
  Slide (AI):       400ms cubic-bezier(0.16, 1, 0.3, 1)  ← Expo Out
  Shimmer:          1400ms loop cubic-bezier(0.4, 0, 0.6, 1)

FOCUS:
  Default:                outline: 2px solid #A3B18A; outline-offset: 3px
  Primary button & Sage:  outline: 2px solid #2E2E2E; outline-offset: 3px  ← override
  Selector:               :focus-visible (NOT :focus)

CONTAINER:
  max-width:      1280px (centered, hard cap)
  padding-inline: 48px (desktop) / 24px (tablet) / 16px (mobile)

GRID:
  Desktop: 12-col, 24px gutter
  Tablet:   8-col, 20px gutter
  Mobile:   4-col, 16px gutter

ICONOGRAPHY:
  Style:  outline, 2px stroke, rounded caps
  Sizes:  16 / 20 / 24 / 32 / 48 px
  Family: Lucide or Phosphor (Regular)

Z-INDEX:
  base 0 · raised 10 · dropdown 100 · sticky 200 · popover 300 ·
  overlay 400 · modal 500 · toast 600 · tooltip 700

TOUCH TARGETS:
  Minimum: 44 × 44 px

A11Y:
  WCAG 2.1 AA — non-negotiable
  Honor prefers-reduced-motion
  Color never the sole signifier
  ARIA live: polite for AI results, assertive for blocking errors
  Single H1 per page, no skipped heading levels
```

---

## 16. Known Gaps & Roadmap

| Gap | Priority | Target | Notes |
| :--- | :--- | :--- | :--- |
| **Map UI** | P1 | Dedicated spec doc | Map markers, cluster indicators, geolocation patterns require a standalone Map Component Spec. Cannot be handled inline. |
| **Notification / Toast** | P1 | v3.2 | Stacking rules, auto-dismiss timing, action-button variant, swipe-to-dismiss on mobile. |
| **Date / Time Pickers** | P1 | v3.2 | Calendar component for trip date selection, multi-date range support. |
| **Data Visualization** | P2 | v3.3 | Charts for trip insights (distance, cost breakdowns). Color extensions of palette required. |
| **Email Templates** | P2 | v3.3 | Constrained palette + table-based layouts for legacy email clients. |
| **Pagination & Infinite Scroll** | P2 | v3.2 | Pattern decision: numbered pagination vs. "Load more" button vs. infinite scroll for itinerary lists. |
| **Print Stylesheet** | P3 | v3.4 | Itinerary export — neutralize backgrounds, respect ink budget. |
| **Internationalization** | P3 | v4.0 | RTL support, type scaling for CJK glyphs, Copernicus fallback chains for non-Latin scripts. |
| ~~**Skeleton / Loading States**~~ | ~~P0~~ | ~~v3.1~~ | ✅ Resolved — see Section 9.14. |
| ~~**Tooltip**~~ | ~~P1~~ | ~~v3.1~~ | ✅ Resolved — see Section 9.13. |
| ~~**Empty State**~~ | ~~P1~~ | ~~v3.1~~ | ✅ Resolved — see Section 9.15. |
| ~~**Z-Index Scale**~~ | ~~P1~~ | ~~v3.1~~ | ✅ Resolved — see Section 12. |
| ~~**Input Disabled State**~~ | ~~P1~~ | ~~v2.2~~ | ✅ Resolved — Section 9.2. |
| ~~**Off-grid `radius-md: 10px`**~~ | ~~P1~~ | ~~v2.1~~ | ✅ Resolved — eliminated. |
| ~~**Primary button text contrast**~~ | ~~P0~~ | ~~v2.2~~ | ✅ Resolved — `#2E2E2E` on `#A3B18A`. |

> **Dark Mode is explicitly out of scope.** The product direction is a single, warm, light-mode experience. Dark mode is not on the roadmap and should not be designed for in this system.

---

## Appendix A — Migration Notes from v2.x

If you are upgrading existing surfaces from v2.0, v2.1, or v3.0:

1. **Replace all `#FFFFFF` on `#A3B18A`** primary button text with `#2E2E2E`.
2. **Replace `#FFFFFF` on `#7A9463`** in primary-button active state with `#2E2E2E` (v3.1 change).
3. **Replace all `radius-md: 10px`** with `radius-lg: 12px` (buttons) or `radius-xl: 16px` (cards).
4. **Promote destination cards** from `radius-lg` to `radius-xl`.
5. **Replace `#6F6F6F`** secondary text with `#5A5A5A`.
6. **Add `:focus-visible` outlines** to every interactive element.
7. **Switch info-state color** from `#A3B18A` to `#7A9463`.
8. **Replace any weight ranges** (`400–500`, `500–600`) with locked single weights from Section 3.4.
9. **Verify shadow opacity** — bump any `0.05` shadows to `0.08`.
10. **Replace numeric z-index values** with tokens from Section 12.
11. **Replace `transition-card`** with `transition-normal` (consolidated in v3.1).

---

## Appendix B — Implementation: CSS Variables & Tailwind Config

### B.1 CSS Custom Properties

```css
:root {
  /* Colors — Brand */
  --color-primary: #A3B18A;
  --color-accent: #E7A27B;
  --color-hover: #8FA876;
  --color-active: #7A9463;

  /* Colors — Surfaces */
  --color-bg-main: #E9DFC6;
  --color-bg-soft: #F6F1E6;
  --color-bg-surface: #D6C4AB;

  /* Colors — Text */
  --color-text-primary: #2E2E2E;
  --color-text-secondary: #5A5A5A;
  --color-text-inverse: #FFFFFF;

  /* Colors — Semantic */
  --color-success: #A3B18A;
  --color-success-surface: #F6F1E6;
  --color-info: #7A9463;
  --color-info-surface: #F6F1E6;
  --color-warning: #C9883B;
  --color-warning-surface: #F5EBD8;
  --color-error: #C0574A;
  --color-error-surface: #F5EBE8;

  /* Colors — Borders */
  --color-border-subtle: rgba(46, 46, 46, 0.08);
  --color-border-strong: rgba(46, 46, 46, 0.18);
  --color-border-focus: #A3B18A;

  /* Spacing */
  --space-1: 4px;   --space-2: 8px;   --space-3: 12px;
  --space-4: 16px;  --space-6: 24px;  --space-8: 32px;
  --space-12: 48px; --space-16: 64px; --space-24: 96px;

  /* Radius */
  --radius-sm: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  --radius-pill: 9999px;

  /* Shadows */
  --shadow-xs: 0 1px 2px rgba(46, 46, 46, 0.06);
  --shadow-sm: 0 2px 8px rgba(46, 46, 46, 0.08);
  --shadow-md: 0 8px 24px rgba(46, 46, 46, 0.11);
  --shadow-lg: 0 16px 40px rgba(46, 46, 46, 0.14);
  --shadow-xl: 0 24px 64px rgba(46, 46, 46, 0.18);

  /* Transitions */
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-expo-out: cubic-bezier(0.16, 1, 0.3, 1);
  --duration-fast: 150ms;
  --duration-normal: 200ms;
  --duration-scale: 250ms;
  --duration-fade: 250ms;
  --duration-rise: 300ms;
  --duration-slow: 350ms;
  --duration-slide: 400ms;

  /* Z-Index */
  --z-base: 0;       --z-raised: 10;     --z-dropdown: 100;
  --z-sticky: 200;   --z-popover: 300;   --z-overlay: 400;
  --z-modal: 500;    --z-toast: 600;     --z-tooltip: 700;

  /* Container */
  --container-max: 1280px;

  /* Fonts */
  --font-heading: 'Copernicus', 'Tiempos Headline', serif;
  --font-body: 'StyreneB', 'Inter', system-ui, sans-serif;
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 100ms !important;
  }
}
```

### B.2 Tailwind Config Snippet

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '#A3B18A', accent: '#E7A27B',
        hover: '#8FA876',  active: '#7A9463',
        bg: { main: '#E9DFC6', soft: '#F6F1E6', surface: '#D6C4AB' },
        text: { primary: '#2E2E2E', secondary: '#5A5A5A', inverse: '#FFFFFF' },
        success: '#A3B18A', info: '#7A9463',
        warning: '#C9883B',  error: '#C0574A',
      },
      fontFamily: {
        heading: ['Copernicus', 'Tiempos Headline', 'serif'],
        body: ['StyreneB', 'Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: { sm: '8px', lg: '12px', xl: '16px', pill: '9999px' },
      boxShadow: {
        xs: '0 1px 2px rgba(46,46,46,0.06)',
        sm: '0 2px 8px rgba(46,46,46,0.08)',
        md: '0 8px 24px rgba(46,46,46,0.11)',
        lg: '0 16px 40px rgba(46,46,46,0.14)',
        xl: '0 24px 64px rgba(46,46,46,0.18)',
      },
      transitionTimingFunction: {
        standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
        'expo-out': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      zIndex: {
        base: '0', raised: '10', dropdown: '100', sticky: '200',
        popover: '300', overlay: '400', modal: '500',
        toast: '600', tooltip: '700',
      },
      maxWidth: { container: '1280px' },
    },
  },
};
```

---

## Appendix C — Code Source Header

When implementing this design system in code, the source-of-truth file should reference this document by version:

```
/* AltairGo Intelligence — Design Tokens
 * Source: AltairGo_Design_System_FINAL.md (v3.1)
 * Last synced: <date>
 * Owner: Design Systems
 *
 * Any deviation in code from this document is a bug, not a creative license.
 */
```

---

*End of Document — AltairGo Intelligence Design System v3.1*
