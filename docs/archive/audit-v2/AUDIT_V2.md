# Independent Senior Product Audit Report (V2 Rebuild)

**Product:** TravelMate (Multimodal Disruption & Route Recovery Engine)  
**Evaluator:** Independent Senior Product Auditor, UX Researcher, QA Lead, Accessibility Specialist & Security Reviewer  
**Date:** October 9, 2026  
**Audited Targets:**
- Production Deployment: `https://travelmate-ai-flowzint.vercel.app` (Release Tag: `day-10`, Commit: `2be4fd8`)
- Local Branch Build: `http://127.0.0.1:5173` (Branch: `rebuild/route-recovery`)

---

## 1. Executive Verdict & What Changed Since the First Audit

### Executive Verdict
**VERDICT:** TravelMate is a technically sound, lightning-fast intermodal route recovery prototype with an elegant design system and zero bloat, but it is severely compromised on cold first visits by stacked blocking modal dialogs and is hobbled by an undersized 12-train static timetable graph.

### Summary of Transformation
Since the baseline audit and initial 30-day prototype, the project underwent an intensive structural rebuild. The team achieved complete physical excision of 7 major bloat features (`DocumentVault`, `CarbonCalculator`, `FloatingSOS`, `SmartAssistant`, `BookingModal`, `StatusBar`, and `EmergencyPhraseCards`), successfully eliminating all mock payment modals and irrelevant document storage. The core routing and delay contingency engines were replaced with deterministic, mathematically sound timetable algorithms that execute in sub-millisecond time (p50: 0.26ms).

However, the rebuild introduced critical regressions:
1. A full-screen "Are you blind?" voice gate dialog (`BlindVoiceGate.jsx`) was mounted in `src/App.jsx` on cold start, directly violating Section 8 of `docs/MASTER_SPEC.md` which explicitly ordered its removal.
2. A global location permission gate (`LocationPermissionGate.jsx`) was mounted alongside it, causing both modals to open simultaneously over the viewport on a fresh visitor's first arrival, trapping the user and intercepting pointer events.
3. The static railway dataset was restricted to only 12 curated trains across 47 stations, causing 85% of realistic inter-city corridors outside the demo trunk to return zero routes.

---

## 2. Progress Table Versus the First Audit

| Baseline Finding / Excised Feature | Rebuild Status | Evidence / Verification |
| :--- | :---: | :--- |
| **Encrypted Document Vault** (`DocumentVault.jsx`) | **RESOLVED** | `git grep -i DocumentVault -- src/` returned 0 matches; component deleted. |
| **Regional Transit Phrase Cards** (`EmergencyPhraseCards.jsx`) | **RESOLVED** | `git grep -i EmergencyPhraseCards -- src/` returned 0 matches; dictionary bloat removed. |
| **Carbon Footprint Calculator** (`CarbonCalculator.jsx`) | **RESOLVED** | `git grep -i CarbonCalculator -- src/` returned 0 matches; virtue metric removed. |
| **Battery & Telemetry Status Strip** (`StatusBar.jsx`) | **RESOLVED** | `git grep -i StatusBar -- src/` returned 0 matches; redundant OS indicator deleted. |
| **Floating SOS Button on Hero** (`FloatingSOS.jsx`) | **RESOLVED** | `git grep -i FloatingSOS -- src/` returned 0 matches; emergency dialing moved into Safety Mode. |
| **Floating Chatbot Drawer** (`SmartAssistant.jsx`) | **RESOLVED** | `git grep -i SmartAssistant -- src/` returned 0 matches; ungrounded chatbot replaced by structured endpoints. |
| **Fake Booking & Payment Modals** (`BookingModal.jsx`) | **RESOLVED** | `git grep -i BookingModal -- src/` returned 0 matches; replaced by authentic deep links. |
| **Full-Screen "Are you blind?" Voice Gate** | **REGRESSION** | `src/components/BlindVoiceGate.jsx` remains active in `src/App.jsx:138`; pops up on cold start. |
| **Location Permission Pre-Prompt** | **REGRESSION** | `src/components/LocationPermissionGate.jsx` opens on load prior to user click. |
| **Unverified "Confirmed" Claims** | **NOT RESOLVED** | UI copy in `multimodalRouter.js`, `MultimodalTimelineCard.jsx`, `StationHopperCard.jsx` retains "confirmed" claims without live API check. |

---

