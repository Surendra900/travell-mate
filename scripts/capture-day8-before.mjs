import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function capture() {
  fs.mkdirSync(path.resolve('docs/screenshots/day-8/before'), { recursive: true });

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
    await desktopPage.waitForTimeout(600);
    await desktopPage.screenshot({ path: path.resolve('docs/screenshots/day-8/before/desktop-01-home.png'), fullPage: false });

    // Planner
    await desktopPage.goto('http://localhost:5173/planner', { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(600);
    await desktopPage.screenshot({ path: path.resolve('docs/screenshots/day-8/before/desktop-02-planner.png'), fullPage: false });

    // Tatkal Desk
    await desktopPage.goto('http://localhost:5173/planner?mode=tatkal', { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(600);
    await desktopPage.screenshot({ path: path.resolve('docs/screenshots/day-8/before/desktop-03-tatkal.png'), fullPage: false });

    // Passes & Safety
    await desktopPage.goto('http://localhost:5173/safety', { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(600);
    await desktopPage.screenshot({ path: path.resolve('docs/screenshots/day-8/before/desktop-04-passes-safety.png'), fullPage: false });

    await desktopContext.close();

    // 2. Mobile 390x844
    const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await setupPage(mobileContext);
    const mobilePage = await mobileContext.newPage();

    // Mobile Home
    await mobilePage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(600);
    await mobilePage.screenshot({ path: path.resolve('docs/screenshots/day-8/before/mobile-01-home.png'), fullPage: false });

    // Mobile Planner
    await mobilePage.goto('http://localhost:5173/planner', { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(600);
    await mobilePage.screenshot({ path: path.resolve('docs/screenshots/day-8/before/mobile-02-planner.png'), fullPage: false });

    // Mobile Passes & Safety
    await mobilePage.goto('http://localhost:5173/safety', { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(600);
    await mobilePage.screenshot({ path: path.resolve('docs/screenshots/day-8/before/mobile-03-passes-safety.png'), fullPage: false });

    await mobileContext.close();
    console.log('Day 8 BEFORE screenshots captured successfully.');
  } finally {
    await browser.close();
  }
}

capture().catch((err) => {
  console.error('Error capturing Day 8 BEFORE screenshots:', err);
  process.exit(1);
});
