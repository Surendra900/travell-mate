# TravelMate Demo Mode Specification

## 1. Principles & Honesty Mandate
In strict accordance with Section 5 of [MASTER_SPEC.md](file:///c:/Users/SURENDRA.G/.gemini/antigravity/scratch/travelmate-app/docs/MASTER_SPEC.md):
- **Never Fake Route Outcomes:** Demo mode runs on the exact same time-expanded timetable graph engine (`server/services/routeEngine.js`) and official datasets (`shared/data/`) as live searches.
- **Honest Visual Distinction:** Whenever demo mode or illustrative data is active, the UI displays a prominent, high-contrast banner:
  > **Demo scenario: illustrative availability** — Route combinations and timings are computed directly from the canonical timetable graph. Seat availability statuses are illustrative for demonstration purposes.
- **No Mixing of Live and Demo Data:** Live API calls and demo scenarios are strictly segmented.

## 2. Default Demonstrable Scenarios
1. **Delhi (NDLS) to Patna (PNBE)**
   * Demonstrates: High-traffic trunk corridor where direct trains (Sampoorna Kranti / Rajdhani) are heavily waitlisted.
   * Recovery Engine: Proposes 1-transfer split route through Kanpur Central (CNB) or Pt. Deen Dayal Upadhyaya (DDU) junction hubs.
   * Multimodal Tiering:
     * Budget: Rail + Rail via CNB
     * Balanced: Fast Train to CNB + Inter-State AC Bus to Patna
     * Fastest: Feeder Rail to Airport + Domestic Flight
2. **Delhi (NDLS) to Mumbai (MMCT)**
   * Demonstrates: Golden Quadrilateral trunk route.
   * Recovery Engine: Proposes split alternatives via Vadodara (BRC) or Kota (KOTA).

## 3. UI Treatment
- Border accent and badge: `border-amber-400 bg-amber-50/80`
- Clear dismiss / exit toggle: Passengers can exit demo mode with 1 tap to enter custom routes.
- Deep links remain authentic: ConfirmTkt, redBus, and Google Flights links route with real pre-filled query parameters.
