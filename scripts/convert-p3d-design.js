#!/usr/bin/env node
/**
 * convert-p3d-design.js
 *
 * Converts legacy 3D p3d files (Full Monuments) to canonical JSON format.
 * P3D format: 26-byte binary header + zlib-compressed (XML scene tree + embedded PNGs).
 *
 * Usage:
 *   node scripts/convert-p3d-design.js                  # Convert all p3d files
 *   node scripts/convert-p3d-design.js 1672745066094    # Convert specific design
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const VERSION = '2026.01';
const P3D_SOURCES = [
  { dir: path.join(ROOT, 'public', 'ml', 'forevershining', 'saved-designs', 'p3d'), jsonDir: path.join(ROOT, 'public', 'ml', 'forevershining', 'saved-designs', 'json'), mlDir: 'forevershining' },
  { dir: path.join(ROOT, 'public', 'ml', 'headstonesdesigner', 'saved-designs', 'p3d'), jsonDir: path.join(ROOT, 'public', 'ml', 'headstonesdesigner', 'saved-designs', 'json'), mlDir: 'headstonesdesigner' },
];
const OUT_DIR = path.join(ROOT, 'public', 'designs', 'v2026-p3d');
const ASSETS_DIR = path.join(ROOT, 'public', 'designs', 'p3d-assets');

// ─── Name anonymization (reused from existing converter) ────────────────────
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

// ─── Product mapping ────────────────────────────────────────────────────────
const PRODUCT_MAP = {
  '100': { name: 'Laser-etched Black Granite Full Monument', type: 'full-monument', slug: 'laser-monument' },
  '101': { name: 'Traditional Engraved Full Monument', type: 'full-monument', slug: 'traditional-monument' },
  '4': { name: 'Laser-etched Black Granite Headstone', type: 'headstone', slug: 'laser-etched-headstone' },
  '124': { name: 'Traditional Engraved Headstone', type: 'headstone', slug: 'traditional-headstone' },
};

// ─── Material/texture mapping ───────────────────────────────────────────────
const MATERIAL_TEXTURES = {
  'blue-pearl': '/textures/forever/l/Blue-Pearl.webp',
  'blue pearl': '/textures/forever/l/Blue-Pearl.webp',
  'glory-black': '/textures/forever/l/Glory-Black-2.webp',
  'glory black': '/textures/forever/l/Glory-Black-2.webp',
  'glory-gold-spots': '/textures/forever/l/Glory-Black-1.webp',
  'african-black': '/textures/forever/l/African-Black.webp',
  'noble-black': '/textures/forever/l/Noble-Black.webp',
  'g654': '/textures/forever/l/01.webp',
  'white-carrara': '/textures/forever/l/White-Carrara.webp',
  'emerald-pearl': '/textures/forever/l/Emerald-Pearl.webp',
  'paradiso': '/textures/forever/l/Paradiso.webp',
  'ruby-red': '/textures/forever/l/Ruby-Red.webp',
  'bahama-blue': '/textures/forever/l/Bahama-Blue.webp',
  'impala': '/textures/forever/l/Impala.webp',
  'tropical-green': '/textures/forever/l/Tropical-Green.webp',
  'indian-aurora': '/textures/forever/l/Indian-Aurora.webp',
};

// ─── Shape mapping: p3d model URL → shape name ─────────────────────────────
function extractShapeName(modelUrl) {
  if (!modelUrl) return null;
  const match = modelUrl.match(/headstones\/([^.]+)\.m3d$/);
  return match ? match[1] : null;
}

// ─── Monument model mapping: p3d model URL → monument type ──────────────────
function extractMonumentType(modelUrl) {
  if (!modelUrl) return null;
  const match = modelUrl.match(/tombstones\/([^/]+)\//);
  return match ? match[1] : null;
}

function mapTexture(texturePath) {
  if (!texturePath) return '';
  const lower = texturePath.toLowerCase();
  // Map numbered legacy textures to named materials
  if (/[/\\]17\.(jpg|webp)$/i.test(texturePath) || lower.includes('/17.')) {
    return MATERIAL_TEXTURES['glory-gold-spots'];
  }
  if (/[/\\](18|19)\.(jpg|webp)$/i.test(texturePath) || lower.includes('/18.') || lower.includes('/19.')) {
    return MATERIAL_TEXTURES['glory-black'];
  }
  // Strip path parts, extract granite name
  for (const [key, value] of Object.entries(MATERIAL_TEXTURES)) {
    if (lower.includes(key.toLowerCase())) return value;
  }
  // Try extracting filename
  const match = texturePath.match(/[\\/]([A-Za-z0-9-]+?)(?:-\d+-x-\d+)?\.(jpg|webp)$/i);
  if (match) {
    const name = match[1];
    return `/textures/forever/l/${name}.webp`;
  }
  return texturePath;
}

function round(value) {
  return Math.round(value * 1000) / 1000;
}

function hashJson(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

// ─── P3D Parser ─────────────────────────────────────────────────────────────

/**
 * Decompress a p3d file and return { xml: string, binarySection: Buffer }
 */
