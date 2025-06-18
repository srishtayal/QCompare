const puppeteer = require('puppeteer');
const delay = ms => new Promise(r => setTimeout(r, ms));

async function swiggyScrape(query){
  const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox','--use-fake-ui-for-media-stream',],
      defaultViewport: { width: 1280, height: 800 }
    });
  const context = browser.defaultBrowserContext();
  await context.overridePermissions("https://www.swiggy.com", ["geolocation"]);
  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  );
  await page.setGeolocation({ latitude:28.5684 , longitude:77.2416 });
  try{
    await page.goto('https://www.swiggy.com/instamart',{ waitUntil: 'networkidle2' });
    await page.waitForSelector('[data-testid="set-gps-button"]', { visible: true });
    await page.click('[data-testid="set-gps-button"]');
    
  }catch{}
  await delay(2000); // Give time for the tooltip to appear
  await page.waitForFunction(() => {
  const tooltip = document.querySelector('[data-testid="re-check-address-tooltip"]');
  const closeBtn = tooltip?.querySelector('[role="button"]');
  return !!closeBtn;
});

await page.evaluate(() => {
  const tooltip = document.querySelector('[data-testid="re-check-address-tooltip"]');
  const closeBtn = tooltip?.querySelector('[role="button"]');
  closeBtn?.click();
});



await page.waitForSelector('div._1AaZg',{visible:true});
await page.click('div._1AaZg');
await delay(2000);
await page.waitForSelector('[data-testid="search-page-header-search-bar-input"]', { visible: true });

await page.type('[data-testid="search-page-header-search-bar-input"]', query);
await page.keyboard.press('Enter');

await page.waitForSelector('div._179Mx',{visible:true});
await page.evaluate(() => {
  window.scrollBy(0, window.innerHeight); // small scroll to trigger image load
});
await delay(500);

const products = await page.evaluate(() => {
  const items = Array.from(document.querySelectorAll('[data-testid="default_container_ux4"]'));

  const filteredItems = items.filter(item => {
  const adBadge = item.querySelector('[data-testid="badge-wrapper"]');
  return !(adBadge && adBadge.innerText.trim() === "Ad");
  });
  
  return filteredItems.map(item => {
    const name = item.querySelector('.novMV')?.innerText || '';
    const productImg = Array.from(item.querySelectorAll('img'))
      .map(img => img.src)
      .find(src => src.includes('media-assets.swiggy.com') && !src.includes('instamart-media-assets')) || null;
    const quantity = item.querySelector('.FqnWn')?.innerText || '';
    const delivery = item.querySelector('.sc-aXZVg.cwTvVs.GOJ8s')?.innerText || '';
    const price = item.querySelector('[data-testid="item-mrp-price"]')?.innerText || '';
    const offer = item.querySelector('[data-testid="item-offer-price"]')?.innerText || '';
    const isSoldOut = !!item.querySelector('[data-testid="sold-out"]');
    const availability = isSoldOut ? 'Sold Out' : 'Available';

    return { name, productImg, quantity, delivery, price, offer, availability };
  });
});

await browser.close();

return products;






}

module.exports= swiggyScrape;