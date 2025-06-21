const puppeteer = require('puppeteer');

const delay = ms => new Promise(r => setTimeout(r, ms));

async function scrapeBlinkit(query, pincode = '110078', maxProducts = 20) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 800 }
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
  );

  try {
    /* 1. Homepage & pop-ups */
    await page.goto('https://www.blinkit.com/', { waitUntil: 'domcontentloaded' });
    await page.$('div.DownloadAppModal__ContinueLink-sc-1wef47t-12')
      .then(el => el?.click().catch(() => null));
    await page.$('[data-testid="close-popup"], .popup__close')
      .then(el => el?.click().catch(() => null));

    /* 2. Pincode */
    const locInput =
      'input[name="select-locality"], input.LocationSearchBox__InputSelect-sc-1k8u6a6-0';
    await page.waitForSelector(locInput, { visible: true, timeout: 15_000 });
    await page.type(locInput, pincode, { delay: 60 });
    const firstSuggestion =
      'div.LocationSearchList__LocationListContainer-sc-93rfr7-0';
    await page.waitForSelector(firstSuggestion, { visible: true, timeout: 10_000 });
    await page.$eval(firstSuggestion, el => el.click());
    await delay(2_000);

    /* 3. Search */
    const searchURL = `https://www.blinkit.com/s/?q=${encodeURIComponent(query)}`;
    await page.goto(searchURL, { waitUntil: 'networkidle2' });

    /* 4. Tiles */
    const tileSel = 'div[role="button"][id]';
    await page.waitForSelector(tileSel, { timeout: 30_000 });

    const products = await page.$$eval(tileSel, tiles => {
      /* slugify helper (DOM context) */
      const slugify = str =>
        str.toLowerCase()
           .replace(/[^a-z0-9]+/g, '-')    /* non-alnum → dash */  /*[3]*/
           .replace(/^-+|-+$/g, '');       /* trim dashes */

      // const firstRupee = nodes => {
      //   for (const el of nodes) {
      //     if (el.innerText?.includes('₹')) {
      //       const m = el.innerText.match(/₹\s?\d+/);
      //       if (m) return m[0];
      //     }
      //   }
      //   return '';
      // };

      const pickImage = img =>
        img?.currentSrc ||
        img?.getAttribute('src') ||
        img?.getAttribute('data-src') ||
        (img?.getAttribute('srcset') || '').split(' ')[0] || '';

      return tiles.map(tile => {
        const id   = tile.getAttribute('id') || '';
        const name =
          tile.querySelector('div.tw-text-300.tw-font-semibold')?.innerText.trim() ||
          tile.querySelector('[data-testid="product-title"]')?.innerText.trim() || '';

        const quantity =
          tile.querySelector('div.tw-text-200.tw-font-medium')?.innerText.trim() || '';

        let price = '';
        const priceEl = tile.querySelector('div.tw-text-200.tw-font-semibold');
        if (priceEl) price = priceEl.innerText.trim();

        let originalPrice = '';
        const strike = tile.querySelector(
          'del,s,strike,span.line-through,div.line-through'
        );
        if (strike && strike.innerText.includes('₹'))
          originalPrice = strike.innerText.trim();

        const deliveryTime =
          tile.querySelector('div.tw-text-050.tw-font-bold.tw-uppercase')
              ?.innerText.trim()
              .replace(/\s+/g, ' ') || '';

        const outOfStock = tile.innerText.toLowerCase().includes('out of stock');
        const image      = pickImage(tile.querySelector('img'));
        const link       = id && name
          ? `https://blinkit.com/prn/${slugify(name)}/prid/${id}`
          : '';

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
      }).filter(p => p.name && (p.price || p.outOfStock));
    });

    return products.slice(0, maxProducts);
  } finally {
    await browser.close();
  }
}

module.exports = scrapeBlinkit;