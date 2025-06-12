const scrapeBlinkit = require('../scrapers/blinkit');
const fetchZeptoPrices = require('../scrapers/zepto');
// swiggy - to be added

async function comparePrices(query, pincode = '110078') {
    const [blinkit, zepto] = await Promise.all([
        scrapeBlinkit(query, pincode),
        fetchZeptoPrices(query, pincode)
    ]);

    return { blinkit, zepto };
}

module.exports = comparePrices;