import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function capture() {
  fs.mkdirSync(path.resolve('docs/screenshots/day-6/before'), { recursive: true });
  fs.mkdirSync(path.resolve('docs/screenshots/day-6/after'), { recursive: true });

  const browser = await chromium.launch({ headless: true });

  const setupPage = async (context) => {
    await context.addInitScript(() => {
      window.localStorage.setItem('travelmate-location-onboarding', 'dismissed');
      window.localStorage.setItem('travelmate_location_onboarding', 'dismissed');
      window.localStorage.setItem('travelmate-onboarding-dismissed', 'true');
      window.localStorage.setItem('travelmate-blind-voice-gate-dismissed', 'true');
      window.localStorage.setItem('travelmate-blind-gate-completed', 'true');
      window.localStorage.setItem('travelmate-dpdp-consent', JSON.stringify({ essential_storage: true, analytics_consent: false }));
    });
  };

  // 1. Desktop 1440x900 - Tatkal Desk Before
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  await setupPage(desktopContext);
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto('http://localhost:5173/planner?mode=tatkal', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(1000);

  await desktopPage.screenshot({
    path: path.resolve('docs/screenshots/day-6/before/desktop-01-tatkal-desk.png'),
    fullPage: false
  });

  // Open PNR Predictor Modal on Desktop
  const pnrButton = desktopPage.locator('button', { hasText: 'PNR' }).or(desktopPage.locator('text=PNR'));
  if (await pnrButton.count() > 0) {
    await pnrButton.first().click({ force: true });
    await desktopPage.waitForTimeout(600);
  }

  await desktopPage.screenshot({
    path: path.resolve('docs/screenshots/day-6/before/desktop-02-pnr-tracker.png'),
    fullPage: false
  });
  await desktopContext.close();

  // 2. Mobile 390x844 - Tatkal Desk & PNR Before
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true
  });
  await setupPage(mobileContext);
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:5173/planner?mode=tatkal', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);

  await mobilePage.screenshot({
    path: path.resolve('docs/screenshots/day-6/before/mobile-01-tatkal-desk.png'),
    fullPage: false
  });

  // Open PNR Predictor on Mobile if available
  const pnrButtonMobile = mobilePage.locator('button', { hasText: 'PNR' }).or(mobilePage.locator('text=PNR'));
  if (await pnrButtonMobile.count() > 0) {
    await pnrButtonMobile.first().click({ force: true });
    await mobilePage.waitForTimeout(600);
  }

  await mobilePage.screenshot({
    path: path.resolve('docs/screenshots/day-6/before/mobile-02-pnr-tracker.png'),
    fullPage: false
  });
  await mobileContext.close();

  await browser.close();
  console.log('Day 6 BEFORE screenshots captured successfully.');
}

capture().catch((err) => {
  console.error('Error capturing Day 6 BEFORE screenshots:', err);
  process.exit(1);
});
