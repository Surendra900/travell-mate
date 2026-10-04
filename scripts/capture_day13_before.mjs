import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const distDir = path.resolve('./dist');
const outDir = path.resolve('./docs/screenshots/day-13/before');

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

server.listen(4215, async () => {
  console.log('Day 13 before-capture server running on port 4215...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  const viewports = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844, isMobile: true }
  ];

  try {
    for (const vp of viewports) {
      console.log(`Capturing Day 13 BEFORE for ${vp.name}...`);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.isMobile || false
      });
      const page = await context.newPage();

      await page.addInitScript(() => {
        localStorage.setItem('travelmate-location-onboarding', 'dismissed');
        localStorage.setItem('travelmate-storage-consent', 'granted');
        localStorage.setItem('travelmate-blind-mode', 'disabled');
      });

      await page.goto('http://localhost:4215/planner', { waitUntil: 'networkidle' });
      await page.waitForTimeout(500);

      // Search a multimodal journey: Hyderabad to Visakhapatnam
      await page.fill('[data-testid="planner-from-input"]', 'Hyderabad');
      await page.fill('[data-testid="planner-to-input"]', 'Visakhapatnam');
      await page.click('button.booking-search-button');
      await page.waitForTimeout(1500);

      // Scroll to view the multimodal alternative section or cards
      const multimodalSection = page.locator('.multimodal-container');
      if (await multimodalSection.isVisible()) {
        await multimodalSection.scrollIntoViewIfNeeded();
      }

      await page.screenshot({
        path: path.join(outDir, `${vp.name}_multimodal_tiers_before.png`),
        fullPage: false
      });

      await context.close();
    }
    console.log('Day 13 BEFORE screenshots captured successfully.');
  } catch (err) {
    console.error('Error capturing Day 13 BEFORE screenshots:', err);
  } finally {
    await browser.close();
    server.close();
  }
});
