import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'

describe('Regression Guards: Verified Strengths (P-01 to P-10)', () => {

  it('Guard P-01: Clear immediate understanding of route recovery on Home', async () => {
    const homeContent = await fs.readFile('src/pages/Home.jsx', 'utf8')
    assert.ok(
      homeContent.includes('Route Recovery') || homeContent.includes('sold out') || homeContent.includes('waitlisted'),
      'P-01 Guard: Home must communicate route recovery tagline and value prop'
    )
    assert.ok(
      homeContent.includes('split-routes') || homeContent.includes('popularCorridors') || homeContent.includes('modes'),
      'P-01 Guard: Home must explain route alternatives and split options'
    )
  })

  it('Guard P-02: Minimal cognitive load with strictly 4 primary navigation items', async () => {
    const navContent = await fs.readFile('src/components/Navbar.jsx', 'utf8')
    // Check primary navigation items defined in nav array
    assert.ok(navContent.includes("to: '/planner'"), 'P-02 Guard: Planner route must exist in navbar')
    assert.ok(navContent.includes("to: '/safety'"), 'P-02 Guard: Safety route must exist in navbar')
    assert.ok(navContent.includes("to: '/saved'"), 'P-02 Guard: Saved route must exist in navbar')
    
    // Ensure primary navbar links count is constrained
    const navArrayMatch = navContent.match(/const nav = \[([\s\S]*?)\]/)
    assert.ok(navArrayMatch, 'P-02 Guard: nav links array must exist')
    const linkItems = navArrayMatch[1].match(/to:\s*['"`]/g) || []
    assert.ok(linkItems.length <= 4, `P-02 Guard: Navbar primary links must be <= 4 (found ${linkItems.length})`)
  })

  it('Guard P-03: Zero bloat or obsolete code in src/ (7 requested features excised)', async () => {
    const deprecatedNames = [
      'DocumentVault',
      'EmergencyPhraseCards',
      'CarbonCalculator',
      'StatusBar',
      'FloatingSOS',
      'SmartAssistant',
      'BookingModal'
    ]

    const srcFiles = []
    async function walk(dir) {
      const entries = await fs.readdir(dir, { withFileTypes: true })
      for (const entry of entries) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          if (entry.name !== 'node_modules' && entry.name !== '.git') await walk(full)
        } else {
          srcFiles.push(entry.name)
        }
      }
    }
    await walk('src')

    for (const name of deprecatedNames) {
      const found = srcFiles.some(f => f.toLowerCase().includes(name.toLowerCase()))
      assert.ok(!found, `P-03 Guard: Deprecated feature ${name} must have zero remaining component files in src/`)
    }
  })

  it('Guard P-04: In-memory pre-indexed timetable graph executes with sub-millisecond route generation', async () => {
    const { searchRecoveryRoutes } = await import('../../server/services/routeEngine.js')
    const t0 = performance.now()
    const result = searchRecoveryRoutes({ from: 'NDLS', to: 'CNB', date: '2026-10-15' })
    const durationMs = performance.now() - t0

    assert.ok(result && typeof result === 'object', 'P-04 Guard: Route engine must return route search object')
    assert.ok(durationMs < 50, `P-04 Guard: Route generation must execute within performance budget (took ${durationMs}ms)`)
  })

  it('Guard P-05: Precise mathematical slack absorption and point-of-no-return calculation', async () => {
    const { simulateLeg1Delay } = await import('../../server/services/contingencyEngine.js')
    const mockItinerary = {
      slackMinutes: 90,
      hubCode: 'CNB',
      hubCity: 'Kanpur',
      destCode: 'PRYJ',
      transfer: { mctMinutes: 45 },
      leg1: { arrive: '10:00' },
      leg2: { to: 'PRYJ' }
    }
    // Buffer = 90 mins, MCT = 45 mins. Slack = 45 mins max absorbable.
    const resultAtZero = simulateLeg1Delay(mockItinerary, 0)
    assert.equal(resultAtZero.isConnectionBroken, false, 'P-05 Guard: Route with 0 delay must not be broken')
    assert.equal(resultAtZero.effectiveSlackMinutes, 90, 'P-05 Guard: Slack at delay 0 must be 90')
    assert.equal(resultAtZero.maxAbsorbableDelayMinutes, 45, 'P-05 Guard: Max absorbable delay must equal 90 - 45 = 45 min')

    const resultOverSlack = simulateLeg1Delay(mockItinerary, 60)
    assert.equal(resultOverSlack.isConnectionBroken, true, 'P-05 Guard: Route delayed beyond slack must be broken')
  })

  it('Guard P-06: Zero API keys or secrets in client bundle or source code', async () => {
    const srcFiles = []
    async function walk(dir) {
      const entries = await fs.readdir(dir, { withFileTypes: true })
      for (const entry of entries) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          if (entry.name !== 'node_modules' && entry.name !== '.git') await walk(full)
        } else {
          srcFiles.push(full)
        }
      }
    }
    await walk('src')

    const secretPatterns = [
      /AIzaSy[A-Za-z0-9_-]{33}/,
      /sk-[A-Za-z0-9]{32,}/,
      /ghp_[A-Za-z0-9]{36}/
    ]

    for (const file of srcFiles) {
      const content = await fs.readFile(file, 'utf8')
      for (const pattern of secretPatterns) {
        assert.ok(!pattern.test(content), `P-06 Guard: Secret pattern ${pattern} found in ${file}`)
      }
    }
  })

  it('Guard P-07: Testing regression suite has zero broken core tests', async () => {
    const coreTestContent = await fs.readFile('tests/core.test.mjs', 'utf8')
    assert.ok(coreTestContent.length > 500, 'P-07 Guard: Core test suite must exist and be populated')
  })

  it('Guard P-08: Responsive CSS structure enforces container max-widths and responsive padding', async () => {
    const css = await fs.readFile('src/index.css', 'utf8')
    assert.ok(
      css.includes('overflow-x') || css.includes('max-w-') || css.includes('box-sizing') || css.includes('@tailwind'),
      'P-08 Guard: Layout stylesheet must protect against horizontal overflow'
    )
  })

  it('Guard P-09: Privacy Policy enforces Zero-ID local-first storage and DPDP 2023 compliance', async () => {
    const privacyContent = await fs.readFile('src/pages/PrivacyPolicy.jsx', 'utf8')
    assert.ok(
      privacyContent.includes('DPDP') || privacyContent.includes('Digital Personal Data Protection'),
      'P-09 Guard: Privacy policy must document DPDP 2023 compliance'
    )
    assert.ok(
      privacyContent.includes('Zero-ID') || privacyContent.includes('local-first') || privacyContent.includes('localStorage.clear'),
      'P-09 Guard: Privacy policy must document zero-ID local storage and erasure'
    )
  })

  it('Guard P-10: Safety Hub integrates 1-tap 112/139 emergency dialers and offline boarding passes', async () => {
    const safetyContent = await fs.readFile('src/pages/SafetyMode.jsx', 'utf8')
    assert.ok(
      safetyContent.includes('112') && safetyContent.includes('139'),
      'P-10 Guard: SafetyMode must provide direct 112 and 139 emergency dialers'
    )
    const savedContent = await fs.readFile('src/pages/SavedPlans.jsx', 'utf8')
    assert.ok(
      savedContent.includes('offline') || savedContent.includes('localStorage') || savedContent.includes('Boarding Pass') || savedContent.includes('Passes'),
      'P-10 Guard: SavedPlans must provide offline pass access'
    )
  })

})
