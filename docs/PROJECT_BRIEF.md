# TravelMate AI — Project Brief

**Version:** 2.5.1 | **Last Updated:** 2026-11-25  
**Live Production URL:** https://travelmate-ai-flowzint.vercel.app  
**Repository:** https://github.com/Surendra900/travell-mate

---

## 1. What TravelMate AI Does

TravelMate AI is an **emergency-aware, multimodal transit and waitlist recovery platform** for Indian Railways passengers. When a direct train ticket is 100% sold out or heavily waitlisted (25 million+ monthly cancellations), TravelMate automatically synthesizes practical alternative journeys by combining available trains, intercity buses, and domestic flights into one clear, ranked travel plan.

It is an **unbundled discovery and routing platform** — it does not sell tickets or process payments. It directs users to official operators (IRCTC, redBus, airline portals) via verified deep-links.

---

## 2. Who It Serves

| User Segment | Pain Point |
|---|---|
| **Emergency & family travelers** | Need guaranteed arrival; Tatkal quotas exhausted |
| **Intercity students & migrant workers** | Budget-conscious; miss exams/commitments due to WL tickets |
| **Business travelers** | Need fastest rail-to-air alternative; direct executive trains full |
| **Next-billion vernacular users** | Low literacy; 2G connectivity; non-English speakers across 14 Indian languages |

---

## 3. Core Features

### 3.1 Multimodal Waitlist Recovery Engine
Traverses a time-expanded directed graph of Indian transit hubs to generate 3–4 recovery paths:
- **Train + Flight (Hub Rail-to-Air):** Express train to tier-1 airport hub → domestic flight.
- **Train + Intercity AC Bus:** Trunk rail → overnight luxury sleeper bus.
- **Bus + Flight (Tier-3 Feeder):** Feeder bus from rural towns to airport.
- **Station-Hopper Quota Splitter:** Split journeys across intermediate junctions with available regional quotas.

### 3.2 Parametric Minimum Connection Times (MCT)
Hard-enforced transfer safety buffers:
- Train → Train: 45–75 minutes.
- Train → Bus: 105 minutes.
- Train/Bus → Flight: 210 minutes (station-to-airport transit + check-in + security).

### 3.3 Extreme Accessibility & 14 Indian Languages (Offline)
- Hindi, Bengali, Telugu, Marathi, Tamil, Urdu (RTL), Gujarati, Kannada, Malayalam, Odia, Punjabi, Assamese, Maithili, English.
- Text-first 2G mode with zero heavy assets.
- 100% Offline PWA Traveler Pass: saved itineraries readable with zero signal.
- Hardware-level SOS: one-tap calls to Railway Police (139), National Emergency (112), Ambulance (108).

### 3.4 AI Smart Assistant & Voice Search
- Conversational route planning via SambaNova Llama-3.3-70B-Instruct.
- Voice-to-search via SambaNova Whisper-Large-v3 (transcription).
- Natural language route parsing via Google Gemini API (client-side).

### 3.5 Data Provenance & Unbundled Ticketing Integrity
Every result card is stamped: `LIVE_PROVIDER_DATA`, `TIMETABLE`, `ESTIMATE`, or `PROVIDER_VERIFICATION_REQUIRED`.

### 3.6 Privacy & DPDP Act 2023 Compliance
- Zero server-side PII storage.
- Saved plans stored only in user's local browser storage.
- Strict CSP, HSTS, and security headers enforced via Vercel.

---

## 4. Technology Stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.3.1 | UI framework |
| React Router | v6.30.6 | Client-side routing |
| Tailwind CSS | 3.4.19 | Utility-first styling |
| Lucide React | 0.468.0 | Icons |
| Leaflet | 1.9.4 | Interactive maps (OpenStreetMap) |
| Vite | 8.1.4 | Build tool (Rolldown engine) |

### Backend (Vercel Serverless)
| Technology | Purpose |
|---|---|
| Node.js 20–22 (ES modules) | Serverless function runtime |
| Vercel Functions (`api/`) | Serverless API layer |
| Upstash Redis | Per-IP rate limiting |
| Clerk React / JWT | Optional user authentication |
| Zod | Input validation schemas |

