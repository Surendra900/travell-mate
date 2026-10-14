import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function captureC15After() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const outDir = 'docs/fix-evidence/C-15/after';
  fs.mkdirSync(outDir, { recursive: true });

  await page.goto('http://127.0.0.1:5173/planner?from=Delhi+(NDLS)&to=Patna+(PNBE)&transportMode=Train&date=2026-10-15', {
    waitUntil: 'networkidle'
  });

  const disclaimer = page.locator('[data-testid="unbundled-ticketing-disclaimer"]').first();
  await disclaimer.waitFor({ state: 'visible', timeout: 10000 });
  const disclaimerText = await disclaimer.textContent();

  const report = {
    test: 'C-15: Unbundled ticket cancellation and missed connection risk across separate PNRs',
    url: page.url(),
    disclaimerVisible: true,
    disclaimerSnippet: disclaimerText.trim().slice(0, 200) + '...',
    verifiedStatus: 'FIXED-VERIFIED',
    timestamp: new Date().toISOString()
  };

  await disclaimer.screenshot({ path: path.join(outDir, 'unbundled_disclaimer_element.png') });
  await page.screenshot({ path: path.join(outDir, 'planner_multimodal_unbundled_after.png'), fullPage: true });
  fs.writeFileSync(path.join(outDir, 'unbundled_disclaimer_after.json'), JSON.stringify(report, null, 2));

  console.log('Captured C-15 after evidence:', report);
  await browser.close();
}

captureC15After().catch((err) => {
  console.error(err);
  process.exit(1);
});
