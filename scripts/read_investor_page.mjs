import puppeteer from 'puppeteer-core';

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

(async () => {
  try {
    const browser = await puppeteer.launch({
      executablePath: edgePath,
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    console.log('Loading https://yaiinfraventure.online ...');
    await page.goto('https://yaiinfraventure.online', { waitUntil: 'domcontentloaded', timeout: 30000 });
    console.log('Waiting 8 seconds for challenge bypass...');
    await new Promise(r => setTimeout(r, 8000));
    const title = await page.title();
    console.log('PAGE TITLE:', title);
    const text = await page.evaluate(() => document.body.innerText);
    console.log('=== PAGE TEXT ===');
    console.log(text.slice(0, 3000));
    await browser.close();
  } catch (err) {
    console.error('Puppeteer error:', err.message);
  }
})();
