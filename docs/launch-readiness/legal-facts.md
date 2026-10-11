# Verified Legal and Privacy Facts

## Overview
This document records an empirical audit of all client and server data handling in the TravelMate codebase.

## Data Collected and Processed

### 1. Local-Only Storage (Device Only, Never Sent to Server)
All sensitive passenger data is persisted strictly in browser `localStorage` on the traveler's own device:
- `travelmate-user-profile`: Name, emergency contact phone, medical notes for digital pass.
- `travelmate-contacts`: Emergency ICE contacts (maximum 8 contacts).
- `travelmate-tatkal-master-list`: Passenger names, age, berth preference for fast booking autofill.
- `travelmate-plans`: Saved routes and digital offline travel passes (maximum 20 plans).
- `travelmate-offline-pack`: Cached safety guidelines, railway helpline numbers, first-aid tips.
- `travelmate-language`: Chosen UI language code (`en`, `hi`, `ta`, `te`, `bn`, `mr`, `gu`, `kn`).
- `travelmate-dpdp-consent`: Consent status recorded under India's Digital Personal Data Protection Act.
- `travelmate-feedback-history`: User bug reports and operational notes.
- Purge capability: The DPDP privacy interface (`DpdpPrivacyModal.jsx`) provides a one-click local storage purge that wipes all keys and resets application state immediately.

### 2. Transient Transmission to APIs (In-Flight Processing Only)
- Voice Audio Clips: Sent via `POST /api/voice/transcribe` as multipart audio chunks to convert speech to text for route queries. Audio buffers are discarded immediately after transcription response.
- Transit Search Parameters: Origin station, destination station, date, and transit mode are sent to `/api/trains/live-station`, `/api/buses/search`, `/api/flights/search`, and `/api/recovery`. No personal user identity or tracking cookies are attached.
- Translation Queries: Dynamic UI text strings sent to `/api/translate` for multilingual localization. No personally identifiable information is included.
- Geolocation Coordinates: Browser GPS coordinates (latitude and longitude) are accessed only upon explicit user grant via `LocationPermissionGate.jsx`. Coordinates are converted client-side to find the closest transit hub or station and are not stored on remote servers.

### 3. Third-Party Integrations
- Open-Meteo (`https://api.open-meteo.com`): Fetches weather alerts, rainfall, wind speeds, and visibility for transit disruption risk scoring. No user identity is transmitted.
- OpenStreetMap (`https://*.tile.openstreetmap.org`): Renders interactive railway and highway junction maps via Leaflet. Map tile requests include client IP address as standard HTTP traffic under OpenStreetMap foundation policies.
- Vercel Serverless Hosting: Serves static assets and hosts Node.js serverless functions. IP addresses and standard HTTP request headers are logged in server access logs for infrastructure security.
- Sentry Error Monitoring: Configured in `src/utils/errorMonitoring.js` to catch uncaught runtime crashes. Active only when `VITE_SENTRY_DSN` environment variable is set. Sensitive form inputs and personal names are sanitized before telemetry dispatch.

### 4. Cookies and Web Trackers
- No marketing cookies, third-party advertising scripts, or cross-site tracking pixels are present in the codebase.
- The application relies on `localStorage` and `CacheStorage` (Service Worker) for offline persistence.

### 5. Compliance with India Digital Personal Data Protection Act (DPDP Act)
- Right to access: Users can view all saved data in Saved Plans and Profile modals.
- Right to erasure: A dedicated "Purge All Personal Data" feature is implemented in `DpdpPrivacyModal.jsx` and `src/utils/dpdpConsent.js`.
- Purpose limitation: Transit search data is utilized solely to return travel itineraries.
- No mandatory login wall: The core route planning, Tatkal timers, and safety handbooks function completely without user account registration.
