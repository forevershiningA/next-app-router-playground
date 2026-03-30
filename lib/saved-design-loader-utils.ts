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

type CanonicalPositionMode = 'legacy-stage-px' | 'surface-mm';
type CanonicalHeadstonePlacement = 'legacy-stage-offset' | 'auto-center' | 'none';
type CanonicalFlipMode = 'invert-legacy-bools' | 'preserve';
type CanonicalCoordinateSpace = 'css-stage' | 'buffer-px';
export type CanonicalConversionConfidence = 'high' | 'medium' | 'low';

export type CanonicalConversionMetadata = {
  pipeline?: string;
  converter?: string;
  converterVersion?: string;
  sourceHash?: string;
  sourceItemCount?: number;
  warnings?: string[];
  confidence?: CanonicalConversionConfidence;
  migratedAt?: string;
};

export type CanonicalLoadPolicyDecision = {
  mode: 'canonical' | 'legacy-fallback';
  reason: string;
};

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
    ledger?: {
      width_mm?: number;
      depth_mm?: number;
      height_mm?: number;
      texture?: string;
    };
  };
  scene?: {
    canvas?: { width_mm?: number; height_mm?: number };
    viewportPx?: { width?: number; height?: number; dpr?: number };
    coordinateSystem?: {
      positionMode?: CanonicalPositionMode;
      headstonePlacement?: CanonicalHeadstonePlacement;
      flipMode?: CanonicalFlipMode;
      coordinateSpace?: CanonicalCoordinateSpace;
      stageCssPx?: { width?: number; height?: number };
      bufferPx?: { width?: number; height?: number };
    };
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
      flip?: { x?: boolean; y?: boolean };
    }>;
    photos?: Array<{
      id?: string;
      typeId?: number;
      typeName?: string;
      surface?: string;
      position?: { x_mm?: number; y_mm?: number; x_px?: number; y_px?: number };
      width_mm?: number;
      height_mm?: number;
      width_px?: number;
      height_px?: number;
      size_mm?: { width?: number; height?: number };
      rotation?: { z_deg?: number };
      source?: { url?: string; item?: string; src?: string; path?: string };
      mask?: { shape?: string; shape_url?: string };
      croppedAspectRatio?: number;
      sizeVariant?: number;
    }>;
  };
  assets?: {
    motifs?: Array<{ id: string; path: string }>;
  };
  migration?: CanonicalConversionMetadata;
  legacy?: {
    raw?: SavedDesignData;
  };
};

const MIN_CANONICAL_INSCRIPTION_SIZE = 5;
const MAX_CANONICAL_INSCRIPTION_SIZE = 1200;
const MIN_CANONICAL_ROTATION = -45;
const MAX_CANONICAL_ROTATION = 45;
const DEFAULT_CANONICAL_FONT = 'Garamond';
const DEFAULT_CANONICAL_COLOR = '#000000';
export const DEFAULT_CANONICAL_DESIGN_VERSION = 'v2026-rollout-full-20260324-190828';
export const DEFAULT_CANONICAL_DESIGN_BASE_PATH = '/designs';
const DEFAULT_CANONICAL_LEGACY_BASE_PATH = '/canonical-designs';
const DEFAULT_CANONICAL_LEGACY_VERSION = 'v2026';
const DESIGN_SOURCE_OVERRIDES: Record<string, { basePath: string; version: string }> = {
  // Keep known-good stable canonical payload for this design.
  '1725769905504': {
    basePath: DEFAULT_CANONICAL_LEGACY_BASE_PATH,
    version: DEFAULT_CANONICAL_LEGACY_VERSION,
  },
};
const ROLLOUT_FULL_SKIPPED_IDS_PATH = '/database-exports/rollout-full-skipped-ids-20260324-190828.json';

type RolloutSkippedIdsArtifact = {
  skipped?: Array<{
    id?: string;
    reason?: string;
  }>;
};

let skippedDesignReasonLookupPromise: Promise<Map<string, string>> | null = null;

export const getCanonicalDesignUrl = (designId: string) => {
  const override = DESIGN_SOURCE_OVERRIDES[designId];
  if (override) {
    return `${override.basePath}/${override.version}/${designId}.json`;
  }
  return `${DEFAULT_CANONICAL_DESIGN_BASE_PATH}/${DEFAULT_CANONICAL_DESIGN_VERSION}/${designId}.json`;
};

const getSkippedDesignReasonLookup = async (): Promise<Map<string, string>> => {
  if (skippedDesignReasonLookupPromise) {
    return skippedDesignReasonLookupPromise;
  }
  skippedDesignReasonLookupPromise = (async () => {
    try {
      const response = await fetch(ROLLOUT_FULL_SKIPPED_IDS_PATH, { cache: 'force-cache' });
      if (!response.ok) {
        console.warn(
          `[resolveCanonicalLoadPolicy] Failed to load skipped-ID artifact (${response.status}); continuing without skipped-ID routing.`,
        );
        return new Map<string, string>();
      }
      const payload = (await response.json()) as RolloutSkippedIdsArtifact;
      const lookup = new Map<string, string>();
      for (const entry of payload.skipped ?? []) {
        if (!entry?.id) continue;
        lookup.set(entry.id, entry.reason || 'unknown');
      }
      return lookup;
    } catch (error) {
      console.warn('[resolveCanonicalLoadPolicy] Failed to parse skipped-ID artifact:', error);
      return new Map<string, string>();
    }
  })();
  return skippedDesignReasonLookupPromise;
};

export const resolveCanonicalLoadPolicy = async (
  designData: CanonicalDesignData,
  fallbackReason?: string | null,
): Promise<CanonicalLoadPolicyDecision> => {
  const conversionConfidence = designData.migration?.confidence;
  const skippedLookup = await getSkippedDesignReasonLookup();
  const skippedReason = designData.source?.id ? skippedLookup.get(designData.source.id) : null;

  return {
    mode: 'canonical',
    reason:
      fallbackReason
        ? `canonical-only mode enabled (ignoring legacy fallback trigger: ${fallbackReason})`
        : skippedReason
          ? `canonical-only mode enabled (ignoring skipped-id fallback trigger: ${skippedReason})`
          : conversionConfidence
            ? `canonical-only mode enabled (conversion confidence: ${conversionConfidence})`
            : 'canonical-only mode enabled',
  };
};

type ShapeDirectory = 'headstones' | 'masks';

const CANONICAL_SHAPE_MAP: Record<string, { file: string; directory?: ShapeDirectory }> = {
  'bronze plaque': { file: 'landscape.svg', directory: 'headstones' },
  'rectangle (landscape)': { file: 'landscape.svg', directory: 'headstones' },
  'rectangle (portrait)': { file: 'portrait.svg', directory: 'headstones' },
  'oval (landscape)': { file: 'oval_horizontal.svg', directory: 'masks' },
  'oval (portrait)': { file: 'oval_vertical.svg', directory: 'masks' },
  circle: { file: 'circle.svg', directory: 'masks' },
};

const DEFAULT_SHAPE_FILE = 'serpentine.svg';

const normalizeShapeKey = (value: string) => value.toLowerCase().replace(/\s+/g, ' ').trim();

const stripParenthetical = (value: string) =>
  value.replace(/\s*\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();

const sanitizeShapeSlug = (value: string) =>
  value
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const resolveCanonicalShapeUrl = (shapeName?: string) => {
  if (!shapeName) {
    return `/shapes/headstones/${DEFAULT_SHAPE_FILE}`;
  }

  const normalized = normalizeShapeKey(shapeName);
  const normalizedWithoutParens = stripParenthetical(normalized) || normalized;
  const override =
    CANONICAL_SHAPE_MAP[normalized] ?? CANONICAL_SHAPE_MAP[normalizedWithoutParens];

  if (override) {
    const directory = override.directory ?? 'headstones';
    return `/shapes/${directory}/${override.file}`;
  }

  const slug = sanitizeShapeSlug(normalizedWithoutParens);
  const fileName = slug ? `${slug}.svg` : DEFAULT_SHAPE_FILE;
  return `/shapes/headstones/${fileName}`;
};

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
  headstoneHeightMm: number;
  mmPerPxXHeadstone: number;
  mmPerPxYHeadstone: number;
  mmPerPxXBase: number;
  mmPerPxYBase: number;
};

type LegacyReplayRatios = {
  ratio: number;
  ratioWidth: number;
  ratioHeight: number;
};

