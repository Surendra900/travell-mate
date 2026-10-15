# TravelMate AI — Submission Checklist & Reviewer Dossier

This document provides competition evaluators, hackathon judges, and peer reviewers with an exhaustive verification manual for the **TravelMate AI** project.

---

## 1. Project & Repository Identity

- **Project Title:** TravelMate AI
- **Core Domain:** Multimodal Transit Synthesis, Rail Waitlist Recovery, Public Mobility
- **Target Platform:** Web Application (Responsive Mobile & Desktop, Progressive Web App)
- **Live Production URL:** [https://travelmate-ai-flowzint.vercel.app](https://travelmate-ai-flowzint.vercel.app)
- **Primary Repository:** [https://github.com/Surendra900/travell-mate](https://github.com/Surendra900/travell-mate)
- **License:** MIT License

---

## 2. Quick Start: How to Run, Test, and Build

### Prerequisites
- Node.js: `v20.19.0` or `>=22.12.0 <23` (tested on Node v24.16.0)
- npm: `10.x` or `11.x`

### Commands (Exact Execution Steps)

```bash
# 1. Clone repository
git clone https://github.com/Surendra900/travell-mate.git
cd travell-mate

# 2. Clean install of locked dependencies
npm ci     # (or npm.cmd ci on Windows)

# 3. Environment configuration
cp .env.example .env.local    # (or Copy-Item .env.example .env.local on Windows)

# 4. Run local development server
npm run dev    # (or npm.cmd run dev on Windows)
# -> Opens http://localhost:5173

# 5. Run static and security audit
npm run audit    # (or npm.cmd run audit on Windows)
# -> Verifies IST dates, raw fields, package-lock registry, and PWA icons

# 6. Run automated test suite
npm test    # (or npm.cmd test on Windows)
# -> Executes 320 tests across 14 test suites with 0 failures

# 7. Run production build
npm run build    # (or npm.cmd run build on Windows)
# -> Compiles production bundle into dist/
```

---

## 3. Feature Status Matrix

| Feature Module | Implementation Status | Functional Level | Notes |
| :--- | :--- | :--- | :--- |
| **Multimodal Waitlist Recovery** | Completed | Full Production | Traverses graph to stitch Train+Flight, Train+Bus, Bus+Flight when direct trains are waitlisted |
| **Parametric MCT Delay Engine** | Completed | Full Production | Enforces 45-75m train, 105m bus, 210m air transfer buffers with real-time delay index |
| **Station Autocomplete** | Completed | Full Production | 13,000+ Indian railway stations and major airports indexed with dynamic search |
| **14-Language Offline Localization**| Completed | Full Production | 14 regional languages (including Urdu RTL) with localized dictionaries & mobile typography |
| **Offline PWA Traveler Pass** | Completed | Full Production | Service Worker caching, offline ticket/itinerary pass, zero-network viewability |
| **Emergency SOS Mode** | Completed | Full Production | 1-tap integration with 112, 139, 108 with offline GPS coordinates dispatch via WhatsApp/SMS |
| **2G Low-Network Planner** | Completed | Full Production | Text-first, lightweight planner stripping heavy assets for remote railway platforms |
| **Smart Voice Assistant** | Completed | Hybrid / Optional | Natural language route parsing via SambaNova / Gemini API; local heuristic parser fallback |
| **Direct Booking Gateway** | Scoped Prototype | Unbundled Discovery | Redirects to official ticketing portals (IRCTC, ConfirmTkt, Skyscanner, redBus) |
| **Payment Collection** | Intentionally Excluded | Safe Mock Mode | Does NOT collect card numbers, CVVs, UPI PINs, or bank passwords for safety |

---

## 4. Technology Stack & Key Dependencies

- **Client Runtime:** React 18 (`18.3.1`), React Router (`6.30.6`), Tailwind CSS (`3.4.19`), Lucide React (`0.468.0`)
- **Build Engine:** Vite (`8.1.4`), Rolldown bundler
- **Maps:** Leaflet (`1.9.4`), OpenStreetMap tiles
- **Serverless Compute:** Vercel Serverless Functions (`/api/*`)
- **Validation:** Zod (`4.6.5`)
- **Testing:** Native Node.js Test Runner (`node:test`), Playwright (`1.63.0`), axe-core (`4.13.0`)
- **Auth (Optional):** `@clerk/clerk-react` (`5.61.10`)

---

## 5. Authentic Data Sources & Attribution

1. **Indian Railways Timetables:** Ingested from `datameet/railways` (CC0 1.0 Public Domain, commit `e0c538a1e41ae5eace454d2818902e1065608e16`).
2. **Real-Time Train APIs:** Configured for RapidAPI IRCTC Rail API (`irctc1.p.rapidapi.com` / `irctc-train-api`).
3. **Flight Timetables & Schedules:** Configured for RapidAPI Skyscanner Flights (`skyscanner-flights4.p.rapidapi.com`) and Aviationstack.
4. **Transit Hub Junctions:** 25 major interchange junctions mapped in `src/data/transitHubData.js`.
5. **OpenStreetMap Data:** Map tiles and geographic features via OpenStreetMap contributors (ODbL).

---

## 6. Security, Privacy & DPDP Act 2023 Compliance

- **Zero Server-Side PII:** Passenger personal details, names, contact numbers, and travel histories are never stored on central servers.
- **Client-Side Encrypted Storage:** All user preferences, saved routes, and boarding passes reside inside browser LocalStorage.
- **Strict Transport & Headers:** Configured in `vercel.json`:
  - `Content-Security-Policy`: Restricts scripts, objects, and framing.
  - `Strict-Transport-Security`: `max-age=63072000; includeSubDomains; preload`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`
- **Zero API Secret Leakage:** Server keys are isolated in `/api/*` serverless functions. Verified zero `VITE_` private token leaks in source code.

---

## 7. Known Prototype Limitations & Honesty Boundaries

1. **Unbundled Discovery Only:** TravelMate does not issue PNRs directly or collect payments. It is an intelligent discovery and routing layer.
2. **Third-Party API Rate Limits:** When public RapidAPI quotas are exceeded, the platform seamlessly displays verified timetable and local planning data with honest provenance badges (`TIMETABLE` vs `LIVE_PROVIDER_DATA`).
3. **Emergency SOS SMS:** Dispatches prepared emergency messages via user's default SMS or WhatsApp app; user must confirm send to prevent accidental emergency triggers.

---

## 8. AI Tooling Usage Disclosure

- **Scaffolding & Translation Assistance:** Generative AI tools (including Anthropic Claude and Google Gemini) were utilized for drafting boilerplate code, generating exhaustive multi-language translation dictionaries, constructing Playwright/axe-core test assertions, and exploratory routing prototypes.
- **Human Author Responsibility:** All core logic, graph formulation, delay contingency models, accessibility fixes, UI design decisions, and architectural integration were authored, reviewed, and empirically validated by the project submitter.

---

## 9. Remaining Owner Actions (Pre-Submission)

- [x] Fix UTC date truncation in `api/flights/search.js`
- [x] Restore desktop navbar max-width in `src/components/Navbar.jsx`
- [x] Ensure 100% test pass on `node --test tests/*.test.mjs`
- [x] Ensure production build succeeds (`npm run build`)
- [x] Generate high-resolution QR codes in PNG and SVG for website
- [x] Create clean `.env.example` template with zero leaked secrets
- [x] Update `README.md` with full project overview and honest AI disclosure
- [ ] Add team member names / contact info to Unstop submission portal
- [ ] Upload pitch deck presentation (PDF compiled from LaTeX Beamer or exported from Gamma)
- [ ] Record 2-minute live demo walkthrough video showcasing Patna $\rightarrow$ Bengaluru multimodal search
