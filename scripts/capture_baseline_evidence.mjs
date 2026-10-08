import { chromium } from 'playwright'
import fs from 'node:fs/promises'
import path from 'node:path'
import { execSync } from 'node:child_process'

const BASE_URL = 'http://127.0.0.1:5173'
const OUT_DIR = 'docs/fix-evidence/baseline'
const SCREENSHOTS_DIR = path.join(OUT_DIR, 'screenshots')

async function main() {
  await fs.mkdir(SCREENSHOTS_DIR, { recursive: true })

  console.log('--- Capturing Build & Bundle Metrics ---')
  const buildOutput = execSync('npm run build', { encoding: 'utf8' })
  await fs.writeFile(path.join(OUT_DIR, 'build_output.txt'), buildOutput, 'utf8')

  // Find dist files and sizes
  const distAssets = await fs.readdir('dist/assets')
  const assetDetails = []
  for (const asset of distAssets) {
    const stat = await fs.stat(path.join('dist/assets', asset))
    assetDetails.push({ name: asset, bytes: stat.size, kb: (stat.size / 1024).toFixed(2) })
  }
  await fs.writeFile(path.join(OUT_DIR, 'bundle_sizes.json'), JSON.stringify(assetDetails, null, 2), 'utf8')

  console.log('--- Running Baseline Tests ---')
  let testOutput = ''
  try {
    testOutput = execSync('npm test', { encoding: 'utf8' })
  } catch (err) {
    testOutput = err.stdout || err.message
  }
  await fs.writeFile(path.join(OUT_DIR, 'test_output.txt'), testOutput, 'utf8')

  console.log('--- Capturing Route Screenshots in Fresh Browser ---')
  const browser = await chromium.launch({ headless: true })

  const routes = [
    { name: 'home', path: '/' },
    { name: 'planner', path: '/planner' },
    { name: 'safety', path: '/safety' },
    { name: 'saved', path: '/saved' },
    { name: 'privacy', path: '/privacy' },
    { name: 'terms', path: '/terms' },
    { name: 'disclaimer', path: '/disclaimer' }
  ]

  const viewports = [
    { name: 'mobile_390x844', width: 390, height: 844 },
    { name: 'desktop_1440x900', width: 1440, height: 900 }
  ]

  try {
    for (const vp of viewports) {
      for (const route of routes) {
        // Fresh context for each route to test cold visitor state
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        const page = await context.newPage()
        page.setDefaultTimeout(15000)

        const url = `${BASE_URL}${route.path}`
        await page.goto(url, { waitUntil: 'networkidle' })
        await page.waitForTimeout(600) // stabilize UI

        const filename = `${route.name}_${vp.name}.png`
        await page.screenshot({ path: path.join(SCREENSHOTS_DIR, filename), fullPage: false })
        console.log(`Captured ${filename}`)
        await context.close()
      }
    }
  } finally {
    await browser.close()
  }

  console.log('Baseline evidence capture complete.')
}

main().catch(err => {
  console.error('Error capturing baseline evidence:', err)
  process.exit(1)
})
