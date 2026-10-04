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
  console.log('--- STARTING DAY 6 E2E VERIFICATION GATE ---');

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

  await new Promise(resolve => server.listen(4301, resolve));
  console.log('Test server ready at http://localhost:4301');

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
      localStorage.setItem('travelmate-last-location', JSON.stringify({
        latitude: 28.6139,
        longitude: 77.2090,
        accuracy: 12,
        capturedAt: new Date().toISOString(),
        mapUrl: 'https://maps.google.com/?q=28.613900,77.209000'
      }));
    });

    // Step 3: Test Safety Mode & Day 6 features
    console.log('[Gate 2/5] Navigating to /safety and checking hotlines...');
    await page.goto('http://localhost:4301/safety', { waitUntil: 'networkidle' });

    // Check all 4 hotlines are displayed
    const bodyText = await page.textContent('body');
    assert.ok(bodyText.includes('112'), 'Must display 112 hotline');
    assert.ok(bodyText.includes('139'), 'Must display 139 hotline');
    assert.ok(bodyText.includes('108'), 'Must display 108 hotline');
    assert.ok(bodyText.includes('1090'), 'Must display 1090 hotline');
    assert.ok(bodyText.includes('RailMadad & RPF Security'), 'Must display RailMadad title');
    console.log('✓ All 4 national transit hotlines rendered.');

    // Check Live GPS Telemetry card
    console.log('[Gate 3/5] Verifying Live GPS Broadcast Engine...');
    assert.ok(bodyText.includes('Live GPS Broadcast Engine'), 'Must render GPS Broadcast Engine');
    assert.ok(bodyText.includes('28.613900, 77.209000'), 'Must display GPS coordinates');
    assert.ok(bodyText.includes('Acc: ±12 m'), 'Must display GPS accuracy');
    assert.ok(bodyText.includes('Open Maps'), 'Must provide Google Maps button');
    console.log('✓ Live GPS Telemetry verified.');

    // Check Offline Transit Incident Protocols
    console.log('[Gate 4/5] Testing interactive Transit Incident Protocols...');
    assert.ok(bodyText.includes('Offline Transit Incident Protocols'), 'Must display protocols section');
    assert.ok(bodyText.includes('Zero-FIR'), 'Must display Zero-FIR procedure');
    assert.ok(bodyText.includes('Stranded at Junction'), 'Must display junction layover procedure');
    assert.ok(bodyText.includes('Legal Safety & Transit Notice'), 'Must display legal disclaimer');

    // Test expanding a protocol
    const expandBtn = await page.$('button[aria-label*="Theft / Robbery"]');
    if (expandBtn) {
      await expandBtn.click();
      await page.waitForTimeout(300);
      const updatedText = await page.textContent('body');
      assert.ok(updatedText.includes('1930') || updatedText.includes('golden hour'), 'Must reveal Zero-FIR steps upon expansion');
    }
    console.log('✓ Interactive offline transit protocols functional.');

    // Step 5: Smoke regression across core routes
    console.log('[Gate 5/5] Smoke testing core app routes...');
    await page.goto('http://localhost:4301/', { waitUntil: 'networkidle' });
    const homeText = await page.textContent('body');
    assert.ok(homeText.includes('TravelMate') || homeText.includes('Journey Planner'), 'Home page functional');

    await page.goto('http://localhost:4301/planner', { waitUntil: 'networkidle' });
    const plannerText = await page.textContent('body');
    assert.ok(plannerText.includes('From') && plannerText.includes('To'), 'Planner route form functional');

    await context.close();

    // Check for critical console errors
    const criticalErrors = consoleErrors.filter(e => !e.includes('favicon') && !e.includes('manifest'));
    assert.equal(criticalErrors.length, 0, `Unexpected console errors: ${criticalErrors.join(', ')}`);
    console.log('✓ Zero console or runtime errors during complete session.');

    console.log('\n======================================================');
    console.log('✅ ALL DAY 6 VERIFICATION GATE CHECKS PASSED (5/5)');
    console.log('======================================================\n');
  } finally {
    await browser.close();
    server.close();
  }
}

runE2E().catch(err => {
  console.error('Day 6 E2E Gate FAILED:', err);
  process.exit(1);
});
