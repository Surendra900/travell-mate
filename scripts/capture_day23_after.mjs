import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const distDir = path.resolve('./dist');
const outDir = path.resolve('./docs/screenshots/day-23/after');

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

server.listen(4248, async () => {
  console.log('Day 23 after-capture server running on port 4248...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  const viewports = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844, isMobile: true }
  ];

  try {
    for (const vp of viewports) {
      console.log(`Capturing Day 23 AFTER for ${vp.name}...`);
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

      await page.goto('http://localhost:4248/planner', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);

      // Trigger the dense fog scenario for visual impact in docs
      const simFogBtn = page.locator('[data-testid="sim-fog-btn"]');
      if (await simFogBtn.count() > 0) {
        await simFogBtn.click();
        await page.waitForTimeout(500);
      }

      // Scroll to weather disruption section
      const alertSection = page.locator('[data-testid="weather-disruption-alert"]');
      if (await alertSection.count() > 0) {
        await alertSection.scrollIntoViewIfNeeded();
        await page.waitForTimeout(300);
      }

      const screenshotPath = path.join(outDir, `${vp.name}-weather-disruption-alert.png`);
      await page.screenshot({ path: screenshotPath, fullPage: false });
      console.log(`Saved: ${screenshotPath}`);

      await context.close();
    }
  } catch (err) {
    console.error('Error during Day 23 AFTER capture:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
    console.log('Day 23 AFTER capture completed.');
  }
});
