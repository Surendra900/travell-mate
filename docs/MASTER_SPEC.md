MASTER SPEC: REBUILD "TRAVELMATE" AS A PROFESSIONAL ROUTE-RECOVERY PRODUCT

FIRST ACTION: save this entire prompt verbatim to docs/MASTER_SPEC.md in the repository. It is the single source of truth. Re-read it at the start of every day and after any interruption. If it conflicts with older plans (including the earlier 30-day plan), this spec wins. Any deviation must be recorded with a reason in docs/decisions.md.

1. ROLE AND MISSION
You are a principal product designer, senior full-stack engineer and QA lead working autonomously in my EXISTING TravelMate repository (no separate demo project). Rebuild TravelMate from scratch (new beginner-friendly information architecture, new design system, new clean layered architecture, new UI) into a professional, fully working, deployed product, while PORTING every working capability and logic that this spec keeps. Think like a startup CTO preparing a hackathon final and investor demo. Take as much time as needed. Do not ask unnecessary questions: make sensible decisions, record them, and ask only when truly blocked (batch API-key requests into one list). Do not claim anything you did not run and observe yourself.

2. PRECEDENCE RULES
a. "From scratch" means new structure, new UI, new components. It does NOT mean losing working behavior. Before touching any existing engine (multimodalRouter, contingencyEngine, transportData, Tatkal planner, route map), write characterization tests that lock its current behavior, then port it. Delete old code only after the new version passes its tests.
b. Product positioning in section 3 overrides any older branding such as "Emergency Travel Assistant".
c. The honesty rules in section 5 override demo convenience.
d. Beginner clarity beats feature count. Fewer options, better hierarchy.
e. Where the design brief says "preserve", read: preserve behavior and capability, not file structure.

3. PRODUCT DEFINITION
Name: TravelMate. Identity: the Multimodal Disruption and Route Recovery Engine ("never get stranded").
One-line value: "When direct tickets are waitlisted or cancelled, TravelMate finds alternative multimodal routes through regional junctions, checks the transfer risk, and opens the official booking sites pre-filled."
Core problem: the "waitlist wall" and siloed transport operators (rail, bus, air). The traveler manually checks several apps and guesses whether a connection is safe.
Primary users: stranded inter-city commuters and students (20 to 34), and urgent business or freelance travelers.
NOT targeted: leisure holiday planners, corporate-desk bookers, medical or disaster crisis victims.
TravelMate is a discovery, optimization and preparation layer. It does NOT sell tickets, take payments or issue PNRs.

4. FEATURE DISPOSITION (execute exactly; log every item in docs/changelog-features.md with the reason)
REMOVE COMPLETELY (delete components, routes, state, dependencies that become unused, tests, copy, and any database tables; then grep to prove no references remain):
- Encrypted Document Vault (DocumentVault.jsx, IndexedDB and Web Crypto vault code)
- Regional Transit Phrase Cards (EmergencyPhraseCards.jsx)
- Carbon Footprint Calculator (CarbonCalculator.jsx)
- Battery and Telemetry Status Strip (StatusBar.jsx)
- Floating SOS button on the home and search screens
- The floating generic chatbot drawer (replaced by the two grounded AI uses in section 7)
- Medical, CPR, police-crisis or ambulance-dispatch content and framing
- Fake "Demo Booking" or payment modals (replaced by official deep-link buttons)
- Any other low-value, duplicate or placeholder UI found in the Day 0 audit (list each with a reason)
KEEP AND UPGRADE:
- Multimodal Split Router (P0): replace synthesized departure times with a real timetable graph (section 6)
- Connection Risk and Delay Simulator (P0): upgrade per section 6
- Official deep links with pre-filled parameters (P0)
- Interactive route map (Leaflet): origin, hub nodes, destination, transfer points
- Tatkal Desk (P1): dual-window IST countdown (10:00 AM and 11:00 AM windows, verify current rules) and a passenger master list with one-click clipboard copy. Local device only, minimal fields (name, age, gender, berth preference), NEVER ID numbers, with a clear-data button. Assistive only: no automated booking, no captcha solving, nothing against IRCTC terms.
- Direct single-mode search (P1) with provider fallback and honest degraded states
- Offline boarding pass and trip pack (P1), local-first, working in an installable PWA
- PNR status (P2): simplified; link or provider lookup plus a clearly labeled estimate
- Transit Safety drawer (P2): one-tap 112 and 139 (RailMadad) helplines and live GPS pin sharing by explicit user action, placed inside "Passes and Safety", not on the home hero
- Weather disruption (P2): contextual only (for example a fog or rain warning along the chosen route), via Open-Meteo
ADD:
- Corridor Junction Directory: top 25 high-traffic transfer junctions chosen from real corridor data (audit examples to verify and include if justified: Mughalsarai / Pt. Deen Dayal Upadhyaya, Itarsi, Kharagpur, Jhansi, Katpadi, Guntakal, Kanpur Central, Jaipur)
- Realistic timetable matching from an open dataset (section 6)
- Station-to-terminal transfer intelligence (distance and time via a routing API, plain steps, "approx." labels)
- "Waitlist Bypass" visual contrast: left side the direct train with its status, right side the split-route alternative
- Connection risk visualization, "Safe up to +X min delay" indicator, "If Leg 1 runs late" contingency panel and missed-connection plan
- "Why this junction" explanation per route
- "See a demo" scenario button (honest, section 5)
- Provenance badges on every leg (section 5)
- Plain-language onboarding, glossary tooltips, trust and legal pages, feedback widget, privacy-friendly analytics, error monitoring

