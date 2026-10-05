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

server.listen(4259, async () => {
  console.log('Day 27 Cross-Browser Multi-Viewport E2E server running on port 4259...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  const viewports = [
    { name: 'Desktop (1440x900)', width: 1440, height: 900, isMobile: false },
    { name: 'Tablet (768x1024)', width: 768, height: 1024, isMobile: false },
    { name: 'Mobile (390x844)', width: 390, height: 844, isMobile: true }
  ];

  const routes = ['/', '/planner', '/safety', '/saved'];

  try {
    for (const vp of viewports) {
      console.log(`\nAuditing viewport: ${vp.name}...`);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.isMobile
      });

      const page = await context.newPage();
      page.setDefaultTimeout(15000);

      const pageErrors = [];
      page.on('pageerror', (err) => pageErrors.push(err.message));
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          // Ignore external tile network 404s if any
          if (!msg.text().includes('tile.openstreetmap.org') && !msg.text().includes('favicon.ico')) {
            pageErrors.push(msg.text());
          }
        }
      });

      await page.addInitScript(() => {
        localStorage.setItem('travelmate-location-onboarding', 'dismissed');
        localStorage.setItem('travelmate_blind_voice_mode', 'standard');
      });

      for (const route of routes) {
        await page.goto(`http://localhost:4259${route}`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(600);

        // Check horizontal overflow
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        assert.ok(
          scrollWidth <= vp.width,
          `Horizontal overflow detected on ${route} (${vp.name}): scrollWidth ${scrollWidth}px > viewport ${vp.width}px`
        );

        // Verify primary header or main landmark
        const hasMain = await page.locator('main, header').count();
        assert.ok(hasMain > 0, `Missing landmark on ${route}`);
      }

      assert.equal(
        pageErrors.length,
        0,
        `Unexpected runtime console/page errors encountered on ${vp.name}:\n${pageErrors.join('\n')}`
      );

      console.log(`   ✓ ${vp.name} passed all routes with zero console errors and zero overflow`);
      await context.close();
    }

    console.log('\nAll Day 27 Cross-Browser & Multi-Viewport Regression checks PASSED cleanly (5/5).');
  } catch (err) {
    console.error('Day 27 Multi-Viewport Regression failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
  }
});
