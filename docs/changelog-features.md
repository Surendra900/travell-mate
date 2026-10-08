# TravelMate Feature Changelog

**Document Version:** 1.1 (Day 1 Execution)  
**Reference:** Section 4 & 16 of [MASTER_SPEC.md](file:///c:/Users/SURENDRA.G/.gemini/antigravity/scratch/travelmate-app/docs/MASTER_SPEC.md)

---

## Day 0: Baseline & Rebuild Audit

### Features Scheduled for Immediate Complete Removal (Day 1):
1. **Encrypted Document Vault (`DocumentVault.jsx`)**
   - *Reason:* Browser IndexedDB/WebCrypto identity document storage is a security liability and completely outside the scope of multimodal route recovery.
2. **Regional Transit Phrase Cards (`EmergencyPhraseCards.jsx`)**
   - *Reason:* Static phrasebook is unrelated clutter.
3. **Carbon Footprint Calculator (`CarbonCalculator.jsx`)**
   - *Reason:* Non-essential virtue metric that distracts from the core route recovery problem.
4. **Battery & Telemetry Status Strip (`StatusBar.jsx`)**
   - *Reason:* Unnecessary visual noise; device battery is an operating system concern.
5. **Floating SOS Button on Hero & Search**
   - *Reason:* Clutters primary search CTA. Helplines belong strictly inside the Passes & Safety drawer.
6. **Floating Generic Chatbot Drawer (`SmartAssistant.jsx`)**
   - *Reason:* Generic LLM chat wrappers hallucinate schedules; replacing with 2 server-side grounded AI endpoints.
7. **Fake "Demo Booking" & Payment Modal (`BookingModal.jsx`)**
   - *Reason:* Misleading to users and hackathon judges; replacing with official verified deep-links.

---

## Day 1: Foundation, Layered Architecture & Feature Pruning

### Features Added:
1. **Design Tokens & Core UI Primitives (`src/styles/tokens/`, `src/components/ui/`)**:
   - `colors.js`: Complete semantic palette (Primary `#0284C7`, Surface, Elevated, Text, Borders, Status).
   - `Button.jsx`, `Badge.jsx`, `Card.jsx`, `Input.jsx`.
   - `ProvenanceBadge.jsx`: Mandatory `LIVE`, `TIMETABLE`, and `ESTIMATE` honesty badges per Section 5.
   - `RiskBadge.jsx`: Standardized connection slack badges (`Safe` >=120m, `Moderate` 90-119m, `Tight` 60-89m, `High Risk` <60m).
2. **Prisma Relational Domain Schema (`prisma/schema.prisma`)**:
   - Models for `Station`, `Train`, `TrainStop`, `Junction`, `Terminal`, `Airport`, `TransferGuide`, `ApiCache`, and `Feedback`.
3. **Local Docker Environment (`docker-compose.yml`)**:
   - Isolated PostgreSQL 16 container definition with health checks and persistent volume.
4. **Runtime Environment Validators (`src/lib/env.js`, `server/config/env.js`)**:
   - Client-safe non-secret validation and server-side secret validation.

### Features Changed:
1. **Booking Action Handlers**:
   - Transitioned from opening in-app fake modal to verified pre-filled deep links (`ConfirmTkt`, `redBus`, `Google Flights`) via `getProviderDeepLink`.
2. **Live Results Card Actions**:
   - Button updated to `Book on Portal`, triggering direct operator deep-linking with fallback clipboard copy.
3. **Analyze Journey Route Query**:
   - Replaced chat drawer toggle with direct planner query routing.

### Features Removed (with Grep Proof):
All 7 bloat components identified in Section 4 have been completely purged from `src/`:
1. `src/components/DocumentVault.jsx` (Deleted)
2. `src/components/EmergencyPhraseCards.jsx` (Deleted)
3. `src/planner/CarbonCalculator.jsx` (Deleted)
4. `src/components/StatusBar.jsx` (Deleted)
5. `src/components/FloatingSOS.jsx` (Deleted)
6. `src/components/SmartAssistant.jsx` (Deleted)
7. `src/components/BookingModal.jsx` (Deleted)

#### Grep Proof (Zero Remaining References in `src/`):
```text
$ git grep -n -E '\b(DocumentVault|EmergencyPhraseCards|CarbonCalculator|StatusBar|FloatingSOS|SmartAssistant|BookingModal)\b' src/
(Exit code: 1, 0 matches found)
```

---

## Day 2: Data Pipeline (ETL & Seed)

### Features Added:
1. **Master Open Data ETL Pipeline (`data/etl/`)**:
   - `extractStations.js`: 47 key railway stations with geo-coordinates and state mapping (GODL-India).
   - `extractJunctions.js`: Top 25 transit junction hubs directory with platforms, transfer metrics, and operating facilities (ODbL).
   - `extractTerminals.js`: 22 inter-state bus terminals (ISBTs & Central Bus Stands) mapped to regional corridors (ODbL).
   - `extractAirports.js`: 17 major civil airports with IATA codes and coordinates (OurAirports CC0).
   - `extractTrainsAndStops.js`: High-frequency trunk train schedules and stop sequences with departure/arrival timings and day offsets (Open Rail Commons).
   - `extractTransferGuides.js`: 24 intermodal transfer guides (Station <-> Bus Terminal / Airport) with transferMode, distanceKm, approxMinutes, and step-by-step guidance.
   - `runEtl.js`: Unified ETL runner validating data quality and generating canonical datasets in `data/processed/` and `shared/data/`.
2. **Prisma Seed Scripts (`prisma/seed.js` and `prisma/seed.ts`)**:
   - Automated database upsert for Station, Junction, Terminal, Airport, Train, TrainStop, and TransferGuide models with graceful fallback for zero-db setups.
3. **Data Quality Test Suite (`tests/day2_data_pipeline.test.mjs`)**:
   - 7 test suites validating coordinate bounds, chronological monotonic stop sequences, non-negative distances, Top 25 hub completeness, and license metadata.
4. **Attribution & Freshness Footer**:
   - Standardized timetable attribution strip in `src/components/Footer.jsx`: "Timetable data as of October 2026 · Map data © OpenStreetMap contributors · Weather data by Open-Meteo" per Section 6.

---

## Day 3: Route Recovery Engine v2

### Features Added:
1. **Time-Expanded Timetable Graph Search (`server/services/routeEngine.js`)**: Direct train search and 1-transfer multi-modal graph search through Top 25 junction hubs.
2. **Minimum Connection Time (MCT) Matrix (`server/config/connectionTimes.js`)**: Strict minimum thresholds: Rail-to-Rail >= 45m, Cross-Metro >= 90m, Rail-to-Bus >= 105m, Rail-to-Airport >= 210m.
3. **Parametric Reliability Model & Delay Absorber (`server/config/reliabilityModel.js`)**: Documented delay probability distributions replacing static percentages, computing exact "Safe up to +X min delay on Leg 1".
4. **Contingency Recovery Engine (`server/services/contingencyEngine.js`)**: Simulates Leg 1 delay propagation, recomputes slack, identifies point of no return, and fetches fallback onward departures.

---

## Day 4: App Shell & Search UX

### Features Added:
1. **Minimal 4-Item Navigation (`src/components/Navbar.jsx`)**: Route Finder, Tatkal Desk, Passes & Safety, and Saved Trips, plus "See a Demo" guided button.
2. **Accessible Station Autocomplete (`src/components/StationAutocomplete.jsx`)**: Canonical station search with keyboard navigation and junction hub badges.
3. **Homepage Hero with 3-Step Educational Strip (`src/pages/Home.jsx`)**: Single dominant search focus, 12-hour "Need to travel tonight?" preset, and split combinations explainer.
4. **Honest Demo Scenario Banner (`src/pages/Planner.jsx`, `docs/demo-mode.md`)**: Prominent illustrative badge with 1-click exit and transparent disclosure.

---

## Day 5: Results & Split Routes Experience

### Features Added:
1. **Waitlist Bypass Visual Contrast (`src/components/WaitlistBypassContrast.jsx`)**:
   - Left side: Direct train status bottleneck ("Waitlist Wall") with WL / RAC / Sold Out status.
   - Right side: Split-route recovery alternative ("Waitlist Bypass") via regional junction hubs with available seats.
   - Statutory independent booking disclosure per Section 5.
2. **Consumer-Grade Journey Cards (`src/components/MultimodalTimelineCard.jsx`)**:
   - Provenance badges (`TIMETABLE`, `ESTIMATE`, or `LIVE`) on every leg and fare estimate.
   - Dynamic indicator: "Safe up to +X min delay on Leg 1".
   - Connection risk badge (`RiskBadge`: Safe, Moderate, Tight, High Risk).
   - "Why TravelMate Picked This Junction" rationale.
   - Station transfer guidance with step-by-step navigation instructions and hub amenities.
3. **Interactive Delay Contingency Simulator (`src/components/DelayContingencySimulator.jsx`)**:
   - Real-time delay slider (0 to 180 min) with quick presets (+15m, +30m, +45m, +60m, +90m, +120m).
   - Live effective slack recomputation, connection status classifier, Point of No Return clock time, and viable fallback departures at the hub.
4. **Dedicated Results Workspace Filtering (`src/components/LiveResultsPanel.jsx`)**:
   - Filter tabs: All Options, Waitlist Bypass Contrast, Paisa Vasool (Budget), Smart Balanced, Fastest Route, Route Map, and Delay Simulator.
   - Integrated Leaflet route visualizer (`RouteMap.jsx`).
5. **NormalPlanner Autocomplete & Recovery Tabs (`src/planner/NormalPlanner.jsx`)**:
   - Upgraded `From` and `To` inputs with `StationAutocomplete`.
   - Integrated Bypass Contrast and Delay Simulator tabs under Journey Intelligence.

---

## Day 6: Urgent Mode Preset, Tatkal Desk & PNR Estimator

### Features Added:
1. **Urgent Departure Preset (`src/pages/Home.jsx`, `src/planner/NormalPlanner.jsx`, `src/pages/Planner.jsx`)**:
   - Decoupled urgent same-day travel from emergency hijacking.
   - Checkbox preset: "Need to travel tonight? (12h)" on search forms.
   - URL query parameter integration (`urgency=Tonight&urgent=12h`).
   - Prominent in-planner banner highlighting 12-hour recovery departure prioritization without sensationalist sirens.
2. **Tatkal Desk Dual-Window IST Countdown (`src/components/TatkalEmergencyTimer.jsx`, `src/planner/EmergencyTatkalPlanner.jsx`, `src/planner/TatkalDesk.jsx`)**:
   - Real-time dual countdown to 10:00 AM IST (AC classes) and 11:00 AM IST (Non-AC classes).
   - Statutory assistive preparation notice explicitly stating that TravelMate does not automate booking, bypass captchas, or store credentials.
   - Replaced emergency red/siren styling with clean, assistive amber/gold palette.
3. **Local Passenger Master List & Zero-ID Compliance (`src/planner/EmergencyTatkalPlanner.jsx`)**:
   - Client-side browser storage strictly limited to: Full Name, Age, Gender, and Berth Preference.
   - Strict Zero-ID Policy banner: strictly zero Aadhaar, passport, or government identity numbers stored or requested.
   - 1-Click Clipboard Copy formatting passenger records in IRCTC fast-fill comma format (`Name, Age, Gender, Berth`).
   - "Clear All Saved Passengers" button for instant local device erasure.
4. **PNR Status & Confirmation Estimator (`src/components/PnrPredictorModal.jsx`)**:
   - 10-digit PNR input with historical statistical confirmation probability gauge.
   - "How we estimate" explanation card clarifying mathematical heuristic modelling vs official PRS charting.
   - Direct deep link to the official Indian Railways PRS enquiry portal (`indianrail.gov.in`).
5. **Indian Transit Glossary Tooltips (`src/components/GlossaryTooltip.jsx`)**:
   - Accessible hover and tap popover glossary for key transit acronyms: `WL` (Waitlist), `RAC` (Reservation Against Cancellation), `PNR` (Passenger Name Record), `Tatkal` (Emergency Quota), and `Junction` (Railway Hub Interchange).
   - Includes official Indian Railways rule citations and accessibility landmarks (`aria-expanded`, keyboard navigation).

---

## Day 7: Passes, Safety Hub, Contextual Weather & Grounded AI

### Features Added:
1. **Passes & Transit Safety Hub (`src/pages/SafetyMode.jsx`)**:
   - Consolidated the legacy safety page into the unified "Passes & Transit Safety" Hub specified in Section 8.
   - Tab 1: Offline Boarding Passes & Trip Pack (P1) displaying digital boarding passes with leg-by-leg details, sample route pass, 1-click print, 1-click clipboard summary copy, and PWA cache sync (`data-testid="tab-offline-passes"`, `data-testid="pwa-offline-status"`, `data-testid="sync-offline-pack-btn"`, `data-testid="view-offline-pass-btn"`, `data-testid="print-pass-btn"`, `data-testid="copy-pass-summary-btn"`).
   - Tab 2: Transit Safety Drawer (P2) with 1-tap 112 (`data-testid="helpline-112"`) and 139 RailMadad (`data-testid="helpline-139"`), live GPS pin sharing on explicit user action (`data-testid="share-gps-pin-btn"`), statutory disclaimer (`data-testid="safety-statutory-notice"`: *"TravelMate is not an emergency service. In an emergency call 112."*), and location privacy disclosure (`data-testid="location-privacy-notice"`).
   - Tab 3: Station Layover Guides (`data-testid="tab-station-guides"`).
2. **Server-Side Grounded AI Architecture (Master Spec Section 7)**:
   - Zod validation schemas (`server/schemas/querySchema.js`): `TravelQuerySchema` and `RouteFactsSchema`.
   - Dual-provider AI interface (`server/adapters/aiProvider.js`) supporting SambaNova primary, Google Gemini fallback, and deterministic heuristic fallback (`heuristicParseQuery`).
   - Feature 7.a: `src/components/NaturalLanguageQueryInput.jsx` on Home and Planner with speech input, "I understood: ..." banner (`data-testid="ai-understood-banner"`), editable chips (`chip-origin`, `chip-destination`, `chip-date`, `chip-mode`, `chip-passengers`), and 1-click form application.
   - Feature 7.b: Grounded route rationale (`data-testid="route-grounded-rationale"`) in `MultimodalTimelineCard.jsx` with strict anti-hallucination validator (`validateRouteRationale`) rejecting unverified cities/places/numbers.
3. **Contextual Weather Disruption (`src/components/MultimodalTimelineCard.jsx`, `src/utils/weatherDisruptionEngine.js`)**:
   - Contextual weather check card (`data-testid="route-contextual-weather"`) evaluating Open-Meteo weather codes and visibility for transfer hubs without full-screen clutter.

