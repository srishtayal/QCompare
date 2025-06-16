const stringSimilarity = require('string-similarity');              // npm package[2]

function normalize(text) {
  return text.toLowerCase()                                         // case-fold[1]
             .replace(/[^\w\s]/gi, '')                              // strip punctuation[1]
             .replace(/\s+/g, ' ')                                  // collapse spaces[2]
             .trim();                                               // final tidy[1]
}

/**
 * Merge two product arrays and propagate the out-of-stock flag.
 *
 * @param {Array} blinkit – products from Blinkit, each with `outOfStock`
 * @param {Array} zepto   – products from Zepto,   each with `outOfStock`
 * @returns {Array}       – unified list ready for the UI
 */
function matchProducts(blinkit, zepto) {
  const matchedZeptoIndices = new Set();                            // track hits[1]

  /* ---------- Blinkit-anchored matching ---------- */             // same logic[2]
  const comparisons = blinkit.map(b => {
    const matches = zepto
      .map((z, index) => ({
        ...z,
        similarity: stringSimilarity.compareTwoStrings(             // score[2]
          normalize(b.name),
          normalize(z.name)
        ),
        index
      }))
      .filter(z => z.similarity > 0.65)                             // threshold[1]
      .sort((a, b) => b.similarity - a.similarity);                 // best first[1]

    const bestMatch = matches[0];
    if (bestMatch) matchedZeptoIndices.add(bestMatch.index);        // remember[2]

    return {
      name:     b.name,
      quantity: b.quantity,
      blinkit: {
        price:        b.price,
        link:         b.link,
        deliveryTime: b.deliveryTime,
        outOfStock:   b.outOfStock                                  // NEW[1]
      },
      zepto: bestMatch
        ? {
            price:        bestMatch.price,
            link:         bestMatch.link || '',
            deliveryTime: bestMatch.deliveryTime,
            outOfStock:   bestMatch.outOfStock                      // NEW[2]
          }
        : null
    };
  });

  /* ---------- add unmatched Zepto items ---------- */             // unchanged[1]
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
        outOfStock:   z.outOfStock                                  // NEW[2]
      }
    }));

  return [...comparisons, ...unmatchedZepto];                       // final merge[1]
}

module.exports = matchProducts;                                     // CommonJS export[1]
