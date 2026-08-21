const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('LOG:', msg.text()));
  page.on('pageerror', error => console.log('ERR:', error.message));
  
  console.log("Going to track page...");
  await page.goto('http://localhost:5173/track');
  await new Promise(r => setTimeout(r, 2000));
  
  console.log("Filling form...");
  await page.type('input[placeholder="Enter Tracking ID"]', 'RW-DEMO01');
  await page.click('button[type="submit"]');
  
  console.log("Waiting for crash...");
  await new Promise(r => setTimeout(r, 4000));
  
  console.log("Taking screenshot just in case...");
  await page.screenshot({ path: 'crash.png' });
  
  await browser.close();
  console.log("Done.");
})();
