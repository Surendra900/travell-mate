# TravelMate — What Is Real vs What Is Demo (Transparency Sheet)

**Document Purpose:** Complete, transparent disclosure of live production data vs simulated demo features per Section 5 and Section 20 of `MASTER_SPEC.md`.

---

## 1. What Is 100% Real & Production-Operational
| Feature Area | Implementation Reality | Source / Technology |
| :--- | :--- | :--- |
| **Top 25 Junction Graph Search** | **REAL** | Real coordinates, timetable stop times, transfer slack matrix, and minimum connection times computed dynamically in memory. |
| **Verified Deep-Link Generation** | **REAL** | Query strings formatted with live origin, destination, and dates pointing directly to live ConfirmTkt, redBus, MakeMyTrip, and Google Flights endpoints. |
| **Emergency Helplines & SOS Dialers** | **REAL** | Live device `tel:112` and `tel:139` carrier protocols coupled with HTML5 Geolocation API coordinate capture. |
| **Offline Digital Boarding Passes** | **REAL** | Local-first Service Worker cache and LocalStorage persistence allowing complete pass rendering and printing without internet. |
| **Tatkal Dual-Window Countdown** | **REAL** | Live synchronisation to Indian Standard Time (IST) clock with milli-second accuracy for 10:00 AM (AC) and 11:00 AM (Non-AC). |
| **Zero-ID Passenger Master List** | **REAL** | Local browser storage and instant IRCTC-format clipboard generation (`Name, Age, Gender, Berth`) with 1-click erasure. |
| **Weather Disruption Advisories** | **REAL** | Live REST API calls to Open-Meteo evaluating real-time hub visibility and precipitation. |
| **Grounded AI Query Parser & Rationale** | **REAL** | Serverless endpoints validating natural language queries via Zod schemas and generating 2-sentence rationale strictly grounded in computed facts. |
| **PWA Installation & Offline Shell** | **REAL** | Web App Manifest, offline service worker, responsive across 390px / 768px / 1440px viewports. |

---

## 2. What Is Algorithmic Estimation (Clearly Labeled `ESTIMATE`)
| Feature Area | Nature of Model | Why It Is An Estimate |
| :--- | :--- | :--- |
| **PNR Confirmation Odds** | **Parametric Heuristic Model** | Indian Railways PRS does not publish real-time chart clearing algorithms. We calculate confirmation odds using historical cancellation velocity, quota class base rates (GNWL vs PQWL vs RLWL), and days to departure. Always badged with `"How we estimate"`. |
| **Delay Tolerance Slack** | **Statistical p85 Distribution** | Uses documented delay distributions across train categories (Vande Bharat p85: 25m, Rajdhani p85: 40m, Superfast p85: 60m) to calculate "Safe up to +X min delay". |
| **Dynamic Fare Estimates** | **Mileage & Class Heuristic** | Computes estimated coach and train fares using distance-based rate curves (₹0.55/km to ₹1.45/km). Final payable fare is displayed on the ticketing partner portal upon deep-linking. |

---

## 3. What Is Labeled Demo Scenario
| Feature Area | Demo Representation | Why Labeled As Demo |
| :--- | :--- | :--- |
| **"See a Demo" Scenario Mode** | Delhi to Howrah Waitlist Bypass scenario with pre-filled waitlisted direct train and Kanpur Junction split alternative. | Labeled with prominent warning banner (`data-testid="demo-mode-banner"`: *"Demo scenario: illustrative availability"*) so judges understand they are seeing an interactive architectural demonstration rather than purchasing a real seat right now. |
