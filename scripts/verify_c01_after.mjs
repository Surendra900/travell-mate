import { chromium } from 'playwright'
import fs from 'node:fs/promises'
import path from 'node:path'

const BASE_URL = 'http://127.0.0.1:5173'
const OUT_DIR = 'docs/fix-evidence/C-01/after'

async function main() {
  await fs.mkdir(OUT_DIR, { recursive: true })
  const browser = await chromium.launch({ headless: true })

  try {
    for (const vp of [{ name: 'mobile_390x844', w: 390, h: 844 }, { name: 'desktop_1440x900', w: 1440, h: 900 }]) {
      const context = await browser.newContext({ viewport: { width: vp.w, height: vp.h } })
      const page = await context.newPage()
      page.setDefaultTimeout(15000)

      await page.goto(BASE_URL, { waitUntil: 'networkidle' })
      await page.waitForTimeout(600)

      const voiceGate = await page.locator('[data-testid="blind-voice-gate"]').count()
      const locGate = await page.locator('.location-gate').count()

      console.log(`C-01 After ${vp.name}: voiceGate=${voiceGate}, locGate=${locGate}`)

      if (voiceGate > 0 || locGate > 0) {
        throw new Error(`C-01 verification failed on ${vp.name}: Dialogs are still visible on cold load!`)
      }

      // Verify that user can immediately interact with the search box without dismissing any modal
      const fromInput = page.locator('#home-from-input')
      await fromInput.waitFor({ state: 'visible', timeout: 5000 })
      await fromInput.click()
      await fromInput.fill('NDLS')

      await page.screenshot({ path: path.join(OUT_DIR, `${vp.name}.png`) })
      const report = {
        viewport: vp.name,
        voiceGateFound: voiceGate > 0,
        locGateFound: locGate > 0,
        unblockedInteraction: true,
        inputValue: await fromInput.inputValue()
      }
      await fs.writeFile(path.join(OUT_DIR, `${vp.name}_report.json`), JSON.stringify(report, null, 2), 'utf8')
      console.log(`C-01 After ${vp.name} verified successfully.`)
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
