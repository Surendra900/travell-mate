# Real Phone Verification Checklist

This checklist contains the 15 most critical verification items for testing the TravelMate web application on a real mobile device (iOS Safari or Android Chrome). Real touch hardware, native virtual keyboards, dynamic URL bars, and physical pixel density reveal interaction subtleties that browser emulation cannot fully duplicate.

Preview URL: [https://travelmate-ai-flowzint-o8z6nkvpz-httplocalhost5173planner.vercel.app](https://travelmate-ai-flowzint-o8z6nkvpz-httplocalhost5173planner.vercel.app)
QR Code: [preview-qr.png](file:///c:/Users/SURENDRA.G/.gemini/antigravity/scratch/travelmate-app/docs/mobile/preview-qr.png)
Local LAN fallback: http://10.113.26.176:5173

---

### Item 1: Top Navigation and Hamburger Trigger
- Route: `/`
- Step: Tap the 44x44px hamburger menu button in the top right corner of the navbar.
- Expected behavior: The menu trigger provides immediate tactile touch feedback without double-tap delay. The off-canvas navigation drawer opens smoothly from the top/side without horizontal shift or layout jump.

### Item 2: Off-Canvas Navigation Drawer Body Scroll Lock
- Route: `/` (with mobile navigation open)
- Step: While the mobile menu drawer is open, attempt to drag and scroll the background page content up and down.
- Expected behavior: Background page scrolling is completely locked. Only the drawer navigation options scroll if they exceed the viewport. All 4 primary navigation links, Demo Tour, Voice Assistant, and Account actions are accessible with at least 44px touch height.

### Item 3: Station Autocomplete Focus and Virtual Keyboard
- Route: `/planner`
- Step: Tap into the "From (Origin Station)" text input field.
- Expected behavior: iOS Safari or Android Chrome does not zoom into the page automatically because font size is set to 16px. The virtual keyboard slides up, and the origin input remains fully visible in the visual viewport above the keyboard.

### Item 4: Autocomplete Suggestions Dropdown
- Route: `/planner`
- Step: Type "Del" into the From input.
- Expected behavior: The station suggestions dropdown renders directly below the input with station code badges. Suggestion list items have at least 44px touch height, are easy to tap with one thumb, and do not overflow off the right edge of the screen.

### Item 5: Multimodal Results Cards and Hierarchy
- Route: `/planner?from=Delhi+(NDLS)&to=Patna+(PNBE)&date=2026-10-20&transportMode=Train&demo=true`
- Step: Scroll through the search results cards.
- Expected behavior: Each card displays clean vertical card stacking. Crucial information (operator name, departure, arrival, duration, seat availability, and fare) is readable without horizontal scrolling. No text is cut in half or truncated unreachably.

### Item 6: Horizontal Filter Pills Carousel
- Route: `/planner?from=Delhi+(NDLS)&to=Patna+(PNBE)&date=2026-10-20&transportMode=Train&demo=true`
- Step: Swipe horizontally across the filter buttons strip (All Options, Under Rs 1,000, Sub-Rs 2,000, Fastest, Route Map, Delay Simulator).
- Expected behavior: The filter strip scrolls horizontally with smooth inertia. Filter chips have at least 44px touch height and clear active contrast. Tapping a filter updates results without causing the entire page body to scroll horizontally.

### Item 7: Voice Assistant Modal Dialog
- Route: `/`
- Step: Tap the floating voice search button (microphone icon) in the bottom corner.
- Expected behavior: The voice dialog overlay appears centered. The dialog height is capped at calc(100dvh - 2rem) so it never spills past the dynamic browser address bar. The close button is easily reachable in the top right of the modal.

### Item 8: Interactive Route Map Touch Gestures
- Route: `/planner?from=Delhi+(NDLS)&to=Patna+(PNBE)&date=2026-10-20&transportMode=Train&demo=true` (View: Route Map)
- Step: Scroll the page past the map using a vertical one-finger swipe across the map container.
- Expected behavior: The page continues to scroll smoothly past the map because touch-action: pan-y is configured. The map does not trap page scroll. Stations and connecting lines render crisply within map bounds.

### Item 9: Screen Orientation Rotation (Portrait to Landscape)
- Route: `/planner` and `/safety`
- Step: Rotate the phone 90 degrees to landscape orientation, then rotate back to portrait.
- Expected behavior: Layout reflows smoothly without horizontal overflow. Navbar, forms, and grid items adapt to the wider viewport width and shorter viewport height without cutting off controls.

### Item 10: Extreme Text and Long Station Names
- Route: `/planner`
- Step: Enter a very long station query or check stations with extensive names (for example, "Puratchi Thalaivar Dr. M.G. Ramachandran Central").
- Expected behavior: Text wraps properly with overflow-wrap anywhere. Badges and containers do not break horizontal bounds or spill past screen width.

### Item 11: Passenger Master Data Auto-Fill in Tatkal Desk
- Route: `/planner?mode=tatkal&from=Delhi+(NDLS)&to=Patna+(PNBE)&date=2026-10-20`
- Step: In the Passenger Master List section, tap "Add", fill in name, age, gender, and berth preference, and tap "1-Click Copy All".
- Expected behavior: All form inputs and select dropdowns have 44px min-height. Gender and berth dropdowns open native mobile wheel/picker sheets. The 1-click copy button copies the IRCTC fast-fill string to the device clipboard with a feedback toast.

### Item 12: Offline Passes Modal Bottom-Sheet Behavior
- Route: `/safety`
- Step: Tap "Offline Pass" or "Open traveler pass".
- Expected behavior: The pass modal opens cleanly within dynamic viewport height. All passenger travel details and QR verification code fit comfortably. Internal scroll triggers if screen height is compact (for example on iPhone SE).

### Item 13: Emergency Dialers and One-Tap SOS Actions
- Route: `/safety` (SOS Dialers tab)
- Step: Review the railway police (139), national emergency (112), and ambulance dialer cards.
- Expected behavior: Call action buttons have prominent high-contrast buttons with minimum 48px height for rapid emergency tapping. Dial numbers use tel: protocols for direct operating system phone dialer launch.

### Item 14: System Font Scaling (200% Accessibility Zoom)
- Route: `/privacy` and `/cookies`
- Step: In phone system settings (Accessibility -> Display & Text Size), increase text size to maximum.
- Expected behavior: Text wraps gracefully without overlapping adjacent text containers. Headings, paragraphs, and legal tables maintain readable line spacing without clipping or text truncation.

### Item 15: Safe Area Insets (Notch and Home Indicator)
- Route: `/` and all sub-routes
- Step: Inspect the top navbar near the camera notch/island, and the bottom toolbar near the iOS swipe indicator / Android navigation bar.
- Expected behavior: Fixed elements respect env(safe-area-inset-top) and env(safe-area-inset-bottom). Buttons are not partially occluded by rounded phone corners or the physical home bar.
