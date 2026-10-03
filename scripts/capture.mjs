import puppeteer from 'puppeteer-core';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const targetUrl = process.argv[2] || 'https://travelmate-ai-flowzint.vercel.app/';
const outputPath = process.argv[3] || 'screenshot.png';

async function main() {
  console.log(`Navigating to: ${targetUrl}`);
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 900 });
    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: outputPath, fullPage: false });
    console.log(`Saved screenshot to: ${outputPath}`);
  } catch (err) {
    console.error('Error during screenshot:', err);
  } finally {
    await browser.close();
  }
}

main();
