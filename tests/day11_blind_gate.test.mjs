import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

test('Day 11 / Master Spec §8: BlindVoiceGate.jsx is excised to prevent blocking cold visits', () => {
  const exists = fs.existsSync(path.join(root, 'src/components/BlindVoiceGate.jsx'))
  assert.equal(exists, false, 'BlindVoiceGate.jsx must be deleted per Master Spec §8')
})

test('Day 11 / Master Spec §8: App.jsx does not import or mount blocking BlindVoiceGate', () => {
  const app = fs.readFileSync(path.join(root, 'src/App.jsx'), 'utf8')
  assert.ok(!app.includes('import BlindVoiceGate'), 'App.jsx must not import BlindVoiceGate')
  assert.ok(!app.includes('<BlindVoiceGate'), 'App.jsx must not render BlindVoiceGate')
})

test('Day 11 / Master Spec §8: App.jsx and Navbar.jsx provide non-blocking accessible voice triggers', () => {
  const app = fs.readFileSync(path.join(root, 'src/App.jsx'), 'utf8')
  const nav = fs.readFileSync(path.join(root, 'src/components/Navbar.jsx'), 'utf8')
  assert.match(app, /onOpenVoiceGate=/, 'App.jsx must wire voice gate callback to Navbar')
  assert.match(nav, /onOpenVoiceGate/, 'Navbar.jsx must receive onOpenVoiceGate prop')
  assert.match(nav, /data-testid="navbar-voice-gate-btn"/, 'Navbar.jsx must include accessible voice button')
})

test('Day 11: Voice intents and speech recognition engines are available on-demand', () => {
  const voiceIntent = fs.readFileSync(path.join(root, 'src/utils/voiceIntent.js'), 'utf8')
  assert.match(voiceIntent, /export function parseVoiceIntent/, 'Must provide non-blocking voice intent parsing')
  assert.match(voiceIntent, /export function formatTierSpeechSummary/, 'Must provide spoken itinerary formatting')
})
