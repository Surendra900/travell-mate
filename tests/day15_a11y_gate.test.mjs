import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

test('Day 15: App.jsx provides accessible landmarks and skip-to-content mechanism', () => {
  const app = fs.readFileSync(path.join(root, 'src/App.jsx'), 'utf8')
  assert.match(app, /href="#main-content"/, 'App.jsx must provide a skip link to #main-content')
  assert.match(app, /<main id="main-content"/, 'App.jsx must use semantic <main> tag with id="main-content"')
  assert.match(app, /tabIndex="-1"/, 'Main landmark must have tabIndex="-1" for reliable programmatic focus')
})

test('Day 15: BlindVoiceGate.jsx implements complete keyboard focus trapping and restoration', () => {
  const comp = fs.readFileSync(path.join(root, 'src/components/BlindVoiceGate.jsx'), 'utf8')
  assert.match(comp, /dialogRef/, 'Must maintain dialogRef for focus bounding')
  assert.match(comp, /previousFocusRef/, 'Must preserve previous active element for restoration')
  assert.match(comp, /handleTrapFocus/, 'Must implement handleTrapFocus for Tab and Shift+Tab')
  assert.match(comp, /ref=\{dialogRef\}/, 'Must attach dialogRef to modal card')
  assert.match(comp, /aria-live="polite"/, 'Must have aria-live polite on listening status region')
  assert.match(comp, /role="status"/, 'Must have role status on listening status region')
})

test('Day 15: EmergencyToolkit.jsx complies with accessible labeling and hotline controls', () => {
  const comp = fs.readFileSync(path.join(root, 'src/components/EmergencyToolkit.jsx'), 'utf8')
  assert.match(comp, /aria-label="SOS Emergency Alert"/, 'Must declare SOS section landmark')
  assert.match(comp, /aria-label="Indian Transit Emergency Hotlines"/, 'Must label hotlines container')
  assert.match(comp, /aria-label="Add Emergency Contact"/, 'Must label contact form')
  assert.match(comp, /aria-label="Contact name"/, 'Must label name input')
  assert.match(comp, /aria-label="Phone number"/, 'Must label phone input')
  assert.match(comp, /aria-label=\{`Listen audio for \$\{protocol\.id\}`\}/, 'Must have distinct accessible label for audio button')
})

test('Day 15: Navbar.jsx provides primary navigation landmark and accessible trigger', () => {
  const comp = fs.readFileSync(path.join(root, 'src/components/Navbar.jsx'), 'utf8')
  assert.match(comp, /aria-label="Primary navigation"/, 'Must provide primary navigation aria label')
  assert.match(comp, /aria-label="Voice Accessibility Mode \(Alt\+B\)"/, 'Must provide accessible label for voice button')
})
