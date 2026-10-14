import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

test('C-12 Clerk User Authentication & Account Menu Suite', async (t) => {
  await t.test('package.json includes @clerk/clerk-react in dependencies', () => {
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    assert.ok(
      pkg.dependencies?.['@clerk/clerk-react'],
      '@clerk/clerk-react must be present in dependencies'
    );
  });

  await t.test('Source code integrates @clerk/clerk-react in main.jsx and AccountMenu.jsx', () => {
    const mainCode = fs.readFileSync('src/main.jsx', 'utf8');
    const menuCode = fs.readFileSync('src/components/AccountMenu.jsx', 'utf8');

    assert.ok(
      mainCode.includes('@clerk/clerk-react'),
      'src/main.jsx must import @clerk/clerk-react'
    );
    assert.ok(
      menuCode.includes('@clerk/clerk-react'),
      'src/components/AccountMenu.jsx must import @clerk/clerk-react'
    );
  });

  await t.test('Navbar Local Profile button functions correctly in real browser', async (sub) => {
    try {
      const resp = await fetch('http://127.0.0.1:5173/').catch(() => null);
      if (!resp) {
        sub.skip('Dev server not running at http://127.0.0.1:5173/ - skipping browser interaction test');
        return;
      }
    } catch {
      sub.skip('Dev server not running at http://127.0.0.1:5173/ - skipping browser interaction test');
      return;
    }

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();

    try {
      await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle' });

      // Profile button must exist with "Local profile" text
      const profileBtn = page.locator('button[aria-label="Open local travel profile"]');
      await profileBtn.waitFor({ state: 'visible', timeout: 5000 });
      const isVisible = await profileBtn.isVisible();
      assert.strictEqual(isVisible, true, 'Local profile button must be visible in navbar');

      // Clicking it opens profile modal
      await profileBtn.click();
      await page.waitForTimeout(300);

      const profileModal = page.locator('[role="dialog"][aria-label="Edit local TravelMate profile"]');
      await profileModal.waitFor({ state: 'visible', timeout: 5000 });
      const modalVisible = await profileModal.isVisible();
      assert.strictEqual(modalVisible, true, 'Clicking Local profile button must open Local Profile modal');
    } finally {
      await browser.close();
    }
  });
});
