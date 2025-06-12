const puppeteer = require('puppeteer');

const delay = ms => new Promise(r => setTimeout(r, ms));

async function scrapeBlinkit(query, pincode = '110078') {

  const browser = await puppeteer.launch({
    headless: false,                               // → true in production
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 800 }
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  );

  try {
    await page.goto('https://www.blinkit.com/', { waitUntil: 'domcontentloaded' });

    // handle download app modeal
    const continueBtn = 'div.DownloadAppModal__ContinueLink-sc-1wef47t-12';
    try {
      await page.waitForSelector(continueBtn, { timeout: 6_000 });
      await page.click(continueBtn);
      console.log('Clicked “Continue on web”');
    } catch {
      console.log('No app-download modal');
    }

    const closeSel = '[data-testid="close-popup"], .popup__close';
    if (await page.$(closeSel)) {
      await page.click(closeSel);
      console.log('Secondary pop-up closed');
    }

    //location selection
    const locInput =
      'input[name="select-locality"], input.LocationSearchBox__InputSelect-sc-1k8u6a6-0';
    await page.waitForSelector(locInput, { visible: true, timeout: 15_000 });
    await page.type(locInput, pincode, { delay: 60 });

    const firstSuggestion = 'div.LocationSearchList__LocationListContainer-sc-93rfr7-0';
    await page.waitForSelector(firstSuggestion, { visible: true, timeout: 10_000 });
    await page.$eval(firstSuggestion, el => el.click());
    console.log('➡️  First address selected');

    await delay(3_000);                            

    //search query
    const searchURL = `https://www.blinkit.com/s/?q=${encodeURIComponent(query)}`;
    await page.goto(searchURL, { waitUntil: 'networkidle2' });

    const tileSel = 'div[role="button"][id]';
    await page.waitForSelector(tileSel, { timeout: 30_000 });


    //get pdt except for ads
    const products = await page.evaluate(sel => {
      const tiles = Array.from(document.querySelectorAll(sel));

      const firstRupee = nodes => {
        for (const el of nodes) {
          if (el.innerText && el.innerText.includes('₹')) return el.innerText.trim();
        }
        return '';
      };

      return tiles
        .map(tile => {
          const name = (
            tile.querySelector('div.tw-text-300.tw-font-semibold') ??
            tile.querySelector('[data-testid="product-title"]')
          )?.innerText.trim() || '';

          const quantity =
            tile.querySelector('div.tw-text-200.tw-font-medium')?.innerText.trim() || '';

          const price = firstRupee(tile.querySelectorAll('div, span, p'));

          let originalPrice = '';
          const strike =
            tile.querySelector('del, s, strike, span.line-through, div.line-through');
          if (strike && strike.innerText.includes('₹')) originalPrice = strike.innerText.trim();

          const link =
            tile.tagName.toLowerCase() === 'a'
              ? tile.href
              : tile.querySelector('a')?.href || '';

          return { name, quantity, price, originalPrice, link };
        })
        .filter(p => p.name && p.price);
    }, tileSel);

    const topPdt = products.slice(0, 10);

    console.log(`Scraped ${topPdt.length} products`);
    await browser.close();
    return topPdt;
  } catch (err) {
    console.error('Blinkit scrape error:', err.message);
    await browser.close();
    throw err;
  }
}

module.exports = scrapeBlinkit;