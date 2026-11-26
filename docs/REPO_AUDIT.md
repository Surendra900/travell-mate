# BuildX 2026 — Repository Comprehensive Audit Dossier

**Author:** CTO & Orchestrator (on behalf of Release Gatekeeper, Security, Testing, and Data Architecture Agents)  
**Date:** 26 November 2026  
**Target Repository:** [Surendra900/travell-mate](https://github.com/Surendra900/travell-mate)  
**Status:** Phase 1 Complete (Read-Only Audit — Awaiting User Approval)

---

## Executive Summary

An exhaustive audit of the TravelMate AI repository was conducted covering:
1. **Secrets & Security:** Full scan of git history (`git log -p --all`) and active working tree.
2. **File Clutter & Dead Weight:** Identification of obsolete screenshots, benchmark dumps, duplicate datasets, and legacy migration scripts.
3. **Dead Code & Quality:** Inspection of `src/` and `api/` for `console.log`, `debugger`, and orphaned dependencies.
4. **Data Integrity & Mock Verification:** Verification of live API layers vs offline timetable fallback datasets.
5. **Repository Hygiene:** Audit of `.gitignore`, `.env.example`, and licensing.

---

## 1. Secrets & Credentials Audit

| Target | Findings | Risk | Classification | Action Required |
| :--- | :--- | :--- | :--- | :--- |
| **Git Commit History** | **0 leaked keys** across all commits and branches. No Clerk secret keys, RapidAPI keys, or database passwords committed. | None | `KEEP` (Clean history) | No history rewriting required. |
| **Working Tree: `.env.local`** | Contains active developer API keys in local workspace (`C:\Users\...\.env.local`). | High if staged | `KEEP` (Local only) | Verify `.gitignore` strictly blocks `.env.local`. Never stage. |
| **Working Tree: `.env.example`** | Clean template. Declares all required variable names with zero real values. | None | `KEEP` | Keep as the canonical template. |
| **Working Tree: `.env.local.example`** | Redundant duplicate of `.env.example` without comments. | Low | `SAFE TO REMOVE` | Remove to eliminate duplication. |
| **Client Sources (`src/`)** | Zero private backend secrets. Only standard public `VITE_` variables referenced. | None | `KEEP` | Verified compliant with OWASP standards. |
| **Serverless Routes (`api/`)** | Secrets accessed strictly via `process.env` with timeout and fallback guards. | None | `KEEP` | Verified safe. |

---

## 2. File & Directory Clutter Audit

### A. Obsolete Screenshots & Media Dumps (~85 MB)
| Path | Description & Size | Classification | Recommendation |
| :--- | :--- | :--- | :--- |
| `docs/screenshots/day-1` to `day-9` | ~120 historical PNG screenshots from early UI development (~45 MB). | `SAFE TO REMOVE` | Delete from git. Bloats clone time for judges. |
| `docs/audit-v2/screenshots/` | Historical audit screenshots (~25 MB). | `SAFE TO REMOVE` | Delete from git. |
| `docs/audit-v3/screenshots/` | Historical audit screenshots (~10 MB). | `SAFE TO REMOVE` | Delete from git. |
| `docs/mobile/screenshots/` | Early mobile viewport test captures (~15 MB). | `SAFE TO REMOVE` | Delete from git. |
| `docs/mobile/lighthouse-*.json` | Raw Lighthouse JSON benchmark dumps (1.6 MB). | `SAFE TO REMOVE` | Delete from git. |
| `docs/fix-evidence/` | Old screenshot captures for issue fixes (~3 MB). | `SAFE TO REMOVE` | Delete from git. |
| `docs/images/` | *Proposed new folder* for 4-5 high-res, curated screenshots of the running app for the README. | `KEEP` | Create and store final screenshots here. |

### B. Legacy Migration & One-Off Scripts
| Path | Purpose | Classification | Recommendation |
| :--- | :--- | :--- | :--- |
| `scripts/audit_tool.py` & `scripts/audit_results.json` | Temporary audit utilities created for this inspection. | `SAFE TO REMOVE` | Remove after approval. |
| `scripts/add_*_translations.mjs` (4 files) | One-time migration scripts used to populate language dictionaries. | `NEEDS MY APPROVAL` | Safe to remove or archive in `tools/`. |
| `scripts/build_final_issues_csv.mjs` | Internal bug list exporter from October. | `SAFE TO REMOVE` | Delete. |
| `scripts/build_gallery.mjs` | Screenshot gallery generator for old audits. | `SAFE TO REMOVE` | Delete. |
| `scripts/check-gemini.mjs` | Diagnostics script for Gemini API. | `NEEDS MY APPROVAL` | Keep in `scripts/pitch/` or remove. |
| `scripts/debug_planner.mjs` | Ad-hoc debugging script for planner logic. | `SAFE TO REMOVE` | Delete. |
| `scripts/generate-baseline-violations.mjs` | Old axe-core baseline generator. | `SAFE TO REMOVE` | Delete. |
| `scripts/remediate-copy.mjs` | One-off regex copy replacer. | `SAFE TO REMOVE` | Delete. |
| `scripts/visual_redesign_qa.mjs` | Old visual QA test script. | `SAFE TO REMOVE` | Delete. |
| `scripts/audit.mjs` | Used by `npm run audit`. | `KEEP` | Essential CI/validation script. |
| `scripts/launch-checks/` | Used by `npm run launch-check`. | `KEEP` | Essential quality gate scripts. |
| `scripts/pitch/` | Pitch deck and voiceover generation scripts (`build_deck.py`, etc.). | `KEEP` | Preserved for hackathon reproducibility. |

### C. Large Datasets & Storage Duplication
| Path | Size | Description | Classification | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| `data/processed/station_stops.json` | 18.0 MB | Processed timetable stop indexes generated by ETL. | `KEEP` | Essential data pipeline build output. |
| `shared/data/station_stops.json` | 18.0 MB | Runtime stop index consumed by `server/services/routeEngine.js`. | `KEEP` | Essential runtime dependency for routing engine. |
| `data/processed/stations.json` | 2.68 MB | Station geolocation metadata. | `KEEP` | Required by search & routing. |
| `shared/data/stations.json` | 2.68 MB | Runtime station metadata. | `KEEP` | Required by search & routing. |
| `data/processed/trains.json` | 2.25 MB | Master trains metadata. | `KEEP` | Required by search & routing. |
| `shared/data/trains.json` | 2.25 MB | Runtime trains metadata. | `KEEP` | Required by search & routing. |
| `src/data/languageData.js` | 753 KB | Offline dictionary for 14 Indian languages. | `KEEP` | Powers client-side offline localization. |

---

## 3. Dead Code & Code Quality Audit

| Component | Status | Details | Classification |
| :--- | :--- | :--- | :--- |
| **`src/` Debug Calls** | **0 `console.log` / 0 `debugger`** | Fully clean. No leftover debug output in client components. | `KEEP` |
| **`api/` Debug Calls** | **0 `console.log` / 0 `debugger`** | Fully clean. Serverless endpoints log only structured errors via wrappers. | `KEEP` |
| **Leftover TODOs / FIXMEs** | **0 blocking items** | Only 1 comment in `src/types/routeSchema.js:116` (`* Formats a fare in INR...`). | `KEEP` |
| **Dependencies (`package.json`)** | **All 8 production dependencies actively imported.** | `@clerk/clerk-react`, `@supabase/supabase-js`, `leaflet`, `lucide-react`, `react`, `react-dom`, `react-router-dom`, `zod`. | `KEEP` |
| **DevDependencies** | All used in test runner (`playwright`, `axe-core`, `vite`, `tailwindcss`). | `KEEP` |

---

## 4. Mock vs. Real Data Verification

| Domain | Architecture | Implementation | Compliance |
| :--- | :--- | :--- | :--- |
| **Train Search** | RapidAPI IRCTC Live API + Offline GTFS Fallback | Real API called first; if offline or rate-limited, switches transparently to local timetables. | **PASS** (Provable live fallback) |
| **Flight Search** | Skyscanner RapidAPI + Aviationstack | Live API query with parameter normalization. | **PASS** |
| **Intercity Bus** | RedBus provider deep-link resolution | Resolves station codes to human city slugs. | **PASS** |
| **Data Provenance** | Every result card rendered in the UI explicitly displays honest provenance badges (`LIVE_PROVIDER_DATA`, `TIMETABLE`, `ESTIMATE`). | Matches Master Spec §4. | **PASS** |
| **Booking Prototype** | Clear statutory disclaimer: unbundled discovery only; no tickets sold or funds collected. | Matches BuildX honesty rule. | **PASS** |

---

## 5. Licensing, Git Hygiene & Scaffolding

| Item | Current State | Issue | Classification | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| **`LICENSE`** | Missing from repository root. | `README.md` references an MIT license, but no file exists. | `NEEDS MY APPROVAL` | Add official `LICENSE` (User to confirm license type, e.g. MIT). |
| **`.gitignore`** | Functional but contains duplicate lines (`.env*`, `.vercel`, `!.env.local.example`). | Cluttered syntax. | `SAFE TO REMOVE` (Refactor) | Clean up into categorized blocks. |
| **AI-Agent Scaffolding** | `/.agent/`, `/.agents/`, `/.gemini/`, `/.gsd/`, `model_capabilities.yaml`, `PROJECT_RULES.md`, `GSD-STYLE.md`, `VERSION`. | These are currently **gitignored** and not tracked in git. | `NEEDS MY APPROVAL` | **Choice for user:** (A) Keep local & gitignored; (B) Move agent specs to `docs/agents/` to demonstrate transparent multi-agent development; (C) Delete locally. |
| **Legacy Docs in `/docs/`** | `docs/audit-v2/`, `docs/audit-v3/`, `docs/audit-v4/`, `docs/sprint-log.md` (103 KB), `docs/sprint-status.md`, `docs/cto-handover-report.md`. | Historical logs from earlier sprints. | `NEEDS MY APPROVAL` | Archive into `docs/archive/` or remove from git tracking to keep `/docs` clean and judge-friendly. |

---

## 6. Proposed Target Repository Structure

```text
travelmate/
├── .github/
│   └── workflows/
│       └── poll-delays.yml          # Automated CI delay poller
├── api/                             # Serverless API routes (Vercel)
│   ├── buses/                       # Bus search adapter
│   ├── flights/                     # Skyscanner / Aviationstack search adapter
│   ├── trains/                      # IRCTC train search, PNR, live station
│   ├── voice/                       # Audio transcription route
│   ├── assistant.js                 # Conversational AI assistant endpoint
│   ├── recovery.js                  # Transit disruption recovery endpoint
│   ├── translate.js                 # 14-language translation endpoint
│   ├── _cache.js                    # Upstash Redis caching wrapper
│   ├── _resilience.js               # Timeout and retry resilience wrappers
│   ├── _sambanova.js                # Llama-3.3 / Whisper client
│   └── _security.js                 # CORS and input validation
├── data/                            # Master railway & transit data pipeline
│   ├── db/                          # Prisma schema and SQL migrations
│   ├── etl/                         # Data ingestion and normalization scripts
│   └── processed/                   # Normalized datasets (stations, trains, stops)
├── docs/                            # Hackathon documentation & review dossier
│   ├── images/                      # Curated high-res app screenshots for README
│   ├── BUILDX_DEMO_SCRIPT.md        # Official 5-minute video pitch script
│   ├── PPT_BRIEF.md                 # 7-Slide presentation outline & proof matrix
│   ├── MASTER_SPEC.md               # Core system specifications
│   ├── DESIGN_SPEC.md               # Design system & tokens
│   ├── DECISIONS.md                 # Architecture decision records (ADR)
│   └── TASK_BOARD.md                # Task tracking & sign-off ledger
├── public/                          # Static assets, PWA manifest, service worker, icons
├── scripts/                         # Essential project utilities
│   ├── launch-checks/               # Automated pre-launch quality gates
│   ├── pitch/                       # Presentation & voiceover generator scripts
│   ├── audit.mjs                    # Source audit runner (`npm run audit`)
│   └── generate_complete_trains.mjs # Timetable index generator
├── server/                          # Server services, adapters, and middleware
├── shared/                          # Runtime data contracts and schemas
├── src/                             # React application source
│   ├── auth/                        # Clerk user authentication components
│   ├── components/                  # UI components, navigation, cards, modals
│   ├── data/                        # 14-language dictionary, transit hubs
│   ├── pages/                       # Route pages (Home, Planner, Safety, Saved, Legal)
│   ├── planner/                     # Normal, Tatkal, PNR, Low-Network planners
│   ├── services/                    # API clients and transport data fetchers
│   ├── styles/                      # Tailwind and color token definitions
│   ├── types/                       # Route schemas and validation
│   └── utils/                       # Graph router, delay math, biometric bridge
├── tests/                           # Complete automated test suite (300+ assertions)
├── .env.example                     # Canonical environment variables template
├── .gitignore                       # Cleaned, comprehensive git ignore rules
├── .vercelignore                    # Vercel deployment exclusions
├── docker-compose.yml               # Local Postgres development database
├── index.html                       # HTML5 entry point
├── LICENSE                          # Open-source license (MIT)
├── package.json                     # Project manifest and scripts
├── package-lock.json                # Locked dependency tree
├── postcss.config.js                # PostCSS configuration
├── README.md                        # Complete BuildX 2026 README (9 mandatory sections)
├── tailwind.config.js               # Tailwind CSS theme configuration
├── tsconfig.json                    # TypeScript declarations
├── vercel.json                      # Vercel serverless and CSP security headers
└── vite.config.js                   # Vite build configuration
```

---

## 7. Next Actions (Phase 2 Execution Plan)

Upon your approval:
1. Create new branch: `cleanup/repo-polish`.
2. Delete obsolete media dumps and legacy test scripts marked `SAFE TO REMOVE` (~85 MB reduction).
3. Consolidate `.env.example` (remove `.env.local.example`) and add official `LICENSE` file.
4. Clean up `.gitignore` to prevent any untracked clutter or logs.
5. Create `docs/images/` with crisp, real screenshots captured from the running app.
6. Author the comprehensive BuildX 2026 `README.md` containing all 9 required sections in exact order.
7. Run the full verification suite (`npm run audit`, `npm test`, `npm run build`) and test from a clean clone.
8. Request your final review before merging into `main`.
