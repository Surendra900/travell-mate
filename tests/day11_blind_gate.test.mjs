import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

test('Day 11: BlindVoiceGate.jsx defines preference storage handlers', () => {
  const comp = fs.readFileSync(path.join(root, 'src/components/BlindVoiceGate.jsx'), 'utf8')
  assert.match(comp, /export function getBlindModePreference\(\)/, 'Must export getBlindModePreference')
  assert.match(comp, /export function setBlindModePreference\(/, 'Must export setBlindModePreference')
  assert.match(comp, /travelmate-blind-mode/, 'Must use travelmate-blind-mode localStorage key')
  assert.match(comp, /travelmate:blind-mode-changed/, 'Must broadcast travelmate:blind-mode-changed event')
})

test('Day 11: BlindVoiceGate.jsx contains spoken gate question and accessibility attributes', () => {
  const comp = fs.readFileSync(path.join(root, 'src/components/BlindVoiceGate.jsx'), 'utf8')
  assert.match(comp, /Are you blind or visually impaired\?/, 'Must contain spoken question')
  assert.match(comp, /role="alertdialog"/, 'Must have alertdialog role for screen readers')
  assert.match(comp, /aria-modal="true"/, 'Must be an accessible modal dialog')
  assert.match(comp, /aria-labelledby="blind-gate-title"/, 'Must label dialog with title id')
  assert.match(comp, /aria-describedby="blind-gate-desc"/, 'Must describe dialog with description id')
  assert.match(comp, /border-4 border-yellow-400/, 'Must use ultra-high-contrast styling')
  assert.match(comp, /YES - Enable Voice Mode/, 'Must contain high-contrast YES button')
  assert.match(comp, /NO - Standard Mode/, 'Must contain NO button')
})

test('Day 11: BlindVoiceGate integrates hands-free speech recognition and speech synthesis', () => {
  const comp = fs.readFileSync(path.join(root, 'src/components/BlindVoiceGate.jsx'), 'utf8')
  assert.match(comp, /SpeechSynthesisUtterance/, 'Must instantiate SpeechSynthesisUtterance')
  assert.match(comp, /speechSynthesis\.speak/, 'Must speak spoken prompt')
  assert.match(comp, /SpeechRecognition/, 'Must support SpeechRecognition')
  assert.match(comp, /webkitSpeechRecognition/, 'Must support webkitSpeechRecognition fallback')
  assert.match(comp, /rec\.start\(\)/, 'Must trigger voice listener')
})

test('Day 11: BlindVoiceGate supports Alt+B keyboard shortcut and Escape dismissal', () => {
  const comp = fs.readFileSync(path.join(root, 'src/components/BlindVoiceGate.jsx'), 'utf8')
  assert.match(comp, /e\.altKey && \(e\.key === 'b' \|\| e\.key === 'B'\)/, 'Must listen for Alt+B')
  assert.match(comp, /e\.key === 'Escape'/, 'Must handle Escape key to close')
})

test('Day 11: App.jsx and Navbar.jsx integrate BlindVoiceGate and trigger button', () => {
  const app = fs.readFileSync(path.join(root, 'src/App.jsx'), 'utf8')
  const nav = fs.readFileSync(path.join(root, 'src/components/Navbar.jsx'), 'utf8')
  assert.match(app, /import BlindVoiceGate from '\.\/components\/BlindVoiceGate'/, 'App.jsx must import BlindVoiceGate')
  assert.match(app, /<BlindVoiceGate/, 'App.jsx must render BlindVoiceGate')
  assert.match(app, /onOpenVoiceGate=/, 'App.jsx must pass onOpenVoiceGate to Navbar')
  assert.match(nav, /onOpenVoiceGate/, 'Navbar.jsx must receive onOpenVoiceGate prop')
  assert.match(nav, /data-testid="navbar-voice-gate-btn"/, 'Navbar.jsx must include voice gate trigger button')
})
