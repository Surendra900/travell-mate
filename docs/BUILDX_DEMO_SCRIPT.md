# BuildX 2026 Hackathon — Master 5-Minute Video Pitch Script

**Project Title:** TravelMate AI — Multimodal Transit & Waitlist-Bypass Intelligence Engine  
**Live URL:** [https://travelmate-ai-flowzint.vercel.app/](https://travelmate-ai-flowzint.vercel.app/)  
**Video Pitch (Google Drive):** [https://drive.google.com/file/d/1TWO1Db1cw3mIHdOxiTsa2AfpixrPiexH/view?usp=sharing](https://drive.google.com/file/d/1TWO1Db1cw3mIHdOxiTsa2AfpixrPiexH/view?usp=sharing)  
**GitHub Repository:** [https://github.com/Surendra900/travell-mate](https://github.com/Surendra900/travell-mate)  
**Target Duration:** Exactly 4 minutes 50 seconds (with a 10-second safety margin to stay strictly under the 5:00 limit)  
**Presenters:** 
- **Surendra G** (Team Lead & Full-Stack Architect)
- **Rishitha** (Co-Developer & Frontend / UI-UX Lead)

---

## Pitch Timeline Overview

| Timestamp | Duration | Section | Key Feature Covered | Lead Speaker |
| :--- | :---: | :--- | :--- | :--- |
| **0:00 – 0:35** | 35s | **Team & The Problem Hook** | 25M cancelled waitlists, isolated transit silos | Surendra G |
| **0:35 – 1:20** | 45s | **Website Walkthrough & UI Tour** | Clerk Auth, 14 Indic languages, autocomplete, corridor chips | Rishitha |
| **1:20 – 2:45** | 85s | **Hero Feature: Multimodal Engine** | Train + Flight, 3-hour transfer buffer, Leaflet map, risk meter | Surendra G |
| **2:45 – 3:35** | 50s | **Waitlist-Bypass & Station Hopper** | Quota optimization, split berths, delay contingency simulator | Rishitha |
| **3:35 – 4:20** | 45s | **Emergency Tatkal & Safety Hub** | Millisecond Tatkal timers, offline QR pass, SOS 139/112, DPDP Act | Rishitha |
| **4:20 – 4:50** | 30s | **Architecture, 459 Tests & Closing** | API fusion, Upstash caching, 459 tests passing, production call | Surendra G |

---

## Detailed Scene-by-Scene Director's Script

---

### ACT 1: Team Introduction & The Transit Crisis (0:00 – 0:35)

**On Screen (Visual):**  
- `0:00 – 0:12`: Split camera showing Surendra G and Rishitha, or camera switching to the Title Slide showing project name **TravelMate AI**, team names, BuildX 2026 track, and the live URL badge.
- `0:12 – 0:35`: Cut to screen recording of the live web application ([https://travelmate-ai-flowzint.vercel.app/](https://travelmate-ai-flowzint.vercel.app/)). Slow scroll over the header and hero banner: *"Find a way forward when direct trains are waitlisted"*.

**Speaker: Surendra G (Team Lead & Full-Stack Architect)**  
> *"Hello judges and the BuildX 2026 evaluation panel. We are Team TravelMate. My name is Surendra G, team lead and full-stack architect, and with me is Rishitha, co-developer and frontend lead.*
>
> *Every single month across India, over 25 million waitlisted train tickets are automatically cancelled. Over 24 million passengers rely on Indian Railways every day, but track saturation on high-density corridors leaves millions stranded.*
>
> *Today, Indian transit exists in completely isolated silos. If your direct train from Delhi to Patna is waitlisted at WL 92, rail apps simply say 'Regret: No Seats Available.' They don't know domestic flights exist. Airline apps only show last-minute direct airfares surging past ₹18,000. And when passengers try to piece together connections on their own, they miscalculate road transit between stations and airports in heavy city traffic, resulting in disastrous missed flights.*
>
> *We built **TravelMate AI** during this 36-hour hackathon to eliminate travel dead-ends once and for all."*

---

### ACT 2: Full Website Tour & Global Architecture (0:35 – 1:20)

**On Screen (Visual):**  
- `0:35 – 0:48`: Cursor points to the top navigation bar. Click the **Language Selector** dropdown, showcasing instant real-time translation into Hindi, Telugu, Tamil, Bengali, Marathi, and 9 other Indic languages. Click the **Theme Toggle** (demonstrating WCAG 2.1 AA compliant high-contrast light and dark modes).
- `0:48 – 0:58`: Cursor highlights the **Clerk Authentication** user profile menu in the navbar (`AccountMenu.jsx`), showing seamless user profile state without collecting invasive PII. Point out the **PWA offline status badge** confirming local service-worker readiness.
- `0:58 – 1:20`: Move down to the central search bar. Cursor types `"Delhi (NDLS)"` into the *From* field — show the instantaneous autocomplete combobox with railway station codes, city names, and airport IATA tags. Type `"Patna (PNBE)"` into the *To* field. Click on the Quick Corridor chip `"Delhi → Patna"`. Show the departure date picker enforcing IST constraints (`min={today}`).

**Speaker: Rishitha (Co-Developer & Frontend / UI-UX Lead)**  
> *"Let's explore the live application at `travelmate-ai-flowzint.vercel.app`.*
>
> *Notice our global accessibility and localization layer: with one click, our language engine renders the full interface across **14 Indic languages**, ensuring seamless usability for tier-2 and tier-3 travelers. The UI is built to strict **WCAG 2.1 AA standards**, with zero color-contrast violations and a responsive, high-density layout designed for low-bandwidth mobile connections.*
>
> *In the header, we've integrated **Clerk authentication** for personalized bookmarks while preserving strict privacy. Our station autocomplete engine bridges railway station codes with municipal city names and domestic airport IATA codes.*
>
> *Notice our **Geospatial Feeder Scan**: if a primary station is congested, the Haversine formula automatically evaluates alternate feeder hubs within a 50-kilometer radius — like Anand Vihar, Ghaziabad, or Delhi Airport — so travelers are never locked out of transit options."*

---

### ACT 3: The Hero Feature — Multimodal Route Recovery Engine (1:20 – 2:45)

**On Screen (Visual):**  
- `1:20 – 1:40`: Click the green **"Search Routes"** button (or show auto-trigger navigating smoothly from `/` to `/planner?from=Delhi+(NDLS)&to=Patna+(PNBE)`). The **Live Results Panel** loads with high-speed rendering.
- `1:40 – 2:05`: **Zoom in on the Multimodal Combination Route Card** (`MultimodalTimelineCard.jsx`):
  - Highlight **Leg 1**: Morning Vande Bharat Express (Train #22436) departing New Delhi at 06:00 AM, arriving at Varanasi / Kanpur junction at 14:00 PM.
  - **Crucial Focus:** Hover over the **Parametric Transfer Buffer Badge** in glowing contrast: *"3h 15m Buffer: 45m taxi to airport + 2h domestic security & check-in + 30m safety buffer"*.
  - Highlight **Leg 2**: IndiGo flight (6E-6314) departing to Patna Airport at 17:15 PM, arriving at 18:25 PM.
- `2:05 – 2:25`: Cursor toggles the **Interactive Route Map** (`RouteMap.jsx`). The Leaflet map expands smoothly, drawing:
  1. A solid orange line tracing the railway track corridor.
  2. A dashed connecting marker for city road transfer.
  3. A sweeping blue flight path to the final airport destination.
- `2:25 – 2:45`: Highlight the **Connection Risk Meter** (`TransferRiskBadge.jsx`) showing *"SAFE — 96% Historical Connection Reliability"*. Point out the **Data Provenance Badge** (`ProvenanceBadge.jsx`) displaying `LIVE_PROVIDER_DATA` with time stamps, followed by clicking the **"Book Leg 1 (IRCTC)"** and **"Book Leg 2 (IndiGo)"** deep links opening official booking flows with zero price markups.

**Speaker: Surendra G (Team Lead & Full-Stack Architect)**  
> *"Now, here is the core breakthrough of TravelMate AI — our **Autonomous Multimodal Engine**.*
>
> *When direct train tickets are waitlisted, our graph router doesn't give up. It synthesizes intermodal journeys: **Train plus Flight**, **Train plus Bus**, and **Split-Train connections**.*
>
> *Look at this primary recommendation for Delhi to Patna: Direct trains are waitlisted at WL 92. TravelMate routes the passenger on a fast morning Vande Bharat feeder train from New Delhi to Varanasi. Then, instead of an unreliable tight transfer, our engine mathematically enforces a strict **3-hour Minimum Connection Time buffer**.*
>
> *Why 3 hours? We allocate 45 minutes for road taxi transit between Varanasi junction and the airport, 2 full hours for airline baggage drop and domestic security clearance, plus a 30-minute buffer for train delays. From there, the passenger boards an IndiGo domestic flight directly to Patna.*
>
> *The result? The traveler reaches Patna **14 hours faster** than a delayed train, at a total combined fare of just **₹4,800**, completely bypassing the ₹18,000 emergency direct airfare surge.*
>
> *Our embedded **Leaflet.js route map** renders every leg, transfer node, and flight arc visually. Our **Connection Risk Simulator** analyses upstream delay telemetry to assign an honest safety rating — Safe, Moderate, or Critical. And through our unbundled model, travelers click verified deep links directly into official IRCTC and airline portals with zero intermediary fees."*

---

### ACT 4: Waitlist-Bypass, Station Hopper & Delay Simulator (2:45 – 3:35)

**On Screen (Visual):**  
- `2:45 – 3:05`: Scroll down to the **Waitlist-Bypass Contrast Card** (`WaitlistBypassContrast.jsx` & `StationHopperCard.jsx`).
  - Show the side-by-side comparison: *Direct Booking: WL 84 (No confirmed seat)* vs *Station-Hopper Recommendation: Book from Ghaziabad (GZB) or Kanpur (CNB) with Confirmed Berth in General Quota*.
- `3:05 – 3:20`: Click on the **Delay Contingency Simulator** (`DelayContingencySimulator.jsx`). Drag the delay slider from `0 minutes` to `+45 minutes` and `+75 minutes`.
  - Show the Connection Risk Meter dynamically change in real time from **SAFE (Green)** to **MODERATE (Amber)** to **CRITICAL (Red)**, automatically calculating alternative feeder bus departures if the flight window becomes compromised.
- `3:20 – 3:35`: Show the **Natural Language Query Input** (`NaturalLanguageQueryInput.jsx`) at the top of the planner. Type: *"Need fastest connection to Patna tomorrow under 5000"* and show the results instantly filter to the cheapest compliant intermodal route.

**Speaker: Rishitha (Co-Developer & Frontend / UI-UX Lead)**  
> *"Beyond multimodal transit, TravelMate features intelligent **Waitlist-Bypass & Station-Hopper heuristics**.*
>
> *Indian Railways allocates ticket quotas on a station-by-station basis. When direct berths from Delhi are exhausted, our engine scans upstream and downstream stops. As demonstrated here, booking from the preceding junction unlocks a **confirmed berth** under the remote location quota on the exact same train.*
>
> *Travelers can also test worst-case scenarios using our **Delay Contingency Simulator**: by dialing in hypothetical train delays of 30, 45, or 60 minutes, our probabilistic model immediately recalculates transfer risk and surfaces alternate bus or rail contingencies before the traveler even leaves the house.*
>
> *Users can also query in plain natural language, asking for budget limits or fastest arrival times, and our semantic parser instantly filters verified itineraries."*

---

### ACT 5: Emergency Tatkal Desk & Passes/Safety Hub (3:35 – 4:20)

**On Screen (Visual):**  
- `3:35 – 3:55`: Click the **"Tatkal Desk"** tab on the navigation (`EmergencyTatkalPlanner.jsx` / `TatkalEmergencyTimer.jsx`):
  - Show the live millisecond-precision countdown clocks ticking down to **10:00:00 AM IST** (AC Tatkal Opening) and **11:00:00 AM IST** (Non-AC Tatkal Opening).
  - Highlight the **Passenger Autofill Assistant**: one-click pre-filling of passenger names, ages, and berth preferences to beat the intense 60-second Tatkal rush.
- `3:55 – 4:10`: Navigate to the **Passes & Safety Hub** (`/safety`).
  - Click **"Generate Offline Traveler Pass"** (`OfflineTravelerPassModal.jsx`).
  - A clean, high-contrast modal appears with a high-density, verifiable QR code containing the full itinerary, train and flight numbers, PNR placeholder, and passenger details.
  - Disconnect Wi-Fi (or show low-network banner active): the pass renders flawlessly with **zero network connectivity**.
- `4:10 – 4:20`: Scroll to the bottom of the Safety page:
  - Point to 1-tap SOS emergency buttons for **Railway Protection Force (139)** and **National Emergency (112)**.
  - Click the **"Erase All Local Data"** button under privacy settings, demonstrating instant client-side deletion under India’s **DPDP Act 2023**.

**Speaker: Rishitha (Co-Developer & Frontend / UI-UX Lead)**  
> *"For urgent travel on the day of departure, our **Emergency Tatkal Desk** provides millisecond-calibrated countdown timers synchronized to IRCTC’s 10:00 AM AC and 11:00 AM Sleeper quotas, complete with pre-filled passenger autofill to beat the high-speed booking rush.*
>
> *And when travelers are stranded in low-connectivity rural stations, our **Passes & Safety Hub** generates a standalone **Offline Traveler Pass**.*
>
> *This pass embeds the complete intermodal itinerary into an offline-scannable QR code that works completely disconnected from the internet. It provides immediate 1-tap dispatch to Railway Police helpline 139 and emergency 112 with live GPS coordinates.*
>
> *In strict compliance with India's **DPDP Act 2023**, all passenger data and travel histories remain encrypted locally on the traveler's device. No personal information is stored on our servers, and travelers can purge their records with a single click."*

---

### ACT 6: Architecture, Empirical Verification & Closing (4:20 – 4:50)

**On Screen (Visual):**  
- `4:20 – 4:35`: Cut to terminal window running test suites:
  - Run `npm test` and `node --test tests/transport-upgrade/*.test.mjs`, showing **459 passing tests, 0 failures**.
  - Show Vite production build completing in under 5 seconds with 0 warnings.
- `4:35 – 4:50`: Cut back to the live application on [https://travelmate-ai-flowzint.vercel.app/](https://travelmate-ai-flowzint.vercel.app/).
  - Final full-screen view displaying the production badges, GitHub repository, and live URL.
  - Both team members appear on camera (or voiceover over the live site) smiling and thanking the judges.

**Speaker: Surendra G (Team Lead & Full-Stack Architect)**  
> *"Under the hood, TravelMate is powered by a modern, resilient stack: React 19 on Vite, a serverless API fusion layer with Upstash Redis caching, circuit breakers that prevent upstream API timeouts, and a custom Graph Dijkstra routing algorithm.*
>
> *Our entire platform is backed by **459 automated tests** covering unit calculations, multimodal transfers, WCAG accessibility, and security headers with a **100% pass rate**.*
>
> *TravelMate AI turns guaranteed cancellations into guaranteed arrivals. It is open-source, fully functional, and live right now at **travelmate-ai-flowzint.vercel.app**.*
>
> *Thank you, judges, for your time and consideration."*

---

## Production Recording Checklist for the Team

- [ ] **Microphone Quality:** Ensure crisp audio without background noise or room echo.
- [ ] **Resolution:** Record screen at 1080p (1920x1080) at 60 FPS in full-screen browser mode.
- [ ] **Browser State:** Use a clean browser profile without personal bookmarks or browser extensions.
- [ ] **Pacing:** Speak at a steady, confident pace (~130 words per minute). Don't rush through the transfer buffer explanation — that is your strongest technical differentiator!
- [ ] **Timing Check:** Keep each section within the allocated timestamps to finish cleanly between 4:40 and 4:50.
