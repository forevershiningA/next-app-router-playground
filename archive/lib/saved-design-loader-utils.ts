/**
 * Utility functions for loading saved designs into the DYO tool
 */

import { createRef } from 'react';
import { useHeadstoneStore } from '#/lib/headstone-store';
import type { SavedDesignData } from '#/components/SavedDesignLoader';
import type { Line } from '#/lib/headstone-store';
import type { Group } from 'three';

export interface LoadDesignOptions {
  clearExisting?: boolean; // Whether to clear existing inscriptions first
  autoSave?: boolean; // Whether to auto-save after loading
}

export type CanonicalDesignData = {
  version?: string;
  generatedAt?: string;
  product?: {
    id?: string | number;
    name?: string;
    type?: string;
    slug?: string;
    category?: string;
    shape?: string;
  };
  components?: {
    headstone?: {
      width_mm?: number;
      height_mm?: number;
      thickness_mm?: number;
      texture?: string;
    };
    base?: {
      width_mm?: number;
      height_mm?: number;
      depth_mm?: number;
      texture?: string;
    };
  };
  scene?: {
    canvas?: { width_mm?: number; height_mm?: number };
    viewportPx?: { width?: number; height?: number; dpr?: number };
  };
  source?: {
    id?: string;
    slug?: string;
    mlDir?: string;
    legacyFile?: string;
    savedAt?: string;
  };
  elements?: {
    inscriptions?: Array<{
      id?: string;
      text?: string;
      font?: { family?: string; size_mm?: number; size_px?: number };
      position?: { x_mm?: number; y_mm?: number; x_px?: number; y_px?: number };
      rotation?: { z_deg?: number };
      color?: string;
      surface?: string;
    }>;
    motifs?: Array<{
      id?: string;
      asset?: string;
      position?: { x_mm?: number; y_mm?: number; x_px?: number; y_px?: number };
      height_mm?: number;
      height_px?: number;
      rotation?: { z_deg?: number };
      color?: string;
      surface?: string;
    }>;
  };
  assets?: {
    motifs?: Array<{ id: string; path: string }>;
  };
};

const MIN_CANONICAL_INSCRIPTION_SIZE = 5;
const MAX_CANONICAL_INSCRIPTION_SIZE = 1200;
const MIN_CANONICAL_ROTATION = -45;
const MAX_CANONICAL_ROTATION = 45;
const DEFAULT_CANONICAL_FONT = 'Garamond';
const DEFAULT_CANONICAL_COLOR = '#000000';
export const DEFAULT_CANONICAL_DESIGN_VERSION = 'v2026';

const clampCanonicalSize = (value?: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return 40;
  return Math.min(MAX_CANONICAL_INSCRIPTION_SIZE, Math.max(MIN_CANONICAL_INSCRIPTION_SIZE, Math.round(value)));
};

const clampCanonicalRotation = (value?: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return 0;
  return Math.max(MIN_CANONICAL_ROTATION, Math.min(MAX_CANONICAL_ROTATION, Math.round(value)));
};

const MIN_CANONICAL_MOTIF_HEIGHT = 20;
const MAX_CANONICAL_MOTIF_HEIGHT = 800;
const clampCanonicalMotifHeight = (value?: number) => {
  if (typeof value !== 'number' || Number.isNaN(value)) return 100;
  return Math.min(MAX_CANONICAL_MOTIF_HEIGHT, Math.max(MIN_CANONICAL_MOTIF_HEIGHT, Math.round(value)));
};

const canonicalToRadians = (deg?: number) => (typeof deg === 'number' ? (deg * Math.PI) / 180 : 0);

const normalizeDesignDpr = (rawDpr = 1, device: string = 'desktop') => {
  // Desktop designs sometimes persisted a >1 DPR when the user zoomed or had a high DPI display.
  // Those coordinates are already multiplied by that DPR, so we must preserve it.
  if (device === 'desktop') {
    return rawDpr || 1;
  }
  const standards = [1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4];
  return standards.reduce((closest, candidate) =>
    Math.abs(candidate - rawDpr) < Math.abs(closest - rawDpr) ? candidate : closest,
  standards[0]);
};

const detectPhysicalCoordinates = (items: SavedDesignData, initW: number, initH: number) => {
  if (!initW || !initH) return false;
  const marginX = initW / 2 + 50;
  const marginY = initH / 2 + 50;
  return items.some((item) => {
    if (!item || (item.type !== 'Inscription' && item.type !== 'Motif')) return false;
    const rawX = item.x ?? item.cx ?? 0;
    const rawY = item.y ?? item.cy ?? 0;
    return Math.abs(rawX) > marginX || Math.abs(rawY) > marginY;
  });
};

type LegacyCanvasInfo = {
  initW: number;
  initH: number;
  designDpr: number;
  usesPhysicalCoords: boolean;
  mmPerPxXHeadstone: number;
  mmPerPxYHeadstone: number;
  mmPerPxXBase: number;
  mmPerPxYBase: number;
};

