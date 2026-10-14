# Data sources inventory

This document defines the licenses, contents, freshness, acquisition methods, and required attributions for all transit and geographical datasets used by TravelMate.

## 1. Datameet railways

- Repository: https://github.com/datameet/railways
- Pinned commit: `e0c538a1e41ae5eace454d2818902e1065608e16`
- License: Creative Commons Zero 1.0 Universal (CC0 1.0, Public Domain Dedication).
- Contents:
  - `stations.json`: 8,990 railway stations across India with names, station codes, states, railway zones, and geographical coordinates.
  - `trains.json`: 5,208 train services with train numbers, names, service types, origin and destination codes, scheduled departure and arrival times, and class configurations.
  - `schedules.json`: 417,080 stop records mapping each train's full itinerary, sequence numbers, arrival/departure times, and day offsets.
- Freshness: Community snapshot gathered around 2016. Does not contain post-2016 additions such as Vande Bharat services or renamed stations (e.g. Mughal Sarai renamed to Pt. Deen Dayal Upadhyaya Junction, Allahabad renamed to Prayagraj Junction).
- Acquisition method: Downloaded from pinned commit via ETL pipeline `data/etl/import-datameet.mjs`.
- Attribution text:
  "Railway network and timetable data derived from the Datameet Indian Railways dataset (CC0 1.0 Universal Public Domain Dedication, community snapshot circa 2016)."

## 2. railpull (NTES enquiry crawler)

- Repository: https://github.com/shwetankg07/railpull
- Pinned commit: `9e11693d1f11a49fa56100c743239731def30311`
- License: MIT License (tools and scripts). Reverse-engineered `ntes-client` package is also under open-source software license.
- Contents:
  - Tooling to crawl the National Train Enquiry System (NTES) for schedules, running days, and live delays.
  - Generates `trains.csv`, `stops.csv`, `stations.csv`, and `delays.json`.
- Legal and usage status:
  - Evaluated under Standing Decision S1 in `docs/data/ntes-terms-review.md`.
  - Operator terms explicitly prohibit automated robots and scraping without formal written permission.
  - Full automated crawl is halted per Standing Decision S1. Library functionality verified via isolated single-query check.
- Attribution text:
  "NTES integration tools licensed under the MIT License by Shwetank Gautam."

## 3. OpenStreetMap (Geographical and route tracks)

- Source: OpenStreetMap contributors (via Geofabrik India extract).
- License: Open Database License (ODbL) 1.0.
- Usage policy under Standing Decision S3:
  - Datameet provides coordinates for 8,697 out of 8,990 stations (96.7% coverage).
  - Stations with timetable stops have full coordinate coverage in the active network.
  - Route tracks are out of scope. External OSM bulk extraction skipped under S3.
- Attribution text:
  "Base map and station geodata © OpenStreetMap contributors under ODbL."

## 4. RapidAPI IRCTC (Live endpoint adapter)

- Providers: `irctc-train-api.p.rapidapi.com` and `irctc-indian-railway-pnr-status.p.rapidapi.com`.
- License: Commercial API access per provider subscription terms.
- Contents: Real-time train route discovery, live PNR status, and running schedules.
- Provenance badge: "Live provider verification required" / "Official transit provider".
