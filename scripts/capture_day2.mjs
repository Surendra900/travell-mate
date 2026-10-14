import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const distDir = path.resolve('./dist');
const outDir = path.resolve('./docs/screenshots/day-2/after');
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

const server = http.createServer(async (req, res) => {
  if (req.url.startsWith('/api/')) {
    const requestUrl = new URL(req.url, 'http://localhost:4392');
    const apiPath = requestUrl.pathname.slice('/api/'.length).replace(/^\/+/, '');
    const apiFile = path.resolve('./api', `${apiPath}.js`);
    if (fs.existsSync(apiFile)) {
      try {
        const query = Object.fromEntries(requestUrl.searchParams.entries());
        const mod = await import(`file://${apiFile.replace(/\\/g, '/')}?dev=${Date.now()}`);
        let statusCode = 200;
        const fakeRes = {
          status(code) { statusCode = code; return this; },
          setHeader(k, v) { res.setHeader(k, v); return this; },
          json(payload) {
            res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(payload));
          }
        };
        await mod.default({
          method: req.method,
          url: req.url,
          headers: req.headers,
          query
        }, fakeRes);
        return;
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, message: e.message, results: [] }));
        return;
      }
    }
  }

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

server.listen(4392, async () => {
  console.log('Day 2 Server running on port 4392...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  const viewports = [
    { name: 'desktop-1440', width: 1440, height: 900, isMobile: false },
    { name: 'mobile-390', width: 390, height: 844, isMobile: true }
  ];

  try {
    for (const vp of viewports) {
      console.log(`Capturing Day 2 AFTER for viewport: ${vp.name}...`);
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

      // 1. Homepage showing updated attribution footer
      await page.goto('http://localhost:4392/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(outDir, `${vp.name}-01-homepage-footer.png`), fullPage: false });

      // 2. Journey Planner
      await page.goto('http://localhost:4392/planner', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(outDir, `${vp.name}-02-planner.png`), fullPage: false });

      // 3. Safety Hub
      await page.goto('http://localhost:4392/safety', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(outDir, `${vp.name}-03-safety.png`), fullPage: false });

      await context.close();
    }

    console.log('All Day 2 AFTER screenshots captured successfully in docs/screenshots/day-2/after/ !');
  } catch (err) {
    console.error('Day 2 Capture error:', err);
  } finally {
    await browser.close();
    server.close();
  }
});
