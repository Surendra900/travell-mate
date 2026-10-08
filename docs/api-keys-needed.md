# TravelMate API Keys & Provider Signup Guide

**Document Version:** 1.0 (Master Rebuild)  
**Reference:** Section 14 of [MASTER_SPEC.md](file:///c:/Users/SURENDRA.G/.gemini/antigravity/scratch/travelmate-app/docs/MASTER_SPEC.md)

This document contains the complete, batched list of required and optional third-party integrations, verified free tiers, environment variable names, click-by-click registration steps, and test commands.

---

## Summary of Integration Keys

| Integration | Provider | Free-Tier Quota / Terms | Env Variable Name | Required or Optional |
| :--- | :--- | :--- | :--- | :--- |
| **Primary LLM** | SambaNova Cloud | Free tier (Generous rate limits on Llama 3.1 8B/70B) | `SAMBANOVA_API_KEY` | **Recommended** |
| **Alternative LLM** | Google AI Studio | Free tier (15 RPM / 1M TPM on Gemini 1.5 Flash) | `GEMINI_API_KEY` | **Recommended** |
| **Live Rail Lookups** | RapidAPI (IRCTC / irctc1) | Free tier (~50–100 requests/day depending on plan) | `RAPIDAPI_KEY` | **Optional** (Timetable graph fallback active) |
| **Weather Disruptions** | Open-Meteo | 100% Free, NO API KEY required (Commercial fair use <10k daily) | *(None needed)* | **Active (No key needed)** |
| **Routing & Transfers** | OSRM / OpenRouteService | OSRM demo server is free / ORS offers 2,000 req/day free | `OPENROUTESERVICE_KEY` | **Optional** (Formula fallback active) |
| **Maps & Tiles** | OpenStreetMap / CartoDB | Free tiles with attribution | *(None needed)* | **Active (No key needed)** |

---

## 1. LLM Integration 1: SambaNova Cloud (Primary)

- **Purpose:** Server-side natural-language query parser (structured JSON) and route trade-off rationale.
- **Provider:** SambaNova Systems Cloud
- **Free Tier Limits:** Free developer tier with high-throughput Llama 3.1 8B and 70B models.
- **Signup URL:** [https://cloud.sambanova.ai/](https://cloud.sambanova.ai/)
- **Click-by-Click Steps for User:**
  1. Open [https://cloud.sambanova.ai/](https://cloud.sambanova.ai/) and click "Get Started" / "Sign In".
  2. Authenticate using your GitHub or Google account.
  3. Navigate to **API Keys** in the left dashboard navigation.
  4. Click **Create API Key**, enter name `travelmate-rebuild`, and copy the key.
  5. Add to `.env.local`: `SAMBANOVA_API_KEY=your_key_here`
- **Test Command:**
  ```bash
  curl -X POST https://api.sambanova.ai/v1/chat/completions -H "Authorization: Bearer %SAMBANOVA_API_KEY%" -H "Content-Type: application/json" -d "{\"model\":\"Meta-Llama-3.1-8B-Instruct\",\"messages\":[{\"role\":\"user\",\"content\":\"ping\"}]}"
  ```

---

## 2. LLM Integration 2: Google AI Studio / Gemini (Alternative)

- **Purpose:** Secondary/backup provider for server-side JSON query parsing with automated fallback.
- **Provider:** Google DeepMind / Google AI Studio
- **Free Tier Limits:** Free tier: 15 Requests Per Minute (RPM), 1,000,000 Tokens Per Minute (TPM), 1,500 Requests Per Day.
- **Signup URL:** [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)
- **Click-by-Click Steps for User:**
  1. Open [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey).
  2. Sign in with your Google account.
  3. Click **Create API Key** and select a Google Cloud project (or generate a default key).
  4. Copy the generated key.
  5. Add to `.env.local`: `GEMINI_API_KEY=your_key_here`
- **Test Command:**
  ```bash
  curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=%GEMINI_API_KEY%" -H "Content-Type: application/json" -d "{\"contents\":[{\"parts\":[{\"text\":\"ping\"}]}]}"
  ```

---

## 3. Live Rail Lookups: RapidAPI IRCTC (Optional)

- **Purpose:** Real-time PNR lookups and live route-train checks where live verification is requested.
- **Provider:** RapidAPI (e.g. `irctc1` or `indian-railway-irctc`)
- **Free Tier Limits:** Typically 50–100 calls/month free tier on RapidAPI basic subscription.
- **Signup URL:** [https://rapidapi.com/](https://rapidapi.com/)
- **Click-by-Click Steps for User:**
  1. Open [https://rapidapi.com/](https://rapidapi.com/) and log in.
  2. Search for `irctc1` or navigate to an Indian Railway API.
  3. Subscribe to the Basic (Free) tier.
  4. Copy your `X-RapidAPI-Key` from the API console.
  5. Add to `.env.local`: `RAPIDAPI_KEY=your_key_here`
- **Test Command:**
  ```bash
  curl -H "X-RapidAPI-Key: %RAPIDAPI_KEY%" -H "X-RapidAPI-Host: irctc1.p.rapidapi.com" "https://irctc1.p.rapidapi.com/api/v1/searchTrain?query=12951"
  ```
- **Fallback Behavior When Key Absent:** TravelMate strictly adheres to Section 5: displays `TIMETABLE` open dataset schedules, marks live seat status as *"Check on portal"*, and provides official deep links to ConfirmTkt and IRCTC.

---

## 4. Transfer Routing: OpenRouteService (Optional)

- **Purpose:** Exact turn-by-turn road distance and duration between railway junctions and intercity bus terminals.
- **Provider:** OpenRouteService (Heidelberg Institute)
- **Free Tier Limits:** 2,000 directions requests / day completely free.
- **Signup URL:** [https://openrouteservice.org/dev/#/signup](https://openrouteservice.org/dev/#/signup)
- **Click-by-Click Steps for User:**
  1. Register at [openrouteservice.org](https://openrouteservice.org/dev/#/signup).
  2. Verify email and navigate to the Token Dashboard.
  3. Create standard token and copy key.
  4. Add to `.env.local`: `OPENROUTESERVICE_KEY=your_key_here`
- **Test Command:**
  ```bash
  curl "https://api.openrouteservice.org/v2/directions/driving-car?api_key=%OPENROUTESERVICE_KEY%&start=80.35,26.45&end=80.33,26.44"
  ```
- **Fallback Behavior When Key Absent:** Computes road transfer duration using Haversine distance with an urban transit speed factor (25 km/h urban auto/taxi transfer), clearly labeled with an `"approx."` provenance badge.

---

## 5. Deployment Environment Configuration

### In Local `.env.local`:
```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/travelmate"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/travelmate"

# LLM Providers (At least one recommended)
SAMBANOVA_API_KEY=""
GEMINI_API_KEY=""

# Optional Live Providers
RAPIDAPI_KEY=""
OPENROUTESERVICE_KEY=""
```

### In Vercel Project Settings:
Add variables under **Project Settings → Environment Variables** (configured for Preview and Production).
