import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const distDir = path.resolve('./dist');
const outDir = path.resolve('./docs/screenshots/day-1/after');
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
    const requestUrl = new URL(req.url, 'http://localhost:4391');
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

server.listen(4391, async () => {
  console.log('Day 1 After Server running on port 4391...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  const viewports = [
    { name: 'desktop-1440', width: 1440, height: 900, isMobile: false },
    { name: 'mobile-390', width: 390, height: 844, isMobile: true }
  ];

  try {
    for (const vp of viewports) {
      console.log(`Capturing Day 1 AFTER for viewport: ${vp.name}...`);
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

      // 1. Homepage (no StatusBar, no FloatingSOS)
      await page.goto('http://localhost:4391/', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(outDir, `${vp.name}-01-homepage.png`), fullPage: false });

      // 2. Journey Planner (no CarbonCalculator, no SmartAssistant drawer)
      await page.goto('http://localhost:4391/planner', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(outDir, `${vp.name}-02-planner.png`), fullPage: false });

      // 3. Tatkal Emergency Mode
      const tatkalBtn = page.locator('button:has-text("Tatkal emergency")');
      if (await tatkalBtn.isVisible()) {
        await tatkalBtn.click();
        await page.waitForTimeout(400);
        await page.screenshot({ path: path.join(outDir, `${vp.name}-02b-tatkal.png`), fullPage: false });
      }

      // 4. Results Workspace (with direct deep links, no fake booking modal)
      await page.goto('http://localhost:4391/planner?from=New%20Delhi&to=Mumbai', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(400);
      const searchBtn = page.locator('button:has-text("Search Available")');
      if (await searchBtn.isVisible()) {
        await searchBtn.click();
        await page.waitForTimeout(600);
        await page.screenshot({ path: path.join(outDir, `${vp.name}-02c-results.png`), fullPage: false });
      }

      // 5. Safety Mode (no DocumentVault, no EmergencyPhraseCards)
      await page.goto('http://localhost:4391/safety', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(outDir, `${vp.name}-03-safety.png`), fullPage: false });

      // 6. My Trips (no fake booking modal)
      await page.goto('http://localhost:4391/saved', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(outDir, `${vp.name}-04-mytrips.png`), fullPage: false });

      await context.close();
    }

    console.log('All Day 1 AFTER screenshots captured successfully in docs/screenshots/day-1/after/ !');
  } catch (err) {
    console.error('Day 1 Capture error:', err);
  } finally {
    await browser.close();
    server.close();
  }
});
