# TravelMate — The 45-Second Live Demo Script

**Target Time:** 45 seconds sharp  
**Screen Setup:** Laptop on `https://travelmate-ai-flowzint.vercel.app` (or `localhost:5173`)  
**Viewport:** Desktop 1440px or mirrored iPhone 390px  

---

### Step-by-Step Execution Script

| Time | Presenter Action on Screen | Spoken Script | Key Visual Anchor |
| :---: | :--- | :--- | :--- |
| **0:00 – 0:10** | Open Home Page. Tap **"See a Demo"** or select **Delhi to Kolkata**. Tap Search CTA. | *"Watch this: direct trains from Delhi to Howrah are completely waitlisted. Instead of a dead end, TravelMate instantly unlocks 3 recovery tiers."* | Home search hero & 3-step educational strip. |
| **0:10 – 0:22** | Show **Waitlist Bypass Contrast**. Highlight Left (Blocked Direct) vs Right (Split Recovery). | *"On the left, the direct train is stuck on WL 42. On the right, TravelMate splits the journey at Kanpur Junction: two confirmed train quotas with a verified 1 hour 45 minute daylight transfer buffer."* | `WaitlistBypassContrast` side-by-side card with provenance badges. |
| **0:22 – 0:32** | Click **"Delay Simulator"** tab. Drag the Leg 1 delay slider to `+45 min`. | *"What if Train 1 runs 45 minutes late? Our Delay Contingency Simulator recomputes slack in real time, proving the connection absorbs the delay safely."* | Live slider recomputing effective slack & Point of No Return. |
| **0:32 – 0:40** | Navigate to **Passes & Safety** (`/safety`). Tap **"View Digital Pass"** modal. | *"Once booked via official deep links, travelers access an offline digital boarding pass with zero cellular data required."* | Offline pass modal with QR code, leg breakdown, & print button. |
| **0:40 – 0:45** | Highlight bottom **112 / 139 RailMadad** dialers. | *"And if an incident occurs, 1-tap connects directly to 139 RailMadad with live GPS coordinates ready on clipboard. That is TravelMate."* | Transit hotline buttons with direct carrier dialers. |

---

### Contingency Demo Tips
- If network lags: The app has an offline Service Worker snapshot and local fallback timetable data that executes synchronously in `<50ms`.
- Do not skip the "Demo scenario" banner: Pointing out the honest label builds immediate trust with senior technical judges.
