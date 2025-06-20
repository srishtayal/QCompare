const puppeteer = require("puppeteer");

const delay = ms => new Promise(r => setTimeout(r, ms));

async function fetchZeptoPrices(query, pincode = "110078") {
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--window-size=1280,800"
    ],
    defaultViewport: { width: 1280, height: 800 }
  });

  const page = await browser.newPage();
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
  );

  try {
    // Step 1: Load homepage
    await page.goto("https://www.zeptonow.com/", { waitUntil: "domcontentloaded" });

    // Step 2: Click 'Select Location'
    await page.waitForSelector('button[aria-label="Select Location"]', { timeout: 15000 });
    await page.click('button[aria-label="Select Location"]');

    // Step 3: Type in pincode
    const locInput = 'input[type="text"]';
    await page.waitForSelector(locInput, { visible: true });
    await page.click(locInput, { clickCount: 3 });
    await page.type(locInput, `${pincode}`, { delay: 70 });

    // Step 4: Select address suggestion
    const suggestion = '[data-testid="address-search-item"]';
    await page.waitForSelector(suggestion, { visible: true, timeout: 10000 });
    await page.click(suggestion);

    // Step 5: Confirm location
    const confirmBtn = '[data-testid="location-confirm-btn"]';
    await page.waitForSelector(confirmBtn, { visible: true, timeout: 10000 });
    await page.click(confirmBtn);

    // Step 6: Wait for location update
    await page.waitForNavigation({ waitUntil: "networkidle0" });

    // Step 7: Click search bar
    await page.waitForSelector('a[aria-label="Search for products"]', { visible: true });
    await page.click('a[aria-label="Search for products"]');

    // Step 8: Type the query
    const searchInput = 'input[placeholder*="Search"]';
    await page.waitForSelector(searchInput, { visible: true, timeout: 15000 });
    await page.type(searchInput, query, { delay: 60 });
    await page.keyboard.press("Enter");

    // Step 9: Wait for search response
    await page.waitForResponse(
      r => r.url().includes("/api/") && r.url().includes("/search") && r.status() === 200,
      { timeout: 30000 }
    );

    // Step 10: Wait for product cards
    const productCard = "[data-testid='product-card']";
    await page.waitForSelector(productCard, { timeout: 30000 });

    // Step 11: Extract products
    const products = await page.$$eval('[data-testid="product-card"]', cards => {
      const clean = s =>
        (s || '')
          .replace(/[\u200B-\u200D\u00A0]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();

      const firstRs = s => {
        const m = (s || '').match(/₹\s?\d[\d,.]*/);
        return m ? m[0] : '';
      };

      return cards.map(card => {
        const name = clean(card.querySelector('[data-testid="product-card-name"]')?.textContent);

        const quantity = clean(
          card.querySelector('div.mb-1 > p.text-base')?.textContent || ''
        );

        const price = firstRs(
          card.querySelector('p.text-\\[20px\\]')?.textContent ||
          card.querySelector('[data-testid="product-card-price"]')?.textContent ||
          card.innerText
        );

        const originalPrice = firstRs(
          card.querySelector('p.line-through')?.textContent || ''
        );

        const deliveryTime = clean(
          card.querySelector('p.block.font-body')?.textContent ||
          (card.innerText.match(/\d+\s*Mins/i) || [''])[0]
        );

        const imgTag = card.querySelector('img[data-testid="product-card-image"], img');
        const image = imgTag?.currentSrc || imgTag?.src || '';

        const href = card.getAttribute('href') || '';
        const link = href.startsWith('http') ? href : `https://www.zeptonow.com${href}`;

        const outOfStock = /out of stock/i.test(card.innerText);

        return {
          name,
          quantity,
          price,
          originalPrice,
          deliveryTime,
          image,
          link,
          outOfStock
        };
      }).filter(p => p.name && p.price);
    });

    return products;
  } catch (err) {
    console.error("Zepto scrape error:", err.message);
    return [];
  } finally {
    await browser.close();
  }
}

module.exports = fetchZeptoPrices;
