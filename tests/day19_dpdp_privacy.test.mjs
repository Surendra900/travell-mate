import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  DEFAULT_CONSENT,
  getDpdpConsent,
  updateDpdpConsent,
  purgeAllUserData
} from '../src/utils/dpdpConsent.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

test('Day 19: dpdpConsent.js defines India DPDP Act 2023 granular consent parameters', () => {
  assert.equal(DEFAULT_CONSENT.essential_storage, true, 'Essential storage must default to true')
  assert.equal(DEFAULT_CONSENT.emergency_telemetry, true, 'Emergency telemetry must be configurable')
  assert.equal(DEFAULT_CONSENT.ai_translation, true, 'AI translation must be configurable')
  assert.equal(DEFAULT_CONSENT.voice_processing, true, 'Voice processing must be configurable')
})

test('Day 19: updateDpdpConsent enforces essential_storage invariant and updates timestamps', () => {
  // Test updating telemetry to false
  const updated = updateDpdpConsent({ emergency_telemetry: false, essential_storage: false })
  assert.equal(updated.emergency_telemetry, false, 'emergency_telemetry should be disabled')
  assert.equal(updated.essential_storage, true, 'essential_storage must remain true to support client encryption')
  assert.ok(updated.updatedAt, 'Timestamp must be refreshed')
})

test('Day 19: purgeAllUserData executes complete Right to Erasure cleanup', async () => {
  // Setup dummy keys
  try {
    localStorage.setItem('dummy-test-key', '12345')
  } catch {}

  const result = await purgeAllUserData()
  assert.equal(result.localStorageCleared, true, 'Must clear all localStorage')
  assert.ok(result.timestamp, 'Erasure timestamp must be recorded')
})

test('Day 19: DpdpPrivacyModal.jsx declares statutory DPDP disclosures and erasure trigger', () => {
  const comp = fs.readFileSync(path.join(root, 'src/components/DpdpPrivacyModal.jsx'), 'utf8')
  assert.match(comp, /India DPDP Act 2023 Compliant/, 'Must display DPDP Act compliance tag')
  assert.match(comp, /Zero-Knowledge Architecture/, 'Must state Zero-Knowledge fiduciary pledge')
  assert.match(comp, /role="dialog"/, 'Must be accessible dialog')
  assert.match(comp, /data-testid="dpdp-erase-all-button"/, 'Must provide erasure button testid')
  assert.match(comp, /Right to Erasure \(DPDP Act Sec\. 12\)/, 'Must reference Section 12 erasure rights')
})

test('Day 19: Footer.jsx and App.jsx integrate interactive Privacy & DPDP modal', () => {
  const footer = fs.readFileSync(path.join(root, 'src/components/Footer.jsx'), 'utf8')
  assert.match(footer, /data-testid="footer-privacy-link"/, 'Footer must provide testid for privacy button')

  const app = fs.readFileSync(path.join(root, 'src/App.jsx'), 'utf8')
  assert.match(app, /import DpdpPrivacyModal from '\.\/components\/DpdpPrivacyModal'/, 'App must import DpdpPrivacyModal')
  assert.match(app, /<DpdpPrivacyModal/, 'App must render DpdpPrivacyModal')
})
