# TravelMate AI — API Keys & External Integrations Audit

**Project:** TravelMate AI  
**Vercel Project:** `travelmate-ai-flowzint` (`surendragedala6-3289`)  
**Audit Date:** October 2026  

---

## 1. Executive Summary: Active vs. Missing Keys

| Integration / Service | Provider | Status | Where Configured | Test Command / Verification |
| :--- | :--- | :---: | :--- | :--- |
| **LLM Reasoning & Copilot** | SambaNova Cloud | **ACTIVE** | Vercel (`Production`, `Preview`), `.env.local` | `curl -s -X POST https://api.sambanova.ai/v1/chat/completions` |
| **Dynamic Translation** | SambaNova Llama 3 | **ACTIVE** | Vercel (`Production`, `Preview`), `.env.local` | Verified via `/api/translate` |
| **Indian Railways Live Search** | RapidAPI (IRCTC Rail) | **ACTIVE** | Vercel (`Production`, `Preview`), `.env.local` | Verified via `/api/trains/search` |
| **IRCTC PNR Status** | RapidAPI (Rail PNR) | **ACTIVE** | Vercel (`Production`, `Preview`), `.env.local` | Verified via `/api/trains/pnr` |
| **Flight Search & Status** | Aviationstack | **ACTIVE** | Vercel (`Production`, `Preview`), `.env.local` | Verified via `/api/flights/search` |
| **Authentication** | Clerk.dev | **ACTIVE** | Vercel (`Production`, `Preview`), `.env.local` | Verified in client bundle via `VITE_CLERK_PUBLISHABLE_KEY` |
| **Weather & Delays** | Open-Meteo | **ACTIVE (No Key)** | Direct REST API (Free public access) | `curl -s "https://api.open-meteo.com/v1/forecast?latitude=28.61&longitude=77.23&current_weather=true"` |
| **Emergency POIs (Police/Hospitals)** | Overpass API (OSM) | **ACTIVE (No Key)** | Direct REST API (Free public access) | `curl -s "https://overpass-api.de/api/interpreter?data=[out:json];node[amenity=hospital](28.6,77.2,28.7,77.3);out;"` |
| **Geocoding & Autocomplete** | Nominatim (OSM) | **ACTIVE (No Key)** | Direct REST API with User-Agent | `curl -s -A "TravelMateApp/1.0" "https://nominatim.openstreetmap.org/search?q=Nagpur&format=json"` |
| **Mapping & Junction View** | Leaflet + OpenStreetMap | **ACTIVE (No Key)** | Client-side tile layer | Direct in-browser tile loading |
| **Speech Recognition & TTS** | Web Speech API | **ACTIVE (No Key)** | Native browser device hardware | In-browser speech synthesis and recognition |
| **Device SOS & WhatsApp** | `sms:` & `api.whatsapp.com` | **ACTIVE (No Key)** | Native OS deep links | Zero server dependency; 100% offline capable |
| **Web Push Notifications** | Web Push / VAPID | **OPTIONAL / STANDBY** | Self-generated VAPID keys | Can generate via `web-push generate-vapid-keys` |
| **Bhashini Indian Languages** | MeitY Bhashini | **PLANNED / OPTIONAL** | Government registration required | Fallback: SambaNova Indian language translation (Already Active) |

---

## 2. Detailed Service Configurations

### 1. SambaNova Cloud (LLM Copilot & Multilingual Translation)
- **Purpose:** Powers conversational Smart Assistant, natural language route parser, and dynamic translation across Hindi, Telugu, Tamil, Bengali, Marathi, Urdu, etc.
- **Provider:** SambaNova Systems Cloud (`https://cloud.sambanova.ai/`)
- **Free-Tier Limits:** High rate-limit developer tier (currently ~20 requests/minute, 1M+ free tokens).
- **Environment Variables:**
  - `SAMBANOVA_API_KEY` (Secret)
  - `SAMBANOVA_BASE_URL`: `https://api.sambanova.ai/v1`
  - `SAMBANOVA_MODEL`: `Meta-Llama-3.1-70B-Instruct`
  - `SAMBANOVA_ASSISTANT_MODEL`: `Meta-Llama-3.1-8B-Instruct`
  - `SAMBANOVA_TRANSLATION_MODEL`: `Meta-Llama-3.1-8B-Instruct`
  - `SAMBANOVA_FALLBACK_MODEL`: `Meta-Llama-3.1-8B-Instruct`
