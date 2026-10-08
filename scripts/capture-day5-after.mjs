import { chromium } from 'playwright';
import path from 'path';

async function capture() {
  const browser = await chromium.launch({ headless: true });

  const setupPage = async (context) => {
    await context.addInitScript(() => {
      window.localStorage.setItem('travelmate_location_onboarding', 'dismissed');
      window.localStorage.setItem('travelmate-onboarding-dismissed', 'true');
      window.localStorage.setItem('travelmate-blind-voice-gate-dismissed', 'true');
      window.localStorage.setItem('travelmate-blind-gate-completed', 'true');
      window.localStorage.setItem('travelmate-dpdp-consent', JSON.stringify({ essential_storage: true, analytics_consent: false }));
    });
  };

  // 1. Desktop 1440x900 - Results & Contrast
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  await setupPage(desktopContext);
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto('http://localhost:5173/planner?from=New+Delhi+(NDLS)&to=Patna+Jn+(PNBE)&date=2026-10-15', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(1000);

  // Scroll down to the insights section
  await desktopPage.evaluate(() => window.scrollTo(0, 600));
  await desktopPage.waitForTimeout(500);

  // Switch to contrast tab
  const contrastTab = desktopPage.locator('button', { hasText: 'Bypass Contrast' });
  if (await contrastTab.count() > 0) {
    await contrastTab.first().click({ force: true });
    await desktopPage.waitForTimeout(500);
  }

  await desktopPage.screenshot({
    path: path.resolve('docs/screenshots/day-5/after/desktop-01-results-contrast.png'),
    fullPage: false
  });

  // Switch to simulator tab
  const simTab = desktopPage.locator('button', { hasText: 'Delay Simulator' });
  if (await simTab.count() > 0) {
    await simTab.first().click({ force: true });
    await desktopPage.waitForTimeout(500);
    await desktopPage.evaluate(() => window.scrollTo(0, 750));
    await desktopPage.waitForTimeout(500);
  }

  await desktopPage.screenshot({
    path: path.resolve('docs/screenshots/day-5/after/desktop-02-delay-simulator.png'),
    fullPage: false
  });
  await desktopContext.close();

  // 2. Mobile 390x844 - Results & Contrast
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true
  });
  await setupPage(mobileContext);
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:5173/planner?from=New+Delhi+(NDLS)&to=Patna+Jn+(PNBE)&date=2026-10-15', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);

  // Scroll down to insights
  await mobilePage.evaluate(() => window.scrollTo(0, 800));
  await mobilePage.waitForTimeout(500);

  // Switch to contrast tab
  const mobileContrastTab = mobilePage.locator('button', { hasText: 'Bypass Contrast' });
  if (await mobileContrastTab.count() > 0) {
    await mobileContrastTab.first().click({ force: true });
    await mobilePage.waitForTimeout(500);
  }

  await mobilePage.screenshot({
    path: path.resolve('docs/screenshots/day-5/after/mobile-01-results-contrast.png'),
    fullPage: false
  });

  // Switch to simulator tab
  const mobileSimTab = mobilePage.locator('button', { hasText: 'Delay Simulator' });
  if (await mobileSimTab.count() > 0) {
    await mobileSimTab.first().click({ force: true });
    await mobilePage.waitForTimeout(500);
    await mobilePage.evaluate(() => window.scrollTo(0, 950));
    await mobilePage.waitForTimeout(500);
  }

  await mobilePage.screenshot({
    path: path.resolve('docs/screenshots/day-5/after/mobile-02-delay-simulator.png'),
    fullPage: false
  });
  await mobileContext.close();

  await browser.close();
  console.log('Day 5 AFTER screenshots captured successfully.');
}

capture().catch((err) => {
  console.error('Error capturing after screenshots:', err);
  process.exit(1);
});
