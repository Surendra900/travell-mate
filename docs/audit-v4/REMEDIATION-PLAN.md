# TravelMate v2.5.1 — Audit Remediation & Launch-Readiness Plan

**Document Version:** 1.0.0  
**Status:** PENDING USER APPROVAL  
**Branch:** `fix/audit-v2`  
**Latest Baseline Commit:** `4499e8c`  
**Test Suite Status:** 50/50 test files passing (0 failures)

---

## 1. Executive Summary & Repository State

This remediation plan addresses the findings from the independent audit report (F-01 through F-15) for **TravelMate v2.5.1**.
Per project operating rules:
- **Zero application code changes** have been made during this planning phase.
- All 15 audit findings have been independently verified against the active codebase, file contents, runtime imports, and tests.
- Findings **F-01 (Fabricated Departure/Arrival Times)** and **F-08 (Synthetic Haversine Route Engine)** are classified as **CRITICAL RELEASE BLOCKERS**.
- Working features (Leaflet Route Map, Tatkal Dual-Window Desk, Local Boarding Passes, 112/139 Emergency Dialers, DPDP Zero-ID Storage) will be preserved with no regressions.
- Existing passing tests (50 suites, including `core.test.mjs`, `c09_accessibility_contrast.test.mjs`, `c04_data_honesty_terms.test.mjs`, etc.) will not be weakened or deleted.

### Repository Baseline
- **Git Branch:** `fix/audit-v2` (clean working tree except untracked `docs/audit-v4/`)
- **Preserved User Work:** All files on `fix/audit-v2` including `C-01` through `C-15` fixes and evidence.
- **Node Environment:** Node v22.x, Vite v8.1.4, React v18.3.1.
- **Current Launch-Readiness Score:** **6.2 / 10** (Blocked by F-01 fabricated times, F-08 synthetic route engine, F-10 per-instance rate limiting, and unconfigured production provider boundaries). Target: **> 8.0 / 10** upon completion of approved phases.

---

## 2. Finding-by-Finding Verification Matrix (F-01 to F-15)