- **Current Status:** Configured and active on Vercel and in local environment.

### 2. RapidAPI Railway Data (IRCTC Search & Live Status)
- **Purpose:** Real-time Indian Railways seat availability, train schedules, live train running status, and station boards.
- **Provider:** RapidAPI (`https://rapidapi.com/hub`)
- **Environment Variables:**
  - `RAPIDAPI_KEY` (Secret)
  - `RAPIDAPI_TRAIN_HOST`: `irctc1.p.rapidapi.com`
- **Heuristic & Offline Fallback:** When API monthly quota exhausts or on weak mobile networks, TravelMate automatically switches to verified offline corridor schedules with explicit "Demo / Estimated Data" badges so users are never blocked.
- **Current Status:** Configured and active on Vercel and in local environment.

### 3. RapidAPI PNR Status Engine
- **Purpose:** 10-digit Indian Railways PNR status checking, chart status, and coach/berth confirmation.
- **Provider:** RapidAPI PNR Gateway
- **Environment Variables:**
  - `RAPIDAPI_PNR_KEY` (Secret)
  - `RAPIDAPI_PNR_HOST`: `irctc-indian-railway-pnr-status.p.rapidapi.com`
  - `RAPIDAPI_PNR_ENDPOINT`: `https://irctc-indian-railway-pnr-status.p.rapidapi.com/pnr-status`
- **Current Status:** Configured and active on Vercel and in local environment.

### 4. Aviationstack (Domestic & Regional Flights)
- **Purpose:** Validates regional airport feeder flights (e.g. Kanpur -> Lucknow -> Bengaluru for Emergency Express tier).
- **Provider:** Aviationstack (`https://aviationstack.com/`)
- **Free-Tier Limits:** 100 free API calls/month on developer tier.
- **Environment Variables:**
  - `AVIATIONSTACK_API_KEY` (Secret)
  - `AVIATIONSTACK_BASE_URL`: `https://api.aviationstack.com/v1`
- **Current Status:** Configured and active on Vercel and in local environment.

### 5. Open-Meteo (Transit Weather & Disruption Risk)
- **Purpose:** Retrieves real-time temperature, rainfall, fog, and weather disruption alerts for transit junctions.
- **Provider:** Open-Meteo (`https://open-meteo.com/`)
- **Free-Tier Limits:** 10,000 daily API calls, 100% free for non-commercial/open-source with no API key required.
- **Current Status:** Active with zero key setup required.

### 6. Overpass API & OpenStreetMap (Emergency Helplines & Nearby Care)
- **Purpose:** Pinpoints nearby hospitals, police stations, and 24/7 pharmacies when Emergency SOS Mode is active.
- **Provider:** OpenStreetMap / Overpass Turbo (`https://overpass-api.de/`)
- **Free-Tier Limits:** Free public community endpoint, no key required.
- **Current Status:** Active with zero key setup required.

---

## 3. One-Batch Signup Guide (Only if new keys needed)

All essential keys are **already present** in your Vercel project environment. If you ever need to register a backup key for RapidAPI or SambaNova, follow these steps:

1. **SambaNova Cloud:** Go to [cloud.sambanova.ai](https://cloud.sambanova.ai) ➔ Log in with Google/GitHub ➔ Click **API Keys** ➔ **Create Key** ➔ Copy to Vercel via `vercel env add SAMBANOVA_API_KEY`.
2. **RapidAPI:** Go to [rapidapi.com](https://rapidapi.com) ➔ Log in ➔ Search "IRCTC" ➔ Subscribe to Free Tier ➔ Copy `X-RapidAPI-Key` ➔ Copy to Vercel via `vercel env add RAPIDAPI_KEY`.