const computeLegacyCanvasInfo = (designData: SavedDesignData, baseProduct?: any): LegacyCanvasInfo => {
  const headstoneItem = designData.find((item) => item.type === 'Headstone') || baseProduct || {};
  const baseItem = designData.find((item) => item.type === 'Base');

  const navigatorStr: string | undefined = headstoneItem.navigator || baseProduct?.navigator;
  let navW: number | undefined;
  let navH: number | undefined;
  if (typeof navigatorStr === 'string') {
    const match = navigatorStr.match(/(\d+)x(\d+)/i);
    if (match) {
      navW = parseInt(match[1], 10);
      navH = parseInt(match[2], 10);
    }
  }

  const initW = navW || headstoneItem.init_width || baseProduct?.init_width || headstoneItem.viewportWidth || 800;
  const initH = navH || headstoneItem.init_height || baseProduct?.init_height || headstoneItem.viewportHeight || 600;
  const designDpr = normalizeDesignDpr(headstoneItem.dpr ?? baseProduct?.dpr ?? 1, headstoneItem.device ?? baseProduct?.device ?? 'desktop');
  const usesPhysicalCoords = detectPhysicalCoordinates(designData, initW, initH);

  const headstoneWidthMm = headstoneItem.width || baseProduct?.width || 600;
  const headstoneHeightMm = headstoneItem.height || baseProduct?.height || 400;
  const baseWidthMm = baseItem?.width || headstoneWidthMm;
  const baseHeightMm = baseItem?.height || 100;

  const mmPerPxXHeadstone = headstoneWidthMm && initW ? headstoneWidthMm / initW : 0.75;
  const mmPerPxYHeadstone = headstoneHeightMm && initH ? headstoneHeightMm / initH : 0.75;
  const mmPerPxXBase = baseWidthMm && initW ? baseWidthMm / initW : mmPerPxXHeadstone;
  const mmPerPxYBase = baseHeightMm && initH ? baseHeightMm / initH : mmPerPxYHeadstone;

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
};

const decodeHtmlEntities = (value?: string) => {
  if (!value) return '';
  return value
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&');
};

const canonicalSurfaceTarget = (surface?: string): 'base' | 'headstone' =>
  surface?.toLowerCase().includes('base') ? 'base' : 'headstone';

const buildCanonicalMotifPathMap = (design?: CanonicalDesignData) =>
  new Map((design?.assets?.motifs ?? []).map((asset) => [asset.id, asset.path]));

const resolveCanonicalMotifPath = (
  assetId: string | undefined,
  motifId: string,
  motifAssetMap: Map<string, string>,
) => {
  if (assetId && motifAssetMap.has(assetId)) {
    return motifAssetMap.get(assetId)!;
  }
  if (assetId) {
    return `/shapes/motifs/${assetId}.svg`;
  }
  return `/shapes/motifs/${motifId}.svg`;
};

/**
 * Bronze texture mapping
 */
const BRONZE_TEXTURES = [
  { name: "Black", color: "#000000", img: "/textures/phoenix/s/01.webp" },
  { name: "Brown", color: "#48280f", img: "/textures/phoenix/s/02.webp" },
  { name: "Casino Blue", color: "#0c1137", img: "/textures/phoenix/s/03.webp" },
  { name: "Dark Brown", color: "#24160b", img: "/textures/phoenix/s/04.webp" },
  { name: "Dark Green", color: "#1a391a", img: "/textures/phoenix/s/05.webp" },
  { name: "Grey", color: "#6d696a", img: "/textures/phoenix/s/06.webp" },
  { name: "Holly Green", color: "#07723a", img: "/textures/phoenix/s/07.webp" },
  { name: "Ice Blue", color: "#afcadb", img: "/textures/phoenix/s/08.webp" },
  { name: "Maroon", color: "#4c0f1e", img: "/textures/phoenix/s/09.webp" },
  { name: "Navy Blue", color: "#2c2c76", img: "/textures/phoenix/s/10.webp" },
  { name: "Purple", color: "#513a68", img: "/textures/phoenix/s/11.webp" },
  { name: "Red", color: "#c72028", img: "/textures/phoenix/s/12.webp" },
  { name: "Sundance Pink", color: "#c99cb0", img: "/textures/phoenix/s/13.webp" },
  { name: "Turquoise", color: "#295363", img: "/textures/phoenix/s/14.webp" },
  { name: "White", color: "#ffffff", img: "/textures/phoenix/s/15.webp" }
];

/**
 * Material/texture mapping for headstones and plaques
 */
const MATERIAL_TEXTURES: Record<string, string> = {
  // Blue Pearl variants
  'blue-pearl': '/textures/forever/l/Blue-Pearl.webp',
  'blue pearl': '/textures/forever/l/Blue-Pearl.webp',
  
  // Glory Black (for laser etched - IDs 18 and 19)
  'glory-black': '/textures/forever/l/Glory-Black-2.webp',
  'glory black': '/textures/forever/l/Glory-Black-2.webp',
  'glory-gold-spots': '/textures/forever/l/Glory-Black-1.webp',
  
  // Other common materials
  'african-black': '/textures/forever/l/African-Black.webp',
  'noble-black': '/textures/forever/l/Noble-Black.webp',
  'g654': '/textures/forever/l/01.webp', // Fallback to numbered texture
};

/**
 * Map texture path from saved design to actual texture
 */