## 3. Spec Compliance Matrix (`docs/MASTER_SPEC.md`)

| Section | Spec Requirement | Status | Evidence & Notes |
| :---: | :--- | :---: | :--- |
| **Sec 3** | Product Identity: Route Recovery Engine | **PASS** | Clear branding on Home: "Find a way forward when direct tickets are sold out." |
| **Sec 4** | 7 Bloat Features Completely Removed | **PASS** | Verified via `part2_grep_results.json` (0 references across source, schema, and packages). |
| **Sec 5** | No "confirmed" or "guaranteed" without live check | **FAIL** | Multiple instances found in `src/utils/multimodalRouter.js`, `StationHopperCard.jsx`, and `MultimodalTimelineCard.jsx`. |
| **Sec 5** | Provenance Badges (LIVE, TIMETABLE, ESTIMATE) | **PASS** | `ProvenanceBadge.jsx` renders on journey legs with exact labels. |
| **Sec 5** | Unbundled Tickets Statutory Disclosure | **PASS** | Statutory booking warning rendered on all split-ticket results and cards. |
| **Sec 6** | Time-expanded timetable graph | **PASS** | `server/services/routeEngine.js` performs chronological timetable search. |
| **Sec 6** | Top 25 Junction Hub Directory | **PASS** | `shared/data/junctions.json` defines all 25 high-traffic transfer junctions. |
| **Sec 6** | Minimum Connection Times Config & Model | **PASS** | `server/config/connectionTimes.js` enforces 45m rail-to-rail, 105m bus, 210m air. |
| **Sec 6** | Delay Simulator with Slack & Point of No Return | **PASS** | `simulateLeg1Delay` computes exact slack, risk level, and fallback onward departures. |
| **Sec 7** | Grounded AI limited to 2 server-side uses | **PASS** | Natural language query parsing + route rationale strictly validated via Zod schemas. |
| **Sec 8** | Information Architecture: At most 4 nav items | **PASS** | Primary navbar defines exactly 4 items (`Route Finder`, `Tatkal Desk`, `Passes & Safety`, `Saved Trips`). |
| **Sec 8** | Removal of "Are you blind?" blocking gate | **FAIL** | `BlindVoiceGate.jsx` is still mounted in `src/App.jsx:138` and fires on cold visit. |
| **Sec 8** | Search <= 3 clicks, Booking <= 2 clicks | **PARTIAL** | Home search takes 2 clicks, but redirects to `/planner` where user must click Search again. |
| **Sec 15** | Request location ONLY on explicit user action | **FAIL** | `LocationPermissionGate.jsx` prompts on cold landing before any user click. |
| **Sec 15** | Zero ID Numbers Stored | **PASS** | Local Passenger Master stores Name, Age, Gender, Berth; zero Aadhaar/passport fields. |
| **Sec 18** | Vercel Production Deploy with Clean Alias | **PASS** | Deployed to `https://travelmate-ai-flowzint.vercel.app`, HTTP 200 OK verified. |

---

## 4. PROS (System Strengths with Empirical Evidence)

