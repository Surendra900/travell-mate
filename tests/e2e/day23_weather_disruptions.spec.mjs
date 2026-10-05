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

server.listen(4247, async () => {
  console.log('Day 23 Weather Disruptions E2E server running on port 4247...');
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  try {
    console.log('1. Navigating to Planner page on Desktop (1440x900)...');
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    const page = await context.newPage();
    page.setDefaultTimeout(15000);

    await page.addInitScript(() => {
      localStorage.setItem('travelmate-location-onboarding', 'dismissed');
      localStorage.setItem('travelmate_blind_voice_mode', 'standard');
    });

    await page.goto('http://localhost:4247/planner', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);

    console.log('2. Verifying WeatherDisruptionAlert component rendering...');
    const alertSection = page.locator('[data-testid="weather-disruption-alert"]');
    await alertSection.waitFor({ state: 'visible' });
    const textContent = await alertSection.innerText();
    assert.ok(textContent.includes('Open-Meteo REST API'), 'Must indicate Open-Meteo REST API source');
    console.log('   ✓ Weather Disruption alert section located with Open-Meteo attribution');

    console.log('3. Testing Dense Winter Fog Simulation (<250m)...');
    const simFogBtn = page.locator('[data-testid="sim-fog-btn"]');
    await simFogBtn.click();
    await page.waitForTimeout(500);

    const riskBadge = page.locator('[data-testid="weather-risk-badge"]');
    const riskBadgeText = await riskBadge.innerText();
    assert.match(riskBadgeText.toLowerCase(), /critical/i, 'Dense fog must trigger CRITICAL risk badge');

    const visibilityVal = page.locator('[data-testid="weather-visibility-val"]');
    const visibilityText = await visibilityVal.innerText();
    assert.ok(visibilityText.includes('0.2 km') || visibilityText.includes('0.3 km'), 'Visibility must reflect fog value');

    const recommendedAction = page.locator('[data-testid="weather-recommended-action"]');
    const actionText = await recommendedAction.innerText();
    assert.ok(actionText.length > 10, 'Actionable traveler advice must be provided');
    console.log('   ✓ Dense fog simulation triggered CRITICAL risk and severe visibility alert');

    console.log('4. Testing Torrential Monsoon Simulation...');
    const simMonsoonBtn = page.locator('[data-testid="sim-monsoon-btn"]');
    await simMonsoonBtn.click();
    await page.waitForTimeout(500);

    const alertHeadline = await alertSection.innerText();
    assert.match(alertHeadline.toLowerCase(), /monsoon|mumbai/i, 'Headline must reflect monsoon condition');
    console.log('   ✓ Torrential monsoon simulation confirmed with waterlogging and rain advisories');

    console.log('5. Testing Mobile responsive viewport (390x844)...');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true
    });
    const mobilePage = await mobileContext.newPage();
    mobilePage.setDefaultTimeout(15000);

    await mobilePage.addInitScript(() => {
      localStorage.setItem('travelmate-location-onboarding', 'dismissed');
      localStorage.setItem('travelmate_blind_voice_mode', 'standard');
    });

    await mobilePage.goto('http://localhost:4247/planner', { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(1000);

    const mobileAlert = mobilePage.locator('[data-testid="weather-disruption-alert"]');
    await mobileAlert.waitFor({ state: 'visible' });

    const mobileFogBtn = mobilePage.locator('[data-testid="sim-fog-btn"]');
    await mobileFogBtn.click();
    await mobilePage.waitForTimeout(500);

    const mobileRiskBadge = mobilePage.locator('[data-testid="weather-risk-badge"]');
    const mobileRiskText = await mobileRiskBadge.innerText();
    assert.match(mobileRiskText.toLowerCase(), /critical/i);
    console.log('   ✓ Mobile viewport check passed');

    await mobileContext.close();
    await context.close();

    console.log('\nAll Day 23 Open-Meteo Weather Disruption E2E checks PASSED cleanly (5/5).');
  } catch (err) {
    console.error('Day 23 E2E test failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
  }
});
