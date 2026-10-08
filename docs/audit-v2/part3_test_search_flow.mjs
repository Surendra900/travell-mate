import { chromium } from 'playwright';
import fs from 'fs';

async function testSearchFlow() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);

  const report = {};

  try {
    await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' });

    // Dismiss initial modals (top modal first)
    const locBtn = page.locator('button:has-text("Continue without location")');
    if (await locBtn.count() > 0 && await locBtn.isVisible()) {
      await locBtn.click();
      await page.waitForTimeout(300);
    }
    const voiceBtn = page.locator('button:has-text("NO - Standard Mode")');
    if (await voiceBtn.count() > 0 && await voiceBtn.isVisible()) {
      await voiceBtn.click();
      await page.waitForTimeout(300);
    }

    // Step 1: Select Popular corridor on Home
    const chip = page.locator('button:has-text("Delhi ⇄ Patna")').first();
    await chip.click();
    await page.waitForTimeout(300);

    // Check inputs populated
    report.fromValue = await page.inputValue('#home-from-input');
    report.toValue = await page.inputValue('#home-to-input');

    // Step 2: Click Search Recovery Routes on Home
    const searchBtnHome = page.locator('[data-testid="home-search-btn"]');
    await searchBtnHome.click();
    await page.waitForTimeout(1000);

    report.currentUrlAfterHomeSearch = page.url();
    report.isPlannerUrl = page.url().includes('/planner');

    // Are results visible right now without further action?
    const liveResultsVisible = await page.locator('[data-testid="live-results-panel"], .timeline-card, [data-testid="waitlist-bypass-contrast"]').count();
    report.resultsImmediatelyVisibleOnPlanner = liveResultsVisible > 0;

    // Is the user required to click the planner search button?
    const plannerSearchBtn = page.locator('[data-testid="planner-search-btn"]');
    const isPlannerSearchBtnPresent = await plannerSearchBtn.isVisible();
    report.plannerSearchBtnPresent = isPlannerSearchBtnPresent;

    if (isPlannerSearchBtnPresent) {
      // User must click a second time on the planner page to actually see results!
      await plannerSearchBtn.click();
      await page.waitForTimeout(2000);

      // Now check if results appear
      const resultsAfterSecondClick = await page.locator('.timeline-card, [data-testid="waitlist-bypass-contrast"], [data-testid="live-results-panel"]').count();
      report.resultsCountAfterSecondClick = resultsAfterSecondClick;
      report.resultsVisibleAfterSecondClick = resultsAfterSecondClick > 0;
    }

    await page.screenshot({ path: 'docs/audit-v2/screenshots/part3_planner_after_search.png' });
    fs.writeFileSync('docs/audit-v2/test-logs/part3_search_flow.json', JSON.stringify(report, null, 2));
    console.log('Search flow tested successfully:', report);
  } finally {
    await browser.close();
  }
}

testSearchFlow().catch(err => {
  console.error('Failed:', err);
  process.exit(1);
});