1. **P-01 | Clear Value Proposition & Identity:** Once the hero screen is visible, the product positioning is unmistakable. It immediately answers what it does, for whom, and why it is better than standard booking apps. (Evidence: `part1_dismiss_analysis.json`).
2. **P-02 | Clean Primary Navigation Architecture:** The main navigation bar strictly enforces a 4-item cognitive limit (`Route Finder`, `Tatkal Desk`, `Passes & Safety`, `Saved Trips`), eliminating navigation bloat. (Evidence: `src/components/Navbar.jsx:7-12`).
3. **P-03 | 100% Pruning Verification:** All 7 excised bloat features (`DocumentVault`, `CarbonCalculator`, `FloatingSOS`, `SmartAssistant`, `BookingModal`, `StatusBar`, `EmergencyPhraseCards`) have zero occurrences in the codebase. (Evidence: `docs/audit-v2/test-logs/part2_grep_results.json`).
4. **P-04 | Sub-Millisecond Search Latency:** Pre-indexed in-memory timetable graph search achieves p50 latency of 0.26ms and p95 of 1.08ms across 30 consecutive calls. (Evidence: `docs/audit-v2/metrics/part8_performance_report.json`).
5. **P-05 | Mathematically Sound Delay Simulator:** `contingencyEngine.js` accurately models slack absorption, calculates exact point-of-no-return times, and provides viable onward departures. (Evidence: `docs/audit-v2/test-logs/part4_battery_results.json`).
6. **P-06 | Zero Leaked Secrets:** Audits across the entire client source tree, production build assets, and git commit history revealed zero hardcoded API keys or tokens. (Evidence: `docs/audit-v2/test-logs/git_secret_matches.json`).
7. **P-07 | 100% Regression Suite Stability:** 216 tests across 4 suites passed 3 consecutive runs with 0 failures and 0% flakiness. (Evidence: `npm test` runs 1, 2, and 3 logs).
8. **P-08 | Responsive Multi-Viewport Layout Integrity:** Tested across 5 viewports (360x640, 390x844, 768x1024, 1440x900, 1920x1080) with zero horizontal scroll overflow. (Evidence: `docs/audit-v2/test-logs/part6_visual_report.json`).
9. **P-09 | DPDP Act 2023 Compliance & Zero-ID Policy:** Local-first storage with 1-click erasure button (`data-testid="dpdp-erase-all-btn"`) and complete absence of government ID fields. (Evidence: `src/pages/PrivacyPolicy.jsx`).
10. **P-10 | Offline Emergency Safety Hub:** Dedicated transit safety drawer with 1-tap dialers for 112 and 139 that operate with zero connectivity. (Evidence: `src/pages/SafetyMode.jsx`).

---

## 5. CONS (Identified Defects & Deficiencies Grouped by Category)

### UX and UI
- **C-01 | Critical | Dual Modal Lockout on Cold First Visit:** When a new visitor arrives, `BlindVoiceGate` (`z-100`) and `LocationPermissionGate` (`z-130`) open simultaneously. The location gate overlays the voice gate, blocking pointer events while audio prompts play underneath. (`src/App.jsx:138-139`).
- **C-07 | High | Modal Trapping by LiveResultsPanel:** `LiveResultsPanel.jsx` opens as a full-screen fixed overlay (`z-50`), completely covering and blocking access to the interactive Delay Simulator and Route Map tabs on the underlying Planner page. (`src/components/LiveResultsPanel.jsx:480`).
- **C-14 | Low | Unbounded Date Picker:** The date picker on Home does not set `min={localDateIso()}`, allowing selection of past dates in manual input. (`src/pages/Home.jsx:197`).

### Spec Compliance
- **C-02 | Critical | "Are you blind?" Gate Spec Violation:** Master Spec Section 8 line 87 explicitly mandated: *"The old full-screen blocking 'Are you blind?' gate is removed."* However, `BlindVoiceGate.jsx` remains mounted in `src/App.jsx:138` and auto-opens on home landing. (`src/components/BlindVoiceGate.jsx:130`).

### Security and Privacy
- **C-03 | High | Location Permission Prompted on Cold Load:** Master Spec Section 15 requires: *"Request permissions (location) only on explicit user action with a clear explanation."* `LocationPermissionGate.jsx` prompts on initial page load before any user click. (`src/components/LocationPermissionGate.jsx:36`).
- **C-10 | High | Missing Content-Security-Policy Header:** Live production deployment on Vercel returns HSTS and anti-framing headers, but `Content-Security-Policy` header is completely missing. (`part10_security_report.json`).
- **C-13 | Medium | npm Audit Vulnerabilities:** 14 dependency vulnerabilities reported (9 high, 5 moderate) in package dependencies. (`part10_security_report.json`).

### Data Honesty
- **C-04 | High | Misleading "Confirmed" Claims on Non-Live Data:** Master Spec Section 5 strictly forbids "confirmed" without live verification. Code in `multimodalRouter.js:189`, `MultimodalTimelineCard.jsx:379`, and `StationHopperCard.jsx:21` uses phrases like "confirmed split-ticket availability" and "Confirmed Bypass Option" on static timetable data. (`part3_honesty_grep.json`).

### Engine Correctness & Data Pipeline
- **C-05 | Critical | Severely Undersized Timetable Dataset:** Static dataset contains only 12 trains and 47 stations across all of India. 17 of 20 tested intercity corridors (85% failure rate) return zero routes. (`part4_battery_results.json`).
- **C-06 | Medium | Deep Link Parameter Mismatch:** `getBookingDeepLink` passes railway station codes (`CNB`, `NDLS`) directly into redBus URL path slugs and Google Flights queries instead of city names or IATA airport codes. (`server/services/routeEngine.js:141`).

