# Standing Decisions

This document records the architectural and operational decisions for the mobile UI overhaul of TravelMate.

## Core standing decisions

- **D1: Preview deployment only**
  All remote deployments for mobile verification will target Vercel Preview environments (`vercel deploy` without `--prod`). Production deployment will remain untouched until full real-device verification passes.

- **D2: Mobile-adapted design patterns**
  When dense desktop layouts fail on mobile viewports, components will transform into mobile-first patterns. Tables will convert to structured cards, complex desktop filters will transform to bottom sheets or slide-over trays, and horizontal overflow bars will convert to scrollable segmented chips.

- **D3: Desktop non-regression guarantee**
  Any styling changes to resolve mobile constraints must use mobile-first CSS media queries (`min-width: 640px`, `min-width: 768px`, `min-width: 1024px`) or project theme tokens. Desktop behavior and visual balance must never regress.

- **D4: Editor extension fallback protocol**
  If any recommended editor extension cannot be installed due to engine incompatibilities or environment restrictions, it will be documented with exact reasons, and the equivalent npm script/CLI tool will be configured and run instead.

- **D5: Zero-cost and minimal dependency rule**
  Only free, open-source tools and libraries will be used. Additional npm packages will only be introduced if they significantly reduce mobile risk, improve accessibility compliance (e.g. Radix UI/Vaul for bottom sheets, `@axe-core/playwright`), and have zero runtime bloat.
