import test from 'node:test';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

test('C-08 Search Auto-Trigger Suite', async (t) => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

  t.after(async () => {
    await browser.close();
  });

  await t.test('Submitting search on Home auto-triggers results on Planner without second click', async () => {
    const page = await context.newPage();
    try {
      await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });

      // Select corridor chip Delhi <-> Patna
      const chip = page.locator('button:has-text("Delhi ⇄ Patna")').first();
      await chip.click();
      await page.waitForTimeout(300);

      // Click Search Recovery Routes on Home
      const homeSearchBtn = page.locator('[data-testid="home-search-btn"]');
      await homeSearchBtn.click();

      // Wait for navigation to /planner
      await page.waitForURL(/.*\/planner\?.*/, { timeout: 10000 });
      assert.ok(page.url().includes('/planner?'), 'Must navigate to /planner with query params');
      assert.ok(page.url().includes('from='), 'URL must contain from param');
      assert.ok(page.url().includes('to='), 'URL must contain to param');

      // The live-results-section or results header MUST be visible immediately without second click
      const resultsSection = page.locator('#live-results-section');
      await resultsSection.waitFor({ state: 'visible', timeout: 8000 });
      const isVisible = await resultsSection.isVisible();

      assert.strictEqual(
        isVisible,
        true,
        'Results workspace (#live-results-section) MUST be immediately visible on /planner without requiring a second click on planner-search-btn'
      );

      // Verify that results or split-routes are rendered
      const directServicesHeader = page.locator('h3:has-text("Direct Train Services")');
      const hasDirectHeader = await directServicesHeader.isVisible({ timeout: 3000 }).catch(() => false);
      assert.strictEqual(hasDirectHeader, true, 'Direct services section must be present in live results');
    } finally {
      await page.close();
    }
  });

  await t.test('Direct URL navigation to /planner with from and to query params auto-triggers results', async () => {
    const page = await context.newPage();
    try {
      await page.goto('http://127.0.0.1:5173/planner?from=Delhi+(NDLS)&to=Patna+(PNBE)&transportMode=Train&date=2026-10-15', {
        waitUntil: 'networkidle'
      });

      const resultsSection = page.locator('#live-results-section');
      const isVisible = await resultsSection.isVisible({ timeout: 4000 }).catch(() => false);

      assert.strictEqual(
        isVisible,
        true,
        'Direct link to /planner with valid query params must immediately trigger route search and display results'
      );
    } finally {
      await page.close();
    }
  });

  await t.test('Cold visit to /planner without params does NOT auto-open results', async () => {
    const page = await context.newPage();
    try {
      await page.goto('http://127.0.0.1:5173/planner', { waitUntil: 'networkidle' });

      const resultsSection = page.locator('#live-results-section');
      const isVisible = await resultsSection.isVisible().catch(() => false);

      assert.strictEqual(
        isVisible,
        false,
        'Cold visit to /planner without route params must keep results closed until user initiates search'
      );
    } finally {
      await page.close();
    }
  });
});
