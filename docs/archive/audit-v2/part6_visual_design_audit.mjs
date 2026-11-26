import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('docs/audit-v2/screenshots/viewports');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const viewports = [
  { name: 'mobile_360', width: 360, height: 640 },
  { name: 'mobile_390', width: 390, height: 844 },
  { name: 'tablet_768', width: 768, height: 1024 },
  { name: 'desktop_1440', width: 1440, height: 900 },
  { name: 'desktop_1920', width: 1920, height: 1080 }
];

const routes = [
  { name: 'home', path: '/' },
  { name: 'planner', path: '/planner?from=Delhi+(NDLS)&to=Patna+(PNBE)&date=2026-10-15' },
  { name: 'safety', path: '/safety' },
  { name: 'saved', path: '/saved' }
];

async function runVisualAudit() {
  const browser = await chromium.launch({ headless: true });
  const report = {
    overflows: [],
    riskBadgesAccessibility: {},
    cssTokenCheck: {}
  };

  try {
    for (const vp of viewports) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.width < 768
      });
      const page = await context.newPage();
      page.setDefaultTimeout(15000);

      // Dismiss cold modals once on first route
      await page.goto(`http://127.0.0.1:5173/`, { waitUntil: 'networkidle' });
      const locBtn = page.getByRole('button', { name: /continue without location/i });
      if (await locBtn.isVisible()) await locBtn.click();
      const voiceBtn = page.getByRole('button', { name: /no - standard mode/i });
      if (await voiceBtn.isVisible()) await voiceBtn.click();

      for (const route of routes) {
        await page.goto(`http://127.0.0.1:5173${route.path}`, { waitUntil: 'networkidle' });
        await page.waitForTimeout(400);

        const filename = `${route.name}_${vp.name}.png`;
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, filename), fullPage: false });

        // Check horizontal overflow
        const hasOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > window.innerWidth;
        });

        if (hasOverflow) {
          report.overflows.push({
            viewport: vp.name,
            route: route.name,
            scrollWidth: await page.evaluate(() => document.documentElement.scrollWidth),
            windowWidth: vp.width
          });
        }
      }
      await context.close();
    }

    // Check risk badge elements for non-color indicators (text & icons)
    const page = await browser.newPage();
    await page.goto('http://127.0.0.1:5173/planner?from=Delhi+(NDLS)&to=Patna+(PNBE)&date=2026-10-15', { waitUntil: 'networkidle' });
    const badgeChecks = await page.evaluate(() => {
      const badges = Array.from(document.querySelectorAll('.risk-badge, [data-testid="risk-badge"], [class*="risk"]'));
      return badges.map(b => ({
        text: b.innerText.trim(),
        hasIcon: !!b.querySelector('svg'),
        classes: b.className
      }));
    });
    report.riskBadgesAccessibility = badgeChecks;

    // Scan CSS for hardcoded colors vs CSS variables
    const indexCss = fs.readFileSync('src/index.css', 'utf-8');
    const customProperties = indexCss.match(/--[a-zA-Z0-9_-]+:/g) || [];
    report.cssTokenCheck = {
      declaredCustomPropertiesCount: customProperties.length,
      sampleTokens: customProperties.slice(0, 10)
    };

    fs.writeFileSync('docs/audit-v2/test-logs/part6_visual_report.json', JSON.stringify(report, null, 2));
    console.log('Part 6 visual audit completed.');
  } finally {
    await browser.close();
  }
}

runVisualAudit().catch(err => {
  console.error('Visual audit failed:', err);
  process.exit(1);
});
