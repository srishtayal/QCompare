const stringSimilarity = require('string-similarity');

const SIM_THRESHOLD = 0.65;          
const normalize = txt =>
  txt
    .toLowerCase()                   // case-fold
    .replace(/[^\x00-\x7F]/g, ' ')   // drop non-ASCII (em-dashes, etc.)
    .replace(/[^\w\s]/g, ' ')        // drop punctuation
    .replace(/\s+/g, ' ')            // collapse spaces
    .trim();

/* ----------------------------------------------------------- main */
function matchProducts(blinkit = [], zepto = [], swiggy = []) {
  const matchedZ = new Set();
  const matchedS = new Set();

  /* ---------- Blinkit-anchored pass ---------- */
  const comparisons = blinkit.map(b => {
    /* ---- find Zepto best match ---- */
    const zHit = zepto
      .map((z, idx) => ({
        idx,
        prod: z,
        sim: stringSimilarity.compareTwoStrings(normalize(b.name), normalize(z.name))
      }))
      .filter(o => o.sim > SIM_THRESHOLD)
      .sort((a, b) => b.sim - a.sim)[0];             // best only

    if (zHit) matchedZ.add(zHit.idx);

    /* ---- find Swiggy best match ---- */
    const sHit = swiggy
      .map((s, idx) => ({
        idx,
        prod: s,
        sim: stringSimilarity.compareTwoStrings(normalize(b.name), normalize(s.name))
      }))
      .filter(o => o.sim > SIM_THRESHOLD)
      .sort((a, b) => b.sim - a.sim)[0];

    if (sHit) matchedS.add(sHit.idx);

    return {
      name:     b.name,
      quantity: b.quantity,
      blinkit:  pickFields(b),
      zepto:    zHit ? pickFields(zHit.prod) : null,
      swiggy:   sHit ? pickFields(sHit.prod, /*isSwiggy*/ true) : null
    };
  });

  /* ---------- append unmatched Zepto ---------- */
  const extraZ = zepto
    .filter((_, idx) => !matchedZ.has(idx))
    .map(z => ({
      name: z.name,
      quantity: z.quantity,
      blinkit: null,
      zepto:   pickFields(z),
      swiggy:  null
    }));

  /* ---------- append unmatched Swiggy ---------- */
  const extraS = swiggy
    .filter((_, idx) => !matchedS.has(idx))
    .map(s => ({
      name: s.name,
      quantity: s.quantity,
      blinkit: null,
      zepto:   null,
      swiggy:  pickFields(s, true)
    }));

  return [...comparisons, ...extraZ, ...extraS];
}

/* helper to extract the common payload shape */
function pickFields(obj, isSwiggy = false) {
  return {
    price:        obj.price,
    link:         obj.link || '',
    deliveryTime: isSwiggy ? obj.delivery : obj.deliveryTime,
    outOfStock:   obj.outOfStock ?? obj.availability === 'Sold Out'
  };
}

module.exports = matchProducts;
