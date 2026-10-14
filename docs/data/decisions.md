# Standing decisions log

This document tracks all standing decisions applied during the integration of authentic railway data and Gemini diagnosis.

## Decision log

1. S1: NTES terms review and crawl approval protocol
   - Reviewed operator terms as standard reader prior to any crawl execution.
   - Guarded execution with rate limits, single background worker, and immediate stop on blocking signals.

2. S2: Single delay snapshot
   - Delay poller execution restricted to single verification snapshot.
   - Workflow dispatch scheduled action provided disabled by default.

3. S3: OpenStreetMap geocoding evaluation
   - Coordinate coverage evaluated against station stop requirements. Datameet coordinates prioritized.

4. S4: Database migration approach
   - Additive schema migrations applied without destructive drop statements.

5. S5: Deployment target
   - Vercel preview deployment verification followed by production verification.

6. S6: Gemini credential handling
   - Keys handled server-side only without logging, printing, or client exposure.

7. S7: Data age transparency
   - Transparent UI disclosure of timetable age and dataset provenance.

8. S8: Detour ratio bounding
   - Transfer itineraries bounded to 1.35x maximum detour ratio relative to direct distance.

9. S9: ETL data acquisition
   - Static datasets retrieved from pinned commit with recorded checksums.

10. S10: Structure compliance
    - Architecture adheres to MASTER_SPEC.md standards.
