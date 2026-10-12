#!/usr/bin/env node
/**
 * Safe Gemini API Health Check CLI
 * Tests Google Gemini connectivity without printing or leaking credentials.
 * Usage: node scripts/check-gemini.mjs [--key <key>]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { testGeminiConnectivity } from '../server/adapters/aiProvider.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// Helper to safely load key from .env.local if not already in process.env
function getLocalKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  const envPath = path.join(ROOT, '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    const match = content.match(/GEMINI_API_KEY\s*=\s*([^\r\n]+)/);
    if (match) {
      let val = match[1].trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1).trim();
      }
      return val;
    }
  }
  return '';
}

async function main() {
  console.log('[Check-Gemini] Running Google Gemini API health diagnosis...');
  console.log('[Security notice] Secret keys are redacted and never printed to stdout/stderr.');

  const key = getLocalKey();
  const configured = Boolean(key && !key.startsWith('[SENSITIVE') && !key.startsWith('['));
  console.log(`[Check-Gemini] Key presence: ${configured ? 'Present (valid length)' : (key ? 'Present (placeholder / redacted string)' : 'Unset')}`);

  const result = await testGeminiConnectivity(key);

  console.log('----------------------------------------------------');
  console.log(`Diagnostic Status: ${result.ok ? 'OK' : 'BLOCKED'}`);
  console.log(`Error Class:       ${result.code}`);
  if (result.status) {
    console.log(`HTTP Status:       ${result.status}`);
  }
  console.log(`Message:           ${result.message}`);
  console.log('----------------------------------------------------');

  if (result.ok) {
    console.log('[Check-Gemini] Google Gemini is operational.');
    process.exit(0);
  } else {
    console.log('[Check-Gemini] Action required: see docs/data/gemini-diagnosis.md and docs/data/needs-you.md for exact remediation steps.');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('[Check-Gemini] Unhandled diagnostic error:', err.message);
  process.exit(1);
});