const computeLegacyReplayRatios = (
  initW: number,
  initH: number,
  savedDpr: number,
  runtimeViewportOverride?: { width: number; height: number; dpr: number },
): LegacyReplayRatios => {
  if (typeof window === 'undefined') {
    return { ratio: 1, ratioWidth: 1, ratioHeight: 1 };
  }

  const runtimeW = Math.max(
    runtimeViewportOverride?.width || window.innerWidth || initW || 1,
    1,
  );
  const runtimeH = Math.max(
    runtimeViewportOverride?.height || window.innerHeight || initH || 1,
    1,
  );
  const runtimeDpr = Math.max(
    runtimeViewportOverride?.dpr || window.devicePixelRatio || 1,
    1,
  );
  const legacySavedDpr = Math.max(savedDpr || 1, 1);

  let ratio = 1;
  if (runtimeW > runtimeH) {
    if (runtimeDpr > legacySavedDpr) {
      ratio = runtimeDpr / legacySavedDpr;
    } else if (legacySavedDpr > 2.5) {
      ratio = ((initH / legacySavedDpr) / (runtimeH / runtimeDpr)) + (runtimeDpr / legacySavedDpr);
    } else if (legacySavedDpr > 1.5) {
      ratio = (initH / legacySavedDpr) / (runtimeH / runtimeDpr);
    } else {
      ratio = runtimeDpr / legacySavedDpr;
    }
  } else if (runtimeDpr > legacySavedDpr) {
    ratio = runtimeDpr / 2;
  } else {
    ratio = runtimeDpr / legacySavedDpr;
  }

  if (Number(runtimeDpr) === Number(legacySavedDpr)) {
    ratio = 1;
  }

  return {
    ratio,
    ratioWidth: (runtimeW / Math.max(initW, 1)) * ratio,
    ratioHeight: (runtimeH / Math.max(initH, 1)) * ratio,
  };
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
    headstoneHeightMm,
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

const legacyMotifDimensionsCache = new Map<string, Promise<{ width: number; height: number }>>();

const loadLegacyMotifDimensions = async (svgPath: string): Promise<{ width: number; height: number }> => {
  if (!legacyMotifDimensionsCache.has(svgPath)) {
    legacyMotifDimensionsCache.set(
      svgPath,
      (async () => {
        try {
          const response = await fetch(svgPath, { cache: 'force-cache' });
          if (!response.ok) throw new Error(`Failed to fetch motif SVG (${response.status})`);
          const svgText = await response.text();
          const parser = new DOMParser();
          const doc = parser.parseFromString(svgText, 'image/svg+xml');
          const svgElement = doc.documentElement as unknown as SVGSVGElement;
          const viewBoxAttr = svgElement.getAttribute('viewBox');
          let width = parseFloat(svgElement.getAttribute('width') || '');
          let height = parseFloat(svgElement.getAttribute('height') || '');
          if ((!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) && viewBoxAttr) {
            const vb = viewBoxAttr
              .split(/[\s,]+/)
              .map((token) => parseFloat(token))
              .filter((num) => Number.isFinite(num));
            if (vb.length === 4) {
              width = vb[2];
              height = vb[3];
            }
          }
          if (!Number.isFinite(width) || width <= 0) width = 100;
          if (!Number.isFinite(height) || height <= 0) height = 100;
          return { width, height };
        } catch (error) {
          console.warn('[loadSavedDesignIntoEditor] Failed to load motif SVG dimensions:', svgPath, error);
          return { width: 100, height: 100 };
        }
      })(),
    );
  }
  return legacyMotifDimensionsCache.get(svgPath)!;
};

const canonicalSurfaceTarget = (surface?: string): 'headstone' | 'base' | 'ledger' => {
  const normalized = surface?.toLowerCase().trim();
  if (!normalized) return 'headstone';
  if (normalized.includes('ledger') || normalized.includes('lid')) return 'ledger';
  if (normalized.includes('base')) return 'base';
  return 'headstone';
};

const canonicalIdToLegacyItemId = (id?: string) => {
  if (!id) return null;
  const match = id.match(/-(\d+)$/);
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
};

const parseLegacyPhotoSizeMm = (value?: string): { width: number; height: number } | null => {
  if (!value) return null;
  const match = value.match(/(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)/i);
  if (!match) return null;
  const width = Number(match[1]);
  const height = Number(match[2]);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) {
    return null;
  }
  return { width, height };
};

const normalizeLegacyRelativePath = (value?: string) => {
  if (!value) return '';
  return value
    .replace(/\\/g, '/')
    .replace(/^(\.\.\/)+/g, '')
    .replace(/^\/+|\/+$/g, '');
};

const resolveCanonicalImageUrl = (
  designData: CanonicalDesignData,
  source?: { url?: string; item?: string; src?: string; path?: string },
) => {
  const fromCanonical = source?.url;
  if (typeof fromCanonical === 'string' && fromCanonical.trim()) {
    return fromCanonical;
  }
  const itemName = source?.item?.trim();
  const sourceName = source?.src?.trim();
  const basePath = normalizeLegacyRelativePath(source?.path);
  const mlDir = (designData.source?.mlDir ?? '').trim();
  const candidates: string[] = [];

  // Prefer source filename from legacy payload (`src`) because `item` can be rewritten/truncated.
  if (sourceName && basePath && mlDir) {
    candidates.push(`/ml/${mlDir}/saved-designs/${basePath}/${sourceName}`);
  }
  if (itemName && basePath && mlDir) {
    candidates.push(`/ml/${mlDir}/saved-designs/${basePath}/${itemName}`);
  }
  if (sourceName && basePath) {
    candidates.push(`/${basePath}/${sourceName}`);
  }
  if (itemName && basePath) {
    candidates.push(`/${basePath}/${itemName}`);
  }
  if (sourceName && mlDir) {
    candidates.push(`/ml/${mlDir}/saved-designs/upload/${sourceName}`);
  }
  if (itemName && mlDir) {
    candidates.push(`/ml/${mlDir}/saved-designs/upload/${itemName}`);
  }

  return candidates[0] ?? sourceName ?? itemName ?? '';
};

const resolveCanonicalMaskShape = (shape?: string) => {
  if (!shape) return 'oval_vertical';
  return shape
    .replace(/\\/g, '/')
    .replace(/^.*\/([^/]+)\.svg$/i, '$1')
    .replace(/\.svg$/i, '')
    .trim() || 'oval_vertical';
};

