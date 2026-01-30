#!/usr/bin/env node
/*
 * Convert legacy saved-design JSON files (ML exports) into the canonical v2026 format.
 *
 * Usage:
 *   node scripts/convert-legacy-design.js <designId> [--mlDir=headstonesdesigner] [--version=v2026] [--spec=2026.01]
 *
 * If the original ML JSON is not available, the script will fall back to the
 * `legacy.raw` payload stored inside the existing canonical JSON file.
 */

const fs = require('fs');
const path = require('path');
const { sanitizeInscription } = require('./utils/inscription-sanitizer');

const DEFAULT_FOLDER_VERSION = 'v2026';
const DEFAULT_SPEC_VERSION = '2026.01';
const DEFAULT_ML_DIR = 'headstonesdesigner';

function parseArgs(argv) {
  const args = {
    designId: null,
    mlDir: DEFAULT_ML_DIR,
    folderVersion: DEFAULT_FOLDER_VERSION,
    specVersion: DEFAULT_SPEC_VERSION,
    optimizeLayout: false,
  };
  for (const token of argv) {
    if (!args.designId) {
      args.designId = token;
      continue;
    }
    if (token.startsWith('--mlDir=')) {
      args.mlDir = token.split('=')[1] || args.mlDir;
    } else if (token.startsWith('--version=')) {
      args.folderVersion = token.split('=')[1] || args.folderVersion;
    } else if (token.startsWith('--spec=')) {
      args.specVersion = token.split('=')[1] || args.specVersion;
    } else if (token === '--optimize-layout') {
      args.optimizeLayout = true;
    }
  }
  return args;
}

function loadLegacyData({ designId, mlDir }, canonicalPath) {
  const legacyPath = path.join(process.cwd(), 'public', 'ml', mlDir, 'saved-designs', 'json', `${designId}.json`);
  if (fs.existsSync(legacyPath)) {
    return JSON.parse(fs.readFileSync(legacyPath, 'utf8'));
  }

  throw new Error(`Unable to locate legacy data for design ${designId}. Tried ${legacyPath}`);
}

function normalizeDpr(rawDpr = 1, device = 'desktop') {
  if (device === 'desktop') {
    return rawDpr || 1;
  }
  const standards = [1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4];
  return standards.reduce(
    (closest, candidate) => (Math.abs(candidate - rawDpr) < Math.abs(closest - rawDpr) ? candidate : closest),
    standards[0],
  );
}

function detectPhysicalCoordinates(legacyData, initW, initH) {
  if (!initW || !initH) return false;
  const marginX = initW / 2 + Math.max(60, initW * 0.05);
  const marginY = initH / 2 + Math.max(60, initH * 0.05);
  let exceedCount = 0;
  let sampleCount = 0;

  for (const item of legacyData) {
    if (!item || (item.type !== 'Inscription' && item.type !== 'Motif')) continue;
    sampleCount += 1;
    const rawX = item.x ?? item.cx ?? 0;
    const rawY = item.y ?? item.cy ?? 0;
    const beyondX = Math.abs(rawX) > marginX;
    const beyondY = Math.abs(rawY) > marginY;
    if (beyondX || beyondY) {
      exceedCount += 1;
    }
  }

  if (!sampleCount) return false;
  const exceedThreshold = Math.max(5, Math.ceil(sampleCount * 0.4));
  return exceedCount >= exceedThreshold;
}

