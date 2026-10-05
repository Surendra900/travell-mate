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

server.listen(4234, async () => {
  console.log('Day 18 PWA Install E2E server running on port 4234...');
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
      localStorage.removeItem('travelmate-pwa-dismissed');
    });

    console.log('1. Checking manifest.webmanifest HTTP endpoint...');
    const manifestRes = await page.request.get('http://localhost:4234/manifest.webmanifest');
    assert.equal(manifestRes.status(), 200, 'Manifest must respond with 200 OK');
    const manifestJson = await manifestRes.json();
    assert.equal(manifestJson.display, 'standalone', 'Manifest display must be standalone');
    assert.ok(manifestJson.name.includes('TravelMate AI'), 'Manifest name must match TravelMate AI');
    console.log('   ✓ manifest.webmanifest verified');

    console.log('2. Checking Service Worker sw.js HTTP endpoint...');
    const swRes = await page.request.get('http://localhost:4234/sw.js');
    assert.equal(swRes.status(), 200, 'sw.js must respond with 200 OK');
    const swText = await swRes.text();
    assert.ok(swText.includes('CACHE_NAME'), 'sw.js must declare cache configuration');
    console.log('   ✓ Service Worker file sw.js verified');

    console.log('3. Navigating to Home and triggering PWA install banner...');
    await page.goto('http://localhost:4234/', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    // Simulate beforeinstallprompt event
    await page.evaluate(() => {
      window.dispatchEvent(new Event('travelmate:open-pwa-install'));
    });
    await page.waitForTimeout(400);

    const banner = page.locator('[data-testid="pwa-install-banner"]');
    assert.ok(await banner.isVisible(), 'PWA Install banner must be visible');
    console.log('   ✓ PWA install banner rendered');

    const offlineBadge = page.locator('text=100% Offline Ready');
    assert.ok(await offlineBadge.isVisible(), 'Offline indicator badge visible');

    const installBtn = page.locator('[data-testid="pwa-install-button"]');
    assert.ok(await installBtn.isVisible(), 'Install button must be visible');

    console.log('4. Testing banner dismissal...');
    const dismissBtn = page.locator('[data-testid="pwa-dismiss-button"]');
    await dismissBtn.click();
    await page.waitForTimeout(400);
    assert.ok(!(await banner.isVisible()), 'Banner must be dismissed');
    console.log('   ✓ Banner dismissal confirmed');

    // 5. Mobile Viewport Check (390x844)
    console.log('5. Testing Mobile responsive viewport (390x844)...');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => {
      localStorage.removeItem('travelmate-pwa-dismissed');
      window.dispatchEvent(new Event('travelmate:open-pwa-install'));
    });
    await page.waitForTimeout(400);
    assert.ok(await banner.isVisible(), 'PWA install banner remains fully responsive on mobile');
    console.log('   ✓ Mobile viewport check passed');

    await context.close();

    if (errors.length > 0) {
      throw new Error(`Errors during Day 18 E2E: ${errors.join('; ')}`);
    }

    console.log('\nAll Day 18 PWA Install E2E checks PASSED cleanly (5/5).');
  } catch (err) {
    console.error('Day 18 E2E Verification failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
  }
});
