import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const distDir = path.resolve('./dist');
const outDir = path.resolve('./docs/screenshots/day-20/after');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

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

server.listen(4240, async () => {
  console.log('Day 20 after-capture server running on port 4240...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

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

  const viewports = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844, isMobile: true }
  ];

  try {
    for (const vp of viewports) {
      console.log(`Capturing Day 20 AFTER for ${vp.name}...`);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.isMobile || false
      });
      const page = await context.newPage();
      page.setDefaultTimeout(15000);

      await page.addInitScript((plans) => {
        localStorage.setItem('travelmate-location-onboarding', 'dismissed');
        localStorage.setItem('travelmate-storage-consent', 'granted');
        localStorage.setItem('travelmate-blind-mode', 'disabled');
        localStorage.setItem('travelmate-pwa-dismissed', 'true');
        localStorage.setItem('travelmate-plans', JSON.stringify(plans));
      }, samplePlans);

      await page.goto('http://localhost:4240/plans', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(600);

      const bookingBtn = page.locator('[data-testid="booking-options-plan-demo-1"]');
      await bookingBtn.scrollIntoViewIfNeeded();
      await bookingBtn.click();
      await page.waitForTimeout(500);

      // Screenshot Step 0
      await page.screenshot({
        path: path.join(outDir, `${vp.name}-booking-modal-step0.png`),
        fullPage: false
      });

      // Complete through to Step 4 confirmation
      const continueBtn = page.locator('[data-testid="booking-continue-btn"]');
      await continueBtn.click();
      await page.waitForTimeout(200);

      await page.locator('input[placeholder="Demo passenger name"]').first().fill('Aarav Sharma');
      await page.locator('input[placeholder="Age"]').first().fill('28');
      await page.locator('select').filter({ hasText: 'Select' }).first().selectOption('Male');
      await continueBtn.click();
      await page.waitForTimeout(200);

      await page.locator('input[placeholder="10-digit mobile"]').fill('9876543210');
      await page.locator('input[placeholder="demo@example.com"]').fill('aarav.sharma@example.com');
      await continueBtn.click();
      await page.waitForTimeout(200);

      await page.locator('.demo-payment-option').filter({ hasText: 'UPI' }).click();
      await page.locator('label').filter({ hasText: 'I understand this is a demo booking' }).locator('input').check();
      await page.locator('[data-testid="booking-confirm-btn"]').click();
      await page.waitForTimeout(500);

      // Screenshot Step 4
      await page.screenshot({
        path: path.join(outDir, `${vp.name}-booking-modal-confirmation.png`),
        fullPage: false
      });

      await context.close();
      console.log(`✓ Saved ${vp.name} screenshots`);
    }
  } catch (err) {
    console.error('Error capturing Day 20 AFTER screenshots:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
  }
});
