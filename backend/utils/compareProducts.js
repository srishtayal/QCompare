const Fuse = require('fuse.js');

function normalize(text) {
  return (text || '')
    .toLowerCase()
    .replace(/[^\x00-\x7F]/g, ' ')   // Remove non-ASCII
    .replace(/[^\w\s]/g, ' ')        // Remove punctuation
    .replace(/\s+/g, ' ')
    .trim();
}

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

  const options = {
    keys: ['name'],
    threshold: 0.33,         
    minMatchCharLength: 2,
    includeScore: true
  };

  const fuseZepto = new Fuse(zepto, options);
  const fuseSwiggy = new Fuse(swiggy, options);

  const rows = blinkit.map(b => {
    const bName = normalize(b.name);

    const zMatch = fuseZepto.search(bName).find(r => r.score <= 0.45);
    const sMatch = fuseSwiggy.search(bName).find(r => r.score <= 0.45);

    const zProd = zMatch?.item;
    const sProd = sMatch?.item;

    if (zProd) matchedZ.add(zMatch.refIndex);
    if (sProd) matchedS.add(sMatch.refIndex);

    const photo =
      (sProd && (sProd.productImg || sProd.image)) ||
      b.image || b.productImg ||
      (zProd && zProd.image) ||
      '';

    return {
      name: b.name,
      blinkitQuantity: b.quantity,
      zeptoQuantity: zProd?.quantity || null,
      swiggyQuantity: sProd?.quantity || null,
      photo,
      blinkit: pickFields(b),
      zepto: zProd ? pickFields(zProd) : null,
      swiggy: sProd ? pickFields(sProd, true) : null
    };
  });

  const extraZ = zepto
    .filter((_, i) => !matchedZ.has(i))
    .map(z => ({
      name: z.name,
      blinkitQuantity: null,
      zeptoQuantity: z.quantity,
      swiggyQuantity: null,
      photo: z.image || '',
      blinkit: null,
      zepto: pickFields(z),
      swiggy: null
    }));

  const extraS = swiggy
    .filter((_, i) => !matchedS.has(i))
    .map(s => ({
      name: s.name,
      blinkitQuantity: null,
      zeptoQuantity: null,
      swiggyQuantity: s.quantity,
      photo: s.productImg || s.image || '',
      blinkit: null,
      zepto: null,
      swiggy: pickFields(s, true)
    }));

  return [...rows, ...extraZ, ...extraS];
}

module.exports = matchProducts;
