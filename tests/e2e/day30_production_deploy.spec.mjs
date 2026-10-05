import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const PROD_URL = 'https://travelmate-ai-flowzint.vercel.app';

console.log(`Starting Day 30 Live Production Verification on: ${PROD_URL}`);

(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });

  try {
    // 1. Desktop 1440x900 Production Smoke & Tour Verification
    console.log('1. Auditing Desktop Live Production URL (1440x900)...');
    const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await desktopContext.newPage();
    page.setDefaultTimeout(20000);

    const consoleErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('pageerror', err => consoleErrors.push(err.message));

    await page.addInitScript(() => {
      localStorage.setItem('travelmate-location-onboarding', 'dismissed');
      localStorage.setItem('travelmate-storage-consent', 'granted');
      localStorage.setItem('travelmate-blind-mode', 'disabled');
      sessionStorage.setItem('travelmate-blind-gate-shown', 'true');
    });

    const response = await page.goto(PROD_URL, { waitUntil: 'domcontentloaded' });
    assert.equal(response.status(), 200, 'Production homepage must return HTTP 200');

    // Verify Title & Hero
    const title = await page.title();
    assert.ok(title.includes('TravelMate'), `Title must include TravelMate, got: ${title}`);
    console.log(`   ✓ Page title verified: "${title}"`);

    // Verify Judge Demo Tour Button
    const tourBtn = page.locator('[data-testid="navbar-demo-tour-btn"]');
    await tourBtn.waitFor({ state: 'visible' });
    await tourBtn.click();
    console.log('   ✓ Judge Demo Tour modal opened on production.');

    const modal = page.locator('[data-testid="demo-tour-modal"]');
    await modal.waitFor({ state: 'visible' });

    // Step 1 title match
    const stepTitle = page.locator('[data-testid="demo-tour-step-title"]');
    assert.match(await stepTitle.textContent(), /Multimodal Split-Routing/i);

    // Close tour
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);

    // Verify navigation to /planner
    await page.goto(`${PROD_URL}/planner`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    const plannerH1 = page.locator('h1');
    assert.match(await plannerH1.textContent(), /Journey Planner/i);
    console.log('   ✓ Production Journey Planner live & functional.');

    // Verify navigation to /safety
    await page.goto(`${PROD_URL}/safety`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    const safetyBody = await page.textContent('body');
    assert.ok(safetyBody.includes('112'), 'Emergency 112 hotline must be visible on /safety');
    assert.ok(safetyBody.includes('139') || safetyBody.includes('RailMadad'), 'RailMadad 139 hotline must be visible on /safety');
    console.log('   ✓ Production Emergency Toolkit live & functional.');

    // Verify navigation to /saved
    await page.goto(`${PROD_URL}/saved`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);
    const savedBody = await page.textContent('body');
    assert.ok(savedBody.includes('My Trips'), 'Saved Plans / My Trips must render cleanly on production');
    console.log('   ✓ Production Encrypted Document Vault & Trips live & functional.');

    await page.close();
    await desktopContext.close();

    // 2. Mobile 390x844 Production Verification
    console.log('\n2. Auditing Mobile Live Production URL (390x844)...');
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true
    });
    const mobilePage = await mobileContext.newPage();
    mobilePage.setDefaultTimeout(20000);

    await mobilePage.addInitScript(() => {
      localStorage.setItem('travelmate-location-onboarding', 'dismissed');
      localStorage.setItem('travelmate-storage-consent', 'granted');
      localStorage.setItem('travelmate-blind-mode', 'disabled');
      sessionStorage.setItem('travelmate-blind-gate-shown', 'true');
    });

    await mobilePage.goto(PROD_URL, { waitUntil: 'domcontentloaded' });
    await mobilePage.waitForTimeout(800);

    // Check zero horizontal overflow
    const mobileScrollWidth = await mobilePage.evaluate(() => document.documentElement.scrollWidth);
    assert.ok(mobileScrollWidth <= 390, `Mobile production scrollWidth (${mobileScrollWidth}px) exceeds 390px!`);
    console.log(`   ✓ Mobile production scrollWidth verified: ${mobileScrollWidth}px (zero overflow)`);

    await mobilePage.close();
    await mobileContext.close();

    // Verify zero fatal console errors
    const fatalErrors = consoleErrors.filter(
      e => !e.includes('SpeechRecognition') && !e.includes('speechSynthesis') && !e.includes('favicon') && !e.includes('Open-Meteo')
    );
    assert.equal(fatalErrors.length, 0, `Unexpected errors in production: ${fatalErrors.join(', ')}`);

    console.log('\n✔ DAY 30 PRODUCTION DEPLOY VERIFICATION PASSED (5/5 checks passed cleanly).');
    process.exitCode = 0;
  } catch (err) {
    console.error('❌ Day 30 Production Deploy verification failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
