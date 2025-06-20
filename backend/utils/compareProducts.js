const stringSimilarity = require('string-similarity');

const SIM_THRESHOLD = 0.65;

const normalize = t => t
  .toLowerCase()
  .replace(/[^\x00-\x7F]/g, ' ')   // strip non-ASCII
  .replace(/[^\w\s]/g, ' ')        // strip punctuation
  .replace(/\s+/g, ' ')
  .trim();

function pickFields(obj, isSwiggy = false) {
  return {
    price:        obj.price,
    link:         obj.link || '',
    deliveryTime: isSwiggy ? obj.delivery : obj.deliveryTime,
    outOfStock:   obj.outOfStock ?? obj.availability === 'Sold Out',
    photo:        isSwiggy ? obj.productImg :
                  obj.image       || obj.productImg || ''
  };
}

function matchProducts(blinkit = [], zepto = [], swiggy = []) {
  const matchedZ = new Set();
  const matchedS = new Set();

  /* ---------- Blinkit-anchored merge ---------- */
  const rows = blinkit.map(b => {
    /* best Zepto */
    const zHit = zepto
      .map((z, i) => ({
        idx: i,
        prod: z,
        sim: stringSimilarity.compareTwoStrings(normalize(b.name), normalize(z.name))
      }))
      .filter(o => o.sim > SIM_THRESHOLD)
      .sort((a, b) => b.sim - a.sim)[0];

    if (zHit) matchedZ.add(zHit.idx);

    /* best Swiggy */
    const sHit = swiggy
      .map((s, i) => ({
        idx: i,
        prod: s,
        sim: stringSimilarity.compareTwoStrings(normalize(b.name), normalize(s.name))
      }))
      .filter(o => o.sim > SIM_THRESHOLD)
      .sort((a, b) => b.sim - a.sim)[0];

    if (sHit) matchedS.add(sHit.idx);

    /* photo priority: Swiggy > Blinkit > Zepto */
    const photo =
      (sHit && (sHit.prod.productImg || sHit.prod.image)) ||
      b.image  || b.productImg ||
      (zHit && zHit.prod.image) ||
      '';

    return {
      name:     b.name,
      quantity: b.quantity,
      photo,                              
      blinkit:  pickFields(b),
      zepto:    zHit ? pickFields(zHit.prod) : null,
      swiggy:   sHit ? pickFields(sHit.prod, true) : null
    };
  });

  /* ---------- unmatched Zepto ---------- */
  const extraZ = zepto
    .filter((_, i) => !matchedZ.has(i))
    .map(z => ({
      name:     z.name,
      quantity: z.quantity,
      photo:    z.image || '',
      blinkit:  null,
      zepto:    pickFields(z),
      swiggy:   null
    }));

  /* ---------- unmatched Swiggy ---------- */
  const extraS = swiggy
    .filter((_, i) => !matchedS.has(i))
    .map(s => ({
      name:     s.name,
      quantity: s.quantity,
      photo:    s.productImg || s.image || '',
      blinkit:  null,
      zepto:    null,
      swiggy:   pickFields(s, true)
    }));

  return [...rows, ...extraZ, ...extraS];
}

module.exports = matchProducts;
