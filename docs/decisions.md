# TravelMate Architectural & Product Decisions

**Document Version:** 1.0 (Master Rebuild)  
**Reference:** [MASTER_SPEC.md](file:///c:/Users/SURENDRA.G/.gemini/antigravity/scratch/travelmate-app/docs/MASTER_SPEC.md)

This log records all authoritative product and architectural decisions made during the rebuild, including supersessions of older specifications.

---

## Decision 001: Supersede 30-Day Prototype with 10-Day Master Rebuild
- **Date:** October 2026
- **Context:** The previous 30-day plan accumulated disparate features (Document Vault, Phrasebook, Blind Voice Gate, Carbon Calculator, Medical SOS) resulting in "Feature Soup" and conflicting user models.
- **Decision:** The Master Specification ([MASTER_SPEC.md](file:///c:/Users/SURENDRA.G/.gemini/antigravity/scratch/travelmate-app/docs/MASTER_SPEC.md)) is the single source of truth. All older roadmaps are superseded.
- **Rationale:** Focus on the core breakthrough: **The Multimodal Disruption and Route Recovery Engine ("Never get stranded")** for Indian transit.

---

## Decision 002: Complete Removal of 7 Non-Core Features
- **Date:** October 2026
- **Context:** Feature Disposition Section 4 of Master Spec requires complete removal of features that dilute product focus or create unnecessary security/legal liabilities.
- **Decision:** Remove the following features completely:
  1. Encrypted Document Vault (`DocumentVault.jsx`) â€” IDB/WebCrypto passport storage is unrelated to route recovery.
  2. Regional Transit Phrase Cards (`EmergencyPhraseCards.jsx`) â€” Static dictionary is bloat.
  3. Carbon Footprint Calculator (`CarbonCalculator.jsx`) â€” Non-essential virtue metric.
  4. Battery & Telemetry Status Strip (`StatusBar.jsx`) â€” System OS responsibility.
  5. Floating SOS button on Home/Search screens â€” Reserve for safety drawer only.
  6. Floating generic SambaNova chatbot drawer â€” Replace with 2 server-side grounded AI uses.
  7. Fake "Demo Booking" or payment modals â€” Replace with verified provider deep-links.
- **Rationale:** Eliminate user confusion, improve visual hierarchy, and focus judge attention on the multimodal split engine.

---

## Decision 003: Grounded Server-Side AI (No Hallucinations)
- **Date:** October 2026
- **Context:** Floating conversational chatbot wrappers hallucinate train schedules, which technical judges immediately reject.
- **Decision:** Restrict AI to exactly two server-side use cases:
  1. Natural-language query parser (Zod schema: origin, destination, deadline, budget, mode preferences).
  2. 2-sentence route rationale strictly validated against computed facts.
- **Rationale:** Complete reliability and zero fabricated transit data.

---

## Decision 004: Data Honesty & Provenance Badges
- **Date:** October 2026
- **Context:** Travel apps that fabricate fake PNRs or pretend to have live booking without official licenses lose credibility.
- **Decision:** Enforce non-negotiable provenance badges: `LIVE`, `TIMETABLE`, or `ESTIMATE`. No use of "confirmed" or "guaranteed" unless verified at time T. Transparent disclosure that split tickets are independent bookings.
- **Rationale:** High regulatory integrity and judge trust.

---

## Decision 005: Branching & Daily Git Verification
- **Date:** October 2026
- **Context:** Section 18 requires clean daily commits and tags on `rebuild/route-recovery`.
- **Decision:** Baseline tag `baseline-before-rebuild` created. All rebuild work executed on `rebuild/route-recovery`. Daily commits and tags (`day-0`, `day-1`, ..., `day-10`).


---

## Decision 006: 10-Agent Engineering Team Structure Established
- **Date:** 2026-11-25
- **Context:** Upgrading TravelMate AI beyond hackathon MVP to a production-grade platform requires structured parallel development with clear ownership boundaries, mandatory security/QA gates, and no file conflicts between agents.
- **Decision:** Established a 10-agent team under `.agent/` with Orchestrator coordination. Security (09) and Testing/QA (10) are mandatory review gates â€” no task is Done without both. Frontend (02) and Backend (01) work in isolated file ownership. Full-Stack (03) owns cross-layer glue. Dedicated agents for API Keys (04), API Integration (05), Datasets (06), Data Integration (07), and UI/UX (08).
- **Reason:** Prevents scope creep, ensures security review before every deployment, and enables parallel development across UI, API, and data layers simultaneously.
- **Alternatives rejected:** Single-agent sequential development â€” too slow and no separation of concerns for a production system with 10+ live API integrations.
- **Affects:** All agents.

---

## D-007 — Flight API Parallelisation & Fusion Tie-Break Rules
**Date:** 2026-11-25
**Agent:** 16 (API Aggregation & Fusion)
**Decision:** Call Skyscanner and Aviationstack in parallel using Promise.allSettled. Merge results with the following tie-break order: (1) cheaper fare wins; (2) if fares within 5% ? shorter duration wins; (3) LIVE_PROVIDER_DATA preferred over TIMETABLE; (4) Skyscanner preferred over Aviationstack on exact tie. Dedup by flight code — Skyscanner entry wins on code collision. Canonical provenance mapping: Skyscanner ? LIVE_PROVIDER_DATA; Aviationstack ? TIMETABLE (schedule/status only, no fare).
**Rationale:** Parallel calls reduce latency from ~27 s worst-case to ~15 s. Fusion gives users more options with honest provenance labels.


---

## D-008 — UI/UX Redesign Architecture Decisions
**Date:** 2026-11-25  
**Agent:** 23 (UI Design Director) + 24 (Design System Engineer)

**Decisions:**

1. **Dark Navbar, Light body** — Navbar changed from `bg-white/95` to `bg-slate-900`. Footer stays `bg-slate-900`. Body stays `bg-slate-50`. This creates a consistent dark brand anchor at top and bottom with clean light content in between. Light body was chosen over full dark mode because: (a) Indian railway/transit apps (Ixigo, MakeMyTrip) use light body for readability; (b) the existing CSS is light-mode-only; (c) saving dark mode for a future wave reduces risk.

2. **Hero dark gradient** — Home page hero section changed from `bg-gradient-to-b from-sky-50/70 via-white to-slate-50` to `bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900`. Provides strong brand presence, makes the white search card float visually, and aligns with the dark navbar.

3. **Inter font loaded** — Added Google Fonts Inter (400/500/600/700/800/900) to index.html. Font-family in Tailwind config and CSS root updated to prefer Inter over system fonts. Noto Sans kept as fallback for Indian scripts.

4. **Tailwind config extended with brand tokens** — Added `colors.tm.*`, `boxShadow.tm-*`, `borderRadius.tm-*`, `fontFamily.sans`, and `animation.*` extensions. This allows using `bg-tm-primary`, `shadow-tm-modal` etc. in JSX instead of hardcoded hex values.

5. **Mode tabs horizontal scroll on mobile** — Changed from `flex-wrap` to `overflow-x-auto scrollbar-hide` with `shrink-0` on each tab. Prevents tabs from stacking on 360px screens.

6. **ProvenanceBadge shown alone when available** — In LiveResultsPanel ResultCard, now shows only ProvenanceBadge when `item.provenance` is set, falling back to SourceBadge. Eliminates the dual-badge visual duplication that was flagged in the UI audit.

7. **OnboardingModal redesigned** — Replaced dark glass-morphism "Local Device Profile" modal (designed for a dark-mode era) with a clean white modal with proper header (icon + title + X button), labelled form fields, and an info box instead of a yellow warning box. Preserves all functionality; no backend changes.

8. **New shared UI components added** — `src/components/ui/`: Modal.jsx (accessible, focus-trapped), Skeleton.jsx + SkeletonCard + SkeletonList, Spinner.jsx. All have proper ARIA attributes.

**Rationale:** These decisions prioritize visual consistency, accessibility, and the Indian mobile-first user base, while keeping every existing test green (308/308 + 136/136).

**Affects:** Home.jsx, Navbar.jsx, OnboardingModal.jsx, LiveResultsPanel.jsx, tailwind.config.js, index.css, index.html, src/components/ui/*.
