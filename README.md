# TravelMate AI

## Hackathon project brief

**TravelMate AI is an emergency-aware, multilingual journey assistant for train, flight, and bus travel.** It combines route planning, live third-party provider checks, conversational and voice-assisted planning, Tatkal support, PNR tools, offline readiness, and location-based safety actions in one responsive web application.

The project focuses on a common gap in travel applications: users often need to switch between booking sites, status tools, translation apps, maps, and emergency contacts. TravelMate brings those workflows into a single interface while clearly distinguishing live API data from local examples and demo-only functionality.

## Core problem

Travel planning becomes difficult when users face:

- Multiple transport modes and disconnected provider websites
- Urgent or Tatkal travel requirements
- Language and accessibility barriers
- Weak networks or temporary loss of connectivity
- Safety incidents where location sharing must be fast
- Confusing results that do not clearly identify whether data is live

## Solution

TravelMate provides:

- **Unified journey planner:** Train, flight, and bus planning from one route form
- **AI Smart Assistant:** Natural-language route entry, travel guidance, and planner updates through SambaNova
- **Voice assistance:** Commands such as “tickets from Kochi to Chennai by train” fill the planner; “Tatkal” opens emergency booking mode
- **Live provider checks:** Server-side integrations for train, flight, PNR, seat availability, and optional bus data
- **Tatkal emergency mode:** Live train search plus a separate Tatkal quota availability check when supported by the configured provider
- **Multilingual interface:** English and major Indian languages, with right-to-left support for Urdu
- **Safety mode:** GPS permission setup, emergency contacts, and prepared WhatsApp/SMS messages containing a map link
- **Offline readiness:** Cached application shell and clearly labelled local planning examples
- **Demo booking flow:** Passenger, contact, preference, and payment-type steps without charging money or issuing a real ticket
- **Authentication:** Optional Clerk sign-in for protected features such as sensitive train lookups
- **Responsive design:** Desktop and mobile interfaces with touch-friendly dialogs and controls

## What makes the project different

1. **Honest source labelling** — every result is identified as live API data, local planning data, an estimate, or provider verification required.
2. **Emergency-first planning** — safety sharing and Tatkal workflows are treated as core features rather than add-ons.
3. **Natural interaction** — typed and spoken requests can update the planner without forcing a rigid command format.
4. **Inclusive design** — multilingual content, mobile support, low-network handling, and accessibility-oriented controls are built into the same experience.
5. **Safe demo booking** — the prototype demonstrates a realistic booking journey while refusing to collect card numbers, CVV, UPI PIN, OTP, bank passwords, or identity-document numbers.

## Important prototype limitation

TravelMate does **not** currently sell tickets, reserve seats, collect payment, create a real PNR, or issue a confirmed booking. The booking flow is explicitly marked as a demonstration. Licensed and authorized direct booking integration is planned for a future version. Users must verify live data and complete purchases through an official provider.

## Technology stack

- React 18 and React Router
- Vite and Tailwind CSS
- Vercel Functions for server-side provider access
- SambaNova for the Smart Assistant and dynamic translation
- Clerk for optional authentication
- Leaflet and OpenStreetMap for route visualization
- RapidAPI-based railway services for supported train features
- Aviationstack for supported flight schedule/status checks
- Browser Geolocation, Speech Recognition, IndexedDB, and Service Worker APIs

## Architecture

```text
Browser (React/Vite)
  ├─ Planner, Safety, Saved Plans, Analytics
  ├─ Smart Assistant and Voice Intent Layer
  ├─ Local encrypted document storage
  └─ Service worker / offline application shell

Vercel Functions (/api)
  ├─ SambaNova assistant and translation
  ├─ Flight provider adapter
  ├─ Train search, status, station, seat and PNR adapters
  ├─ Optional bus provider adapter
  └─ Validation, authentication, timeout and rate-limit utilities
```

Provider secrets are read only by server-side functions. Do not expose private credentials through variables beginning with `VITE_`.

## Project structure

```text
api/                 Vercel serverless API handlers
public/              PWA manifest, icons and service worker
src/                 React application source
  auth/              Clerk session integration
  components/        Reusable UI and assistant components
  data/              Static planning and language data
  pages/             Main application screens
  planner/           Normal, Tatkal, PNR and status workflows
  services/          Browser-side API clients
  utils/             Voice intent, safety, storage and scoring logic
tests/               Automated source and behavior tests
scripts/             Project audit script
.env.local.example   Environment-variable template
vercel.json          Vercel routing and function configuration
```

## Local setup

Requirements:

- Node.js 20.19+ or 22.12+
- npm

Run:

```bash
npm ci
copy .env.local.example .env.local
npm run dev
```

On macOS/Linux, use:

```bash
cp .env.local.example .env.local
```

## Validation

```bash
npm run check
```

This runs the source audit, automated tests, and production build.

## Environment variables

Copy `.env.local.example` for the full template. Common variables include:

```text
SAMBANOVA_API_KEY
SAMBANOVA_BASE_URL=https://api.sambanova.ai/v1
SAMBANOVA_ASSISTANT_MODEL=Meta-Llama-3.3-70B-Instruct
SAMBANOVA_TRANSLATION_MODEL=Meta-Llama-3.3-70B-Instruct

VITE_CLERK_PUBLISHABLE_KEY
CLERK_ISSUER_URL
API_REQUIRE_AUTH=true

AVIATIONSTACK_API_KEY
AVIATIONSTACK_BASE_URL=https://api.aviationstack.com/v1

RAPIDAPI_KEY
RAPIDAPI_TRAIN_HOST

RAPIDAPI_PNR_KEY
RAPIDAPI_PNR_HOST
RAPIDAPI_PNR_ENDPOINT
```

Configure private variables in Vercel for both Preview and Production. Never commit real secrets.

## Vercel deployment

```bash
npm ci
npm run check
vercel login
vercel link
vercel --prod --force
```

Choose the existing Vercel project when prompted. Environment-variable updates apply only to newly created deployments.

## Suggested judging demo

1. Allow location access and open Safety Mode.
2. Change the interface language.
3. Say or type: `tickets from Kochi to Chennai by train`.
4. Open Tatkal mode and run the configured live train check.
5. Open Smart Assistant and ask for overnight-train preparation advice.
6. Open a service card and complete the clearly labelled demo-booking flow.
7. Show the source labels that separate live provider data from local examples.

## Privacy and security notes

- API secrets stay in server-side environment variables.
- Sensitive API responses use `Cache-Control: no-store`.
- PNR and seat checks can require authentication.
- Emergency messages are prepared for WhatsApp/SMS; the user must manually tap Send.
- The local document vault uses browser-side encryption, but judges should use sample documents only.
- Public production deployments should add durable rate limiting and provider-specific monitoring.