5. DATA HONESTY AND PROVENANCE (non-negotiable)
- Every leg and price shows a provenance badge: LIVE (from a provider at time T), TIMETABLE (official or open dataset, with its date), or ESTIMATE (computed). Show an exact departure time ONLY for LIVE or TIMETABLE. For ESTIMATE show a range, such as "Buses usually depart every 30 to 60 min. Check the portal."
- Show seat status (AVL, RAC, WL, REGRET) ONLY when a live provider returned it; otherwise show "Check live availability" with a deep link. Never display the words "confirmed" or "guaranteed" for an itinerary, unless every leg returned available at the last check, and then say "Available at last check (time)".
- Replace any "94% on-time" style number with "Estimated connection reliability" plus a "How we estimate" tooltip. The number must come from a documented model, never from a constant.
- Fares and prices are labeled "Estimate: verify on portal".
- DEMO SCENARIO: a visible banner "Demo scenario: illustrative availability" and a distinct visual treatment. It uses the same engine and the same timetable data. No hardcoded route outcomes. Only availability statuses may be sample values. Never mix demo and live results. Document in docs/demo-mode.md.
- Disclosure everywhere a split route appears: "These are independent bookings. If one leg is delayed, other operators owe you nothing and TravelMate cannot guarantee refunds or compensation."
- Market statistics in the UI or pitch (for example passenger counts, commission ranges) must have a verified source link, or be phrased qualitatively. The audit's numbers are unverified.
- If a provider is down, show an honest degraded state, not fake data.

6. THE ROUTE RECOVERY ENGINE
- Data: build a station, train, stop-time, junction, bus terminal and airport dataset from open sources (research and verify licence and freshness, for example data.gov.in, GitHub railway datasets, OurAirports, OpenStreetMap). Record every source, licence, date and attribution in docs/data-sources.md. Show "Timetable data as of <date>" in the UI footer.
- Graph: a time-expanded timetable graph. Search order: direct options first, then 1-transfer itineraries through junction hubs (optional 2-transfer behind a setting). The haversine corridor filter may prune candidates but may NEVER be the source of times.
- Ranking: three tiers, Budget (cheapest, rail to rail), Balanced (fast train plus AC bus), Fastest (train plus flight). Use user inputs: deadline, budget, mode preferences.
- Minimum connection times (one config file, tested): rail to rail, same station: at least 45 min; train to bus across town: at least 105 min; train to airport: at least 210 min; apply the reverse for the other direction. Avoid arrival transfers between 23:00 and 05:00 unless the user allows them, and warn.
- Risk labels on every transfer: Safe (120 min or more), Moderate (90 to 119), Tight (60 to 89), High risk (under 60, excluded by default, shown only if the user opts in, with a warning).
- Reliability estimate: a documented parametric model (delay distribution by train category, with assumptions shown). Use real delay data if a licensed open dataset exists. Display "Safe up to +X min delay on Leg 1".
- Delay Simulator: an inline tab "If Leg 1 runs late" with a slider. It recomputes slack, the risk label and the contingency plan: next 3 viable departures at the hub, the last viable departure, and the "point of no return". If a live running-status provider is available, offer to prefill the delay.
- Transfer guidance: distance and time between station and terminal or airport via a routing service, with plain steps and "approx." labels. Cost figures only from a documented formula labeled as an estimate, otherwise omit them.
- Deep links: verify every ConfirmTkt, redBus and Google Flights link format by testing it. Pre-fill what the provider supports, and otherwise copy a trip summary to the clipboard. Never invent affiliate IDs.
- Quality: search p95 under 2 seconds when warm. Unit and property tests: no itinerary violates a minimum connection time, times are chronological, arrival meets the deadline, no negative durations. Include fixture corridors that the data supports (for example Delhi to Patna, Delhi to Mumbai, Hyderabad to Bengaluru).

