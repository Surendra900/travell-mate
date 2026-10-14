import { chromium } from 'playwright'
import fs from 'node:fs/promises'
import path from 'node:path'

const BASE_URL = 'http://127.0.0.1:5173'
const OUT_DIR_C07 = 'docs/fix-evidence/C-07/after'
const OUT_DIR_C11 = 'docs/fix-evidence/C-11/after'

async function main() {
  await fs.mkdir(OUT_DIR_C07, { recursive: true })
  await fs.mkdir(OUT_DIR_C11, { recursive: true })
  const browser = await chromium.launch({ headless: true })

  try {
    for (const vp of [{ name: 'mobile_390x844', w: 390, h: 844 }, { name: 'desktop_1440x900', w: 1440, h: 900 }]) {
      const context = await browser.newContext({ viewport: { width: vp.w, height: vp.h } })
      const page = await context.newPage()
      page.setDefaultTimeout(15000)

      await page.goto(`${BASE_URL}/planner`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(600)

      const searchBtn = page.locator('button:has-text("Find live trains"), button:has-text("Find tickets"), button:has-text("Search")').first()
      if (await searchBtn.isVisible()) {
        await searchBtn.click()
        await page.waitForTimeout(1000)
      }

      // Check for inline rendering
      const inlineSection = await page.locator('#live-results-section').count()
      const modalBackdrop = await page.locator('.live-results-backdrop.fixed.inset-0').count()
      const bodyOverflow = await page.evaluate(() => document.body.style.overflow)
      const bypassContrastCount = await page.locator('[data-testid="waitlist-bypass-contrast"], .waitlist-bypass-contrast').count()

      console.log(`C-07 After ${vp.name}: inlineSection=${inlineSection}, modalBackdrop=${modalBackdrop}, bodyOverflow=${bodyOverflow}, contrastCount=${bypassContrastCount}`)

      if (modalBackdrop > 0) {
        throw new Error(`C-07 failed: modal backdrop is still present!`)
      }
      if (bodyOverflow === 'hidden') {
        throw new Error(`C-07 failed: body overflow is still locked with hidden!`)
      }
      if (inlineSection === 0) {
        throw new Error(`C-07 failed: inline results section is not rendered!`)
      }

      const report = {
        viewport: vp.name,
        inlineSectionPresent: inlineSection > 0,
        modalBackdropPresent: modalBackdrop > 0,
        bodyOverflow,
        bypassContrastCount
      }

      await page.screenshot({ path: path.join(OUT_DIR_C07, `${vp.name}.png`) })
      await fs.writeFile(path.join(OUT_DIR_C07, `${vp.name}_report.json`), JSON.stringify(report, null, 2), 'utf8')

      // Also save to C-11 evidence
      await page.screenshot({ path: path.join(OUT_DIR_C11, `${vp.name}.png`) })
      await fs.writeFile(path.join(OUT_DIR_C11, `${vp.name}_report.json`), JSON.stringify(report, null, 2), 'utf8')

      await context.close()
    }
  } finally {
    await browser.close()
  }
  console.log('C-07 and C-11 verification passed successfully!')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
