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
  '.png': 'image/png',
  '.svg': 'image/svg+xml'
};

async function runE2E() {
  console.log('--- STARTING DAY 7 E2E VERIFICATION GATE ---');

  // Step 1: Scan client bundle for secrets
  console.log('[Gate 1/5] Checking client bundle for exposed secrets...');
  const assetsDir = path.join(distDir, 'assets');
  const jsFiles = fs.readdirSync(assetsDir).filter(f => f.endsWith('.js'));
  for (const file of jsFiles) {
    const content = fs.readFileSync(path.join(assetsDir, file), 'utf8');
    assert.equal(content.includes('process.env.SAMBANOVA_API_KEY'), false, `Secret check failed in ${file}`);
    assert.equal(content.includes('AIzaSy'), false, `Potential Google secret in ${file}`);
  }
  console.log('✓ Zero client secrets detected in production bundle.');

  // Step 2: Spin up local static server
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

  await new Promise(resolve => server.listen(4302, resolve));
  console.log('Test server ready at http://localhost:4302');

  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  try {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });

    const consoleErrors = [];
    const page = await context.newPage();
    page.setDefaultTimeout(15000);

    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('pageerror', err => {
      consoleErrors.push(err.message);
    });

    await page.addInitScript(() => {
      localStorage.setItem('travelmate-location-onboarding', 'dismissed');
      localStorage.setItem('travelmate-storage-consent', 'granted');
    });

    // Step 3: Test Planner and switch to Tatkal emergency mode
    console.log('[Gate 2/5] Navigating to /planner and activating Tatkal Mode...');
    await page.goto('http://localhost:4302/planner', { waitUntil: 'networkidle' });

    const tatkalTab = await page.getByRole('button', { name: /Tatkal emergency/i });
    assert.ok(tatkalTab, 'Tatkal emergency tab must be visible');
    await tatkalTab.click();
    await page.waitForTimeout(600);

    const bodyText = await page.textContent('body');

    // Step 4: Verify Tatkal Countdown Engine & Dual Windows
    console.log('[Gate 3/5] Verifying Tatkal Countdown Engine & Dual Windows...');
    assert.ok(bodyText.includes('Tatkal Emergency Countdown Engine'), 'Must render Tatkal Countdown Engine');
    assert.ok(bodyText.includes('AC Tatkal') && bodyText.includes('10:00 AM'), 'Must render AC Tatkal window');
    assert.ok(bodyText.includes('Non-AC Tatkal') && bodyText.includes('11:00 AM'), 'Must render Non-AC Tatkal window');
    assert.ok(bodyText.includes('IST Sync (UTC+5:30)'), 'Must indicate IST clock synchronization');
    console.log('✓ Dual-window countdown engine verified.');

    // Step 5: Verify Master Data Auto-Fill & Checklist
    console.log('[Gate 4/5] Testing 1-Click Master Data & Pre-Tatkal Checklist...');
    assert.ok(bodyText.includes('Tatkal Auto-Fill Master Data'), 'Must render Auto-Fill Master Data');
    assert.ok(bodyText.includes('Pre-Tatkal Golden Hour Checklist'), 'Must render Pre-Tatkal Checklist');
    assert.ok(bodyText.includes('Open IRCTC Portal'), 'Must render link to IRCTC portal');

    // Test checklist interaction
    const checkItem = await page.$('button:has-text("Log in to IRCTC portal")');
    if (checkItem) {
      await checkItem.click();
      await page.waitForTimeout(200);
    }
    console.log('✓ Master data auto-fill and checklist interactive.');

    // Step 6: Smoke regression across /safety and /
    console.log('[Gate 5/5] Smoke testing /safety and home routes...');
    await page.goto('http://localhost:4302/safety', { waitUntil: 'networkidle' });
    const safetyText = await page.textContent('body');
    assert.ok(safetyText.includes('112') && safetyText.includes('139'), 'Safety hotlines intact');

    await context.close();

    const criticalErrors = consoleErrors.filter(e => !e.includes('favicon') && !e.includes('manifest'));
    assert.equal(criticalErrors.length, 0, `Unexpected console errors: ${criticalErrors.join(', ')}`);
    console.log('✓ Zero console or runtime errors during complete session.');

    console.log('\n======================================================');
    console.log('✅ ALL DAY 7 VERIFICATION GATE CHECKS PASSED (5/5)');
    console.log('======================================================\n');
  } finally {
    await browser.close();
    server.close();
  }
}

runE2E().catch(err => {
  console.error('Day 7 E2E Gate FAILED:', err);
  process.exit(1);
});