7. AI (ONLY TWO USES, both server-side)
a. Natural-language query to structured JSON (zod schema: origin, destination, date or deadline, budget, mode preferences, passengers). The UI shows "I understood: ..." with editable chips; on failure fall back to the form.
b. Route rationale: 2 sentences per route generated ONLY from computed facts passed in. A validator rejects any place, number or train not in the input and falls back to a template.
Provider interface with SambaNova as primary and Google Gemini as an alternative, configurable by env var with automatic fallback. Never let the model invent train numbers, times or availability. No chat drawer.

8. INFORMATION ARCHITECTURE (beginner-friendly)
Navbar (4 items at most): Route Finder, Tatkal Desk, Passes and Safety, plus a "See a demo" button. Footer: About, Privacy, Terms, Disclaimer, Contact.
Screens: Home (hero, one search box, how it works in 3 steps, honesty and trust strip), Results (direct versus split contrast, tier cards, timeline, risk badges, simulator tab, transfer guide, booking buttons), Route detail with map, Tatkal Desk, Passes and Safety, legal pages.
Rules: no login for core flows; saved trips and passes stay local. Plain language and a glossary tooltip for WL, RAC, PNR, Tatkal, junction. At most 5 to 7 choices per screen, and advanced options behind "More options". Sensible defaults, helpful examples, and error messages that say what to do next. A skippable first-run hint. Search must take at most 3 interactions, and result to booking at most 2.
Accessibility: voice input (Web Speech API) in the search box and a "Read results aloud" button, reachable from an Accessibility menu. The old full-screen blocking "Are you blind?" gate is removed. Full keyboard and screen-reader support.
Urgent mode: "Need to travel tonight?" is a preset on the search form (departures within 12 hours). Do not use medical-emergency visuals or the word "Emergency" for route search.

9. UI/UX DESIGN SPECIFICATION (authoritative for all visual work)
U1 The result must feel like a serious travel product comparable in usability and polish to ConfirmTkt, ixigo and MakeMyTrip. Use them only as UX inspiration: never copy their branding, layouts, copyrighted assets or identity. TravelMate has its own identity communicating trust, safety, speed, simplicity and reliability. A first-time user must know within seconds: where am I, what does TravelMate do, how do I search, what do I do if my direct route is unavailable, and how does the urgent mode work. It must look like a real startup product, NOT a college project, an AI-generated template, a generic dashboard or an animation demo.
U2 Design system FIRST. Semantic colors: Primary, Primary hover, Background, Surface, Surface elevated, Text primary, Text secondary, Border, Success, Warning, Error, Urgent/Safety. Strong contrast, no excessive gradients, no random colors. Typography: a clean modern sans-serif with a fixed scale (Display, H1, H2, H3, Body, Small, Caption, Button). A consistent spacing scale. Central design tokens.
U3 Reusable components: Button, IconButton, Card, Badge, Input, Select, SearchBox, Tabs, Modal, Drawer, Alert, Toast, Loading state, Empty state, Error state, Skeleton, Navigation, Footer, JourneyCard, TransportModeSelector, RouteTimeline, RiskBadge, ProvenanceBadge.
U4 Libraries: Tailwind CSS, shadcn/ui and Lucide icons (Lucide only, no emojis or mixed icon sets). Selected patterns from Magic UI, Aceternity UI or React Bits only where they improve UX. Avoid excessive glow, glassmorphism, giant gradients, floating shapes, particles, flashy backgrounds and hover effects.
U5 Navigation: minimal and clean, responsive on mobile, no overlapping elements. Prioritize the primary task.
U6 Homepage: ONE primary action. Hero with a concise headline, short explanation, From, To, Date, passengers, mode and a search button as the visual focus. Then the "Direct route unavailable?" explanation of combinations (Train + Bus, Train + Flight, Train + Train and others). Do not overload with cards.
U7 Search: autocomplete from the station dataset, an obvious primary CTA, clear visual hierarchy, and not every button equally prominent.
U8 Results: clean journey cards showing departure, arrival, duration, mode, transfers, status or availability (only per section 5), price, warnings and the primary action. Multi-modal routes use a clean timeline such as Train, then Bus. Transform API data into human-readable text.
U9 States: every important view has loading, skeleton, empty, error and success states. Example: "No direct trains found. TravelMate found 3 alternative routes."
U10 Responsive: intentional layouts for desktop, laptop, tablet and mobile, not a shrunk desktop. Check navbar, hero, forms, cards, modals, drawers, result lists, buttons, typography and spacing.
U11 Accessibility: semantic HTML, labels, keyboard navigation, visible focus, contrast, accessible dialogs and buttons, aria labels where needed.
U12 Motion: subtle, 150 to 300 ms, natural, and respecting reduced-motion.
U13 Clutter: do not keep anything just because it exists. Fewer options, clearer actions. Do not make every section a card: use whitespace, typography, dividers and subtle surfaces.
U14 Do not break working behavior: diagnose root causes before changing anything that is broken, and never replace real functionality with mock data.
U15 Visual QA: run the app, visit every route on desktop and mobile, check for overflow, alignment, spacing, contrast, overlap, inconsistent buttons or cards, awkward empty space, typography and responsive problems, fix them, and do not stop after writing code.
U16 For ambiguous decisions prioritize: user clarity, simplicity, consistency, accessibility, performance, visual polish, in that order.

