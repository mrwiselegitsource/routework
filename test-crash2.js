import puppeteer from 'puppeteer';
(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('LOG:', msg.text()));
  page.on('pageerror', error => console.log('ERR:', error.message));
  
  await page.goto('http://localhost:5173/track');
  await new Promise(r => setTimeout(r, 2000));
  
  await page.type('input[placeholder*="Tracking Number"]', 'RW-DEMO01');
  await page.click('button[type="submit"]');
  
  await new Promise(r => setTimeout(r, 4000));
  
  const content = await page.content();
  if (content.includes('Shipment Details')) {
    console.log("SUCCESS: Rendered Full View!");
  } else if (content.includes('Shipment not found')) {
    console.log("SUCCESS: Rendered Not Found!");
  } else if (content.includes('ErrorBoundary')) {
    console.log("CRASH: ErrorBoundary triggered!");
  } else {
    console.log("BLANK WHITE SCREEN!");
    console.log(content.slice(0, 1000));
  }
  
  await browser.close();
})();