function mapTexture(texturePath: string, productId: string): string {
  if (!texturePath) return '';
  
  // Check if it's a bronze plaque (productId 5)
  if (productId === '5') {
    // Handle paths like "src/bronzes/phoenix/l/04.webp" -> "/textures/phoenix/l/04.webp"
    if (texturePath.includes('phoenix')) {
      const match = texturePath.match(/phoenix[\/\\](l|s)[\/\\](\d+)\.(jpg|webp)$/);
      if (match) {
        const size = match[1]; // 'l' or 's'
        const number = match[2];
        return `/textures/phoenix/${size}/${number}.webp`;
      }
    }
    
    // Extract bronze color from path if possible (fallback)
    const bronzeMatch = texturePath.match(/[\/\\](\d+)\.(jpg|webp)$/);
    if (bronzeMatch) {
      const number = bronzeMatch[1];
      return `/textures/phoenix/l/${number}.webp`;
    }
    
    // Default bronze
    return BRONZE_TEXTURES[0].img;
  }
  
  // For headstones, check material IDs 18 or 19 (Glory Black)
  if (texturePath.includes('18') || texturePath.includes('19') || 
      texturePath.includes('Glory-Black')) {
    return MATERIAL_TEXTURES['glory-black'];
  }
  
  // Check for Blue Pearl
  if (texturePath.toLowerCase().includes('blue-pearl') || 
      texturePath.toLowerCase().includes('bluepearl')) {
    return MATERIAL_TEXTURES['blue-pearl'];
  }
  
  // Try to extract material name from texture path
  const pathLower = texturePath.toLowerCase();
  for (const [key, value] of Object.entries(MATERIAL_TEXTURES)) {
    if (pathLower.includes(key)) {
      return value;
    }
  }
  
  // If path already looks valid, convert .jpg to .webp if needed
  if (texturePath.startsWith('/textures/')) {
    return texturePath.replace(/\.jpg$/i, '.webp');
  }
  
  // Handle legacy paths like "src/granites/forever2/l/Blue-Pearl.jpg"
  if (texturePath.includes('granites/forever') || texturePath.includes('forever2')) {
    const match = texturePath.match(/[\/\\]([\w-]+)\.(jpg|webp)$/i);
    if (match) {
      const materialName = match[1];
      return `/textures/forever/l/${materialName}.webp`;
    }
  }
  
  // Default fallback - convert .jpg to .webp
  return texturePath.replace(/\.jpg$/i, '.webp');
}

/**
 * Load a saved design into the DYO editor
 */
export async function loadSavedDesignIntoEditor(
  designData: SavedDesignData,
  designId: string,
  options: LoadDesignOptions = {}
) {
  const store = useHeadstoneStore.getState();
  const { clearExisting = true } = options;

  // Get the base product first (to determine product type)
  const baseProduct = designData.find(
    item => item.type === 'Headstone' || item.type === 'Plaque'
  );

  // Set the correct product based on productid
  if (baseProduct && baseProduct.productid) {
    const productId = String(baseProduct.productid);
    
    try {
      await store.setProductId(productId);
      
      // IMPORTANT: Set dimensions AFTER product is loaded
      // The setProductId sets default init dimensions, so we need to override them
      if (baseProduct.width && baseProduct.height) {
        store.setWidthMm(baseProduct.width);
        store.setHeightMm(baseProduct.height);
      }
    } catch (error) {
      // Continue anyway - we'll try to load the design
    }
  }

  // Clear existing content if requested
  if (clearExisting) {
    // Clear inscriptions
    const currentInscriptions = [...store.inscriptions];
    currentInscriptions.forEach(insc => {
      store.deleteInscription(insc.id);
    });
    
    // Clear motifs - use selectedMotifs array
    if (store.selectedMotifs && store.selectedMotifs.length > 0) {
      const currentMotifs = [...store.selectedMotifs];
      currentMotifs.forEach(motif => {
        store.removeMotif(motif.id);
      });
    }
    
    // Clear additions - use selectedAdditions array
    if (store.selectedAdditions && store.selectedAdditions.length > 0) {
      const currentAdditions = [...store.selectedAdditions];
      currentAdditions.forEach(addId => {
        store.removeAddition(addId);
      });
    }
  }

  // Set product properties if available
  if (baseProduct) {
    // Set border if available
    if (baseProduct.border) {
      store.setBorderName(baseProduct.border);
    }
    
    // Set material/texture if available - with a small delay to ensure setProductId fully completes
    if (baseProduct.texture) {
      const mappedTexture = mapTexture(baseProduct.texture, String(baseProduct.productid));
      
      // Wait a tick to ensure setProductId has fully completed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      store.setHeadstoneMaterialUrl(mappedTexture);
    }
    // Note: Dimensions are set immediately after setProductId completes (see above)
  }

  // Add inscriptions
  const inscriptions = designData.filter(
    item => item.type === 'Inscription' && item.label && item.label.trim()
  );

  // Sort inscriptions by OLD Y position
  // In old system: MORE NEGATIVE Y = HIGHER UP on screen (top)
  // After negation at line 327: these become MORE POSITIVE yPos values
  // We want top inscriptions first in array, so sort OLD Y ascending (most negative first)
  const sortedInscriptions = [...inscriptions].sort((a, b) => {
    const aY = typeof a.y === 'number' ? a.y : 0;
    const bY = typeof b.y === 'number' ? b.y : 0;
    // Sort by OLD Y values: most negative first (top inscriptions)
    // This way "BIGGEST SIZE IN DYO" (old y=-205) comes before "– Our Designers..." (old y=229)
    return aY - bY;
  });

  const canvasInfo = computeLegacyCanvasInfo(designData, baseProduct);

  for (const insc of sortedInscriptions) {
    const text = insc.label || '';
    const font = insc.font_family || 'Arial';
    const surfaceIsBase = (insc.part?.toLowerCase() || '') === 'base';

    const rawFont = typeof insc.font === 'string' ? insc.font : '';
    const fontMatch = rawFont.match(/([\d.]+)px/);
    const fontPixels = fontMatch ? parseFloat(fontMatch[1]) : 0;

    const rawX = typeof insc.x === 'number' ? insc.x : 0;
    const rawY = typeof insc.y === 'number' ? insc.y : 0;
    const canvasX = canvasInfo.usesPhysicalCoords ? rawX / canvasInfo.designDpr : rawX;
    const canvasY = canvasInfo.usesPhysicalCoords ? rawY / canvasInfo.designDpr : rawY;

    const mmPerPxX = surfaceIsBase ? canvasInfo.mmPerPxXBase : canvasInfo.mmPerPxXHeadstone;
    const mmPerPxY = surfaceIsBase ? canvasInfo.mmPerPxYBase : canvasInfo.mmPerPxYHeadstone;

    const xPos = canvasX * mmPerPxX;
    const yPos = -(canvasY * mmPerPxY);

    const canvasFontPx = fontPixels > 0 ? (canvasInfo.usesPhysicalCoords ? fontPixels / canvasInfo.designDpr : fontPixels) : 0;
    let sizeMm = insc.font_size || 10;
    if (canvasFontPx > 0) {
      sizeMm = canvasFontPx * mmPerPxY;
    }

    store.addInscriptionLine({
      text,
      font,
      sizeMm,
      xPos,
      yPos,
      rotationDeg: typeof insc.rotation === 'number' ? insc.rotation : 0,
      color: insc.color || '#000000',
    });
  }

  // Load motifs
  const motifs = designData.filter(
    item => item.type === 'Motif' && item.src
  );

  for (const motif of motifs) {
    const svgPath = `/shapes/motifs/${motif.src}.svg`;
    const color = motif.color || '#c99d44';
    const surfaceIsBase = (motif.part?.toLowerCase() || '') === 'base';
    
    store.addMotif(svgPath);
    
    const updatedState = useHeadstoneStore.getState();
    const addedMotifs = updatedState.selectedMotifs;
    if (addedMotifs.length > 0) {
      const newMotif = addedMotifs[addedMotifs.length - 1];
      
      store.setMotifColor(newMotif.id, color);
      
      const rawX = typeof motif.x === 'number' ? motif.x : 0;
      const rawY = typeof motif.y === 'number' ? motif.y : 0;
      const canvasX = canvasInfo.usesPhysicalCoords ? rawX / canvasInfo.designDpr : rawX;
      const canvasY = canvasInfo.usesPhysicalCoords ? rawY / canvasInfo.designDpr : rawY;

      const mmPerPxX = surfaceIsBase ? canvasInfo.mmPerPxXBase : canvasInfo.mmPerPxXHeadstone;
      const mmPerPxY = surfaceIsBase ? canvasInfo.mmPerPxYBase : canvasInfo.mmPerPxYHeadstone;

      const xPos = canvasX * mmPerPxX;
      const yPos = -(canvasY * mmPerPxY);

      let heightMm = 100;
      if (typeof motif.height === 'number' && motif.height > 0) {
        if (motif.height > 10 && motif.height < 2000 && !motif.ratio) {
          heightMm = motif.height;
        } else {
          const canvasHeight = canvasInfo.usesPhysicalCoords ? motif.height / canvasInfo.designDpr : motif.height;
          heightMm = canvasHeight * mmPerPxY;
        }
      } else if (typeof motif.ratio === 'number' && motif.ratio > 0) {
        const basePx = 100;
        const canvasHeight = basePx * motif.ratio * (canvasInfo.usesPhysicalCoords ? canvasInfo.designDpr : 1);
        heightMm = canvasHeight * mmPerPxY;
      }
      heightMm = Math.max(20, Math.min(800, heightMm));

      console.log(`[LOADER] Motif ${newMotif.id}: saved=(${motif.x}, ${motif.y}) → offset=(${xPos.toFixed(1)}, ${yPos.toFixed(1)}), height=${heightMm.toFixed(1)}mm`);

      const flipX = typeof motif.flipx === 'number' ? motif.flipx === 1 : false;
      const flipY = typeof motif.flipy === 'number' ? motif.flipy === 1 : false;

      store.setMotifOffset(newMotif.id, {
        xPos,
        yPos,
        scale: 1.0,
        rotationZ: typeof motif.rotation === 'number' ? motif.rotation : 0,
        heightMm,
        flipX,
        flipY,
      });
    }
  }

  // Deselect any selected motif after loading all motifs
  if (motifs.length > 0) {
    store.setSelectedMotifId(null);
    store.setActivePanel(null);
  }

  const result = {
    inscriptionsLoaded: inscriptions.length,
    motifsLoaded: motifs.length,
  };
  
  return result;
}

