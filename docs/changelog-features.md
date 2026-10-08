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
