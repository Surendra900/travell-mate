import { chromium } from 'playwright';
import path from 'path';

async function capture() {
  const browser = await chromium.launch({ headless: true });

  // Desktop
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const desktopPage = await desktopContext.newPage();
  await desktopPage.goto('http://localhost:5173/planner', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(1000);
  await desktopPage.screenshot({
    path: path.resolve('docs/screenshots/day-5/before/desktop-01-planner-results.png'),
    fullPage: false
  });
  await desktopContext.close();

  // Mobile
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:5173/planner', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({
    path: path.resolve('docs/screenshots/day-5/before/mobile-01-planner-results.png'),
    fullPage: false
  });
  await mobileContext.close();

  await browser.close();
  console.log('Day 5 BEFORE screenshots captured successfully.');
}

capture().catch((err) => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
