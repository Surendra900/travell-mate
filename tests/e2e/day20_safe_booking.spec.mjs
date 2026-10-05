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

server.listen(4239, async () => {
  console.log('Day 20 Safe Booking E2E server running on port 4239...');
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

    const samplePlans = [
      {
        id: 'plan-demo-1',
        from: 'New Delhi',
        to: 'Mumbai Central',
        date: '2026-10-15',
        transportMode: 'Train',
        classType: '3A',
        passengers: 1,
        selectedService: {
          serviceName: '12952 Mumbai Tejas Rajdhani Express',
          code: '12952',
          departure: '16:55',
          arrival: '08:35',
          price: 2450,
          provider: 'Indian Railways'
        }
      }
    ];

    await page.addInitScript((plans) => {
      localStorage.setItem('travelmate-location-onboarding', 'dismissed');
      localStorage.setItem('travelmate-storage-consent', 'granted');
      localStorage.setItem('travelmate-blind-mode', 'disabled');
      localStorage.setItem('travelmate-pwa-dismissed', 'true');
      localStorage.setItem('travelmate-plans', JSON.stringify(plans));
    }, samplePlans);

    console.log('1. Navigating to /plans to access Booking Options...');
    await page.goto('http://localhost:4239/plans', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    const bookingBtn = page.locator('[data-testid="booking-options-plan-demo-1"]');
    assert.ok(await bookingBtn.isVisible(), 'Booking Options button must be visible');
    console.log('   ✓ Booking Options button located');

    console.log('2. Clicking Booking Options to launch demo booking flow...');
    await bookingBtn.click();
    await page.waitForTimeout(500);

    const bookingModal = page.locator('[data-testid="booking-modal"]');
    assert.ok(await bookingModal.isVisible(), 'Booking modal must be rendered');
    console.log('   ✓ Booking modal opened cleanly');

    console.log('3. Verifying Step 0 (Journey) & Demo Disclaimer Badges...');
    const demoBadge = page.locator('[data-testid="booking-demo-disclaimer-badge"]');
    assert.ok(await demoBadge.isVisible(), 'Demo badge must be visible on Step 0');
    assert.ok((await demoBadge.innerText()).includes('Demo only'), 'Badge text must confirm demo status');

    const continueBtn = page.locator('[data-testid="booking-continue-btn"]');
    await continueBtn.click();
    await page.waitForTimeout(300);

    console.log('4. Completing Step 1 (Passenger Details)...');
    await page.locator('input[placeholder="Demo passenger name"]').first().fill('Aarav Sharma');
    await page.locator('input[placeholder="Age"]').first().fill('28');
    await page.locator('select').filter({ hasText: 'Select' }).first().selectOption('Male');
    await continueBtn.click();
    await page.waitForTimeout(300);

    console.log('5. Completing Step 2 (Contact)...');
    await page.locator('input[placeholder="10-digit mobile"]').fill('9876543210');
    await page.locator('input[placeholder="demo@example.com"]').fill('aarav.sharma@example.com');
    await continueBtn.click();
    await page.waitForTimeout(300);

    console.log('6. Verifying Step 3 (Payment Selection & Credential Refusal)...');
    const refusalNotice = page.locator('text=TravelMate will not request a card number, CVV');
    assert.ok(await refusalNotice.isVisible(), 'Credential refusal notice must be visible');
    
    // Choose UPI
    await page.locator('.demo-payment-option').filter({ hasText: 'UPI' }).click();
    // Consent
    await page.locator('label').filter({ hasText: 'I understand this is a demo booking' }).locator('input').check();

    const alertBefore = await page.locator('[role="alert"]').innerText().catch(() => '');
    if (alertBefore) console.log('   Alert before confirm:', alertBefore);

    const confirmBtn = page.locator('[data-testid="booking-confirm-btn"]');
    assert.ok(await confirmBtn.isVisible(), 'Confirm demo booking button must be visible');
    await confirmBtn.click();
    await page.waitForTimeout(600);

    const alertAfter = await page.locator('[role="alert"]').innerText().catch(() => '');
    if (alertAfter) console.log('   Alert after confirm:', alertAfter);

    console.log('7. Verifying Step 4 (Confirmation & Non-ticket reference)...');
    const refText = page.locator('[data-testid="booking-reference-text"]');
    assert.ok(await refText.isVisible(), 'Reference text must be visible');
    const refValue = await refText.innerText();
    assert.ok(refValue.startsWith('TM-DEMO-'), `Reference "${refValue}" must start with TM-DEMO-`);
    console.log(`   ✓ Non-ticket reference generated: ${refValue}`);

    const portalBtn = page.locator('[data-testid="booking-portal-btn"]');
    assert.ok(await portalBtn.isVisible(), 'Official provider redirect button must be present');

    const closeBtn = page.locator('[data-testid="booking-footer-close-btn"]');
    await closeBtn.scrollIntoViewIfNeeded();
    await closeBtn.click();
    await page.waitForTimeout(300);
    assert.ok(!(await bookingModal.isVisible()), 'Modal closed cleanly');

    // 8. Mobile Viewport Check (390x844)
    console.log('8. Testing Mobile responsive viewport (390x844)...');
    await page.setViewportSize({ width: 390, height: 844 });
    await bookingBtn.scrollIntoViewIfNeeded();
    await bookingBtn.click();
    await page.waitForTimeout(400);
    assert.ok(await bookingModal.isVisible(), 'Booking modal opens cleanly on mobile');
    const mobileCloseBtn = page.locator('[data-testid="booking-footer-close-btn"]');
    await mobileCloseBtn.scrollIntoViewIfNeeded();
    await mobileCloseBtn.click();
    console.log('   ✓ Mobile viewport check passed');

    await context.close();

    if (errors.length > 0) {
      throw new Error(`Errors during Day 20 E2E: ${errors.join('; ')}`);
    }

    console.log('\nAll Day 20 Safe Booking E2E checks PASSED cleanly (5/5).');
  } catch (err) {
    console.error('Day 20 E2E Verification failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
  }
});
