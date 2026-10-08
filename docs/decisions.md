# TravelMate Architectural & Product Decisions

**Document Version:** 1.0 (Master Rebuild)  
**Reference:** [MASTER_SPEC.md](file:///c:/Users/SURENDRA.G/.gemini/antigravity/scratch/travelmate-app/docs/MASTER_SPEC.md)

This log records all authoritative product and architectural decisions made during the rebuild, including supersessions of older specifications.

---

## Decision 001: Supersede 30-Day Prototype with 10-Day Master Rebuild
- **Date:** October 2026
- **Context:** The previous 30-day plan accumulated disparate features (Document Vault, Phrasebook, Blind Voice Gate, Carbon Calculator, Medical SOS) resulting in "Feature Soup" and conflicting user models.
- **Decision:** The Master Specification ([MASTER_SPEC.md](file:///c:/Users/SURENDRA.G/.gemini/antigravity/scratch/travelmate-app/docs/MASTER_SPEC.md)) is the single source of truth. All older roadmaps are superseded.
- **Rationale:** Focus on the core breakthrough: **The Multimodal Disruption and Route Recovery Engine ("Never get stranded")** for Indian transit.

---

## Decision 002: Complete Removal of 7 Non-Core Features
- **Date:** October 2026
- **Context:** Feature Disposition Section 4 of Master Spec requires complete removal of features that dilute product focus or create unnecessary security/legal liabilities.
- **Decision:** Remove the following features completely:
  1. Encrypted Document Vault (`DocumentVault.jsx`) — IDB/WebCrypto passport storage is unrelated to route recovery.
  2. Regional Transit Phrase Cards (`EmergencyPhraseCards.jsx`) — Static dictionary is bloat.
  3. Carbon Footprint Calculator (`CarbonCalculator.jsx`) — Non-essential virtue metric.
  4. Battery & Telemetry Status Strip (`StatusBar.jsx`) — System OS responsibility.
  5. Floating SOS button on Home/Search screens — Reserve for safety drawer only.
  6. Floating generic SambaNova chatbot drawer — Replace with 2 server-side grounded AI uses.
  7. Fake "Demo Booking" or payment modals — Replace with verified provider deep-links.
- **Rationale:** Eliminate user confusion, improve visual hierarchy, and focus judge attention on the multimodal split engine.

---

## Decision 003: Grounded Server-Side AI (No Hallucinations)
- **Date:** October 2026
- **Context:** Floating conversational chatbot wrappers hallucinate train schedules, which technical judges immediately reject.
- **Decision:** Restrict AI to exactly two server-side use cases:
  1. Natural-language query parser (Zod schema: origin, destination, deadline, budget, mode preferences).
  2. 2-sentence route rationale strictly validated against computed facts.
- **Rationale:** Complete reliability and zero fabricated transit data.

---

## Decision 004: Data Honesty & Provenance Badges
- **Date:** October 2026
- **Context:** Travel apps that fabricate fake PNRs or pretend to have live booking without official licenses lose credibility.
- **Decision:** Enforce non-negotiable provenance badges: `LIVE`, `TIMETABLE`, or `ESTIMATE`. No use of "confirmed" or "guaranteed" unless verified at time T. Transparent disclosure that split tickets are independent bookings.
- **Rationale:** High regulatory integrity and judge trust.

---

## Decision 005: Branching & Daily Git Verification
- **Date:** October 2026
- **Context:** Section 18 requires clean daily commits and tags on `rebuild/route-recovery`.
- **Decision:** Baseline tag `baseline-before-rebuild` created. All rebuild work executed on `rebuild/route-recovery`. Daily commits and tags (`day-0`, `day-1`, ..., `day-10`).
