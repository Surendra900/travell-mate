# Items requiring user action

This register records all external dependencies, account configurations, or credential approvals that require manual intervention.

## Current register

1. Automated NTES crawl permission:
   - Reason: Official IRCTC and CRIS/NTES terms explicitly prohibit robots, automated devices, and automated harvesting of train schedules without prior written permission.
   - Action taken: In adherence with Standing Decision S1, bulk crawling of 12,000 trains was halted. The application operates using the CC0 public-domain Datameet dataset (8,990 stations, 5,208 trains, 417,080 stops) and configured RapidAPI live adapters.
   - User action: If you require full live bulk crawling of CRIS/NTES servers directly, obtain formal written permission from CRIS/IRCTC or maintain live queries through an authorized railway API provider.

2. Gemini API key provisioning for local development and preview:
   - Production status: Working. On the live production deployment (`https://travelmate-ai-flowzint.vercel.app`), Gemini is verified healthy and responsive (status: `OK`, active model discovery confirmed).
   - Local and Preview status: The local `.env.local` file contains the placeholder string `[SENSITIVE-1]`, and Vercel scopes `GEMINI_API_KEY` to Production.
   - User action for local testing:
     a. To run Gemini queries locally, generate an API key in Google AI Studio (https://aistudio.google.com/).
     b. In `.env.local`, set `GEMINI_API_KEY=<your_key>`.
     c. For Vercel preview branches, optionally run `npx vercel env add GEMINI_API_KEY preview`.
     d. Verify locally by running `node scripts/check-gemini.mjs`.
