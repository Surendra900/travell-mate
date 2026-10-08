# TravelMate Feature Changelog

**Document Version:** 1.0 (Master Rebuild)  
**Reference:** Section 4 & 16 of [MASTER_SPEC.md](file:///c:/Users/SURENDRA.G/.gemini/antigravity/scratch/travelmate-app/docs/MASTER_SPEC.md)

---

## Day 0: Baseline & Rebuild Audit

### Features Scheduled for Immediate Complete Removal (Day 1):
1. **Encrypted Document Vault (`DocumentVault.jsx`)**
   - *Reason:* Browser IndexedDB/WebCrypto identity document storage is a security liability and completely outside the scope of multimodal route recovery.
2. **Regional Transit Phrase Cards (`EmergencyPhraseCards.jsx`)**
   - *Reason:* Static phrasebook is unrelated clutter.
3. **Carbon Footprint Calculator (`CarbonCalculator.jsx`)**
   - *Reason:* Non-essential virtue metric that distracts from the core route recovery problem.
4. **Battery & Telemetry Status Strip (`StatusBar.jsx`)**
   - *Reason:* Unnecessary visual noise; device battery is an operating system concern.
5. **Floating SOS Button on Hero & Search**
   - *Reason:* Clutters primary search CTA. Helplines belong strictly inside the Passes & Safety drawer.
6. **Floating Generic Chatbot Drawer**
   - *Reason:* Generic LLM chat wrappers hallucinate schedules; replacing with 2 server-side grounded AI endpoints.
7. **Fake "Demo Booking" & Payment Modal**
   - *Reason:* Misleading to users and hackathon judges; replacing with official verified deep-links.

### Features Slated for Core Upgrade (P0 & P1):
1. **Multimodal Split Router:** Transitioning from synthetic haversine departure times to a real timetable graph.
2. **Connection Risk & Delay Simulator:** Upgrading to a documented parametric model with an inline delay slider.
3. **Official Deep Links:** Direct pre-filled links to ConfirmTkt, RedBus, and Google Flights.
4. **Tatkal Desk:** Preserving dual-window IST synchronization with local-only passenger auto-fill.
5. **Interactive Route Map:** Upgrading Leaflet topology with transfer guidance.
