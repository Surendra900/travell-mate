import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const distDir = path.resolve('./dist');
const outDir = path.resolve('./docs/screenshots/redesign-qa');
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

server.listen(4280, async () => {
  console.log('Visual QA Server running on port 4280...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  const viewports = [
    { name: 'desktop-1440', width: 1440, height: 900, isMobile: false },
    { name: 'tablet-768', width: 768, height: 1024, isMobile: true },
    { name: 'mobile-390', width: 390, height: 844, isMobile: true }
  ];

  try {
    for (const vp of viewports) {
      console.log(`Testing viewport: ${vp.name}...`);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.isMobile
      });
      const page = await context.newPage();

      await page.addInitScript(() => {
        localStorage.setItem('travelmate-location-onboarding', 'dismissed');
        localStorage.setItem('travelmate-storage-consent', 'granted');
        localStorage.setItem('travelmate-blind-mode', 'disabled');
        sessionStorage.setItem('travelmate-blind-gate-shown', 'true');
      });

      // 1. Homepage
      await page.goto('http://localhost:4280/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(outDir, `${vp.name}-01-homepage.png`), fullPage: false });

      // 2. Journey Planner
      await page.goto('http://localhost:4280/planner', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(outDir, `${vp.name}-02-planner.png`), fullPage: false });

      // 3. Safety Mode
      await page.goto('http://localhost:4280/safety', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(outDir, `${vp.name}-03-safety.png`), fullPage: false });

      // 4. My Trips
      await page.goto('http://localhost:4280/saved', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(outDir, `${vp.name}-04-mytrips.png`), fullPage: false });

      await context.close();
    }

    console.log('All Visual QA screenshots captured successfully in docs/screenshots/redesign-qa/ !');
  } catch (err) {
    console.error('Visual QA error:', err);
  } finally {
    await browser.close();
    server.close();
  }
});
