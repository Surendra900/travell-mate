import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const distDir = path.resolve('./dist');
const outDir = path.resolve('./docs/screenshots/day-16/after');

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

server.listen(4229, async () => {
  console.log('Day 16 after-capture server running on port 4229...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  const viewports = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844, isMobile: true }
  ];

  try {
    for (const vp of viewports) {
      console.log(`Capturing Day 16 AFTER for ${vp.name}...`);
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

      // 1. Safety page with locked vault and security badges
      await page.goto('http://localhost:4229/safety', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(600);
      await page.screenshot({
        path: path.join(outDir, `${vp.name}_vault_locked_after.png`),
        fullPage: false
      });

      // 2. Unlock vault and capture unlocked vault state
      const passInput = page.locator('input[placeholder="At least 8 characters"]');
      if (await passInput.isVisible()) {
        const confirmInput = page.locator('input[placeholder="Repeat passphrase"]');
        if (await confirmInput.isVisible()) {
          await passInput.fill('TravelPass@2026!');
          await confirmInput.fill('TravelPass@2026!');
          await page.click('button:has-text("Create encrypted vault")');
        } else {
          await passInput.fill('TravelPass@2026!');
          await page.click('button:has-text("Unlock encrypted vault")');
        }
        await page.waitForTimeout(800);
        await page.screenshot({
          path: path.join(outDir, `${vp.name}_vault_unlocked_after.png`),
          fullPage: false
        });
      }

      await context.close();
    }
    console.log('Day 16 AFTER screenshots captured successfully.');
  } catch (err) {
    console.error('Error capturing Day 16 AFTER screenshots:', err);
  } finally {
    await browser.close();
    server.close();
  }
});
