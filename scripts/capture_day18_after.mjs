import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const distDir = path.resolve('./dist');
const outDir = path.resolve('./docs/screenshots/day-18/after');

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

server.listen(4235, async () => {
  console.log('Day 18 after-capture server running on port 4235...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  const viewports = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844, isMobile: true }
  ];

  try {
    for (const vp of viewports) {
      console.log(`Capturing Day 18 AFTER for ${vp.name}...`);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.isMobile || false
      });
      const page = await context.newPage();
      page.setDefaultTimeout(15000);

      await page.addInitScript(() => {
        localStorage.setItem('travelmate-location-onboarding', 'dismissed');
        localStorage.setItem('travelmate-storage-consent', 'granted');
        localStorage.setItem('travelmate-blind-mode', 'disabled');
        localStorage.removeItem('travelmate-pwa-dismissed');
      });

      // 1. Home
      await page.goto('http://localhost:4235/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(600);
      await page.screenshot({
        path: path.join(outDir, `${vp.name}_home_after_pwa.png`),
        fullPage: false
      });

      // 2. Trigger PWA install banner
      await page.evaluate(() => {
        window.dispatchEvent(new Event('travelmate:open-pwa-install'));
      });
      await page.waitForTimeout(400);
      await page.screenshot({
        path: path.join(outDir, `${vp.name}_pwa_install_banner.png`),
        fullPage: false
      });

      await context.close();
    }
    console.log('Day 18 AFTER screenshots captured successfully.');
  } catch (err) {
    console.error('Error capturing Day 18 AFTER screenshots:', err);
  } finally {
    await browser.close();
    server.close();
  }
});
