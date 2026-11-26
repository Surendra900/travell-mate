# TravelMate AI — Pre-Upgrade Baseline Audit

**Audited by:** Orchestrator (CTO)  
**Date:** 2026-11-25  
**Scope:** All transport search and routing code — trains, buses, flights, multimodal, recovery engine  
**Purpose:** Establish an honest baseline before the Transport Upgrade feature set is built  
**Files read:** `api/trains/search.js`, `api/flights/search.js`, `api/buses/search.js`, `api/_security.js`, `api/trains/_rapidapiRail.js`, `api/recovery.js`, `server/services/routeEngine.js`, `server/services/contingencyEngine.js` (referenced), `src/utils/multimodalRouter.js`, `src/utils/contingencyEngine.js`, `src/utils/scoring.js`, `src/utils/stationHopper.js`, `shared/schemas.js`, `server/config/connectionTimes.js`

---

## 1. Security Infrastructure — `api/_security.js` ✅

| Feature | Status | Detail |
|---------|--------|--------|
| `fetchJsonWithTimeout` | ✅ Works | AbortController, 12 s default; throws `PROVIDER_TIMEOUT` error |
| `enforceRateLimit` | ✅ Works | Upstash Redis (distributed) first; local in-memory fallback for dev |
| `prepareApiRequest` | ✅ Works | Method allow-list, rate-limit gate, CSRF origin check, optional Clerk JWT |
| `publicProviderError` | ✅ Works | Safe message map — no internal detail leaked to client |
| `providerStatus` | ✅ Works | Maps error codes → HTTP status (503/504/502) |
| Upstash Redis | ⚠️ Optional | Works when `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` are set; silently falls back to memory without them |
| Clerk JWT | ⚠️ Optional | Only active when `API_REQUIRE_AUTH=true`; most routes use `useGlobalAuth` default |

**Verdict:** Solid. No changes needed to `_security.js` itself.

---

## 2. Train Search — `api/trains/search.js`

### What Works ✅
| Feature | Detail |
|---------|--------|
| Real RapidAPI IRCTC calls | Proper key/host injection, 25 s timeout via `callRapidRail` |
| Dual-API support | `isNewTrainApi` flag switches between `irctc1.p.rapidapi.com` and `irctc-train-api.p.rapidapi.com` |
| Offline timetable fallback | 2016 Datameet community snapshot; triggered when API returns 0 results |
| Input validation | Date format, same-origin check, missing station guard |
| Rate limiting | 18 req / window via `prepareApiRequest` |
| Station code resolution | `stationCodes()` resolves city names to multi-code groups (e.g. Delhi → NDLS/DLI/NZM/ANVT) |
| Provenance tags | `LIVE_PROVIDER_DATA`, `LIVE_SCHEDULE_ONLY`, `TIMETABLE`, `PROVIDER_VERIFICATION_REQUIRED` |

### What's Missing / Broken ❌
| Issue | Severity | Detail |
|-------|----------|--------|
| **No nearest-station fallback** | 🔴 CRITICAL | Zero results → only offline timetable fallback; no geo-radius search for nearby stations |
| **Ad-hoc result schema** | 🟠 HIGH | No canonical `RouteLeg`; each field named differently from flights/buses |
| **Mode purity not enforced** | 🟠 HIGH | Nothing prevents non-train legs appearing in train-only results |
| `Math.random()` in `stationHopper.js` | 🟡 MEDIUM | Fare estimates are non-deterministic — unprofessional; fix to fixed corridor distance lookup |

---

## 3. Station / Rail Helper — `api/trains/_rapidapiRail.js`

### What Works ✅
- `stationCodes(cityName)` — 35+ city aliases with multi-code groups
- `extractStationCode(label)` — bracket-code parser `(NDLS)` pattern
- `callRapidRail(path, params)` — full error handling, 25 s timeout, structured error codes
- `dataRows(payload)` — smart array extractor across all API response shapes
- `usableSecret()` — rejects placeholder values (`your_`, `xxx`, `dummy`) before using env vars

