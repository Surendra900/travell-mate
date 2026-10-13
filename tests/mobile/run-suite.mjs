/**
 * TravelMate Mobile UI Suite Runner
 * Executes the full detector suite across the device matrix and captures before/after visual evidence.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium, webkit, firefox } from 'playwright'
import { DEVICE_MATRIX, ROUTE_STATES } from './matrix.js'
import {
  detectHorizontalOverflow,
  detectObscuredControls,
  detectTouchTargetViolations,
  detectTypographyViolations,
  detectViewportFixedViolations,
  runA11yScan
} from './detectors.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '../..')
const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5173'
const CAPTURE_DIR = process.env.CAPTURE_MODE === 'after' ? 'after' : 'before'

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
}

export async function runMobileSuite({ captureOnly = false, engine = 'chromium' } = {}) {
  console.log(`\n======================================================`)
  console.log(`  TRAVELMATE MOBILE DETECTOR SUITE`)
  console.log(`  Mode: ${CAPTURE_DIR.toUpperCase()} | Engine: ${engine} | URL: ${BASE_URL}`)
  console.log(`======================================================\n`)

  const browserType = engine === 'webkit' ? webkit : engine === 'firefox' ? firefox : chromium
  const browser = await browserType.launch({ headless: true })

  const issues = []
  let issueCounter = 1

  function addIssue({ route, state, device, category, severity, evidence, rootCause = '', plannedFix = '' }) {
    const id = `M-${String(issueCounter++).padStart(3, '0')}`
    issues.push({
      id,
      route,
      state,
      device,
      category,
      severity,
      evidence,
      rootCause,
      plannedFix,
      status: 'Open'
    })
  }

  const screenshotsBase = path.resolve(ROOT, `docs/mobile/screenshots/${CAPTURE_DIR}`)
  await ensureDir(screenshotsBase)

  try {
    for (const dev of DEVICE_MATRIX) {
      console.log(`\nEvaluating device: ${dev.name} (${dev.width}x${dev.height})`)
      const devDir = path.resolve(screenshotsBase, dev.id)
      await ensureDir(devDir)

      const context = await browser.newContext({
        viewport: { width: dev.width, height: dev.height },
        isMobile: dev.isMobile,
        hasTouch: dev.hasTouch,
        userAgent: dev.isMobile
          ? 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
          : undefined
      })

      const page = await context.newPage()
      page.setDefaultTimeout(15000)

      for (const route of ROUTE_STATES) {
        const fullUrl = `${BASE_URL}${route.path}`
        try {
          await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 15000 })
          // Allow transient micro-tasks / translations to settle
          await page.waitForTimeout(600)

          // Perform specific route state actions
          if (route.action === 'openNav') {
            const menuBtn = await page.$('button[aria-controls="mobile-navigation"]')
            if (menuBtn && await menuBtn.isVisible()) {
              await menuBtn.click()
              await page.waitForTimeout(300)
            }
          } else if (route.action === 'openVoice') {
            const voiceBtn = await page.$('button[data-testid="voice-search-launcher"]')
            if (voiceBtn && await voiceBtn.isVisible()) {
              await voiceBtn.click()
              await page.waitForTimeout(300)
            }
          } else if (route.action === 'openSosTab') {
            const sosBtn = await page.$('button:has-text("SOS Dialers")')
            if (sosBtn && await sosBtn.isVisible()) {
              await sosBtn.click()
              await page.waitForTimeout(300)
            }
          }

          // 1. Capture visual evidence
          const screenshotName = `${route.id}.png`
          const screenshotPath = path.resolve(devDir, screenshotName)
          const relScreenshotPath = `docs/mobile/screenshots/${CAPTURE_DIR}/${dev.id}/${screenshotName}`
          await page.screenshot({ path: screenshotPath, fullPage: true })

          // 2. Run Horizontal Overflow Detector
          const overflow = await detectHorizontalOverflow(page)
          if (overflow.hasOverflow) {
            const offenderNames = overflow.offenders.map(o => o.selector).join(', ')
            addIssue({
              route: route.path,
              state: route.name,
              device: dev.id,
              category: 'Horizontal Overflow',
              severity: 'Critical',
              evidence: `${relScreenshotPath} (scrollWidth ${overflow.scrollWidth} > clientWidth ${overflow.clientWidth})`,
              rootCause: offenderNames ? `Spillover from ${offenderNames}` : 'Container width exceeds viewport',
              plannedFix: 'Enforce fluid width max-w-full and min-w-0'
            })
          }

          // 3. Run Obscured Interactive Controls Detector
          const obscured = await detectObscuredControls(page)
          if (obscured.length > 0) {
            for (const item of obscured.slice(0, 3)) {
              addIssue({
                route: route.path,
                state: route.name,
                device: dev.id,
                category: 'Obscured Control',
                severity: 'High',
                evidence: `${relScreenshotPath} (${item.element} ${item.issue})`,
                rootCause: item.obscuredBy ? `Occluded by ${item.obscuredBy}` : item.details,
                plannedFix: 'Adjust z-index, add container safe padding, or redesign stacking'
              })
            }
          }

          // 4. Run Touch Target Detector
          const targetViolations = await detectTouchTargetViolations(page)
          if (targetViolations.length > 0) {
            const under24 = targetViolations.filter(v => v.type === 'under_wcag_24px')
            if (under24.length > 0) {
              addIssue({
                route: route.path,
                state: route.name,
                device: dev.id,
                category: 'Touch Target Size',
                severity: 'High',
                evidence: `${relScreenshotPath} (${under24[0].selector} is ${under24[0].size})`,
                rootCause: 'Control bounding box under WCAG 2.2 AA 24px minimum',
                plannedFix: 'Increase min-height/min-width to 44px'
              })
            }
          }

          // 5. Run Typography and Input Font Size Detector
          const typoViolations = await detectTypographyViolations(page)
          const inputFontViolations = typoViolations.filter(v => v.type === 'input_font_under_16px')
          if (inputFontViolations.length > 0) {
            addIssue({
              route: route.path,
              state: route.name,
              device: dev.id,
              category: 'Input Font Size (iOS Auto-Zoom)',
              severity: 'High',
              evidence: `${relScreenshotPath} (${inputFontViolations[0].selector} font-size is ${inputFontViolations[0].fontSize})`,
              rootCause: 'Input font-size below 16px triggers iOS Safari automatic zoom',
              plannedFix: 'Enforce font-size: 16px / text-base on all input controls'
            })
          }

          // 6. Run Viewport & Fixed Elements Detector
          const fixedViolations = await detectViewportFixedViolations(page)
          if (fixedViolations.length > 0) {
            for (const v of fixedViolations) {
              addIssue({
                route: route.path,
                state: route.name,
                device: dev.id,
                category: 'Modal/Fixed Viewport Overflow',
                severity: 'High',
                evidence: `${relScreenshotPath} (${v.selector} height: ${v.height})`,
                rootCause: 'Modal container taller than dynamic viewport height',
                plannedFix: 'Replace vh with calc(100dvh - safe-area) and add internal scrolling'
              })
            }
          }

          // 7. A11y & Structural Scan (Sample primary devices)
          if (dev.id === 'mobile-360' || dev.id === 'mobile-390') {
            const a11yErrors = await runA11yScan(page)
            if (a11yErrors.length > 0) {
              for (const a11y of a11yErrors) {
                addIssue({
                  route: route.path,
                  state: route.name,
                  device: dev.id,
                  category: 'Accessibility',
                  severity: a11y.impact === 'critical' ? 'High' : 'Medium',
                  evidence: `${relScreenshotPath} (axe: ${a11y.id})`,
                  rootCause: a11y.description,
                  plannedFix: 'Add missing labels or semantic markup'
                })
              }
            }
          }

          process.stdout.write('.')
        } catch (err) {
          console.error(`\n[Error] Failed scanning ${route.id} on ${dev.id}: ${err.message}`)
        }
      }
      await context.close()
    }
  } finally {
    await browser.close()
  }

  // Write issues.csv
  const csvPath = path.resolve(ROOT, 'docs/mobile/issues.csv')
  const csvHeaders = 'ID,Route,State,Devices Affected,Category,Severity,Evidence,Root Cause,Planned Fix,Status\n'
  const csvRows = issues.map(iss => (
    `"${iss.id}","${iss.route}","${iss.state}","${iss.device}","${iss.category}","${iss.severity}","${iss.evidence.replace(/"/g, '""')}","${iss.rootCause.replace(/"/g, '""')}","${iss.plannedFix.replace(/"/g, '""')}","${iss.status}"`
  )).join('\n')

  fs.writeFileSync(csvPath, csvHeaders + csvRows, 'utf8')

  const critical = issues.filter(i => i.severity === 'Critical').length
  const high = issues.filter(i => i.severity === 'High').length
  const medium = issues.filter(i => i.severity === 'Medium').length
  const low = issues.filter(i => i.severity === 'Low').length

  console.log(`\n\nDetector run finished:`)
  console.log(`Total Issues Logged: ${issues.length}`)
  console.log(`  Critical: ${critical}`)
  console.log(`  High:     ${high}`)
  console.log(`  Medium:   ${medium}`)
  console.log(`  Low:      ${low}`)
  console.log(`Results saved to: docs/mobile/issues.csv\n`)

  return { total: issues.length, critical, high, medium, low, issues }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  runMobileSuite()
    .then(() => process.exit(0))
    .catch(err => {
      console.error(err)
      process.exit(1)
    })
}
