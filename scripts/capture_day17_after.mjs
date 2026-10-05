import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const distDir = path.resolve('./dist');
const outDir = path.resolve('./docs/screenshots/day-17/after');

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

server.listen(4232, async () => {
  console.log('Day 17 after-capture server running on port 4232...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  const viewports = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844, isMobile: true }
  ];

  try {
    for (const vp of viewports) {
      console.log(`Capturing Day 17 AFTER for ${vp.name}...`);
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
        const samplePlans = [
          {
            id: 'plan-demo-1',
            from: 'Mumbai',
            to: 'New Delhi',
            date: '2026-10-15',
            transportMode: 'Train',
            pnrNumber: '4523819204',
            seatPreference: 'B1 - 24 (LB)',
            selectedService: {
              trainName: '12951 Mumbai Rajdhani Express',
              code: '12951',
              departure: '17:00',
              arrival: '08:32',
              price: 2450
            }
          }
        ];
        localStorage.setItem('travelmate-plans', JSON.stringify(samplePlans));
      });

      // 1. Saved Plans with Boarding Pass button
      await page.goto('http://localhost:4232/saved', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(600);
      await page.screenshot({
        path: path.join(outDir, `${vp.name}_saved_plans_after.png`),
        fullPage: false
      });

      // 2. Open Boarding Pass Modal
      const passBtn = page.locator('[data-testid="view-pass-plan-demo-1"]');
      if (await passBtn.isVisible()) {
        await passBtn.click();
        await page.waitForTimeout(600);
        await page.screenshot({
          path: path.join(outDir, `${vp.name}_boarding_pass_modal.png`),
          fullPage: false
        });

        // 3. Unlock via biometric simulation
        const bioBtn = page.locator('[data-testid="biometric-unlock-btn"]');
        if (await bioBtn.isVisible()) {
          await bioBtn.click();
          await page.waitForTimeout(500);
          await page.screenshot({
            path: path.join(outDir, `${vp.name}_pass_verified.png`),
            fullPage: false
          });
        }
      }

      await context.close();
    }
    console.log('Day 17 AFTER screenshots captured successfully.');
  } catch (err) {
    console.error('Error capturing Day 17 AFTER screenshots:', err);
  } finally {
    await browser.close();
    server.close();
  }
});