function computeMetrics(legacyData) {
  const headstone = legacyData.find((item) => item.type === 'Headstone') || {};
  const base = legacyData.find((item) => item.type === 'Base') || {};

  const headstoneWidth = headstone.width || 600;
  const baseWidth = base.width || 0;
  const headstoneHeight = headstone.height || 400;
  const baseHeight = base.height || 0;
  const stageHeight = headstoneHeight + baseHeight;

  const productWidth = Math.max(headstoneWidth, baseWidth, 1);
  const productHeight = headstoneHeight;

  const navMatch = typeof headstone.navigator === 'string' ? headstone.navigator.match(/(\d+)x(\d+)/i) : null;
  const viewportWidth = navMatch ? parseInt(navMatch[1], 10) : Math.round(headstone.init_width || 1000);
  const viewportHeight = navMatch ? parseInt(navMatch[2], 10) : Math.round(headstone.init_height || 600);

  const rawDpr = headstone.dpr || 1;
  const designDpr = normalizeDpr(rawDpr, headstone.device || 'desktop');

  const designCanvasWidth = headstone.init_width || viewportWidth;
  const designCanvasHeight = headstone.init_height || viewportHeight;

  const pixelsPerMmX = designCanvasWidth / Math.max(productWidth, 1);
  const pixelsPerMmY = designCanvasHeight / Math.max(productHeight, 1);
  const stagePixelsPerMmY = designCanvasHeight / Math.max(stageHeight || productHeight, 1);

  return {
    productWidth,
    productHeight,
    headstoneHeight,
    baseHeight,
    stageHeight,
    stagePixelsPerMmY,
    viewportWidth: designCanvasWidth,
    viewportHeight: designCanvasHeight,
    designDpr,
    pixelsPerMmX,
    pixelsPerMmY,
    canvasWidthPx: designCanvasWidth,
    canvasHeightPx: designCanvasHeight,
    usesPhysicalCoords: detectPhysicalCoordinates(legacyData, designCanvasWidth, designCanvasHeight),
  };
}

function round(value) {
  return Math.round(value * 1000) / 1000;
}

function parseFontPixelValue(item) {
  if (typeof item.font === 'string') {
    const match = item.font.match(/([\d.]+)px/i);
    if (match) return parseFloat(match[1]);
  }
  if (typeof item.font_size === 'number') return item.font_size;
  return 30;
}

function buildSanitizedLookup(existingCanonical) {
  const map = new Map();
  if (!existingCanonical?.elements?.inscriptions) return map;
  for (const inscription of existingCanonical.elements.inscriptions) {
    if (inscription?.originalText && inscription?.text && inscription.originalText !== inscription.text) {
      map.set(inscription.originalText, inscription.text);
    }
  }
  return map;
}

function sanitizeText(originalText, lookup, category) {
  if (!originalText) return '';
  if (lookup.has(originalText)) {
    return lookup.get(originalText);
  }
  return sanitizeInscription(originalText, category);
}

function legacyYToCanonical(yPx = 0, targetSurface, metrics, options = {}) {
  const { negate = false } = options;
  const pixelsPerMm = metrics.pixelsPerMmY || 1;
  const mm = yPx / pixelsPerMm;
  return negate ? -mm : mm;
}

