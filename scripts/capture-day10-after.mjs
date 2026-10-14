import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function capture() {
  fs.mkdirSync(path.resolve('docs/screenshots/day-10/after'), { recursive: true });

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

    // Home
    await desktopPage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(500);
    await desktopPage.screenshot({ path: path.resolve('docs/screenshots/day-10/after/desktop-01-home.png'), fullPage: false });

    // Planner
    await desktopPage.goto('http://localhost:5173/planner', { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(500);
    await desktopPage.screenshot({ path: path.resolve('docs/screenshots/day-10/after/desktop-02-planner.png'), fullPage: false });

    // Tatkal Desk
    await desktopPage.goto('http://localhost:5173/planner?mode=tatkal', { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(500);
    await desktopPage.screenshot({ path: path.resolve('docs/screenshots/day-10/after/desktop-03-tatkal.png'), fullPage: false });

    // Passes & Safety
    await desktopPage.goto('http://localhost:5173/safety', { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(500);
    await desktopPage.screenshot({ path: path.resolve('docs/screenshots/day-10/after/desktop-04-passes-safety.png'), fullPage: false });

    // Privacy & DPDP
    await desktopPage.goto('http://localhost:5173/privacy', { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(500);
    await desktopPage.screenshot({ path: path.resolve('docs/screenshots/day-10/after/desktop-05-privacy.png'), fullPage: false });

    await desktopContext.close();

    // 2. Mobile 390x844
    const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await setupPage(mobileContext);
    const mobilePage = await mobileContext.newPage();

    await mobilePage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(500);
    await mobilePage.screenshot({ path: path.resolve('docs/screenshots/day-10/after/mobile-01-home.png'), fullPage: false });

    await mobilePage.goto('http://localhost:5173/planner', { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(500);
    await mobilePage.screenshot({ path: path.resolve('docs/screenshots/day-10/after/mobile-02-planner.png'), fullPage: false });

    await mobilePage.goto('http://localhost:5173/safety', { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(500);
    await mobilePage.screenshot({ path: path.resolve('docs/screenshots/day-10/after/mobile-03-passes-safety.png'), fullPage: false });

    await mobilePage.goto('http://localhost:5173/privacy', { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(500);
    await mobilePage.screenshot({ path: path.resolve('docs/screenshots/day-10/after/mobile-04-privacy.png'), fullPage: false });

    await mobileContext.close();
    console.log('Day 10 AFTER screenshots captured successfully.');
  } finally {
    await browser.close();
  }
}

capture().catch((err) => {
  console.error('Error capturing Day 10 AFTER screenshots:', err);
  process.exit(1);
});
