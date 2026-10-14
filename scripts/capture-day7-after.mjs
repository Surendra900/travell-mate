import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function capture() {
  fs.mkdirSync(path.resolve('docs/screenshots/day-7/after'), { recursive: true });

  const browser = await chromium.launch({ headless: true });

  const setupPage = async (context) => {
    await context.addInitScript(() => {
      window.localStorage.setItem('travelmate-blind-mode', 'disabled');
      window.localStorage.setItem('travelmate_blind_voice_mode', 'standard');
      window.sessionStorage.setItem('travelmate-blind-gate-shown', 'true');
      window.localStorage.setItem('travelmate-blind-voice-gate-dismissed', 'true');
      window.localStorage.setItem('travelmate-blind-gate-completed', 'true');
      window.localStorage.setItem('travelmate-location-onboarding', 'dismissed');
      window.localStorage.setItem('travelmate_location_onboarding', 'dismissed');
      window.localStorage.setItem('travelmate-onboarding-dismissed', 'true');
      window.localStorage.setItem('travelmate-dpdp-consent', JSON.stringify({ essential_storage: true, analytics_consent: false }));
    });
  };

  try {
    // 1. Desktop 1440x900 - Passes & Safety Hub
    const desktopContext = await browser.newContext({
      viewport: { width: 1440, height: 900 }
    });
    await setupPage(desktopContext);
    const desktopPage = await desktopContext.newPage();
    await desktopPage.goto('http://localhost:5173/safety', { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(1000);

    await desktopPage.screenshot({
      path: path.resolve('docs/screenshots/day-7/after/desktop-01-passes-safety.png'),
      fullPage: false
    });

    // 2. Open Digital Pass Modal
    const viewPassBtn = desktopPage.locator('[data-testid="view-offline-pass-btn"]');
    if (await viewPassBtn.count() > 0) {
      await viewPassBtn.first().click({ force: true });
      await desktopPage.waitForTimeout(600);
      await desktopPage.screenshot({
        path: path.resolve('docs/screenshots/day-7/after/desktop-02-digital-pass-modal.png'),
        fullPage: false
      });
      // Close modal
      const closeBtn = desktopPage.locator('button[aria-label="Close"]');
      if (await closeBtn.count() > 0) {
        await closeBtn.click();
        await desktopPage.waitForTimeout(400);
      }
    }

    // 3. Switch to Transit Helplines tab (112 / 139 + GPS)
    const helplinesTab = desktopPage.locator('[data-testid="tab-safety-helplines"]');
    if (await helplinesTab.count() > 0) {
      await helplinesTab.click({ force: true });
      await desktopPage.waitForTimeout(600);
    }
    await desktopPage.screenshot({
      path: path.resolve('docs/screenshots/day-7/after/desktop-03-safety-drawer.png'),
      fullPage: false
    });

    // 4. Grounded AI Query Parser on Home
    await desktopPage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    // Dismiss blind gate if present
    const blindGateNo = desktopPage.locator('[data-testid="blind-gate-no"]');
    if (await blindGateNo.count() > 0) {
      await blindGateNo.click({ force: true });
      await desktopPage.waitForTimeout(400);
    }

    const aiInput = desktopPage.locator('[data-testid="ai-query-input"]');
    if (await aiInput.count() > 0) {
      await aiInput.fill('Tomorrow morning train from Delhi to Patna for 2 passengers');
      const parseBtn = desktopPage.locator('[data-testid="ai-parse-btn"]');
      if (await parseBtn.count() > 0) {
        await parseBtn.click({ force: true });
        await desktopPage.waitForTimeout(1200);
      }
    }
    await desktopPage.screenshot({
      path: path.resolve('docs/screenshots/day-7/after/desktop-04-ai-query-input.png'),
      fullPage: false
    });

    await desktopContext.close();

    // 5. Mobile 390x844 - Passes & Safety Hub
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true
    });
    await setupPage(mobileContext);
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto('http://localhost:5173/safety', { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(1000);

    await mobilePage.screenshot({
      path: path.resolve('docs/screenshots/day-7/after/mobile-01-passes-safety.png'),
      fullPage: false
    });

    // Mobile Helplines Tab
    const mobileHelplinesTab = mobilePage.locator('[data-testid="tab-safety-helplines"]');
    if (await mobileHelplinesTab.count() > 0) {
      await mobileHelplinesTab.click({ force: true });
      await mobilePage.waitForTimeout(600);
    }
    await mobilePage.screenshot({
      path: path.resolve('docs/screenshots/day-7/after/mobile-02-safety-drawer.png'),
      fullPage: false
    });

    await mobileContext.close();

    console.log('Day 7 AFTER screenshots successfully captured.');
  } finally {
    await browser.close();
  }
}

capture().catch((err) => {
  console.error('Error capturing Day 7 AFTER screenshots:', err);
  process.exit(1);
});