function computeCanvasInfo(legacyData, metrics) {
  const headstone = legacyData.find((item) => item.type === 'Headstone') || {};
  const base = legacyData.find((item) => item.type === 'Base') || {};

  const navigatorStr = headstone.navigator;
  let navW;
  let navH;
  if (typeof navigatorStr === 'string') {
    const match = navigatorStr.match(/(\d+)x(\d+)/i);
    if (match) {
      navW = parseInt(match[1], 10);
      navH = parseInt(match[2], 10);
    }
  }

  const initW = headstone.init_width || navW || metrics.canvasWidthPx || 800;
  const initH = headstone.init_height || navH || metrics.canvasHeightPx || 600;
  const rawDpr = headstone.dpr || 1;
  const device = headstone.device || 'desktop';
  const designDpr = normalizeDpr(rawDpr, device);
  const usesPhysicalCoords = detectPhysicalCoordinates(legacyData, initW, initH);

  const headstoneWidthMm = headstone.width || metrics.productWidth || 600;
  const headstoneHeightMm = headstone.height || metrics.productHeight || 400;
  const baseWidthMm = base.width || headstoneWidthMm;
  const baseHeightMm = base.height || metrics.baseHeight || 100;

  const fallbackPxPerMmX = metrics.pixelsPerMmX || (initW / Math.max(headstoneWidthMm, 1));
  const fallbackPxPerMmY = metrics.pixelsPerMmY || (initH / Math.max(headstoneHeightMm, 1));

  const mmPerPxXHeadstone = headstoneWidthMm && initW ? headstoneWidthMm / initW : 1 / fallbackPxPerMmX;
  
  // CRITICAL: Legacy getRatio() uses TOTAL canvas height when base exists
  // Calculate base canvas height and total mm-per-px ratio
  const pxPerMmY = headstoneHeightMm && initH ? initH / headstoneHeightMm : fallbackPxPerMmY;
  const baseCanvasHeightPx = baseHeightMm * pxPerMmY;
  const totalCanvasHeightPx = initH + baseCanvasHeightPx;
  const totalHeightMm = headstoneHeightMm + baseHeightMm;
  const mmPerPxYHeadstone = totalHeightMm / totalCanvasHeightPx;
  
  const mmPerPxXBase = baseWidthMm && initW ? baseWidthMm / initW : mmPerPxXHeadstone;
  const mmPerPxYBase = mmPerPxYHeadstone; // Use same total ratio for base

  return {
    initW,
    initH,
    designDpr,
    usesPhysicalCoords,
    mmPerPxXHeadstone,
    mmPerPxYHeadstone,
    mmPerPxXBase,
    mmPerPxYBase,
  };
}

function convertInscriptions(legacyData, metrics, canvasInfo, sanitizedLookup, options = {}, category = '') {
  const { optimizeLayout = false } = options;
  const inscriptions = legacyData.filter((item) => item.type === 'Inscription' && item.label);
  
  let counter = 1;
  return inscriptions.map((item) => {
    const fontPx = parseFontPixelValue(item);
    const targetSurface = item.part?.toLowerCase() === 'base' ? 'base/front' : 'headstone/front';
    const surfaceIsBase = targetSurface.startsWith('base');

    const rawX = item.x || 0;
    const rawY = item.y || 0;
    const canvasX = canvasInfo.usesPhysicalCoords ? rawX / canvasInfo.designDpr : rawX;
    const canvasY = canvasInfo.usesPhysicalCoords ? rawY / canvasInfo.designDpr : rawY;

    const mmPerPxX = surfaceIsBase ? canvasInfo.mmPerPxXBase || 1 : canvasInfo.mmPerPxXHeadstone || 1;
    const mmPerPxY = surfaceIsBase ? canvasInfo.mmPerPxYBase || 1 : canvasInfo.mmPerPxYHeadstone || 1;

    const stageXMm = round(canvasX * mmPerPxX);
    const stageYMm = round(-canvasY * mmPerPxY);
    let xMm = stageXMm;
    let yMm = stageYMm;

    // CRITICAL: Use original font_size (in mm) when available, not calculated from pixels
    // The font_size field contains the ACTUAL physical size that should be preserved
    let sizeMm = item.font_size || 10;
    if (!item.font_size || item.font_size <= 0) {
      // Fallback: calculate from canvas pixels only if font_size is missing
      const canvasFontPx = canvasInfo.usesPhysicalCoords ? fontPx / canvasInfo.designDpr : fontPx;
      sizeMm = round(canvasFontPx * mmPerPxY);
    }
    sizeMm = Math.max(1, sizeMm);

    if (optimizeLayout) {
      // Apply intelligent sizing based on text size hierarchy
      if (sizeMm > 80) {
        sizeMm = Math.min(90, sizeMm * 1.0);
      } else if (sizeMm >= 30) {
        sizeMm = Math.round(sizeMm * 0.7);
      } else if (sizeMm >= 20) {
        sizeMm = Math.round(sizeMm * 0.95);
      } else {
        sizeMm = Math.max(18, Math.round(sizeMm * 1.1));
      }
    }

    const originalText = item.label || '';
    const sanitized = sanitizeText(originalText, sanitizedLookup, category);

    if (optimizeLayout) {
      // Move person info blocks horizontally toward center (±100mm instead of ±150mm+)
      if (Math.abs(xMm) > 120 && Math.abs(yMm) < 100) {
        const sign = xMm < 0 ? -1 : 1;
        xMm = sign * 100;
      }
      
      // Compress vertical spacing for person info blocks (move UP significantly)
      if (yMm < -20 && yMm > -200 && Math.abs(xMm) > 80) {
        yMm = yMm + 130;
      }
    }

    const stageXMmFinal = xMm;
    const stageYMmFinal = yMm;
    const xPxFinal = mmPerPxX ? round(stageXMmFinal / mmPerPxX) : round(canvasX);
    const yPxFinal = mmPerPxY ? round(-stageYMmFinal / mmPerPxY) : round(canvasY);
    const sizePxFinal = mmPerPxY ? round(sizeMm / mmPerPxY) : round(canvasFontPx);

    return {
      id: `insc-${counter++}`,
      text: sanitized,
      font: {
        family: item.font_family || item.font?.replace(/[\d.]+px\s*/i, '')?.trim() || 'Garamond',
        size_mm: Math.max(1, sizeMm),        // CRITICAL: Store mm for 3D loader
        size_px: Math.max(1, sizePxFinal),   // Keep px for legacy fallback
        weight: 400,
      },
      position: {
        x_px: xPxFinal,
        y_px: yPxFinal,
      },
      rotation: {
        z_deg: item.rotation || 0,
      },
      color: item.color || '#000000',
      align: item.align || 'center',
      surface: targetSurface,
    };
  });
}