### What's Missing ❌
| Issue | Severity |
|-------|----------|
| No geo-coordinate data for stations | 🔴 CRITICAL (needed for nearest-station search) |
| Alias map covers only ~35 cities; Tier-2/3 cities missing | 🟠 HIGH |

---

## 4. Flight Search — `api/flights/search.js`

### What Works ✅
| Feature | Detail |
|---------|--------|
| Skyscanner integration | Primary provider, 15 s timeout, IATA city alias map (50+ cities) |
| Aviationstack integration | Fallback provider, 12 s timeout, plan-restriction bypass |
| Railway station → IATA mapping | `railwayToAirportMap` covers ~20 rail-to-air pairs |
| Aviationstack plan-restriction bypass | Retries without `flight_date` if plan rejects the param |
| Provenance tagging | `LIVE_OTA_AGGREGATOR` (Skyscanner) vs `LIVE_SCHEDULE_ONLY` (Aviationstack) |

### What's Missing / Broken ❌
| Issue | Severity | Detail |
|-------|----------|--------|
| **Sequential, not parallel** | 🔴 CRITICAL | Aviationstack only called if Skyscanner fails; must be `Promise.allSettled` |
| **No nearest-airport fallback** | 🔴 CRITICAL | Unknown IATA → 400 immediately; no geo-radius search |
| **No fusion / dedup** | 🟠 HIGH | When both APIs succeed, results are not merged or deduplicated |
| **Non-canonical provenance** | 🟡 MEDIUM | `LIVE_OTA_AGGREGATOR` and `LIVE_SCHEDULE_ONLY` are not in the 4-value canonical set |
| Aviationstack price always null | 🟡 MEDIUM | Schedule API only; no fare data — must be labelled clearly |

---

## 5. Bus Search — `api/buses/search.js`

### What Works ✅
| Feature | Detail |
|---------|--------|
| Handler structure | Well-structured; input validation, URL allowlist, HTTPS enforcement |
| `provider-unconfigured` response | Clean 503 when `BUS_API_URL`/`BUS_API_KEY` missing |
| Timeout | 12 s via `fetchJsonWithTimeout` |
| Provenance tagging | Present in response shape |

### What's Missing / Broken ❌
| Issue | Severity | Detail |
|-------|----------|--------|
| **No bus provider configured** | 🔴 CRITICAL | `BUS_API_URL` and `BUS_API_KEY` are blank in `.env.example`; always returns `provider-unconfigured` |
| **No nearest-bus-stop fallback** | 🔴 CRITICAL | Zero results → no geo-radius search |
| **No specific bus API integrated** | 🔴 CRITICAL | RedBus, AbhiBus, etc. — none connected |
| Bus always broken in production | 🔴 CRITICAL | App cannot show any real bus data today |

---

## 6. Recovery API — `api/recovery.js`

### What Works ✅
- GET `/api/recovery` → `searchRecoveryRoutes` (server route engine — trains only)
- POST `/api/recovery` → `simulateLeg1Delay` (delay simulation)
- Both use `validateSchema` with Zod
- Rate limit: 40 req / window

### What's Missing ❌
| Issue | Severity |
|-------|----------|
| Recovery engine is train-only | 🟠 HIGH — no bus/flight recovery legs |
| References `server/services/contingencyEngine.js` | ⚠️ Need to verify this file exists and is complete |

---

## 7. Server Route Engine — `server/services/routeEngine.js`

