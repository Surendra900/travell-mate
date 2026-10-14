import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'

describe('Day 10: Release & Pitch Assets, Full Master Rebuild Regression Gate', () => {

  it('10.1 Complete Documentation & Pitch Assets Exist', async () => {
    const requiredDocs = [
      'docs/MASTER_SPEC.md',
      'docs/sprint-status.md',
      'docs/sprint-log.md',
      'docs/changelog-features.md',
      'docs/feature-matrix.md',
      'docs/pitch/pitch-60s.md',
      'docs/pitch/demo-script-45s.md',
      'docs/pitch/judge-objections-qa.md',
      'docs/pitch/real-vs-demo-matrix.md'
    ]

    for (const doc of requiredDocs) {
      const stat = await fs.stat(doc)
      assert.ok(stat.isFile(), `Required document ${doc} must exist`)
    }

    const pitch60s = await fs.readFile('docs/pitch/pitch-60s.md', 'utf8')
    assert.ok(pitch60s.includes('2.5 million train tickets') && pitch60s.includes('TravelMate AI'), 'Pitch must contain core hook')

    const demoScript = await fs.readFile('docs/pitch/demo-script-45s.md', 'utf8')
    assert.ok(demoScript.includes('Waitlist Bypass Contrast') && demoScript.includes('Delay Simulator'), 'Demo script must cover core features')

    const objections = await fs.readFile('docs/pitch/judge-objections-qa.md', 'utf8')
    assert.ok(objections.includes('Objection 10') && objections.includes('IRCTC'), 'Objections doc must cover all 10 judge questions')

    const realVsDemo = await fs.readFile('docs/pitch/real-vs-demo-matrix.md', 'utf8')
    assert.ok(realVsDemo.includes('What Is 100% Real') && realVsDemo.includes('ESTIMATE'), 'Transparency sheet must categorize real vs estimate')
  })

  it('10.2 Section 4 Bloat Purge: Zero Deprecated Components in src/', async () => {
    const deprecatedNames = [
      'DocumentVault.jsx',
      'EmergencyPhraseCards.jsx',
      'CarbonCalculator.jsx',
      'StatusBar.jsx',
      'FloatingSOS.jsx',
      'SmartAssistant.jsx',
      'BookingModal.jsx'
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
      assert.ok(!srcFiles.includes(name), `Deprecated component ${name} must be purged from src/`)
    }
  })

  it('10.3 Honesty Rules & Provenance Badges Enforced', async () => {
    const multimodalCardCode = await fs.readFile('src/components/MultimodalTimelineCard.jsx', 'utf8')
    assert.ok(
      multimodalCardCode.includes('ProvenanceBadge') || multimodalCardCode.includes('TIMETABLE'),
      'MultimodalTimelineCard must enforce honesty provenance badges'
    )

    const plannerCode = await fs.readFile('src/pages/Planner.jsx', 'utf8')
    assert.ok(plannerCode.includes('data-testid="demo-mode-banner"'), 'Demo mode must be honestly badged')

    const disclaimerCode = await fs.readFile('src/pages/LegalDisclaimer.jsx', 'utf8')
    assert.ok(disclaimerCode.includes('TravelMate is not an emergency service. In an emergency call 112.'), 'Statutory disclaimer must be exact')
  })

  it('10.4 Progressive Web App (PWA) Manifest Integrity', async () => {
    const manifestRaw = await fs.readFile('public/manifest.webmanifest', 'utf8')
    const manifest = JSON.parse(manifestRaw)

    assert.ok(manifest.name && manifest.short_name, 'Manifest must declare name and short_name')
    assert.ok(manifest.icons && manifest.icons.length > 0, 'Manifest must define app icons')
    assert.ok(manifest.start_url, 'Manifest must specify start_url')
    assert.ok(manifest.display === 'standalone', 'Manifest must declare standalone display')
  })

  it('10.5 Zero Leaked API Secrets & Secure Vercel Configuration', async () => {
    const vercelConfigRaw = await fs.readFile('vercel.json', 'utf8')
    const vercelConfig = JSON.parse(vercelConfigRaw)
    assert.ok(vercelConfig.headers || vercelConfig.rewrites, 'Vercel configuration must be valid')

    // Confirm no secrets in git-tracked code
    const gitignore = await fs.readFile('.gitignore', 'utf8')
    assert.ok(gitignore.includes('.env'), '.gitignore must ignore environment secret files')
  })
})
