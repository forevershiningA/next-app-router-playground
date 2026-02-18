#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const VERSION = '2026.01';

const femaleNames = JSON.parse(fs.readFileSync(path.join(ROOT, 'public', 'json', 'firstnames_f_small.json'), 'utf8'));
const maleNames = JSON.parse(fs.readFileSync(path.join(ROOT, 'public', 'json', 'firstnames_m_small.json'), 'utf8'));
const surnameList = JSON.parse(fs.readFileSync(path.join(ROOT, 'public', 'json', 'surnames_small.json'), 'utf8'));

const nameDb = {
  firstNames: new Set([...femaleNames, ...maleNames].map((n) => n.toUpperCase())),
  surnames: new Set(surnameList.map((n) => n.toUpperCase())),
  femaleNames,
  maleNames,
  firstNamesArray: [...femaleNames, ...maleNames],
  surnamesArray: surnameList,
};

const metadataById = {
  '1725769905504': {
    slug: 'curved-gable-may-heavens-eternal-happiness-be-thine',
    productId: '124',
    productName: 'Traditional Engraved Headstone',
    productType: 'headstone',
    productSlug: 'traditional-headstone',
    category: 'biblical-memorial',
    title: 'Biblical Memorial',
    mlDir: 'headstonesdesigner',
    preview: '/ml/headstonesdesigner/saved-designs/screenshots/2024/09/1725769905504.jpg',
  },
};

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function getGenderFromCategory(category) {
  const lower = (category || '').toLowerCase();
  if (/(mother|daughter|wife|sister|grandmother|nanna|grandma|aunt|woman|lady|girl)/.test(lower)) {
    return 'female';
  }
  if (/(father|son|husband|brother|grandfather|papa|grandpa|uncle|man|gentleman|boy|dad)/.test(lower)) {
    return 'male';
  }
  return 'neutral';
}

function getRandomName(seed, category) {
  if (!nameDb.firstNamesArray.length || !nameDb.surnamesArray.length) {
    return 'Name Surname';
  }
  const gender = getGenderFromCategory(category);
  let pool = nameDb.firstNamesArray;
  if (gender === 'female' && nameDb.femaleNames.length) {
    pool = nameDb.femaleNames;
  } else if (gender === 'male' && nameDb.maleNames.length) {
    pool = nameDb.maleNames;
  }
  const seedVal = seed ? hashString(seed) : Math.floor(Math.random() * 10000);
  const first = pool[seedVal % pool.length];
  const surname = nameDb.surnamesArray[(seedVal + 1) % nameDb.surnamesArray.length];
  return `${first} ${surname}`;
}

function getRandomSurname(seed) {
  if (!nameDb.surnamesArray.length) return 'Surname';
  const seedVal = seed ? hashString(seed) : Math.floor(Math.random() * 10000);
  return nameDb.surnamesArray[seedVal % nameDb.surnamesArray.length];
}

function getRandomFirstName(seed, category) {
  if (!nameDb.firstNamesArray.length) return 'Name';
  const gender = getGenderFromCategory(category);
  let pool = nameDb.firstNamesArray;
  if (gender === 'female' && nameDb.femaleNames.length) {
    pool = nameDb.femaleNames;
  } else if (gender === 'male' && nameDb.maleNames.length) {
    pool = nameDb.maleNames;
  }
  const seedVal = seed ? hashString(seed) : Math.floor(Math.random() * 10000);
  return pool[seedVal % pool.length];
}

