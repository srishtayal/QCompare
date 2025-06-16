const puppeteer = require('puppeteer');

const delay = ms => new Promise(r => setTimeout(r, ms));

async function scrapeBlinkit(query, pincode = '110078', maxProducts = 10) {  
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 800 }
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  );

  try {
    /* ---------- open home & handle pop-ups ---------- */
    await page.goto('https://www.blinkit.com/', { waitUntil: 'domcontentloaded' });     // puppeteer navigation [3]

    const continueBtn = 'div.DownloadAppModal__ContinueLink-sc-1wef47t-12';
    await page.$(continueBtn).then(el => el?.click().catch(() => null));

    const closeSel = '[data-testid="close-popup"], .popup__close';
    await page.$(closeSel).then(el => el?.click().catch(() => null));

    /* ---------- set location ---------- */
    const locInput =
      'input[name="select-locality"], input.LocationSearchBox__InputSelect-sc-1k8u6a6-0';
    await page.waitForSelector(locInput, { visible: true, timeout: 15_000 });
    await page.type(locInput, pincode, { delay: 60 });

    const firstSuggestion =
      'div.LocationSearchList__LocationListContainer-sc-93rfr7-0';
    await page.waitForSelector(firstSuggestion, { visible: true, timeout: 10_000 });
    await page.$eval(firstSuggestion, el => el.click());

    await delay(2_000);

    /* ---------- search ---------- */
    const searchURL = `https://www.blinkit.com/s/?q=${encodeURIComponent(query)}`;
    await page.goto(searchURL, { waitUntil: 'networkidle2' });

    const tileSel = 'div[role="button"][id]';
    await page.waitForSelector(tileSel, { timeout: 30_000 });

    /* ---------- scrape tiles ---------- */
    const products = await page.$$eval(tileSel, tiles => {
      const firstRupee = nodes => {
        for (const el of nodes) {
          if (el.innerText?.includes('₹')) {
            const m = el.innerText.match(/₹\s?\d+/);
            if (m) return m[0];
          }
        }
        return '';
      };
      const pickImage = img =>
        img?.currentSrc ||
        img?.getAttribute('src') ||
        img?.getAttribute('data-src') ||
        (img?.getAttribute('srcset') || '').split(' ')[0] || '';

      return tiles
        .map(tile => {
          const text = tile.innerText.toLowerCase();
          const outOfStock = text.includes('out of stock');

          const name =
            tile.querySelector('div.tw-text-300.tw-font-semibold')?.innerText.trim() ||
            tile.querySelector('[data-testid="product-title"]')?.innerText.trim() || '';

          const quantity =
            tile.querySelector('div.tw-text-200.tw-font-medium')?.innerText.trim() || '';

          const price = firstRupee(tile.querySelectorAll('div, span, p'));

          let originalPrice = '';
          const strike = tile.querySelector(
            'del,s,strike,span.line-through,div.line-through'
          );
          if (strike && strike.innerText.includes('₹'))
            originalPrice = strike.innerText.trim();

          const deliveryTime =
            tile
              .querySelector('div.tw-text-050.tw-font-bold.tw-uppercase')
              ?.innerText.trim()
              .replace(/\s+/g, ' ') || '';

          const link   = tile.querySelector('a[href]')?.href || '';
          const image  = pickImage(tile.querySelector('img'));

          return {
            name,
            quantity,
            price,
            originalPrice,
            deliveryTime,
            link,
            image,
            outOfStock
          };
        })
        .filter(p => p.name && (p.price || p.outOfStock));
    });

    await browser.close();
    return products.slice(0, maxProducts);                                        
  } catch (e) {
    await browser.close();
    throw e;
  }
}

module.exports = scrapeBlinkit;
