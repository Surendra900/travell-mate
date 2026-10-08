# TravelMate Master Feature Matrix

**Document Version:** 1.0 (Master Rebuild)  
**Reference:** Section 4 & 16 of [MASTER_SPEC.md](file:///c:/Users/SURENDRA.G/.gemini/antigravity/scratch/travelmate-app/docs/MASTER_SPEC.md)

This matrix tracks the authoritative disposition and status of every feature in the TravelMate platform.

---

## 1. Feature Disposition & Implementation Matrix

| Feature | Disposition | Status | Data Provenance | Proof Test Suite | Baseline / Proof Screenshot |
| :--- | :---: | :---: | :--- | :--- | :--- |
| **Multimodal Split Router** | **KEEP & UPGRADE (P0)** | WORKING | TIMETABLE + Open Rail/Bus Graph | `tests/characterization_engines.test.mjs` | `docs/screenshots/day-0/before/desktop-1440-02c-results.png` |
| **Connection Risk & Delay Simulator** | **KEEP & UPGRADE (P0)** | WORKING | Documented Parametric Model | `tests/day22_contingency_engine.test.mjs` | `docs/screenshots/day-0/before/desktop-1440-02c-results.png` |
| **Verified Deep Links (ConfirmTkt/RedBus)** | **KEEP & UPGRADE (P0)** | WORKING | Official Verified Query URLs | `tests/characterization_engines.test.mjs` | `docs/screenshots/day-0/before/desktop-1440-02c-results.png` |
| **Interactive Route Map (Leaflet)** | **KEEP & UPGRADE (P0)** | WORKING | OpenStreetMap / CartoDB GeoJSON | `tests/day24_route_map.test.mjs` | `docs/screenshots/day-0/before/desktop-1440-02-planner.png` |
| **Tatkal Desk (Countdown & Master Pass)** | **KEEP & UPGRADE (P1)** | WORKING | Live IST Clock Sync + LocalStorage | `tests/day6_tatkal_pnr.test.mjs` | `docs/screenshots/day-6/after/desktop-01-tatkal-desk.png` |
| **Direct Single-Mode Search** | **KEEP & UPGRADE (P1)** | WORKING | LIVE (API) / TIMETABLE Fallback | `tests/day1_features.test.mjs` | `docs/screenshots/day-0/before/desktop-1440-01-homepage.png` |
| **Offline Boarding Pass & Trip Pack** | **KEEP & UPGRADE (P1)** | WORKING | Local-First Storage (PWA SW) | `tests/day7_passes_safety_ai.test.mjs` | `docs/screenshots/day-7/after/desktop-01-passes-safety.png` |
| **PNR Status & Predictor** | **SIMPLIFY (P2)** | WORKING | Historical Heuristic Model + Official Link | `tests/day6_tatkal_pnr.test.mjs` | `docs/screenshots/day-6/after/desktop-02-pnr-tracker.png` |
| **Urgent Departure Preset (12h)** | **ADD (P1)** | WORKING | 12h Same-Day Departure Filter | `tests/day6_tatkal_pnr.test.mjs` | `docs/screenshots/day-6/after/desktop-01-tatkal-desk.png` |
| **Indian Transit Glossary Tooltips** | **ADD (P1)** | WORKING | Official PRS Terminology Popovers | `tests/day6_tatkal_pnr.test.mjs` | `docs/screenshots/day-6/after/desktop-01-tatkal-desk.png` |
| **Transit Safety Drawer (112/139/GPS)** | **SIMPLIFY (P2)** | WORKING | Browser Geolocation API + `tel:` | `tests/day7_passes_safety_ai.test.mjs` | `docs/screenshots/day-7/after/desktop-03-safety-drawer.png` |
| **Contextual Weather Disruption** | **SIMPLIFY (P2)** | WORKING | Open-Meteo REST API | `tests/day7_passes_safety_ai.test.mjs` | `docs/screenshots/day-7/after/desktop-01-passes-safety.png` |
| **Grounded AI Query Parser (Server-side)** | **ADD (P1)** | WORKING | SambaNova Cloud / Gemini Zod API | `tests/day7_passes_safety_ai.test.mjs` | `docs/screenshots/day-7/after/desktop-04-ai-query-input.png` |
| **Grounded Route Rationale (Server-side)** | **ADD (P1)** | WORKING | Computed Facts JSON Validator | `tests/day7_passes_safety_ai.test.mjs` | `docs/screenshots/day-7/after/desktop-01-passes-safety.png` |
| **"See a Demo" Scenario Mode** | **ADD (P0)** | WORKING | Labeled Demo Scenario Banner | `tests/day4_app_shell_search.test.mjs` | `docs/screenshots/day-4/after/desktop-02-demo-banner.png` |
| **"Waitlist Bypass" Visual Contrast** | **ADD (P0)** | WORKING | TIMETABLE Direct vs Split Graph | `tests/day5_results_experience.test.mjs` | `docs/screenshots/day-5/after/desktop-01-results-contrast.png` |
| **Inline Delay Contingency Simulator** | **ADD (P0)** | WORKING | Parametric Slack Absorption Model | `tests/day5_results_experience.test.mjs` | `docs/screenshots/day-5/after/desktop-02-delay-simulator.png` |
| **Statutory Split Booking Disclosures** | **ADD (P0)** | WORKING | Section 5 Mandatory Legal Notice | `tests/day5_results_experience.test.mjs` | `docs/screenshots/day-5/after/desktop-01-results-contrast.png` |
| **Comprehensive UI States (Skeletons, Empty, Error)** | **HARDEN (P0)** | WORKING | Skeletons & Recovery Guidance (Spec U9) | `tests/day8_states_responsive_a11y.test.mjs` | `docs/screenshots/day-8/after/desktop-02-planner.png` |
| **Multi-Viewport Layout (390px, 768px, 1440px)** | **HARDEN (P0)** | WORKING | Zero Overflow & 44px Touch Targets (Spec U10) | `tests/day8_states_responsive_a11y.test.mjs` | `docs/screenshots/day-8/after/mobile-02-planner.png` |
| **WCAG 2.1 AA Accessibility & Click Budget** | **HARDEN (P0)** | WORKING | ARIA Combobox/Dialog, <=3 Search, <=2 Book (Spec U11, Sec 8) | `tests/day8_states_responsive_a11y.test.mjs` | `docs/screenshots/day-8/after/desktop-01-home.png` |
| **DPDP 2023 Consent & Privacy Policy** | **ADD (P1)** | WORKING | Local-First Zero-ID + Sec 12 Erasure | `tests/day9_security_dpdp_compliance.test.mjs` | `docs/screenshots/day-9/after/desktop-01-privacy-policy.png` |
| **Terms of Service & Legal Disclaimers** | **ADD (P1)** | WORKING | Statutory Independent Booking Notice | `tests/day9_security_dpdp_compliance.test.mjs` | `docs/screenshots/day-9/after/desktop-02-terms-of-service.png` |
| **Anonymous Feedback Loop** | **ADD (P1)** | WORKING | Zero-ID Anonymous Local Queue | `tests/day9_security_dpdp_compliance.test.mjs` | `docs/screenshots/day-9/after/desktop-05-feedback-modal.png` |
| **Encrypted Document Vault** | **REMOVE COMPLETELY** | REMOVED | None (Irrelevant bloat) | Grep verification (0 refs) | N/A |
| **Regional Transit Phrases** | **REMOVE COMPLETELY** | REMOVED | None (Dictionary bloat) | Grep verification (0 refs) | N/A |
| **Carbon Footprint Calculator** | **REMOVE COMPLETELY** | REMOVED | None (Virtue metric bloat) | Grep verification (0 refs) | N/A |
| **Battery / Telemetry Status Strip** | **REMOVE COMPLETELY** | REMOVED | None (OS responsibility) | Grep verification (0 refs) | N/A |
| **Floating SOS Button on Hero** | **REMOVE COMPLETELY** | REMOVED | None (UI clutter) | Grep verification (0 refs) | N/A |
| **Floating Generic Chatbot Drawer** | **REMOVE COMPLETELY** | REMOVED | None (Hallucination risk) | Grep verification (0 refs) | N/A |
| **Fake Demo Booking / Payment Modal** | **REMOVE COMPLETELY** | REMOVED | None (Replaced by Deep Links) | Grep verification (0 refs) | N/A |