### Information Architecture & Usability
- **C-08 | Medium | Double-Search Flow Confusion:** Submitting a search on Home navigates to `/planner` with URL query parameters, but the results panel does not auto-open, requiring the user to tap "Search Available Train Options" a second time. (`part3_search_flow.json`).

### Accessibility
- **C-09 | High | WCAG 2.1 AA Color Contrast Violations:** Axe-core flagged serious color contrast failures on footer utility buttons (`footer-dpdp-modal-btn`, `footer-feedback-btn`) and cyan text on dark slate in `/privacy`, `/terms`, and `/disclaimer`. (`part7_a11y_report.json`).

### Code Architecture & Performance
- **C-11 | Medium | Duplicate Component Mount:** Two instances of `WaitlistBypassContrast` are mounted simultaneously on `/planner` (one on page, one inside `LiveResultsPanel`). (`part5_mobile_tasks_clean.json`).
- **C-12 | Medium | Bloated Auth Bundle:** `@clerk/clerk-react` accounts for 205 KB in client assets despite authentication being disabled by default. (`part8_performance_report.json`).

### Business & Pitch Readiness
- **C-15 | Medium | Unbundled Ticket Cancellation Risk:** If Leg 1 suffers an extreme delay, Indian Railways and bus operators owe zero refund for Leg 2, creating significant user adoption friction. (`real-vs-demo-matrix.md`).

---

## 6. Competitive Comparison Matrix

| Capability / Feature | TravelMate | ConfirmTkt | ixigo | redBus | Google Maps | Rome2Rio |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Multimodal Split Routing (Train + Bus/Air)** | **YES (Core)** | NO | NO | NO | Partial (Transit) | Yes (Global) |
| **Connection Risk & Delay Simulator** | **YES (Core)** | NO | NO | NO | NO | NO |
| **Tatkal Dual Countdown & Local Master** | **YES** | NO | NO | NO | NO | NO |
| **Waitlist Bypass Visual Contrast** | **YES** | Same-train only | NO | NO | NO | NO |
| **100% Offline Passes & Safety Dialers** | **YES** | NO | NO | NO | NO | NO |
| **Direct Integrated Booking** | NO (Deep Links) | **YES** | **YES** | **YES** | NO | NO |
| **Live GPS Train Movement (NTES)** | Simulated | **YES** | **YES** | NO | NO | NO |
| **Coverage Volume** | 12 trains (Demo) | **All Trains** | **All Trains** | **All Buses** | **Global** | **Global** |

---

## 7. Feature Audit Table

| Feature | Disposition | Current Audit Status | Recommendation |
| :--- | :---: | :---: | :--- |
| **Multimodal Split Router** | KEEP | WORKING (Fast, but 12 trains) | **BUILD MORE:** Expand static graph to 200 trunk trains |
| **Delay Simulator** | KEEP | WORKING (Math is solid) | **UPGRADE:** Expose slider directly in main results view |
| **Tatkal Emergency Desk** | KEEP | WORKING | **KEEP:** High utility, compliant local clipboard |
| **Offline Passes & Safety** | KEEP | WORKING | **KEEP:** Clean offline PWA support |
| **BlindVoiceGate Modal** | REMOVE | VIOLATING SPEC | **STOP / REMOVE:** Delete cold-start auto-prompt |
| **LocationPermissionGate** | REMOVE | VIOLATING SPEC | **STOP / REMOVE:** Move prompt inside Safety Mode |
| **Deep Link Generator** | UPGRADE | PARTIAL (Code mismatch) | **UPGRADE:** Map station codes to city slugs / IATA |

---

## 8. Beginner Usability Test Results

| User Task (Mobile 390x844) | Duration | Hesitation / Friction Observed | Status |
| :--- | :---: | :--- | :---: |
| **(a) Find alternative route for sold-out corridor** | 4.6s | Blocked by 2 cold start modals; double-search click required | **PASS** |
| **(b) Understand transfer risk** | 1.8s | Duplicate contrast cards mounted; risk badge requires scrolling | **PARTIAL** |
| **(c) Simulate late first train** | 15.0s | Results modal covers page, intercepting pointer events to slider tab | **FAIL** |
| **(d) Use demo scenario** | 1.4s | Demo banner rendered with clear indication | **PASS** |
| **(e) Prepare for Tatkal** | 1.2s | Synchronized countdowns and passenger master list functional | **PASS** |
| **(f) Open offline pass** | 0.7s | Instant load from localStorage | **PASS** |
| **(g) Find helpline numbers** | 0.7s | 112 and 139 dialer buttons prominent | **PASS** |
| **(h) Change date/origin after results** | 1.1s | Inputs responsive | **PASS** |
| **(i) Recover from mistake (empty form)** | 1.2s | Form validation prevents invalid submission | **PASS** |

