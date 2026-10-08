import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'fs';

const routes = [
  { name: 'home', url: 'http://127.0.0.1:5173/' },
  { name: 'planner', url: 'http://127.0.0.1:5173/planner?from=Delhi+(NDLS)&to=Patna+(PNBE)&date=2026-10-15' },
  { name: 'safety', url: 'http://127.0.0.1:5173/safety' },
  { name: 'saved', url: 'http://127.0.0.1:5173/saved' },
  { name: 'privacy', url: 'http://127.0.0.1:5173/privacy' },
  { name: 'terms', url: 'http://127.0.0.1:5173/terms' },
  { name: 'disclaimer', url: 'http://127.0.0.1:5173/disclaimer' }
];

async function runAxeAudit() {
  const browser = await chromium.launch({ headless: true });
  const results = {
    axeByRoute: {},
    skipLinkFound: false,
    zoomReflowCheck: {}
  };

  try {
    for (const r of routes) {
      console.log(`Auditing a11y on ${r.name}...`);
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await context.newPage();
      page.setDefaultTimeout(15000);

      await page.goto(r.url, { waitUntil: 'networkidle' });

      // Dismiss cold modals if on home
      const locBtn = page.getByRole('button', { name: /continue without location/i });
      if (await locBtn.isVisible()) await locBtn.click();
      const voiceBtn = page.getByRole('button', { name: /no - standard mode/i });
      if (await voiceBtn.isVisible()) await voiceBtn.click();
      await page.waitForTimeout(500);

      const accessibilityScanResults = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
        .analyze();

      results.axeByRoute[r.name] = {
        violationsCount: accessibilityScanResults.violations.length,
        violations: accessibilityScanResults.violations.map(v => ({
          id: v.id,
          impact: v.impact,
          description: v.description,
          help: v.help,
          nodesCount: v.nodes.length,
          sampleTargets: v.nodes.slice(0, 3).map(n => n.target)
        }))
      };

      if (r.name === 'home') {
        const skipLink = await page.$('a[href="#main-content"]');
        results.skipLinkFound = !!skipLink;
      }

      await context.close();
    }

    // Zoom reflow check at 400% (viewport width 1280 / 4 = 320px)
    const zoomCtx = await browser.newContext({ viewport: { width: 320, height: 800 } });
    const zoomPage = await zoomCtx.newPage();
    await zoomPage.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });
    const locBtn = zoomPage.getByRole('button', { name: /continue without location/i });
    if (await locBtn.isVisible()) await locBtn.click();
    const voiceBtn = zoomPage.getByRole('button', { name: /no - standard mode/i });
    if (await voiceBtn.isVisible()) await voiceBtn.click();

    results.zoomReflowCheck = {
      viewport320ScrollWidth: await zoomPage.evaluate(() => document.documentElement.scrollWidth),
      hasHorizontalScrollAt400Percent: await zoomPage.evaluate(() => document.documentElement.scrollWidth > 320)
    };
    await zoomCtx.close();

    fs.writeFileSync('docs/audit-v2/test-logs/part7_a11y_report.json', JSON.stringify(results, null, 2));
    console.log('Part 7 a11y audit finished.');
  } finally {
    await browser.close();
  }
}

runAxeAudit().catch(err => {
  console.error('A11y audit failed:', err);
  process.exit(1);
});