/**
 * Load a canonical v2026+ design file directly into the editor
 */
export async function loadCanonicalDesignIntoEditor(
  designData: CanonicalDesignData,
  options: LoadDesignOptions = {},
) {
  if (!designData) {
    throw new Error('Canonical design data is required.');
  }

  const store = useHeadstoneStore.getState();
  const { clearExisting = true } = options;

  const fetchLegacyDesign = async (): Promise<SavedDesignData | null> => {
    const legacyPath = designData.source?.legacyFile;
    if (!legacyPath) return null;
    try {
      const response = await fetch(legacyPath, { cache: 'no-store' });
      if (!response.ok) return null;
      const data = await response.json();
      return Array.isArray(data) ? (data as SavedDesignData) : null;
    } catch (error) {
      console.warn('[loadCanonicalDesignIntoEditor] Failed to fetch legacy design fallback:', error);
      return null;
    }
  };

  const headstone = designData.components?.headstone;
  const base = designData.components?.base;
  const canonicalInscriptionSnapshot = designData.elements?.inscriptions ?? [];
  const canonicalMotifSnapshot = designData.elements?.motifs ?? [];
  const headstoneHalf = headstone?.height_mm ? headstone.height_mm / 2 : null;

  let canonicalOutOfBounds = () => null as string | null;

  const fallbackReason = canonicalOutOfBounds();
  if (fallbackReason) {
    console.warn(
      `[loadCanonicalDesignIntoEditor] ${fallbackReason}; attempting legacy fallback via ${designData.source?.legacyFile ?? 'N/A'}`,
    );
    const legacyDesign = await fetchLegacyDesign();
    if (legacyDesign) {
      await loadSavedDesignIntoEditor(legacyDesign, designData.source?.id ?? 'canonical', {
        clearExisting,
      });
      return {
        inscriptionsLoaded: canonicalInscriptionSnapshot.length,
        motifsLoaded: canonicalMotifSnapshot.length,
      };
    }
    console.warn('[loadCanonicalDesignIntoEditor] Legacy fallback unavailable; proceeding with canonical data');
  }
  
  console.log('[loadCanonicalDesignIntoEditor] Using canonical coordinates (no fallback needed)');

  if (clearExisting) {
    store.setInscriptions([]);
    if (store.selectedMotifs.length) {
      [...store.selectedMotifs].forEach((motif) => store.removeMotif(motif.id));
    }
    if (store.selectedAdditions.length) {
      [...store.selectedAdditions].forEach((additionId) => store.removeAddition(additionId));
    }
    store.setSelectedInscriptionId(null);
    store.setSelectedMotifId(null);
    store.setSelectedAdditionId(null);
    store.setActiveInscriptionText('');
  }

  const productId = designData.product?.id;
  if (productId != null) {
    try {
      await store.setProductId(String(productId));
    } catch (error) {
      console.warn('Failed to set product while loading canonical design', error);
    }
  }

  // Set shape if available
  const shapeName = designData.product?.shape;
  if (shapeName) {
    // Convert shape name to URL (e.g., "Curved Gable" -> "/shapes/headstones/curved_gable.svg")
    // Use underscore, not dash, to match actual file names
    const shapeSlug = shapeName.toLowerCase().replace(/\s+/g, '_');
    const shapeUrl = `/shapes/headstones/${shapeSlug}.svg`;
    store.setShapeUrl(shapeUrl);
  }

  if (headstone?.width_mm) {
    console.log('[loadCanonicalDesignIntoEditor] Setting headstone width:', headstone.width_mm);
    store.setWidthMm(headstone.width_mm);
  }
  if (headstone?.height_mm) {
    console.log('[loadCanonicalDesignIntoEditor] Setting headstone height:', headstone.height_mm);
    store.setHeightMm(headstone.height_mm);
  }
  if (headstone?.thickness_mm) {
    store.setUprightThickness(headstone.thickness_mm);
    store.setSlantThickness(headstone.thickness_mm);
  }
  if (headstone?.texture) {
    store.setHeadstoneMaterialUrl(headstone.texture);
  }

  if (base) {
    store.setShowBase(true);
    if (base.width_mm) {
      store.setBaseWidthMm(base.width_mm);
    }
    if (base.height_mm) {
      store.setBaseHeightMm(base.height_mm);
    }
    if (base.depth_mm) {
      store.setBaseThickness(base.depth_mm);
    }
    if (base.texture) {
      store.setBaseMaterialUrl(base.texture);
    }
  } else {
    store.setShowBase(false);
  }

  // CRITICAL FIX: For canonical designs, we just set the dimensions into the store above,
  // so the "active" dimensions should match the "canonical" dimensions.
  // Use the canonical values directly instead of reading from store to avoid race conditions.
  const canonicalHeadstoneWidthMm =
    headstone?.width_mm ?? designData.scene?.canvas?.width_mm ?? 0;
  const canonicalHeadstoneHeightMm =
    headstone?.height_mm ?? designData.scene?.canvas?.height_mm ?? 0;
  const canonicalBaseWidthMm = base?.width_mm ?? canonicalHeadstoneWidthMm;
  const canonicalBaseHeightMm = base?.height_mm ?? 0;

  // Since we're loading a canonical design with its exact dimensions,
  // no scaling is needed - coordinates are already in the correct space
  const HEADSTONE_X_SCALE = 1;
  const HEADSTONE_Y_SCALE = 1;
  const BASE_X_SCALE = 1;
  const BASE_Y_SCALE = 1;

  const canonicalViewportWidthCssPx = designData.scene?.viewportPx?.width ?? 0;
  const canonicalViewportHeightCssPx = designData.scene?.viewportPx?.height ?? 0;
  const canonicalViewportDpr = designData.scene?.viewportPx?.dpr ?? 1;
  
  console.log('[Canonical Loader] Viewport data from JSON:', {
    rawWidth: designData.scene?.viewportPx?.width,
    rawHeight: designData.scene?.viewportPx?.height,
    rawDpr: designData.scene?.viewportPx?.dpr,
    canonicalViewportHeightCssPx,
  });
  
  const canonicalViewportWidthPx =
    canonicalViewportWidthCssPx > 0 ? canonicalViewportWidthCssPx * canonicalViewportDpr : canonicalViewportWidthCssPx;
  const canonicalViewportHeightPx =
    canonicalViewportHeightCssPx > 0 ? canonicalViewportHeightCssPx * canonicalViewportDpr : canonicalViewportHeightCssPx;

  const HEADSTONE_MM_PER_PX_X_CANONICAL =
    canonicalViewportWidthPx && canonicalHeadstoneWidthMm
      ? canonicalHeadstoneWidthMm / canonicalViewportWidthPx
      : 1;
  const HEADSTONE_MM_PER_PX_Y_CANONICAL =
    canonicalViewportHeightPx && canonicalHeadstoneHeightMm
      ? canonicalHeadstoneHeightMm / canonicalViewportHeightPx
      : 1;
  const BASE_MM_PER_PX_X_CANONICAL =
    canonicalViewportWidthPx && canonicalBaseWidthMm
      ? canonicalBaseWidthMm / canonicalViewportWidthPx
      : HEADSTONE_MM_PER_PX_X_CANONICAL;
  const BASE_MM_PER_PX_Y_CANONICAL =
    canonicalViewportHeightPx && canonicalBaseHeightMm
      ? canonicalBaseHeightMm / canonicalViewportHeightPx
      : HEADSTONE_MM_PER_PX_Y_CANONICAL;
  const HEADSTONE_HALF_MM = canonicalHeadstoneHeightMm ? canonicalHeadstoneHeightMm / 2 : 0;
  const BASE_HALF_MM = canonicalBaseHeightMm ? canonicalBaseHeightMm / 2 : 0;
  const BASE_CENTER_OFFSET_MM = HEADSTONE_HALF_MM + BASE_HALF_MM;
  const HEADSTONE_STAGE_OFFSET_MM = BASE_HALF_MM;
  const HEADSTONE_VERTICAL_BIAS_MM = canonicalHeadstoneHeightMm ? canonicalHeadstoneHeightMm * 0.08 : 0;
  let HEADSTONE_STAGE_SCALE = 1;

  function convertPositionToMm(
    position: { x_mm?: number; y_mm?: number; x_px?: number; y_px?: number } | undefined,
    targetSurface: string,
  ) {
    const useBase = targetSurface === 'base';
    const mmPerPxX = useBase ? BASE_MM_PER_PX_X_CANONICAL : HEADSTONE_MM_PER_PX_X_CANONICAL;
    const mmPerPxY = useBase ? BASE_MM_PER_PX_Y_CANONICAL : HEADSTONE_MM_PER_PX_Y_CANONICAL;

    if (typeof position?.x_mm === 'number' || typeof position?.y_mm === 'number') {
      return {
        xMm: position?.x_mm ?? 0,
        yMm: position?.y_mm ?? 0,
      };
    }

    const xPx = position?.x_px ?? 0;
    const yPx = position?.y_px ?? 0;
    const stageXMm = xPx * mmPerPxX;
    const stageYMm = -yPx * mmPerPxY;
    let yMm = useBase ? stageYMm + BASE_CENTER_OFFSET_MM : stageYMm - HEADSTONE_STAGE_OFFSET_MM;
    if (!useBase) {
      yMm = yMm * HEADSTONE_STAGE_SCALE + HEADSTONE_VERTICAL_BIAS_MM;
    }
    return { xMm: stageXMm, yMm };
  }

  function resolveFontSizeMm(
    font: { size_mm?: number; size_px?: number } | undefined,
    targetSurface: string,
  ) {
    if (typeof font?.size_mm === 'number') return font.size_mm;
    const sizePx = font?.size_px ?? 40;
    const mmPerPxY = targetSurface === 'base' ? BASE_MM_PER_PX_Y_CANONICAL : HEADSTONE_MM_PER_PX_Y_CANONICAL;
    return sizePx * mmPerPxY;
  }

  function resolveMotifHeightMm(
    motif: { height_mm?: number; height_px?: number } | undefined,
    targetSurface: string,
  ) {
    if (typeof motif?.height_mm === 'number') return motif.height_mm;
    if (typeof motif?.height_px === 'number') {
      const mmPerPxY = targetSurface === 'base' ? BASE_MM_PER_PX_Y_CANONICAL : HEADSTONE_MM_PER_PX_Y_CANONICAL;
      return motif.height_px * mmPerPxY;
    }
    return 100;
  }

  canonicalOutOfBounds = () => {
    if (headstoneHalf == null) return null;
    const tolerance = 50;
    const baseHalf = base?.height_mm ? base.height_mm / 2 : 0;
    const stageHalf = headstoneHalf + baseHalf;
    const headstoneLimit = stageHalf + tolerance;
    const baseLimit = stageHalf + tolerance;

    const headstoneInscriptionMax = canonicalInscriptionSnapshot.reduce((max, line) => {
      const target = canonicalSurfaceTarget(line.surface);
      const { yMm } = convertPositionToMm(line.position, target === 'base' ? 'base' : 'headstone');
      if (target === 'base') {
        return max;
      }
      return Math.max(max, Math.abs(yMm));
    }, 0);
    if (headstoneInscriptionMax > headstoneLimit) {
      return 'inscriptions exceed headstone bounds';
    }

    let headstoneMotifMax = 0;
    let baseMotifMax = 0;
    canonicalMotifSnapshot.forEach((motif) => {
      const target = canonicalSurfaceTarget(motif.surface);
      const { yMm } = convertPositionToMm(motif.position, target === 'base' ? 'base' : 'headstone');
      if (target === 'base') {
        baseMotifMax = Math.max(baseMotifMax, Math.abs(yMm));
      } else {
        headstoneMotifMax = Math.max(headstoneMotifMax, Math.abs(yMm));
      }
    });

    if (headstoneMotifMax > headstoneLimit) {
      return 'motifs exceed headstone bounds';
    }

    if (baseHalf > 0 && baseMotifMax > baseLimit) {
      return 'motifs exceed base bounds';
    }

    const maxMotifSpread = canonicalMotifSnapshot.reduce((max, motif) => {
      const target = canonicalSurfaceTarget(motif.surface);
      const { yMm } = convertPositionToMm(motif.position, target === 'base' ? 'base' : 'headstone');
      return Math.max(max, Math.abs(yMm));
    }, 0);
    const combinedLimit = stageHalf + tolerance;
    if (maxMotifSpread > combinedLimit * 1.1) {
      return 'motif coordinates appear to be in stage space';
    }

    return null;
  };

  const GLOBAL_LAYOUT_SCALE = 1;
  const DEFAULT_HEADSTONE_Y_SHIFT_MM = HEADSTONE_HALF_MM / 2;
  const BASE_Y_SHIFT_MM = HEADSTONE_HALF_MM / 2;
  const INSCRIPTION_SIZE_SCALE = 0.85;

  type RangeTracker = { min: number; max: number; count: number };

  const createRangeTracker = (): RangeTracker => ({
    min: Number.POSITIVE_INFINITY,
    max: Number.NEGATIVE_INFINITY,
    count: 0,
  });

  const recordRangeValue = (tracker: RangeTracker, value: number) => {
    if (!Number.isFinite(value)) return;
    tracker.min = Math.min(tracker.min, value);
    tracker.max = Math.max(tracker.max, value);
    tracker.count += 1;
  };

  const computeHeadstoneShift = (
    tracker: RangeTracker,
    halfBound: number,
    defaultShift: number,
    mode: 'default' | 'auto-center',
  ) => {
    if (!tracker || tracker.count === 0 || halfBound <= 0) {
      return defaultShift;
    }

    if (mode !== 'auto-center') {
      return defaultShift;
    }

    let adjustedShift = -((tracker.min + tracker.max) / 2);
    const overflowTop = tracker.max + adjustedShift - halfBound;
    if (overflowTop > 0) {
      adjustedShift -= overflowTop;
    }
    const overflowBottom = -halfBound - (tracker.min + adjustedShift);
    if (overflowBottom > 0) {
      adjustedShift += overflowBottom;
    }
    return adjustedShift;
  };

  type PendingMotifData = {
    svgPath: string;
    color: string;
    target: 'headstone' | 'base';
    xPos: number;
    yPos: number;
    heightMm: number;
    rotationZ: number;
    flipX: boolean;
    flipY: boolean;
  };
  
  // Calculate display ratio: how many pixels per mm in the current 3D view
  // This matches the legacy getRatio() logic: canvas_pixels / headstone_mm
  // CRITICAL: Legacy system uses TOTAL canvas height (headstone + base canvas pixels)
  
  const CANONICAL_TOTAL_HEIGHT_MM = canonicalHeadstoneHeightMm + canonicalBaseHeightMm;
  HEADSTONE_STAGE_SCALE = CANONICAL_TOTAL_HEIGHT_MM
    ? canonicalHeadstoneHeightMm / CANONICAL_TOTAL_HEIGHT_MM
    : 1;
  
  // Calculate base canvas height in pixels using the same ratio as headstone
  const headstoneCanvasRatio = canonicalViewportHeightCssPx / canonicalHeadstoneHeightMm;
  const baseCanvasHeightPx = canonicalBaseHeightMm * headstoneCanvasRatio;
  const totalCanvasHeightPx = canonicalViewportHeightCssPx + baseCanvasHeightPx;
  
  const DISPLAY_RATIO = totalCanvasHeightPx / CANONICAL_TOTAL_HEIGHT_MM;
  
  console.log('[Canonical Loader] Display ratio calculation:', {
    canonicalViewportHeightCssPx,
    canonicalHeadstoneHeightMm,
    canonicalBaseHeightMm,
    headstoneCanvasRatio,
    baseCanvasHeightPx,
    totalCanvasHeightPx,
    totalHeightMm: CANONICAL_TOTAL_HEIGHT_MM,
    displayRatio: DISPLAY_RATIO,
  });
  
  const getMotifSizeScale = () => 1.2;


  const motifAssetMap = buildCanonicalMotifPathMap(designData);
  const headstoneRangeTracker = createRangeTracker();
  const pendingLines: Array<{ target: 'headstone' | 'base'; line: Line }> = [];
  const pendingMotifs: PendingMotifData[] = [];

  (designData.elements?.inscriptions ?? []).forEach((inscription, index) => {
    const id = inscription.id ?? `insc-${index}`;
    const text = decodeHtmlEntities(inscription.text ?? '');
    const targetSurface = canonicalSurfaceTarget(inscription.surface);
    const scaleX = targetSurface === 'base' ? BASE_X_SCALE : HEADSTONE_X_SCALE;
    const scaleY = targetSurface === 'base' ? BASE_Y_SCALE : HEADSTONE_Y_SCALE;
    const { xMm, yMm } = convertPositionToMm(
      inscription.position,
      targetSurface === 'base' ? 'base' : 'headstone',
    );
    const xPos = xMm * scaleX * GLOBAL_LAYOUT_SCALE;
    const baseYPos = yMm * scaleY * GLOBAL_LAYOUT_SCALE;
    const baseSize = clampCanonicalSize(
      resolveFontSizeMm(inscription.font, targetSurface === 'base' ? 'base' : 'headstone'),
    );
    const scaledSize = clampCanonicalSize(baseSize * GLOBAL_LAYOUT_SCALE);

    if (targetSurface === 'headstone') {
      recordRangeValue(headstoneRangeTracker, baseYPos);
    }

    if (index === 0) {
      console.log('[Canonical Loader] First inscription size:', {
        text: inscription.text,
        baseSizeMm: baseSize,
        displayRatio: DISPLAY_RATIO,
        scaledSize,
      });
    }

    pendingLines.push({
      target: targetSurface,
      line: {
        id,
        text,
        font: inscription.font?.family ?? DEFAULT_CANONICAL_FONT,
        sizeMm: scaledSize,
        color: inscription.color ?? DEFAULT_CANONICAL_COLOR,
        xPos,
        yPos: baseYPos,
        rotationDeg: clampCanonicalRotation(inscription.rotation?.z_deg),
        target: targetSurface,
        ref: createRef<Group | null>(),
      },
    });
  });

  const canonicalMotifs = designData.elements?.motifs ?? [];

  canonicalMotifs.forEach((motif, index) => {
    const svgPath = resolveCanonicalMotifPath(motif.asset, motif.id ?? `motif-${index}`, motifAssetMap);
    const color = motif.color ?? DEFAULT_CANONICAL_COLOR;
    const target = canonicalSurfaceTarget(motif.surface);
    const scaleX = target === 'base' ? BASE_X_SCALE : HEADSTONE_X_SCALE;
    const scaleY = target === 'base' ? BASE_Y_SCALE : HEADSTONE_Y_SCALE;
    const { xMm, yMm } = convertPositionToMm(motif.position, target === 'base' ? 'base' : 'headstone');
    const xPos = xMm * scaleX * GLOBAL_LAYOUT_SCALE;
    const baseYPos = yMm * scaleY * GLOBAL_LAYOUT_SCALE;
    const canonicalHeight = clampCanonicalMotifHeight(
      resolveMotifHeightMm(motif, target === 'base' ? 'base' : 'headstone'),
    );
    const scaledHeight = clampCanonicalMotifHeight(canonicalHeight * GLOBAL_LAYOUT_SCALE);
    const rotationZ = canonicalToRadians(motif.rotation?.z_deg);
    const flipX = !(motif.flip?.x ?? false);
    const flipY = !(motif.flip?.y ?? false);

    if (target === 'headstone') {
      recordRangeValue(headstoneRangeTracker, baseYPos);
    }

    pendingMotifs.push({
      svgPath,
      color,
      target,
      xPos,
      yPos: baseYPos,
      heightMm: scaledHeight,
      rotationZ,
      flipX,
      flipY,
    });
  });

  const shouldAutoCenterHeadstone = (designData.source?.mlDir ?? '').toLowerCase() === 'forevershining';
  const headstoneShiftMm = computeHeadstoneShift(
    headstoneRangeTracker,
    HEADSTONE_HALF_MM,
    DEFAULT_HEADSTONE_Y_SHIFT_MM,
    shouldAutoCenterHeadstone ? 'auto-center' : 'default',
  );
  if (shouldAutoCenterHeadstone) {
    console.log('[Canonical Loader] Forevershining auto-centering applied:', {
      appliedShiftMm: headstoneShiftMm,
      defaultShiftMm: DEFAULT_HEADSTONE_Y_SHIFT_MM,
      min: headstoneRangeTracker.min,
      max: headstoneRangeTracker.max,
    });
  }
  const baseShiftMm = BASE_Y_SHIFT_MM;

  const canonicalLines: Line[] = pendingLines.map((entry) => ({
    ...entry.line,
    yPos: entry.line.yPos + (entry.target === 'base' ? baseShiftMm : headstoneShiftMm),
  }));

  store.setInscriptions(canonicalLines);
  store.setActiveInscriptionText(canonicalLines[0]?.text ?? '');
  store.setSelectedInscriptionId(null);

  if (pendingMotifs.length > 0) {
    console.log('[loadCanonicalDesignIntoEditor] Loading motifs from canonical data:', pendingMotifs.length);
    pendingMotifs.forEach((motifData) => {
      store.addMotif(motifData.svgPath);

      const updatedState = useHeadstoneStore.getState();
      const addedMotifs = updatedState.selectedMotifs;
      if (!addedMotifs.length) return;
      const newMotif = addedMotifs[addedMotifs.length - 1];

      store.setMotifColor(newMotif.id, motifData.color);

      store.setMotifOffset(newMotif.id, {
        xPos: motifData.xPos,
        yPos: motifData.yPos + (motifData.target === 'base' ? baseShiftMm : headstoneShiftMm),
        scale: 1.0,
        rotationZ: motifData.rotationZ,
        heightMm: motifData.heightMm,
        target: motifData.target,
        coordinateSpace: 'absolute',
        flipX: motifData.flipX,
        flipY: motifData.flipY,
      });
    });

    store.setSelectedMotifId(null);
    store.setActivePanel(null);
  
  } else {
    console.warn('[loadCanonicalDesignIntoEditor] No motif data available');
  }
}

