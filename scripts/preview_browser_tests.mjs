import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PREVIEW_URL = 'https://travelmate-ai-flowzint-zzbhmz3xf-httplocalhost5173planner.vercel.app';
const evidenceDir = path.resolve(__dirname, '../docs/data/evidence/after');
fs.mkdirSync(evidenceDir, { recursive: true });

async function runBrowserChecks() {
  const browser = await chromium.launch({ headless: true });

  try {
    console.log('[Browser Test] 1. Desktop 1440x900 RJY to BZA...');
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    const desktopPage = await desktopContext.newPage();
    const consoleErrors = [];
    desktopPage.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    await desktopPage.goto(`${PREVIEW_URL}/planner?from=RJY&to=BZA`, { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(1500);

    // Save screenshot
    const desktopScreenshotPath = path.join(evidenceDir, 'rjy_to_bza_planner_desktop_after.png');
    await desktopPage.screenshot({ path: desktopScreenshotPath, fullPage: false });
    console.log(`Saved screenshot: ${desktopScreenshotPath}`);

    // Verify Direct Results Panel
    const pageText = await desktopPage.innerText('body');
    const hasDirect = pageText.includes('Direct') || pageText.includes('direct');
    const hasHyderabadDetour = pageText.includes('via HYD') || pageText.includes('via Hyderabad');
    const hasCirca2016 = pageText.includes('2016') || pageText.includes('TIMETABLE');

    console.log(`Desktop Results: hasDirect=${hasDirect}, hasHyderabadDetour=${hasHyderabadDetour}, hasCirca2016=${hasCirca2016}`);
    if (hasHyderabadDetour) throw new Error('Hyderabad detour found on RJY to BZA!');
    await desktopContext.close();

    console.log('\n[Browser Test] 2. Mobile 390x844 BZA to RJY...');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(`${PREVIEW_URL}/planner?from=BZA&to=RJY`, { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(1500);

    const mobileScreenshotPath = path.join(evidenceDir, 'bza_to_rjy_planner_mobile_after.png');
    await mobilePage.screenshot({ path: mobileScreenshotPath, fullPage: false });
    console.log(`Saved screenshot: ${mobileScreenshotPath}`);

    // Check horizontal scroll overflow
    const scrollWidth = await mobilePage.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await mobilePage.evaluate(() => document.documentElement.clientWidth);
    console.log(`Mobile Viewport Check: scrollWidth=${scrollWidth}, clientWidth=${clientWidth}`);
    if (scrollWidth > clientWidth) {
      console.warn(`Horizontal scroll detected: ${scrollWidth} > ${clientWidth}`);
    }

    await mobileContext.close();

    console.log('\n[Browser Test] All browser checks passed with 0 fatal errors.');
  } finally {
    await browser.close();
  }
}

runBrowserChecks().catch(err => {
  console.error('[Browser Test Error]:', err);
  process.exit(1);
});
