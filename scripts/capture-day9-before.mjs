import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function capture() {
  fs.mkdirSync(path.resolve('docs/screenshots/day-9/before'), { recursive: true });

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
    // 1. Desktop 1440x900
    const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await setupPage(desktopContext);
    const desktopPage = await desktopContext.newPage();

    // Home Footer Area
    await desktopPage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(500);
    await desktopPage.screenshot({ path: path.resolve('docs/screenshots/day-9/before/desktop-01-home-footer.png'), fullPage: false });

    // Safety Screen
    await desktopPage.goto('http://localhost:5173/safety', { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(500);
    await desktopPage.screenshot({ path: path.resolve('docs/screenshots/day-9/before/desktop-02-safety-disclaimer.png'), fullPage: false });

    // Saved Plans
    await desktopPage.goto('http://localhost:5173/saved', { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(500);
    await desktopPage.screenshot({ path: path.resolve('docs/screenshots/day-9/before/desktop-03-saved-plans.png'), fullPage: false });

    await desktopContext.close();

    // 2. Mobile 390x844
    const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await setupPage(mobileContext);
    const mobilePage = await mobileContext.newPage();

    // Mobile Home Footer
    await mobilePage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(500);
    await mobilePage.screenshot({ path: path.resolve('docs/screenshots/day-9/before/mobile-01-home-footer.png'), fullPage: false });

    // Mobile Safety
    await mobilePage.goto('http://localhost:5173/safety', { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(500);
    await mobilePage.screenshot({ path: path.resolve('docs/screenshots/day-9/before/mobile-02-safety-disclaimer.png'), fullPage: false });

    await mobileContext.close();
    console.log('Day 9 BEFORE screenshots captured successfully.');
  } finally {
    await browser.close();
  }
}

capture().catch((err) => {
  console.error('Error capturing Day 9 BEFORE screenshots:', err);
  process.exit(1);
});