10. CODE ARCHITECTURE (layered)
Stack: React, Vite, TypeScript (strict) for all new code, Tailwind, shadcn/ui, React Router, TanStack Query, zod, react-hook-form, Vitest and Playwright, ESLint and Prettier. Deployed on Vercel with serverless functions.
Layers: Presentation (pages and components), Application (hooks and queries), Domain (types, validation, engine rules), Infrastructure (provider adapters: rail timetable, live rail, bus, flights, routing, weather, LLM), Data (Prisma and Postgres).
Suggested layout (adapt if the audit finds better):
  src/app (router, providers, layouts), src/pages (thin routes), src/features/{search,results,engine-ui,tatkal,passes-safety,assistant,demo}/{components,hooks,services,types,tests}, src/components/ui, src/lib, src/styles/tokens
  api/ (thin Vercel handlers), server/{services,adapters,schemas,middleware,config}
  shared/ (types and zod schemas used by both sides), prisma/{schema.prisma,migrations,seed.ts}, data/etl, tests/{unit,contract,e2e}, docs/
Server rules: thin handlers calling services, zod validation on every input, centralized error handling and logging without personal data, rate limiting, env validation at startup, API keys only server-side, HTTP caching (s-maxage and stale-while-revalidate) plus a database ApiCache with a TTL for provider calls.
Prisma models (candidates): Station, Train, TrainStop, Junction, Terminal, Airport, TransferGuide, ApiCache, Feedback. Keep personal data out of the database. Use Neon Postgres (pooled connection) in production and verify the current Prisma and Vercel serverless guidance (driver adapter and pooling). Local development with docker-compose Postgres. Provide npm scripts for dev, db:up, db:migrate, db:seed, etl, test, test:e2e, lint, typecheck and build. Provide .env.example.

11. EXTENSIONS I INSTALLED (use them)
First run the editor CLI to list installed extensions (for example `antigravity --list-extensions --show-versions`, or `code --list-extensions --show-versions`) and record what each is useful for in docs/tooling.md. I can see Docker (container tools), Prisma, GitLens and GitLens Inspect, and there are others in the sidebar. Required use:
- Prisma: schema, migrations, generated types, seed, and Prisma Studio instructions in docs/tooling.md.
- Docker: docker-compose.yml for local Postgres. If the Docker daemon is not running, say so and use a local or Neon dev database.
- GitLens and GitLens Inspect: read file history and blame BEFORE deleting any old code to understand why it existed; make one clean commit per day; review the commit graph and diff after each day for unintended changes.
- If an API client extension (for example Thunder Client) or any other relevant extension is listed, export a request collection for every API endpoint into tests/api-requests.
Where an extension is for the human only, produce the files or commands so I can use it myself.

