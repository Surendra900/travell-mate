import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { TRANSIT_HOTLINES, TRANSIT_INCIDENT_PROTOCOLS, emergencyCards } from '../src/data/emergencyData.js'
import { generateMultimodalRoutes } from '../src/utils/multimodalRouter.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

test('F-09: BlindVoiceGate.jsx and secureVault.js are completely excised from repo', () => {
  const blindGateExists = fs.existsSync(path.join(root, 'src/components/BlindVoiceGate.jsx'))
  const secureVaultExists = fs.existsSync(path.join(root, 'src/utils/secureVault.js'))
  assert.equal(blindGateExists, false, 'BlindVoiceGate.jsx must not exist')
  assert.equal(secureVaultExists, false, 'secureVault.js must not exist')
})

test('F-09: Zero residual imports or references to BlindVoiceGate or secureVault in src/', () => {
  function scanDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        scanDir(fullPath)
      } else if (entry.isFile() && (entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
        const content = fs.readFileSync(fullPath, 'utf8')
        assert.ok(!content.includes('BlindVoiceGate'), `${entry.name} must not mention BlindVoiceGate`)
        assert.ok(!content.includes('secureVault') && !content.includes('SecureVault'), `${entry.name} must not mention secureVault`)
      }
    }
  }

  scanDir(path.join(root, 'src'))
})

test('F-14: Multimodal tier labels are clean, professional transit titles without emoji clutter', () => {
  const routes = generateMultimodalRoutes({ from: 'NDLS', to: 'PNBE', date: '2026-10-15' })
  assert.ok(routes.length > 0, 'Routes should be generated')

  for (const route of routes) {
    assert.doesNotMatch(route.tierLabel, /[🟢🔵⚡]/, `Tier label "${route.tierLabel}" must not contain emojis`)
  }

  const liveResultsContent = fs.readFileSync(path.join(root, 'src/components/LiveResultsPanel.jsx'), 'utf8')
  assert.doesNotMatch(liveResultsContent, /'🟢 Under ₹1,000/, 'LiveResultsPanel filterOptions must not have emoji in budget filter')
  assert.doesNotMatch(liveResultsContent, /'⚡ Bypass Contrast/, 'LiveResultsPanel filterOptions must not have emoji in bypass filter')
})

test('F-13: Emergency hotlines (112, 139, 108, 1090) and incident protocols remain intact', () => {
  assert.ok(TRANSIT_HOTLINES.some(h => h.number === '112'), '112 (National Emergency) must exist')
  assert.ok(TRANSIT_HOTLINES.some(h => h.number === '139'), '139 (RailMadad) must exist')
  assert.ok(TRANSIT_HOTLINES.some(h => h.number === '108'), '108 (Ambulance) must exist')
  assert.ok(TRANSIT_HOTLINES.some(h => h.number === '1090'), '1090 (Women Helpline) must exist')
  assert.ok(TRANSIT_INCIDENT_PROTOCOLS.length >= 4, 'Must provide full transit incident protocols')
  assert.ok(emergencyCards.length >= 3, 'Must provide emergency flow cards')
})
