const puppeteer = require('puppeteer');

const delay = ms => new Promise(r => setTimeout(r, ms));

async function scrapeBlinkit(query, pincode = '110078') {
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
    await page.goto('https://www.blinkit.com/', { waitUntil: 'domcontentloaded' });

    const continueBtn = 'div.DownloadAppModal__ContinueLink-sc-1wef47t-12';
    try {
      await page.waitForSelector(continueBtn, { timeout: 6000 });
      await page.click(continueBtn);
    } catch {}

    const closeSel = '[data-testid="close-popup"], .popup__close';
    if (await page.$(closeSel)) await page.click(closeSel);

    //location
    const locInput =
      'input[name="select-locality"], input.LocationSearchBox__InputSelect-sc-1k8u6a6-0';
    await page.waitForSelector(locInput, { visible: true, timeout: 15000 });
    await page.type(locInput, pincode, { delay: 60 });

    const firstSuggestion = 'div.LocationSearchList__LocationListContainer-sc-93rfr7-0';
    await page.waitForSelector(firstSuggestion, { visible: true, timeout: 10000 });
    await page.$eval(firstSuggestion, el => el.click());

    await delay(3000);

    const searchURL = `https://www.blinkit.com/s/?q=${encodeURIComponent(query)}`;
    await page.goto(searchURL, { waitUntil: 'networkidle2' });

    const tileSel = 'div[role="button"][id]';
    await page.waitForSelector(tileSel, { timeout: 30000 });

    const products = await page.evaluate(sel => {
      const tiles = Array.from(document.querySelectorAll(sel));

      const firstRupee = nodes => {
        for (const el of nodes) {
            if (el.innerText?.includes('₹')) {
            const match = el.innerText.match(/₹\d+/);
            if (match) return match[0];
            }
        }
        return '';
    };

      return tiles
        .map(tile => {
          const name =
            tile.querySelector('div.tw-text-300.tw-font-semibold')?.innerText.trim() ||
            tile.querySelector('[data-testid="product-title"]')?.innerText.trim() ||
            '';

          const quantity =
            tile.querySelector('div.tw-text-200.tw-font-medium')?.innerText.trim() || '';

          const price = firstRupee(tile.querySelectorAll('div, span, p'));

          let originalPrice = '';
          const strike = tile.querySelector('del,s,strike,span.line-through,div.line-through');
          if (strike && strike.innerText.includes('₹')) originalPrice = strike.innerText.trim();

          const deliveryTime =
            tile.querySelector('div.tw-text-050.tw-font-bold.tw-uppercase')?.innerText
              .trim()
              .replace(/\s+/g, ' ') || '';

          const link =
            tile.tagName.toLowerCase() === 'a'
              ? tile.href
              : tile.querySelector('a')?.href || '';

          return { name, quantity, price, originalPrice, deliveryTime, link };
        })
        .filter(p => p.name && p.price);
    }, tileSel);

    const topPdt = products.slice(0, 10);
    await browser.close();
    return topPdt;
  } catch (err) {
    await browser.close();
    throw err;
  }
}

module.exports = scrapeBlinkit;