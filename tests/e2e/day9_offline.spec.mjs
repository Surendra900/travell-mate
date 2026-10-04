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
  console.log('--- STARTING DAY 9 E2E VERIFICATION GATE ---');

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

  await new Promise(resolve => server.listen(4304, resolve));
  console.log('Test server ready at http://localhost:4304');

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

    // Step 3: Load /planner while online
    console.log('[Gate 2/5] Navigating to /planner and testing online state...');
    await page.goto('http://localhost:4304/planner', { waitUntil: 'networkidle' });
    const onlineText = await page.textContent('body');
    assert.ok(onlineText.includes('Journey Planner'), 'Online planner loaded');

    // Step 4: Simulate offline network drop
    console.log('[Gate 3/5] Simulating browser offline network drop...');
    await context.setOffline(true);
    await page.waitForTimeout(600);

    const offlineText = await page.textContent('body');
    assert.ok(
      offlineText.includes('TravelMate Offline Pack') ||
      offlineText.includes('Offline Mode Only') ||
      offlineText.includes('Zero Connectivity'),
      'Zero-connectivity fallback active'
    );
    console.log('✓ Autonomous offline transition verified.');

    // Step 5: Test emergency tools while offline
    console.log('[Gate 4/5] Verifying zero-connectivity tools in Offline Pack...');
    assert.ok(offlineText.includes('Call 112') || offlineText.includes('Share location by SMS'), 'Emergency SMS / Call available');
    assert.ok(offlineText.includes('Refresh local pack'), 'Offline pack refresh operational');
    console.log('✓ Zero-connectivity offline tools responsive.');

    // Step 6: Restore online and verify clean recovery
    console.log('[Gate 5/5] Testing network restoration and clean recovery...');
    await context.setOffline(false);
    await page.waitForTimeout(600);
    const restoredText = await page.textContent('body');
    assert.ok(restoredText.includes('Journey Planner'), 'Clean recovery after online restoration');

    await context.close();

    const criticalErrors = consoleErrors.filter(e => !e.includes('favicon') && !e.includes('manifest'));
    assert.equal(criticalErrors.length, 0, `Unexpected console errors: ${criticalErrors.join(', ')}`);
    console.log('✓ Zero console or runtime errors during complete session.');

    console.log('\n======================================================');
    console.log('✅ ALL DAY 9 VERIFICATION GATE CHECKS PASSED (5/5)');
    console.log('======================================================\n');
  } finally {
    await browser.close();
    server.close();
  }
}

runE2E().catch(err => {
  console.error('Day 9 E2E Gate FAILED:', err);
  process.exit(1);
});
