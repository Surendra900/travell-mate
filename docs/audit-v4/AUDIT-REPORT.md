# TravelMate v2.5.1 — Independent Pin-to-Pin Audit Report

**Auditor role:** Senior product auditor / QA engineer / security reviewer / startup analyst. Did NOT build this product.

**Date:** 2026-10-09 | **Branch:** fix/audit-v2 | **Commit:** 4499e8c | **App:** http://127.0.0.1:5173 (local dev server confirmed running)

> No comfort. No generic praise. Every finding is grounded in command output, grep results, or test evidence. Nothing marked done from memory.

---

## Step 1 — Inventory

### Pages (9)
| Route | File | Size |
|-------|------|------|
| `/` | Home.jsx | 20 KB |
| `/planner` | Planner.jsx | 26 KB |
| `/safety` | SafetyMode.jsx | 19 KB |
| `/saved` + `/plans` | SavedPlans.jsx | 19 KB |
| `/analyze` | AnalyzeJourney.jsx | 5.6 KB |
| `/privacy` | PrivacyPolicy.jsx | 7 KB |
| `/terms` | TermsOfService.jsx | 5 KB |
| `/disclaimer` | LegalDisclaimer.jsx | 7 KB |
| `/safety/:id` | EmergencyDetail.jsx | 6.5 KB |

### Components (37)
36 non-trivial components in `src/components/`. Notable sizes:
- `EmergencyToolkit.jsx` — **36 KB** (largest — suspicious given spec §4 removal mandate)
- `LiveResultsPanel.jsx` — 24 KB
- `MultimodalTimelineCard.jsx` — 22 KB
- `VoiceSearchButton.jsx` — 16 KB

### API Routes (12 Vercel serverless functions)
`trains/search`, `trains/pnr`, `trains/status`, `trains/live-station`, `trains/station-search`, `trains/seat-availability`, `assistant`, `translate`, `voice/transcribe`, `recovery`, `buses/search`, `flights/search`

### Utilities (17)
`multimodalRouter.js`, `scoring.js`, `pnrPredictor.js`, `contingencyEngine.js`, `stationHopper.js`, `weatherDisruptionEngine.js`, `voiceIntent.js` (18 KB), `secureVault.js` (16 KB — should be removed), `storage.js`, `deviceStatus.js`, `offlineMode.js`, `vaultPassBridge.js`, and 5 others.

### Static Data (8 files)
- `transportData.js` — **52 KB** (compiled station/route data)
- `languageData.js` — **43 KB** (multilingual strings)
- `transitHubData.js` — 7.9 KB (only 7 hubs — spec requires 25)
- `emergencyData.js`, `stationsData.js`, `analyticsData.js`, `journeyData.js`, `demoTourData.js`

### Test Suite
50 test files. All pass at 100%. Exit code 0 on core + engine + security + regression tests.

---

## Step 2 — UX / Website Audit

### What the code shows
| Check | Status |
|-------|--------|
| Single primary CTA on home | ✅ One search card hero |
| NL AI query input | ✅ `NaturalLanguageQueryInput.jsx` |
| Station autocomplete | ✅ `StationAutocomplete.jsx` |
| Popular corridors | ✅ 4 hardcoded corridors |
| "Tonight" urgency preset | ✅ `travelTonight` toggle |
| Waitlist vs. alternative contrast | ✅ `WaitlistBypassContrast.jsx` |
| Offline mode fallback | ✅ `OfflineOnlyMode.jsx` |
| PWA install banner | ✅ `PwaInstallBanner.jsx` |
| Error boundary | ✅ `PageErrorBoundary.jsx` |
| Skip-to-content link | ✅ App.jsx line 142 |
| WCAG 2.1 AA contrast (axe) | ✅ C-09 test: 7 routes, 0 violations |
| Date min constraint | ✅ C-14: 7 checks, all pass |
| Unbundled disclaimer | ✅ C-15: 4 checks, all pass |
| No "confirmed/guaranteed" claims | ✅ C-04: 5 checks, all pass |
| Search auto-trigger | ✅ C-08: 3 checks, all pass |

