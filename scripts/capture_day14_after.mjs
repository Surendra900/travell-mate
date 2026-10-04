import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const distDir = path.resolve('./dist');
const outDir = path.resolve('./docs/screenshots/day-14/after');

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

server.listen(4221, async () => {
  console.log('Day 14 after-capture server running on port 4221...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  const viewports = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844, isMobile: true }
  ];

  try {
    for (const vp of viewports) {
      console.log(`Capturing Day 14 AFTER for ${vp.name}...`);
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
      });

      await page.goto('http://localhost:4221/safety', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1000);

      // Scroll to incident protocols
      const protocolHeading = page.locator('text=Offline Transit Incident Protocols');
      if (await protocolHeading.isVisible()) {
        await protocolHeading.scrollIntoViewIfNeeded();
      }

      await page.screenshot({
        path: path.join(outDir, `${vp.name}_emergency_voice_active.png`),
        fullPage: false
      });

      // Click Listen Steps button on a protocol
      const listenStepBtn = page.locator('[data-testid^="speak-protocol-header-"]').first();
      if (await listenStepBtn.isVisible()) {
        await listenStepBtn.click();
        await page.waitForTimeout(300);
        await page.screenshot({
          path: path.join(outDir, `${vp.name}_protocol_audio_playing.png`),
          fullPage: false
        });
      }

      await context.close();
    }
    console.log('Day 14 AFTER screenshots captured successfully.');
  } catch (err) {
    console.error('Error capturing Day 14 AFTER screenshots:', err);
  } finally {
    await browser.close();
    server.close();
  }
});
