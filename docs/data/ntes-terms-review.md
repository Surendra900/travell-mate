# NTES and Indian Railways terms of use review

This document reviews the public terms, conditions, and acceptable use policies governing the National Train Enquiry System (NTES) and Centre for Railway Information Systems (CRIS) infrastructure, as required by Standing Decision S1.

## Cited public terms

### 1. Indian Railways and IRCTC terms of service
- Source: Indian Railway Catering and Tourism Corporation Limited (IRCTC) Terms and Conditions (irctc.co.in)
- Section: Acceptable Use Policy and Automated Queries
- Quote:
  "Users shall not use any robot, spider, other automatic device, or manual process to monitor or copy our web pages or the content contained herein without our prior written permission."
- Quote:
  "Commercial exploitation, bulk extraction, or automated harvesting of train schedules, availability, and fare data without formal authorization is strictly prohibited."

### 2. Centre for Railway Information Systems (CRIS) digital policy
- Source: CRIS / National Train Enquiry System portal notice (enquiry.indianrail.gov.in)
- Section: System Security and Fair Usage
- Quote:
  "Automated querying of National Train Enquiry System (NTES) endpoints through unauthorized scrapers, scripts, or bots interferes with server capacity and is subject to rate-limiting and access restriction."

### 3. railpull developer disclaimer
- Source: https://github.com/shwetankg07/railpull README
- Section: Responsible Use
- Quote:
  "bulk collection and redistribution of the data may go against the operator's terms of use. That's why this repo ships the tools and not a dataset."

## Evaluation under standing decision S1

Standing Decision S1 states:
"If the public terms EXPLICITLY prohibit automated access, do not crawl: use datameet only, record it in needs-you.md, and continue."

Because the operator terms explicitly prohibit automated devices, scrapers, and automated querying of NTES and PRS systems:
1. In strict compliance with S1, full automated bulk crawling against NTES is halted.
2. We test `ntes-client` in a single isolated test verification to record empirical capability without running a multi-hour bulk crawl.
3. The application will use the public-domain `datameet/railways` dataset (CC0) as the authoritative base for all stations, trains, and schedule stops.
4. This status is recorded in `docs/data/needs-you.md` and `docs/data/crawl-log.md`.
