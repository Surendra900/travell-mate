import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const distDir = path.resolve('./dist');
const outDir = path.resolve('./docs/screenshots/day-10/before');

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

server.listen(4208, async () => {
  console.log('Day 10 before-capture server running on port 4208...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  const viewports = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844, isMobile: true }
  ];

  try {
    for (const vp of viewports) {
      console.log(`Capturing Day 10 BEFORE for ${vp.name}...`);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.isMobile || false
      });
      const page = await context.newPage();

      await page.addInitScript(() => {
        localStorage.setItem('travelmate-location-onboarding', 'dismissed');
        localStorage.setItem('travelmate-storage-consent', 'granted');
      });

      await page.goto('http://localhost:4208/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      // Capture Home with default language
      await page.screenshot({
        path: path.join(outDir, `${vp.name}_home_en.png`),
        fullPage: false
      });

      // Switch language to Hindi
      const langSelect = page.locator('select[aria-label="Select website language"]');
      if (await langSelect.isVisible()) {
        await langSelect.selectOption('hi');
        await page.waitForTimeout(800);
        await page.screenshot({
          path: path.join(outDir, `${vp.name}_home_hi.png`),
          fullPage: false
        });
      }

      await context.close();
    }
    console.log('Day 10 BEFORE screenshots captured successfully.');
  } catch (err) {
    console.error('Error capturing Day 10 BEFORE screenshots:', err);
  } finally {
    await browser.close();
    server.close();
  }
});