function convertMotifs(legacyData, metrics, canvasInfo, options = {}) {
  const { optimizeLayout = false } = options;
  const motifs = legacyData.filter((item) => item.type === 'Motif' && (item.src || item.item));
  
  let counter = 1;
  return motifs.map((motif) => {
    const id = motif.itemID ? `motif-${motif.itemID}` : `motif-${counter++}`;
    const asset = (motif.src || motif.item || `motif-${counter}`).trim();
    const surface = motif.part?.toLowerCase() === 'base' ? 'base/front' : 'headstone/front';
    const surfaceIsBase = surface.startsWith('base');

    const rawX = motif.x || 0;
    const rawY = motif.y || 0;
    const canvasX = canvasInfo.usesPhysicalCoords ? rawX / canvasInfo.designDpr : rawX;
    const canvasY = canvasInfo.usesPhysicalCoords ? rawY / canvasInfo.designDpr : rawY;

    const mmPerPxX = surfaceIsBase ? canvasInfo.mmPerPxXBase || 1 : canvasInfo.mmPerPxXHeadstone || 1;
    const mmPerPxY = surfaceIsBase ? canvasInfo.mmPerPxYBase || 1 : canvasInfo.mmPerPxYHeadstone || 1;

    const stageXMm = round(canvasX * mmPerPxX);
    const stageYMm = round(-canvasY * mmPerPxY);
    let xMm = stageXMm;
    let yMm = stageYMm;
    
    let heightMm = 100;
    
    // CRITICAL: Use 'height' when available (it's the actual display size in canvas pixels)
    // The 'ratio' parameter appears to be aspect ratio or scaling metadata, not the primary size
    // Priority: height first, then fall back to ratio calculation
    
    if (typeof motif.height === 'number' && motif.height > 0) {
      // Convert canvas height pixels to mm
      const canvasHeight = canvasInfo.usesPhysicalCoords ? motif.height / canvasInfo.designDpr : motif.height;
      heightMm = round(canvasHeight * mmPerPxY);
    } else if (typeof motif.ratio === 'number' && motif.ratio > 0) {
      // Fallback: use ratio as scale factor (legacy used 100px * ratio)
      const basePx = 100;
      const canvasHeight = basePx * motif.ratio;
      const logicalHeight = canvasInfo.usesPhysicalCoords ? canvasHeight / canvasInfo.designDpr : canvasHeight;
      heightMm = round(logicalHeight * mmPerPxY);
    }

    let heightClamped = Math.max(20, Math.min(800, heightMm));
    
    if (optimizeLayout) {
      // Apply intelligent sizing based on motif size and position
      if (heightClamped > 120) {
        heightClamped = Math.min(140, Math.round(heightClamped * 0.85));
      } else if (heightClamped >= 60) {
        heightClamped = Math.round(heightClamped * 0.65);
      } else if (heightClamped >= 30) {
        heightClamped = Math.round(heightClamped * 0.8);
      } else {
        heightClamped = Math.max(30, heightClamped);
      }
      
      // Adjust positions for better visual balance
      if (Math.abs(xMm) < 50 && heightClamped > 100) {
        yMm = yMm + 100;
      }
      
      if (yMm < -250) {
        yMm = yMm + 100;
      }
    }

    const stageXMmFinal = xMm;
    const stageYMmFinal = yMm;
    const xPxFinal = mmPerPxX ? round(stageXMmFinal / mmPerPxX) : round(canvasX);
    const yPxFinal = mmPerPxY ? round(-stageYMmFinal / mmPerPxY) : round(canvasY);
    const heightPxFinal = mmPerPxY ? round(heightClamped / mmPerPxY) : Math.max(20, round(heightMm));

    const flipX = motif.flipx === 1 || motif.flipx === true;
    const flipY = motif.flipy === 1 || motif.flipy === true;
    
    return {
      id,
      asset,
      position: {
        x_px: xPxFinal,
        y_px: yPxFinal,
      },
      height_mm: Math.max(1, heightClamped),  // CRITICAL: Store mm for 3D loader
      height_px: Math.max(1, heightPxFinal),  // Keep px for legacy fallback
      rotation: {
        z_deg: motif.rotation || 0,
      },
      color: motif.color || '#000000',
      flip: {
        x: flipX,
        y: flipY,
      },
      surface,
    };
  });
}

