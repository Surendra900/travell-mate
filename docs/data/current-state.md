# Current state audit

This document records the architectural baseline of TravelMate prior to the integration of authentic railway data and the Gemini API diagnosis.

## 1. Application stack and repository layout

- Framework: React 18 with Vite 8.1.4 and React Router 6.30.
- Serverless API layer: Vercel serverless functions in `api/` directory (Node.js ESM).
- Server services: `server/services/` for routing (`routeEngine.js`), contingency simulations (`contingencyEngine.js`), and LLM provider abstractions (`server/adapters/aiProvider.js`).
- Database configuration:
  - `docker-compose.yml` configures a local Postgres 16 container (`travelmate-postgres`).
  - Production database target: Neon serverless Postgres referenced via `DATABASE_URL` and `DIRECT_URL`.
  - Static transit cache: JSON files in `shared/data/` (`stations.json`, `junctions.json`, `terminals.json`, `airports.json`, `trains.json`, `stops.json`, `transfer_guides.json`, `manifest.json`).
- Frontend transit state: `src/data/transportData.js` and `src/utils/multimodalRouter.js`.

## 2. Existing data representation

Prior to this work:
- `shared/data/stations.json` contained only 59 handpicked major stations across India.
- Secondary stations such as Rajahmundry (`RJY`), Samalkot (`SLO`), Kakinada Town (`CCT`), and Eluru (`EE`) were absent from `stations.json`.
- `shared/data/trains.json` contained only 32 expanded trains.
- `shared/data/stops.json` contained 288 stops across those 32 trains.

## 3. Root cause of the Rajahmundry (RJY) to Vijayawada (BZA) bug

When a user queried Rajahmundry (`RJY`) to Vijayawada (`BZA`):
1. In `src/utils/multimodalRouter.js` and `server/services/routeEngine.js`, `findTransportPlace("rjy")` and `resolveStationCode("rjy")` failed to match `RJY` in `stations.json`.
2. Because `RJY` had no direct train entries in the 32-train schedule, the system attempted to find connecting journeys.
3. The routing engine relied on a hardcoded list of 25 hubs (`junctions.json`), which included `HYB` (Hyderabad Deccan) and `SC` (Secunderabad).
4. The router evaluated connections via Hyderabad, producing an itinerary:
   - Leg 1: Rajahmundry to Hyderabad (~500 km)
   - Leg 2: Hyderabad to Vijayawada (~350 km)
   - Total travel distance: ~850 km versus the direct railway distance of ~150 km.
5. In reality, both stations sit directly on the Howrah-Chennai main line with 70 direct trains running in the correct sequence.

## 4. Environment and secrets audit

- Local `.env.local` contains placeholder values for several keys (`GEMINI_API_KEY=[SENSITIVE-...]`, length 13).
- Vercel production deployment contains `GEMINI_API_KEY` scoped to Production only, while Preview lacks the variable.
- Code in `server/adapters/aiProvider.js` calls `gemini-1.5-flash` via REST without client-side exposure.
