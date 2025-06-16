const puppeteer = require("puppeteer");

const delay = ms => new Promise(r => setTimeout(r, ms));

async function fetchZeptoPrices(query, pincode = "110078") {
  const browser = await puppeteer.launch({
    headless: false,
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
    await page.goto("https://www.zeptonow.com/", { waitUntil: "domcontentloaded" });

    await page.waitForSelector('button[aria-label="Select Location"]', { timeout: 15000 });
    await page.click('button[aria-label="Select Location"]');

    const locInput = 'input[type="text"]';
    await page.waitForSelector(locInput, { visible: true });
    await page.click(locInput, { clickCount: 3 });
    await page.type(locInput, `${pincode}`, { delay: 70 });

    const suggestion = '[data-testid="address-search-item"]';
    await page.waitForSelector(suggestion, { visible: true, timeout: 10000 });
    await page.$eval(suggestion, el => el.click());

    await page.waitForSelector('[data-testid="location-confirm-btn"]', { visible: true, timeout: 10000 });
    await page.click('[data-testid="location-confirm-btn"]');

    await page.waitForNavigation({ waitUntil: "networkidle0" });

    await page.click('a[aria-label="Search for products"]');

    const searchInput = 'input[placeholder*="Search"]';
    await page.waitForSelector(searchInput, { visible: true, timeout: 15000 });
    await page.type(searchInput, query, { delay: 60 });
    await page.keyboard.press("Enter");

    await page.waitForResponse(
      r => r.url().includes("/api/") && r.url().includes("/search") && r.status() === 200,
      { timeout: 30000 }
    );

    const productCard = "[data-testid='product-card']";
    await page.waitForSelector(productCard, { timeout: 30000 });

    // const products = await page.$$eval("[data-testid='product-card']", cards => {
    //   return cards.map(card => {
    //     const getText = (selector) => card.querySelector(selector)?.innerText.trim() || "";
    //     const getPrice = (selector) => card.querySelector(selector)?.innerText.match(/₹\d+/)?.[0] || "";

    //     return {
    //       name: getText("[data-testid='product-card-name']"),
    //       quantity: getText("[data-testid='product-card-quantity']"),
    //       price: getPrice("[data-testid='product-card-price']"),
    //       originalPrice: getPrice("p.line-through"),
    //       deliveryTime: getText("span.font-extrabold").replace(/\s+/g, " "),
    //     };
    //   });
    // });

    const products = await page.$$eval("[data-testid='product-card']", cards => {
      return cards.map(card => {
        const getText = (selector) => card.querySelector(selector)?.innerText.trim() || "";
        const getPrice = (selector) => card.querySelector(selector)?.innerText.match(/₹\d+/)?.[0] || "";
        const getImage = () => card.querySelector("img")?.src || "";

        return {
          name: getText("[data-testid='product-card-name']"),
          quantity: getText("[data-testid='product-card-quantity']"),
          price: getPrice("[data-testid='product-card-price']"),
          originalPrice: getPrice("p.line-through"),
          deliveryTime: getText("span.font-extrabold").replace(/\s+/g, " "),
          image: getImage()
        };
      });
    });


    return products.filter(p => p.name && p.price).slice(0, 10);
  } catch (err) {
    console.error("Zepto scrape error:", err.message);
    return [];
  } finally {
    await browser.close();
  }
}

module.exports = fetchZeptoPrices;