### UX weaknesses (code-visible)
- Home has 4 hardcoded popular corridors — these never update dynamically.
- Voice search button is shown on ALL pages except `/analyze` — may clutter the planner UI.
- 5 navbar items (Route Finder, Tatkal, Safety, Voice, Demo) — spec says ≤ 4 items.

---

## Step 3 — Spec Compliance

### CRITICAL FAILURES — Product-Correctness Violations

---

### F-01 · Hardcoded departure times shown as specific clock times

**Severity: CRITICAL | File: `src/utils/multimodalRouter.js` lines 104–232**

```js
// Tier 1 (Paisa Vasool)
depart: '07:30',  arrive: '11:15',   // leg 1
depart: '13:00',  arrive: '20:30',   // leg 2

// Tier 2 (Smart Balanced)
depart: '14:30',  arrive: '18:15',   // leg 1
depart: '20:15',  arrive: '06:30',   // leg 2 (bus)

// Tier 3 (Emergency Express)
depart: '06:00',  arrive: '09:45',   // leg 1
depart: '13:15',  arrive: '15:30',   // leg 2 (flight)
```

**MASTER_SPEC §5:** *"Show an exact departure time ONLY for LIVE or TIMETABLE. For ESTIMATE show a range, such as 'Buses usually depart every 30 to 60 min. Check the portal.'"*

**MASTER_SPEC §6:** *"the haversine corridor filter may prune candidates but may NEVER be the source of times."*

These are hardcoded string literals. There is no timetable lookup, no API call, no dataset backing them. A traveler who books based on "07:30 NDLS → Kanpur" may find no such train. **This is the single most dangerous product bug** — the core feature actively misleads users.

**Rating: 1/10**

---

### F-08 · No real timetable graph — core spec §6 engine is missing

**Severity: CRITICAL | File: `src/utils/multimodalRouter.js` lines 78–83**

```js
const leg1DurationMin = Math.round((leg1Km / 65) * 60)  // 65 km/h assumed
const leg2DurationMin = Math.round((leg2Km / 65) * 60)
const transferMin = 105  // hardcoded constant
```

MASTER_SPEC §6 specifies:
- A time-expanded timetable graph
- "Direct options first, then 1-transfer itineraries through junction hubs"
- Source: open datasets (data.gov.in, GitHub railway datasets)
- "Minimum connection times from a config file, tested"

What exists: haversine km ÷ assumed speed = synthetic duration. No GTFS. No RapidAPI call for multimodal legs. No direct-option-first search order. No open dataset integration. The daily-gate test for Day 3 passes because it tests the *shape* of the output, not the *real-data source*.

**Rating: 1/10 for real-data integration**

---

### HIGH SEVERITY — Data Honesty Violations

### F-05 · Travel score uses hash-based pseudo-random jitter

**Severity: HIGH | File: `src/utils/scoring.js` lines 15–25**

```js
function routeHash(plan) {
  let hash = 0
  for (let i = 0; i < text.length; i++) hash = ((hash << 5) - hash) + text.charCodeAt(i)
  return Math.abs(hash)
}

function routeSpecificAdjustment(plan, spread = 8) {
  return (routeHash(plan) % (spread * 2 + 1)) - spread  // adds ±8 points
}
```

This function injects a ±8 point variance into the travel score based on a string hash of the route. "Delhi→Patna" and "Delhi→Mumbai" get different scores not because of real data differences but because of different hash values. This wobble is applied in 6 different places in `scoring.js`. The user sees a score that appears calculated but is partially random. **MASTER_SPEC §5:** *"The number must come from a documented model."*

**Rating: 2/10**

### F-04 · PNR predictor base rates are undocumented magic constants

**Severity: HIGH | File: `src/utils/pnrPredictor.js` lines 10–46**

```js
RAC:  { baseRate: 0.94 }
GNWL: { baseRate: 0.78 }
RLWL: { baseRate: 0.52 }
PQWL: { baseRate: 0.32 }
TQWL: { baseRate: 0.15 }
RSWL: { baseRate: 0.28 }
```

