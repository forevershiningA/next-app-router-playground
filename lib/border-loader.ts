/**
 * Border loader for bronze plaques
 * Loads and processes Adobe Animate encoded border data
 */

import { decodeAdobeAnimatePath, type DecodedShape } from './adobe-animate-decoder';

export interface BorderData {
  name: string;
  data: string;
  detail_top?: string;
  detail_bottom?: string;
  detail_left?: string;
  detail_right?: string;
}

export interface ProcessedBorder {
  name: string;
  main: DecodedShape;
  details?: {
    top?: DecodedShape;
    bottom?: DecodedShape;
    left?: DecodedShape;
    right?: DecodedShape;
  };
}

/**
 * Load border JSON file
 */
export async function loadBorderData(borderName: string): Promise<BorderData> {
  // Convert "Border 1" to "border1"
  const filename = borderName.toLowerCase().replace(/\s+/g, '');
  const url = `/json/borders/${filename}.json`;
  
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load border: ${borderName} from ${url}`);
  }
  
  return response.json();
}

/**
 * Process border data by decoding all paths
 */
export function processBorderData(borderData: BorderData): ProcessedBorder {
  const main = decodeAdobeAnimatePath(borderData.data);
  
  const details: ProcessedBorder['details'] = {};
  
  if (borderData.detail_top) {
    details.top = decodeAdobeAnimatePath(borderData.detail_top);
  }
  if (borderData.detail_bottom) {
    details.bottom = decodeAdobeAnimatePath(borderData.detail_bottom);
  }
  if (borderData.detail_left) {
    details.left = decodeAdobeAnimatePath(borderData.detail_left);
  }
  if (borderData.detail_right) {
    details.right = decodeAdobeAnimatePath(borderData.detail_right);
  }
  
  return {
    name: borderData.name,
    main,
    details: Object.keys(details).length > 0 ? details : undefined,
  };
}

/**
 * Load and process a border in one call
 */
export async function loadBorder(borderName: string): Promise<ProcessedBorder> {
  const borderData = await loadBorderData(borderName);
  return processBorderData(borderData);
}

/**
 * Create SVG from border path for use as texture
 */
export function createBorderSVG(
  decoded: DecodedShape,
  color: string,
  width?: number,
  height?: number
): string {
  const { bounds, svgPath } = decoded;
  
  const w = width || bounds.width;
  const h = height || bounds.height;
  const viewBox = `${bounds.left} ${bounds.top} ${bounds.width} ${bounds.height}`;
  
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${w}" height="${h}">
  <path d="${svgPath}" fill="${color}" />
</svg>`;
}

/**
 * Create a repeating pattern SVG for border details
 */
export function createBorderPatternSVG(
  decoded: DecodedShape,
  color: string,
  patternId: string
): string {
  const { bounds, svgPath } = decoded;
  
  return `<svg xmlns="http://www.w3.org/2000/svg">
  <defs>
    <pattern id="${patternId}" x="0" y="0" width="${bounds.width}" height="${bounds.height}" patternUnits="userSpaceOnUse">
      <path d="${svgPath}" fill="${color}" />
    </pattern>
  </defs>
</svg>`;
}
