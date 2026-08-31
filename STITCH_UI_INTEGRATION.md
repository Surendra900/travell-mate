# TravelMate — Stitch UI integration

The UI in this build follows the uploaded Google Stitch screens as the visual source of truth:
- Home / Intelligent Serenity
- Journey Planner
- Provider Results
- AI Assistant
- My Trips

Brand name is TravelMate throughout.

Functional rules preserved:
- Train, Bus and Flight search modes
- No Normal-mode transport comparison
- No Normal-mode live station/train board
- Tatkal is train-only
- No Tatkal return-train option
- No Tatkal backup option
- Automatic low-network/offline fallback
- Full Safety Mode functionality remains available
- Existing provider/API, booking-demo, PNR, voice, translation and storage logic preserved

Validation:
- npm run audit passed
- npm test passed: 49/49

A production Vite build was not run in this environment because dependency installation timed out.