---

## 9. Performance & Bundle Metrics

### Search Latency (30 Invocations)
- **Cold Invocation:** 11.07 ms
- **Warm Invocations (p50):** 0.26 ms
- **p95 Latency:** 1.08 ms
- **Max Latency:** 11.07 ms

### Client Production Asset Footprint
- `Planner-B54ho9XL.js`: 210.89 kB (gzip: 53.94 kB)
- `vendor-auth-DObaHfal.js`: 210.10 kB (gzip: 62.68 kB) — *Unused Clerk auth*
- `index-Bv6Kbywh.js`: 191.35 kB (gzip: 61.33 kB)
- `vendor-maps-B40yZd3c.js`: 148.81 kB (gzip: 43.38 kB)
- `index-D6Wu9Oci.css`: 78.94 kB (gzip: 13.95 kB)
- **Total JS Footprint:** ~890 kB uncompressed (~280 kB gzipped)

---

## 10. Hackathon Judge Scorecard

*Scoring Scale: 1-3 (Failing/Deceptive), 4-6 (Average/Prototype), 7-8 (Strong/Startup-Grade), 9-10 (Exceptional/World-Class)*

| Evaluation Dimension | Score (1-10) | Calibration Rationale & Evidence |
| :--- | :---: | :--- |
| **1. Problem Significance** | **9 / 10** | 300M+ passengers hit the waitlist wall; critical national transit pain. |
| **2. Innovation** | **8 / 10** | Time-expanded intermodal split-routing and delay slack simulator are genuine advances. |
| **3. Differentiation** | **8 / 10** | Incumbents sell siloed tickets; TravelMate stitches cross-operator alternatives. |
| **4. Technical Depth** | **7 / 10** | Clean graph algorithms and math models, but dataset is restricted to 12 trains. |
| **5. Feasibility** | **8 / 10** | Completely client-resilient, deterministic, zero scraping vulnerabilities. |
| **6. User Experience** | **6 / 10** | Elegant token design, but severely penalized by cold modal lockout and modal trapping. |
| **7. Market Potential** | **8 / 10** | $9.19B SAM in intercity transportation with huge commuter demand. |
| **8. AI Integration** | **7 / 10** | Server-side grounded rationale and query parser adhering to structured schemas. |
| **9. Demo Quality** | **7 / 10** | Flawless for Delhi-Patna demo scenario, but searching arbitrary cities returns 0 routes. |
| **10. Social Impact** | **8 / 10** | Provides tangible rescue options for emergency commuters and students. |
| **11. Scalability** | **6 / 10** | In-memory search is fast for 12 trains; needs database indexing to reach 13,000 trains. |
| **12. Business Model Viability** | **7 / 10** | Dual affiliate commissions are sound; unbundled ticket liability is the main barrier. |
| **13. Trustworthiness & Honesty** | **6 / 10** | Good provenance badges, but "confirmed" copy on static data violates spec. |
| **OVERALL WEIGHTED SCORE** | **7.15 / 10** | **Solid technical foundation; requires removal of modal friction and data expansion.** |

---

## 11. Top Rejection Risks & Counter-Measures

1. **Risk: Judge gets trapped on cold visit by Voice & Location modals.**  
   *Counter-measure:* Disable automatic modal popups; require user to click "Voice Mode" or "Share Location".
2. **Risk: Judge searches their hometown and gets 0 results.**  
   *Counter-measure:* Prominently label the demo as "Active Corridors: Delhi-Patna, Delhi-Kolkata, Bengaluru-Chennai" with quick chips.
3. **Risk: "What happens if Train 1 is late and I miss Bus 2?"**  
   *Counter-measure:* Point directly to the Delay Simulator and statutory disclosures; show that TravelMate enforces >=90m transfer buffers.
4. **Risk: "Is split booking legal on IRCTC?"**  
   *Counter-measure:* Yes, two independent PNRs are completely legal under Indian Railways Passenger Reservation Guidelines.
