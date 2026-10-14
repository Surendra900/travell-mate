import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

async function capture() {
  fs.mkdirSync(path.resolve('docs/screenshots/day-9/after'), { recursive: true });

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

    // Privacy Policy
    await desktopPage.goto('http://localhost:5173/privacy', { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(500);
    await desktopPage.screenshot({ path: path.resolve('docs/screenshots/day-9/after/desktop-01-privacy-policy.png'), fullPage: false });

    // Terms of Service
    await desktopPage.goto('http://localhost:5173/terms', { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(500);
    await desktopPage.screenshot({ path: path.resolve('docs/screenshots/day-9/after/desktop-02-terms-of-service.png'), fullPage: false });

    // Legal Disclaimer
    await desktopPage.goto('http://localhost:5173/disclaimer', { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(500);
    await desktopPage.screenshot({ path: path.resolve('docs/screenshots/day-9/after/desktop-03-legal-disclaimer.png'), fullPage: false });

    // Footer with legal links
    await desktopPage.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(500);
    await desktopPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await desktopPage.waitForTimeout(300);
    await desktopPage.screenshot({ path: path.resolve('docs/screenshots/day-9/after/desktop-04-footer-compliance.png'), fullPage: false });

    // Feedback Modal
    const feedbackBtn = await desktopPage.$('[data-testid="footer-feedback-btn"]');
    if (feedbackBtn) {
      await feedbackBtn.click();
      await desktopPage.waitForTimeout(400);
      await desktopPage.screenshot({ path: path.resolve('docs/screenshots/day-9/after/desktop-05-feedback-modal.png'), fullPage: false });
    }

    await desktopContext.close();

    // 2. Mobile 390x844
    const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
    await setupPage(mobileContext);
    const mobilePage = await mobileContext.newPage();

    // Mobile Privacy Policy
    await mobilePage.goto('http://localhost:5173/privacy', { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(500);
    await mobilePage.screenshot({ path: path.resolve('docs/screenshots/day-9/after/mobile-01-privacy-policy.png'), fullPage: false });

    // Mobile Terms of Service
    await mobilePage.goto('http://localhost:5173/terms', { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(500);
    await mobilePage.screenshot({ path: path.resolve('docs/screenshots/day-9/after/mobile-02-terms-of-service.png'), fullPage: false });

    // Mobile Legal Disclaimer
    await mobilePage.goto('http://localhost:5173/disclaimer', { waitUntil: 'networkidle' });
    await mobilePage.waitForTimeout(500);
    await mobilePage.screenshot({ path: path.resolve('docs/screenshots/day-9/after/mobile-03-legal-disclaimer.png'), fullPage: false });

    await mobileContext.close();
    console.log('Day 9 AFTER screenshots captured successfully.');
  } finally {
    await browser.close();
  }
}

capture().catch((err) => {
  console.error('Error capturing Day 9 AFTER screenshots:', err);
  process.exit(1);
});
