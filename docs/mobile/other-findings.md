# Other Findings (Out of Scope / Non-UI Items)

This document records non-UI findings, logic observations, and API behaviors observed during the mobile optimization run. In accordance with scope boundaries, these logic and backend items were preserved without alteration.

### 1. Clerk Authentication Development Key Deprecation Notice
- Location: Terminal output on server startup and build
- Observation: `@clerk/clerk-react@5.61.10` outputs a deprecation notice recommending migration to `@clerk/react` Core 3.
- Impact: Non-blocking for UI rendering, but should be planned in a dedicated dependency upgrade cycle.

### 2. Large JavaScript Chunk Size in NaturalLanguageQueryInput
- Location: `src/components/NaturalLanguageQueryInput.jsx` / `dist/assets/NaturalLanguageQueryInput-*.js`
- Observation: Vite reports the chunk size is approximately 1.9 MB uncompressed due to bundled offline vocabulary embeddings.
- Recommendation: Consider lazy-loading or dynamic importing of the local NLP dictionary when the user focuses the input, reducing initial bundle weight on slow 3G cellular connections.

### 3. Leaflet Tile Layer Over HTTPS via OpenStreetMap
- Location: `src/components/RouteMap.jsx`
- Observation: Map tiles are requested from OpenStreetMap tile servers (`https://*.tile.openstreetmap.org`). In strict offline mode or airplane mode without cached service worker tiles, external map tiles will show background grid placeholders while station pins and geometric lines continue to render correctly from local vector coordinates.

### 4. IRCTC Booking Link Redirection
- Location: `src/planner/EmergencyTatkalPlanner.jsx`
- Observation: Tatkal desk external links direct travelers to `https://www.irctc.co.in/nget/train-search`. This complies with statutory regulations requiring users to complete ticket purchases on official Indian Railways portals.
