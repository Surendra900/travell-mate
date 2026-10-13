# Mobile Tooling and Extensions Setup

This document records all development tools, editor extensions, and test runners configured for the mobile UI overhaul.

## 1. Editor extensions installed

All seven target extensions installed cleanly in the editor environment (version 1.141.0):

| Extension | Identifier | Version | Status | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| Tailwind CSS IntelliSense | `bradlc.vscode-tailwindcss` | v0.16.0 | Installed | Class validation and computed CSS inspection |
| Prettier | `esbenp.prettier-vscode` | v12.4.0 | Installed | Formatting consistency across JSX and CSS |
| ESLint | `dbaeumer.vscode-eslint` | v3.0.34 | Installed | Code hygiene and accessibility linting |
| Stylelint | `stylelint.vscode-stylelint` | v2.2.1 | Installed | CSS rules enforcement (e.g. flagging `100vh`) |
| axe Accessibility Linter | `deque-systems.vscode-axe-linter` | v4.13.1 | Installed | Real-time WCAG 2.2 accessibility linting in JSX/HTML |
| Error Lens | `usernamehw.errorlens` | v3.29.0 | Installed | Inline diagnostic visualization for instant feedback |
| Playwright Test | `ms-playwright.playwright` | v1.1.19 | Installed | Visual test runner and device matrix execution |

## 2. Test automation and validation tools

- **Playwright Test Runner:** v1.63.0 (with Chromium, WebKit, and Firefox browser binaries).
- **Axe Core Playwright:** `@axe-core/playwright` v4.13.0 for automated WCAG 2.2 AA audits.
- **Node Test Runner:** Node.js v24.16.0 built-in test runner for unit and property tests.
- **Vite:** v8.1.4 dev server with live module reload and mobile network binding (`--host`).
