# Items Requiring User Action

This document tracks items that require human review, physical hardware verification, or administrative authority.

### 1. Real Phone Physical Verification
- Action: Open the Vercel Preview URL or scan [preview-qr.png](file:///c:/Users/SURENDRA.G/.gemini/antigravity/scratch/travelmate-app/docs/mobile/preview-qr.png) on your personal smartphone (iPhone Safari and Android Chrome).
- Guide: Follow the 15 step-by-step verification points detailed in [phone-checklist.md](file:///c:/Users/SURENDRA.G/.gemini/antigravity/scratch/travelmate-app/docs/mobile/phone-checklist.md).
- Preview URL: [https://travelmate-ai-flowzint-o8z6nkvpz-httplocalhost5173planner.vercel.app](https://travelmate-ai-flowzint-o8z6nkvpz-httplocalhost5173planner.vercel.app)
- LAN Address: `http://10.113.26.176:5173` (ensure phone is connected to the same Wi-Fi network).

### 2. Legal Policy Placeholders Review
- Action: Review draft disclosures in `PrivacyPolicy.jsx`, `TermsOfService.jsx`, `LegalDisclaimer.jsx`, and `CookiePolicy.jsx`.
- Details: Replace marked placeholders (for example, legal business name, registered address, privacy contact email) before commercial deployment.

### 3. Production Deployment Promotion
- Action: After confirming mobile usability on your phone, promote the preview to production via `vercel deploy --prod`. Standing Decision D1 prohibited automatic deployment to production during this autonomous engineering run.
