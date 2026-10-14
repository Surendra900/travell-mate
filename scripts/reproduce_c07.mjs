import { chromium } from 'playwright'
import fs from 'node:fs/promises'
import path from 'node:path'

const BASE_URL = 'http://127.0.0.1:5173'
const OUT_DIR = 'docs/fix-evidence/C-07/before'

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true })
  const browser = await chromium.launch({ headless: true })

  try {
    for (const vp of [{ name: 'mobile_390x844', w: 390, h: 844 }, { name: 'desktop_1440x900', w: 1440, h: 900 }]) {
      const context = await browser.newContext({ viewport: { width: vp.w, height: vp.h } })
      const page = await context.newPage()
      page.setDefaultTimeout(15000)

      await page.goto(`${BASE_URL}/planner`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(600)

      // Click "Find live trains" or search button
      const searchBtn = page.locator('button:has-text("Find live trains"), button:has-text("Find tickets"), button:has-text("Search")').first()
      if (await searchBtn.isVisible()) {
        await searchBtn.click()
        await page.waitForTimeout(1000)
      }

      // Check for fixed backdrop modal
      const modalBackdrop = await page.locator('.live-results-backdrop.fixed.inset-0').count()
      const bodyOverflow = await page.evaluate(() => document.body.style.overflow)

      const report = {
        viewport: vp.name,
        modalBackdropPresent: modalBackdrop > 0,
        bodyOverflow,
        isBlockingModal: (modalBackdrop > 0 && bodyOverflow === 'hidden')
      }

      await page.screenshot({ path: path.join(OUT_DIR, `${vp.name}.png`) })
      await fs.writeFile(path.join(OUT_DIR, `${vp.name}_report.json`), JSON.stringify(report, null, 2), 'utf8')
      console.log(`C-07 Before ${vp.name}: modalBackdrop=${modalBackdrop}, bodyOverflow=${bodyOverflow}`)
      await context.close()
    }
  } finally {
    await browser.close()
  }
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
