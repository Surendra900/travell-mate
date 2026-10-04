import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const distDir = path.resolve('./dist');
const outDir = path.resolve('./docs/screenshots/day-13/after');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

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

server.listen(4218, async () => {
  console.log('Day 13 after-capture server running on port 4218...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  const viewports = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844, isMobile: true }
  ];

  try {
    for (const vp of viewports) {
      console.log(`Capturing Day 13 AFTER for ${vp.name}...`);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.isMobile || false
      });
      const page = await context.newPage();
      page.setDefaultTimeout(15000);

      page.on('console', msg => console.log(`[Browser ${vp.name}]:`, msg.text()));
      page.on('pageerror', err => console.error(`[Browser Error ${vp.name}]:`, err));

      await page.addInitScript(() => {
        localStorage.setItem('travelmate-location-onboarding', 'dismissed');
        localStorage.setItem('travelmate-storage-consent', 'granted');
        localStorage.setItem('travelmate-blind-mode', 'disabled');
      });

      await page.goto('http://localhost:4218/planner', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      console.log(`Page URL: ${page.url()}`);

      // Search route
      const fromInput = page.locator('[data-testid="planner-from-input"]');
      await fromInput.waitFor({ state: 'visible' });
      await fromInput.fill('Hyderabad');

      const toInput = page.locator('[data-testid="planner-to-input"]');
      await toInput.fill('Visakhapatnam');

      await page.click('button.booking-search-button');
      await page.waitForTimeout(1500);

      // Scroll to view the multimodal alternative section
      const multimodalSection = page.locator('.multimodal-container');
      if (await multimodalSection.isVisible()) {
        await multimodalSection.scrollIntoViewIfNeeded();
      }

      await page.screenshot({
        path: path.join(outDir, `${vp.name}_multimodal_tiers_after.png`),
        fullPage: false
      });

      // Also trigger a listen button to capture audio playback active state
      const listenBtn = page.locator('[data-testid^="speak-tier-btn-"]').first();
      if (await listenBtn.isVisible()) {
        await listenBtn.click();
        await page.waitForTimeout(300);
        await page.screenshot({
          path: path.join(outDir, `${vp.name}_tier_audio_playing.png`),
          fullPage: false
        });
      }

      await context.close();
    }
    console.log('Day 13 AFTER screenshots captured successfully.');
  } catch (err) {
    console.error('Error capturing Day 13 AFTER screenshots:', err);
  } finally {
    await browser.close();
    server.close();
  }
});