12. EXECUTION PLAN (one day at a time; reorder only if a dependency requires it)
DAY 0 Audit and baseline: run the app and inspect every page and feature (framework, UI libraries, Tailwind config, components, routes, API integrations, existing search and booking behavior, responsive behavior, duplicated components, inconsistent styling, broken layouts, dead code). Record the status of each existing feature. Capture baseline screenshots of every screen. Write characterization tests for the existing engines. Tag git baseline-before-rebuild. Create docs/MASTER_SPEC.md, sprint-status.md, sprint-log.md, decisions.md, tooling.md, data-sources.md, api-keys-needed.md and feature-matrix.md. Research data sources and providers, and give me the full list of keys and signups early.
DAY 1 Foundation: scaffold the new architecture, design tokens and core components, Prisma schema, docker-compose, env validation, scripts, lint, type-check and CI-style checks, and the PWA shell.
DAY 2 Data pipeline: ETL for stations, trains, stop times, junction directory, airports and terminals; seed; provenance fields; data-quality tests; attribution.
DAY 3 Engine v2: graph search, minimum connection times, risk labels, reliability model, tiers, simulator and contingency logic, API endpoints, unit and property tests.
DAY 4 App shell, navigation, homepage, search UX with autocomplete, onboarding, and the demo scenario with honest banner.
DAY 5 Results experience: direct versus split contrast, journey cards, timeline, map, risk badges, simulator tab, transfer guide, deep-link booking buttons, disclosures.
DAY 6 Urgent mode preset, Tatkal Desk with local passenger master, PNR status and estimate.
DAY 7 Passes and Safety (offline passes, PWA install, 112 and 139, location pin sharing), contextual weather, and the two AI uses.
DAY 8 States, responsive, accessibility and visual QA of EVERYTHING; first-time-user task tests (find an alternative route, check a PNR, use the demo, save a pass, call a helpline), measure clicks against the budgets in section 8; performance work.
DAY 9 Hardening: security review, DPDP-aligned consent and data minimization (verify current requirements), privacy, terms and disclaimer pages, analytics, error monitoring, feedback, SEO and social previews, documentation.
DAY 10 Release: Vercel production deploy with a clean alias, final regression, and pitch assets in docs/pitch/ (60-second pitch, 45-second live demo script, answers to the ten likely judge objections, and a "what is real versus demo" sheet).
Optional bonus after DAY 10, only if everything passes: Hindi and Telugu for the core flow, web-push delay alerts. Do not add other features without a written justification in docs/decisions.md.

13. DAY LOOP AND GATE
For each day: (1) write the day's tasks to sprint-log.md and make a task list; (2) take BEFORE screenshots of the screens you will touch; (3) implement fully, with no mock data in the final result, no placeholder text, no TODOs, no dead code and no hardcoded secrets; (4) take AFTER screenshots; (5) run the DAY GATE; (6) re-check from a clean build until there are zero errors (maximum 10 fix iterations); (7) only then write exactly "DAY N COMPLETE. Verification passed (X/Y). Moving to DAY N+1." in the chat and in sprint-log.md. Never start the next day while the current day has failures. Anything blocked only by an external key or account is marked BLOCKED-EXTERNAL, built around, and revisited at the end.
DAY GATE: Playwright (Chromium, JavaScript enabled) tests for today's work plus a regression of earlier days (the full suite every third day and at the end); mobile 390x844 primary and desktop 1440x900; no console errors, failed requests or unhandled rejections; no secrets in the client bundle; offline behavior tested where relevant; axe accessibility with no serious or critical issues; lint, type-check and production build pass. Every script needs hard timeouts (page.setDefaultTimeout(15000), an overall limit, browser closed in a finally block). Never run an open-ended script.

