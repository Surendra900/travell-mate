import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import { getDpdpConsent, purgeAllUserData } from '../src/utils/dpdpConsent.js'

describe('Day 9: Security Hardening, DPDP 2023 Compliance & Legal Architecture', () => {

  it('9.1 DPDP 2023 Compliance & Zero-ID Storage Policy', async () => {
    const privacyCode = await fs.readFile('src/pages/PrivacyPolicy.jsx', 'utf8')

    // DPDP Act 2023 and Zero-ID Policy
    assert.ok(privacyCode.includes('India DPDP Act 2023 Compliant'), 'Must declare DPDP Act 2023 compliance')
    assert.ok(privacyCode.includes('Zero-ID Storage Policy') || privacyCode.includes('Zero-ID architecture'), 'Must specify Zero-ID policy')
    assert.ok(privacyCode.includes('data-testid="dpdp-erase-all-btn"'), 'Must provide 1-click erasure action')

    // dpdpConsent utility functions
    assert.equal(typeof getDpdpConsent, 'function')
    assert.equal(typeof purgeAllUserData, 'function')

    const initialConsent = getDpdpConsent()
    assert.ok(typeof initialConsent === 'object' && initialConsent !== null, 'Must return consent preferences')
  })

  it('9.2 Legal Pages: Terms of Service, Legal Disclaimers & Route Registrations', async () => {
    // Terms of Service
    const termsCode = await fs.readFile('src/pages/TermsOfService.jsx', 'utf8')
    assert.ok(termsCode.includes('Independent Booking & Deep Linking'), 'Must state independent booking model')
    assert.ok(termsCode.includes('No Automated Booking or Captcha Bypass'), 'Must state prohibition of automated ticketing')

    // Legal Disclaimers
    const disclaimerCode = await fs.readFile('src/pages/LegalDisclaimer.jsx', 'utf8')
    assert.ok(
      disclaimerCode.includes('TravelMate is not an emergency service') && disclaimerCode.includes('112'),
      'Must declare statutory emergency disclaimer'
    )
    assert.ok(
      disclaimerCode.includes('OpenStreetMap') && disclaimerCode.includes('Open-Meteo'),
      'Must attribute open data sources and licenses'
    )

    // Route registrations in App.jsx
    const appCode = await fs.readFile('src/App.jsx', 'utf8')
    assert.ok(appCode.includes('path="/privacy"'), 'App.jsx must register /privacy route')
    assert.ok(appCode.includes('path="/terms"'), 'App.jsx must register /terms route')
    assert.ok(appCode.includes('path="/disclaimer"'), 'App.jsx must register /disclaimer route')
  })

  it('9.3 User Feedback Loop & Accessible Dialog Semantics', async () => {
    const feedbackModalCode = await fs.readFile('src/components/FeedbackModal.jsx', 'utf8')
    assert.ok(feedbackModalCode.includes('role="dialog"'), 'FeedbackModal must implement role="dialog"')
    assert.ok(feedbackModalCode.includes('aria-modal="true"'), 'FeedbackModal must implement aria-modal="true"')
    assert.ok(feedbackModalCode.includes('data-testid="feedback-modal"'), 'Must define data-testid="feedback-modal"')
    assert.ok(feedbackModalCode.includes('data-testid="submit-feedback-btn"'), 'Must define data-testid="submit-feedback-btn"')

    const footerCode = await fs.readFile('src/components/Footer.jsx', 'utf8')
    assert.ok(footerCode.includes('data-testid="footer-feedback-btn"'), 'Footer must expose give feedback button')
    assert.ok(footerCode.includes('data-testid="footer-privacy-link"'), 'Footer must link to privacy')
    assert.ok(footerCode.includes('data-testid="footer-terms-link"'), 'Footer must link to terms')
    assert.ok(footerCode.includes('data-testid="footer-disclaimer-link"'), 'Footer must link to disclaimers')
  })

  it('9.4 Error Boundary & Graceful Degradation', async () => {
    const errorBoundaryCode = await fs.readFile('src/components/PageErrorBoundary.jsx', 'utf8')
    assert.ok(errorBoundaryCode.includes('getDerivedStateFromError'), 'ErrorBoundary must implement getDerivedStateFromError')
    assert.ok(errorBoundaryCode.includes('componentDidCatch'), 'ErrorBoundary must implement componentDidCatch')
    assert.ok(errorBoundaryCode.includes('Reload page'), 'ErrorBoundary must present user reload recovery option')
    assert.ok(errorBoundaryCode.includes('Go to home'), 'ErrorBoundary must present navigate home recovery option')
  })

  it('9.5 SEO, OpenGraph Metadata & Social Previews in index.html', async () => {
    const indexHtml = await fs.readFile('index.html', 'utf8')

    // Canonical Title & Description
    assert.ok(indexHtml.includes('TravelMate — Multimodal Disruption & Route Recovery Engine'), 'Title must be accurate')
    assert.ok(indexHtml.includes('name="description"'), 'Meta description must be declared')

    // OpenGraph
    assert.ok(indexHtml.includes('property="og:type" content="website"'), 'og:type must be website')
    assert.ok(indexHtml.includes('property="og:title"'), 'og:title must be declared')
    assert.ok(indexHtml.includes('property="og:description"'), 'og:description must be declared')
    assert.ok(indexHtml.includes('property="og:image"'), 'og:image must be declared')

    // Twitter Card
    assert.ok(indexHtml.includes('name="twitter:card" content="summary_large_image"'), 'twitter:card must be configured')
    assert.ok(indexHtml.includes('name="twitter:title"'), 'twitter:title must be declared')

    // Referrer Policy
    assert.ok(indexHtml.includes('name="referrer" content="strict-origin-when-cross-origin"'), 'Strict referrer policy required')
  })

  it('9.6 Client Security: Zero Leaked API Secrets in Source Code', async () => {
    const srcFiles = []
    async function walk(dir) {
      const entries = await fs.readdir(dir, { withFileTypes: true })
      for (const entry of entries) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          if (entry.name !== 'node_modules' && entry.name !== '.git') await walk(full)
        } else if (/\.(jsx?|tsx?)$/.test(entry.name)) {
          srcFiles.push(full)
        }
      }
    }
    await walk('src')

    const secretPatterns = [
      /AIzaSy[0-9A-Za-z_-]{33}/, // Google AI key pattern
      /sk-[0-9A-Za-z]{32,}/,     // Standard secret key pattern
      /samba_[0-9A-Za-z_-]{20,}/ // SambaNova key pattern
    ]

    for (const file of srcFiles) {
      const code = await fs.readFile(file, 'utf8')
      for (const pattern of secretPatterns) {
        assert.ok(
          !pattern.test(code),
          `Potential hardcoded secret matching ${pattern} found in ${file}`
        )
      }
    }
  })
})
