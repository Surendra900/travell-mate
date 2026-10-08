# TravelMate Rebuild V2 — Fix Ledger & Tracking Matrix

This document tracks the systematic, test-driven rectification of every CON identified in the independent Audit V2 (`docs/audit-v2/AUDIT_V2.md`).
Per the **NO-FALLBACK, ASK-ME** protocol, every fix is backed by empirical before/after evidence, root-cause analysis, and regression guards.

## Executive Status Summary
- **Total Cons**: 15
- **Critical Severity**: 3 (`C-01`, `C-02`, `C-05`)
- **High Severity**: 5 (`C-03`, `C-04`, `C-07`, `C-09`, `C-10`)
- **Medium Severity**: 6 (`C-06`, `C-08`, `C-11`, `C-12`, `C-13`, `C-15`)
- **Low Severity**: 1 (`C-14`)

---

## Ordered Fix Ledger

| ID | Title | Category | Severity | Location | Recommendation | Acceptance Criteria | Effort | Dependencies | Status | Commit Hash | Evidence Path |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **C-01** | BlindVoiceGate & LocationPermissionGate block cold visits | UX and UI | Critical | `src/App.jsx:138-139` | Remove cold-start auto-prompt; move to explicit user actions | Fresh visitor on `/` sees Hero and 4 nav items immediately with 0 overlay modals or backdrop blocks | S | None | TODO | - | `docs/fix-evidence/C-01/` |
| **C-02** | Spec Violation: BlindVoiceGate remaining in App.jsx | Spec Compliance | Critical | `src/components/BlindVoiceGate.jsx`, `src/App.jsx:138` | Delete BlindVoiceGate auto-render from App.jsx per Master Spec Sec 8 L87 | Zero auto-invoked `BlindVoiceGate` on load; voice assistance available on-demand via search bar mic button | S | None | TODO | - | `docs/fix-evidence/C-02/` |
| **C-05** | Timetable dataset limited to 12 trains causing high route search failures | Engine Correctness | Critical | `shared/data/trains.json`, `shared/data/stops.json`, `server/services/routeEngine.js` | Expand dataset to top trunk express trains across all 25 hubs or scope demo routes | Realistic intercity pairs return valid multi-leg or direct itineraries respecting MCT; coverage across 25 hubs | L | None | TODO | - | `docs/fix-evidence/C-05/` |
| **C-03** | Location permission requested on cold load without user gesture | Security and Privacy | High | `src/components/LocationPermissionGate.jsx`, `src/App.jsx:139`, `src/pages/SafetyMode.jsx` | Only request geolocation inside SafetyMode when user taps Share Pin | Geolocation requested solely inside SafetyMode upon explicit user click of "Share Pin / Location" | S | None | TODO | - | `docs/fix-evidence/C-03/` |
| **C-04** | UI copy uses "confirmed" on static timetable data | Data Honesty | High | `src/utils/multimodalRouter.js:189`, `src/components/MultimodalTimelineCard.jsx`, `src/components/StationHopperCard.jsx` | Replace "confirmed" with "verified schedule" or "available at last check" | Zero instances of forbidden terms "confirmed" or "guaranteed" without live badge; exact provenance on all legs | S | None | TODO | - | `docs/fix-evidence/C-04/` |
| **C-07** | LiveResultsPanel full-screen modal covers page and blocks simulator/map tabs | UX and UI | High | `src/components/LiveResultsPanel.jsx:480`, `src/pages/Planner.jsx` | Render results inline in page rather than in a blocking modal dialog | Search results render inline in the page flow; Delay Simulator, Route Map, and Alternate Quotas remain seamlessly accessible | M | None | TODO | - | `docs/fix-evidence/C-07/` |
| **C-09** | WCAG 2.1 AA serious contrast violations in footer and legal text | Accessibility | High | `src/components/Footer.jsx`, `src/pages/LegalDisclaimer.jsx`, `src/pages/PrivacyPolicy.jsx` | Adjust footer and legal text colors to pass WCAG 2.1 AA 4.5:1 ratio | Footer buttons and legal copy text contrast ratio >= 4.5:1 against slate background; axe-core reports 0 serious/critical violations | S | None | TODO | - | `docs/fix-evidence/C-09/` |
| **C-10** | Missing Content-Security-Policy header in vercel.json | DevOps | High | `vercel.json` | Add Content-Security-Policy header to vercel.json headers config | vercel.json includes strict Content-Security-Policy header covering scripts, styles, fonts, and connects without breaking Leaflet/Vite | S | None | TODO | - | `docs/fix-evidence/C-10/` |
| **C-06** | Station codes passed into redBus path slugs and Google Flights instead of city names/IATA | Engine Correctness | Medium | `server/services/routeEngine.js:141` | Add station-to-city and station-to-IATA mapping helper for deep links | Deep link generator converts railway station codes to human city names for bus links and valid IATA codes for flight links | M | None | TODO | - | `docs/fix-evidence/C-06/` |
| **C-08** | Submitting search on Home redirects to Planner with filled form requiring 2nd click | Information Architecture | Medium | `src/pages/Home.jsx:86`, `src/pages/Planner.jsx` | Auto-trigger search on Planner if valid query parameters are present in URL | Navigating from Home with valid origin and destination immediately triggers route search on `/planner` without requiring a second click | S | None | TODO | - | `docs/fix-evidence/C-08/` |
| **C-11** | Duplicate WaitlistBypassContrast mounted simultaneously | Code Architecture | Medium | `src/pages/Planner.jsx`, `src/components/LiveResultsPanel.jsx` | Consolidate component mount to single container in Planner | Exactly one instance rendered per view hierarchy | S | C-07 | TODO | - | `docs/fix-evidence/C-11/` |
| **C-12** | 205 KB @clerk/clerk-react bundled in client assets despite auth being disabled | Performance | Medium | `package.json`, `src/App.jsx` | Lazy-load or remove Clerk dependency until authentication is activated | Remove or lazy-load @clerk/clerk-react; reduce client JS bundle size | S | None | TODO | - | `docs/fix-evidence/C-12/` |
| **C-13** | npm audit reports 14 dependency vulnerabilities | Security | Medium | `package.json`, `package-lock.json` | Run npm audit fix to update vulnerable transitive dependencies | Run npm audit fix / update transitive dependencies; npm audit shows 0 high/critical vulnerabilities | S | None | TODO | - | `docs/fix-evidence/C-13/` |
| **C-15** | Unbundled ticket cancellation and missed connection risk across separate PNRs | Business | Medium | `docs/pitch/real-vs-demo-matrix.md`, `src/components/MultimodalTimelineCard.jsx`, `src/pages/LegalDisclaimer.jsx` | Prominent statutory unbundled ticketing disclaimer on all multi-ticket cards | Prominent statutory unbundled ticketing disclaimer on all multi-ticket cards with clear explanation of cancellation risks and buffer recommendations | L | None | TODO | - | `docs/fix-evidence/C-15/` |
| **C-14** | HTML date picker on Home allows past dates without min constraint | UX and UI | Low | `src/pages/Home.jsx:197`, `src/pages/Planner.jsx:65` | Add min={localDateIso()} to date input elements | min attribute enforced on all date inputs so past dates cannot be selected | S | None | TODO | - | `docs/fix-evidence/C-14/` |

---

## Tooling & Verification Commands
- **Regression Guards**: `node --test tests/guards/regression_guards.test.mjs`
- **Full Test Suite**: `cmd.exe /c "npm test"`
- **Build & Bundle Check**: `cmd.exe /c "npm run build"`
- **A11y Audit**: `node docs/audit-v2/part7_accessibility_axe.mjs`
- **Security Check**: `node docs/audit-v2/part10_security_privacy_audit.mjs`
