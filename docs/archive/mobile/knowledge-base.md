# Mobile Web Platform Rules and Knowledge Base

This document establishes the official mobile web UX, accessibility, and CSS platform rules for TravelMate. Every standard is verified against official documentation (MDN, W3C WCAG 2.2, Apple Human Interface Guidelines, Google Material Design 3, and web.dev).

---

## 1. Touch targets and spacing

- **Standard:**
  - Primary controls: minimum 44 by 44 CSS pixels (Apple HIG 44 pt, Material Design 48 dp).
  - Minimum accessible target size: 24 by 24 CSS pixels with sufficient spacing (WCAG 2.2 Level AA Success Criterion 2.5.8).
  - Target spacing: minimum 8 CSS pixels between neighboring interactive elements to eliminate mis-taps.
- **Sources:**
  - W3C WCAG 2.2 SC 2.5.8 Target Size (Minimum): https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
  - Apple Human Interface Guidelines (Buttons): https://developer.apple.com/design/human-interface-guidelines/buttons
  - Material Design 3 (Accessible Design): https://m3.material.io/foundations/accessible-design/accessibility-basics

---

## 2. Input font sizing and iOS auto-zoom prevention

- **Standard:**
  - All form controls (`input`, `select`, `textarea`) must have a computed `font-size` of at least 16px.
  - On iOS Safari, any input field focused with a font size smaller than 16px causes an automatic viewport zoom, obscuring neighboring context and requiring awkward manual zoom-out gestures.
- **Sources:**
  - MDN Viewport Meta Tag: https://developer.mozilla.org/en-US/docs/Web/HTML/Viewport_meta_tag
  - web.dev Form Best Practices: https://web.dev/articles/sign-in-form-best-practices

---

## 3. Viewport configuration and user scaling

- **Standard:**
  - Viewport meta must be: `<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />`.
  - Never disable zoom with `user-scalable=no` or `maximum-scale=1.0`. Disabling user zooming violates WCAG 1.4.4 (Resize Text) and blocks low-vision users.
  - `viewport-fit=cover` ensures the rendering surface extends under display notches and the home indicator, allowing CSS safe-area insets to control padding.
- **Sources:**
  - W3C WCAG 2.2 SC 1.4.4 Resize Text: https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html
  - MDN Viewport Meta Tag: https://developer.mozilla.org/en-US/docs/Web/HTML/Viewport_meta_tag
  - WebKit Designing for iPhone X: https://webkit.org/blog/7929/designing-websites-for-iphone-x/

---

## 4. Dynamic viewports and mobile browser toolbars

- **Standard:**
  - Mobile browsers (Safari on iOS, Chrome on Android) dynamically shrink and expand browser URL bars and toolbars during scrolling.
  - Classic `100vh` represents the largest possible viewport height (when toolbars are retracted), causing bottom-pinned elements to be cropped behind the active address bar.
  - Modern CSS standard uses `100dvh` (dynamic viewport height) or `100svh` (small viewport height) with `100vh` as fallback: `height: 100vh; height: 100dvh;`.
- **Sources:**
  - MDN CSS Viewport-percentage lengths: https://developer.mozilla.org/en-US/docs/Web/CSS/length#viewport-percentage_lengths
  - web.dev Dynamic Viewport Units: https://web.dev/blog/viewport-units

---

## 5. Safe area insets

- **Standard:**
  - Modern smartphones feature asymmetric cutouts, camera notches, rounded display corners, and bottom gesture home bars.
  - Fixed or sticky headers, bottom navigation bars, floating buttons, and modals must incorporate `env(safe-area-inset-top)`, `env(safe-area-inset-bottom)`, `env(safe-area-inset-left)`, and `env(safe-area-inset-right)`.
  - Example: `padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));`.
- **Sources:**
  - MDN CSS env(): https://developer.mozilla.org/en-US/docs/Web/CSS/env
  - WebKit Safe Area Insets: https://webkit.org/blog/7929/designing-websites-for-iphone-x/

---

## 6. Reflow and responsive zoom

- **Standard:**
  - Content must reflow at 320 CSS pixels wide without horizontal scrolling (one-dimensional vertical scrolling only) per WCAG 2.2 SC 1.4.10 (Reflow).
  - Applications must remain fully legible and functional when the browser root font size is increased to 200%, with no truncated text containers or clipped layout cards.
- **Sources:**
  - W3C WCAG 2.2 SC 1.4.10 Reflow: https://www.w3.org/WAI/WCAG22/Understanding/reflow.html
  - web.dev Responsive Web Design Basics: https://web.dev/articles/responsive-web-design-basics

---

## 7. Virtual keyboard behavior

- **Standard:**
  - When an input field gains focus, the on-screen software keyboard consumes approximately 35% to 50% of the vertical viewport.
  - Fixed bottom navigation bars and floating buttons must not obscure the focused input or the primary submit button.
  - Interactive elements must be scrolled into view via `scrollIntoView({ behavior: 'smooth', block: 'center' })` or support the `visualViewport` resize API.
- **Sources:**
  - MDN VisualViewport API: https://developer.mozilla.org/en-US/docs/Web/API/VisualViewport
  - Google Chrome Virtual Keyboard API: https://developer.chrome.com/docs/web-platform/virtual-keyboard/

---

## 8. Flexbox and grid min-width behavior

- **Standard:**
  - By default, flex children have `min-width: auto`. This prevents flex items from shrinking below the width of their text content, causing severe horizontal overflow on small screens.
  - All flex and grid child elements carrying dynamic text must include `min-width: 0;` (or Tailwind `min-w-0`).
  - Unbroken strings (such as long station codes, PNR numbers, URLs) must declare `overflow-wrap: anywhere;` or `word-break: break-word;`.
  - Responsive images and media must declare `max-width: 100%; height: auto;`.
- **Sources:**
  - MDN CSS Flexible Box Layout Min Content: https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_flexible_box_layout/Basic_concepts_of_flexbox
  - CSS Tricks Flexbox min-width 0: https://css-tricks.com/flexbox-truncated-text/

---

## 9. Touch actions and scroll hygiene

- **Standard:**
  - No hover-only interactions: touch devices do not have persistent cursor hover. Information and tooltips hidden behind `:hover` are inaccessible on phones.
  - `touch-action: manipulation;` must be applied to interactive buttons and links to eliminate the 300ms double-tap-to-zoom delay while keeping pinch-zoom active.
  - Modal dialogues and full-screen drawers must prevent background scroll chaining using `overscroll-behavior: contain;` and modal body scroll locking.
- **Sources:**
  - MDN touch-action: https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action
  - MDN overscroll-behavior: https://developer.mozilla.org/en-US/docs/Web/CSS/overscroll-behavior

---

## 10. Cumulative layout shift (CLS) prevention

- **Standard:**
  - Asynchronous content loading on mobile connections must not push interactive content downward as users tap.
  - All images, icons, and dynamic widgets must reserve layout space using `aspect-ratio` or explicit width/height dimensions.
  - Target Cumulative Layout Shift (CLS) must remain below 0.1 across all routes and viewport transitions.
- **Sources:**
  - web.dev Cumulative Layout Shift (CLS): https://web.dev/articles/cls
  - W3C Web Performance Working Group: https://www.w3.org/TR/layout-instability/
