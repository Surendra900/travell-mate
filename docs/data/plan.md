# Autonomous execution plan: real rail data and Gemini fix

## Objective
Integrate real Indian railway datasets from datameet and railpull, replace synthetic or mock routing with an authentic database-backed time-expanded timetable graph, eliminate false detours (such as RJY to BZA via Hyderabad), ensure honest data provenance, and diagnose and resolve the Gemini API key integration.

## Roadmap of phases

### Phase 0: Reconnaissance and bug reproduction
1. Inspect workspace structure, database setup, Prisma schema, API routes, and existing routing algorithms.
2. Clone `datameet/railways` and `shwetankg07/railpull` into a temporary directory outside the repository and record commit hashes.
3. Perform bug reproduction: capture API responses and screenshots for RJY to BZA and BZA to RJY into `docs/data/evidence/before/`.
4. Document root causes and write `docs/data/current-state.md` and `docs/data/data-sources.md`.
5. Perform quick Gemini key reconnaissance (model name, env var location).
6. Perform NTES terms of use review as a standard reader and write `docs/data/ntes-terms-review.md`.

### Phase 1: Data model and storage architecture
1. Create or extend Prisma schema with tables: Station, StationAlias, Train, TrainStop, TrainRunDay, DelaySnapshot, DatasetVersion.
2. Ensure appropriate indexing on station codes, train numbers, and time fields.
3. Support local SQLite or PostgreSQL database with additive migrations.

### Phase 2: Datameet CC0 dataset import
1. Implement idempotent ETL importer script `data/etl/import-datameet.mjs`.
2. Normalize stations, trains, and schedules (handle nulls, day crossings, station renames like DDU and PRYJ).
3. Produce `docs/data/datameet-quality-report.md`.
4. Build station alias table and fuzzy search index.

### Phase 3: Route engine overhaul on authentic data
1. Construct in-memory time-expanded graph index from database stops.
2. Implement direct train precedence: direct routes appear first.
3. Apply S8 detour ratio limit (under 1.35x direct distance) to reject backward or illogical connections.
4. Implement connection rules: minimum 45 minutes connection buffer, risk categories (Safe, Moderate, Tight).
5. Enforce transparent provenance badges and data age disclosures.
6. Write comprehensive test suite for router rules.

### Phase 4: Railpull integration and reconciliation
1. If permitted by S1 terms review: run small validation test with `ntes-client`.
2. If validated: run background crawl with progress logging in `docs/data/crawl-log.md`. If blocked or prohibited: record evidence and proceed with datameet.
3. Add railpull importer script `data/etl/import-railpull.mjs`.
4. Reconcile both sources: map aliases, prefer railpull for active schedules, retain datameet for full station network.
5. Write `docs/data/reconciliation-report.md`.
6. Implement delay provider adapter with 15-minute TTL.

### Phase 5: Gemini API key diagnosis and resolution
1. Audit Gemini invocation code: verify server-side usage, model identifier, and environment variable names.
2. Execute diagnostic requests against Google Gemini API without logging secrets.
3. Identify root cause: expired or revoked key, invalid model string, or missing permissions.
4. Refactor LLM adapter to support dual-provider architecture (Gemini and SambaNova fallback) with structured outputs.
5. Provide diagnostic CLI `scripts/check-gemini.mjs` and health endpoint `/api/health/llm`.
6. Document findings in `docs/data/gemini-diagnosis.md`.

### Phase 6: UI honesty, provenance, and legal copy
1. Update UI components to display timetable dataset age, provenance badges, and delay statuses.
2. Ensure zero mock or synthetic fallback claims.
3. Verify accessibility and design compliance (no em dashes, no emoji).

### Phase 7: Verification and corridor test battery
1. Execute corridor test battery across 12 designated station pairs including RJY-BZA, BZA-RJY, and renamed hubs.
2. Run automated test suite and launch readiness scanner.
3. Capture evidence into `docs/data/evidence/after/`.
4. Verify idempotency by running ETL twice.

### Phase 8: Deployment and documentation
1. Check Vercel authorization.
2. Deploy Preview and verify HTTP 200 without login walls.
3. Produce complete final report.
