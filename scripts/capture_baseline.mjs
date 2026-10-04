import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';

const distDir = path.resolve('./dist');
const outDir = path.resolve('./docs/screenshots/baseline');

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
  } catch (e) {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(4199, async () => {
  console.log('Baseline capture server running on port 4199...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  const viewports = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844, isMobile: true }
  ];

  try {
    for (const vp of viewports) {
      console.log(`Capturing baseline for viewport: ${vp.name}...`);
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        isMobile: vp.isMobile || false
      });
      const page = await context.newPage();

      await page.addInitScript(() => {
        localStorage.setItem('travelmate-location-onboarding', 'dismissed');
        localStorage.setItem('travelmate-storage-consent', 'granted');
      });

      // 1. Home
      await page.goto('http://localhost:4199/', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(outDir, `01_home_${vp.name}.png`), fullPage: false });

      // 2. PNR Predictor Modal on Home
      const pnrBtn = await page.$('#open-pnr-modal-btn');
      if (pnrBtn) {
        await pnrBtn.click();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: path.join(outDir, `02_pnr_modal_${vp.name}.png`), fullPage: false });
        const closeBtn = await page.$('#pnr-predictor-modal button');
        if (closeBtn) await closeBtn.click();
        await page.waitForTimeout(500);
      }

      // 3. Planner Empty
      await page.goto('http://localhost:4199/planner', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(outDir, `03_planner_empty_${vp.name}.png`), fullPage: false });

      // 4. Planner with Multimodal Results (Delhi -> Kanpur)
      await page.goto('http://localhost:4199/planner?from=Delhi&to=Kanpur', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
      const searchBtn = await page.$('.booking-search-button');
      if (searchBtn) {
        await searchBtn.click();
        await page.waitForTimeout(2500);
      }
      await page.screenshot({ path: path.join(outDir, `04_planner_results_${vp.name}.png`), fullPage: false });

      // 5. Safety Mode
      await page.goto('http://localhost:4199/safety', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(outDir, `05_safety_mode_${vp.name}.png`), fullPage: false });

      // 6. Saved Plans / Vault
      await page.goto('http://localhost:4199/saved', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(outDir, `06_saved_plans_${vp.name}.png`), fullPage: false });

      // 7. AI Assistant / Analyze
      await page.goto('http://localhost:4199/analyze', { waitUntil: 'networkidle' });
      await page.waitForTimeout(1000);
      await page.screenshot({ path: path.join(outDir, `07_assistant_${vp.name}.png`), fullPage: false });

      await context.close();
    }

    console.log('All baseline screenshots captured successfully in docs/screenshots/baseline!');
  } catch (err) {
    console.error('Error during baseline capture:', err);
  } finally {
    await browser.close();
    server.close();
  }
});
