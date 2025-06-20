const scrapeBlinkit = require('../scrapers/blinkit');
const fetchZeptoPrices = require('../scrapers/zepto');
const swiggyScrape= require('../scrapers/instamart');

async function comparePrices(query, pincode = '110078') {
    const [blinkit, zepto, swiggy] = await Promise.all([
        scrapeBlinkit(query, pincode),
        fetchZeptoPrices(query, pincode),
        swiggyScrape(query, pincode)
    ]);

    return { blinkit, zepto, swiggy };
}

module.exports = comparePrices;