/**
 * Anonymize sensitive data in a design
 * Replaces names with placeholders
 */
export function anonymizeDesignData(
  designData: SavedDesignData
): SavedDesignData {
  const namePatterns = [
    /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, // First Last
    /\b[A-Z]\. [A-Z][a-z]+\b/g, // F. Last
    /\b[A-Z][a-z]+ [A-Z]\. [A-Z][a-z]+\b/g, // First M. Last
  ];

  const replacements = [
    'John Smith',
    'Jane Doe',
    'Robert Johnson',
    'Mary Williams',
    'James Brown',
  ];

  let replacementIndex = 0;

  return designData.map(item => {
    if (item.type !== 'Inscription' || !item.label) {
      return item;
    }

    let anonymized = item.label;

    // Replace names with placeholders
    namePatterns.forEach(pattern => {
      anonymized = anonymized.replace(pattern, () => {
        const replacement = replacements[replacementIndex % replacements.length];
        replacementIndex++;
        return replacement;
      });
    });

    // Replace dates in format DD/MM/YYYY or MM/DD/YYYY
    anonymized = anonymized.replace(
      /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g,
      '01/01/2000'
    );

    // Replace years
    anonymized = anonymized.replace(/\b(19|20)\d{2}\b/g, '2000');

    return {
      ...item,
      label: anonymized,
    };
  });
}

/**
 * Check for duplicate designs
 * Returns true if a very similar design already exists
 */
export function checkForDuplicates(
  designData: SavedDesignData,
  existingDesigns: SavedDesignData[]
): boolean {
  // Get all inscription text from new design
  const newTexts = designData
    .filter(item => item.type === 'Inscription' && item.label)
    .map(item => item.label?.toLowerCase().trim())
    .filter(Boolean);

  // Check against existing designs
  for (const existing of existingDesigns) {
    const existingTexts = existing
      .filter(item => item.type === 'Inscription' && item.label)
      .map(item => item.label?.toLowerCase().trim())
      .filter(Boolean);

    // Calculate similarity (simple approach: check overlap)
    const overlap = newTexts.filter(text => existingTexts.includes(text)).length;
    const similarity = overlap / Math.max(newTexts.length, existingTexts.length);

    // If more than 80% similar, consider it a duplicate
    if (similarity > 0.8) {
      return true;
    }
  }

  return false;
}

