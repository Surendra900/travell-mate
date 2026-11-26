# TravelMate Project Architecture and Mobile Layout Understanding

This document captures the architectural understanding, user flows, layout hierarchy, responsive breakpoint system, and the ten highest-risk mobile layout areas in TravelMate.

---

## 1. Primary user flows

TravelMate is an offline-capable, emergency-aware multimodal transit recovery application for Indian travelers facing ticket waitlists, delays, and transit disruptions.

- **Flow 1: Route Recovery Discovery (Primary Flow)**
  - Path: Home (`/`) -> Route Finder (`/planner`) -> Live Recovery Results (`LiveResultsPanel`).
  - Action: User enters origin, destination, date, and transport mode. When direct express trains are waitlisted, TravelMate calculates split-route options through India's Top 25 junction interchange hubs (e.g. New Delhi to Patna via Kanpur Central), displaying side-by-side contrast (`WaitlistBypassContrast`) and multimodal timelines (`MultimodalTimelineCard`).

- **Flow 2: Emergency Tatkal Desk**
  - Path: Navbar / Home -> Tatkal Desk (`/planner?mode=tatkal`).
  - Action: User monitors Tatkal countdown clocks (10:00 AM AC, 11:00 AM Non-AC), configures local passenger master lists for rapid entry, checks live corridor trains, and triggers Tatkal Quota (TQ) availability checks.

- **Flow 3: Digital Passes and Safety Hub**
  - Path: Navbar -> Passes & Safety Hub (`/safety`).
  - Action: User accesses offline digital boarding passes (`OfflineTravelerPassModal`), generates downloadable/printable QR transit packs, views emergency dialers (112, 139, 108), and reads transit safety guides (`/safety/:id`).

- **Flow 4: Saved Itineraries and PNR Tracking**
  - Path: Navbar -> Saved Trips (`/saved` or `/plans`).
  - Action: User inspects locally and cloud-synchronized (Supabase) itineraries, verifies offline access status, checks connection readiness scores, and inspects PNR prediction probability (`PnrPredictorModal`).

- **Flow 5: Voice and Natural Language Route Assistant**
  - Path: Floating voice microphone button (`VoiceSearchButton`) or Journey Assistant (`/analyze`).
  - Action: User speaks or types natural language queries (e.g. "tatkal from Kochi to Chennai"), which parse route parameters and dynamically navigate to the corresponding planner mode.

---

## 2. Route registry and key states

### Routes
- `/`: Home (Hero search card, mode tabs, natural language assistant input, popular corridor chips, 3-step value proposition).
- `/planner`: Route Finder (Normal Mode, query param auto-search, live results workspace, filter views: all, contrast, map, simulator, budget, balanced, fastest).
- `/planner?mode=tatkal`: Emergency Tatkal Planner (Tatkal countdown timer, passenger master entry, live corridor train cards, quota availability).
- `/safety`: Passes and Safety Hub (Passes tab, SOS emergency dialer tab, safety protocols tab).
- `/safety/:id`: Emergency detail view (medical, robbery, accident, women safety, harassment protocols).
- `/saved` and `/plans`: Saved Trips (itinerary cards, cloud sync status, PNR auto-refresh, offline pack generator).
- `/analyze`: Journey Analysis and Route Assistant (conversation sidebar, prompt cards, query input).
- `/privacy`: Privacy Policy (DPDP compliance, consent controls).
- `/terms`: Terms of Service.
- `/disclaimer`: Statutory Disclaimers.
- `/cookies`: Cookie and Local Storage Policy.
- `*`: NotFound 404 page.

### Key interface states
- **Navigation:** Mobile menu closed, mobile menu open (`aria-expanded="true"`), language selector dropdown open, account menu open.
- **Overlays and Modals:** `OnboardingModal` (profile editor), `DpdpPrivacyModal` (consent manager), `FeedbackModal` (ratings & comments), `DemoTourModal` (scenario walkthrough), `OfflineTravelerPassModal` (printable boarding pass), `PnrPredictorModal` (10-digit lookup & prediction), `VoiceSearchButton` dialog.
- **Form States:** Empty, focused, autocomplete suggestions active (`StationAutocomplete`), validation error, date picker active.
- **Search Results States:** Idle, loading spinner, live data rows present, fallback timetable tiers, empty results, provider error notice.
- **Network States:** Online, offline (`OfflineModeBanner`), full offline mode (`OfflineOnlyMode` when `navigator.onLine === false`).

---

## 3. Component layout tree

