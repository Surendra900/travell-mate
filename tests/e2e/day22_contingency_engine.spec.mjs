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

server.listen(4245, async () => {
  console.log('Day 22 Contingency Engine E2E server running on port 4245...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  const errors = [];
  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    const page = await context.newPage();
    page.setDefaultTimeout(15000);

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('Failed to load resource') && !text.includes('status of 404')) {
          errors.push(`Console error: ${text}`);
        }
      }
    });
    page.on('pageerror', (err) => {
      errors.push(`Unhandled page error: ${err.message}`);
    });

    await page.addInitScript(() => {
      localStorage.setItem('travelmate-location-onboarding', 'dismissed');
      localStorage.setItem('travelmate-storage-consent', 'granted');
      localStorage.setItem('travelmate-blind-mode', 'disabled');
      localStorage.setItem('travelmate-pwa-dismissed', 'true');
    });

    console.log('1. Navigating to Planner page and locating Backup options...');
    await page.goto('http://localhost:4245/planner', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    const backupHeading = page.locator('#backup-title');
    assert.ok(await backupHeading.isVisible(), 'Backup options title must be rendered');
    await backupHeading.scrollIntoViewIfNeeded();
    console.log('   ✓ Backup plan section located');

    console.log('2. Testing standard backup recommendation...');
    const analyzeBtn = page.locator('[data-testid="analyze-suggest-backup-btn"]');
    assert.ok(await analyzeBtn.isVisible(), 'Analyze & suggest best button must be present');
    await analyzeBtn.click();
    await page.waitForTimeout(300);

    const suggestedCard = page.locator('text=Suggested best:');
    assert.ok(await suggestedCard.isVisible(), 'Suggested best backup card must be visible');
    console.log('   ✓ Standard backup options generated');

    console.log('3. Triggering severe connecting delay (+55m) contingency...');
    const delay55Btn = page.locator('[data-testid="simulate-delay-55m"]');
    assert.ok(await delay55Btn.isVisible(), '55m delay simulator button must be visible');
    await delay55Btn.click();
    await page.waitForTimeout(400);

    const contingencyBanner = page.locator('[data-testid="contingency-severe-delay-banner"]');
    assert.ok(await contingencyBanner.isVisible(), 'Contingency severe delay alert banner must be visible');
    
    const bannerText = await contingencyBanner.innerText();
    assert.ok(bannerText.toLowerCase().includes('severe connecting delay (+55m)'), 'Banner must indicate severe delay');
    assert.ok(bannerText.toLowerCase().includes('critical risk'), 'Banner must warn of critical transfer risk');
    console.log('   ✓ Severe delay contingency banner rendered with critical risk warning');

    console.log('4. Verifying contingency alternatives and activation trigger...');
    const activateBtn = page.locator('[data-testid="activate-contingency-contingency-fast-express"]');
    assert.ok(await activateBtn.isVisible(), 'Fast express contingency activation button must be present');
    await activateBtn.click();
    await page.waitForTimeout(300);

    const notice = page.locator('text=Activated contingency route');
    assert.ok(await notice.isVisible(), 'Contingency route activation notice must be shown');
    console.log('   ✓ Contingency route activated and prepared');

    // 5. Mobile Viewport Check (390x844)
    console.log('5. Testing Mobile responsive viewport (390x844)...');
    await page.setViewportSize({ width: 390, height: 844 });
    await backupHeading.scrollIntoViewIfNeeded();
    assert.ok(await contingencyBanner.isVisible(), 'Contingency banner remains fully responsive on mobile');
    console.log('   ✓ Mobile viewport check passed');

    await context.close();

    if (errors.length > 0) {
      throw new Error(`Errors during Day 22 E2E: ${errors.join('; ')}`);
    }

    console.log('\nAll Day 22 Backup Route & Contingency E2E checks PASSED cleanly (5/5).');
  } catch (err) {
    console.error('Day 22 E2E Verification failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
  }
});
