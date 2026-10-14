import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('docs/audit-v2/screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

async function runAudit() {
  const browser = await chromium.launch({ headless: true });
  const results = {
    production: {},
    local: {},
    clickableCounts: {},
    navCounts: {},
    fiveSecondTest: {}
  };

  try {
    const targets = [
      { name: 'prod', url: 'https://travelmate-ai-flowzint.vercel.app' },
      { name: 'local', url: 'http://127.0.0.1:5173' }
    ];

    for (const target of targets) {
      console.log(`Checking ${target.name} at ${target.url}...`);
      
      // Desktop 1440x900
      const desktopCtx = await browser.newContext({
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 1
      });
      await desktopCtx.clearCookies();
      const desktopPage = await desktopCtx.newPage();
      desktopPage.setDefaultTimeout(15000);

      await desktopPage.goto(target.url, { waitUntil: 'networkidle' });
      const desktopShot = path.join(SCREENSHOT_DIR, `${target.name}_desktop_1440.png`);
      await desktopPage.screenshot({ path: desktopShot, fullPage: false });

      // Count clickable elements on first viewport
      const clickablesDesktop = await desktopPage.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('a, button, input, select, textarea, [role="button"], [tabindex="0"]'));
        const visibleInFirstFold = elements.filter(el => {
          const rect = el.getBoundingClientRect();
          return rect.top >= 0 && rect.top <= window.innerHeight && rect.width > 0 && rect.height > 0;
        });
        const navElements = Array.from(document.querySelectorAll('nav a, header a, nav button, header button'));
        return {
          totalVisibleFirstFold: visibleInFirstFold.length,
          navItemCount: navElements.length,
          navTexts: navElements.map(e => e.innerText.trim()).filter(Boolean),
          headingText: document.querySelector('h1')?.innerText || '',
          subheadingText: document.querySelector('p')?.innerText || '',
          bodySnippet: document.body.innerText.substring(0, 1000)
        };
      });

      results[`${target.name}_desktop`] = clickablesDesktop;
      await desktopCtx.close();

      // Mobile 390x844
      const mobileCtx = await browser.newContext({
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 2,
        isMobile: true
      });
      await mobileCtx.clearCookies();
      const mobilePage = await mobileCtx.newPage();
      mobilePage.setDefaultTimeout(15000);

      await mobilePage.goto(target.url, { waitUntil: 'networkidle' });
      const mobileShot = path.join(SCREENSHOT_DIR, `${target.name}_mobile_390.png`);
      await mobilePage.screenshot({ path: mobileShot, fullPage: false });

      const clickablesMobile = await mobilePage.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('a, button, input, select, textarea, [role="button"], [tabindex="0"]'));
        const visibleInFirstFold = elements.filter(el => {
          const rect = el.getBoundingClientRect();
          return rect.top >= 0 && rect.top <= window.innerHeight && rect.width > 0 && rect.height > 0;
        });
        const navElements = Array.from(document.querySelectorAll('nav a, header a, nav button, header button'));
        return {
          totalVisibleFirstFold: visibleInFirstFold.length,
          navItemCount: navElements.length,
          navTexts: navElements.map(e => e.innerText.trim()).filter(Boolean),
          headingText: document.querySelector('h1')?.innerText || '',
          bodySnippet: document.body.innerText.substring(0, 800)
        };
      });

      results[`${target.name}_mobile`] = clickablesMobile;
      await mobileCtx.close();
    }

    fs.writeFileSync('docs/audit-v2/test-logs/part1_results.json', JSON.stringify(results, null, 2));
    console.log('Part 1 checks completed successfully.');
  } finally {
    await browser.close();
  }
}

runAudit().catch(err => {
  console.error('Audit failed:', err);
  process.exit(1);
});