### AI & Language Services
| Provider | Model | Purpose |
|---|---|---|
| SambaNova Systems | Meta-Llama-3.3-70B-Instruct | Conversational AI assistant |
| SambaNova Systems | Whisper-Large-v3 | Voice transcription |
| Google Gemini | Gemini API | Natural language route parsing |

### Transit Data APIs
| Provider | Endpoint | Purpose |
|---|---|---|
| RapidAPI IRCTC | `irctc1.p.rapidapi.com` | Live train search & seat availability |
| RapidAPI IRCTC PNR | `irctc-indian-railway-pnr-status.p.rapidapi.com` | PNR status |
| Skyscanner via RapidAPI | `skyscanner-flights4.p.rapidapi.com` | Flight search |
| Aviationstack | `api.aviationstack.com/v1` | Live flight status |
| Bus adapter | Configurable via `BUS_API_URL` | Intercity bus options |
| OpenRouteService | Optional | Routing/directions |

### Storage & Auth
| Technology | Purpose |
|---|---|
| `@supabase/supabase-js` | Cloud sync of saved plans (optional) |
| `@clerk/clerk-react` | User session management (optional) |
| Browser LocalStorage / Cache API | Offline vault (primary storage, zero-PII) |

### Testing & Quality
| Tool | Purpose |
|---|---|
| `node:test` (native) | Unit and regression tests (300+ assertions) |
| Playwright | E2e browser automation |
| axe-core | Accessibility verification |
| Custom audit scripts | IST date, PWA icon, and raw field checks |

---

## 5. APIs & Datasets Required

### Live APIs (server-side, keyed)
- RapidAPI IRCTC (trains, PNR, seat availability)
- Skyscanner via RapidAPI (flight search)
- Aviationstack (flight status)
- SambaNova API (Llama-3.3 assistant + Whisper voice)
- Google Gemini API (natural language parsing, client-side)
- Upstash Redis (rate limiting)
- Supabase (cloud plan sync)

### Static Datasets (bundled offline)
- Indian railway station codes → names → coordinates (`src/data/stationsData.js`)
- Transit hub topology: junctions, tier-1 airports, bus stands (`src/data/transitHubData.js`)
- Airport IATA codes (`src/data/airportsData.js`)
- Transport mode data for 500+ cities (`src/data/transportData.js`)
- 14-language offline dictionaries (`src/data/languageData.js`)
- Emergency contacts and hospital refs (`src/data/emergencyData.js`)

**Data sources:** NTES open data, Datameet railway dataset, OpenStreetMap, IATA public feeds, Government of India open data portals.

---

## 6. Architecture Overview

```
Browser (React PWA)
  ├── Offline: Edge routing engine (multimodalRouter.js, in-memory graph, <15ms)
  └── Online: → Vercel Serverless API (api/)
                   ├── IRCTC / RapidAPI (trains)
                   ├── Skyscanner / Aviationstack (flights)
                   ├── SambaNova (AI assistant + voice)
                   └── Upstash Redis (rate limiting)
```

---

## 7. Environment Variables Summary

See `.env.example` for the full list. Key variables:

| Variable | Side | Provider |
|---|---|---|
| `RAPIDAPI_KEY` | Server | IRCTC + Skyscanner |
| `SAMBANOVA_API_KEY` | Server | SambaNova Llama + Whisper |
| `VITE_GEMINI_API_KEY` | Client | Google Gemini |
| `VITE_CLERK_PUBLISHABLE_KEY` | Client | Clerk Auth |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | Server | Rate limiting |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Supabase admin |
| `VITE_SUPABASE_URL` / `_ANON_KEY` | Client | Supabase public |

---

## 8. Deployment

- **Platform:** Vercel (auto-deploy on main branch push)
- **Build command:** `npm run build`
- **Output:** `dist/`
- **Functions directory:** `api/`
- **Production URL:** https://travelmate-ai-flowzint.vercel.app