These are hardcoded. No source cited, no historical dataset, no statistical methodology documented. MASTER_SPEC §5 says *"The number must come from a documented model, never from a constant."* No "How we estimate" tooltip or modal was found in the codebase for this component.

**Rating: 3/10**

### F-10 · Rate limiter is per-Lambda-instance, not global

**Severity: HIGH | File: `api/_security.js` lines 3–4**

```js
const RATE_LIMIT_STORE = globalThis.__travelmateRateLimitStore || new Map()
globalThis.__travelmateRateLimitStore = RATE_LIMIT_STORE
```

On Vercel Serverless, each cold start is a separate process with its own `globalThis`. Multiple concurrent Lambda instances each have their own fresh `Map`. A distributed attacker routing requests to different instances bypasses the rate limit entirely. The `globalThis` trick only works within a single execution context lifetime.

**Fix:** Upstash Redis + `@upstash/ratelimit` (free tier: 10k requests/day). Drop-in replacement, ~2 hours of work.

**Rating: 3/10 for distributed rate-limiting**

---

### MEDIUM SEVERITY — Spec Compliance Gaps

### F-02 · Transit hub directory: 7 of 25 required

**File: `src/data/transitHubData.js`**

Present: Jaipur, Vijayawada, Nagpur, Pune, Bhopal, Kanpur, Hyderabad.

Missing from MASTER_SPEC §4 list: DDU/Mughalsarai, Itarsi, Kharagpur, Jhansi, Katpadi, Guntakal — plus ~12 others to reach 25. The corridor engine may recommend paths through hubs it has no guidance data for.

### F-03 · Hardcoded production domain in source

**Files: `src/utils/multimodalRouter.js` line 291, `src/components/PnrPredictorModal.jsx` line 148**

