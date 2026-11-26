# BuildX 2026 — Official 5-Minute Demo Video Script

**Target Duration:** 4 minutes 45 seconds (allows 15s buffer to stay strictly under the 5:00 limit)  
**Required Structure (Per BuildX Rules 3 & 14):**
1. Team Member Introductions
2. Problem Statement
3. Proposed Solution
4. Technical Implementation & Architecture
5. Live Working Demonstration

---

### Segment 1: Team Introductions (0:00 – 0:30)
**Visual:** All team members on camera (or title screen with names, roles, and college).  
**Voiceover (Speaker 1 - Lead):**
> *"Hello judges, we are Team TravelMate presenting for BuildX 2026. My name is Surendra G, team lead and full-stack architect. With me is Rishitha, co-developer and frontend UI/UX lead who engineered our accessible interfaces and offline traveler pass. We built TravelMate AI during the BuildX 2026 36-hour hackathon to solve India's multimodal transit and waitlist crisis."*

---

### Segment 2: Problem Statement (0:30 – 1:15)
**Visual:** Home screen (`/`) showing the Indian Railways waitlist context.  
**Voiceover (Speaker 2):**
> *"Every single month across India, over 25 million waitlisted train tickets are automatically cancelled. Over 24 million passengers travel daily on Indian Railways, but track saturation leaves major corridors chronically overbooked.*
>
> *Today, railway, aviation, and intercity bus networks operate in complete silos. If your direct train from Patna to Bengaluru is waitlisted at WL 90, rail apps simply say 'no tickets available.' Travelers are left stranded, fall prey to unauthorized ticket touts, or face emergency airfares surging past ₹18,000.*
>
> *When passengers attempt manual connections on their own, they often miscalculate road transit between stations and airports in heavy city traffic, resulting in costly missed flights."*

---

### Segment 3: Proposed Solution (1:15 – 2:00)
**Visual:** Navigating into the search bar, demonstrating corridor chips.  
**Voiceover (Speaker 1):**
> *"To solve this, we built **TravelMate AI** — India’s first autonomous multimodal disruption and route recovery engine.*
>
> *When direct trains are waitlisted, TravelMate's time-expanded graph engine automatically synthesizes verified cross-modal alternatives: Train plus Flight, Train plus Bus, and multi-train split connections.*
>
> *Crucially, we do not just match schedules. We enforce **parametric Minimum Connection Times (MCT)** — including a mandatory 3-hour buffer for rail-to-air transfers — ensuring passengers safely cover city road transit and airport security check-in."*

---

### Segment 4: Technical Implementation & Architecture (2:00 – 2:45)
**Visual:** Displaying Slide 4 (Architecture Diagram) or codebase architecture in IDE.  
**Voiceover (Speaker 2):**
> *"Under the hood, TravelMate is engineered with a modular, resilient serverless architecture:*
>
> *First, our **API Fusion Layer** queries rail timetables and aviation providers in parallel, deduplicating flight records and enforcing search mode purity so train queries are never polluted with buses.*
>
> *Second, we implement **Upstash Redis caching** with custom resilience wrappers (`withTimeout` and `withCache`), ensuring upstream latency spikes never hang the application.*
>
> *Third, our **Haversine Geolocation Engine** performs 50-kilometer radius scans to locate nearby feeder stations and regional airports when direct routes have zero availability.*
>
> *The entire system is empirically verified by our **136-test transport test suite** and over **308 unit and integration tests**, achieving 100% pass rates and zero WCAG 2.1 AA accessibility violations."*

---

### Segment 5: Live Working Demonstration (2:45 – 4:30)
**Visual 5A (2:45 – 3:30):** Live search on `/planner?from=Delhi+(NDLS)&to=Patna+(PNBE)`.
**Voiceover (Speaker 1):**
> *"Let's see the live product. On our home interface, we select the Delhi to Patna corridor. Direct trains are heavily waitlisted. In one click, TravelMate generates verified multimodal options.*
>
> *Here is our signature **Train plus Flight recovery card**: Leg 1 boards the morning Vande Bharat Express at 06:00 AM. Our engine identifies a **3-hour safe connection buffer** at the intermediate junction, allowing ample time for taxi transit to the airport and domestic security clearance before boarding IndiGo flight 6E-6314 to Patna.*
>
> *Every card displays honest data provenance and provides 1-click deep links to official IRCTC and airline portals for unbundled booking."*

**Visual 5B (3:30 – 4:00):** Switching to Emergency Tatkal Desk (`/planner?mode=tatkal`).
**Voiceover (Speaker 2):**
> *"For same-day emergency travel, our **Tatkal Desk** provides real-time millisecond countdown clocks calibrated to official 10:00 AM AC and 11:00 AM Non-AC booking windows, complete with live seat quota availability and station-hopper bypass suggestions."*

**Visual 5C (4:00 – 4:30):** Switching to Passes & Safety Hub (`/safety`), downloading offline boarding pass.
**Voiceover (Speaker 3):**
> *"Because disruptions frequently occur in poor connectivity corridors, our **Safety Mode** generates a zero-network digital boarding pass. It displays the monospace PNR, leg timings, and a high-resolution verifiable QR code that works completely disconnected from the internet.*
>
> *It also provides 1-tap access to Railway Police helpline 139 and emergency GPS dispatch. All passenger data remains strictly on the client's local browser storage in full compliance with India's **DPDP Act 2023**."*

---

### Segment 6: Closing & Call to Action (4:30 – 4:45)
**Visual:** Return to homepage with live URL displayed (`travelmate-ai-flowzint.vercel.app`).  
**Voiceover (Speaker 1):**
> *"TravelMate turns transit cancellations into guaranteed arrival. Our solution is open-source, fully verified, and live on Vercel. Thank you, judges."*
