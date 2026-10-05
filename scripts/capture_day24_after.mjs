import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const distDir = path.resolve('./dist');
const outDir = path.resolve('./docs/screenshots/day-24/after');

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

server.listen(4251, async () => {
  console.log('Day 24 after-capture server running on port 4251...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  const viewports = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844, isMobile: true }
  ];

  try {
    for (const vp of viewports) {
      console.log(`Capturing Day 24 AFTER for ${vp.name}...`);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.isMobile || false
      });
      const page = await context.newPage();
      page.setDefaultTimeout(15000);

      await page.addInitScript(() => {
        localStorage.setItem('travelmate-location-onboarding', 'dismissed');
        localStorage.setItem('travelmate_blind_voice_mode', 'standard');
      });

      await page.goto('http://localhost:4251/planner', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1500);

      // Scroll to route map section
      const mapSection = page.locator('[data-testid="interactive-route-map"]');
      if (await mapSection.count() > 0) {
        await mapSection.scrollIntoViewIfNeeded();
        await page.waitForTimeout(500);
      }

      const screenshotPath = path.join(outDir, `${vp.name}-route-map-active.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`Saved: ${screenshotPath}`);

      await context.close();
    }
  } catch (err) {
    console.error('Error during Day 24 AFTER capture:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
    console.log('Day 24 AFTER capture completed.');
  }
});
