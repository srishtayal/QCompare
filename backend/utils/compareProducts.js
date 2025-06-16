const stringSimilarity = require('string-similarity');              

function normalize(text) {
  return text.toLowerCase()                                         // case-fold[1]
             .replace(/[^\w\s]/gi, '')                              // strip punctuation[1]
             .replace(/\s+/g, ' ')                                  // collapse spaces[2]
             .trim();                                               // final tidy[1]
}

function matchProducts(blinkit, zepto) {
  const matchedZeptoIndices = new Set();                           

  const comparisons = blinkit.map(b => {
    const matches = zepto
      .map((z, index) => ({
        ...z,
        similarity: stringSimilarity.compareTwoStrings(             
          normalize(b.name),
          normalize(z.name)
        ),
        index
      }))
      .filter(z => z.similarity > 0.65)                             
      .sort((a, b) => b.similarity - a.similarity);                

    const bestMatch = matches[0];
    if (bestMatch) matchedZeptoIndices.add(bestMatch.index);       

    return {
      name:     b.name,
      quantity: b.quantity,
      blinkit: {
        price:        b.price,
        link:         b.link,
        deliveryTime: b.deliveryTime,
        outOfStock:   b.outOfStock                                
      },
      zepto: bestMatch
        ? {
            price:        bestMatch.price,
            link:         bestMatch.link || '',
            deliveryTime: bestMatch.deliveryTime,
            outOfStock:   bestMatch.outOfStock
          }
        : null
    };
  });

  const unmatchedZepto = zepto
    .map((z, index) => ({ ...z, index }))
    .filter(z => !matchedZeptoIndices.has(z.index))
    .map(z => ({
      name:     z.name,
      quantity: z.quantity,
      blinkit:  null,
      zepto: {
        price:        z.price,
        link:         z.link || '',
        deliveryTime: z.deliveryTime,
        outOfStock:   z.outOfStock                                
      }
    }));

  return [...comparisons, ...unmatchedZepto];                    
}

module.exports = matchProducts;                                 
