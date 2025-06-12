const stringSimilarity = require('string-similarity');

function normalize(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') 
        .replace(/\s+/g, ' ') 
        .trim();
}

function matchProducts(blinkit, zepto) {
    const results = [];

    for (const b of blinkit) {
        const bName = normalize(b.name);
        const match = zepto
            .map(z => ({
                ...z,
                similarity: stringSimilarity.compareTwoStrings(bName, normalize(z.name))
            }))
            .filter(z => z.similarity > 0.65)
            .sort((a, b) => b.similarity - a.similarity)[0];
        
        results.push({
            name: b.name,
            quantity: b.quantity,
            blinkit: {
                price: b.price,
                link: b.link,
                deliveryTime: b.deliveryTime
            },
            zepto: match
                ? {
                    price: match.price,
                    link: match.link || '',
                    deliveryTime: match.deliveryTime
                }
                : null
        });
    }
    return results;
}

module.exports = matchProducts;