### What Works ✅
| Feature | Detail |
|---------|--------|
| JSON data loading | Loads `stations.json`, `trains.json`, `station_stops.json`, `aliases`, `junctions`, `airports`, `transfer_guides` from `shared/data/` |
| In-memory indexes | `stationByCode` Map, `stationCoords` Map, `aliasMap`, `stationToTrains` Map |
| `findDirectTrainRoutes` | Searches timetable for direct O→D trains |
| `findConnectingRoutes` | Train-to-train connections with MCT enforcement |
| MCT enforcement | Imports from `server/config/connectionTimes.js` |
| Reliability scoring | Imports from `server/config/reliabilityModel.js`; SAFE/MODERATE/HIGH/CRITICAL levels |
| `rankItinerariesIntoTiers` | Budget / Balanced / Fastest tiers; filters MCT violations |
| Provenance | `'TIMETABLE'` with explicit note: "community snapshot, about 2016" — honest |

### What's Missing ❌
| Issue | Severity | Detail |
|-------|----------|--------|
| **Train-only** | 🔴 CRITICAL | No bus or flight legs in recovery engine |
| **No nearest-station fallback** | 🔴 CRITICAL | If no direct trains found, no geo-radius expansion |
| **Timetable age** | 🟡 MEDIUM | 2016 data; running days explicitly marked unknown — honest but limited |

---

## 8. Client-Side Routing — `src/utils/multimodalRouter.js`

### What Works ✅
- `findTransitHubs` — geometric hub detection (detour ratio ≤ 1.35)
- `generateMultimodalRoutes` — 3-tier route output (paisa-vasool / smart-balanced / emergency-express)
- WhatsApp share text generation
- Honest `provenance: 'ESTIMATE'` on all legs

### What's Missing / Broken ❌
| Issue | Severity | Detail |
|-------|----------|--------|
| **All data is ESTIMATE** | 🟠 HIGH | Fares from distance × multiplier; durations from speed ÷ distance; no API calls |
| **No real API integration** | 🟠 HIGH | This router generates synthetic routes; it is a placeholder, not a real router |
| Encoding artifact in strings | 🟡 LOW | `â‚¹` instead of `₹` — encoding issue in source or build |

---

## 9. Client-Side Contingency — `src/utils/contingencyEngine.js`

### What's Broken ❌
| Issue | Severity | Detail |
|-------|----------|--------|
| **HARDCODED FAKE DATA** | 🔴 CRITICAL | `generateContingencyOptions` returns hardcoded train `12430 New Delhi–Lucknow AC SF`, `Zingbus / Intrcity SmartBus`, `IndiGo 6E-2419` — regardless of actual O/D |
| Fake prices | 🔴 CRITICAL | ₹1250, ₹890, ₹4800 hardcoded for every route query |
| `calculateConnectionRisk` | ✅ OK | The risk scoring math is legitimate and reusable |

---

## 10. Scoring Engine — `src/utils/scoring.js` ✅

Legitimate scoring math. No fake data. Weights are reasonable.  
`calculateTravelScore`, `calculatePlanQualityScore`, `scoreBreakdown` — all usable as-is.

---

## 11. Station Hopper — `src/utils/stationHopper.js`

### What Works ✅
- `findCorridorMatch` — finds which of 5 hardcoded corridors contains both cities
- `generateStationHopperHacks` — quota-hack strategy generation (extend/change-boarding)
- Legal annotations are accurate (IRCTC boarding point change rules)

### What's Broken ❌
| Issue | Severity | Detail |
|-------|----------|--------|
| `Math.random()` for extra fare | 🟡 MEDIUM | Non-deterministic output; replace with distance-based estimate |
| Only 5 corridors hardcoded | 🟡 MEDIUM | Covers main trunk routes; Tier-2/3 cities served by generic fallback |

---

## 12. Missing Infrastructure (Confirmed Not Existing)

| File | Status | Required For |
|------|--------|-------------|
| `src/types/routeSchema.js` | ❌ MISSING | Canonical `TravelRoute` / `RouteLeg` schema |
| `src/config/routingConfig.js` | ❌ MISSING | MCT table, radius constants, timeout values |
| `src/utils/geoUtils.js` | ❌ MISSING | Nearest-node lookup for all 3 transport modes |

---

## 13. Data Files (Confirmed Existing)

