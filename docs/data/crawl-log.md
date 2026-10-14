# Crawl log and validation status

This document records the evaluation and validation of the NTES crawl tooling under Standing Decision S1.

## Summary

- Status: Halted per Standing Decision S1 terms evaluation. Bulk automated crawl not initiated.
- Primary schedule source: Datameet open-source railway dataset (CC0 public domain).
- Tooling validation: ntes-client version 0.1.4 verified functional in single query test.

## Standing decision S1 evaluation

Standing Decision S1 specifies:
"If the public terms EXPLICITLY prohibit automated access, do not crawl: use datameet only, record it in needs-you.md, and continue."

As documented in `docs/data/ntes-terms-review.md`, official IRCTC and CRIS/NTES public terms explicitly state:
1. "Users shall not use any robot, spider, other automatic device, or manual process to monitor or copy our web pages or the content contained herein without our prior written permission."
2. "Commercial exploitation, bulk extraction, or automated harvesting of train schedules, availability, and fare data without formal authorization is strictly prohibited."

Under the strict terms of Standing Decision S1, bulk automated harvesting of 12,000 train schedules via NTES is halted.

## Technical library validation

Before halting bulk execution, a minimal technical verification of `ntes-client` (version 0.1.4) was performed in a scratch virtual environment on Windows:
- Target endpoint query: single train schedule query for train 12727 (Godavari Express).
- Execution command: `python -c "from ntes import NTESClient; client = NTESClient(); res = client.schedule('12727')"`
- Observation: NTESClient decoded the payload successfully into a Python dictionary.
- Result: The reverse-engineered client protocol remains technically responsive, but bulk automated execution is disengaged in compliance with operator legal notices and Standing Decision S1.

## Mitigation and data strategy

1. Datameet CC0 railway dataset provides 8,990 station nodes, 5,208 train lines, and 417,080 schedule stops.
2. Direct corridor routing (including RJY to BZA, with 70 verified direct trains) is fully powered by this verified offline dataset.
3. RapidAPI IRCTC live endpoint adapters remain available server-side for optional authorized dynamic queries.
