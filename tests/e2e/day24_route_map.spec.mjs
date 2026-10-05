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

server.listen(4250, async () => {
  console.log('Day 24 Route Map E2E server running on port 4250...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  try {
    console.log('1. Navigating to Planner page on Desktop (1440x900)...');
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    const page = await context.newPage();
    page.setDefaultTimeout(15000);

    await page.addInitScript(() => {
      localStorage.setItem('travelmate-location-onboarding', 'dismissed');
      localStorage.setItem('travelmate_blind_voice_mode', 'standard');
    });

    await page.goto('http://localhost:4250/planner', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    console.log('2. Verifying Interactive RouteMap component rendering...');
    const mapSection = page.locator('[data-testid="interactive-route-map"]');
    await mapSection.waitFor({ state: 'visible' });
    console.log('   ✓ Route Map section located on Planner page');

    console.log('3. Verifying Leaflet canvas initialization and OSM attribution...');
    const mapCanvas = page.locator('[data-testid="leaflet-map-canvas"]');
    await mapCanvas.waitFor({ state: 'visible' });
    const isLeafletReady = await mapCanvas.evaluate((el) => el.classList.contains('leaflet-container'));
    assert.ok(isLeafletReady, 'Canvas must be initialized as Leaflet container');

    const attribution = await page.locator('.leaflet-control-attribution').innerText();
    assert.ok(attribution.includes('OpenStreetMap'), 'Must display OpenStreetMap attribution');
    console.log('   ✓ Leaflet container and OpenStreetMap layer initialized cleanly');

    console.log('4. Testing Fit Route control...');
    const zoomFitBtn = page.locator('[data-testid="map-zoom-fit"]');
    await zoomFitBtn.waitFor({ state: 'visible' });
    await zoomFitBtn.click();
    await page.waitForTimeout(400);
    console.log('   ✓ Zoom Fit action clicked successfully');

    console.log('5. Testing Mobile responsive viewport (390x844)...');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true
    });
    const mobilePage = await mobileContext.newPage();
    mobilePage.setDefaultTimeout(15000);

    await mobilePage.addInitScript(() => {
      localStorage.setItem('travelmate-location-onboarding', 'dismissed');
      localStorage.setItem('travelmate_blind_voice_mode', 'standard');
    });

    await mobilePage.goto('http://localhost:4250/planner', { waitUntil: 'domcontentloaded' });
    await mobilePage.waitForTimeout(1000);

    const mobileMap = mobilePage.locator('[data-testid="interactive-route-map"]');
    await mobileMap.waitFor({ state: 'visible' });

    const mobileCanvas = mobilePage.locator('[data-testid="leaflet-map-canvas"]');
    await mobileCanvas.waitFor({ state: 'visible' });
    const mobileLeaflet = await mobileCanvas.evaluate((el) => el.classList.contains('leaflet-container'));
    assert.ok(mobileLeaflet, 'Mobile canvas must be initialized as Leaflet container');
    console.log('   ✓ Mobile viewport check passed');

    await mobileContext.close();
    await context.close();

    console.log('\nAll Day 24 Interactive Route Map E2E checks PASSED cleanly (5/5).');
  } catch (err) {
    console.error('Day 24 E2E test failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
  }
});
