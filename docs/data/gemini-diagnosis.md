# Gemini API key diagnosis and resolution

This document records the empirical investigation, code refactoring, and user actions for the Google Gemini API integration in TravelMate.

## 1. What was wrong

1. Key state in local `.env.local`:
   - The value configured for `GEMINI_API_KEY` was literally the 13-character sanitized placeholder string `[SENSITIVE-1]` (starting with `[SEN`).
   - When requests were dispatched to Google Generative Language endpoints (`v1beta`), Google responded with HTTP 400 `INVALID_ARGUMENT` (`API_KEY_INVALID`: "API key not valid. Please pass a valid API key.").
2. Key state on Vercel deployment:
   - Verification via `vercel env ls` demonstrated that `GEMINI_API_KEY` was created only under the `Production` environment.
   - It was completely missing from `Preview` and `Development` environments. Consequently, any branch preview deployments or development runs could not authenticate against Gemini.
3. Code implementation limitations in `server/adapters/aiProvider.js`:
   - Model name was hardcoded to `gemini-1.5-flash` rather than configurable via environment variable.
   - Network requests lacked timeout cancellation guards (`AbortController` / `AbortSignal.timeout`).
   - Unhandled raw API errors could crash or hang async pipelines without returning structured fallback messages.

## 2. How it was proved

1. Local environment inspection:
   - Evaluated without printing secrets.
   - Target query: `GET https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
   - Observation: HTTP 400 Bad Request.
   - Response payload detail:
     `{"error": {"code": 400, "message": "API key not valid. Please pass a valid API key.", "status": "INVALID_ARGUMENT", "details": [{"reason": "API_KEY_INVALID"}]}}`
2. Vercel environment verification:
   - Executed `vercel env ls`.
   - Output confirmed:
     `GEMINI_API_KEY: Hidden Secret, environments: Production (created 4d ago)`.
     Preview and Development environments lacked `GEMINI_API_KEY`.
3. Secret leakage check across git history:
   - Scanned full commit log using `git log -S GEMINI_API_KEY -p`.
   - Result: No plaintext Gemini API keys were ever committed to git history.

## 3. What was changed in the codebase

1. Upgraded `server/adapters/aiProvider.js`:
   - Configurable model via `process.env.GEMINI_MODEL || 'gemini-1.5-flash'`.
   - Added 8-second request timeout guards (`AbortController`) to prevent hanging promises.
   - Added safe classification of API errors (`API_KEY_INVALID`, `PERMISSION_DENIED`, `MODEL_NOT_FOUND`, `RATE_LIMIT_EXCEEDED`, `TIMEOUT`).
   - Added automatic fallback to SambaNova or deterministic heuristic parser upon API errors.
   - Exported `testGeminiConnectivity()` helper.
2. Built CLI diagnostic tool:
   - `scripts/check-gemini.mjs` allows quick diagnosis without printing keys.
3. Created serverless health endpoint:
   - `/api/health/llm.js` reports provider health and error classes safely.
4. Added automated unit tests:
   - `tests/gemini_diagnosis.test.mjs` verifies all error classes (400, 403, 404, 429) using mocked HTTP responses. All 6 tests pass.

## 4. What you must do

Because an API key cannot be created or pasted by an automated agent under Standing Decision S6, you must take the following steps:

1. Obtain a valid Gemini API key:
   - Go to Google AI Studio (https://aistudio.google.com/).
   - Click "Get API key".
   - Create a key in your Google Cloud project.
2. Add the key locally:
   - Open `.env.local` in your editor.
   - Replace the `[SENSITIVE-1]` placeholder with your real key:
     `GEMINI_API_KEY=AIzaSy...`
3. Add the key to Vercel for Preview and Production:
   - Run in your terminal:
     `vercel env add GEMINI_API_KEY preview`
     `vercel env add GEMINI_API_KEY production`
   - Paste your key when prompted.
4. Verify the setup:
   - Run `node scripts/check-gemini.mjs`.
   - The script will confirm: `Diagnostic Status: OK`.