const asString = (value: unknown): string | undefined =>
  typeof value === 'string' ? value : undefined;


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
  
  // Glory Gold Spots (material #17 — dark granite with golden speckle)
  'glory-gold-spots': '/textures/forever/l/Glory-Black-1.webp',
  'glory gold spots': '/textures/forever/l/Glory-Black-1.webp',
  // Glory Black (for laser etched - IDs 18 and 19)
  'glory-black': '/textures/forever/l/Glory-Black-2.webp',
  'glory black': '/textures/forever/l/Glory-Black-2.webp',
  
  // White Carrara (legacy path includes dimensions suffix)
  'white-carrara': '/textures/forever/l/White-Carrara.webp',
  'white carrara': '/textures/forever/l/White-Carrara.webp',

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
  
  // For headstones, map numbered forevershining textures to named materials
  if (texturePath.includes('/17.') || texturePath.includes('/17"') ||
      texturePath.endsWith('17.jpg') || texturePath.endsWith('17.webp')) {
    return MATERIAL_TEXTURES['glory-gold-spots'];
  }
  if (texturePath.includes('/18.') || texturePath.includes('/19.') ||
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
  
  // If path already looks valid, strip dimension suffixes (e.g. -600-x-600) and convert .jpg to .webp
  if (texturePath.startsWith('/textures/')) {
    return texturePath
      .replace(/-\d+-x-\d+/i, '')
      .replace(/\.jpg$/i, '.webp');
  }
  
  // Handle legacy paths like "src/granites/forever2/l/Blue-Pearl.jpg"
  if (texturePath.includes('granites/forever') || texturePath.includes('forever2')) {
    const match = texturePath.match(/[\/\\]([\w-]+)\.(jpg|webp)$/i);
    if (match) {
      const materialName = match[1].replace(/-\d+-x-\d+/i, '');
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

  // Clear existing content first to avoid shape-remap against stale layout.
  if (clearExisting) {
    const currentInscriptions = [...store.inscriptions];
    currentInscriptions.forEach((insc) => {
      store.deleteInscription(insc.id);
    });

    if (store.selectedMotifs && store.selectedMotifs.length > 0) {
      const currentMotifs = [...store.selectedMotifs];
      currentMotifs.forEach((motif) => {
        store.removeMotif(motif.id);
      });
    }

    if (store.selectedAdditions && store.selectedAdditions.length > 0) {
      const currentAdditions = [...store.selectedAdditions];
      currentAdditions.forEach((addId) => {
        store.removeAddition(addId);
      });
    }

    if (store.selectedImages && store.selectedImages.length > 0) {
      const currentImages = [...store.selectedImages];
      currentImages.forEach((image) => {
        store.removeImage(image.id);
      });
      store.setSelectedImageId(null);
    }
  }

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

  // Ensure legacy loads also apply the saved headstone shape.
  const legacyShapeName =
    typeof baseProduct?.shape === 'string' && baseProduct.shape.trim().length > 0
      ? baseProduct.shape
      : typeof baseProduct?.name === 'string' && baseProduct.type === 'Headstone'
        ? baseProduct.name
        : undefined;
  if (legacyShapeName) {
    store.setShapeUrl(resolveCanonicalShapeUrl(legacyShapeName));
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
  const baseItem = designData.find((item) => item.type === 'Base');
  // Legacy createJS replay scales positions with ratio_height (dyo.h / init_height)
  // for both axes in most branches. Keep a targeted parity mode for known outliers.
  const useLegacyRatioHeightMapping = designId === '1578016189116';
  // The /designs SVG renderer can also map with independent X/Y axis scaling
  // against init_width/init_height (not "contain" fitting into a square).
  const useContainParityMapping = false;
  const legacyReplayRatios = useLegacyRatioHeightMapping
    ? computeLegacyReplayRatios(canvasInfo.initW, canvasInfo.initH, canvasInfo.designDpr)
    : { ratio: 1, ratioWidth: 1, ratioHeight: 1 };

  const mapCanvasPointToSurfaceMm = (
    canvasX: number,
    canvasY: number,
    surfaceIsBase: boolean,
  ) => {
    const surfaceWidthMm = surfaceIsBase
      ? Number(baseItem?.width ?? baseProduct?.width ?? canvasInfo.initW)
      : Number(baseProduct?.width ?? canvasInfo.initW);
    const surfaceHeightMm = surfaceIsBase
      ? Number(baseItem?.height ?? 100)
      : Number(baseProduct?.height ?? canvasInfo.initH);

    const initW = canvasInfo.initW;
    const initH = canvasInfo.initH;
    const safeScale = Math.min(
      surfaceWidthMm / Math.max(initW, 1),
      surfaceHeightMm / Math.max(initH, 1),
    );
    const usedWidthMm = initW * safeScale;
    const usedHeightMm = initH * safeScale;
    const padX = (surfaceWidthMm - usedWidthMm) / 2;
    const padY = (surfaceHeightMm - usedHeightMm) / 2;

    const pxX = canvasX + initW / 2;
    const pxY = canvasY + initH / 2;

    const xPos = -surfaceWidthMm / 2 + padX + pxX * safeScale;
    const yPos = surfaceHeightMm / 2 - (padY + pxY * safeScale);

    return { xPos, yPos };
  };

  for (const insc of sortedInscriptions) {
    const text = insc.label || '';
    const font = insc.font_family || 'Arial';
    const surfaceIsBase = (insc.part?.toLowerCase() || '') === 'base';

    const rawFont = typeof insc.font === 'string' ? insc.font : '';
    const fontMatch = rawFont.match(/([\d.]+)px/);
    const fontPixels = fontMatch ? parseFloat(fontMatch[1]) : 0;

    const rawX = typeof insc.x === 'number' ? insc.x : 0;
    const rawY = typeof insc.y === 'number' ? insc.y : 0;
    const legacyScaledX = Math.round(legacyReplayRatios.ratioHeight * rawX);
    const legacyScaledY = Math.round(legacyReplayRatios.ratioHeight * rawY);
    const canvasX = canvasInfo.usesPhysicalCoords ? rawX / canvasInfo.designDpr : rawX;
    const canvasY = canvasInfo.usesPhysicalCoords ? rawY / canvasInfo.designDpr : rawY;

    const mmPerPxY = surfaceIsBase ? canvasInfo.mmPerPxYBase : canvasInfo.mmPerPxYHeadstone;
    const mmPerPxX = surfaceIsBase ? canvasInfo.mmPerPxXBase : canvasInfo.mmPerPxXHeadstone;
    const mmPerPxLegacy = mmPerPxY;

    const mapped = useContainParityMapping
      ? mapCanvasPointToSurfaceMm(canvasX, canvasY, surfaceIsBase)
      : useLegacyRatioHeightMapping
        ? {
            xPos: legacyScaledX * mmPerPxLegacy,
            yPos: -(legacyScaledY * mmPerPxLegacy),
          }
      : {
          xPos: canvasX * mmPerPxX,
          yPos: -(canvasY * mmPerPxY),
        };
    const xPos = mapped.xPos;
    const yPos = mapped.yPos;

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
      const legacyScaledX = Math.round(legacyReplayRatios.ratioHeight * rawX);
      const legacyScaledY = Math.round(legacyReplayRatios.ratioHeight * rawY);
      const canvasX = canvasInfo.usesPhysicalCoords ? rawX / canvasInfo.designDpr : rawX;
      const canvasY = canvasInfo.usesPhysicalCoords ? rawY / canvasInfo.designDpr : rawY;

      const mmPerPxY = surfaceIsBase ? canvasInfo.mmPerPxYBase : canvasInfo.mmPerPxYHeadstone;
      const mmPerPxX = surfaceIsBase ? canvasInfo.mmPerPxXBase : canvasInfo.mmPerPxXHeadstone;
      const mmPerPxLegacy = mmPerPxY;

      const mapped = useContainParityMapping
        ? mapCanvasPointToSurfaceMm(canvasX, canvasY, surfaceIsBase)
        : useLegacyRatioHeightMapping
          ? {
              xPos: legacyScaledX * mmPerPxLegacy,
              yPos: -(legacyScaledY * mmPerPxLegacy),
            }
        : {
            xPos: canvasX * mmPerPxX,
            yPos: -(canvasY * mmPerPxY),
          };
      const xPos = mapped.xPos;
      const yPos = mapped.yPos;

      let heightMm = 100;
      if (useLegacyRatioHeightMapping && typeof motif.ratio === 'number' && motif.ratio > 0) {
        const dims = await loadLegacyMotifDimensions(svgPath);
        const hasValidDpr = canvasInfo.designDpr > 1.1;
        const canvasHeight = dims.height * motif.ratio * (hasValidDpr ? canvasInfo.designDpr : 1);
        const legacyMappedHeight = Math.round(legacyReplayRatios.ratioHeight * canvasHeight);
        heightMm = legacyMappedHeight * mmPerPxLegacy;
      } else if (typeof motif.height === 'number' && motif.height > 0 && useLegacyRatioHeightMapping) {
        const legacyMappedHeight = Math.round(legacyReplayRatios.ratioHeight * motif.height);
        heightMm = legacyMappedHeight * mmPerPxLegacy;
      } else if (typeof motif.height === 'number' && motif.height > 10 && motif.height < 2000) {
        // Legacy payloads often persist motif.height in physical mm even when ratio is present.
        heightMm = motif.height;
      } else if (typeof motif.ratio === 'number' && motif.ratio > 0) {
        const dims = await loadLegacyMotifDimensions(svgPath);
        const hasValidDpr = canvasInfo.designDpr > 1.1;
        const canvasHeight = dims.height * motif.ratio * (hasValidDpr ? canvasInfo.designDpr : 1);
        heightMm = canvasHeight * mmPerPxY;
      } else if (typeof motif.height === 'number' && motif.height > 0) {
        const canvasHeight = canvasInfo.usesPhysicalCoords ? motif.height / canvasInfo.designDpr : motif.height;
        heightMm = canvasHeight * mmPerPxY;
      }
      heightMm = Math.max(20, Math.min(800, heightMm));

      const flipX = Number(motif.flipx) === -1;
      const flipY = Number(motif.flipy) === -1;

      store.setMotifOffset(newMotif.id, {
        xPos,
        yPos,
        scale: 1.0,
        rotationZ: typeof motif.rotation === 'number' ? (motif.rotation * Math.PI) / 180 : 0,
        heightMm,
        flipX,
        flipY,
        coordinateSpace: useContainParityMapping ? 'absolute' : undefined,
        target: surfaceIsBase ? 'base' : 'headstone',
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
    const embeddedLegacyRaw = designData.legacy?.raw;
    if (Array.isArray(embeddedLegacyRaw) && embeddedLegacyRaw.length > 0) {
      return embeddedLegacyRaw as SavedDesignData;
    }

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
  const ledgerComponent = designData.components?.ledger;
  const canonicalInscriptionSnapshot = designData.elements?.inscriptions ?? [];
  const canonicalMotifSnapshot = designData.elements?.motifs ?? [];
  const canonicalPhotoSnapshot = designData.elements?.photos ?? [];
  const headstoneHalf = headstone?.height_mm ? headstone.height_mm / 2 : null;
  const normalizedMlDir = (designData.source?.mlDir ?? '').toLowerCase();
  const isForevershining = normalizedMlDir === 'forevershining';
  const coordinateSystem = designData.scene?.coordinateSystem;
  const positionMode = coordinateSystem?.positionMode ?? 'legacy-stage-px';
  const coordinateSpace = coordinateSystem?.coordinateSpace ?? 'css-stage';
  const headstonePlacement =
    coordinateSystem?.headstonePlacement ?? (isForevershining ? 'auto-center' : 'legacy-stage-offset');
  const needsLegacyStageCompensation = headstonePlacement === 'legacy-stage-offset';
  let canonicalOutOfBounds = () => null as string | null;

  if (clearExisting) {
    store.setInscriptions([]);
    if (store.selectedMotifs.length) {
      [...store.selectedMotifs].forEach((motif) => store.removeMotif(motif.id));
    }
    if (store.selectedAdditions.length) {
      [...store.selectedAdditions].forEach((additionId) => store.removeAddition(additionId));
    }
    if (store.selectedImages.length) {
      [...store.selectedImages].forEach((image) => store.removeImage(image.id));
    }
    store.setSelectedImageId(null);
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
    store.setShapeUrl(resolveCanonicalShapeUrl(shapeName));
  }

  if (headstone?.width_mm) {
    store.setWidthMm(headstone.width_mm);
  }
  if (headstone?.height_mm) {
    store.setHeightMm(headstone.height_mm);
  }
  if (headstone?.thickness_mm) {
    store.setUprightThickness(headstone.thickness_mm);
    store.setSlantThickness(headstone.thickness_mm);
  }
  const enforceTexture = (
    type: 'headstone' | 'base',
    texture: string,
    attempt = 0,
  ) => {
    const setter = type === 'headstone'
      ? store.setHeadstoneMaterialUrl
      : store.setBaseMaterialUrl;
    const getter = type === 'headstone'
      ? () => useHeadstoneStore.getState().headstoneMaterialUrl
      : () => useHeadstoneStore.getState().baseMaterialUrl;

    // Signal ShapeSwapper that this is a material change so it updates visibleTex
    store.setIsMaterialChange(true);
    setter(texture);

    if (attempt >= 5) {
      // Clear flag after final attempt
      setTimeout(() => store.setIsMaterialChange(false), 300);
      return;
    }

    setTimeout(() => {
      if (getter() !== texture) {
        enforceTexture(type, texture, attempt + 1);
      } else {
        // Texture is set, clear the flag after a short delay
        setTimeout(() => store.setIsMaterialChange(false), 300);
      }
    }, 150 + attempt * 75);
  };

  if (headstone?.texture) {
    const mappedHeadstoneTexture = mapTexture(headstone.texture, String(productId ?? ''));
    enforceTexture('headstone', mappedHeadstoneTexture);
  } else {
    console.warn('[loadCanonical] NO headstone.texture found in canonical data');
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
      const mappedBaseTexture = mapTexture(base.texture, String(productId ?? ''));
      enforceTexture('base', mappedBaseTexture);
    }
  } else {
    store.setShowBase(false);
  }

  if (ledgerComponent) {
    store.setShowLedger(true);
    if (ledgerComponent.width_mm) {
      store.setLedgerWidthMm(ledgerComponent.width_mm);
    }
    if (ledgerComponent.depth_mm) {
      store.setLedgerDepthMm(ledgerComponent.depth_mm);
    }
    if (ledgerComponent.height_mm) {
      store.setLedgerHeightMm(ledgerComponent.height_mm);
    }
  } else {
    store.setShowLedger(false);
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
  const canonicalLedgerWidthMm = ledgerComponent?.width_mm ?? 0;
  const canonicalLedgerDepthMm = ledgerComponent?.depth_mm ?? 0;
  const canonicalLedgerHeightMm = ledgerComponent?.height_mm ?? 0;

  // Since we're loading a canonical design with its exact dimensions,
  // no scaling is needed - coordinates are already in the correct space
  const HEADSTONE_X_SCALE = 1;
  const HEADSTONE_Y_SCALE = 1;
  const BASE_X_SCALE = 1;
  const BASE_Y_SCALE = 1;

  const canonicalViewportWidthCssPx =
    coordinateSystem?.stageCssPx?.width ??
    designData.scene?.viewportPx?.width ??
    0;
  const canonicalViewportHeightCssPx =
    coordinateSystem?.stageCssPx?.height ??
    designData.scene?.viewportPx?.height ??
    0;
  const canonicalViewportDpr = designData.scene?.viewportPx?.dpr ?? 1;
  
  const bufferWidthPxFromMetadata = coordinateSystem?.bufferPx?.width;
  const bufferHeightPxFromMetadata = coordinateSystem?.bufferPx?.height;
  const canonicalViewportWidthPx =
    (typeof bufferWidthPxFromMetadata === 'number' && bufferWidthPxFromMetadata > 0)
      ? bufferWidthPxFromMetadata
      : canonicalViewportWidthCssPx > 0
        ? canonicalViewportWidthCssPx * canonicalViewportDpr
        : canonicalViewportWidthCssPx;
  const canonicalViewportHeightPx =
    (typeof bufferHeightPxFromMetadata === 'number' && bufferHeightPxFromMetadata > 0)
      ? bufferHeightPxFromMetadata
      : canonicalViewportHeightCssPx > 0
        ? canonicalViewportHeightCssPx * canonicalViewportDpr
        : canonicalViewportHeightCssPx;

  const safeViewportWidthPx = Math.max(canonicalViewportWidthPx || canonicalViewportWidthCssPx || 1, 1);
  const safeViewportHeightPx = Math.max(canonicalViewportHeightPx || canonicalViewportHeightCssPx || 1, 1);
  const useAuthoringDesignSpaceMapping = positionMode === 'legacy-stage-px';
  const maxAbsLegacyStageYPx = positionMode === 'legacy-stage-px'
    ? Math.max(
        ...[
          ...canonicalInscriptionSnapshot
            .filter((line) => canonicalSurfaceTarget(line.surface) === 'headstone')
            .map((line) => Math.abs(line.position?.y_px ?? 0)),
          ...canonicalMotifSnapshot
            .filter((motif) => canonicalSurfaceTarget(motif.surface) === 'headstone')
            .map((motif) => Math.abs(motif.position?.y_px ?? 0)),
          0,
        ],
      )
    : 0;
  const shouldTreatCssStageAsBufferPx =
    positionMode === 'legacy-stage-px' &&
    coordinateSpace === 'css-stage' &&
    canonicalViewportDpr > 1 &&
    canonicalViewportHeightCssPx > 0 &&
    maxAbsLegacyStageYPx > canonicalViewportHeightCssPx * 0.6;
  const effectiveCoordinateSpace = shouldTreatCssStageAsBufferPx ? 'buffer-px' : coordinateSpace;
  if (shouldTreatCssStageAsBufferPx) {
    console.info('[loadCanonicalDesignIntoEditor] Interpreting legacy-stage coordinates as buffer-px');
  }
  const sourceStageWidthPx = effectiveCoordinateSpace === 'buffer-px'
    ? Math.max(canonicalViewportWidthPx || canonicalViewportWidthCssPx || 1, 1)
    : Math.max(canonicalViewportWidthCssPx || 1, 1);
  const sourceStageHeightPx = effectiveCoordinateSpace === 'buffer-px'
    ? Math.max(canonicalViewportHeightPx || canonicalViewportHeightCssPx || 1, 1)
    : Math.max(canonicalViewportHeightCssPx || 1, 1);
  const authoringCanvasWidthPx = Math.max(canonicalViewportWidthCssPx || 1, 1);
  const authoringCanvasHeightPx = Math.max(canonicalViewportHeightCssPx || 1, 1);
  const totalMonumentHeightMm = Math.max(canonicalHeadstoneHeightMm + Math.max(canonicalBaseHeightMm, 0), 1);
  const legacyUsePx = Math.min(safeViewportWidthPx, safeViewportHeightPx) * 0.975;
  // Legacy CreateJS draws the monument within min(w,h)*DPR*0.975 px (uniform scale).
  // The headstone and base each take their proportional share of that draw area.
  const legacyHeadstoneDrawHeightPx =
    canonicalHeadstoneHeightMm > 0
      ? legacyUsePx * (canonicalHeadstoneHeightMm / totalMonumentHeightMm)
      : safeViewportHeightPx;
  const legacyBaseDrawHeightPx =
    canonicalBaseHeightMm > 0
      ? legacyUsePx * (canonicalBaseHeightMm / totalMonumentHeightMm)
      : safeViewportHeightPx;
  const legacyHeadstoneDrawWidthPx =
    canonicalHeadstoneWidthMm > 0 && canonicalHeadstoneHeightMm > 0
      ? Math.min(
          legacyUsePx,
          legacyHeadstoneDrawHeightPx * (canonicalHeadstoneWidthMm / canonicalHeadstoneHeightMm),
        )
      : safeViewportWidthPx;
  const legacyBaseDrawWidthPx =
    canonicalBaseWidthMm > 0 && canonicalBaseHeightMm > 0
      ? Math.min(legacyUsePx, legacyBaseDrawHeightPx * (canonicalBaseWidthMm / canonicalBaseHeightMm))
      : safeViewportWidthPx;

  const HEADSTONE_MM_PER_PX_X_CANONICAL =
    canonicalHeadstoneWidthMm > 0
      ? canonicalHeadstoneWidthMm / Math.max(legacyHeadstoneDrawWidthPx, 1)
      : 1;
  const HEADSTONE_MM_PER_PX_Y_CANONICAL =
    canonicalHeadstoneHeightMm > 0
      ? canonicalHeadstoneHeightMm / Math.max(legacyHeadstoneDrawHeightPx, 1)
      : 1;
  const BASE_MM_PER_PX_X_CANONICAL =
    canonicalBaseWidthMm > 0
      ? canonicalBaseWidthMm / Math.max(legacyBaseDrawWidthPx, 1)
      : HEADSTONE_MM_PER_PX_X_CANONICAL;
  const BASE_MM_PER_PX_Y_CANONICAL =
    canonicalBaseHeightMm > 0
      ? canonicalBaseHeightMm / Math.max(legacyBaseDrawHeightPx, 1)
      : HEADSTONE_MM_PER_PX_Y_CANONICAL;
  const LEDGER_MM_PER_PX_X_CANONICAL =
    canonicalLedgerWidthMm > 0
      ? canonicalLedgerWidthMm / Math.max(safeViewportWidthPx, 1)
      : HEADSTONE_MM_PER_PX_X_CANONICAL;
  const LEDGER_MM_PER_PX_Z_CANONICAL =
    canonicalLedgerDepthMm > 0
      ? canonicalLedgerDepthMm / Math.max(safeViewportHeightPx, 1)
      : HEADSTONE_MM_PER_PX_Y_CANONICAL;
  const HEADSTONE_HALF_MM = canonicalHeadstoneHeightMm ? canonicalHeadstoneHeightMm / 2 : 0;
  const BASE_HALF_MM = canonicalBaseHeightMm ? canonicalBaseHeightMm / 2 : 0;
  const BASE_CENTER_OFFSET_MM = HEADSTONE_HALF_MM + BASE_HALF_MM;
  const HEADSTONE_STAGE_OFFSET_MM = BASE_HALF_MM;
  const HEADSTONE_VERTICAL_BIAS_MM = needsLegacyStageCompensation && canonicalHeadstoneHeightMm
    ? canonicalHeadstoneHeightMm * 0.08
    : 0;
  let HEADSTONE_STAGE_SCALE = 1;

  const legacyHeadstoneItem = Array.isArray(designData.legacy?.raw)
    ? designData.legacy?.raw.find((item) => item?.type === 'Headstone' || item?.type === 'Plaque')
    : null;
  const legacyInscriptionFontPxByCanonicalId = new Map<string, number>();
  const legacyItemPartByCanonicalId = new Map<string, string>();
  const legacyMotifFlipByCanonicalId = new Map<string, { x: boolean; y: boolean }>();
  if (Array.isArray(designData.legacy?.raw)) {
    designData.legacy.raw.forEach((item) => {
      if (!item) return;
      const itemId = Number(item.itemID);
      const partLower = typeof item.part === 'string' ? item.part.toLowerCase() : '';
      if (Number.isFinite(itemId) && partLower) {
        if (item.type === 'Inscription') {
          legacyItemPartByCanonicalId.set(`insc-${itemId}`, partLower);
        } else if (item.type === 'Motif') {
          legacyItemPartByCanonicalId.set(`motif-${itemId}`, partLower);
        }
      }
      if (item.type === 'Inscription') {
        const fontStr = typeof item.font === 'string' ? item.font : '';
        const match = fontStr.match(/([\d.]+)px/i);
        const parsed = match ? Number(match[1]) : Number.NaN;
        if (Number.isFinite(itemId) && Number.isFinite(parsed) && parsed > 0) {
          legacyInscriptionFontPxByCanonicalId.set(`insc-${itemId}`, parsed);
        }
      }
      // Legacy flip values: -1 = flipped, 1 = not flipped (may be string or number)
      if (item.type === 'Motif' && Number.isFinite(itemId)) {
        legacyMotifFlipByCanonicalId.set(`motif-${itemId}`, {
          x: Number(item.flipx) === -1,
          y: Number(item.flipy) === -1,
        });
      }
    });
  }
  const legacyInitWidth = Number(
    legacyHeadstoneItem?.init_width ?? canonicalViewportWidthCssPx ?? Number.NaN,
  );
  const legacyInitHeight = Number(
    legacyHeadstoneItem?.init_height ?? canonicalViewportHeightCssPx ?? Number.NaN,
  );
  const legacySavedDprRaw = Number(
    legacyHeadstoneItem?.dpr ?? designData.scene?.viewportPx?.dpr ?? Number.NaN,
  );
  const hasLegacySavedDpr = Number.isFinite(legacySavedDprRaw) && legacySavedDprRaw > 0;
  const applyLegacyStageCompensation =
    needsLegacyStageCompensation && !hasLegacySavedDpr;
  const inferLegacySavedDprHeuristic = () => {
    if (hasLegacySavedDpr) return legacySavedDprRaw;
    if (typeof window === 'undefined') return 1;
    const headstoneYValues = [
      ...canonicalInscriptionSnapshot
        .filter((line) => canonicalSurfaceTarget(line.surface) === 'headstone')
        .map((line) => Math.abs(line.position?.y_px ?? 0)),
      ...canonicalMotifSnapshot
        .filter((motif) => canonicalSurfaceTarget(motif.surface) === 'headstone')
        .map((motif) => Math.abs(motif.position?.y_px ?? 0)),
    ].filter((value) => Number.isFinite(value) && value > 0) as number[];
    const maxAbsHeadstoneYPx = headstoneYValues.length ? Math.max(...headstoneYValues) : 0;
    if (maxAbsHeadstoneYPx <= 0 || HEADSTONE_HALF_MM <= 0) return 1;

    const targetSpreadMm = HEADSTONE_HALF_MM * 0.72;
    const candidateDprs = [1, 1.5, 2, 2.5, 3, 4];
    let best = 1;
    let bestScore = Number.POSITIVE_INFINITY;
    for (const candidate of candidateDprs) {
      const ratios = computeLegacyReplayRatios(
        Number.isFinite(legacyInitWidth) && legacyInitWidth > 0 ? legacyInitWidth : safeViewportWidthPx,
        Number.isFinite(legacyInitHeight) && legacyInitHeight > 0 ? legacyInitHeight : safeViewportHeightPx,
        candidate,
      );
      const spreadMm = maxAbsHeadstoneYPx * ratios.ratioHeight * HEADSTONE_MM_PER_PX_Y_CANONICAL;
      if (!Number.isFinite(spreadMm) || spreadMm <= 0) continue;
      const score = Math.abs(Math.log(spreadMm / targetSpreadMm));
      if (score < bestScore) {
        bestScore = score;
        best = candidate;
      }
    }
    return best;
  };
  const inferLegacySavedDprDeterministic = async (): Promise<number | null> => {
    if (hasLegacySavedDpr) return legacySavedDprRaw;
    const sourceId = designData.source?.id;
    const mlDir = designData.source?.mlDir;
    if (!sourceId || !mlDir) return null;
    const standards = [1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4];
    const snapToStandard = (value: number) =>
      standards.reduce((closest, candidate) =>
        Math.abs(candidate - value) < Math.abs(closest - value) ? candidate : closest,
      standards[0]);

    const savedAt = designData.source?.savedAt ? new Date(designData.source.savedAt) : null;
    const fromDate = savedAt && !Number.isNaN(savedAt.getTime())
      ? {
          year: String(savedAt.getFullYear()),
          month: String(savedAt.getMonth() + 1).padStart(2, '0'),
        }
      : null;
    const fromStamp = Number.isFinite(Number(sourceId))
      ? (() => {
          const dt = new Date(Number(sourceId));
          if (Number.isNaN(dt.getTime())) return null;
          return {
            year: String(dt.getFullYear()),
            month: String(dt.getMonth() + 1).padStart(2, '0'),
          };
        })()
      : null;

    const candidates = [fromDate, fromStamp]
      .filter((v): v is { year: string; month: string } => Boolean(v))
      .map((v) => `/ml/${mlDir}/saved-designs/screenshots/${v.year}/${v.month}/${sourceId}_cropped.json`);

    for (const metadataPath of candidates) {
      try {
        const response = await fetch(metadataPath, { cache: 'force-cache' });
        if (!response.ok) continue;
        const payload = await response.json() as {
          original?: { width?: number; height?: number };
        };
        const originalW = Number(payload?.original?.width ?? Number.NaN);
        const originalH = Number(payload?.original?.height ?? Number.NaN);
        const initW = Number.isFinite(legacyInitWidth) && legacyInitWidth > 0 ? legacyInitWidth : Number.NaN;
        const initH = Number.isFinite(legacyInitHeight) && legacyInitHeight > 0 ? legacyInitHeight : Number.NaN;
        const xRatio = Number.isFinite(originalW) && Number.isFinite(initW) && initW > 0 ? originalW / initW : Number.NaN;
        const yRatio = Number.isFinite(originalH) && Number.isFinite(initH) && initH > 0 ? originalH / initH : Number.NaN;
        const snappedX = Number.isFinite(xRatio) ? snapToStandard(xRatio) : Number.NaN;
        const snappedY = Number.isFinite(yRatio) ? snapToStandard(yRatio) : Number.NaN;

        // Width is usually the most deterministic signal for DPR in legacy captures;
        // height can include browser/toolbars and introduce extra blank stage space.
        let chosenDpr = Number.NaN;
        if (Number.isFinite(snappedX) && Math.abs(snappedX - xRatio) <= 0.2) {
          chosenDpr = snappedX;
        } else if (Number.isFinite(snappedY) && Math.abs(snappedY - yRatio) <= 0.2) {
          chosenDpr = snappedY;
        } else {
          const candidatesRaw = [xRatio, yRatio].filter((v) => Number.isFinite(v) && v >= 0.8 && v <= 4.5) as number[];
          if (!candidatesRaw.length) continue;
          const raw = candidatesRaw.length === 2 ? (candidatesRaw[0] + candidatesRaw[1]) / 2 : candidatesRaw[0];
          const snapped = snapToStandard(raw);
          if (Math.abs(snapped - raw) <= 0.35) {
            chosenDpr = snapped;
          }
        }

        if (Number.isFinite(chosenDpr) && chosenDpr > 0) return chosenDpr;
      } catch {
        // ignore and try next candidate path
      }
    }
    return null;
  };
  // Deterministic DPR: use stored value directly, default to 1 when absent.
  // Legacy CreateJS canvas was DPR-scaled (canvas.width = dyo.w * dyo.dpr),
  // and item positions were saved in DPR-scaled stage coordinates.
  const effectiveLegacySavedDpr = hasLegacySavedDpr ? legacySavedDprRaw : 1;
  const legacyDevice = String(legacyHeadstoneItem?.device ?? '').toLowerCase();
  const isDesktopLegacyPayload =
    legacyDevice === 'desktop' || legacyDevice.includes('desktop');
  // Use init dimensions directly for position conversion whenever available.
  // Legacy positions are center-relative offsets in the DPR-scaled canvas
  // (init_width × DPR by init_height × DPR physical pixels).
  const hasLegacyInitViewport =
    Number.isFinite(legacyInitWidth) &&
    legacyInitWidth > 0 &&
    Number.isFinite(legacyInitHeight) &&
    legacyInitHeight > 0;
  const useDirectCssStageDesktopMapping =
    positionMode === 'legacy-stage-px' &&
    hasLegacyInitViewport;
  const shouldUseAuthoringViewportReplay =
    !hasLegacySavedDpr &&
    Number.isFinite(canonicalViewportWidthCssPx) &&
    canonicalViewportWidthCssPx > 0 &&
    Number.isFinite(canonicalViewportHeightCssPx) &&
    canonicalViewportHeightCssPx > 0 &&
    Number.isFinite(canonicalViewportDpr) &&
    canonicalViewportDpr > 0;
  const legacyReplayRatios = positionMode === 'legacy-stage-px'
    ? computeLegacyReplayRatios(
        Number.isFinite(legacyInitWidth) && legacyInitWidth > 0 ? legacyInitWidth : safeViewportWidthPx,
        Number.isFinite(legacyInitHeight) && legacyInitHeight > 0 ? legacyInitHeight : safeViewportHeightPx,
        effectiveLegacySavedDpr,
        shouldUseAuthoringViewportReplay
          ? {
              width: canonicalViewportWidthCssPx,
              height: canonicalViewportHeightCssPx,
              dpr: canonicalViewportDpr,
            }
          : undefined,
      )
    : { ratio: 1, ratioWidth: 1, ratioHeight: 1 };
  // Universal authoring-space pipeline: canonical legacy-stage coordinates are already
  // expressed in authoring CSS-pixel space. Do not replay DPR/runtime ratio scaling.
  const shouldApplyLegacyReplayRatioHeight = false;
  const legacyStagePositionScale = 1;

  function convertPositionToMm(
    position: { x_mm?: number; y_mm?: number; x_px?: number; y_px?: number } | undefined,
    targetSurface: 'headstone' | 'base' | 'ledger',
  ) {
    const useBase = targetSurface === 'base';
    const useLedger = targetSurface === 'ledger';
    const mmPerPxXDefault = useLedger
      ? LEDGER_MM_PER_PX_X_CANONICAL
      : useBase
        ? BASE_MM_PER_PX_X_CANONICAL
        : HEADSTONE_MM_PER_PX_X_CANONICAL;
    const mmPerPxYDefault = useLedger
      ? LEDGER_MM_PER_PX_Z_CANONICAL
      : useBase
        ? BASE_MM_PER_PX_Y_CANONICAL
        : HEADSTONE_MM_PER_PX_Y_CANONICAL;
    // Legacy CreateJS uses uniform scaling: the monument fits inside
    // min(canvasW, canvasH) * DPR * 0.975 px. Use that for both X and Y.
    const legacyMonumentDrawPx =
      Math.min(legacyInitWidth, legacyInitHeight) * effectiveLegacySavedDpr * 0.975;
    const uniformMmPerPx = totalMonumentHeightMm / Math.max(legacyMonumentDrawPx, 1);
    const mmPerPxX =
      useDirectCssStageDesktopMapping && !useLedger && hasLegacyInitViewport
        ? uniformMmPerPx
        : mmPerPxXDefault;
    const mmPerPxY =
      useDirectCssStageDesktopMapping && !useLedger && hasLegacyInitViewport
        ? uniformMmPerPx
        : mmPerPxYDefault;

    if (typeof position?.x_mm === 'number' || typeof position?.y_mm === 'number') {
      return {
        xMm: position?.x_mm ?? 0,
        yMm: position?.y_mm ?? 0,
      };
    }

    if (positionMode === 'surface-mm') {
      return {
        xMm: position?.x_px ?? 0,
        yMm: position?.y_px ?? 0,
      };
    }

    const xPx = position?.x_px ?? 0;
    const yPx = position?.y_px ?? 0;
    // Legacy parser applies ratio_height to both X and Y for loaded items.
    const replayRatioHeight = shouldApplyLegacyReplayRatioHeight
      ? legacyReplayRatios.ratioHeight
      : 1;
    const stageXMmRaw = xPx * mmPerPxX * replayRatioHeight * legacyStagePositionScale;
    const stageYMmRaw = -yPx * mmPerPxY * replayRatioHeight * legacyStagePositionScale;
    const stageXMm = stageXMmRaw;
    const stageYMm = stageYMmRaw;
    if (useLedger) {
      return { xMm: stageXMm, yMm: stageYMm };
    }
    // Legacy stage-offset payloads can encode headstone elements in total-monument stage space.
    // Convert those to headstone-local center by removing the base-half vertical offset.
    const shouldApplyHeadstoneStageOffset =
      !useBase &&
      !useLedger &&
      needsLegacyStageCompensation &&
      effectiveCoordinateSpace === 'css-stage' &&
      !useDirectCssStageDesktopMapping;
    const headstoneStageOffsetMm = shouldApplyHeadstoneStageOffset ? HEADSTONE_STAGE_OFFSET_MM : 0;
    // Legacy 2D coordinates are center-origin on the headstone surface (0,0 = center).
    // Base elements still need base-center remap; headstone uses stage-offset normalization above.
    let yMm = useBase ? stageYMm + BASE_CENTER_OFFSET_MM : stageYMm - headstoneStageOffsetMm;
    if (!useBase && applyLegacyStageCompensation) {
      yMm = yMm * HEADSTONE_STAGE_SCALE + HEADSTONE_VERTICAL_BIAS_MM;
    }
    return { xMm: stageXMm, yMm };
  }

  function resolveFontSizeMm(
    font: { size_mm?: number; size_px?: number } | undefined,
    targetSurface: 'headstone' | 'base' | 'ledger',
    canonicalInscriptionId?: string,
  ) {
    if (typeof font?.size_mm === 'number') return font.size_mm;
    let sizePx =
      (canonicalInscriptionId
        ? legacyInscriptionFontPxByCanonicalId.get(canonicalInscriptionId)
        : undefined) ??
      font?.size_px ??
      40;
    // Both systems store font_size in mm in the saved JSON (product catalog units).
    // Only the CSS font string from legacy.raw (e.g. "104.34px Garamond") is in
    // rendering px. If we didn't get a CSS string, size_px is actually the mm value.
    const gotLegacyCssPx = canonicalInscriptionId
      ? legacyInscriptionFontPxByCanonicalId.has(canonicalInscriptionId)
      : false;
    if (!gotLegacyCssPx) return sizePx;
    // Universal authoring-space pipeline: keep saved font px as-is (CSS px),
    // then convert once using surface mm-per-px mapping.
    const mmPerPxY =
      targetSurface === 'ledger'
        ? LEDGER_MM_PER_PX_Z_CANONICAL
        : targetSurface === 'base'
          ? BASE_MM_PER_PX_Y_CANONICAL
          : HEADSTONE_MM_PER_PX_Y_CANONICAL;
    return sizePx * mmPerPxY;
  }

  function resolveMotifHeightMm(
    motif: { height_mm?: number; height_px?: number } | undefined,
    targetSurface: 'headstone' | 'base' | 'ledger',
  ) {
    if (typeof motif?.height_mm === 'number') return motif.height_mm;
    if (typeof motif?.height_px === 'number') {
      // Forevershining legacy stores motif heights in mm (product catalog units),
      // not CSS pixels. The converter misnamed them as height_px.
      if (isForevershining) return motif.height_px;
      // Headstonesdesigner stores motif heights in design pixel coordinates
      // (proportional to init_height canvas size, not physical draw px).
      // Convert: height_mm = height_px × headstoneHeightMm / init_height
      if (
        Number.isFinite(legacyInitHeight) &&
        legacyInitHeight > 0 &&
        canonicalHeadstoneHeightMm > 0
      ) {
        return motif.height_px * canonicalHeadstoneHeightMm / legacyInitHeight;
      }
      // Fallback when init_height is unavailable: use draw-px based conversion
      const mmPerPxY =
        targetSurface === 'ledger'
          ? LEDGER_MM_PER_PX_Z_CANONICAL
          : targetSurface === 'base'
            ? BASE_MM_PER_PX_Y_CANONICAL
            : HEADSTONE_MM_PER_PX_Y_CANONICAL;
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
      if (target !== 'headstone') {
        return max;
      }
      const { yMm } = convertPositionToMm(line.position, target);
      return Math.max(max, Math.abs(yMm));
    }, 0);
    if (headstoneInscriptionMax > headstoneLimit) {
      return 'inscriptions exceed headstone bounds';
    }

    let headstoneMotifMax = 0;
    let baseMotifMax = 0;
    canonicalMotifSnapshot.forEach((motif) => {
      const target = canonicalSurfaceTarget(motif.surface);
      if (target === 'ledger') {
        return;
      }
      const { yMm } = convertPositionToMm(motif.position, target);
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
      if (target === 'ledger') {
        return max;
      }
      const { yMm } = convertPositionToMm(motif.position, target);
      return Math.max(max, Math.abs(yMm));
    }, 0);
    const combinedLimit = stageHalf + tolerance;
    if (maxMotifSpread > combinedLimit * 1.1) {
      return 'motif coordinates appear to be in stage space';
    }

    return null;
  };

  const GLOBAL_LAYOUT_SCALE = 1;
  const DEFAULT_HEADSTONE_Y_SHIFT_MM = applyLegacyStageCompensation ? HEADSTONE_HALF_MM / 2 : 0;
  const BASE_Y_SHIFT_MM = applyLegacyStageCompensation ? HEADSTONE_HALF_MM / 2 : 0;
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

  const fallbackReason = canonicalOutOfBounds();
  const loadPolicy = await resolveCanonicalLoadPolicy(designData, fallbackReason);
  if (loadPolicy.mode === 'legacy-fallback') {
    console.warn(
      `[loadCanonicalDesignIntoEditor] ${loadPolicy.reason}; attempting legacy fallback via ${designData.source?.legacyFile ?? 'N/A'}`,
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
  } else {
    console.log(`[loadCanonicalDesignIntoEditor] Using canonical coordinates (${loadPolicy.reason})`);
  }

  type PendingMotifData = {
    svgPath: string;
    color: string;
  target: 'headstone' | 'base' | 'ledger';
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
  if (applyLegacyStageCompensation) {
    HEADSTONE_STAGE_SCALE = CANONICAL_TOTAL_HEIGHT_MM
      ? canonicalHeadstoneHeightMm / CANONICAL_TOTAL_HEIGHT_MM
      : 1;
  } else {
    HEADSTONE_STAGE_SCALE = 1;
  }
  
  // Calculate base canvas height in pixels using the same ratio as headstone
  const headstoneCanvasRatio = canonicalViewportHeightCssPx / canonicalHeadstoneHeightMm;
  const baseCanvasHeightPx = canonicalBaseHeightMm * headstoneCanvasRatio;
  const totalCanvasHeightPx = canonicalViewportHeightCssPx + baseCanvasHeightPx;
  
  const DISPLAY_RATIO = totalCanvasHeightPx / CANONICAL_TOTAL_HEIGHT_MM;
  
  const getMotifSizeScale = () => 1.2;


  const motifAssetMap = buildCanonicalMotifPathMap(designData);
  const headstoneRangeTracker = createRangeTracker();
  const headstoneInscriptionRangeTracker = createRangeTracker();
  const headstoneMotifRangeTracker = createRangeTracker();
  const pendingLines: Array<{ target: 'headstone' | 'base' | 'ledger'; line: Line }> = [];
  const pendingMotifs: PendingMotifData[] = [];
  const pendingImages: Array<{
    id: string;
    typeId: number;
    typeName: string;
    imageUrls: string[];
    widthMm: number;
    heightMm: number;
    xPos: number;
    yPos: number;
    rotationZ: number;
    sizeVariant?: number;
    croppedAspectRatio?: number;
    maskShape?: string;
    target: 'headstone' | 'base' | 'ledger';
  }> = [];

  (designData.elements?.inscriptions ?? []).forEach((inscription, index) => {
    const id = inscription.id ?? `insc-${index}`;
    const text = decodeHtmlEntities(inscription.text ?? '');
    let targetSurface = canonicalSurfaceTarget(inscription.surface);
    let { xMm, yMm } = convertPositionToMm(inscription.position, targetSurface);

    // Infer base target from legacy part field or position below headstone
    if (
      targetSurface === 'headstone' &&
      positionMode === 'legacy-stage-px' &&
      HEADSTONE_HALF_MM > 0 &&
      BASE_HALF_MM > 0
    ) {
      const legacyPart = legacyItemPartByCanonicalId.get(id);
      if (legacyPart === 'base' || yMm < -(HEADSTONE_HALF_MM * 1.02)) {
        targetSurface = 'base';
        ({ xMm, yMm } = convertPositionToMm(inscription.position, 'base'));
      }
    }

    const scaleX =
      targetSurface === 'base'
        ? BASE_X_SCALE
        : targetSurface === 'ledger'
          ? 1
          : HEADSTONE_X_SCALE;
    const scaleY =
      targetSurface === 'base'
        ? BASE_Y_SCALE
        : targetSurface === 'ledger'
          ? 1
          : HEADSTONE_Y_SCALE;
    const xPos = xMm * scaleX * GLOBAL_LAYOUT_SCALE;
    const baseYPos = yMm * scaleY * GLOBAL_LAYOUT_SCALE;
    const baseSize = clampCanonicalSize(resolveFontSizeMm(inscription.font, targetSurface, id));
    const scaledSize = clampCanonicalSize(baseSize * GLOBAL_LAYOUT_SCALE);

    if (targetSurface === 'headstone') {
      recordRangeValue(headstoneRangeTracker, baseYPos);
      recordRangeValue(headstoneInscriptionRangeTracker, baseYPos);
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
    let target = canonicalSurfaceTarget(motif.surface);
    let { xMm, yMm } = convertPositionToMm(motif.position, target);

    // Infer base target from position below headstone bounds
    if (
      target === 'headstone' &&
      positionMode === 'legacy-stage-px' &&
      HEADSTONE_HALF_MM > 0 &&
      BASE_HALF_MM > 0 &&
      yMm < -(HEADSTONE_HALF_MM * 1.02)
    ) {
      target = 'base';
      ({ xMm, yMm } = convertPositionToMm(motif.position, 'base'));
    }

    const scaleX =
      target === 'base'
        ? BASE_X_SCALE
        : target === 'ledger'
          ? 1
          : HEADSTONE_X_SCALE;
    const scaleY =
      target === 'base'
        ? BASE_Y_SCALE
        : target === 'ledger'
          ? 1
          : HEADSTONE_Y_SCALE;
    const xPos = xMm * scaleX * GLOBAL_LAYOUT_SCALE;
    const baseYPos = yMm * scaleY * GLOBAL_LAYOUT_SCALE;
    const canonicalHeight = clampCanonicalMotifHeight(resolveMotifHeightMm(motif, target));
    const scaledHeight = clampCanonicalMotifHeight(canonicalHeight * GLOBAL_LAYOUT_SCALE);
    const rotationZ = canonicalToRadians(motif.rotation?.z_deg);
    // Prefer legacy.raw flip values (handles both string/number types correctly).
    // Fall back to canonical flip bools when legacy.raw is unavailable.
    const legacyFlip = legacyMotifFlipByCanonicalId.get(motif.id);
    const flipX = legacyFlip ? legacyFlip.x : (motif.flip?.x ?? false);
    const flipY = legacyFlip ? legacyFlip.y : (motif.flip?.y ?? false);

    if (target === 'headstone') {
      recordRangeValue(headstoneRangeTracker, baseYPos);
      recordRangeValue(headstoneMotifRangeTracker, baseYPos);
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

  // If no canonical photos but legacy.raw has Photo/Picture items, synthesise entries
  const effectivePhotos: typeof canonicalPhotoSnapshot =
    canonicalPhotoSnapshot.length > 0
      ? canonicalPhotoSnapshot
      : (() => {
          if (!Array.isArray(designData.legacy?.raw)) return [];
          return designData.legacy.raw
            .filter(
              (item): item is Record<string, unknown> =>
                !!item &&
                (item.type === 'Photo' || item.type === 'Picture'),
            )
            .map((item) => {
              const sizeStr = typeof item.size === 'string' ? item.size : '';
              const sizeMatch = sizeStr.match(/([\d.]+)\s*x\s*([\d.]+)/i);
              const widthMm = sizeMatch ? Number(sizeMatch[1]) : undefined;
              const heightMm = sizeMatch ? Number(sizeMatch[2]) : undefined;
              const partStr = typeof item.part === 'string' ? item.part.toLowerCase() : 'headstone';
              const sideStr = typeof item.side === 'string' ? item.side.toLowerCase() : 'front';
              return {
                id: `photo-${item.itemID ?? item.id ?? 0}`,
                typeId: typeof item.productid === 'number' ? item.productid : 7,
                typeName: typeof item.name === 'string' ? item.name : 'Ceramic Image',
                surface: `${partStr}/${sideStr}`,
                position: {
                  x_px: typeof item.x === 'number' ? item.x : 0,
                  y_px: typeof item.y === 'number' ? item.y : 0,
                },
                width_mm: widthMm,
                height_mm: heightMm,
                rotation: { z_deg: typeof item.rotation === 'number' ? item.rotation : 0 },
                source: {
                  item: typeof item.item === 'string' ? item.item : undefined,
                  src: typeof item.src === 'string' ? item.src : undefined,
                  path: typeof item.path === 'string' ? item.path : undefined,
                },
                mask: {
                  shape: typeof item.shape_url === 'string' ? item.shape_url : undefined,
                },
              };
            });
        })();

  effectivePhotos.forEach((photo, index) => {
    const canonicalId = photo.id ?? `photo-${index}`;
    const target = canonicalSurfaceTarget(photo.surface);
    const { xMm, yMm } = convertPositionToMm(photo.position, target);
    const primaryImageUrl = resolveCanonicalImageUrl(designData, photo.source);
    const imageUrlCandidates = [
      primaryImageUrl,
      (() => {
        const srcName = asString(photo.source?.src);
        const pathName = normalizeLegacyRelativePath(asString(photo.source?.path));
        const mlDir = (designData.source?.mlDir ?? '').trim();
        if (srcName && pathName && mlDir) return `/ml/${mlDir}/saved-designs/${pathName}/${srcName}`;
        return '';
      })(),
      (() => {
        const itemName = asString(photo.source?.item);
        const pathName = normalizeLegacyRelativePath(asString(photo.source?.path));
        const mlDir = (designData.source?.mlDir ?? '').trim();
        if (itemName && pathName && mlDir) return `/ml/${mlDir}/saved-designs/${pathName}/${itemName}`;
        return '';
      })(),
    ].filter((v): v is string => Boolean(v && v.trim()));
    // Always include the vitreous enamel placeholder so photos render even if the original image is gone
    if (!imageUrlCandidates.length) {
      imageUrlCandidates.push('/jpg/photos/vitreous-enamel-image.jpg');
    }

    const sourceSizeMm =
      (typeof photo.size_mm?.width === 'number' && typeof photo.size_mm?.height === 'number')
        ? { width: photo.size_mm.width, height: photo.size_mm.height }
        : null;
    const sourceWidthPx = photo.width_px;
    const sourceHeightPx = photo.height_px;
    const mmPerPxX = target === 'ledger'
      ? LEDGER_MM_PER_PX_X_CANONICAL
      : target === 'base'
        ? BASE_MM_PER_PX_X_CANONICAL
        : HEADSTONE_MM_PER_PX_X_CANONICAL;
    const mmPerPxY = target === 'ledger'
      ? LEDGER_MM_PER_PX_Z_CANONICAL
      : target === 'base'
        ? BASE_MM_PER_PX_Y_CANONICAL
        : HEADSTONE_MM_PER_PX_Y_CANONICAL;
    const widthMmRaw =
      typeof photo.width_mm === 'number'
        ? photo.width_mm
        : sourceSizeMm?.width ??
          (typeof sourceWidthPx === 'number' && sourceWidthPx > 0 ? sourceWidthPx * mmPerPxX : undefined) ??
          180;
    const heightMmRaw =
      typeof photo.height_mm === 'number'
        ? photo.height_mm
        : sourceSizeMm?.height ??
          (typeof sourceHeightPx === 'number' && sourceHeightPx > 0 ? sourceHeightPx * mmPerPxY : undefined) ??
          240;
    const widthMm = Math.max(20, Math.min(1200, widthMmRaw));
    const heightMm = Math.max(20, Math.min(1200, heightMmRaw));

    pendingImages.push({
      id: canonicalId,
      typeId:
        typeof photo.typeId === 'number'
          ? photo.typeId
          : 7,
      typeName: photo.typeName ?? 'Ceramic Image',
      imageUrls: Array.from(new Set(imageUrlCandidates)),
      widthMm,
      heightMm,
      xPos: xMm,
      yPos: yMm,
      rotationZ: canonicalToRadians(photo.rotation?.z_deg),
      sizeVariant: photo.sizeVariant,
      croppedAspectRatio:
        photo.croppedAspectRatio ??
        (heightMm > 0 ? widthMm / heightMm : undefined),
      maskShape: resolveCanonicalMaskShape(
        asString(photo.mask?.shape) ??
        asString(photo.mask?.shape_url),
      ),
      target,
    });
  });

  // Auto-center against inscription range first (if available), so motifs do not
  // pull inscription layout downward in legacy-stage coordinate loads.
  const headstoneShiftSourceTracker =
    headstoneInscriptionRangeTracker.count > 0
      ? headstoneInscriptionRangeTracker
      : headstoneRangeTracker.count > 0
        ? headstoneRangeTracker
        : headstoneMotifRangeTracker;
  const headstoneShiftMm = useAuthoringDesignSpaceMapping
    ? 0
    : computeHeadstoneShift(
        headstoneShiftSourceTracker,
        HEADSTONE_HALF_MM,
        DEFAULT_HEADSTONE_Y_SHIFT_MM,
        headstonePlacement === 'auto-center' ? 'auto-center' : 'default',
      );
  const rangeFitHeadstoneShiftMm =
    useAuthoringDesignSpaceMapping &&
    !useDirectCssStageDesktopMapping &&
    headstoneShiftSourceTracker.count > 0 &&
    HEADSTONE_HALF_MM > 0
      ? (() => {
          const currentMinY = headstoneShiftSourceTracker.min;
          const currentMaxY = headstoneShiftSourceTracker.max;
          const currentRange = Math.max(currentMaxY - currentMinY, 1);
          const targetTop = HEADSTONE_HALF_MM * 0.88;
          const targetBottom = targetTop - currentRange;
          let shift = targetTop - currentMaxY;
          if (currentMinY + shift < -HEADSTONE_HALF_MM) {
            shift = -HEADSTONE_HALF_MM - currentMinY;
          }
          if (currentMaxY + shift > HEADSTONE_HALF_MM) {
            shift = HEADSTONE_HALF_MM - currentMaxY;
          }
          if (currentMinY + shift < targetBottom) {
            shift += targetBottom - (currentMinY + shift);
          }
          return shift;
        })()
      : 0;
  const baseShiftMm = BASE_Y_SHIFT_MM;

  const canonicalLines: Line[] = pendingLines.map((entry) => {
    const shift =
      entry.target === 'base'
        ? baseShiftMm
        : entry.target === 'headstone'
          ? headstoneShiftMm + rangeFitHeadstoneShiftMm
          : 0;
    return {
      ...entry.line,
      yPos: entry.line.yPos + shift,
      coordinateSpace: 'mm-center' as const,
    };
  });

  store.setInscriptions(canonicalLines);
  store.setActiveInscriptionText(canonicalLines[0]?.text ?? '');
  store.setSelectedInscriptionId(null);

  if (pendingMotifs.length > 0) {
    pendingMotifs.forEach((motifData) => {
      store.addMotif(motifData.svgPath);

      const updatedState = useHeadstoneStore.getState();
      const addedMotifs = updatedState.selectedMotifs;
      if (!addedMotifs.length) return;
      const newMotif = addedMotifs[addedMotifs.length - 1];

      store.setMotifColor(newMotif.id, motifData.color);

      store.setMotifOffset(newMotif.id, {
        xPos: motifData.xPos,
        yPos:
          motifData.yPos +
          (motifData.target === 'base'
            ? baseShiftMm
            : motifData.target === 'headstone'
              ? headstoneShiftMm + rangeFitHeadstoneShiftMm
              : 0),
        scale: 1.0,
        rotationZ: motifData.rotationZ,
        heightMm: motifData.heightMm,
        target: motifData.target,
        coordinateSpace: 'mm-center',
        flipX: motifData.flipX,
        flipY: motifData.flipY,
      });
    });

    store.setSelectedMotifId(null);
    store.setActivePanel(null);
  
  } else {
    console.warn('[loadCanonicalDesignIntoEditor] No motif data available');
  }

  if (pendingImages.length > 0) {
    pendingImages.forEach((imageData) => {
      const shift =
        imageData.target === 'base'
          ? baseShiftMm
          : imageData.target === 'headstone'
            ? headstoneShiftMm + rangeFitHeadstoneShiftMm
            : 0;
      store.addImage({
        id: imageData.id,
        typeId: imageData.typeId,
        typeName: imageData.typeName,
        imageUrl: imageData.imageUrls[0],
        widthMm: imageData.widthMm,
        heightMm: imageData.heightMm,
        xPos: imageData.xPos,
        yPos: imageData.yPos + shift,
        rotationZ: imageData.rotationZ,
        sizeVariant: imageData.sizeVariant,
        croppedAspectRatio: imageData.croppedAspectRatio,
        maskShape: imageData.maskShape,
        target: imageData.target,
        coordinateSpace: 'mm-center',
      });
    });
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

