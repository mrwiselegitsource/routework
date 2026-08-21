import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('LOG:', msg.text()));
  page.on('pageerror', error => console.log('ERR:', error.message));
  
  await page.goto('http://localhost:5173/track');
  await new Promise(r => setTimeout(r, 2000));
  
  // Use correct selector for the search input
  await page.type('input[placeholder*="Tracking"]', 'RW-DEMO01');
  await page.click('button[type="submit"]');
  
  await new Promise(r => setTimeout(r, 4000));
  
  // Take screenshot to see if it's blank
  await page.screenshot({ path: 'crash.png' });
  
  await browser.close();
})();
