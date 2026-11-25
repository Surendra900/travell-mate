# TravelMate AI — Design Specification

> **Status:** Approved. This document drives all UI/UX work in Waves UI-1 through UI-7.  
> **Last updated:** 2026-11-25  
> **Owner:** Agent 23 – UI Design Director

---

## 1. Design Philosophy

TravelMate AI serves Indian travellers—many on budget Android devices with 360 px viewports and 2G/3G connections. The design must feel like a **polished, trustworthy transit product** (reference level: Ixigo, Cleartrip 2024, MakeMyTrip lite).

**Three principles:**
1. **Clarity first** — one action per screen region, no visual noise.
2. **Speed perception** — skeletons, optimistic UI, instant tab switches.
3. **Confidence** — strong colour hierarchy, consistent states, never leave the user guessing.

---

## 2. Colour Palette

### Brand Colours (extend into Tailwind config)

| Token | CSS Var | Hex | Usage |
|-------|---------|-----|-------|
| `tm-primary` | `--tm-primary` | `#0369a1` | Primary actions, active states |
| `tm-primary-hover` | — | `#0284c7` | Button hover |
| `tm-primary-dark` | — | `#075985` | Pressed / focus ring |
| `tm-accent` | `--tm-accent` | `#0d9488` | Multimodal / combination mode |
| `tm-surface` | `--tm-surface` | `#ffffff` | Card backgrounds |
| `tm-bg` | `--tm-bg` | `#f8fafc` | Page background (Slate 50) |
| `tm-border` | `--tm-border` | `#e2e8f0` | Borders, dividers (Slate 200) |
| `tm-text` | `--tm-text` | `#1e293b` | Body text (Slate 800) |
| `tm-muted` | `--tm-muted` | `#64748b` | Secondary labels (Slate 500) |
| `tm-success` | `--tm-success` | `#059669` | Confirmed, on-time |
| `tm-warning` | `--tm-warning` | `#d97706` | Delay, risk |
| `tm-danger` | `--tm-danger` | `#dc2626` | Error, cancel, SOS |
| `tm-train` | — | `#0369a1` | Train mode pill |
| `tm-bus` | — | `#7c3aed` | Bus mode pill |
| `tm-flight` | — | `#0891b2` | Flight mode pill |
| `tm-combo` | — | `#0d9488` | Combination mode pill |

### Navbar / Footer (dark surface)
| Element | Value |
|---------|-------|
| Navbar background | `#0f172a` (Slate 900) |
| Navbar text | `#f1f5f9` (Slate 100) |
| Navbar active link | `#38bdf8` (Sky 400) underline or pill |
| Footer background | `#0f172a` |
| Footer link hover | `#7dd3fc` (Sky 300) |

### Mode — Light with dark nav/footer
No full dark mode in this release. `color-scheme: light` is locked. The dark navbar/footer are intentional brand anchors.

---

## 3. Typography

### Font Families
| Role | Family | Fallback |
|------|--------|---------|
| Primary (UI) | **Inter** | system-ui, sans-serif |
| Indian script fallback | **Noto Sans** | sans-serif |

Load in `index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans:wght@400;500&display=swap" rel="stylesheet">
```

Set in Tailwind config:
```js
fontFamily: {
  sans: ['Inter', 'Noto Sans', 'system-ui', 'sans-serif'],
}
```

### Type Scale

| Class | Size | Weight | Line-height | Use |
|-------|------|--------|-------------|-----|
| `text-xs` | 11px | 400 | 1.5 | Fine print, badges |
| `text-sm` | 13px | 400/500 | 1.5 | Secondary labels |
| `text-base` | 15px | 400 | 1.6 | Body copy |
| `text-lg` | 17px | 500 | 1.5 | Card titles |
| `text-xl` | 20px | 600 | 1.4 | Section headings |
| `text-2xl` | 24px | 700 | 1.3 | Page headings |
| `text-3xl` | 30px | 700 | 1.2 | Hero / marketing |

---

## 4. Spacing Scale

Using Tailwind's default 4 px base. Key layout values:

| Token | px | Usage |
|-------|----|-------|
| `space-1` | 4 | Tight inline gaps |
| `space-2` | 8 | Icon-to-label gap |
| `space-3` | 12 | Inner card padding (mobile) |
| `space-4` | 16 | Standard padding |
| `space-5` | 20 | Section gap |
| `space-6` | 24 | Card padding desktop |
| `space-8` | 32 | Between sections |
| `space-12` | 48 | Hero vertical rhythm |
| `space-16` | 64 | Page top padding |