| Finding ID | Audit Claim | Status in Codebase | File & Line Evidence | Severity | Real User Impact | Proposed Remediation | Acceptance Verification |
|:---|:---|:---|:---|:---|:---|:---|:---|
| **F-01** | Fabricated departure & arrival times | **VERIFIED** | `src/utils/multimodalRouter.js`: 104, 121, 165, 184, 230, 232 (`07:30`, `11:15`, `13:00`, `20:30`, etc.); `src/components/LiveResultsPanel.jsx`: 56-58 (`10:30 AM`, `06:45 PM`); `src/components/DelayContingencySimulator.jsx`: 46-58 | **CRITICAL (Blocker)** | Users plan journeys around non-existent train schedules, risking missed connections, strandings, and loss of trust. | Eliminate hardcoded time literals from route options. Display clock times ONLY for validated `TIMETABLE` or `LIVE` feeds with documented service dates. For estimated/frequency legs, show frequency ranges (e.g. "Every 30–60 min"). If unavailable, display "Schedule data unavailable". Remove fallback clock times in `LiveResultsPanel.jsx`. | Test suite proving that no synthetic or estimate route outputs an unverified exact clock time; frequency ranges display honest guidance; deep links preserve provenance badges. |
| **F-08** | Synthetic route engine presented as timetable search | **VERIFIED** | `src/utils/multimodalRouter.js`: 80-86, 141-148 (`Math.round(leg1Km / 75 * 60)`); `src/components/LiveResultsPanel.jsx`: 29, 197 (`generateMultimodalRoutes` called directly in React memory without querying real schedule graph) | **CRITICAL (Blocker)** | App masquerades haversine distance divided by speed as a "Real-time Timetable Engine", violating Master Spec §5 and §6. | Wire route planning to the genuine timetable graph in `server/services/routeEngine.js` (which indexes 86KB of `stops.json`, `trains.json`, `stations.json`, and 25 junctions). Search direct routes first, then 1-transfer verified routes. Return honest degraded states when schedule data is absent. | Tests covering: no provider data fallback, direct before transfer precedence, MCT validation, cross-midnight arrivals, and zero haversine duration faking. |
| **F-05** | Hash-based score jitter | **VERIFIED** | `src/utils/scoring.js`: 15-25 (`routeHash`, `routeSpecificAdjustment`); lines 72, 74, 102, 121, 160 add `±8` point pseudo-random noise | **HIGH** | Two searches with identical inputs yield fluctuating scores; metrics lack transparency and determinism. | Remove `routeHash()` and `routeSpecificAdjustment()`. Make all scores strictly deterministic, documented, and bounded. If data is insufficient, return "Insufficient Data" rather than synthetic precision. | Unit test asserting identical score outputs for identical inputs across 1,000 runs; verified formulas for all component scores. |
| **F-04** | Undocumented PNR prediction base rates | **VERIFIED** | `src/utils/pnrPredictor.js`: 9-46 (`baseRate: 0.94, 0.78, 0.52, 0.32, 0.15, 0.28`); score presented as "Confirmation Probability" | **HIGH** | Users mistake hardcoded heuristic constants for statistically validated machine-learning probabilities. | Relabel output from "Confirmation Probability" to "Estimated Waitlist Clearance Index (Heuristic)". Add visible "How this is estimated" modal detailing assumptions (cancellation velocity, quota type, days to chart). Disable false precision when inputs are incomplete. | Tests verifying honest labeling, fallback behavior on unlisted quotas/invalid inputs, and transparent disclosure display. |
| **F-02** | Incomplete transit hub directory | **VERIFIED** | `src/data/transitHubData.js`: lines 6-126 has only 7 hubs; falls back to generic guessed strings (lines 137-152). Notice `shared/data/junctions.json` already contains all 25 hubs | **MEDIUM** | Transfers through 18 major junctions (e.g., Mughalsarai/DDU, Itarsi/ET, Kharagpur/KGP, Jhansi/VGLJ, Katpadi/KPD) render generic dummy data. | Synchronize `transitHubData.js` with the 25 verified high-traffic corridor hubs in `shared/data/junctions.json` and `transfer_guides.json`. Deduplicate IDs, validate platform counts, transfer modes, and station codes. | Test verifying all 25 required hubs exist, have unique station codes, valid coordinates, and complete transfer guidance. |
| **F-09** | Residual vault & blocking accessibility gate | **VERIFIED** | `src/utils/secureVault.js` (440 lines, 16KB); `src/components/BlindVoiceGate.jsx` (13KB); references in `EmergencyToolkit.jsx:541`, `LowNetworkPlanner.jsx:120`, `SavedPlans.jsx:329`, `App.jsx:9, 139` | **MEDIUM** | Dead code bloats bundle by ~30KB; leaves residual references to an encrypted vault that Master Spec §4 ordered removed. | Safely excise `secureVault.js` and `BlindVoiceGate.jsx`. Clean residual imports in `App.jsx`, `EmergencyToolkit.jsx`, `LowNetworkPlanner.jsx`, `SavedPlans.jsx`, and `storage.js`. Preserve non-blocking voice input (Web Speech API) and screen-reader accessibility. Update outdated tests in `day11` and `day16`. | Build bundle inspection confirming 0 references to `secureVault` and `BlindVoiceGate`; accessible keyboard and voice search tests pass. |
| **F-10** | Process-local API rate limiting | **VERIFIED** | `api/_security.js`: 3-4 (`globalThis.__travelmateRateLimitStore = new Map()`) | **HIGH** | On Vercel Serverless, memory is isolated per lambda instance; concurrent burst requests bypass rate limits completely. | Implement adapter supporting Upstash Redis via `@upstash/ratelimit` when configured via server-side environment variables (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`). When unconfigured, provide a secure fail-closed or conservative fallback with explicit deployment status. Never expose tokens to client. | Tests validating sliding-window rate limiting, key namespacing, and graceful configuration-missing behavior. |
| **F-03** | Hardcoded production hostname | **VERIFIED** | `src/utils/multimodalRouter.js`: 291; `src/components/PnrPredictorModal.jsx`: 148 hardcode `https://travelmate-ai-flowzint.vercel.app` | **MEDIUM** | Share links and deep links break or point to stale domains when running on localhost, staging, preview, or custom domains. | Replace hardcoded URLs with origin-aware resolution: `typeof window !== 'undefined' ? window.location.origin : (process.env.VITE_APP_URL || '')`. | Tests for deep links and share URLs in localhost, preview, and production environments. |
| **F-07** | Prisma configured but unused | **VERIFIED** | `prisma/schema.prisma` (124 lines), `prisma/seed.js`, `seed.ts` exist; `package.json` has `db:seed`; but 0 runtime API handlers import `@prisma/client`; neither `prisma` nor `@prisma/client` in `dependencies` | **MEDIUM** | Confuses developers and audits; claims database backing that does not exist at runtime. | **Decision required:** Safely remove unused Prisma scaffolding and stale scripts/seeds to align with local-first, serverless architecture (Master Spec §10 allowed Neon, but app operates purely in-memory/serverless with `shared/data/` JSON datasets). | Test suite and build pass cleanly with no dangling script errors. |
| **F-11** | CSP `script-src 'unsafe-inline'` | **VERIFIED** | `vercel.json`: line 44 (`script-src 'self' 'unsafe-inline'`) | **MEDIUM** | Exposes site to cross-site scripting (XSS) risks; violates modern CSP best practices. | Remove `'unsafe-inline'` from `script-src` in `vercel.json`. Vite production build outputs bundled hashed scripts in `dist/assets/` loaded via `<script type="module" src="...">` with no inline script blocks in `index.html`. Retain `'unsafe-inline'` for `style-src` if required by dynamic Tailwind/Leaflet classes. | Verify `npm run build`, inspect `dist/index.html` to confirm no inline `<script>`, and verify CSP test suite passes. |
| **F-12** | Missing error monitoring & observability | **VERIFIED** | No Sentry, LogRocket, or observability SDK integrated. Only `console.error` in `PageErrorBoundary.jsx` | **MEDIUM** | Production exceptions go unnoticed without telemetry; crash diagnostics rely on user reports. | Implement privacy-first, opt-in error monitoring adapter (e.g. Sentry Browser SDK or lightweight beacon). Ensure strict PII scrubbing: redact PNRs, names, phone numbers, GPS coordinates, and ticket details. Safe no-op when DSN is unconfigured. | Test proving error boundary triggers reporter; test proving sensitive ticket/location data is scrubbed before dispatch. |
| **F-06** | TypeScript absent | **VERIFIED** | No `tsconfig.json`; no `typescript` package; all files are `.js` and `.jsx` | **LOW** | Type safety is absent; refactors risk subtle runtime regressions. | Set up incremental TypeScript support (`typescript`, `@types/react`, `tsconfig.json` with `allowJs: true`, `checkJs: false`) without rewriting existing JSX files. Add `.d.ts` types for core data contracts (Itinerary, Hub, Leg, Provenance). | `npx tsc --noEmit` succeeds alongside existing Vite build. |
| **F-13** | EmergencyToolkit bundle size & content | **PARTIALLY VERIFIED** | `src/components/EmergencyToolkit.jsx`: 788 lines, 36KB; statutory disclaimer present; contains legitimate railway protocols (coach medical 139, zero-FIR 1930, junction safety); residual vault references | **LOW** | Large component bundle; potential confusion between medical guidance and official emergency dispatch. | Remove residual vault document counter references (line 541). Ensure statutory disclaimer ("TravelMate is not an emergency service. In an emergency call 112") is prominent. Keep official transit safety hotlines (112, 139, 108, 1090) and transit protocols. Replace remaining inline emojis with Lucide icons. | Component rendering test; accessibility check; bundle size reduction check. |
| **F-14** | Emoji in tier labels & filters | **VERIFIED** | `src/utils/multimodalRouter.js`: 90 (`🟢`), 153 (`🔵`), 216 (`⚡`); `src/components/LiveResultsPanel.jsx`: 171-177 filter options | **LOW** | Unprofessional appearance; screen readers announce emojis awkwardly (e.g. "large green circle"). | Replace emoji prefixes with clean, text-only badges and Lucide SVG icons (e.g., `ShieldCheck`, `Sparkles`, `Zap`). | Visual and screen-reader tests verify clean icon + text representation without unicode emojis. |
| **F-15** | Missing stack dependencies from Master Spec | **VERIFIED** | `package.json` lacks Zod, TanStack Query, Vitest, shadcn/ui. Built with native `node --test` | **LOW** | Discrepancy between Master Spec §10 aspirations and actual lightweight dependencies. | Add `zod` for input validation on API endpoints and LLM structured outputs (Master Spec §7). Maintain Node native test runner (`node --test`) which executes in <3 seconds without heavy vitest overhead. Document stack rationale in `docs/decisions.md`. | `npm run check` passes; Zod validates query schemas on API routes. |

---

## 3. Architecture & Remediation Strategy

```mermaid
flowchart TD
    subgraph Client [Browser Client (React + Vite)]
        Search[Search Form NDLS → PNBE]
        LRP[LiveResultsPanel]
        MTC[MultimodalTimelineCard]
        Sim[DelayContingencySimulator]
    end

    subgraph Server [Vercel Serverless / Node]
        RecAPI[api/recovery.js]
        Sec[api/_security.js - Rate Limiting & Auth]
        RE[server/services/routeEngine.js]
        CE[server/services/contingencyEngine.js]
        RM[server/config/reliabilityModel.js]
    end

    subgraph Data [Verified Open Datasets]
        Junc[shared/data/junctions.json (25 Hubs)]
        Stops[shared/data/stops.json (Timetable)]
        Trains[shared/data/trains.json]
        Guides[shared/data/transfer_guides.json]
    end

    Search -->|Query: from, to, date| RecAPI
    RecAPI --> Sec
    Sec --> RE
    RE --> Data
    RE --> CE
    CE --> RM
    RecAPI -->|JSON Itinerary with Provenance| LRP
    LRP --> MTC
    MTC --> Sim
```

### Core Architecture Principles:
1. **No Fabricated Clocks:** Exact departure/arrival times are emitted **only** when matched in `stops.json` / `trains.json` or live API. All other legs emit honest frequency ranges (`"Buses depart every 30-45 min; verify on portal"`).
2. **Provenance Badges:** Every leg carries explicit metadata:
   - `TIMETABLE`: Verified against open railway timetable dataset (`stops.json`).
   - `LIVE`: Verified against active carrier/provider API.
   - `ESTIMATE`: Frequency/geometry heuristic (never displays exact clock times).
3. **Data Parity:** Wire the frontend `LiveResultsPanel.jsx` directly to the existing 800-line `server/services/routeEngine.js` via `/api/recovery` (with an offline/in-memory client fallback that uses the same timetable dataset), eliminating the disconnected, synthetic `multimodalRouter.js`.

---

## 4. Key Decisions Requiring User Approval

Before editing application files, please review and confirm the following architectural decisions:

### Decision 1: Prisma Scaffolding Disposition (F-07)
- **Option A (Recommended):** Remove `prisma/` folder and `db:seed` script from `package.json`. TravelMate is designed as a privacy-first, zero-login, local-first web application. The backend runs statelessly on Vercel Serverless using indexed JSON datasets in `shared/data/`. Having an unconfigured, unused Prisma schema creates confusion without providing functionality.
- **Option B:** Keep Prisma schema for documentation purposes only, but remove the failing `db:seed` script and document in `docs/decisions.md` that database persistence is deferred to post-launch.

### Decision 2: Serverless Distributed Rate Limiting (F-10)
- **Option A (Recommended):** Implement an Upstash Redis adapter using `@upstash/ratelimit`. If environment variables `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are present, use distributed Redis rate limiting. If absent, fall back to the existing in-memory limiter with a clear server-side log warning: `[SECURITY] Running in local/unconfigured mode; global rate limiting not active.` Mark production distributed rate limiting as "Conditionally verified / requires deployment env vars".
- **Option B:** Fail closed on production: if Redis credentials are not configured on Vercel, return 503 on high-cost endpoints (`/api/assistant.js`).

### Decision 3: Error Monitoring Provider (F-12)
- **Option A (Recommended):** Add `@sentry/react` (or lightweight Sentry browser integration) initialized only if `VITE_SENTRY_DSN` is configured. Include `beforeSend` scrubber to strip any PNR numbers, phone numbers, or coordinates. If no DSN is provided, gracefully no-op.
- **Option B:** Keep client-side `PageErrorBoundary` with local structured diagnostics and no external third-party SDK.

### Decision 4: Deprecated Code Removal (F-09)
- **Option A (Recommended):** Fully delete `src/utils/secureVault.js` and `src/components/BlindVoiceGate.jsx`, clean up references in `EmergencyToolkit.jsx`, `LowNetworkPlanner.jsx`, `SavedPlans.jsx`, and `App.jsx`, and update old tests in `tests/day11_blind_gate.test.mjs` and `tests/day16_encrypted_vault.test.mjs` to assert their absence (matching Master Spec §4).
- **Option B:** Keep the files in `src/legacy/` and unmount them from the bundle.

---

## 5. Phased Implementation Roadmap

Following your operating rules, work will proceed in strict atomic phases after your approval:

### Phase A: Safety Stop for Fabricated Itineraries (F-01, F-08 Priority 1)
- **Objective:** Eliminate all synthetic departure/arrival times from `multimodalRouter.js`, `LiveResultsPanel.jsx`, and `DelayContingencySimulator.jsx`.
- **Changes:**
  - In `src/utils/multimodalRouter.js`: remove hardcoded time literals (`07:30`, `11:15`, `13:00`, etc.). Replace with frequency estimates (`"Frequent daytime departures (every 45-60 min)"`) and set provenance strictly to `ESTIMATE`.
  - In `src/components/LiveResultsPanel.jsx`: remove fallback times `'10:30 AM'` and `'06:45 PM'`. If departure is null/undefined, render `"Schedule unavailable — verify on portal"`.
  - In `src/components/DelayContingencySimulator.jsx`: remove hardcoded fallback train numbers and times; display honest no-itinerary empty state.
- **Verification:** New test suite `tests/f01_no_fabricated_times.test.mjs` asserting zero hardcoded departure times rendered as verified schedules.

### Phase B: Real-Data Timetable Engine Wiring (F-08 Priority 2)
- **Objective:** Connect the frontend route experience to `server/services/routeEngine.js` and `shared/data/` (stations, trains, stops, junctions).
- **Changes:**
  - Ensure client queries `/api/recovery` when online, or uses a client-side bundle of `shared/data/` when offline.
  - Prioritize direct trains before split routes.
  - Enforce minimum connection times (MCT: 45 min rail-to-rail, 105 min rail-to-bus, 210 min rail-to-airport).
  - Add cross-midnight day count awareness.
- **Verification:** Unit tests verifying: direct itinerary precedes transfer itinerary; MCT violation rejection; cross-midnight arrival calculation.

### Phase C: Deterministic Scoring & PNR Honesty (F-05, F-04)
- **Objective:** Remove score jitter and honestly label PNR waitlist clearance estimation.
- **Changes:**
  - In `src/utils/scoring.js`: delete `routeHash()` and `routeSpecificAdjustment()`. All scores become 100% deterministic and explainable.
  - In `src/utils/pnrPredictor.js`: relabel "Confirmation Probability" to "Estimated Clearance Index (Heuristic)". Add "How this is estimated" explanation documenting quota rules. Return honest degraded state when inputs are incomplete.
- **Verification:** Test verifying 1,000 runs of identical inputs produce identical scores; test verifying PNR clearance index disclosures.

### Phase D: Verified Removals & Cleanup (F-09, F-13, F-14)
- **Objective:** Remove dead vault/gate code, clean `EmergencyToolkit`, and remove emojis from tier labels.
- **Changes:**
  - Delete `src/utils/secureVault.js` and `src/components/BlindVoiceGate.jsx`.
  - Remove residual references in `App.jsx`, `EmergencyToolkit.jsx`, `LowNetworkPlanner.jsx`, `SavedPlans.jsx`, `storage.js`.
  - Replace `🟢`, `🔵`, `⚡` emoji labels in `multimodalRouter.js` and `LiveResultsPanel.jsx` with clean text badges and Lucide icons.
  - Clean `EmergencyToolkit.jsx` and confirm emergency disclaimer prominence.
- **Verification:** Grep proof confirming 0 references to removed files; test confirming keyboard trap and voice search remain fully functional.

### Phase E: Security, Operations & Configuration Boundaries (F-10, F-11, F-03, F-12, F-07)
- **Objective:** Strengthen security headers, host resolution, rate limiting, error monitoring, and dispose of Prisma.
- **Changes:**
  - `vercel.json`: remove `'unsafe-inline'` from `script-src`.
  - `api/_security.js`: add Upstash Redis rate-limiter adapter with safe fallback when unconfigured.
  - `src/utils/multimodalRouter.js` & `src/components/PnrPredictorModal.jsx`: replace hardcoded Vercel URLs with `window.location.origin`.
  - Add optional, privacy-scrubbed error monitoring adapter.
  - Execute approved Prisma decision (remove unused files or clean scripts).
- **Verification:** Test CSP headers in `vercel.json`; test dynamic origin links; test rate limit adapter fallbacks.

### Phase F: Hub Directory & Dependency Hygiene (F-02, F-06, F-15)
- **Objective:** Expand hub directory to all 25 hubs and introduce Zod/TypeScript boundaries.
- **Changes:**
  - Update `src/data/transitHubData.js` to include all 25 hubs from `shared/data/junctions.json` with verified platform, transfer, and amenity data.
  - Install `zod` for API validation schemas.
  - Configure `tsconfig.json` for type declarations without breaking JSX.
  - Re-run full test suite (`npm run check`) across all 50+ test files.
- **Verification:** Test confirming all 25 hubs are present, unique, and valid; typecheck passing.

---

## 6. Dependencies, Secrets, Accounts & Deployment Requirements

| Requirement | Type | Purpose | Necessity | Fallback if Missing |
|:---|:---|:---|:---|:---|
| `UPSTASH_REDIS_REST_URL` & `TOKEN` | Secret / Env Var | Distributed rate limiting across Vercel Lambdas | Recommended for production launch | Falls back to in-memory store; logs security warning |
| `VITE_SENTRY_DSN` | Secret / Env Var | Production client error monitoring | Recommended for production observability | Graceful no-op; errors stay in browser console |
| `SAMBANOVA_API_KEY` | Secret / Env Var | LLM NL-to-route and route rationale | Optional (features degrade gracefully) | Falls back to form search and template rationale |
| `zod` | npm package | API query parameter validation | Recommended | Native JavaScript input sanitization in `_security.js` |
| `typescript` | npm devPackage | Type checking and interface definitions | Recommended | Standard JavaScript/JSDoc validation |

---

## 7. Acceptance Criteria Checklist

- [ ] **Data Honesty:** Zero synthetic clock times shown as real schedules. Every exact time backed by `TIMETABLE` or `LIVE` provenance.
- [ ] **Route Quality:** Direct train routes precede 1-transfer routes. Transfers enforce minimum connection times (MCT).
- [ ] **Deterministic Scores:** Travel scores and budget fit scores produce identical numeric values for identical inputs.
- [ ] **PNR Honesty:** Heuristic waitlist indices are clearly distinguished from statistical probabilities, with transparent disclosures.
- [ ] **Transit Hub Coverage:** All 25 required corridor junction hubs present with complete transfer guide data.
- [ ] **Clean Codebase:** Zero residual references to `secureVault.js` or `BlindVoiceGate.jsx`.
- [ ] **Security Headers:** CSP in `vercel.json` removes `'unsafe-inline'` from `script-src`.
- [ ] **Origin Awareness:** No hardcoded deployment URLs in share or deep links.
- [ ] **Test Suite Health:** All existing tests pass + new regression suites for F-01 through F-15 pass with exit code 0.
- [ ] **Launch-Readiness Target:** Re-evaluate and score all 8 dimensions with empirical evidence.

---

*Please review this plan and indicate your approval or any adjustments to the 4 key decisions before implementation begins.*