function mapTexture(texturePath) {
  if (!texturePath || typeof texturePath !== 'string') return null;
  
  // Mapping from old numbered texture paths to new named material files
  const textureMapping = {
    'forever2/l/17.jpg': 'Glory-Black-1.webp',
    'forever2/l/18.jpg': 'Glory-Gold-Spots.webp',
  };
  
  // Try to match the texture path with our mapping
  for (const [oldPath, newImage] of Object.entries(textureMapping)) {
    if (texturePath.includes(oldPath)) {
      return `/textures/forever/l/${newImage}`;
    }
  }
  
  // Fallback: extract filename and convert extension
  const file = texturePath.split(/[\\/]/).pop();
  if (!file) return null;
  return `/textures/forever/l/${file.replace(/\.(jpg|jpeg)$/i, '.webp')}`;
}

function buildComponents(legacyData, existingCanonical) {
  const components = { ...(existingCanonical?.components || {}) };
  const headstone = legacyData.find((item) => item.type === 'Headstone');
  if (headstone) {
    components.headstone = {
      width_mm: headstone.width || components.headstone?.width_mm || 600,
      height_mm: headstone.height || components.headstone?.height_mm || 400,
      thickness_mm: headstone._length || components.headstone?.thickness_mm || 80,
      surface: 'front',
      texture: mapTexture(headstone.texture) || components.headstone?.texture || null,
    };
  }

  const base = legacyData.find((item) => item.type === 'Base');
  if (base) {
    components.base = {
      width_mm: base.width || components.base?.width_mm || 600,
      height_mm: base.height || components.base?.height_mm || 100,
      depth_mm: base._length || components.base?.depth_mm || 200,
      texture: mapTexture(base.texture) || components.base?.texture || null,
    };
  } else if (components.base) {
    delete components.base;
  }

  return components;
}

function buildScene(metrics) {
  return {
    canvas: {
      width_mm: metrics.productWidth,
      height_mm: metrics.productHeight,
    },
    viewportPx: {
      width: metrics.viewportWidth,
      height: metrics.viewportHeight,
      dpr: metrics.designDpr,
    },
    surface: {
      origin: [0, 0, 0],
      normal: [0, 0, 1],
    },
  };
}