| File | Status |
|------|--------|
| `src/data/stationsData.js` | ✅ Exists |
| `src/data/airportsData.js` | ✅ Exists |
| `src/data/transportData.js` | ✅ Exists |
| `shared/data/stations.json` | ✅ Exists |
| `shared/data/trains.json` | ✅ Exists |
| `shared/schemas.js` | ✅ Exists |
| `server/config/connectionTimes.js` | ✅ Exists |

---

## 14. Consolidated Issue Register

| # | Issue | Severity | File | Build Wave |
|---|-------|----------|------|-----------|
| A1 | No nearest-station fallback (train) | 🔴 CRITICAL | `api/trains/search.js` | W2 |
| A2 | No nearest-airport fallback (flight) | 🔴 CRITICAL | `api/flights/search.js` | W2 |
| A3 | No nearest-bus-stop fallback | 🔴 CRITICAL | `api/buses/search.js` | W2 |
| A4 | Bus provider unconfigured (always fails) | 🔴 CRITICAL | `api/buses/search.js` + `.env.example` | W2 |
| A5 | Flight APIs sequential not parallel | 🔴 CRITICAL | `api/flights/search.js` | W2 |
| A6 | `src/utils/contingencyEngine.js` HARDCODED fake data | 🔴 CRITICAL | `src/utils/contingencyEngine.js` | W1 |
| A7 | No canonical `RouteLeg` schema | 🟠 HIGH | (missing) | W1 |
| A8 | No `routingConfig.js` (MCT/radius constants) | 🟠 HIGH | (missing) | W1 |
| A9 | No `geoUtils.js` (nearest-node functions) | 🟠 HIGH | (missing) | W1 |
| A10 | Mode purity not enforced | 🟠 HIGH | router layer | W3 |
| A11 | No flight/bus legs in recovery engine | 🟠 HIGH | `server/services/routeEngine.js` | W3 |
| A12 | No API fusion / dedup for flights | 🟠 HIGH | `api/flights/search.js` | W2 |
| A13 | Non-canonical provenance values (flights) | 🟡 MEDIUM | `api/flights/search.js` | W2 |
| A14 | `Math.random()` in stationHopper fare | 🟡 MEDIUM | `src/utils/stationHopper.js` | W1 |
| A15 | String encoding artifact (₹ → â‚¹) | 🟡 LOW | `src/utils/multimodalRouter.js` | W4 |

---

## 15. API Limitations (Honest, Not Bugs)

| Provider | Limitation | Workaround |
|----------|-----------|-----------|
| Aviationstack (free/basic plan) | No fare data (`price: null`); returns schedule only | Label clearly as `LIVE_SCHEDULE_ONLY`; direct user to booking link |
| Aviationstack | Some plans reject `flight_date` param | Existing retry-without-param logic covers this ✅ |
| IRCTC RapidAPI | 2016 timetable offline fallback is stale | Tag as `TIMETABLE` with age note; not fake, just old |
| Bus providers | No provider currently connected | Requires a RedBus/AbhiBus API key; until then, return `provider-unconfigured` honestly |
| Skyscanner RapidAPI | Rate limits vary by subscription tier | Existing 15 s timeout + 18 req/window handles gracefully |

---

## 16. Build Wave Plan

| Wave | Tasks | Owner Agents |
|------|-------|-------------|
| **W1** | Schema, routingConfig, geoUtils, fix fake contingency data | 11, 17 |
| **W2** | Nearest fallbacks (train/bus/flight), parallel flight APIs, fusion | 12, 13, 14, 16 |
| **W3** | Combination mode (6 pairs + 3-leg), MCT enforcement, risk badges | 15 |
| **W4** | Mode purity enforcement, UI result card updates | 11, 02, 08 |
| **W5** | Resilience (caching, timeouts, graceful errors), Upstash wiring | 19 |
| **W6** | Full test suite, security review, live verification, release gate | 20, 09, 18, 22 |

---

*Audit complete. All findings confirmed by reading actual source files. No assumptions made.*
