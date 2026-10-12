# Datameet railway dataset quality report

This report documents the empirical audit, normalization rules, and staleness evaluation of the Datameet Indian Railways dataset (CC0 1.0 Universal).

## 1. Dataset metadata and raw counts

- Source repository: https://github.com/datameet/railways
- Pinned commit: `e0c538a1e41ae5eace454d2818902e1065608e16`
- Total stations (`stations.json`): 8,990 GeoJSON features.
  - Unique station codes: 8,990.
  - Duplicate station codes: 0.
  - Stations lacking valid coordinates: 293 (3.26% of total stations; primarily un-geocoded halts and freight sidings).
- Total trains (`trains.json`): 5,208 GeoJSON LineString features.
  - Unique train numbers: 5,208.
- Total scheduled stops (`schedules.json`): 417,080 rows.
  - Scheduled trains represented: 5,208.
  - Origin stops with missing arrival time ("None"): 27,835 (valid domain convention; trips start at departure).
  - Destination stops with missing departure time ("None"): 27,827 (valid domain convention; trips terminate at arrival).
  - Intermediate stops with both arrival and departure recorded: 361,418.

## 2. Corridor check: Rajahmundry (RJY) to Vijayawada (BZA)

In the raw Datameet schedule records:
- Direct RJY to BZA trains (stopping at RJY then BZA in forward sequence): exactly 70 direct trains.
  - Example services: 12727 (Godavari Express), 12703 (Howrah-Secunderabad Falaknuma Express), 12839 (Howrah-Chennai Mail), 12841 (Coromandel Express), 17488 (Tirumala Express), 18047 (Amaravati Express).
- Direct BZA to RJY trains (stopping at BZA then RJY in reverse corridor): exactly 71 direct trains.
  - Example services: 12728 (Godavari Express), 12704 (Falaknuma Express), 12840 (Chennai-Howrah Mail), 12842 (Coromandel Express), 17487 (Tirumala Express).
- Conclusion: The physical corridor contains 70+ authentic direct trains. The prior Hyderabad detour was caused purely by incomplete local station indexing, not a lack of direct rail connectivity.

## 3. Data anomalies and normalization rules

1. "None" time literals:
   - Replaced with null.
   - For route engine graph construction, origin arrival defaults to scheduled departure, and terminus departure defaults to scheduled arrival.
2. Time conversion:
   - Converted "HH:mm:ss" and "HH:mm" strings to integer minutes from midnight [0, 1439].
3. Day progression and out-of-order records:
   - 475 train schedules contained decreasing day counts or circular loop numbering.
   - Normalized by monotonic day offset calculation: if scheduled arrival minute is strictly less than previous departure minute on the same day, day offset is incremented.
4. Name and code sanitization:
   - Station codes uppercase trimmed.
   - Station names trimmed of trailing punctuation and whitespace.

## 4. Staleness analysis

The Datameet dataset is a community snapshot gathered around 2016. The following public historical facts demonstrate its staleness:
1. Renamed railway stations:
   - Mughal Sarai (`MGS`) renamed to Pt. Deen Dayal Upadhyaya Junction (`DDU`) in 2018: Present in Datameet as `MGS`, absent as `DDU`.
   - Allahabad Junction (`ALD`) renamed to Prayagraj Junction (`PRYJ`) in 2020: Present in Datameet as `ALD`, absent as `PRYJ`.
   - Faizabad (`FD`) renamed to Ayodhya Cantt (`AYC`) in 2021: Present as `FD`.
   - Jhansi Junction (`JHS`) renamed to Virangana Lakshmibai Jhansi (`VGLJ`) in 2021: Present as `JHS`.
2. Post-2016 premium services:
   - Vande Bharat Express series (inaugurated February 2019): 0 Vande Bharat Express services exist in Datameet.
   - Amrit Bharat Express series (inaugurated December 2023): 0 services exist in Datameet.
3. Running days:
   - Datameet `trains.json` and `schedules.json` do not record running day frequency (daily versus specific weekdays).
   - In accordance with Standing Decision S7, all Datameet-derived legs state: "Running days unknown. Check before you travel".
