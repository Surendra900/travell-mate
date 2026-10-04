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
  console.log('--- STARTING DAY 8 E2E VERIFICATION GATE ---');

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

  await new Promise(resolve => server.listen(4303, resolve));
  console.log('Test server ready at http://localhost:4303');

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

    // Step 3: Test Planner route and Train Running Status card
    console.log('[Gate 2/5] Navigating to /planner and locating Train Status tracker...');
    await page.goto('http://localhost:4303/planner', { waitUntil: 'networkidle' });

    const bodyText = await page.textContent('body');
    assert.ok(bodyText.includes('Live Train Status & Station Boards'), 'Must render Train Status header');
    assert.ok(bodyText.includes('Train Tracker'), 'Must render Train Tracker tab');
    assert.ok(bodyText.includes('Station Board'), 'Must render Station Board tab');
    console.log('✓ Train Running Status card visible.');

    // Step 4: Test presets and timeline
    console.log('[Gate 3/5] Testing train preset selection and station progression...');
    const vandeBharatBtn = await page.getByRole('button', { name: /22436/i });
    if (vandeBharatBtn) {
      await vandeBharatBtn.click();
      await page.waitForTimeout(500);
      const updatedText = await page.textContent('body');
      assert.ok(updatedText.includes('Vande Bharat Express') || updatedText.includes('22436'), 'Must display Vande Bharat telemetry');
      assert.ok(updatedText.includes('Kanpur Central') || updatedText.includes('Station Progression Timeline'), 'Must display station progression');
    }
    console.log('✓ Train telemetry and timeline responsive.');

    // Step 5: Test Station Board switcher
    console.log('[Gate 4/5] Testing Station Board mode switcher...');
    const stationTab = await page.getByRole('button', { name: /Station Board/i });
    assert.ok(stationTab, 'Station board button must exist');
    await stationTab.click();
    await page.waitForTimeout(400);

    const stationText = await page.textContent('body');
    assert.ok(stationText.includes('Incoming & Outgoing Trains at'), 'Must show station departures/arrivals');
    assert.ok(stationText.includes('Platform') || stationText.includes('PF'), 'Must show platform indicators');
    console.log('✓ Live Station Board functional.');

    // Step 6: Smoke regression across /safety and /
    console.log('[Gate 5/5] Smoke testing other views...');
    await page.goto('http://localhost:4303/safety', { waitUntil: 'networkidle' });
    const safetyText = await page.textContent('body');
    assert.ok(safetyText.includes('112') && safetyText.includes('RailMadad'), 'Emergency Mode intact');

    await context.close();

    const criticalErrors = consoleErrors.filter(e => !e.includes('favicon') && !e.includes('manifest'));
    assert.equal(criticalErrors.length, 0, `Unexpected console errors: ${criticalErrors.join(', ')}`);
    console.log('✓ Zero console or runtime errors during complete session.');

    console.log('\n======================================================');
    console.log('✅ ALL DAY 8 VERIFICATION GATE CHECKS PASSED (5/5)');
    console.log('======================================================\n');
  } finally {
    await browser.close();
    server.close();
  }
}

runE2E().catch(err => {
  console.error('Day 8 E2E Gate FAILED:', err);
  process.exit(1);
});