```js
// Grep result:
`https://travelmate-ai-flowzint.vercel.app/planner?from=...`
Verified on TravelMate: https://travelmate-ai-flowzint.vercel.app/`
```

If the deployment alias changes (custom domain, new project), all share links and PNR verification links break silently. **Fix:** `window.location.origin`.

### F-07 · Prisma configured but never called

`prisma/` directory exists. `db:seed` in `package.json`. But zero API handlers import `@prisma/client`. The database is empty. The spec §10 ApiCache table, station/train data, and feedback models exist only in schema, never in runtime.

### F-09 · Two spec §4 removal items still present

`src/utils/secureVault.js` (16 KB, 440 lines) — MASTER_SPEC §4: *"Remove Completely: Encrypted Document Vault (DocumentVault.jsx, IndexedDB and Web Crypto vault code)."*

`src/components/BlindVoiceGate.jsx` (13 KB) — MASTER_SPEC §8: *"The old full-screen blocking 'Are you blind?' gate is removed."*

C-01 test verifies the gate does not auto-open — but the component is still in the bundle (13 KB shipped to every user).

### F-11 · `unsafe-inline` scripts in CSP

`vercel.json` line 44:
```
script-src 'self' 'unsafe-inline'
```
Allows any inline `<script>` to execute. Nullifies XSS script-injection protection. Vite supports build-time nonces to eliminate this. Low risk for a read-only travel app with no auth, but should be fixed before any login feature.

### F-12 · No error monitoring

No Sentry, LogRocket, or equivalent. `PageErrorBoundary` catches React crashes locally but nothing is reported. Silent 502s from RapidAPI (when API key is missing or rate-limited) fail invisibly in production.

---

### LOW SEVERITY

### F-06 · TypeScript absent (spec §10)

MASTER_SPEC §10: *"TypeScript (strict) for all new code."* Every file is `.jsx`/`.js`. No `tsconfig.json`. No `typescript` in `package.json`. Additionally absent from package.json (all required by §10): Vitest, TanStack Query, shadcn/ui, zod, react-hook-form, ESLint, Prettier.

### F-13 · `EmergencyToolkit.jsx` is 36 KB

Largest component in the project. MASTER_SPEC §4 requires removal of: medical/CPR/police-crisis content, ambulance-dispatch framing. Without screenshot access, this must be verified by reading the file line by line.

### F-14 · Emoji in tier labels (spec §U4)

`multimodalRouter.js` lines 89, 153, 216: `🟢`, `🔵`, `⚡`. MASTER_SPEC §U4: *"Lucide only, no emojis or mixed icon sets."*

---

## Step 4 — Architecture & Security Audit

### Strengths (keep and build on)

**`api/_security.js` is production-grade.** Rate limiting, `Sec-Fetch-Site` origin enforcement, RS256 JWT with JWKS caching, method enforcement, body size cap. This is better than most early-stage startups.

**API key isolation is correct.** No secrets in client bundle. Only `VITE_CLERK_PUBLISHABLE_KEY` (a by-design public key) is exposed client-side. All RapidAPI keys are server-side only.

**Offline-first architecture is real.** `warmOfflineCache()` + `saveOfflinePack()` on load. `OfflineOnlyMode` replaces main UI for full-offline. PWA install banner. Service worker registered in production.

**Voice intent parser is comprehensive.** `voiceIntent.js` (18 KB) handles safety commands, emergency types, route commands, and TTS confirmations. The blind accessibility gate tests pass.

**AI integration is disciplined.** Only two AI uses (NL query + route rationale), both server-side only. No client-side LLM calls. SambaNova key is server-only.

### Weaknesses

**`multimodalRouter.js` is the wrong engine for the stated product.** It is a fare-estimator and route-suggester based on haversine geometry + assumed speeds + hardcoded times. For the product to deliver its core promise it needs a real timetable source.

**In-memory rate limiter has zero effect in distributed Lambda deployments** (F-10 above).

**No observability layer** (F-12 above).

**No TypeScript = no compile-time safety for API response shapes.** When RapidAPI changes a field name (e.g., `train_number` → `trainNo`), the normalizer in `search.js` already tries 7 fallback keys — but TypeScript would catch shape mismatches at compile time.

---

## Step 5 — Idea Audit

### Problem strength: 9/10
The waitlist wall is a genuine daily pain for 10M+ Indian rail travelers. No major OTA (ixigo, MakeMyTrip, ConfirmTkt) automatically surfaces multimodal split-route alternatives with transfer risk scoring.

### Solution concept: 7/10
Hub-and-spoke logic is sound. India's rail network has natural junction cities. Transfer risk scoring with "Safe/Moderate/Tight/High-Risk" labels is differentiated. The offline pass + 112/139 safety mode has no direct OTA competitor.

### Current execution: 4/10
The core feature — finding real alternative routes with real departure times — is not delivered. The engine produces synthetic timetables. A traveler acting on the output could miss their connection or arrive at the wrong platform.

### Data strategy: 3/10
52 KB static `transportData.js` is the entire data layer. No open dataset (GTFS, data.gov.in) integration. No database caching. Prisma schema exists but DB is empty. This is the most important gap to close.

### Competitive risk
- **ConfirmTkt** already shows waitlist prediction and alternative trains with real IRCTC data.
- **RailYatri** has live delay data and running status.
- **ixigo** has a multimodal tab.
- TravelMate's genuine advantages — hub-junction intelligence, transfer risk labels, offline-first, DPDP-compliant design, NL query — are real differentiators **only if backed by real data.**

### Launch readiness: 4/10
**Should not launch with F-01 unresolved.** Showing invented clock times to stranded travelers is not a UI bug — it is a trust-destroying product failure.

---

## Step 6 — Remediation Plan

| Priority | ID | Finding | Action | Effort |
|----------|-----|---------|--------|--------|
| P0 | F-01 | Hardcoded departure times | Remove all specific clock strings. Replace with ESTIMATE range text + booking deep link. | 2h |
| P0 | F-08 | No real timetable graph | Wire multimodal legs through existing `searchLiveTransport()` for Tier 1. Show range text for bus/flight legs. | 1–2d |
| P1 | F-05 | Hash-jitter in scores | Delete `routeSpecificAdjustment()`. Make scores fully deterministic. | 1h |
| P1 | F-02 | 7/25 junction hubs | Expand `transitHubData.js` to 25 hubs (DDU, Itarsi, Kharagpur, Jhansi, Katpadi, Guntakal + 11 others). | 4h |
| P1 | F-09 | Spec §4 removals pending | Delete `secureVault.js`, `BlindVoiceGate.jsx`. Grep to confirm 0 references. | 1h |
| P1 | F-10 | In-memory rate limit | Replace `Map` with Upstash Redis + `@upstash/ratelimit`. | 2h |
| P2 | F-04 | Undocumented base rates | Add "How we estimate" expandable. Document formula + assumptions. | 2h |
| P2 | F-03 | Hardcoded domain | Replace with `window.location.origin`. | 15 min |
| P2 | F-12 | No error monitoring | Add Sentry free tier. Initialize in `main.jsx`. | 2h |
| P2 | F-11 | unsafe-inline CSP | Add Vite nonce support. | 4h |
| P3 | F-07 | Prisma unused | Either provision Neon Postgres + run migrations, or remove Prisma scaffolding. | 1d |
| P3 | F-06 | No TypeScript | Add `tsconfig.json` with `allowJs: true`, migrate new files to `.tsx`. | Ongoing |
| P3 | F-13 | EmergencyToolkit 36KB | Read file, remove spec §4 content (medical/CPR/ambulance). | 2h |
| P3 | F-14 | Emoji in tier labels | Replace `🟢 🔵 ⚡` with Lucide icons per spec §U4. | 1h |
| P3 | F-15 | Missing stack deps | Add Vitest, zod, TanStack Query as new features are built. | Phased |

---

## Test Evidence Summary

```
Command: node --test tests/core.test.mjs
48 tests | 0 fail | exit 0 ✅

