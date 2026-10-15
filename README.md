# TravelMate AI

**Autonomous Multimodal Journey Planner & Waitlist Recovery Platform**

[![Vercel Deployment](https://img.shields.io/badge/Production-Live-059669?style=flat&logo=vercel)](https://travelmate-ai-flowzint.vercel.app)
[![Tests Passing](https://img.shields.io/badge/Tests-308%20Passed-0284c7?style=flat)](https://github.com/Surendra900/travell-mate)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![DPDP Act 2023](https://img.shields.io/badge/Privacy-Zero--PII%20Client--Side-emerald)](https://travelmate-ai-flowzint.vercel.app/privacy)

TravelMate AI is an emergency-aware, multimodal transit and waitlist recovery platform designed to eliminate travel dead-ends across India. When direct trains are 100% sold out or heavily waitlisted, TravelMate dynamically synthesizes reliable intermodal alternatives: **Train + Flight**, **Train + Bus**, and **Bus + Flight**, backed by parametric connection buffers and real-time delay simulations.

Live Production URL: **[https://travelmate-ai-flowzint.vercel.app](https://travelmate-ai-flowzint.vercel.app)**

---

## The Core Problem

Over **24 Million** passengers travel on Indian Railways daily across 13,000+ trains. However:
1. **25 Million+ waitlisted tickets** are automatically cancelled every month by IRCTC due to track and seat saturation.
2. **Disconnected Transport Silos:** Railway, aviation, and intercity bus networks operate in isolation. If a direct train from Patna to Bengaluru is waitlisted, no major rail app recommends taking a fast feeder train to Kolkata or Delhi to board a budget flight.
3. **Surge & Exploitation:** Stranded travelers face last-minute airfare surges or unauthorized ticket touts.
4. **Language & Connectivity Gaps:** Critical travel alerts, platform details, and booking instructions are frequently inaccessible to non-English speakers or users traveling through poor 2G/3G connectivity corridors.

---

## Target Users

- **Urgent & Family Emergency Travelers:** Individuals requiring guaranteed arrival when Tatkal or general train quotas are exhausted.
- **Intercity Migrant Workers & Students:** Budget-conscious travelers needing dependable, affordable alternative connections across state corridors.
- **Business Travelers:** Professionals seeking fast multimodal rail-to-air combinations when direct flights or executive trains are fully booked.
- **Next-Billion Vernacular Travelers:** Users needing travel assistance in their native mother tongue (14 Indian languages supported offline).

---

## Key Features

### 1. Multimodal Waitlist Recovery Engine
When direct rail tickets are unavailable, the engine traverses a time-expanded directed graph to generate 4 recovery paths:
- **Train + Flight (Hub Rail-to-Air):** High-frequency express train to an intermediate tier-1 airport hub + low-cost domestic flight to destination (e.g., Patna $\rightarrow$ Kolkata [Train] + Kolkata $\rightarrow$ Bengaluru [Flight], saving up to 18 hours).
- **Train + Intercity AC Bus:** Fast trunk rail service connected to state or private luxury sleeper bus networks.
- **Bus + Flight (Tier-3 Feeder):** Express feeder bus from rural or tier-3 towns without airports straight to the departure terminal.
- **Station-Hopper Quota Splitter:** Segmenting long congested journeys across intermediate junctions where regional quotas exist.

### 2. Parametric Delay Contingency & Minimum Connection Times (MCT)
To prevent missed connections, the engine enforces strict transfer buffers:
- **Train to Train:** 45 to 75 minutes.
- **Train to Intercity Bus:** 105 minutes.
- **Train/Bus to Domestic Flight:** Strict 210 minutes (accounts for station-to-airport transit, check-in, and security).
- **Real-Time Safety Index:** Reassures travelers with clear indicators (e.g., *"Safe up to +120m delay on Leg 1"*).

### 3. Extreme Accessibility & 14 Regional Languages
- **14 Indian Languages Localized Offline:** Hindi, Bengali, Telugu, Marathi, Tamil, Urdu (with native RTL layout), Gujarati, Kannada, Malayalam, Odia, Punjabi, Assamese, Maithili, and English.
- **Low-Bandwidth 2G Mode:** Text-first, lightweight interface for remote railway platforms.
- **100% Offline PWA Traveler Pass:** Stored confirmed itineraries and platform advice viewable with zero cellular reception.
- **Hardware-Level SOS Emergency Mode:** One-tap calling to Railway Police (139), National Emergency (112), and ambulance (108) with offline GPS coordinate dispatch.

### 4. Smart Assistant & Voice-Enabled Search
- Conversational travel route planning powered by SambaNova and Google Gemini APIs.
- Spoken and typed natural queries (e.g., *"Fastest way from Kochi to Chennai tomorrow"*) automatically populate search fields.

### 5. Data Provenance & Unbundled Ticketing Integrity
- Every result card is labelled with honest data provenance: `LIVE_PROVIDER_DATA`, `TIMETABLE`, `ESTIMATE`, or `PROVIDER_VERIFICATION_REQUIRED`.
- Clear unbundled ticketing disclaimers inform travelers that connections operate under independent contracts of carriage.

---

## Important Prototype Limitation & Safety Notice

TravelMate is an **unbundled discovery and routing platform**. It does **not** sell tickets, collect payments, store banking passwords, issue real PNRs, or charge user credit cards/UPI. When ready to book, users are redirected via verified direct links to official operators (e.g., IRCTC, ConfirmTkt, airline portals, redBus). The in-app booking flow is explicitly a demonstration prototype.

---

## Technology Stack

- **Frontend:** React 18, React Router v6, Tailwind CSS, Lucide Icons
- **Build Tool:** Vite 8, Rolldown engine
- **Maps & Geolocation:** Leaflet, OpenStreetMap, HTML5 Geolocation API
- **AI & Language Services:** SambaNova Systems (Meta-Llama-3.3-70B-Instruct, Whisper-Large-v3), Google Gemini
- **Transit APIs:** RapidAPI IRCTC Rail API, Skyscanner Flights API, Aviationstack
- **Offline / PWA:** Service Worker, Cache API, LocalStorage Vault
- **Authentication:** Clerk React (optional session sign-in)
- **Testing & Quality Assurance:** Node.js native test runner (`node:test`), Playwright, axe-core

---

## Project Structure

```text
api/                 Vercel serverless API route handlers
  ├── assistant.js   Conversational AI assistant handler
  ├── flights/       Skyscanner and Aviationstack flight search adapters
  ├── trains/        IRCTC train search, seat availability, and PNR status
  └── translate.js   Dynamic language translation endpoint
public/              PWA manifest, service worker, icons, and QR code assets
src/                 React application source
  ├── auth/          Clerk authentication integration
  ├── components/    Reusable UI, navigation, multimodal cards, and dialogs
  ├── data/          14-language offline dictionaries, transit hubs, and schedules
  ├── pages/         Home, Planner, Safety, Saved Plans, Analytics, and Legal pages
  ├── planner/       Normal, Tatkal, PNR predictor, and Low-Network planners
  └── utils/         Date handling, graph routing heuristics, and voice intent
tests/               Automated test suite (unit, regression, accessibility, security)
scripts/             Audit runner, launch check scripts, and timetable ETL
```

---

## Local Setup & Installation

### Prerequisites
- **Node.js:** `^20.19.0` or `>=22.12.0 <23`
- **npm:** 10.x or higher

### Windows (PowerShell)

```powershell
# 1. Clone repository
git clone https://github.com/Surendra900/travell-mate.git
cd travell-mate

# 2. Install dependencies
npm.cmd ci

# 3. Create local environment file
Copy-Item .env.example .env.local

# 4. Start local development server
npm.cmd run dev
```

### macOS / Linux (Bash)

```bash
# 1. Clone repository
git clone https://github.com/Surendra900/travell-mate.git
cd travell-mate

# 2. Install dependencies
npm ci

# 3. Create local environment file
cp .env.example .env.local

# 4. Start local development server
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Running Verification & Tests

To execute the project verification battery:

```bash
# 1. Run source and security audit (checks IST dates, raw fields, PWA icons)
npm.cmd run audit

# 2. Run automated test suite (300+ assertions)
npm.cmd test

# 3. Run production build
npm.cmd run build
```

---

## Environment Variables

Copy `.env.example` to `.env.local`. All API keys are optional for running the local mock/timetable explorer:

| Variable | Description |
| :--- | :--- |
| `RAPIDAPI_KEY` | RapidAPI key for IRCTC and Skyscanner APIs |
| `RAPIDAPI_TRAIN_HOST` | IRCTC train API host (`irctc1.p.rapidapi.com`) |
| `RAPIDAPI_FLIGHT_HOST` | Skyscanner flights host (`skyscanner-flights4.p.rapidapi.com`) |
| `SAMBANOVA_API_KEY` | SambaNova API key for Llama-3.3 assistant |
| `VITE_GEMINI_API_KEY` | Google Gemini API key for natural language route parsing |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key for optional user accounts |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL for serverless rate limiting |

---

## Privacy & Security (DPDP Act 2023)

- **Zero Server-Side PII:** Passenger names, mobile numbers, and personal details are never stored on backend databases.
- **Client-Side Storage:** Saved itineraries and passes reside in local browser storage.
- **Strict Headers:** Vercel deployment enforces Content Security Policy (CSP), HSTS, `X-Content-Type-Options: nosniff`, and `Cache-Control: no-store` on sensitive endpoints.

---

## AI Tooling Usage Disclosure

In compliance with hackathon and academic integrity guidelines:
- Generative AI tools (including Anthropic Claude and Google Gemini) were utilized during the project lifecycle as developer productivity assistants for code scaffolding, repetitive test assertions, i18n vocabulary maps, and algorithmic prototyping.
- All system architecture, graph routing heuristics, delay safety formulas, data provenance policies, and final code reviews were designed, verified, and integrated by the human project author.

---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