function sanitizeInscription(text, category) {
  if (!text) return text;
  const commonPhrases = [
    'IN LOVING MEMORY', 'OF', 'LOVING', 'SON', 'DAUGHTER', 'BROTHER', 'SISTER', 'MOTHER', 'FATHER',
    'WIFE', 'HUSBAND', 'FOREVER', 'REST IN PEACE', 'RIP', 'R.I.P', 'R.I.P.', 'BELOVED', 'CHERISHED',
    'ALWAYS', 'REMEMBERED',
  ];
  const memorialPhrases = [
    'WILL ALWAYS BE IN OUR HEARTS', 'FOREVER IN OUR HEARTS', 'ALWAYS IN OUR HEARTS', 'IN OUR HEARTS FOREVER',
    'GONE BUT NOT FORGOTTEN', 'FOREVER LOVED', 'ALWAYS LOVED', 'DEARLY LOVED', 'FOREVER MISSED',
    'DEEPLY MISSED', 'GREATLY MISSED', 'YOUR LIFE WAS A BLESSING', 'YOUR MEMORY A TREASURE',
    'SHE MADE BROKEN LOOK BEAUTIFUL', 'UNIVERSE ON HER SHOULDERS', 'BELOVED MOTHER', 'BELOVED FATHER',
    'BELOVED GRANDMOTHER', 'BELOVED GRANDFATHER', 'BELOVED WIFE', 'BELOVED HUSBAND', 'LOVING MOTHER',
    'LOVING FATHER', 'DEVOTED MOTHER', 'DEVOTED FATHER', 'A LIFE LIVED WITH PASSION',
    'A LOVE THAT NEVER FADED', 'A LIFE LIVED WITH PASSION, A LOVE THAT NEVER FADED',
  ];

  const upper = text.toUpperCase().trim();
  const upperNoPunc = upper.replace(/[.,!?;:'"]/g, '');
  if (memorialPhrases.some((phrase) => upper === phrase || upper.includes(phrase))) return text;
  if (commonPhrases.includes(upper) || commonPhrases.includes(upperNoPunc)) return text;
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith('\'') && text.endsWith('\'')) || text.includes('"FOREVER') || text.includes('"#')) {
    return text;
  }

  const relationshipWords = /(beloved|loving|cherished|dear|dearest|devoted|precious|adored|treasured|father|mother|son|daughter|brother|sister|grandfather|grandmother|uncle|aunt|wife|husband|grandson|granddaughter|great-grandfather|great-grandmother|friend)/i;
  if (relationshipWords.test(text.toLowerCase()) && /\b(to|of)\s*$/i.test(text)) {
    return text;
  }

  const hasDatePattern = /(\d{1,2}[,\/\-\s]+\d{1,4})|(?:JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)|\d{4}\s*-\s*\d{4}|\d{2}\/\d{2}\/\d{4}/i.test(text);
  if (hasDatePattern) {
    const stripped = text
      .replace(/\d{4}\s*-\s*\d{4}/g, '')
      .replace(/\d{1,2}[,\/\-\s]+\d{1,4}/g, '')
      .replace(/\d{2}\/\d{2}\/\d{4}/g, '')
      .replace(/(JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!stripped || stripped === '-') {
      return text;
    }
  }

  const words = text.split(/\s+/).filter(Boolean);
  const upperWords = words.map((w) => w.toUpperCase().replace(/['".,!?]/g, ''));
  const hasFirstName = upperWords.some((w) => nameDb.firstNames.has(w));
  const hasSurname = upperWords.some((w) => nameDb.surnames.has(w));

  if (nameDb && words.length >= 1) {
    if (hasFirstName && words.length === 1 && !hasDatePattern) {
      const replacement = getRandomFirstName(text, category);
      return text === text.toUpperCase() ? replacement.toUpperCase() : replacement;
    }

    if (hasSurname && !hasFirstName && words.length === 1 && !hasDatePattern) {
      const replacement = getRandomSurname(text);
      return text === text.toUpperCase() ? replacement.toUpperCase() : replacement;
    }

    const sentenceRegex = /(the|you|me|my|your|when|feel|know|am|are|is|see|being|part|of|and|or|not|lost|may|be|thine|thy|thee|heaven|eternal|happiness|shall|will|has|had|was|were|would|could|should|our|their|us|we)/i;
    const looksLikeSentence = sentenceRegex.test(text);

    if ((hasFirstName && hasSurname) || (hasFirstName && words.length >= 2)) {
      if (!looksLikeSentence) {
        if (hasDatePattern) {
          const replacementName = getRandomName(text, category);
          const finalName = text === text.toUpperCase() ? replacementName.toUpperCase() : replacementName;
          const dateMatch = text.match(/(\d{4}\s*-\s*\d{4}|\d{1,2}[,\/\-\s]+\d{1,4}|\d{2}\/\d{2}\/\d{4})/);
          if (dateMatch) {
            const suffix = text.substring(text.indexOf(dateMatch[0]));
            return `${finalName} ${suffix}`.trim();
          }
          return finalName;
        }
        const replacementName = getRandomName(text, category);
        return text === text.toUpperCase() ? replacementName.toUpperCase() : replacementName;
      }
    }
  }

  const titleCase = words.length >= 2 && words.every((word) => /^[A-Z][a-z]+$/.test(word)) && !['The', 'When', 'You', 'Feel', 'Know', 'See', 'Being', 'Part', 'And', 'Or', 'Am', 'Are', 'Is', 'Not', 'Lost'].some((stop) => words.includes(stop));
  if (titleCase) {
    return getRandomName(text, category);
  }

  const hasLowerCase = /[a-z]/.test(text);
  const shortPhrase = words.length <= 8;
  const sentenceWords = /(the|you|me|my|your|when|feel|know|am|are|is|see|being|part|of|and|or|not|lost)/i.test(text);
  if (hasLowerCase && shortPhrase && sentenceWords) {
    return text;
  }

  const allCaps = /^[A-Z\s'-]+$/.test(text) && words.length >= 2;
  const singleAllCaps = /^[A-Z'-]+$/.test(text) && words.length === 1;
  if (singleAllCaps && !sentenceWords) {
    const upperWord = text.toUpperCase().replace(/['".,!?]/g, '');
    const isFirst = nameDb.firstNames.has(upperWord);
    if (isFirst && !nameDb.surnames.has(upperWord)) {
      return getRandomFirstName(text, category).toUpperCase();
    }
    return getRandomSurname(text).toUpperCase();
  }

  if (allCaps && !sentenceWords) {
    return getRandomName(text, category).toUpperCase();
  }

  return text;
}

function parseViewport(headstone) {
  const nav = headstone.navigator || '';
  const match = nav.match(/(\d+)x(\d+)/);
  if (match) {
    return { width: parseInt(match[1], 10), height: parseInt(match[2], 10) };
  }
  return {
    width: headstone.init_width || headstone.width || 800,
    height: headstone.init_height || headstone.height || 600,
  };
}

const MATERIAL_TEXTURES = {
  'blue-pearl': '/textures/forever/l/Blue-Pearl.webp',
  'blue pearl': '/textures/forever/l/Blue-Pearl.webp',
  'glory-black': '/textures/forever/l/Glory-Black-2.webp',
  'glory black': '/textures/forever/l/Glory-Black-2.webp',
  'glory-gold-spots': '/textures/forever/l/Glory-Gold-Spots.webp',
  'african-black': '/textures/forever/l/African-Black.webp',
  'noble-black': '/textures/forever/l/Noble-Black.webp',
  g654: '/textures/forever/l/01.webp',
};

function mapTexture(texturePath, productId) {
  if (!texturePath) return '';
  const lower = texturePath.toLowerCase();
  if (productId === '5' && texturePath.includes('phoenix')) {
    const match = texturePath.match(/phoenix[\\/](l|s)[\\/](\d+)\.(jpg|webp)$/i);
    if (match) return `/textures/phoenix/${match[1]}/${match[2]}.webp`;
  }
  if (lower.includes('18.jpg') || lower.includes('19.jpg') || lower.includes('glory-black')) {
    return MATERIAL_TEXTURES['glory-black'];
  }
  if (lower.includes('blue-pearl') || lower.includes('bluepearl')) {
    return MATERIAL_TEXTURES['blue-pearl'];
  }
  for (const [key, value] of Object.entries(MATERIAL_TEXTURES)) {
    if (lower.includes(key)) return value;
  }
  if (texturePath.startsWith('/textures/')) {
    return texturePath.replace(/\.jpg$/i, '.webp');
  }
  const match = texturePath.match(/[\\/]([A-Za-z0-9-]+)\.(jpg|webp)$/i);
  if (match) {
    return `/textures/forever/l/${match[1]}.webp`;
  }
  return texturePath;
}

function round(value) {
  return Math.round(value * 1000) / 1000;
}

function buildInscription(item, _pxPerMmX, _pxPerMmY, category) {
  const xPx = round(item.x || 0);
  const yPx = round(item.y || 0);
  let fontPx = null;
  if (typeof item.font === 'string') {
    const match = item.font.match(/([\d.]+)px/);
    if (match) fontPx = parseFloat(match[1]);
  }
  if (!fontPx && item.font_size) {
    fontPx = Number(item.font_size);
  }
  const fontFamily = item.font_family || (typeof item.font === 'string' ? item.font.split(' ').slice(1).join(' ') : 'Arial');
  const sanitized = sanitizeInscription(item.label || '', category);
  return {
    id: `insc-${item.itemID || item.id || Math.random().toString(36).slice(2, 8)}`,
    text: sanitized,
    font: {
      family: fontFamily.trim() || 'Arial',
      ...(fontPx ? { size_px: round(fontPx) } : {}),
      weight: 400,
    },
    position: { x_px: xPx, y_px: yPx },
    rotation: { z_deg: item.rotation || 0 },
    color: item.color || '#000000',
    align: 'center',
    surface: `headstone/${(item.side || 'front').toLowerCase()}`,
  };
}

function buildMotif(item, _pxPerMmX, _pxPerMmY) {
  const xPx = round(item.x || 0);
  const yPx = round(item.y || 0);
  const heightPx = item.height ? Number(item.height) : null;
  return {
    id: `motif-${item.itemID || item.id || Math.random().toString(36).slice(2, 8)}`,
    asset: item.src || item.item || 'motif',
    position: { x_px: xPx, y_px: yPx },
    ...(heightPx ? { height_px: round(heightPx) } : {}),
    rotation: { z_deg: item.rotation || 0 },
    color: item.color || '#000000',
    flip: {
      x: item.flipx === -1,
      y: item.flipy === -1,
    },
  };
}

function convertDesign(designId) {
  const meta = metadataById[designId];
  if (!meta) {
    console.error(`No metadata registered for design ${designId}`);
    process.exitCode = 1;
    return;
  }

  const legacyPath = path.join(ROOT, 'public', 'ml', meta.mlDir, 'saved-designs', 'json', `${designId}.json`);
  if (!fs.existsSync(legacyPath)) {
    console.error(`Legacy file not found: ${legacyPath}`);
    process.exitCode = 1;
    return;
  }

  const saved = JSON.parse(fs.readFileSync(legacyPath, 'utf8'));
  const headstone = saved.find((item) => item.type === 'Headstone' || item.type === 'Plaque');
  if (!headstone) {
    console.error(`Design ${designId} missing headstone data`);
    process.exitCode = 1;
    return;
  }
  const base = saved.find((item) => item.type === 'Base');

  const viewport = parseViewport(headstone);
  let dpr = headstone.dpr || 1;
  if ((headstone.device || '').toLowerCase() === 'desktop') {
    dpr = 1;
  }

  const canvasPxW = viewport.width * dpr;
  const canvasPxH = viewport.height * dpr;
  const widthMm = headstone.width || headstone.init_width || 600;
  const heightMm = headstone.height || headstone.init_height || 600;
  const pxPerMmX = canvasPxW / widthMm;
  const pxPerMmY = canvasPxH / heightMm;

  const inscriptions = saved
    .filter((item) => item.type === 'Inscription' && (item.label || '').trim())
    .map((item) => buildInscription(item, pxPerMmX, pxPerMmY, meta.category))
    .sort((a, b) => (b.position.y_px ?? 0) - (a.position.y_px ?? 0));

  const motifs = saved
    .filter((item) => item.type === 'Motif' && item.src)
    .map((item) => buildMotif(item, pxPerMmX, pxPerMmY));

  const photos = saved
    .filter((item) => item.type === 'Photo' || item.type === 'Picture')
    .map((item) => ({
      id: `photo-${item.itemID || item.id || Math.random().toString(36).slice(2, 8)}`,
      position: {
        x_px: round(item.x || 0),
        y_px: round(item.y || 0),
        z_px: 0,
      },
      width_px: item.width ? round(item.width) : undefined,
      height_px: item.height ? round(item.height) : undefined,
      rotation: { z_deg: item.rotation || 0 },
    }));

  const canonical = {
    version: VERSION,
    generatedAt: new Date().toISOString(),
    units: 'mm',
    source: {
      id: designId,
      slug: meta.slug,
      mlDir: meta.mlDir,
      legacyFile: `/ml/${meta.mlDir}/saved-designs/json/${designId}.json`,
      savedAt: new Date(Number(designId)).toISOString(),
    },
    product: {
      id: meta.productId,
      name: meta.productName,
      type: meta.productType,
      slug: meta.productSlug,
      category: meta.category,
      title: meta.title,
      shape: headstone.shape,
      material: {
        name: headstone.texture || '',
        texture: mapTexture(headstone.texture || '', meta.productId),
      },
    },
    scene: {
      canvas: { width_mm: widthMm, height_mm: heightMm },
      viewportPx: { width: viewport.width, height: viewport.height, dpr },
      surface: { origin: [0, 0, 0], normal: [0, 0, 1] },
    },
    components: {
      headstone: {
        width_mm: widthMm,
        height_mm: heightMm,
        thickness_mm: headstone._length || 100,
        surface: 'front',
        texture: mapTexture(headstone.texture || '', meta.productId),
      },
      ...(base
        ? {
            base: {
              width_mm: base.width || 0,
              height_mm: base.height || 0,
              depth_mm: base._length || base.depth || 0,
              texture: mapTexture(base.texture || '', String(base.productid || meta.productId)),
            },
          }
        : {}),
    },
    elements: {
      inscriptions,
      motifs,
      photos,
      logos: [],
      additions: [],
    },
    assets: {
      motifs: Array.from(new Set(motifs.map((motif) => motif.asset))).map((asset) => ({
        id: asset,
        path: `/shapes/motifs/${asset}.svg`,
      })),
    },
    legacy: {
      raw: saved,
    },
  };

  const outDir = path.join(ROOT, 'public', 'designs', 'v2026');
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, `${designId}.json`);
  fs.writeFileSync(outPath, JSON.stringify(canonical, null, 2));
  console.log(`Saved ${outPath}`);
}

const ids = process.argv.slice(2);
if (!ids.length) {
  console.error('Usage: node scripts/convert-saved-design.js <designId> [designId...]');
  process.exit(1);
}

ids.forEach(convertDesign);
