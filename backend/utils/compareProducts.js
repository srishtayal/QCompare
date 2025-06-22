function normalize(text = '') {
  return text
    .toLowerCase()
    .replace(/[^\x00-\x7F]/g, ' ')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\bml\b/g, ' ml')
    .replace(/\bl\b/g, ' l')
    .replace(/\bkg\b/g, ' kg')
    .replace(/\bg\b/g, ' g')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text) {
  return new Set(normalize(text).split(' '));
}

function scoreTokens(tokensA, tokensB) {
  const intersection = [...tokensA].filter(t => tokensB.has(t)).length;
  const union = new Set([...tokensA, ...tokensB]).size;
  return intersection / union; // Jaccard similarity
}

function pickFields(obj, isSwiggy = false) {
  return {
    price: obj.price,
    link: obj.link || '',
    deliveryTime: isSwiggy ? obj.deliveryTime : obj.deliveryTime,
    outOfStock: obj.outOfStock ?? obj.availability === 'Sold Out',
    photo: isSwiggy ? obj.productImg : obj.image || obj.productImg || ''
  };
}

function matchOneToOneCustom(blinkit, targetList, isSwiggy = false) {
  const used = new Set();
  return blinkit.map(b => {
    const bTokens = tokenize(b.name);
    let bestScore = 0;
    let bestMatch = null;
    let bestIndex = -1;

    targetList.forEach((t, idx) => {
      if (used.has(idx)) return;
      const tTokens = tokenize(t.name);
      const score = scoreTokens(bTokens, tTokens);
      if (score > bestScore) {
        bestScore = score;
        bestMatch = t;
        bestIndex = idx;
      }
    });

    if (bestScore >= 0.7 && bestMatch) {
      used.add(bestIndex);
      return bestMatch;
    }

    return null;
  });
}

function shufflePlatformPickOrder(arrays) {
  const sources = Object.keys(arrays);
  const sourcePool = [];

  const maxLength = Math.max(
    ...sources.map(source => arrays[source].length)
  );

  for (let i = 0; i < maxLength; i++) {
    const available = sources.filter(source => arrays[source][i]);
    while (available.length) {
      const randomIndex = Math.floor(Math.random() * available.length);
      const source = available.splice(randomIndex, 1)[0];
      sourcePool.push(arrays[source][i]);
    }
  }

  return sourcePool;
}

function matchProducts(blinkit = [], zepto = [], swiggy = []) {
  const zMatches = matchOneToOneCustom(blinkit, zepto);
  const sMatches = matchOneToOneCustom(blinkit, swiggy, true);

  const matchedZ = new Set(zMatches.map(z => zepto.indexOf(z)).filter(i => i >= 0));
  const matchedS = new Set(sMatches.map(s => swiggy.indexOf(s)).filter(i => i >= 0));

  const rows = blinkit.map((b, i) => {
    const z = zMatches[i];
    const s = sMatches[i];

    return {
      name: b.name,
      blinkitQuantity: b.quantity,
      zeptoQuantity: z?.quantity || null,
      swiggyQuantity: s?.quantity || null,
      photo: s?.productImg || b.image || z?.image || '',
      blinkit: pickFields(b),
      zepto: z ? pickFields(z) : null,
      swiggy: s ? pickFields(s, true) : null
    };
  });

  const matchedRows = rows.filter(r => {
    const count = [r.blinkit, r.zepto, r.swiggy].filter(Boolean).length;
    return count >= 2;
  });

  const unmatchedBlinkitOnly = rows.filter(r =>
    r.blinkit && !r.zepto && !r.swiggy
  );

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

  // Respect individual source order, only shuffle pick order
  const mixedExtras = shufflePlatformPickOrder({
    blinkit: unmatchedBlinkitOnly,
    zepto: extraZ,
    swiggy: extraS
  });

  return [...matchedRows, ...mixedExtras];
}

module.exports = matchProducts;