Page container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`

---

## 5. Border Radius

| Token | Value | Use |
|-------|-------|-----|
| `rounded-sm` | 4px | Badges, chips |
| `rounded` | 6px | Inputs |
| `rounded-md` | 8px | Buttons |
| `rounded-lg` | 12px | Cards |
| `rounded-xl` | 16px | Modals, elevated cards |
| `rounded-full` | 9999px | Pills, avatars |

---

## 6. Shadows

| Token | Value | Use |
|-------|-------|-----|
| `shadow-sm` | `0 1px 2px rgba(0,0,0,.06)` | Subtle card border replacement |
| `shadow` | `0 1px 3px rgba(0,0,0,.10), 0 1px 2px rgba(0,0,0,.06)` | Standard card |
| `shadow-md` | `0 4px 6px rgba(0,0,0,.07), 0 2px 4px rgba(0,0,0,.06)` | Elevated card, dropdown |
| `shadow-lg` | `0 10px 15px rgba(0,0,0,.10), 0 4px 6px rgba(0,0,0,.05)` | Modal, sheet |

---

## 7. Component Library (`src/components/ui/`)

Every component must implement **all** states: default, hover, focus, active, disabled, loading.

### 7.1 Button

```
Variants: primary | secondary | ghost | danger | link
Sizes:    sm | md | lg
```

- `primary`: `bg-[#0369a1] text-white hover:bg-[#0284c7] focus-visible:ring-2 ring-[#0369a1]`
- `secondary`: `border border-[#e2e8f0] bg-white text-[#1e293b] hover:bg-slate-50`
- `ghost`: no border/bg, text only, hover bg-slate-100
- `danger`: `bg-[#dc2626] text-white`
- Loading: spinner replaces icon, text unchanged, `pointer-events-none opacity-70`
- Min touch target: 44 × 44 px (use `min-h-[44px]`)

### 7.2 Input

- Base: `rounded-[6px] border border-[#e2e8f0] bg-white px-3 py-2 text-sm text-[#1e293b]`
- Focus: `outline-none ring-2 ring-[#0369a1] border-[#0369a1]`
- Error: `border-red-500 ring-red-200`
- Label always visible (never placeholder-only)
- Floating label or static label above — consistent, no mix

### 7.3 Card

```
<Card> — white bg, rounded-lg, shadow, p-4/p-6
<Card.Header> — border-b, font-semibold
<Card.Body>
<Card.Footer> — border-t, muted bg
```

### 7.4 Badge (unified — replaces SourceBadge + ProvenanceBadge)

Sizes: sm | md  
Variants: `train | bus | flight | combo | success | warning | danger | neutral`  
Style: pill shape (`rounded-full`), colour per variant, 11–12 px text

### 7.5 Modal

- Overlay: `bg-black/50 backdrop-blur-sm`
- Panel: `bg-white rounded-xl shadow-lg max-w-md w-full mx-4`
- Header: brand colour left border or logo mark + title
- Always has close button with ARIA label
- Focus trapped inside; Esc closes

### 7.6 Skeleton

- `bg-slate-200 animate-pulse rounded`
- `SkeletonCard` — full result card shape
- `SkeletonLine` — inline text placeholder

### 7.7 Toast

- Position: bottom-right desktop, bottom-center mobile
- Variants: success / warning / error / info
- Auto-dismiss 4s, manual close × button

### 7.8 Tabs (mode selector)

- 4 pills in a horizontal scrollable row (no wrapping on 360 px)
- Active: `bg-[tm-primary] text-white`
- Inactive: `bg-white border border-[#e2e8f0] text-[#64748b] hover:border-[#0369a1] hover:text-[#0369a1]`
- Transport-mode specific active colours per mode

### 7.9 Spinner

- SVG `animate-spin`; variants: `sm` (16 px) / `md` (24 px) / `lg` (40 px)

---

## 8. Page Layouts

### 8.1 App Shell

```
┌─────────────── Navbar (sticky, h-16, bg-slate-900) ───────────────┐
│  Logo   Train Bus Flight Combo        [Search] [Sign In] [Lang]   │
├───────────────────────────────────────────────────────────────────┤
│                                                                   │
│   <main id="main-content">  page content  </main>                │
│                                                                   │
├───────────────────────────────────────────────────────────────────┤
│                     Footer (bg-slate-900)                         │
└───────────────────────────────────────────────────────────────────┘
```

- Skip-to-main link at top of `<body>` (visually hidden, shows on focus)
- Navbar: `position: sticky; top: 0; z-index: 50`

### 8.2 Home / Search Page

```
┌──────────────────── Hero band ────────────────────┐
│  Headline + sub, bg-gradient-to-b from-slate-900  │
│  to-slate-800, text-white, py-12                  │
├──────────────────────────────────────────────────-┤
│  ┌─── Search Card (bg-white, rounded-xl, shadow-lg, -mt-8) ───┐  │
│  │  [Train] [Bus] [Flight] [Combination]  mode tabs            │  │
│  │  From ⇆ To   Date   Passengers   [Search]                  │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                   │
│  Results list / empty state / skeleton                            │
└───────────────────────────────────────────────────────────────────┘
```

### 8.3 Results (Planner page)

```
┌── Filters sidebar (desktop left, mobile drawer) ──┐
│  Sort: Price / Duration / Departure               │
│  Filter: Provider, Class, Time range              │
└───────────────────────────────────────────────────┘
┌── Result cards list ──────────────────────────────┐
│  [SkeletonCard] while loading                     │
│  ResultCard: carrier, timing, fare, badge, CTA    │
│  CombinationRouteCard: leg timeline               │
└───────────────────────────────────────────────────┘
```

### 8.4 Combination Route Card

```
Origin ──●── Train (3h 20m) ──●── Transfer (45m wait) ──●── Bus (1h) ──●── Dest
         Dep 06:00            Arr 09:20 / Dep 10:05                   Arr 11:05
         ₹ 450                                                        ₹ 120
─────────────────────────────────────────────────────────────────────────────
Total: 5h 5m (incl. transfer) · ₹ 570 · 2 operators
```

### 8.5 Auth / Clerk

Clerk appearance config applied to match brand:
- Primary colour: `#0369a1`
- Border radius: `8px`
- Font family: Inter
- Logo: TravelMate mark

### 8.6 Local Device Profile Modal

- Brand header: logo + "TravelMate Profile" title
- Styled close button (not plain text "Close")
- Info box: proper icon (`ℹ`) + muted style (not yellow)
- 2-col grid stays single-column on mobile

---

## 9. Icons

**Single icon set: Lucide React** (already installed). No mixing with other sets.

| Use | Icon |
|-----|------|
| Train | `Train` |
| Bus | `Bus` |
| Flight | `Plane` |
| Combination | `GitMerge` or `Route` |
| Search | `Search` |
| Close / X | `X` |
| Info | `Info` |
| Warning | `AlertTriangle` |
| Error | `XCircle` |
| Success | `CheckCircle2` |
| Location | `MapPin` |
| Calendar | `Calendar` |
| Passengers | `Users` |
| Swap | `ArrowLeftRight` |

---

## 10. Motion / Animation

Principle: **subtle, purposeful, fast**. No decorative animations.

| Element | Animation |
|---------|-----------|
| Page enter | `opacity: 0 → 1`, `translateY(8px → 0)`, 150ms ease-out |
| Modal open | `scale(0.95 → 1)` + `opacity`, 150ms |
| Tab switch | No animation — instant |
| Skeleton | `animate-pulse` (Tailwind built-in) |
| Toast enter | slide-up from bottom, 200ms |
| Button loading | spinner fade-in 100ms |

Respect `prefers-reduced-motion`: wrap transitions in `@media (prefers-reduced-motion: no-preference)`.

---

## 11. Responsive Breakpoints

| Name | Min-width | Target device |
|------|-----------|---------------|
| `xs` (default) | 360px | Budget Android (primary) |
| `sm` | 640px | Large phone / small tablet |
| `md` | 768px | Tablet portrait |
| `lg` | 1024px | Tablet landscape / small laptop |
| `xl` | 1280px | Desktop |
| `2xl` | 1536px | Wide desktop |

**Rule:** Design mobile-first. No horizontal scroll at any breakpoint. Touch targets ≥ 44 × 44 px.

---

## 12. Accessibility Requirements (WCAG AA)

- All text: contrast ratio ≥ 4.5:1 (normal), ≥ 3:1 (large/bold)
- All interactive elements: visible focus ring (2px solid `#0369a1`, 2px offset)
- All images / icons: `aria-label` or `aria-hidden="true"` as appropriate
- Form inputs: `<label>` associated via `htmlFor` / `id`
- Modals: `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, focus trap
- Skip-to-main link: first focusable element in DOM
- Language: `<html lang="en">` (or detected locale)
- Screen-reader-only utility: `.sr-only` class

---

## 13. Build Wave Plan

| Wave | Assigned to | Scope |
|------|-------------|-------|
| UI-1 | Agent 24 | Tailwind token extension, `src/components/ui/` library, Inter font |
| UI-2 | Agent 02 | Navbar, Footer, App shell, skip-to-main |
| UI-3 | Agent 25 | Home: hero, mode tabs, search form, StationAutocomplete |
| UI-4 | Agent 25 | Results: ResultCard, CombinationRouteCard, skeletons, empty/error states |
| UI-5 | Agent 26 | Clerk appearance, AccountMenu, Local Device Profile modal |
| UI-6 | Agent 02 | SavedPlans, SafetyMode, NotFound, AnalyzeJourney, legal pages |
| UI-7 | Agents 27+28+29 | Mobile audit, accessibility, visual QA, fix loop |

---

> _Design decisions logged in `/docs/DECISIONS.md`. Any deviation from this spec requires Orchestrator sign-off._