5. **Risk: "Are you scraping IRCTC?"**  
   *Counter-measure:* No, TravelMate uses open static timetables and deep-links directly to official booking portals.
6. **Risk: "Why not just use ConfirmTkt?"**  
   *Counter-measure:* ConfirmTkt only finds same-train alternate quotas; it cannot stitch a train to a bus or flight.
7. **Risk: "How do you make money?"**  
   *Counter-measure:* Affiliate commissions on both legs (₹40–₹75 blended margin) plus ₹49 TravelMate Pro micro-transactions.
8. **Risk: "Axe accessibility contrast violations."**  
   *Counter-measure:* Darken cyan text on light backgrounds and boost footer button contrast to pass WCAG 2.1 AA.
9. **Risk: "Deep link fails on redBus because station code is passed."**  
   *Counter-measure:* Add a lookup mapping station codes (`CNB` -> `Kanpur`) for bus booking links.
10. **Risk: "You claim 'confirmed' but don't have live API access."**  
    *Counter-measure:* Replace all occurrences of "confirmed" with "verified schedule" or "available at last check".

---

## 12. Prioritized Backlog

### P0 (Must Fix Before Pitch)
1. **Remove Cold-Start Modals:** Delete auto-open logic in `BlindVoiceGate.jsx` and `LocationPermissionGate.jsx`. Effort: S (<1 hour).
2. **Sanitize "Confirmed" Copy:** Replace "confirmed split-ticket" in `multimodalRouter.js` and `MultimodalTimelineCard.jsx` with "verified timetable connection". Effort: S (<1 hour).
3. **Auto-Trigger Search on Planner:** If valid query params exist in URL, auto-execute search so users don't have to click Search twice. Effort: S (<1 hour).

### P1 (Should Fix)
1. **Fix RedBus & Flight Deep Links:** Map station codes to city names for redBus and IATA codes for Google Flights. Effort: M (2-4 hours).
2. **Inline Results Rendering:** Render journey results inline on the Planner page rather than in a fixed full-screen modal backdrop. Effort: M (3-5 hours).
3. **Fix WCAG Contrast:** Adjust footer button and legal text contrast to pass WCAG 2.1 AA. Effort: S (1 hour).
4. **Add CSP Header:** Include `Content-Security-Policy` in `vercel.json`. Effort: S (30 mins).

### P2 (Later Improvements)
1. **Expand Railway Graph:** Ingest top 200 trunk express trains into `shared/data/trains.json`. Effort: L (1-2 days).
2. **Remove Unused Clerk Auth Bundle:** Drop `@clerk/clerk-react` to shed 205 KB. Effort: S (1 hour).

### Quick Wins Under 1 Hour
- Add `min={localDateIso()}` to `#home-travel-date`.
- Remove `BlindVoiceGate` from `src/App.jsx`.
- Set `LocationPermissionGate` to open only when triggered from `/safety`.

---

## 13. Pitch Recommendation: Go or No-Go

**RECOMMENDATION: GO WITH CONDITIONS**

**Mandatory Conditions Prior to Live Stage Demo:**
1. **Condition 1:** The team MUST remove the automatic cold-start popup of `BlindVoiceGate` and `LocationPermissionGate`. A judge opening the live Vercel URL on their phone will otherwise be greeted by stacked modal dialogs blocking the hero screen.
2. **Condition 2:** The presenter MUST steer the live demo through the curated high-traffic corridor chips (`Delhi ⇄ Patna` or `Delhi ⇄ Howrah`) and NOT invite the judges to type arbitrary unlisted stations until the dataset is expanded beyond 12 trains.

If these two conditions are respected, the live demo of the Waitlist Bypass Contrast, Delay Simulator, and Tatkal Emergency Desk will be compelling and competitive.

---

## 14. What Was Not Audited or Was Blocked

1. **Live IRCTC Direct Booking API:** BLOCKED — Commercial IRCTC API access requires enterprise licensing and CAPTCHA handling; audited via verified deep links.
2. **Live NTES GPS Train Telemetry:** BLOCKED — Real-time railway GPS telemetry feeds require enterprise railway credentials; audited via deterministic parametric delay simulation.
3. **Browser Cross-Engine Testing (WebKit/Firefox):** PARTIAL — Full Chromium headless suite executed; WebKit/Firefox binaries not bundled in the Windows CI environment.
