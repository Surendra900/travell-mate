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

server.listen(4253, async () => {
  console.log('Day 25 Carbon Analytics E2E server running on port 4253...');
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

    await page.goto('http://localhost:4253/planner', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    console.log('2. Verifying CarbonCalculator component rendering...');
    const carbonCard = page.locator('[data-testid="carbon-analytics-card"]');
    await carbonCard.waitFor({ state: 'visible' });
    console.log('   ✓ Trip Analytics & Carbon card located');

    console.log('3. Verifying CO2 footprint, savings badge and tree metrics...');
    const co2Val = page.locator('[data-testid="carbon-co2-val"]');
    await co2Val.waitFor({ state: 'visible' });
    const co2Text = await co2Val.innerText();
    assert.ok(co2Text.includes('kg CO₂e'), 'Must display carbon footprint with kg CO2e unit');

    const savingsBadge = page.locator('[data-testid="carbon-savings-badge"]');
    const badgeText = await savingsBadge.innerText();
    assert.ok(badgeText.length > 5, 'Must render carbon rating badge');

    const treesVal = page.locator('[data-testid="carbon-trees-val"]');
    const treesText = await treesVal.innerText();
    assert.ok(treesText.includes('trees/yr'), 'Must display annual tree absorption offset');
    console.log('   ✓ CO2 footprint, rating badge, and tree offset metrics verified');

    console.log('4. Testing Private Cab baseline switcher...');
    const cabBtn = page.getByRole('button', { name: 'Private Cab' });
    await cabBtn.click();
    await page.waitForTimeout(300);
    const cardText = await carbonCard.innerText();
    assert.ok(cardText.includes('vs solo cab'), 'Baseline comparison must reflect private cab');
    console.log('   ✓ Baseline comparison toggle verified');

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

    await mobilePage.goto('http://localhost:4253/planner', { waitUntil: 'domcontentloaded' });
    await mobilePage.waitForTimeout(1000);

    const mobileCarbon = mobilePage.locator('[data-testid="carbon-analytics-card"]');
    await mobileCarbon.waitFor({ state: 'visible' });
    const mobileCo2 = await mobileCarbon.locator('[data-testid="carbon-co2-val"]').innerText();
    assert.ok(mobileCo2.includes('kg CO₂e'));
    console.log('   ✓ Mobile viewport check passed');

    await mobileContext.close();
    await context.close();

    console.log('\nAll Day 25 Trip Analytics & Carbon Savings E2E checks PASSED cleanly (5/5).');
  } catch (err) {
    console.error('Day 25 E2E test failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
  }
});
