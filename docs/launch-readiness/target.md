# Target Deployment and Environment

## Project Identification
- Repository: TravelMate (Surendra900/travell-mate)
- Working Branch: launch-readiness
- Package Name: travelmate
- Version: 2.5.1
- Runtime: Node.js (Vite + React 18, React Router 6, Tailwind CSS 3.4)
- Vercel Project: travelmate-ai-flowzint
- Vercel Team/Org: team_yGGwY9ULB8ooGq1MREYAooHk (User: surendragedala6-3289)
- Active Production URL: https://travelmate-ai-flowzint.vercel.app
- Local Dev URL: http://127.0.0.1:5173

## Application Routes
1. `/`: Main dashboard and route search entry
2. `/planner`: Multi-modal journey planner and Tatkal assistant
3. `/safety`: Offline emergency guide and SOS hotline directory
4. `/safety/:id`: Specific emergency protocol instructions
5. `/saved`: Persisted itinerary plans and offline tickets
6. `/plans`: Alias route for saved plans
7. `/analyze`: Journey telemetry and disruption analysis
8. `/privacy`: Data handling and privacy compliance notice
9. `/terms`: Terms of service and usage limitations
10. `/disclaimer`: Railway and transit operational disclaimer
11. `*`: Not Found (404) catch-all route (to be added)

## Architecture Overview
- Client: Single-page React application bundled with Vite.
- Serverless API Routes:
  - `/api/assistant.js`: Natural language transit assistant query handler
  - `/api/translate.js`: Multilingual translation relay
  - `/api/voice/transcribe.js`: Speech-to-text audio processor
  - `/api/trains/live-station.js`: Real-time Indian Railways station arrival query
  - `/api/buses/search.js`: Bus route schedule lookup
  - `/api/flights/search.js`: Flight route schedule lookup
  - `/api/recovery.js`: Transit disruption alternate route generator
