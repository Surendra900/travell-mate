import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const BASE_URL = 'http://127.0.0.1:5173'
const OUTPUT_DIR = path.resolve('docs/launch-readiness/screenshots/baseline')

const routes = [
  { name: 'home', path: '/' },
  { name: 'safety', path: '/safety' },
  { name: 'emergency-detail', path: '/safety/medical' },
  { name: 'planner', path: '/planner' },
  { name: 'saved', path: '/saved' },
  { name: 'analyze', path: '/analyze' },
  { name: 'privacy', path: '/privacy' },
  { name: 'terms', path: '/terms' },
  { name: 'disclaimer', path: '/disclaimer' }
]

const viewports = [
  { label: 'mobile-390x844', width: 390, height: 844 },
  { label: 'desktop-1440x900', width: 1440, height: 900 }
]

async function run() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true })
  }

  const browser = await chromium.launch({ headless: true })
  try {
    for (const vp of viewports) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height }
      })
      const page = await context.newPage()
      page.setDefaultTimeout(15000)

      for (const route of routes) {
        const url = `${BASE_URL}${route.path}`
        console.log(`Capturing ${route.name} at ${vp.label}...`)
        try {
          await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 })
        } catch {
          // If networkidle times out, wait 1 second
          await page.waitForTimeout(1000)
        }
        await page.waitForTimeout(500)
        const filePath = path.join(OUTPUT_DIR, `${vp.label}-${route.name}.png`)
        await page.screenshot({ path: filePath, fullPage: false })
      }
      await context.close()
    }
    console.log('Baseline screenshots captured successfully.')
  } finally {
    await browser.close()
  }
}

run().catch((err) => {
  console.error('Failed to capture screenshots:', err)
  process.exit(1)
})
