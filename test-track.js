import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => console.log('LOG:', msg.text()));
  page.on('pageerror', error => console.log('ERR:', error.message));
  
  await page.goto('http://localhost:5173/track?id=RW-DEMO01');
  await new Promise(r => setTimeout(r, 4000));
  await browser.close();
})();
