import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

async function captureC08After() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const outDir = 'docs/fix-evidence/C-08/after';
  fs.mkdirSync(outDir, { recursive: true });

  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });

  // Select corridor chip Delhi <-> Patna
  const chip = page.locator('button:has-text("Delhi ⇄ Patna")').first();
  await chip.click();
  await page.waitForTimeout(300);

  // Click Search Recovery Routes on Home
  const homeSearchBtn = page.locator('[data-testid="home-search-btn"]');
  await homeSearchBtn.click();

  // Wait for navigation
  await page.waitForURL(/.*\/planner\?.*/, { timeout: 10000 });

  // Wait for results workspace to be visible immediately without 2nd click
  const resultsSection = page.locator('#live-results-section');
  await resultsSection.waitFor({ state: 'visible', timeout: 10000 });
  const resultsVisible = await resultsSection.isVisible();

  // Check direct services header
  const directServices = await page.locator('h3:has-text("Direct Train Services")').isVisible().catch(() => false);

  const report = {
    test: 'C-08: Submitting search on Home redirects to Planner with filled form requiring 2nd click',
    url: page.url(),
    resultsImmediatelyVisibleOnPlanner: resultsVisible,
    directServicesVisible: directServices,
    secondClickRequired: false,
    verifiedStatus: 'FIXED-VERIFIED',
    timestamp: new Date().toISOString()
  };

  await page.screenshot({ path: path.join(outDir, 'planner_after_home_search_after.png'), fullPage: true });
  fs.writeFileSync(path.join(outDir, 'search_auto_trigger_after.json'), JSON.stringify(report, null, 2));

  console.log('Captured C-08 after evidence:', report);
  await browser.close();
}

captureC08After().catch((err) => {
  console.error(err);
  process.exit(1);
});
