const puppeteer = require('puppeteer');

const delay = ms => new Promise(r => setTimeout(r, ms));

async function swiggyScrape(query, location) {
  const { latitude, longitude } = location;

  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--use-fake-ui-for-media-stream'
    ],
    defaultViewport: { width: 1280, height: 800 }
  });

  const context = browser.defaultBrowserContext();
  await context.overridePermissions("https://www.swiggy.com", ["geolocation"]);

  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  );
  await page.setGeolocation({ latitude, longitude });

  try {
    await page.goto('https://www.swiggy.com/instamart', { waitUntil: 'networkidle2' });

    // Enable location via button
    await page.waitForSelector('[data-testid="set-gps-button"]', { visible: true });
    await page.click('[data-testid="set-gps-button"]');

    await delay(500);

    // Close the tooltip if it appears
    await page.waitForFunction(() => {
      const tooltip = document.querySelector('[data-testid="re-check-address-tooltip"]');
      const closeBtn = tooltip?.querySelector('[role="button"]');
      return !!closeBtn;
    }, { timeout: 10000 });

    await page.evaluate(() => {
      const tooltip = document.querySelector('[data-testid="re-check-address-tooltip"]');
      const closeBtn = tooltip?.querySelector('[role="button"]');
      closeBtn?.click();
    });

    // Click the search bar
    await page.waitForSelector('div._1AaZg', { visible: true });
    await page.click('div._1AaZg');
    await delay(200);

    // Type the search query
    await page.waitForSelector('[data-testid="search-page-header-search-bar-input"]', { visible: true });
    await page.type('[data-testid="search-page-header-search-bar-input"]', query);
    await page.keyboard.press('Enter');
    await delay(2000); // wait for results to start appearing

    // Wait for product cards to show up
    await page.waitForSelector('[data-testid="default_container_ux4"]', { visible: true, timeout: 30000 });

    // Scroll through all items to trigger lazy-loading
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('[data-testid="default_container_ux4"]'));
      for (const item of items) {
        item.scrollIntoView({ behavior: 'instant', block: 'center' });
      }
    });

    await delay(1000); // allow time for images/text to load

    // Scrape the products
    const products = await page.evaluate(() => {
      function generateSwiggySearchURL(productName) {
        const encodedQuery = encodeURIComponent(productName).replace(/%20/g, '+');
        return `https://www.swiggy.com/instamart/search?custom_back=true&query=${encodedQuery}`;
      }

      const items = Array.from(document.querySelectorAll('[data-testid="default_container_ux4"]'));

      return items.map(item => {
        const name = item.querySelector('.novMV')?.innerText || '';
        const productImg = Array.from(item.querySelectorAll('img'))
          .map(img => img.src)
          .find(src => src.includes('media-assets.swiggy.com') && !src.includes('instamart-media-assets')) || null;
        const quantity = item.querySelector('.FqnWn')?.innerText || '';
        const delivery = item.querySelector('.sc-aXZVg.cwTvVs.GOJ8s')?.innerText || '';
        const price = item.querySelector('[data-testid="item-offer-price"]')?.innerText || '';
        const link = generateSwiggySearchURL(name);
        const isSoldOut = !!item.querySelector('[data-testid="sold-out"]');
        const availability = isSoldOut ? 'Sold Out' : 'Available';

        return { name, productImg, quantity, delivery, price, link, availability };
      });
    });

    await browser.close();
    return products;

  } catch (err) {
    console.error("Error scraping Swiggy:", err.message);
    await browser.close();
    return [];
  }
}

module.exports = swiggyScrape;