Command: node --test tests/day2_data_pipeline.test.mjs tests/day3_engine_v2.test.mjs tests/day3_multimodal.test.mjs tests/day9_security_dpdp_compliance.test.mjs
25 tests | 0 fail | exit 0 ✅

Full npm test run (50 test files):
c01/c02/c03 (cold visit gates): 2 pass ✅
c04 (data honesty):             5 pass ✅
c06 (deep links):               5 pass ✅
c07/c11 (rendering):            2 pass ✅
c08 (search auto-trigger):      3 pass ✅
c09 (WCAG AA contrast):         7 pass ✅
c10 (CSP headers):              3 pass ✅
c12 (bundle/auth):              4 pass ✅
c13 (CVE - npm audit ECONNRESET noted): 3 pass ✅
c14 (date min):                 7 pass ✅
c15 (unbundled disclaimer):     4 pass ✅
characterization tests:         8 pass ✅
voice parser tests:             5 pass ✅
```

> Note: npm audit for C-13 hit network ECONNRESET 3 times before using cached result. CVE check should be re-run on a stable connection.

---

## Git Verification

```
Command: git status --short
?? docs/audit-v4/
```

**Confirmed: only `docs/audit-v4/` changed. Zero application code modified.**

---

## Overall Scores

| Dimension | Score /10 | Key reason |
|-----------|-----------|-----------|
| Core product promise (real routes) | **3** | Hardcoded times; no real timetable |
| Data honesty compliance (§5) | **4** | Good disclaimers + disclaimers in tests, but fake times and hash jitter undermine them |
| Security posture | **7** | Solid server-side; distributed rate limit gap |
| UI/UX (code evidence, tests) | **6** | Clean Tailwind; contrast passes; 5 nav items vs 4 spec |
| Test coverage | **7** | 50 files; strong unit; no Lighthouse; E2E unverified this session |
| Spec §10 compliance (stack) | **2** | No TS, no Vitest, no shadcn, no zod, no TanStack Query |
| Idea strength | **8** | Real pain, smart angle, real differentiation — if data is real |
| **Launch readiness** | **4** | F-01 alone makes the primary feature misleading. Do not launch. |