14. API KEYS AND PROVIDERS (free, honest, safe)
- For every integration write in docs/api-keys-needed.md: purpose, provider, free-tier limits (verified from the official page today), signup URL, click-by-click steps for me, env var name, where to put it (.env.local and Vercel), and a test command. Group them so I can finish all signups at once. Tell me the list right after Day 0 and keep working.
- Candidates to verify (confirm that each still has a free tier and what its terms allow): LLM (SambaNova existing, Google AI Studio Gemini); routing and geocoding (OSRM, OpenRouteService, Nominatim with its usage policy); places (OpenTripMap); weather (Open-Meteo, no key); maps (Leaflet with a free tile provider); flights (Amadeus self-service test environment or Aviationstack free tier, or deep links only); live Indian rail data (third-party providers such as RapidAPI offerings).
- IRCTC has no free public API for availability, PNR or booking, and scraping IRCTC or NTES against their terms is not allowed. Choose the best third-party provider by free tier and terms, put it behind a provider interface, cache aggressively, and tell me honestly what the free quota supports. If it cannot support a real demo, give me the cheapest options with prices.
- You may read public docs, test no-key endpoints, and use browser tools for signups ONLY when no email verification, OTP, captcha, phone number, payment card or KYC is needed, and never with false identities. Everything else goes to me with exact steps.
- NEVER extract, harvest or reuse API keys from other websites, apps, bundles or network traffic, and never use leaked or shared keys. Use only keys I register through official signups. Never print or commit key values. Add keys to Vercel with the CLI by variable name for Preview and Production.

15. SAFETY, PRIVACY AND LEGAL
Request permissions (location) only on explicit user action with a clear explanation. No background tracking. No personal data in logs. No Aadhaar, passport or other ID numbers are stored anywhere. A visible note: "TravelMate is not an emergency service. In an emergency call 112." No medical or crime guidance. Respect each data source's terms and licence (for example OpenStreetMap attribution). Do not use copyrighted images or logos you do not own. No automated booking, no captcha bypass and no scraping against terms.

16. SCREENSHOTS AND REPORTING
- Save docs/screenshots/day-N/before and /after (same viewport per pair) and build docs/screenshots/index.html, a gallery of every before and after pair.
- docs/changelog-features.md: per day, Features Added, Changed and Removed, each with the reason. For every removal include proof (grep output showing zero remaining references).
- docs/feature-matrix.md: every feature, status (WORKING with real data, PARTIAL, BLOCKED-EXTERNAL), data provenance, the test that proves it and its screenshot.
- If the session stops, resume from sprint-status.md and sprint-log.md instead of restarting. If I ask you to complete only certain days, finish them, write docs/handoff.md and stop.

17. MODEL NOTES (I run you on Gemini)
Work in Planning mode first. Do not skip steps to save tokens. Never mark anything done from memory: show the command output or screenshot that proves it. Re-read docs/MASTER_SPEC.md and sprint-log.md at the start of each day. Stop any command that runs unexpectedly long and rerun it with a timeout.

18. GIT AND DEPLOYMENT (Vercel only)
Work on a branch named rebuild/route-recovery. Commit at the end of each day ("Day N complete: <summary>") and tag day-N. Never force-push, never delete tags, never push to main without my approval. Use Vercel only: run `vercel whoami` (if not logged in, STOP and tell me to run `vercel login`), use the existing Vercel project (no duplicates), and deploy a Preview at the end of every day. At the end of Day 10 deploy to production and create a short stable alias. Confirm the public URL opens without any login (curl and a fresh incognito session: no 401, 403 or Vercel authentication page). Run the full regression against the deployed URL, not only localhost.

19. FINAL GATE
Run the full regression against the deployed URL twice in a row with zero failures. Lighthouse mobile: performance 85+, accessibility 95+, PWA installable. Verify every feature in feature-matrix.md on a real mobile viewport including offline mode. Verify that no removed feature leaves any reference. Verify that the honesty rules in section 5 hold on every screen (no "confirmed" or "guaranteed" without live proof, every leg has a provenance badge, the demo banner is present in demo mode).

20. FINAL REPORT (the first lines must be exactly this format)
BETA URL: https://<alias>.vercel.app
Vercel deployment URL: <url>
Branch / commit / tag: <branch> / <hash> / <tag>
Public access verified without login: YES or NO (status codes)
Days completed: <list>; final regression runs: <passed>/<total> and <passed>/<total>
Features working with real data: <n> of <n>; BLOCKED-EXTERNAL: <list>; ESTIMATE-only areas: <list>
Then: the day-by-day summary, features added, changed and removed (with proof), the path to the before and after gallery, the data sources and licences, the API and provider list with free-tier limits, environment variable names (names only), the pitch assets, and any remaining risks stated honestly. If anything is not perfect, say so plainly.