function decompressP3d(filePath) {
  let data = fs.readFileSync(filePath);

  // Handle text-CSV encoded variant (same bytes stored as comma-separated ASCII decimals)
  if (data[4] !== 0x57 || data[5] !== 0x50 || data[6] !== 0x46 || data[7] !== 0x30) {
    // Not binary WPF0 — try text-CSV decode
    const text = data.toString('ascii');
    const vals = text.split(',').map((v) => parseInt(v.trim(), 10));
    if (vals.some(isNaN)) return null;
    data = Buffer.from(vals);
  }

  // Verify WPF0 magic at bytes 4-7
  if (data.slice(4, 8).toString('ascii') !== 'WPF0') {
    return null;
  }

  const compressed = data.slice(26);
  let raw;
  try {
    raw = zlib.inflateSync(compressed);
  } catch {
    return null;
  }

  // Find XML boundaries
  const projectStart = raw.indexOf('<project');
  const projectEndTag = '</project>';
  const projectEnd = raw.indexOf(projectEndTag);
  if (projectStart === -1 || projectEnd === -1) return null;

  const xmlEnd = projectEnd + projectEndTag.length;
  const xml = raw.slice(projectStart, xmlEnd).toString('utf8');
  const binarySection = raw.slice(xmlEnd);

  return { xml, binarySection, rawSize: raw.length };
}

/**
 * Minimal XML parser for p3d scene tree.
 * Extracts only IMMEDIATE properties of each model (not from nested children)
 * by reading the first <properties>...</properties> block before any <regions> or nested <model>.
 */
function parseP3dXml(xml) {
  const result = {
    scenery: null,
    base: null,
    kerb: null,
    lid: null,
    stand: null,
    table: null, // headstone
    motifs: [],
    lidMotifIndices: [],    // indices of motifs found under <lid>...<elements>
    headMotifIndices: [],   // indices of motifs found under <table>...<inscriptions>
    monumentType: null,
  };

  /**
   * Get the immediate content of a model (everything before nested <regions> or child <model>).
   * This ensures we only read THIS model's properties, context, extra, etc.
   */
  function getImmediateContent(content) {
    const regionsIdx = content.indexOf('<regions>');
    const nextModelIdx = content.indexOf('<model ');
    let cutoff = content.length;
    if (regionsIdx !== -1) cutoff = Math.min(cutoff, regionsIdx);
    if (nextModelIdx !== -1) cutoff = Math.min(cutoff, nextModelIdx);
    return content.substring(0, cutoff);
  }

  function extractProperties(content) {
    const props = {};
    const propRegex = /<property\s+id="([^"]+)"\s+type="([^"]+)"\s+value="([^"]*)"[^/]*\/>/g;
    let m;
    while ((m = propRegex.exec(content)) !== null) {
      props[m[1]] = { type: m[2], value: m[3] };
    }
    return props;
  }

  function extractContext(content) {
    const m = content.match(/<context[^>]+url="([^"]+)"/);
    return m ? m[1] : null;
  }

  function extractExtraJson(content) {
    // Handle both plain and CDATA-wrapped extra JSON
    const m = content.match(/<extra\s+type="json">(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/extra>/);
    if (m) {
      const text = m[1].trim();
      try { return JSON.parse(text); } catch { return null; }
    }
    return null;
  }

  function extractRegionPosition(content) {
    const m = content.match(/<regionPosition\s+x="([^"]+)"\s+y="([^"]+)"\s+rotation="([^"]+)"/);
    if (m) return { x: parseFloat(m[1]), y: parseFloat(m[2]), rotation: parseFloat(m[3]) };
    return null;
  }

  function extractStorageParams(content) {
    const params = {};
    const paramRegex = /<param\s+key="([^"]+)"\s+type="([^"]+)"\s+value="([^"]+)"/g;
    let m;
    while ((m = paramRegex.exec(content)) !== null) {
      params[m[1]] = m[2] === 'number' ? parseFloat(m[3]) : m[3];
    }
    return params;
  }

  function extractEmbedPointer(content) {
    const m = content.match(/<displayObjectValue\s+embed-pointer="([^"]+)"/);
    return m ? m[1] : null;
  }

  function buildComponent(modelContent) {
    const immediate = getImmediateContent(modelContent);
    const props = extractProperties(immediate);
    const url = extractContext(immediate);
    const extra = extractExtraJson(immediate);
    const texture = extra ? extra.color || null : null;
    return {
      url,
      texture,
      width: props.width ? parseFloat(props.width.value) : null,
      height: props.height ? parseFloat(props.height.value) : null,
      depth: props.depth ? parseFloat(props.depth.value) : null,
    };
  }

  // Find content after a model open tag (everything between <model generalType="X"> and its first child <model> or </model>)
  function findModelContent(type) {
    const tag = `<model generalType="${type}">`;
    const idx = xml.indexOf(tag);
    if (idx === -1) return null;
    return xml.substring(idx + tag.length);
  }

  // Parse structural models
  const baseContent = findModelContent('base');
  if (baseContent) {
    result.base = buildComponent(baseContent);
    result.monumentType = extractMonumentType(result.base.url);
  }

  const kerbContent = findModelContent('kerb');
  if (kerbContent) result.kerb = buildComponent(kerbContent);

  const lidContent = findModelContent('lid');
  if (lidContent) result.lid = buildComponent(lidContent);

  const standContent = findModelContent('stand');
  if (standContent) result.stand = buildComponent(standContent);

  const tableContent = findModelContent('table');
  if (tableContent) {
    result.table = buildComponent(tableContent);
    result.table.shape = extractShapeName(result.table.url);
  }

  // Find motifs — track which section they're in (lid elements vs headstone inscriptions)
  const lidElementsStart = xml.indexOf('<elements>');
  const lidElementsEnd = xml.indexOf('</elements>');
  const inscriptionsStart = xml.indexOf('<inscriptions>');
  const inscriptionsEnd = xml.indexOf('</inscriptions>');

  const motifRegex = /<model\s+generalType="motif">([\s\S]*?)<\/model>/g;
  let motifMatch;
  while ((motifMatch = motifRegex.exec(xml)) !== null) {
    const content = motifMatch[1];
    const immediate = getImmediateContent(content);
    const props = extractProperties(content); // motifs don't have nested models, safe to search full content
    const position = extractRegionPosition(content);
    const storage = extractStorageParams(content);
    const embedPointer = extractEmbedPointer(content);
    const extraJson = extractExtraJson(content);
    const color = props.color ? props.color.value : null;
    const sandblasted = props.sandblasted ? props.sandblasted.value === 'true' : false;

    const motifIdx = result.motifs.length;

    // Determine surface based on position in XML
    const matchPos = motifMatch.index;
    if (lidElementsStart !== -1 && matchPos > lidElementsStart && matchPos < lidElementsEnd) {
      result.lidMotifIndices.push(motifIdx);
    } else if (inscriptionsStart !== -1 && matchPos > inscriptionsStart && matchPos < inscriptionsEnd) {
      result.headMotifIndices.push(motifIdx);
    }

    result.motifs.push({
      id: extraJson?.id ?? null,
      src: extraJson?.src ?? null,
      position,
      width: props.width ? parseFloat(props.width.value) : null,
      height: props.height ? parseFloat(props.height.value) : null,
      layer: props.layer ? parseFloat(props.layer.value) : null,
      color: color !== 'NaN' ? color : null,
      sandblasted,
      sandblastDepth: props.sandblast_depth ? parseFloat(props.sandblast_depth.value) : null,
      alpha: props.alpha ? parseFloat(props.alpha.value) : null,
      embedPointer,
      fixedAspectRatio: storage.fixedAspectRatio || null,
    });
  }

  return result;
}