```
App.jsx (Layout Shell: min-h-screen pb-24 sm:pb-0)
├── GlobalTranslationLayer
├── LocationPermissionGate
├── Navbar (Sticky top-0 z-50)
│   ├── Brand Link
│   ├── Desktop Nav Links (hidden md:grid)
│   ├── Actions (Demo button, Voice button, LanguageSelector, AccountMenu)
│   ├── Hamburger Toggle Button (md:hidden)
│   └── Mobile Navigation Drawer (md:hidden, #mobile-navigation)
├── OfflineModeBanner (Sticky banner)
├── main#main-content
│   └── PageErrorBoundary
│       └── Suspense
│           └── <Routes> (Home, Planner, SafetyMode, SavedPlans, AnalyzeJourney, Legal pages)
├── VoiceSearchButton (Fixed bottom-left floating launcher, dialog overlay when open)
├── PwaInstallBanner (Bottom floating prompt)
├── Footer (Responsive 4-column grid, compliance links)
├── OnboardingModal (Portal dialog)
├── DpdpPrivacyModal (Portal dialog)
├── FeedbackModal (Portal dialog)
├── DemoTourModal (Portal dialog)
└── app-toast (Fixed bottom-center)
```

---

## 4. Breakpoint mechanics

- **Tailwind CSS default breakpoints:**
  - `sm`: `min-width: 640px` (switches cards from full-width stacked to multi-column rows).
  - `md`: `min-width: 768px` (hides mobile hamburger menu, displays 4-column desktop navbar).
  - `lg`: `min-width: 1024px` (expands planner into two-column layout: search form + insights sidebar).
  - `xl`: `min-width: 1280px` (max-width container bounds).
- **Custom media queries in `src/index.css`:**
  - `@media (max-width: 1024px)`: Inner navbar padding reduction.
  - `@media (max-width: 768px)`: Hides desktop navbar links, displays hamburger menu button.
  - `@media (max-width: 640px)`: Floating action button repositioning, button widths reset to auto.
  - `@media (max-width: 440px)`: Assistant prompt grid collapses to single column.

---

## 5. Ten riskiest mobile layout areas

1. **Horizontal overflow masking via `overflow-x: hidden` in `src/index.css` (line 58):**
   `html,body,#root { min-width:320px; min-height:100%; overflow-x:hidden }` artificially hides clipped content instead of solving fluid width constraints. Removing this reveals critical overflow bugs.

2. **Form control font sizing under 16px triggering iOS Safari auto-zoom:**
   Inputs styled with `text-sm` (14px) or `.input { font-size: 15px }` force iOS Safari to zoom the entire screen on focus, distorting the layout and hiding action buttons.

3. **Dense comparison cards (`WaitlistBypassContrast.jsx`):**
   The direct train timing block (Origin, Duration, Destination in a 3-column grid) and the header row (Status badge + Title) collapse into unreadable overlapping text on 320px-375px viewports.

4. **Live results header and filter chip strip (`LiveResultsPanel.jsx`):**
   The route title row (`Origin -> Destination`) lacks text wrapping and flex-wrap, causing long city names to push action buttons (Refresh, Check PNR) off-screen. The 7 filter buttons wrap into an unwieldy 4-row block.

5. **Leaflet route map touch gesture trapping (`RouteMap.jsx`):**
   The interactive map canvas captures single-finger drag events, preventing users from scrolling down the page on touch screens. Absolute legend chips at `bottom-3 left-3` collide with map controls on 320px screens.

6. **Modal heights using `92vh` instead of dynamic viewport units (`dvh`/`svh`):**
   `max-h-[92vh]` in `PnrPredictorModal`, `DpdpPrivacyModal`, `OfflineTravelerPassModal`, and `FeedbackModal` pushes modal footers and submit buttons below the mobile address bar and bottom home bar.

7. **Floating widget collisions and safe-area neglect:**
   `VoiceSearchButton`, floating SOS buttons, PWA install prompts, and `app-toast` all contend for the bottom 24px-88px zone, covering page content and each other.

8. **Station autocomplete dropdown viewport overflow (`StationAutocomplete.jsx`):**
   When the virtual keyboard opens, the 256px absolute dropdown list (`max-h-64`) extends off-screen, making station selection difficult without dismissal.

9. **Emergency Tatkal passenger list and train cards (`EmergencyTatkalPlanner.jsx`):**
   Dense passenger forms (Name, Age, Gender, Berth) and train cards with multiple badges (TQ Eligible, SourceBadge, Timings, IRCTC link) wrap haphazardly on narrow viewports.

10. **Touch target sizing and spacing violations under 44x44px:**
    Compact icon buttons (dialog close buttons, swap origin/destination, copy buttons, footer text links) fall below the 44x44px touch target threshold and lack 8px inter-target spacing.