function buildAssets(motifs) {
  const seen = new Set();
  const motifAssets = [];
  for (const motif of motifs) {
    if (!motif.asset || seen.has(motif.asset)) continue;
    seen.add(motif.asset);
    motifAssets.push({ id: motif.asset, path: `/shapes/motifs/${motif.asset}.svg` });
  }
  return { motifs: motifAssets };
}

function buildDefaultCanonical(designId, mlDir, legacyData, components, scene, specVersion) {
  const headstone = legacyData.find((item) => item.type === 'Headstone') || {};
  return {
    version: specVersion,
    generatedAt: new Date().toISOString(),
    units: 'mm',
    source: {
      id: designId,
      slug: designId,
      mlDir,
      legacyFile: `/ml/${mlDir}/saved-designs/json/${designId}.json`,
      savedAt: new Date().toISOString(),
    },
    product: {
      id: String(headstone.productid || 'unknown'),
      name: headstone.name || 'Unknown Product',
      type: 'headstone',
      slug: 'headstone',
      category: 'unknown',
      title: headstone.name || 'Headstone',
      shape: headstone.shape || 'Unknown',
      material: {
        name: headstone.texture || 'unknown',
        texture: components.headstone?.texture || null,
      },
    },
    scene,
    components,
    elements: {
      inscriptions: [],
      motifs: [],
      photos: [],
      logos: [],
      additions: [],
    },
    assets: {
      motifs: [],
    },
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.designId) {
    console.error('Usage: node scripts/convert-legacy-design.js <designId> [--mlDir=dir] [--version=v2026] [--spec=2026.01]');
    process.exit(1);
  }

  const canonicalDir = path.join(process.cwd(), 'public', 'canonical-designs', args.folderVersion);
  fs.mkdirSync(canonicalDir, { recursive: true });
  const canonicalPath = path.join(canonicalDir, `${args.designId}.json`);

  const legacyData = loadLegacyData(args, canonicalPath);
  const metrics = computeMetrics(legacyData);
  const canvasInfo = computeCanvasInfo(legacyData, metrics);

  const existingCanonical = fs.existsSync(canonicalPath)
    ? JSON.parse(fs.readFileSync(canonicalPath, 'utf8'))
    : null;

  const sanitizedLookup = buildSanitizedLookup(existingCanonical);
  const legacyCategory = legacyData.find((item) => typeof item?.category === 'string')?.category;
  const productCategory = existingCanonical?.product?.category || legacyCategory || '';
  const inscriptions = convertInscriptions(legacyData, metrics, canvasInfo, sanitizedLookup, {
    optimizeLayout: args.optimizeLayout,
  }, productCategory);
  const motifs = convertMotifs(legacyData, metrics, canvasInfo, {
    optimizeLayout: args.optimizeLayout,
  });
  const components = buildComponents(legacyData, existingCanonical);
  const scene = buildScene(metrics);
  const assets = buildAssets(motifs);

  const canonical = existingCanonical
    ? { ...existingCanonical }
    : buildDefaultCanonical(args.designId, args.mlDir, legacyData, components, scene, args.specVersion);
  delete canonical.legacy;

  const previousElements = canonical.elements || {};

  canonical.version = args.specVersion;
  canonical.generatedAt = new Date().toISOString();
  canonical.scene = scene;
  canonical.components = components;
  canonical.elements = {
    inscriptions,
    motifs,
    photos: previousElements.photos || [],
    logos: previousElements.logos || [],
    additions: previousElements.additions || [],
  };
  canonical.assets = assets;

  fs.writeFileSync(canonicalPath, JSON.stringify(canonical, null, 2));
  console.log(`✅ Converted legacy design ${args.designId} → ${canonicalPath}`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error('❌ Conversion failed:', error.message || error);
    process.exit(1);
  }
}