// ─── PNG extraction ─────────────────────────────────────────────────────────

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
const IEND_MARKER = Buffer.from('IEND');

/**
 * Extract a PNG image from the binary section at the given embed-pointer offset.
 * Returns a Buffer containing the PNG data, or null.
 */
function extractPng(binarySection, embedPointerHex) {
  const offset = parseInt(embedPointerHex, 16);
  if (offset < 0 || offset >= binarySection.length) return null;

  // Find PNG signature near the offset (may have a small header before it)
  let pngStart = -1;
  for (let i = offset; i < Math.min(offset + 20, binarySection.length - 8); i++) {
    if (binarySection[i] === 0x89 && binarySection[i + 1] === 0x50 &&
        binarySection[i + 2] === 0x4e && binarySection[i + 3] === 0x47) {
      pngStart = i;
      break;
    }
  }
  if (pngStart === -1) return null;

  // Find IEND chunk (marks end of PNG)
  let iendPos = pngStart;
  while (iendPos < binarySection.length - 4) {
    const idx = binarySection.indexOf(IEND_MARKER, iendPos);
    if (idx === -1) break;
    // IEND chunk: 4 bytes length (should be 0) + 'IEND' + 4 bytes CRC
    const pngEnd = idx + 4 + 4; // IEND + CRC
    return binarySection.slice(pngStart, pngEnd);
  }

  return null;
}

// ─── Companion JSON reader ──────────────────────────────────────────────────

function readCompanionJson(designId, jsonDirOverride) {
  const dir = jsonDirOverride || P3D_SOURCES[0].jsonDir;
  const jsonPath = path.join(dir, `${designId}.json`);
  if (!fs.existsSync(jsonPath)) return null;
  try {
    return JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  } catch {
    return null;
  }
}

function detectProductId(companionJson, p3dData) {
  if (!companionJson) return '100'; // default to laser-etched monument
  const items = Array.isArray(companionJson) ? companionJson : [companionJson];
  const headstone = items.find((i) => i.type === 'Headstone' || i.productid);
  if (headstone) {
    const pid = String(headstone.productid || '');
    if (PRODUCT_MAP[pid]) return pid;
  }
  // Check if it's a laser-etched (black granite) or traditional (colored)
  const texture = p3dData?.table?.texture || '';
  if (texture.toLowerCase().includes('african-black') || texture.toLowerCase().includes('glory-black')) {
    return '100';
  }
  return '101';
}

// ─── Sanitization (adapted from convert-saved-design.js) ────────────────────

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function getRandomName(seed, category) {
  const seedVal = seed ? hashString(seed) : Math.floor(Math.random() * 10000);
  const first = nameDb.firstNamesArray[seedVal % nameDb.firstNamesArray.length];
  const surname = nameDb.surnamesArray[(seedVal + 1) % nameDb.surnamesArray.length];
  return `${first} ${surname}`;
}

function getRandomFirstName(seed, category) {
  const seedVal = seed ? hashString(seed) : Math.floor(Math.random() * 10000);
  return nameDb.firstNamesArray[seedVal % nameDb.firstNamesArray.length];
}

function getRandomSurname(seed) {
  const seedVal = seed ? hashString(seed) : Math.floor(Math.random() * 10000);
  return nameDb.surnamesArray[seedVal % nameDb.surnamesArray.length];
}

