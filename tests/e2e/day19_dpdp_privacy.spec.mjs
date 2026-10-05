import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const distDir = path.resolve('./dist');

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
  let reqPath = req.url.split('?')[0];
  let filePath = path.join(distDir, reqPath);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(distDir, 'index.html');
  }
  const ext = path.extname(filePath);
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  try {
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(fs.readFileSync(filePath));
  } catch {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(4235, async () => {
  console.log('Day 19 DPDP Privacy E2E server running on port 4235...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  const errors = [];
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    const page = await context.newPage();
    page.setDefaultTimeout(15000);

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('Failed to load resource') && !text.includes('status of 404')) {
          errors.push(`Console error: ${text}`);
        }
      }
    });
    page.on('pageerror', (err) => {
      errors.push(`Unhandled page error: ${err.message}`);
    });

    await page.addInitScript(() => {
      localStorage.setItem('travelmate-location-onboarding', 'dismissed');
      localStorage.setItem('travelmate-storage-consent', 'granted');
      localStorage.setItem('travelmate-blind-mode', 'disabled');
      localStorage.setItem('travelmate-pwa-dismissed', 'true');
    });

    console.log('1. Navigating to Home and scrolling to Footer...');
    await page.goto('http://localhost:4235/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    const privacyFooterBtn = page.locator('[data-testid="footer-privacy-link"]');
    assert.ok(await privacyFooterBtn.isVisible(), 'Footer DPDP privacy button must be visible');
    console.log('   ✓ Footer DPDP privacy trigger exists');

    console.log('2. Clicking DPDP Privacy button to open modal dialog...');
    await privacyFooterBtn.click();
    await page.waitForTimeout(500);

    const modal = page.locator('[data-testid="dpdp-privacy-modal"]');
    assert.ok(await modal.isVisible(), 'DPDP Privacy modal dialog must be visible');
    
    // Check statutory notice
    const titleText = await page.locator('text=India DPDP Act 2023 Compliant').isVisible();
    assert.ok(titleText, 'Statutory DPDP badge must be present');
    console.log('   ✓ DPDP Act 2023 statutory modal rendered');

    console.log('3. Verifying granular consent switches and toggles...');
    const switches = page.locator('button[role="switch"]');
    const switchCount = await switches.count();
    assert.ok(switchCount >= 3, 'Must have at least 3 consent switches');

    // Toggle emergency telemetry
    const firstSwitch = switches.first();
    const initialState = await firstSwitch.getAttribute('aria-checked');
    await firstSwitch.click();
    await page.waitForTimeout(200);
    const updatedState = await firstSwitch.getAttribute('aria-checked');
    assert.notEqual(initialState, updatedState, 'Switch state must toggle on click');

    const doneBtn = page.locator('[data-testid="dpdp-done-button"]');
    assert.ok(await doneBtn.isVisible(), 'Done button must be visible');
    await doneBtn.click();
    await page.waitForTimeout(400);
    assert.ok(!(await modal.isVisible()), 'Modal should close after clicking Done');
    console.log('   ✓ Consent preferences updated and modal closed');

    console.log('4. Re-opening modal and testing Right to Erasure trigger...');
    await privacyFooterBtn.click();
    await page.waitForTimeout(400);

    const eraseBtn = page.locator('[data-testid="dpdp-erase-all-button"]');
    assert.ok(await eraseBtn.isVisible(), 'Right to Erasure button must be visible');
    console.log('   ✓ Right to Erasure trigger confirmed');

    const closeBtn = page.locator('[data-testid="dpdp-close-button"]');
    await closeBtn.click();
    await page.waitForTimeout(300);

    // 5. Mobile Viewport Check (390x844)
    console.log('5. Testing Mobile responsive viewport (390x844)...');
    await page.setViewportSize({ width: 390, height: 844 });
    await privacyFooterBtn.click();
    await page.waitForTimeout(400);
    assert.ok(await modal.isVisible(), 'Modal opens cleanly in mobile viewport');
    await closeBtn.click();
    console.log('   ✓ Mobile viewport check passed');

    await context.close();

    if (errors.length > 0) {
      throw new Error(`Errors during Day 19 E2E: ${errors.join('; ')}`);
    }

    console.log('\nAll Day 19 DPDP Privacy E2E checks PASSED cleanly (5/5).');
  } catch (err) {
    console.error('Day 19 E2E Verification failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
  }
});
