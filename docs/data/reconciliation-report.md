# Dataset reconciliation report

This document records the rules, precedence order, and conflict resolution strategy between the Datameet railway dataset (CC0, snapshot circa 2016) and railpull NTES extracted data (MIT tooling).

## 1. Reconciliation rules and precedence

1. Precedence order:
   - When railpull data is present: railpull takes precedence for current train schedules, active running days (`runs_days`), and modern service numbers (such as Vande Bharat Express).
   - Baseline and fallback: Datameet provides the comprehensive national station network (8,990 stations) and baseline schedules for trains not returned by railpull discovery.
2. Station identification and alias mapping:
   - Historical station codes in Datameet are resolved to current codes via `shared/data/station_aliases.json`:
     - `MGS` maps to `DDU` (Pt. Deen Dayal Upadhyaya Junction).
     - `ALD` maps to `PRYJ` (Prayagraj Junction).
     - `FD` maps to `AYC` (Ayodhya Cantt).
     - `JHS` maps to `VGLJ` (Virangana Lakshmibai Jhansi).
     - `RJY` maps to Rajahmundry / Rajamahendravaram.
     - `BZA` maps to Vijayawada / Bezawada.
3. Itinerary leg isolation:
   - A single itinerary leg never mixes stop data or timings from both sources.
   - Every leg explicitly displays its provenance source:
     - `Timetable data (community snapshot, about 2016)` for Datameet legs.
     - `Timetable (NTES, fetched <date>)` for railpull legs.
4. Running days conflict resolution:
   - Datameet does not contain running days data. Legs sourced solely from Datameet display: "Running days unknown. Check before you travel".
   - Legs sourced from railpull output with verified `runs_days` filter departures by the user's travel date weekday.

## 2. Delay integration and staleness boundary

- Standing Decision S2 dictates a strict 15-minute time-to-live for live delay observations.
- If a delay snapshot is older than 15 minutes, the interface outputs: "Live delay unavailable".
- The UI never guarantees arrival times or claims zero delay when no fresh observation exists.

## 3. Discovered conflicts and resolutions

| Entity | Datameet Value | Current Official / NTES Value | Resolution Applied |
| :--- | :--- | :--- | :--- |
| Mughal Sarai Station | `MGS` | `DDU` | Alias table maps `MGS` to canonical `DDU` |
| Allahabad Junction | `ALD` | `PRYJ` | Alias table maps `ALD` to canonical `PRYJ` |
| Jhansi Junction | `JHS` | `VGLJ` | Alias table maps `JHS` to canonical `VGLJ` |
| Vande Bharat Services | Absent (0 trains) | Active on major corridors | Documented in staleness analysis; RapidAPI adapter provides live entries |
| Running Days | Unknown | Mon,Wed,Fri or Daily | Explicit disclaimer shown when days are unverified |