function sanitizeInscription(text, category) {
  if (!text) return text;
  const commonPhrases = [
    'IN LOVING MEMORY', 'OF', 'LOVING', 'SON', 'DAUGHTER', 'BROTHER', 'SISTER', 'MOTHER', 'FATHER',
    'WIFE', 'HUSBAND', 'FOREVER', 'REST IN PEACE', 'RIP', 'R.I.P', 'R.I.P.', 'BELOVED', 'CHERISHED',
    'ALWAYS', 'REMEMBERED',
  ];
  const memorialPhrases = [
    'WILL ALWAYS BE IN OUR HEARTS', 'FOREVER IN OUR HEARTS', 'ALWAYS IN OUR HEARTS',
    'GONE BUT NOT FORGOTTEN', 'FOREVER LOVED', 'ALWAYS LOVED', 'DEARLY LOVED', 'FOREVER MISSED',
    'DEEPLY MISSED', 'GREATLY MISSED', 'YOUR LIFE WAS A BLESSING', 'YOUR MEMORY A TREASURE',
    'BELOVED MOTHER', 'BELOVED FATHER', 'BELOVED GRANDMOTHER', 'BELOVED GRANDFATHER',
    'BELOVED WIFE', 'BELOVED HUSBAND', 'LOVING MOTHER', 'LOVING FATHER',
    'DEVOTED MOTHER', 'DEVOTED FATHER', 'A LIFE LIVED WITH PASSION',
  ];

  const upper = text.toUpperCase().trim();
  const upperNoPunc = upper.replace(/[.,!?;:'"]/g, '');
  if (memorialPhrases.some((phrase) => upper === phrase || upper.includes(phrase))) return text;
  if (commonPhrases.includes(upper) || commonPhrases.includes(upperNoPunc)) return text;
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) return text;

  const relationshipWords = /(beloved|loving|cherished|dear|devoted|precious|adored|treasured|father|mother|son|daughter|brother|sister|grandfather|grandmother|uncle|aunt|wife|husband|grandson|granddaughter|friend)/i;
  if (relationshipWords.test(text.toLowerCase()) && /\b(to|of)\s*$/i.test(text)) return text;

  const hasDatePattern = /(\d{1,2}[,\/\-\s]+\d{1,4})|(?:JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)|\d{4}\s*-\s*\d{4}|\d{2}\/\d{2}\/\d{4}/i.test(text);
  if (hasDatePattern) {
    const stripped = text
      .replace(/\d{4}\s*-\s*\d{4}/g, '')
      .replace(/\d{1,2}[,\/\-\s]+\d{1,4}/g, '')
      .replace(/\d{2}\/\d{2}\/\d{4}/g, '')
      .replace(/(JANUARY|FEBRUARY|MARCH|APRIL|MAY|JUNE|JULY|AUGUST|SEPTEMBER|OCTOBER|NOVEMBER|DECEMBER)/gi, '')
      .replace(/\s+/g, ' ').trim();
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
    const sentenceRegex = /\b(the|you|me|my|your|when|feel|know|am|are|is|see|being|part|of|and|or|not|lost|may|be|thine|thy|thee|heaven|eternal|happiness|shall|will|has|had|was|were|would|could|should|our|their|us|we)\b/i;
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
  const sentenceWords = /\b(the|you|me|my|your|when|feel|know|am|are|is|see|being|part|of|and|or|not|lost)\b/i.test(text);
  if (hasLowerCase && shortPhrase && sentenceWords) return text;

  const allCaps = /^[A-Z\s'-]+$/.test(text) && words.length >= 2;
  const singleAllCaps = /^[A-Z'-]+$/.test(text) && words.length === 1;
  if (singleAllCaps && !sentenceWords) {
    const upperWord = text.toUpperCase().replace(/['".,!?]/g, '');
    if (nameDb.firstNames.has(upperWord) && !nameDb.surnames.has(upperWord)) {
      return getRandomFirstName(text, category).toUpperCase();
    }
    return getRandomSurname(text).toUpperCase();
  }
  if (allCaps && !sentenceWords) return getRandomName(text, category).toUpperCase();
  return text;
}

// ─── Canonical JSON builder ─────────────────────────────────────────────────

function convertP3d(designId, options = {}) {
  // Find the p3d file across all source directories
  let p3dPath = null;
  let jsonDir = null;
  let mlDir = 'forevershining';
  for (const src of P3D_SOURCES) {
    const candidate = path.join(src.dir, `${designId}.p3d`);
    if (fs.existsSync(candidate)) {
      p3dPath = candidate;
      jsonDir = src.jsonDir;
      mlDir = src.mlDir;
      break;
    }
  }
  if (!p3dPath) {
    console.error(`P3D file not found for ${designId} in any source directory`);
    return null;
  }

  // 1. Decompress p3d
  const decompressed = decompressP3d(p3dPath);
  if (!decompressed) {
    console.error(`Failed to decompress: ${designId}`);
    return null;
  }

  // 2. Parse XML scene tree
  const p3d = parseP3dXml(decompressed.xml);
  const warnings = [];

  // 3. Read companion JSON for metadata
  const companionJson = readCompanionJson(designId, jsonDir);
  const productId = detectProductId(companionJson, p3d);
  const product = PRODUCT_MAP[productId] || PRODUCT_MAP['100'];

  // 4. Extract headstone info
  const headstoneShape = p3d.table?.shape || 'square';
  const headstoneWidthMm = p3d.table?.width || 690;
  const headstoneHeightMm = p3d.table?.height || 700;
  const headstoneDepthMm = p3d.table?.depth || 80;
  const headstoneTexture = mapTexture(p3d.table?.texture);

  // 5. Extract monument component dimensions
  const kerbWidthMm = p3d.kerb?.width || 1200;
  const kerbDepthMm = p3d.kerb?.depth || 2150;
  const kerbHeightMm = p3d.kerb?.height || 250;
  const kerbTexture = mapTexture(p3d.kerb?.texture);

  const lidWidthMm = p3d.lid?.width || 1000;
  const lidDepthMm = p3d.lid?.depth || 2050;
  const lidHeightMm = p3d.lid?.height || 50;
  const lidTexture = mapTexture(p3d.lid?.texture);

  const standWidthMm = p3d.stand?.width || 1200;
  const standDepthMm = p3d.stand?.depth || 250;
  const standHeightMm = p3d.stand?.height || 350;
  const standTexture = mapTexture(p3d.stand?.texture);

  if (!p3d.table) warnings.push('missing-headstone');
  if (!p3d.kerb) warnings.push('missing-kerb');
  if (!p3d.lid) warnings.push('missing-lid');
  if (!p3d.stand) warnings.push('missing-stand');

  // 6. Build companion JSON lookup maps (itemID → entry)
  const companionItems = Array.isArray(companionJson) ? companionJson : companionJson ? [companionJson] : [];
  const companionInscriptions = new Map(); // itemID → inscription item
  const companionMotifs = new Map(); // itemID → motif item
  for (const item of companionItems) {
    const id = item.itemID ?? item.id;
    if (id == null) continue;
    if (item.type === 'Inscription') companionInscriptions.set(id, item);
    else if (item.type === 'Motif' || item.type === 'Image' || item.type === 'Photo') companionMotifs.set(id, item);
  }

  // Determine product category for name anonymization
  const category = companionItems.find((i) => i.type === 'Headstone')?.name?.toLowerCase().includes('laser')
    ? 'laser' : 'traditional';

  // 7. Extract motifs and inscriptions from p3d + companion JSON
  const motifElements = [];
  const inscriptionElements = [];
  const assetList = [];
  const designAssetsDir = path.join(ASSETS_DIR, designId);

  if (p3d.motifs.length > 0 && decompressed.binarySection.length > 10) {
    fs.mkdirSync(designAssetsDir, { recursive: true });
  }

  for (let i = 0; i < p3d.motifs.length; i++) {
    const motif = p3d.motifs[i];
    const motifId = motif.id; // extraJson.id from p3d
    // Forevershining P3D regionPosition uses inverted axes: Y-down and X-left
    // (the 3D model faces the opposite direction). Negate both to convert
    // to canonical Y-up / X-right coordinates.
    const p3dSign = mlDir === 'forevershining' ? -1 : 1;
    const p3dPosition = {
      x_mm: round((motif.position?.x || 0) * p3dSign),
      y_mm: round((motif.position?.y || 0) * p3dSign),
    };

    // Determine surface from XML structure (will be set after loop)
    const isLidMotif = p3d.lidMotifIndices.includes(i);
    const surface = isLidMotif ? 'lid/top' : 'headstone/front';

    // Parse color
    let colorHex = '#FFFFFF';
    if (motif.color != null) {
      const colorInt = parseInt(motif.color, 10);
      if (!isNaN(colorInt)) {
        colorHex = '#' + colorInt.toString(16).padStart(6, '0').toUpperCase();
      }
    }

    // Check companion JSON for inscription text
    const companionInsc = motifId != null ? companionInscriptions.get(motifId) : null;
    if (companionInsc && companionInsc.label && companionInsc.label.trim()) {
      // This p3d motif is actually an inscription — extract as editable text
      const sanitized = sanitizeInscription(companionInsc.label, category);
      const fontFamily = companionInsc.font_family
        || (typeof companionInsc.font === 'string' ? companionInsc.font.replace(/^[\d.]+px\s*/, '') : '')
        || 'Arial';
      const fontSizeMm = companionInsc.font_size ? Number(companionInsc.font_size) : null;

      // Use p3d position if available, otherwise use companion JSON position.
      // Forevershining companion JSON uses Y-down convention; negate Y to convert
      // to our canonical Y-up coordinate system.
      let position = p3dPosition;
      if (position.x_mm === 0 && position.y_mm === 0 && (companionInsc.x || companionInsc.y)) {
        const ySign = mlDir === 'forevershining' ? -1 : 1;
        position = {
          x_mm: round(companionInsc.x || 0),
          y_mm: round((companionInsc.y || 0) * ySign),
        };
      }

      inscriptionElements.push({
        id: `insc-${motifId}`,
        text: sanitized,
        font: {
          family: fontFamily.trim() || 'Arial',
          ...(fontSizeMm ? { size_mm: round(fontSizeMm) } : {}),
          weight: 400,
        },
        position,
        rotation: { z_deg: round(motif.position?.rotation || 0) },
        color: companionInsc.color || colorHex,
        align: 'center',
        surface,
        layer: motif.layer || 0,
        height_mm: round(motif.height || fontSizeMm || 40),
      });

      // Still extract PNG as fallback thumbnail (but don't list as primary asset)
      if (motif.embedPointer && decompressed.binarySection.length > 0) {
        const pngData = extractPng(decompressed.binarySection, motif.embedPointer);
        if (pngData) {
          const filename = `motif-${i}.png`;
          fs.writeFileSync(path.join(designAssetsDir, filename), pngData);
        }
      }
      continue;
    }

    // Check companion JSON for motif SVG reference
    const companionMot = motifId != null ? companionMotifs.get(motifId) : null;
    let assetPath = null;
    let assetType = 'embedded-png';

    if (companionMot && companionMot.src) {
      // Map to SVG: companion has src like "butterfly_005" or "2_056_23"
      assetPath = companionMot.src;
      assetType = 'svg-motif';
    } else if (motif.src && motif.src.includes('.svg')) {
      // Fallback: p3d extra JSON has SVG path
      const svgMatch = motif.src.match(/([^/]+)\.svg$/);
      if (svgMatch) {
        assetPath = svgMatch[1];
        assetType = 'svg-motif';
      }
    }

    // Extract embedded PNG if available
    if (motif.embedPointer && decompressed.binarySection.length > 0) {
      const pngData = extractPng(decompressed.binarySection, motif.embedPointer);
      if (pngData) {
        const filename = `motif-${i}.png`;
        const pngPath = path.join(designAssetsDir, filename);
        fs.writeFileSync(pngPath, pngData);
        if (!assetPath) {
          assetPath = `/designs/p3d-assets/${designId}/${filename}`;
          assetType = 'embedded-png';
        }
      }
    }

    // Photos use placeholder image instead of the original (privacy)
    // Prefer companion dimensions for photos (P3D often stores at oversized resolution)
    let useCompanionSize = false;
    if (companionMot && companionMot.type === 'Photo') {
      assetPath = '/jpg/photos/vitreous-enamel-image.png';
      assetType = 'photo-placeholder';
      if (companionMot.width > 0 || companionMot.height > 0) {
        useCompanionSize = true;
      }
    }

    if (!assetPath) {
      assetPath = `p3d-motif-${designId}-${i}`;
      warnings.push(`motif-${i}-no-asset`);
    }

    // Use companion JSON position if p3d position is (0,0).
    // Forevershining companion JSON uses Y-down convention; negate Y.
    let position = p3dPosition;
    if (position.x_mm === 0 && position.y_mm === 0 && companionMot && (companionMot.x || companionMot.y)) {
      const ySign = mlDir === 'forevershining' ? -1 : 1;
      position = {
        x_mm: round(companionMot.x || 0),
        y_mm: round((companionMot.y || 0) * ySign),
      };
    }

    const motifEntry = {
      id: `motif-${motifId ?? i}`,
      asset: assetPath,
      assetType,
      position,
      width_mm: round(useCompanionSize ? (companionMot.width || motif.width || 100) : (motif.width || 100)),
      height_mm: round(useCompanionSize ? (companionMot.height || motif.height || 100) : (motif.height || 100)),
      rotation: { z_deg: round(motif.position?.rotation || 0) },
      color: (companionMot?.color) || colorHex,
      sandblasted: motif.sandblasted || false,
      alpha: motif.alpha ?? 1,
      layer: motif.layer || 0,
      surface,
      ...(companionMot?.flipx != null ? { flip: { x: Number(companionMot.flipx) === -1, y: Number(companionMot.flipy) === -1 } } : {}),
    };

    motifElements.push(motifEntry);

    if (assetType === 'svg-motif') {
      assetList.push({ id: assetPath, path: `/shapes/motifs/${assetPath}.svg` });
    } else if (assetType === 'embedded-png') {
      assetList.push({ id: assetPath, path: assetPath });
    }
  }

  // Universal motif size cap: ensure no motif exceeds headstone dimensions.
  // P3D can store motifs larger than the headstone (the haxe renderer clips them).
  if (headstoneWidthMm > 0 && headstoneHeightMm > 0) {
    for (const item of motifElements) {
      if (item.surface !== 'headstone/front') continue;
      const w = item.width_mm || 100;
      const h = item.height_mm || 100;
      if (w > headstoneWidthMm || h > headstoneHeightMm) {
        const scale = Math.min(headstoneWidthMm / w, headstoneHeightMm / h);
        item.width_mm = round(w * scale);
        item.height_mm = round(h * scale);
      }
    }
  }

  // Auto-layout headstone/front items:
  // 1. Items sharing the exact same (x,y) overlap — stack them vertically
  // 2. Items at (0,0) need distribution in available headstone space
  // The haxe p3d renderer used an internal layout system we don't have.
  const headstoneInscs = inscriptionElements.filter((m) => m.surface === 'headstone/front');
  const headstoneMotifItems = motifElements.filter((m) => m.surface === 'headstone/front');
  const allHeadstoneItems = [...headstoneInscs, ...headstoneMotifItems];

  if (allHeadstoneItems.length > 1) {
    const GAP_MM = 3;
    const MOTIF_GAP_MM = 5;

    // Group items by position (round to 5mm tolerance)
    const posKey = (item) => {
      const rx = Math.round(item.position.x_mm / 5) * 5;
      const ry = Math.round(item.position.y_mm / 5) * 5;
      return `${rx},${ry}`;
    };
    const groups = new Map();
    for (const item of allHeadstoneItems) {
      const key = posKey(item);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    }

    // Stack overlapping items within each position group
    for (const [key, items] of groups) {
      if (items.length <= 1) continue;

      // Sort by layer descending (highest layer = placed first/top)
      items.sort((a, b) => (b.layer || 0) - (a.layer || 0));

      const anchorY = items[0].position.y_mm;
      const totalHeight = items.reduce((sum, m) => sum + (m.height_mm || 20), 0)
        + (items.length - 1) * GAP_MM;

      // Stack from anchor position downward
      let currentY = anchorY + totalHeight / 2;
      for (const item of items) {
        const h = item.height_mm || 20;
        currentY -= h / 2;
        item.position.y_mm = round(currentY);
        currentY -= h / 2 + GAP_MM;
      }
    }

    // Handle unpositioned items at (0,0): distribute in available space
    const zeroGroup = groups.get('0,0');
    if (zeroGroup && zeroGroup.length > 0) {
      // Find the Y range already occupied by positioned items
      const positionedItems = allHeadstoneItems.filter(
        (m) => !(m.position.x_mm === 0 && m.position.y_mm === 0)
            && !zeroGroup.includes(m)
      );
      let occupiedMinY = Infinity, occupiedMaxY = -Infinity;
      for (const item of positionedItems) {
        const h = (item.height_mm || 20) / 2;
        occupiedMinY = Math.min(occupiedMinY, item.position.y_mm - h);
        occupiedMaxY = Math.max(occupiedMaxY, item.position.y_mm + h);
      }

      // Separate text (inscriptions) from decorative motifs
      const zeroText = zeroGroup.filter((m) => m.text != null || (m.layer || 0) >= 9000);
      const zeroDeco = zeroGroup.filter((m) => m.text == null && (m.layer || 0) < 9000);

      // Place text items relative to positioned text (if any) or in upper portion
      if (zeroText.length > 0) {
        zeroText.sort((a, b) => (b.layer || 0) - (a.layer || 0));

        if (occupiedMaxY > -Infinity) {
          // Positioned text exists: memorial phrases go ABOVE, names go BELOW
          const memorialPattern = /^(IN\s+(LOVING\s+)?MEMORY|REST\s+IN\s+PEACE|FOREVER\s+IN\s+OUR|GONE\s+BUT\s+NOT|ALWAYS\s+REMEMBERED|BELOVED|CHERISHED|DEARLY\s+LOVED|IN\s+REMEMBRANCE)/i;
          const above = [];
          const below = [];
          for (const item of zeroText) {
            if (memorialPattern.test((item.text || '').trim())) {
              above.push(item);
            } else {
              below.push(item);
            }
          }
          // Stack above items upward from positioned reference
          let curY = occupiedMaxY + GAP_MM * 2;
          for (const item of above) {
            const h = item.height_mm || 20;
            curY += h / 2;
            item.position.y_mm = round(curY);
            curY += h / 2 + GAP_MM;
          }
          // Stack below items downward from positioned reference
          curY = occupiedMinY - GAP_MM * 2;
          for (const item of below) {
            const h = item.height_mm || 20;
            curY -= h / 2;
            item.position.y_mm = round(curY);
            curY -= h / 2 + GAP_MM;
          }
        } else {
          // No positioned reference — stack from upper portion downward
          const textTotalH = zeroText.reduce((s, m) => s + (m.height_mm || 20), 0)
            + (zeroText.length - 1) * GAP_MM;
          let startY = headstoneHeightMm * 0.15 + textTotalH / 2;
          let curY = startY;
          for (const item of zeroText) {
            const h = item.height_mm || 20;
            curY -= h / 2;
            item.position.y_mm = round(curY);
            curY -= h / 2 + GAP_MM;
          }
        }
      }

      // Place decorative motifs BELOW text inscriptions using a flow layout.
      // In the original designs, decorative motifs cluster in the lower portion
      // of the headstone while text occupies the upper/center area.
      if (zeroDeco.length > 0) {
        zeroDeco.sort((a, b) => (b.layer || 0) - (a.layer || 0));

        // Cap individual motif sizes before layout (P3D stores motifs at
        // full/unconstrained size; on the actual headstone they're much smaller)
        const maxMotifH = headstoneHeightMm * 0.10;
        const maxMotifW = headstoneWidthMm * 0.35;
        for (const item of zeroDeco) {
          const h = item.height_mm || 40;
          const w = item.width_mm || 60;
          if (h > maxMotifH || w > maxMotifW) {
            const s = Math.min(maxMotifH / h, maxMotifW / w);
            item.height_mm = round(h * s);
            item.width_mm = round(w * s);
          }
        }

        // Compute deco zone: start just below the lowest inscription edge
        let lowestInscriptionY = Infinity;
        for (const item of allHeadstoneItems) {
          if (item.text != null) {
            const h = (item.height_mm || 20) / 2;
            lowestInscriptionY = Math.min(lowestInscriptionY, item.position.y_mm - h);
          }
        }
        for (const item of zeroText) {
          const h = (item.height_mm || 20) / 2;
          lowestInscriptionY = Math.min(lowestInscriptionY, item.position.y_mm - h);
        }
        if (!isFinite(lowestInscriptionY)) lowestInscriptionY = 0;

        const topOfDeco = lowestInscriptionY - MOTIF_GAP_MM * 3;
        const bottomY = -headstoneHeightMm * 0.47;
        const availableHeight = Math.max(topOfDeco - bottomY, 100);
        const usableWidth = headstoneWidthMm * 0.88;

        // Further scale if capped motifs still don't fit the available area
        const totalMotifHeight = zeroDeco.reduce((s, m) => s + (m.height_mm || 40), 0);
        const avgItemsPerRow = Math.max(2, Math.min(5, Math.ceil(zeroDeco.length / 3)));
        const estRows = Math.ceil(zeroDeco.length / avgItemsPerRow);
        const avgRowHeight = totalMotifHeight / estRows;
        const rowGapY = MOTIF_GAP_MM * 2;
        const estTotalRowsH = estRows * avgRowHeight + (estRows - 1) * rowGapY;

        if (estTotalRowsH > availableHeight * 0.95) {
          const scale = Math.max(0.4, (availableHeight * 0.95) / estTotalRowsH);
          for (const item of zeroDeco) {
            item.height_mm = round((item.height_mm || 40) * scale);
            item.width_mm = round((item.width_mm || 60) * scale);
          }
        }

        // Flow layout: place motifs in rows, wrapping when row width is exceeded
        let rowY = topOfDeco;
        let rowItems = [];
        let rowWidth = 0;
        let rowMaxH = 0;
        const itemGapX = MOTIF_GAP_MM * 2;

        function flushRow() {
          if (rowItems.length === 0) return;
          const startX = -rowWidth / 2;
          let x = startX;
          for (const { item, w, h } of rowItems) {
            item.position.x_mm = round(x + w / 2);
            item.position.y_mm = round(rowY - rowMaxH / 2);
            x += w + itemGapX;
          }
          rowY -= rowMaxH + rowGapY;
          rowItems = [];
          rowWidth = 0;
          rowMaxH = 0;
        }

        for (const item of zeroDeco) {
          const w = item.width_mm || 60;
          const h = item.height_mm || 40;
          const neededWidth = rowWidth + w + (rowItems.length > 0 ? itemGapX : 0);

          if (neededWidth > usableWidth && rowItems.length > 0) {
            flushRow();
          }
          rowItems.push({ item, w, h });
          rowWidth += w + (rowItems.length > 1 ? itemGapX : 0);
          rowMaxH = Math.max(rowMaxH, h);
        }
        flushRow();
      }

      warnings.push('auto-stacked-positions');
    }
  }

  // 7. Build canonical JSON
  const canonical = {
    version: VERSION,
    generatedAt: new Date().toISOString(),
    units: 'mm',
    source: {
      id: designId,
      mlDir: mlDir,
      legacyFile: `/ml/${mlDir}/saved-designs/p3d/${designId}.p3d`,
      savedAt: new Date(Number(designId)).toISOString(),
      format: 'p3d',
    },
    product: {
      id: productId,
      name: product.name,
      type: product.type,
      slug: product.slug,
      shape: headstoneShape,
    },
    scene: {
      coordinateSystem: {
        positionMode: 'p3d-mm-center',
        coordinateSpace: 'headstone-center-mm',
        headstonePlacement: 'auto-center',
      },
    },
    components: {
      headstone: {
        width_mm: headstoneWidthMm,
        height_mm: headstoneHeightMm,
        thickness_mm: headstoneDepthMm,
        shape: headstoneShape,
        texture: headstoneTexture,
      },
      base: {
        width_mm: standWidthMm,
        height_mm: standHeightMm,
        depth_mm: standDepthMm,
        texture: standTexture,
      },
      ledger: {
        width_mm: lidWidthMm,
        height_mm: lidHeightMm,
        depth_mm: lidDepthMm,
        texture: lidTexture,
      },
      kerb: {
        width_mm: kerbWidthMm,
        height_mm: kerbHeightMm,
        depth_mm: kerbDepthMm,
        texture: kerbTexture,
      },
    },
    elements: {
      inscriptions: inscriptionElements.map(({ layer, height_mm, ...rest }) => rest),
      motifs: motifElements,
      photos: [],
      logos: [],
      additions: [],
    },
    assets: {
      motifs: assetList,
    },
    monument: {
      type: p3d.monumentType || 'tomb_006',
    },
    migration: {
      pipeline: 'p3d-to-canonical3d',
      converter: 'convert-p3d-design.js',
      converterVersion: VERSION,
      sourceFormat: 'p3d',
      motifCount: p3d.motifs.length,
      inscriptionCount: inscriptionElements.length,
      svgMotifCount: motifElements.filter((m) => m.assetType === 'svg-motif').length,
      pngMotifCount: motifElements.filter((m) => m.assetType === 'embedded-png').length,
      warnings,
      confidence: warnings.length === 0 ? 'high' : warnings.length <= 2 ? 'medium' : 'low',
      migratedAt: new Date().toISOString(),
    },
    legacy: {
      p3dFile: `/ml/${mlDir}/saved-designs/p3d/${designId}.p3d`,
      companionJson: companionJson || null,
    },
  };

  // 8. Write output
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, `${designId}.json`);
  fs.writeFileSync(outPath, JSON.stringify(canonical, null, 2));

  return { outPath, warnings, motifCount: p3d.motifs.length, shape: headstoneShape };
}

// ─── Main ───────────────────────────────────────────────────────────────────

function main() {
  const args = process.argv.slice(2);

  let designIds;
  if (args.length > 0) {
    designIds = args;
  } else {
    // Collect p3d files from all source directories
    designIds = [];
    const seen = new Set();
    for (const src of P3D_SOURCES) {
      if (!fs.existsSync(src.dir)) continue;
      for (const f of fs.readdirSync(src.dir)) {
        if (!f.endsWith('.p3d')) continue;
        const id = f.replace('.p3d', '');
        if (!seen.has(id)) {
          seen.add(id);
          designIds.push(id);
        }
      }
    }
    if (designIds.length === 0) {
      console.error('No p3d files found in any source directory');
      process.exit(1);
    }
  }

  console.log(`Converting ${designIds.length} p3d design(s)...\n`);

  let success = 0;
  let failed = 0;
  const shapes = {};
  const allWarnings = [];

  for (const id of designIds) {
    const result = convertP3d(id);
    if (result) {
      success++;
      shapes[result.shape] = (shapes[result.shape] || 0) + 1;
      if (result.warnings.length) {
        allWarnings.push({ id, warnings: result.warnings });
      }
      if (!args.length) {
        // Batch mode: show progress every 50
        if (success % 50 === 0) process.stdout.write(`  ${success} done...\n`);
      } else {
        console.log(`✓ ${id}: shape=${result.shape}, motifs=${result.motifCount}, warnings=${result.warnings.length}`);
      }
    } else {
      failed++;
      console.error(`✗ ${id}: FAILED`);
    }
  }

  console.log(`\n─── Summary ───`);
  console.log(`Success: ${success}, Failed: ${failed}, Total: ${designIds.length}`);
  console.log(`Output: ${OUT_DIR}`);
  console.log(`\nShapes:`);
  for (const [shape, count] of Object.entries(shapes).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${shape}: ${count}`);
  }
  if (allWarnings.length) {
    console.log(`\nDesigns with warnings: ${allWarnings.length}`);
    for (const { id, warnings } of allWarnings.slice(0, 10)) {
      console.log(`  ${id}: ${warnings.join(', ')}`);
    }
    if (allWarnings.length > 10) console.log(`  ... and ${allWarnings.length - 10} more`);
  }
}

main();
