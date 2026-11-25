# TravelMate AI — Task Board

**Last Updated:** 2026-11-25  
**Maintained by:** Orchestrator (Agent 00)

---

## Status Legend

| Symbol | Meaning |
|---|---|
| `📋 TODO` | Assigned, not started |
| `🔄 IN PROGRESS` | Agent is actively working |
| `🔒 BLOCKED` | Waiting on another agent or decision |
| `✅ DONE` | Verified and committed |
| `🐛 BUG` | Regression or defect found |
| `🔧 FIXED - VERIFIED` | Bug fixed and regression test passing |

---

## Current Sprint: Transport Upgrade

> **Phase 2 ACTIVE.** Audit complete; building in waves.

### Build Order (sequential, then parallel)

```
Wave 1: Foundations ✅ COMPLETE
Wave 2: Single-Mode Search ✅ COMPLETE
Wave 3: Fusion + Combination mode + Mode Purity 🔄 IN PROGRESS
Wave 4: Resilience (after Wave 3)
Wave 5: UI Updates (after Wave 3)
Wave 6: Verification & Sign-off
```

---

## Wave 1 Tasks ✅ COMPLETE

| Task ID | Agent | Description | Status | Commit |
|---------|-------|-------------|--------|--------|
| W1-01 | 11 | Create `src/types/routeSchema.js` — canonical RouteLeg + TravelRoute | ✅ DONE | 691677d |
| W1-02 | 11 | Create `src/config/routingConfig.js` — MCT, radii, purity, weights | ✅ DONE | 691677d |
| W1-03 | 17 | Create `src/utils/geoUtils.js` — nearest-node lookup, haversineKm | ✅ DONE | 691677d |
| W1-04 | 15 | Fix `src/utils/contingencyEngine.js` — remove hardcoded fake data | ✅ DONE | 691677d |
| W1-05 | 17 | Fix `src/utils/stationHopper.js` — remove Math.random() fare estimates | ✅ DONE | 691677d |
| W1-06 | 00 | Write full `docs/AUDIT.md` baseline | ✅ DONE | 691677d |

---

## Wave 2 Tasks ✅ COMPLETE

| Task ID | Agent | Description | Status | Commit |
|---------|-------|-------------|--------|--------|
| W2-01 | 12 | Nearest-station fallback in `api/trains/search.js` | ✅ DONE | 163e83b |
| W2-02 | 14 | Nearest-airport fallback in `api/flights/search.js` | ✅ DONE | 163e83b |
| W2-03 | 16 | Parallel flight APIs (Promise.allSettled) + fusion dedup | ✅ DONE | 163e83b |
| W2-04 | 16 | Canonical provenance values for Skyscanner + Aviationstack | ✅ DONE | 163e83b |
| W2-05 | 00 | Log D-007 tie-break rules in DECISIONS.md | ✅ DONE | 163e83b |

**Known Limitation (W2):** Bus API (`api/buses/search.js`) remains unconfigured — no bus provider key set in env. Handler returns honest `provider-unconfigured` response. Bus nearest-fallback (W2-04-bus) blocked until a bus API is provisioned.

---

## Wave 3 Tasks 🔄 IN PROGRESS

| Task ID | Agent | Description | Status | Files |
|---------|-------|-------------|--------|-------|
| W3-01 | 11 | Mode purity enforcement middleware / filter | 🔄 IN PROGRESS | `src/utils/modePurity.js` |
| W3-02 | 15 | All 6 combination mode pairs + MCT enforcement | 📋 TODO | `src/utils/combinationEngine.js` |
| W3-03 | 15 | 3-leg route assembly + transfer risk badges | 📋 TODO | `src/utils/combinationEngine.js` |

---

## Wave 4 Tasks 📋 TODO

| Task ID | Agent | Description | Status |
|---------|-------|-------------|--------|
| W4-01 | 19 | Upstash Redis caching on API routes (60 s TTL) | 📋 TODO |
| W4-02 | 19 | Per-provider 8 s timeout + 15 s total search timeout | 📋 TODO |
| W4-03 | 19 | Graceful empty-state error responses on all handlers | 📋 TODO |

---

## Wave 5 Tasks 📋 TODO

| Task ID | Agent | Description | Status |
|---------|-------|-------------|--------|
| W5-01 | 08 | UI/UX specs: nearby-node label cards, transfer risk badges | 📋 TODO |
| W5-02 | 02 | Frontend: implement new result cards + combination route UI | 📋 TODO |

---

## Wave 6 Tasks 📋 TODO

| Task ID | Agent | Description | Status |
|---------|-------|-------------|--------|
| W6-01 | 20 | Build full test matrix (7 test files, see AUDIT.md §Test Matrix) | 📋 TODO |
| W6-02 | 21 | Fix loop — fix all failing tests | 📋 TODO |
| W6-03 | 09 | Security review — OWASP, no key leaks, auth checks | 📋 TODO |
| W6-04 | 18 | Live Data Verifier — cross-check real API calls vs result provenance | 📋 TODO |
| W6-05 | 22 | Release Gatekeeper — final sign-off ONLY when all 6 gates green | 📋 TODO |

---

## Blocked / Limitations

| Item | Reason | Unblocked By |
|------|--------|-------------|
| Bus nearest-fallback | No bus provider API key configured | User adds `BUS_API_URL` + `BUS_API_KEY` to env |
| Aviationstack date filter | Subscription plan restriction | User upgrades Aviationstack plan |
| geoUtils coordinate data | `stationsData.js` coords need validation (some may be 0,0) | W3 or W4 spike: run coord validation script |
