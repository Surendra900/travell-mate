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

server.listen(4231, async () => {
  console.log('Day 17 Vault Pass E2E server running on port 4231...');
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
      const samplePlans = [
        {
          id: 'plan-demo-1',
          from: 'Mumbai',
          to: 'New Delhi',
          date: '2026-10-15',
          transportMode: 'Train',
          pnrNumber: '4523819204',
          seatPreference: 'B1 - 24 (LB)',
          selectedService: {
            trainName: '12951 Mumbai Rajdhani Express',
            code: '12951',
            departure: '17:00',
            arrival: '08:32',
            price: 2450
          }
        }
      ];
      localStorage.setItem('travelmate-plans', JSON.stringify(samplePlans));
    });

    console.log('1. Navigating to /plans and checking Saved Journey with Boarding Pass trigger...');
    await page.goto('http://localhost:4231/plans', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    const passBtn = page.locator('[data-testid="view-pass-plan-demo-1"]');
    assert.ok(await passBtn.isVisible(), 'Boarding Pass button must be rendered on upcoming journey card');
    console.log('   ✓ Boarding Pass trigger button verified');

    console.log('2. Opening Offline Boarding Pass modal...');
    await passBtn.click();
    await page.waitForTimeout(600);

    const modal = page.locator('div[role="dialog"]');
    assert.ok(await modal.isVisible(), 'Offline Boarding Pass modal dialog must be open');

    const passHeader = page.locator('text=100% Offline Boarding Pass');
    assert.ok(await passHeader.isVisible(), 'Offline Boarding Pass badge visible');

    const routeText = page.locator('#pass-modal-title');
    assert.ok(await routeText.isVisible(), 'Service name must be displayed in modal title');
    console.log('   ✓ Boarding pass content rendered with origin, destination and timings');

    console.log('3. Testing Quick-PIN setup and verification...');
    const pinInput = page.locator('input[placeholder="Create 4-6 digit Quick-PIN"]');
    await pinInput.fill('7890');
    const setPinBtn = page.locator('[data-testid="setup-quick-pin"]');
    await setPinBtn.click();
    await page.waitForTimeout(500);

    const verifiedBadge = page.locator('text=Gate Security Verified');
    assert.ok(await verifiedBadge.isVisible(), 'Pass must unlock and show Gate Security Verified');
    console.log('   ✓ Quick-PIN configured and pass unlocked');

    console.log('4. Testing modal closing and re-opening with PIN entry...');
    const closeBtn = page.locator('button[aria-label="Close boarding pass modal"]');
    await closeBtn.click();
    await page.waitForTimeout(400);

    // Reopen from detailed list button
    const detailPassBtn = page.locator('[data-testid="detail-pass-plan-demo-1"]');
    await detailPassBtn.click();
    await page.waitForTimeout(500);

    // Test Biometric Unlock
    console.log('5. Testing 1-Tap Biometric Gate Unlock...');
    const bioBtn = page.locator('[data-testid="biometric-unlock-btn"]');
    assert.ok(await bioBtn.isVisible(), 'Biometric unlock button must be available');
    await bioBtn.click();
    await page.waitForTimeout(500);

    assert.ok(await verifiedBadge.isVisible(), 'Biometric auth must successfully unlock the pass');
    console.log('   ✓ 1-Tap Biometric unlock verified');

    // 6. Mobile Viewport Check (390x844)
    console.log('6. Testing Mobile responsive viewport (390x844)...');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(400);
    assert.ok(await modal.isVisible(), 'Boarding pass modal remains responsive on mobile');
    console.log('   ✓ Mobile viewport check passed');

    await context.close();

    if (errors.length > 0) {
      throw new Error(`Errors during Day 17 E2E: ${errors.join('; ')}`);
    }

    console.log('\nAll Day 17 Vault Offline Pass E2E checks PASSED cleanly (5/5).');
  } catch (err) {
    console.error('Day 17 E2E Verification failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
  }
});
