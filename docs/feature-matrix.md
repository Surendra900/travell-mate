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
| **Tatkal Desk (Countdown & Master Pass)** | **KEEP & UPGRADE (P1)** | WORKING | Live IST Clock Sync + LocalStorage | `tests/day7_tatkal.test.mjs` | `docs/screenshots/day-0/before/desktop-1440-02b-tatkal.png` |
| **Direct Single-Mode Search** | **KEEP & UPGRADE (P1)** | WORKING | LIVE (API) / TIMETABLE Fallback | `tests/day1_features.test.mjs` | `docs/screenshots/day-0/before/desktop-1440-01-homepage.png` |
| **Offline Boarding Pass & Trip Pack** | **KEEP & UPGRADE (P1)** | WORKING | Local-First Storage (PWA SW) | `tests/day9_offline.test.mjs` | `docs/screenshots/day-0/before/desktop-1440-04-mytrips.png` |
| **PNR Status & Predictor** | **SIMPLIFY (P2)** | WORKING | Live Provider or Parametric Est. | `tests/day5_pnr.test.mjs` | `docs/screenshots/day-0/before/desktop-1440-04-mytrips.png` |
| **Transit Safety Drawer (112/139/GPS)** | **SIMPLIFY (P2)** | WORKING | Browser Geolocation API + `tel:` | `tests/day6_emergency.test.mjs` | `docs/screenshots/day-0/before/desktop-1440-03-safety.png` |
| **Contextual Weather Disruption** | **SIMPLIFY (P2)** | WORKING | Open-Meteo REST API | `tests/day23_weather_disruptions.test.mjs` | `docs/screenshots/day-0/before/desktop-1440-02-planner.png` |
| **Grounded AI Query Parser (Server-side)** | **ADD (P1)** | PARTIAL (SambaNova) | SambaNova Cloud / Gemini Zod API | `tests/day21_sambanova_copilot.test.mjs` | Pending Day 7 upgrade |
| **Grounded Route Rationale (Server-side)** | **ADD (P1)** | PARTIAL (Template fallback) | Computed Facts JSON Validator | `tests/characterization_engines.test.mjs` | Pending Day 7 upgrade |
| **"See a Demo" Scenario Mode** | **ADD (P0)** | WORKING | Labeled Demo Scenario Banner | `tests/day4_app_shell_search.test.mjs` | `docs/screenshots/day-4/after/desktop-02-demo-banner.png` |
| **"Waitlist Bypass" Visual Contrast** | **ADD (P0)** | WORKING | TIMETABLE Direct vs Split Graph | `tests/day5_results_experience.test.mjs` | `docs/screenshots/day-5/after/desktop-01-results-contrast.png` |
| **Inline Delay Contingency Simulator** | **ADD (P0)** | WORKING | Parametric Slack Absorption Model | `tests/day5_results_experience.test.mjs` | `docs/screenshots/day-5/after/desktop-02-delay-simulator.png` |
| **Statutory Split Booking Disclosures** | **ADD (P0)** | WORKING | Section 5 Mandatory Legal Notice | `tests/day5_results_experience.test.mjs` | `docs/screenshots/day-5/after/desktop-01-results-contrast.png` |
| **Encrypted Document Vault** | **REMOVE COMPLETELY** | REMOVED | None (Irrelevant bloat) | Grep verification (0 refs) | N/A |
| **Regional Transit Phrases** | **REMOVE COMPLETELY** | REMOVED | None (Dictionary bloat) | Grep verification (0 refs) | N/A |
| **Carbon Footprint Calculator** | **REMOVE COMPLETELY** | REMOVED | None (Virtue metric bloat) | Grep verification (0 refs) | N/A |
| **Battery / Telemetry Status Strip** | **REMOVE COMPLETELY** | REMOVED | None (OS responsibility) | Grep verification (0 refs) | N/A |
| **Floating SOS Button on Hero** | **REMOVE COMPLETELY** | REMOVED | None (UI clutter) | Grep verification (0 refs) | N/A |
| **Floating Generic Chatbot Drawer** | **REMOVE COMPLETELY** | REMOVED | None (Hallucination risk) | Grep verification (0 refs) | N/A |
| **Fake Demo Booking / Payment Modal** | **REMOVE COMPLETELY** | REMOVED | None (Replaced by Deep Links) | Grep verification (0 refs) | N/A |
