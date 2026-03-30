#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

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

const PRODUCT_MAP = {
  '4': { name: 'Laser-etched Black Granite Headstone', type: 'headstone', slug: 'laser-etched-headstone' },
  '5': { name: 'Bronze Plaque', type: 'plaque', slug: 'bronze-plaque' },
  '22': { name: 'Laser-etched Black Granite Mini Headstone', type: 'headstone', slug: 'mini-headstone' },
  '30': { name: 'Laser-etched Black Granite Colour', type: 'plaque', slug: 'laser-colour-plaque' },
  '32': { name: 'Full Colour Plaque', type: 'plaque', slug: 'full-colour-plaque' },
  '34': { name: 'Traditional Engraved Plaque', type: 'plaque', slug: 'traditional-plaque' },
  '52': { name: 'YAG Lasered Stainless Steel Plaque', type: 'plaque', slug: 'stainless-steel-plaque' },
  '100': { name: 'Laser-etched Black Granite Full Monument', type: 'monument', slug: 'laser-monument' },
  '101': { name: 'Traditional Engraved Full Monument', type: 'monument', slug: 'traditional-monument' },
  '124': { name: 'Traditional Engraved Headstone', type: 'headstone', slug: 'traditional-headstone' },
};

const MATERIAL_TEXTURES = {
  'blue-pearl': '/textures/forever/l/Blue-Pearl.webp',
  'blue pearl': '/textures/forever/l/Blue-Pearl.webp',
  'glory-black': '/textures/forever/l/Glory-Black-2.webp',
  'glory black': '/textures/forever/l/Glory-Black-2.webp',
  'glory-gold-spots': '/textures/forever/l/Glory-Black-1.webp',
  'african-black': '/textures/forever/l/African-Black.webp',
  'noble-black': '/textures/forever/l/Noble-Black.webp',
  g654: '/textures/forever/l/01.webp',
};

const DEFAULT_OVERRIDE_POLICY = {
  version: '1',
  warningWeights: {
    'missing-device': 1,
    'missing-dpr': 1,
    'missing-viewport-metadata': 2,
    'missing-productid': 2,
  },
  mlDirWeightOverrides: {
    forevershining: {
      'missing-device': 0,
      'missing-dpr': 0,
    },
    'bronze-plaque': {
      'missing-device': 0,
      'missing-dpr': 0,
    },
  },
  confidenceThresholds: {
    highMaxScore: 0,
    mediumMaxScore: 2,
  },
  designOverrides: {},
};

function getArgValue(args, name, fallback) {
  const index = args.indexOf(name);
  if (index === -1 || index + 1 >= args.length) return fallback;
  return args[index + 1];
}

function hasFlag(args, name) {
  return args.includes(name);
}

