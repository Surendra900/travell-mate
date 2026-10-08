import { chromium } from 'playwright'
import fs from 'node:fs/promises'
import path from 'node:path'

const BASE_URL = 'http://127.0.0.1:5173'
const OUT_DIR = 'docs/fix-evidence/C-01/before'

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

      const report = {
        viewport: vp.name,
        voiceGateFound: voiceGate > 0,
        locGateFound: locGate > 0,
        blocked: (voiceGate > 0 || locGate > 0)
      }

      await page.screenshot({ path: path.join(OUT_DIR, `${vp.name}.png`) })
      await fs.writeFile(path.join(OUT_DIR, `${vp.name}_report.json`), JSON.stringify(report, null, 2), 'utf8')
      console.log(`C-01 Before ${vp.name}: blocked=${report.blocked}, voiceGate=${voiceGate}, locGate=${locGate}`)
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
