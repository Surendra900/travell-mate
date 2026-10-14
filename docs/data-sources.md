# TravelMate Open Data Sources & Attribution

**Document Version:** 1.0 (Master Rebuild)  
**Reference:** Section 6 of [MASTER_SPEC.md](file:///c:/Users/SURENDRA.G/.gemini/antigravity/scratch/travelmate-app/docs/MASTER_SPEC.md)

This document tracks all open-source datasets, schemas, licenses, dates of acquisition, and legal attribution requirements used to power the TravelMate Route Recovery Engine.

---

## 1. Verified Data Sources

| Domain | Dataset & Source | License | Freshness Date | Attribution Requirement |
| :--- | :--- | :--- | :--- | :--- |
| **Indian Railways Stations & Junctions** | Indian Railways Station Codes & Geo Coordinates (`data.gov.in` / National Data Sharing and Accessibility Policy) | Government Open Data License (GODL-India) / Open Data | October 2026 | "Source: Government of India open data platform (data.gov.in)" |
| **Railway Schedules & Timetables** | Indian Railways Open Train Schedule Dataset (Open GTFS / Railway Data Commons) | Open Database License (ODbL) / Public Domain | October 2026 | "Timetable data as of October 2026. Verify live availability on IRCTC." |
| **Airports & IATA Hubs** | OurAirports Open Database (`ourairports.com/data/`) | Public Domain (Creative Commons Zero / CC0) | October 2026 | "Airport data courtesy of OurAirports (Public Domain)" |
| **Bus Terminals & Stations** | OpenStreetMap (OSM) Transit Nodes (Overpass API / tag `amenity=bus_station`) | Open Database License (ODbL) 1.0 | October 2026 | "© OpenStreetMap contributors (ODbL)" |
| **Weather Disruption Radar** | Open-Meteo Weather Forecast API (`open-meteo.com`) | Creative Commons Attribution 4.0 International (CC BY 4.0) | Live / Real-Time | "Weather data by Open-Meteo.com under CC BY 4.0" |
| **Base Maps & Cartography** | OpenStreetMap / CartoDB Positron Vector & Raster Tiles | OpenStreetMap contributors / CartoDB | Live / Real-Time | "Map tiles © OpenStreetMap, © CARTO" |

---

## 2. Top 25 High-Traffic Junction Corridors

The Route Recovery Engine prioritizes the top 25 transit transfer hubs across Indian trunk corridors:

1. **New Delhi (NDLS / DLI / NZM)** — Northern Trunk Hub
2. **Kanpur Central (CNB)** — High-frequency Northern/Eastern split junction
3. **Pt. Deen Dayal Upadhyaya / Mughalsarai (DDU)** — Grand Chord Rail/Bus junction
4. **Patna Junction (PNBE)** — Eastern corridor hub
5. **Howrah / Sealdah (HWH / SDAH / Kolkata)** — Eastern terminus hub
6. **Jaipur Junction (JP)** — Western / North-Western junction connecting rail to Rajasthan bus networks
7. **Ahmedabad Junction (ADI)** — Western commercial junction
8. **Bhopal Junction / Rani Kamlapati (BPL / RKMP)** — Central Indian trunk junction
9. **Itarsi Junction (ET)** — Key North-South / East-West railway crossroad
10. **Nagpur Junction (NGP)** — Geographical center of India; premier North-South rail/road junction
11. **Jhansi Junction / Virangana Lakshmibai (VGLJ)** — Central corridor connector
12. **Gwalior Junction (GWL)** — Northern-Central corridor feeder
13. **Prayagraj / Allahabad (PRYJ)** — Northern rail/road interchange
14. **Varanasi Junction (BSB)** — Eastern cultural & transit hub
15. **Gorakhpur Junction (GKP)** — North-Eastern rail terminal & Nepal transit junction
16. **Kharagpur Junction (KGP)** — South-Eastern trunk connector
17. **Vijayawada Junction (BZA)** — Major South-Eastern rail junction
18. **Visakhapatnam (VSKP)** — Coastal trunk hub
19. **Secunderabad / Hyderabad (SC / HYB)** — Deccan plateau transit interchange
20. **Guntakal Junction (GTL)** — Key South-Central junction
21. **Bengaluru City / Yesvantpur (SBC / YPR)** — Southern tech corridor hub
22. **Katpadi Junction (KPD)** — Southern rail/road feeder to Vellore/Chennai/Bengaluru
23. **Chennai Central (MAS / MS)** — Southern coastal terminus
24. **Pune Junction (PUNE)** — Western express rail/bus hub
25. **Mumbai Central / CSMT (MMCT / CSMT)** — Western financial capital terminus

---

## 3. UI Attribution Implementation

In accordance with Section 6, the TravelMate application footer and journey results view will consistently display:
> *"Timetable data as of October 2026. Map data © OpenStreetMap contributors. Weather data by Open-Meteo."*