function parseListArg(args, name) {
  const raw = getArgValue(args, name, '');
  if (!raw) return [];
  return raw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function loadOverridePolicy(policyPath) {
  if (!policyPath || !fs.existsSync(policyPath)) {
    return DEFAULT_OVERRIDE_POLICY;
  }
  try {
    const parsed = JSON.parse(fs.readFileSync(policyPath, 'utf8'));
    return {
      ...DEFAULT_OVERRIDE_POLICY,
      ...parsed,
      warningWeights: { ...DEFAULT_OVERRIDE_POLICY.warningWeights, ...(parsed.warningWeights || {}) },
      mlDirWeightOverrides: { ...DEFAULT_OVERRIDE_POLICY.mlDirWeightOverrides, ...(parsed.mlDirWeightOverrides || {}) },
      confidenceThresholds: {
        ...DEFAULT_OVERRIDE_POLICY.confidenceThresholds,
        ...(parsed.confidenceThresholds || {}),
      },
      designOverrides: { ...DEFAULT_OVERRIDE_POLICY.designOverrides, ...(parsed.designOverrides || {}) },
    };
  } catch (error) {
    console.warn(`Failed to read policy file ${policyPath}; using defaults:`, error);
    return DEFAULT_OVERRIDE_POLICY;
  }
}

function applyOverridePolicy({ warnings, mlDir, designId }, policy) {
  const warningWeights = policy.warningWeights || {};
  const perDirWeights = (policy.mlDirWeightOverrides || {})[mlDir] || {};
  const override = (policy.designOverrides || {})[designId] || {};

  const effectiveWarnings = warnings.filter((warning) => !(override.suppressWarnings || []).includes(warning));
  const score = effectiveWarnings.reduce((sum, warning) => {
    if (Object.prototype.hasOwnProperty.call(perDirWeights, warning)) {
      return sum + Number(perDirWeights[warning] || 0);
    }
    return sum + Number(warningWeights[warning] || 1);
  }, 0);

  if (override.forceConfidence) {
    return {
      warnings: effectiveWarnings,
      confidence: override.forceConfidence,
      score,
      policyApplied: true,
    };
  }

  const thresholds = policy.confidenceThresholds || {};
  const highMaxScore = Number(thresholds.highMaxScore ?? 0);
  const mediumMaxScore = Number(thresholds.mediumMaxScore ?? 2);
  let confidence = 'low';
  if (score <= highMaxScore) confidence = 'high';
  else if (score <= mediumMaxScore) confidence = 'medium';

  return {
    warnings: effectiveWarnings,
    confidence,
    score,
    policyApplied: true,
  };
}

function shouldSkipDesign({ designId, saved, policy }) {
  const filters = policy.filters || {};
  const skipDesignIds = new Set(filters.skipDesignIds || []);
  if (skipDesignIds.has(designId)) {
    return { skip: true, reason: 'policy-skip-id' };
  }

  if (filters.skipIfTestInscription) {
    const inscriptionRegex = new RegExp(filters.testInscriptionRegex || '\\btest\\b', 'i');
    const hasTestInscription = saved.some(
      (item) =>
        item?.type === 'Inscription' &&
        typeof item.label === 'string' &&
        inscriptionRegex.test(item.label),
    );
    if (hasTestInscription) {
      return { skip: true, reason: 'test-inscription' };
    }
  }

  if (filters.skipIfSingleImageOnly) {
    const inscriptions = saved.filter((item) => item?.type === 'Inscription' && (item.label || '').trim());
    const motifs = saved.filter((item) => item?.type === 'Motif' && item.src);
    const photos = saved.filter((item) => item?.type === 'Photo' || item?.type === 'Picture');
    const hasImageOnlyPayload = photos.length === 1 && inscriptions.length === 0 && motifs.length === 0;
    if (hasImageOnlyPayload) {
      return { skip: true, reason: 'single-image-only' };
    }
  }

  return { skip: false };
}

function hashJson(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

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
  if (/(mother|daughter|wife|sister|grandmother|nanna|grandma|aunt|woman|lady|girl)/.test(lower)) return 'female';
  if (/(father|son|husband|brother|grandfather|papa|grandpa|uncle|man|gentleman|boy|dad)/.test(lower)) return 'male';
  return 'neutral';
}

function getRandomName(seed, category) {
  if (!nameDb.firstNamesArray.length || !nameDb.surnamesArray.length) return 'Name Surname';
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
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith('\'') && text.endsWith('\'')) || text.includes('"FOREVER') || text.includes('"#')) return text;

  const relationshipWords = /(beloved|loving|cherished|dear|dearest|devoted|precious|adored|treasured|father|mother|son|daughter|brother|sister|grandfather|grandmother|uncle|aunt|wife|husband|grandson|granddaughter|great-grandfather|great-grandmother|friend)/i;
  if (relationshipWords.test(text.toLowerCase()) && /\b(to|of)\s*$/i.test(text)) return text;

  const hasDatePattern = /(\d{1,2}[,\/\-\s]+\d{1,4})|(?:JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)|\d{4}\s*-\s*\d{4}|\d{2}\/\d{2}\/\d{4}/i.test(text);
  if (hasDatePattern) {
    const stripped = text
      .replace(/\d{4}\s*-\s*\d{4}/g, '')
      .replace(/\d{1,2}[,\/\-\s]+\d{1,4}/g, '')
      .replace(/\d{2}\/\d{2}\/\d{4}/g, '')
      .replace(/(JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    if (!stripped || stripped === '-') return text;
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
  if (titleCase) return getRandomName(text, category);

  const hasLowerCase = /[a-z]/.test(text);
  const shortPhrase = words.length <= 8;
  const sentenceWords = /(the|you|me|my|your|when|feel|know|am|are|is|see|being|part|of|and|or|not|lost)/i.test(text);
  if (hasLowerCase && shortPhrase && sentenceWords) return text;

  const allCaps = /^[A-Z\s'-]+$/.test(text) && words.length >= 2;
  const singleAllCaps = /^[A-Z'-]+$/.test(text) && words.length === 1;
  if (singleAllCaps && !sentenceWords) {
    const upperWord = text.toUpperCase().replace(/['".,!?]/g, '');
    const isFirst = nameDb.firstNames.has(upperWord);
    if (isFirst && !nameDb.surnames.has(upperWord)) return getRandomFirstName(text, category).toUpperCase();
    return getRandomSurname(text).toUpperCase();
  }
  if (allCaps && !sentenceWords) return getRandomName(text, category).toUpperCase();
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

function round(value) {
  return Math.round(value * 1000) / 1000;
}

function mapTexture(texturePath, productId) {
  if (!texturePath) return '';
  const lower = String(texturePath).toLowerCase();
  if (productId === '5' && lower.includes('phoenix')) {
    const match = texturePath.match(/phoenix[\\/](l|s)[\\/](\d+)\.(jpg|webp)$/i);
    if (match) return `/textures/phoenix/${match[1]}/${match[2]}.webp`;
  }
  if (lower.includes('/17.jpg') || lower.includes('glory-gold-spots') || lower.includes('glory gold spots')) {
    return MATERIAL_TEXTURES['glory-gold-spots'];
  }
  if (lower.includes('/18.jpg') || lower.includes('/19.jpg') || lower.includes('glory-black')) {
    return MATERIAL_TEXTURES['glory-black'];
  }
  if (lower.includes('blue-pearl') || lower.includes('bluepearl')) {
    return MATERIAL_TEXTURES['blue-pearl'];
  }
  for (const [key, value] of Object.entries(MATERIAL_TEXTURES)) {
    if (lower.includes(key)) return value;
  }
  if (String(texturePath).startsWith('/textures/')) {
    return String(texturePath).replace(/-\d+-x-\d+/i, '').replace(/\.jpg$/i, '.webp');
  }
  const match = String(texturePath).match(/[\\/]([A-Za-z0-9-]+)\.(jpg|webp)$/i);
  if (match) {
    const name = match[1].replace(/-\d+-x-\d+/i, '');
    return `/textures/forever/l/${name}.webp`;
  }
  return String(texturePath);
}

function buildCoordinateSystem(mlDir, stageCssPx, dpr) {
  const normalizedMlDir = String(mlDir || '').toLowerCase();
  const cssWidth = Math.max(1, Math.round(stageCssPx?.width || 0));
  const cssHeight = Math.max(1, Math.round(stageCssPx?.height || 0));
  const safeDpr = Number.isFinite(dpr) && dpr > 0 ? dpr : 1;
  return {
    positionMode: 'legacy-stage-px',
    coordinateSpace: 'css-stage',
    stageCssPx: {
      width: cssWidth,
      height: cssHeight,
    },
    bufferPx: {
      width: Math.max(1, Math.round(cssWidth * safeDpr)),
      height: Math.max(1, Math.round(cssHeight * safeDpr)),
    },
    headstonePlacement: normalizedMlDir === 'forevershining' ? 'auto-center' : 'legacy-stage-offset',
    flipMode:
      normalizedMlDir === 'headstonesdesigner' || normalizedMlDir === 'bronze-plaque'
        ? 'invert-legacy-bools'
        : 'preserve',
  };
}

function inferCategoryFromType(productType) {
  if (productType === 'plaque') return 'memorial-plaque';
  if (productType === 'monument') return 'full-monument';
  return 'memorial';
}

function inferMeta(designId, mlDir, headstone) {
  const productId = String(headstone.productid || '');
  const product = PRODUCT_MAP[productId] || {
    name: 'Legacy Memorial Design',
    type: headstone.type === 'Plaque' ? 'plaque' : 'headstone',
    slug: headstone.type === 'Plaque' ? 'legacy-plaque' : 'legacy-headstone',
  };
  return {
    slug: `legacy-${designId}`,
    productId,
    productName: product.name,
    productType: product.type,
    productSlug: product.slug,
    category: inferCategoryFromType(product.type),
    title: 'Legacy Migration',
    mlDir,
  };
}

function buildCanonicalFromLegacy(saved, designId, meta, opts = {}) {
  const { includePhotos = true, anonymize = true, overridePolicy = DEFAULT_OVERRIDE_POLICY } = opts;
  const warnings = [];
  const headstone = saved.find((item) => item.type === 'Headstone' || item.type === 'Plaque');
  if (!headstone) throw new Error('missing headstone/plaque item');
  const base = saved.find((item) => item.type === 'Base');
  const viewport = parseViewport(headstone);
  let dpr = headstone.dpr || 1;
  if ((headstone.device || '').toLowerCase() === 'desktop' && !headstone.dpr) dpr = 1;
  if (!headstone.device) warnings.push('missing-device');
  if (headstone.dpr == null) warnings.push('missing-dpr');
  if (!headstone.navigator && (!headstone.init_width || !headstone.init_height)) warnings.push('missing-viewport-metadata');
  if (!headstone.productid) warnings.push('missing-productid');

  const canvasPxW = viewport.width * dpr;
  const canvasPxH = viewport.height * dpr;
  const widthMm = headstone.width || headstone.init_width || 600;
  const heightMm = headstone.height || headstone.init_height || 600;

  const inscriptions = saved
    .filter((item) => item.type === 'Inscription' && (item.label || '').trim())
    .map((item) => ({
      id: `insc-${item.itemID || item.id || Math.random().toString(36).slice(2, 8)}`,
      text: anonymize ? sanitizeInscription(item.label || '', meta.category) : item.label || '',
      font: {
        family: item.font_family || 'Arial',
        ...(item.font_size ? { size_px: round(Number(item.font_size)) } : {}),
      },
      position: { x_px: round(item.x || 0), y_px: round(item.y || 0) },
      rotation: { z_deg: item.rotation || 0 },
      color: item.color || '#000000',
      surface: `${String(item.part || 'Headstone').toLowerCase()}/${(item.side || 'front').toLowerCase()}`,
    }));

  const motifs = saved
    .filter((item) => item.type === 'Motif' && item.src)
    .map((item) => ({
      id: `motif-${item.itemID || item.id || Math.random().toString(36).slice(2, 8)}`,
      asset: item.src || item.item || 'motif',
      position: { x_px: round(item.x || 0), y_px: round(item.y || 0) },
      ...(item.height ? { height_px: round(Number(item.height)) } : {}),
      rotation: { z_deg: item.rotation || 0 },
      color: item.color || '#000000',
      flip: { x: Number(item.flipx) === -1, y: Number(item.flipy) === -1 },
      surface: `${String(item.part || 'Headstone').toLowerCase()}/${(item.side || 'front').toLowerCase()}`,
    }));

  const photos = includePhotos
    ? saved
        .filter((item) => item.type === 'Photo' || item.type === 'Picture')
        .map((item) => ({
          id: `photo-${item.itemID || item.id || Math.random().toString(36).slice(2, 8)}`,
          position: { x_px: round(item.x || 0), y_px: round(item.y || 0), z_px: 0 },
          width_px: item.width ? round(item.width) : undefined,
          height_px: item.height ? round(item.height) : undefined,
          rotation: { z_deg: item.rotation || 0 },
          typeId: Number.isFinite(Number(item.productid)) ? Number(item.productid) : undefined,
          typeName: item.name || undefined,
          surface: `${String(item.part || 'Headstone').toLowerCase()}/${(item.side || 'front').toLowerCase()}`,
          source: {
            item: item.item || undefined,
            src: item.src || undefined,
            path: item.path || undefined,
          },
          mask: {
            shape_url: item.shape_url || undefined,
          },
          ...(item.size ? { size_mm: (() => {
            const match = String(item.size).match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i);
            if (!match) return undefined;
            const width = Number(match[1]);
            const height = Number(match[2]);
            if (!Number.isFinite(width) || !Number.isFinite(height)) return undefined;
            return { width: round(width), height: round(height) };
          })() } : {}),
        }))
    : [];

  const policyResult = applyOverridePolicy(
    { warnings, mlDir: meta.mlDir, designId },
    overridePolicy,
  );

  const canonical = {
    version: VERSION,
    generatedAt: new Date().toISOString(),
    units: 'mm',
    source: {
      id: designId,
      slug: meta.slug,
      mlDir: meta.mlDir,
      legacyFile: `/ml/${meta.mlDir}/saved-designs/json/${designId}.json`,
      savedAt: Number.isFinite(Number(designId)) ? new Date(Number(designId)).toISOString() : new Date().toISOString(),
    },
    product: {
      id: meta.productId || '',
      name: meta.productName,
      type: meta.productType,
      slug: meta.productSlug,
      category: meta.category,
      title: meta.title,
      shape: headstone.shape,
      material: {
        name: headstone.texture || '',
        texture: mapTexture(headstone.texture || '', meta.productId || ''),
      },
    },
    scene: {
      canvas: { width_mm: widthMm, height_mm: heightMm },
      viewportPx: { width: viewport.width, height: viewport.height, dpr },
      surface: { origin: [0, 0, 0], normal: [0, 0, 1] },
      coordinateSystem: buildCoordinateSystem(
        meta.mlDir,
        { width: viewport.width, height: viewport.height },
        dpr,
      ),
    },
    components: {
      headstone: {
        width_mm: widthMm,
        height_mm: heightMm,
        thickness_mm: headstone._length || 100,
        surface: 'front',
        texture: mapTexture(headstone.texture || '', meta.productId || ''),
      },
      ...(base
        ? {
            base: {
              width_mm: base.width || 0,
              height_mm: base.height || 0,
              depth_mm: base._length || base.depth || 0,
              texture: mapTexture(base.texture || '', String(base.productid || meta.productId || '')),
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
    migration: {
      pipeline: 'legacy2d-to-canonical3d',
      converter: 'batch-convert-saved-designs.js',
      converterVersion: VERSION,
      sourceHash: hashJson(saved),
      sourceItemCount: saved.length,
      warnings: policyResult.warnings,
      confidence: policyResult.confidence,
      migratedAt: new Date().toISOString(),
      policyVersion: overridePolicy.version || DEFAULT_OVERRIDE_POLICY.version,
      warningScore: policyResult.score,
    },
    legacy: {
      raw: saved,
    },
  };

  const quality = {
    warningCount: policyResult.warnings.length,
    confidence: canonical.migration.confidence,
    warningKeys: policyResult.warnings,
    elementCount: inscriptions.length + motifs.length + photos.length,
    canvasPixelArea: canvasPxW * canvasPxH,
    warningScore: policyResult.score,
  };

  return { canonical, quality };
}

function collectLegacyJsonFiles(mlRoot, mlDirs) {
  const availableDirs = mlDirs.length
    ? mlDirs
    : fs.readdirSync(mlRoot).filter((entry) => fs.statSync(path.join(mlRoot, entry)).isDirectory());
  const files = [];
  availableDirs.forEach((mlDir) => {
    const dirPath = path.join(mlRoot, mlDir, 'saved-designs', 'json');
    if (!fs.existsSync(dirPath)) return;
    fs.readdirSync(dirPath)
      .filter((file) => file.endsWith('.json'))
      .forEach((file) => {
        const designId = path.basename(file, '.json');
        if (!/^\d{10,}$/.test(designId)) {
          return;
        }
        files.push({ mlDir, filePath: path.join(dirPath, file) });
      });
  });
  return files;
}

function loadResumeProcessedIds(reportPath) {
  if (!reportPath) {
    return new Set();
  }
  if (!fs.existsSync(reportPath)) {
    throw new Error(`resume report not found: ${reportPath}`);
  }
  const raw = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const results = Array.isArray(raw?.results) ? raw.results : [];
  const processed = new Set();
  results.forEach((result) => {
    if (!result || typeof result.id !== 'string') return;
    if (result.status === 'ok' || result.status === 'skipped') {
      processed.add(result.id);
    }
  });
  return processed;
}

function run() {
  const args = process.argv.slice(2);
  const dryRun = hasFlag(args, '--dry-run');
  const includePhotos = hasFlag(args, '--include-photos');
  const anonymize = !hasFlag(args, '--no-anonymize');
  const failFast = hasFlag(args, '--fail-fast');
  const mlDirs = parseListArg(args, '--ml-dir');
  const idFilter = parseListArg(args, '--ids');
  const limit = Number(getArgValue(args, '--limit', '0')) || 0;
  const offset = Number(getArgValue(args, '--offset', '0')) || 0;
  const chunkSize = Math.max(1, Number(getArgValue(args, '--chunk-size', '250')) || 250);
  const resumeFromReportArg = getArgValue(args, '--resume-from-report', '');
  const outputDir = path.resolve(ROOT, getArgValue(args, '--out-dir', 'public/designs/v2026'));
  const policyPath = path.resolve(
    ROOT,
    getArgValue(args, '--policy', 'scripts/utils/conversion-override-policy.json'),
  );
  const reportPath = path.resolve(
    ROOT,
    getArgValue(args, '--report', `database-exports/conversion-report-${Date.now()}.json`),
  );
  const mlRoot = path.join(ROOT, 'public', 'ml');
  const overridePolicy = loadOverridePolicy(policyPath);

  if (!fs.existsSync(mlRoot)) {
    console.error(`Missing legacy root: ${mlRoot}`);
    process.exit(1);
  }

  if (!dryRun) fs.mkdirSync(outputDir, { recursive: true });
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });

  let files = collectLegacyJsonFiles(mlRoot, mlDirs);
  if (idFilter.length) {
    const wanted = new Set(idFilter);
    files = files.filter(({ filePath }) => wanted.has(path.basename(filePath, '.json')));
  }
  files.sort((a, b) => a.filePath.localeCompare(b.filePath));
  const sliced = files.slice(offset, limit > 0 ? offset + limit : undefined);
  const resumeFromReportPath = resumeFromReportArg ? path.resolve(ROOT, resumeFromReportArg) : '';
  const resumeProcessedIds = loadResumeProcessedIds(resumeFromReportPath);
  const pending = resumeProcessedIds.size
    ? sliced.filter(({ filePath }) => !resumeProcessedIds.has(path.basename(filePath, '.json')))
    : sliced;
  const resumeSkippedCount = sliced.length - pending.length;
  if (resumeProcessedIds.size) {
    console.log(
      `Resume mode enabled via ${resumeFromReportPath}; skipping ${resumeSkippedCount} already completed/skipped IDs.`,
    );
  }

  const startedAt = new Date().toISOString();
  const results = [];
  const warningHistogram = {};
  const skipHistogram = {};
  let success = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < pending.length; i += chunkSize) {
    const chunk = pending.slice(i, i + chunkSize);
    chunk.forEach(({ mlDir, filePath }) => {
      const designId = path.basename(filePath, '.json');
      const skipById = shouldSkipDesign({ designId, saved: [], policy: overridePolicy });
      if (skipById.skip) {
        skipped += 1;
        const reason = skipById.reason || 'policy-skip';
        skipHistogram[reason] = (skipHistogram[reason] || 0) + 1;
        results.push({
          id: designId,
          mlDir,
          status: 'skipped',
          skipReason: reason,
        });
        return;
      }
      try {
        const saved = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (!Array.isArray(saved)) throw new Error('legacy payload must be array');
        const skipCheck = shouldSkipDesign({ designId, saved, policy: overridePolicy });
        if (skipCheck.skip) {
          skipped += 1;
          const reason = skipCheck.reason || 'policy-skip';
          skipHistogram[reason] = (skipHistogram[reason] || 0) + 1;
          results.push({
            id: designId,
            mlDir,
            status: 'skipped',
            skipReason: reason,
          });
          return;
        }
        const headstone = saved.find((item) => item.type === 'Headstone' || item.type === 'Plaque');
        if (!headstone) throw new Error('missing headstone/plaque item');
        const meta = inferMeta(designId, mlDir, headstone);
        const { canonical, quality } = buildCanonicalFromLegacy(saved, designId, meta, {
          includePhotos,
          anonymize,
          overridePolicy,
        });
        if (!dryRun) {
          const outPath = path.join(outputDir, `${designId}.json`);
          fs.writeFileSync(outPath, JSON.stringify(canonical, null, 2));
        }
        success += 1;
        quality.warningKeys.forEach((key) => {
          warningHistogram[key] = (warningHistogram[key] || 0) + 1;
        });
        results.push({
          id: designId,
          mlDir,
          status: 'ok',
          confidence: quality.confidence,
          warningCount: quality.warningCount,
          warningScore: quality.warningScore,
          warnings: quality.warningKeys,
          sourceHash: canonical.migration.sourceHash,
        });
      } catch (error) {
        failed += 1;
        results.push({
          id: designId,
          mlDir,
          status: 'failed',
          error: error instanceof Error ? error.message : String(error),
        });
        if (failFast) throw error;
      }
    });
    console.log(`Processed ${Math.min(i + chunk.length, pending.length)} / ${pending.length}`);
  }

  const confidenceCounts = results.reduce(
    (acc, item) => {
      if (item.status !== 'ok') return acc;
      acc[item.confidence] = (acc[item.confidence] || 0) + 1;
      return acc;
    },
    { high: 0, medium: 0, low: 0 },
  );

  const report = {
    version: VERSION,
    startedAt,
    finishedAt: new Date().toISOString(),
    input: {
      mlDirs: mlDirs.length ? mlDirs : 'all',
      totalDiscovered: files.length,
      offset,
      limit: limit || null,
      chunkSize,
      resumeFromReport: resumeFromReportPath || null,
      resumeSkippedCount,
      dryRun,
      includePhotos,
      anonymize,
      policyPath,
      policyVersion: overridePolicy.version || DEFAULT_OVERRIDE_POLICY.version,
    },
    output: {
      outputDir,
      reportPath,
    },
    summary: {
      processed: pending.length,
      success,
      failed,
      skipped,
      confidenceCounts,
      warningHistogram,
      skipHistogram,
    },
    results,
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('');
  console.log('Batch conversion completed.');
  console.log(`Processed: ${pending.length} | Success: ${success} | Failed: ${failed}`);
  if (resumeSkippedCount > 0) {
    console.log(`Resume skipped: ${resumeSkippedCount}`);
  }
  console.log(`Confidence: high=${confidenceCounts.high}, medium=${confidenceCounts.medium}, low=${confidenceCounts.low}`);
  console.log(`Report: ${reportPath}`);
}

run();
