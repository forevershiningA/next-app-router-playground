/**
 * SVG Generator for Saved Designs
 * 
 * Universal Display Algorithm:
 * - Stage 1: Build Design Space (reproduce authoring scene exactly)
 * - Stage 2: Scale Design Space to display container (uniform scale)
 * - No DPR logic, no physical mm conversions for screen display
 * - Perfect screenshot fidelity across all devices
 */

interface DesignItem {
  type: string;
  [key: string]: any;
}

interface SVGGeneratorOptions {
  designData: DesignItem[];
  initWidth: number;
  initHeight: number;
  shapeImagePath?: string;
  textureData?: string;
  isLaserEtched?: boolean;
}

type ViewBox = { vx: number; vy: number; vw: number; vh: number };

type AuthoringInfo = {
  initW: number;
  initH: number;
  offsetX?: number;  // default 0
  offsetY?: number;  // default 0
  origin?: 'center' | 'topLeft'; // default 'center'
};

type Authoring = {
  w: number;
  h: number;
  origin?: 'center' | 'topLeft';
};

type Viewport = {
  w: number;
  h: number;
  pad?: number;
};

type Transform = {
  s: number;  // scale
  ox: number; // offset x
  oy: number; // offset y
};

type Num = number;

type ContainerInfo = { width: number; height: number };

type StoneInfo = {
  viewBox: ViewBox;            // from the headstone SVG
  // physical sizes only needed for print/export, not for display
  widthMm?: number;
  heightMm?: number;
};

/**
 * Universal mapping function implementing the two-stage transform:
 * 1. Authoring → Design Space (canonical poster)
 * 2. Design Space → Display container
 */
export function buildUniversalMapping(
  authoring: AuthoringInfo,
  container: ContainerInfo,
  stone: StoneInfo
) {
  const { initW, initH } = authoring;
  const { width: containerW, height: containerH } = container;
  const { vw, vh } = stone.viewBox;

  // --- Stage 1: authoring → design space (same size as authoring) ---
  const stoneScale0 = Math.min(initW / vw, initH / vh);

  // Position stone: centered horizontally, at top vertically
  const stoneDx0 =
    (initW - vw * stoneScale0) / 2 + (authoring.offsetX ?? 0);
  const stoneDy0 =
    0 + (authoring.offsetY ?? 0); // Top of canvas, not centered

  // --- Stage 2: design space → display container ---
  const uniformScale = Math.min(containerW / initW, containerH / initH);

  // Derived stone transform in display space
  const stoneScale = stoneScale0 * uniformScale;
  const stoneDx = stoneDx0 * uniformScale;
  const stoneDy = stoneDy0 * uniformScale;

  function mapPointAuthoringToDisplay(xSaved: number, ySaved: number) {
    let designX: number;
    let designY: number;

    if ((authoring.origin ?? 'center') === 'center') {
      // center-origin authoring (x right+, y up+)
      designX = initW / 2 + xSaved;
      designY = initH / 2 - ySaved;
    } else {
      // top-left origin authoring (x right+, y down+)
      designX = xSaved;
      designY = ySaved;
    }

    return {
      x: designX * uniformScale,
      y: designY * uniformScale,
    };
  }

  function scaleSizeAuthoringToDisplay(sizePx: number) {
    return sizePx * uniformScale;
  }

  return {
    // Display-space stone transform for <svg> rendering:
    stoneTransform: {
      scale: stoneScale,
      dx: stoneDx,
      dy: stoneDy,
    },

    // Mapping utilities for inscriptions & motifs:
    mapPointAuthoringToDisplay,
    scaleSizeAuthoringToDisplay,

    // For layout/debug:
    uniformScale,
    stoneScale0,
    stoneDx0,
    stoneDy0,
  };
}

/**
 * Decode HTML entities (fixes Heaven&apos;s)
 */
export function decodeHtmlEntities(str: string): string {
  if (!str) return str;
  return str
    .replace(/&apos;/g, "'")
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

/**
 * Compute DPR-agnostic uniform scale that preserves layout
 */
export function computeUniformScale(vp: Viewport, au: Authoring): Transform {
  const pad = vp.pad ?? 0;
  const availW = Math.max(1, vp.w - pad * 2);
  const availH = Math.max(1, vp.h - pad * 2);

  // Contain the authoring canvas inside the viewport
  const s = Math.min(availW / au.w, availH / au.h);

  // Center the authored canvas within the viewport
  const ox = (vp.w - au.w * s) / 2;
  const oy = (vp.h - au.h * s) / 2;

  return { s, ox, oy };
}

/**
 * Map saved (authoring) coordinate to display coordinates
 */
export function mapXY(
  xAuth: Num,
  yAuth: Num,
  vp: Viewport,
  au: Authoring,
  t: Transform
): { x: Num; y: Num } {
  if (au.origin === "center") {
    // saved X,Y relative to authoring-center
    return {
      x: t.ox + (au.w / 2 + xAuth) * t.s,
      y: t.oy + (au.h / 2 + yAuth) * t.s,
    };
  }
  // saved X,Y are top-left based in authoring pixels
  return {
    x: t.ox + xAuth * t.s,
    y: t.oy + yAuth * t.s,
  };
}

/**
 * Map authoring size to display size
 */
export function mapSize(sizeAuthPx: Num, t: Transform): Num {
  return sizeAuthPx * t.s;
}

/**
 * Generate complete SVG for a saved design using Universal Display Algorithm
 */
export async function generateDesignSVG(options: SVGGeneratorOptions): Promise<string> {
  const { designData, initWidth, initHeight, shapeImagePath, textureData, isLaserEtched } = options;

  // Extract design elements
  const headstone = designData.find(item => item.type === 'Headstone');
  const inscriptions = designData.filter(item => item.type === 'Inscription');
  const motifs = designData.filter(item => item.type === 'Motif');

  if (!headstone) {
    throw new Error('No headstone data found in design');
  }

  const shapeName = headstone?.shape || 'Unknown';
  
  // Load shape SVG to extract viewBox
  const shapeViewBox = await extractShapeViewBox(shapeName, shapeImagePath);
  
  // Build universal mapping
  const authoring: AuthoringInfo = {
    initW: initWidth,
    initH: initHeight,
    offsetX: 0,
    offsetY: 0,
    origin: 'center' // Saved designs use center-origin coordinates
  };
  
  const container: ContainerInfo = {
    width: initWidth,
    height: initHeight
  };
  
  const stone: StoneInfo = {
    viewBox: shapeViewBox
  };
  
  const mapping = buildUniversalMapping(authoring, container, stone);

  // Build SVG parts using universal mapping
  const defsContent = await generateDefs(textureData, isLaserEtched, shapeViewBox.vw, shapeViewBox.vh);
  const shapeContent = await generateShapeUniversal(shapeName, shapeImagePath, textureData, isLaserEtched, mapping);
  const inscriptionsContent = generateInscriptionsUniversal(inscriptions, mapping);
  const motifsContent = generateMotifsUniversal(motifs, mapping);

  // Assemble complete SVG
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg 
  xmlns="http://www.w3.org/2000/svg" 
  xmlns:xlink="http://www.w3.org/1999/xlink"
  viewBox="0 0 ${initWidth} ${initHeight}"
  width="100%"
  height="100%"
  preserveAspectRatio="xMidYMid meet"
  overflow="visible"
>
  ${defsContent}
  
  <!-- Headstone Shape -->
  ${shapeContent}
  
  <!-- Inscriptions -->
  ${inscriptionsContent}
  
  <!-- Motifs -->
  ${motifsContent}
</svg>`;
}

/**
 * Generate <defs> section (fonts, patterns, textures)
 */
async function generateDefs(
  textureData?: string, 
  isLaserEtched?: boolean,
  shapeWidth?: number,
  shapeHeight?: number
): Promise<string> {
  let defs = '<defs>\n';

  // Add granite texture pattern (for traditional designs)
  if (textureData && !isLaserEtched) {
    // Pattern sized to match the shape's intrinsic viewBox (e.g., 400x400)
    // This way the pattern transforms with the shape
    const patternW = shapeWidth || 400;
    const patternH = shapeHeight || 400;
    defs += `
  <pattern id="graniteTexture" patternUnits="userSpaceOnUse" width="${patternW}" height="${patternH}">
    <image href="${textureData}" x="0" y="0" width="${patternW}" height="${patternH}"/>
  </pattern>
`;
  }

  // Could add font definitions here if needed
  // <style>
  //   @font-face { font-family: 'CustomFont'; src: url(...); }
  // </style>

  defs += '</defs>\n';
  return defs;
}

/**
 * Extract viewBox from shape SVG
 */
async function extractShapeViewBox(shapeName: string, shapeImagePath?: string): Promise<ViewBox> {
  // Default viewBox for standard shapes
  const defaultViewBox: ViewBox = { vx: 0, vy: 0, vw: 400, vh: 400 };
  
  if (!shapeImagePath) {
    return defaultViewBox;
  }
  
  try {
    const response = await fetch(shapeImagePath);
    if (!response.ok) return defaultViewBox;
    
    const svgText = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, 'image/svg+xml');
    const svg = doc.querySelector('svg');
    
    if (!svg) return defaultViewBox;
    
    const viewBox = svg.getAttribute('viewBox');
    if (!viewBox) return defaultViewBox;
    
    const parts = viewBox.split(/\s+/).map(parseFloat);
    if (parts.length === 4) {
      return { vx: parts[0], vy: parts[1], vw: parts[2], vh: parts[3] };
    }
  } catch (error) {
    console.error('Failed to extract viewBox:', error);
  }
  
  return defaultViewBox;
}

/**
 * Generate headstone shape using universal mapping
 */
async function generateShapeUniversal(
  shapeName: string,
  shapeImagePath?: string,
  textureData?: string,
  isLaserEtched?: boolean,
  mapping?: ReturnType<typeof buildUniversalMapping>
): Promise<string> {
  if (!mapping) return '';
  
  const { stoneTransform } = mapping;
  const { scale, dx, dy } = stoneTransform;
  
  // Determine fill
  const fill = isLaserEtched 
    ? '#000000' 
    : (textureData ? 'url(#graniteTexture)' : '#808080');

  // Try to load and inline the SVG
  if (shapeImagePath) {
    try {
      const response = await fetch(shapeImagePath);
      if (response.ok) {
        const svgText = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, 'image/svg+xml');
        const svg = doc.querySelector('svg');
        
        if (svg) {
          const paths = svg.querySelectorAll('path');
          let pathsContent = `<g transform="translate(${dx}, ${dy}) scale(${scale})">\n`;
          
          paths.forEach(path => {
            const d = path.getAttribute('d');
            if (d) {
              pathsContent += `  <path fill="${fill}" d="${d}"/>\n`;
            }
          });
          
          pathsContent += '</g>\n';
          return pathsContent;
        }
      }
    } catch (error) {
      console.error('Failed to load shape SVG:', error);
    }
  }
  
  // Fallback: simple rectangle
  return `<g transform="translate(${dx}, ${dy}) scale(${scale})">
  <rect x="0" y="0" width="400" height="400" fill="${fill}" rx="20"/>
</g>`;
}

/**
 * Generate inscriptions using universal mapping
 */
function generateInscriptionsUniversal(
  inscriptions: DesignItem[],
  mapping: ReturnType<typeof buildUniversalMapping>
): string {
  const { mapPointAuthoringToDisplay, scaleSizeAuthoringToDisplay } = mapping;
  
  let content = '<g id="inscriptions">\n';
  
  inscriptions.forEach((item, index) => {
    const rawX = item.x ?? 0;
    const rawY = item.y ?? 0;
    
    // Map position from authoring to display
    const pos = mapPointAuthoringToDisplay(rawX, rawY);
    
    // Extract font size
    let fontSizePx = item.font_size || 16;
    if (item.font && typeof item.font === 'string') {
      const match = item.font.match(/^([\d.]+)px/);
      if (match) fontSizePx = parseFloat(match[1]);
    }
    
    // Scale font size
    const fontSize = scaleSizeAuthoringToDisplay(fontSizePx);
    
    // Get text content
    const text = decodeHtmlEntities(item.label || '');
    
    // Get font family
    const fontFamily = item.font_family || 'Arial';
    
    // Get color (default to white for laser etched, black otherwise)
    const fill = item.color || '#000000';
    
    // Get rotation
    const rotation = item.rotation || 0;
    
    // Text anchor - inscriptions use center origin
    const textAnchor = 'middle';
    const dominantBaseline = 'middle';
    
    content += `  <text 
    x="${pos.x}" 
    y="${pos.y}" 
    font-family="${fontFamily}" 
    font-size="${fontSize}" 
    fill="${fill}" 
    text-anchor="${textAnchor}"
    dominant-baseline="${dominantBaseline}"
    ${rotation ? `transform="rotate(${rotation}, ${pos.x}, ${pos.y})"` : ''}
  >${text}</text>\n`;
  });
  
  content += '</g>\n';
  return content;
}

/**
 * Generate motifs using universal mapping
 */
function generateMotifsUniversal(
  motifs: DesignItem[],
  mapping: ReturnType<typeof buildUniversalMapping>
): string {
  const { mapPointAuthoringToDisplay, scaleSizeAuthoringToDisplay } = mapping;
  
  let content = '<g id="motifs">\n';
  
  motifs.forEach((item, index) => {
    const rawX = item.x ?? 0;
    const rawY = item.y ?? 0;
    
    // Map position from authoring to display
    const pos = mapPointAuthoringToDisplay(rawX, rawY);
    
    // Get motif dimensions (from original SVG viewBox or default)
    const motifW = item.width || 100;
    const motifH = item.height || 100;
    
    // Apply ratio scaling
    const ratio = item.ratio ?? 1;
    const scaledW = scaleSizeAuthoringToDisplay(motifW * ratio);
    const scaledH = scaleSizeAuthoringToDisplay(motifH * ratio);
    
    // Get rotation
    const rotation = item.rotation || 0;
    
    // Motif source (could be SVG path or image reference)
    const src = item.src || item.name;
    
    // For now, render as placeholder (would need to load actual motif SVG)
    content += `  <g transform="translate(${pos.x}, ${pos.y}) ${rotation ? `rotate(${rotation})` : ''} translate(${-scaledW/2}, ${-scaledH/2})">
    <rect width="${scaledW}" height="${scaledH}" fill="none" stroke="#666" stroke-width="1" stroke-dasharray="4"/>
    <text x="${scaledW/2}" y="${scaledH/2}" font-size="10" fill="#666" text-anchor="middle" dominant-baseline="middle">[${src}]</text>
  </g>\n`;
  });
  
  content += '</g>\n';
  return content;
}

/**
 * Generate headstone shape (legacy - to be removed)
 */
async function generateShape(
  shapeName: string,
  canvasWidth: number,
  canvasHeight: number,
  shapeImagePath?: string,
  textureData?: string,
  isLaserEtched?: boolean,
  headstone?: DesignItem,
  transform?: any
): Promise<string> {
  // Determine fill
  const fill = isLaserEtched 
    ? '#000000' 
    : (textureData ? 'url(#graniteTexture)' : '#808080');

  // For Serpentine, generate path dynamically
  if (shapeName === 'Serpentine') {
    const path = generateSerpentinePath(canvasWidth, canvasHeight);
    return `<path fill="${fill}" d="${path}"/>`;
  }

  // For other shapes, try to load and inline the SVG
  if (shapeImagePath) {
    try {
      const response = await fetch(shapeImagePath);
      if (response.ok) {
        const svgText = await response.text();
        
        // Parse SVG and extract path(s)
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, 'image/svg+xml');
        const svg = doc.querySelector('svg');
        
        if (svg) {
          const paths = svg.querySelectorAll('path');
          
          // Get original SVG viewBox
          const viewBox = svg.getAttribute('viewBox');
          let shapeWidth = 400;
          let shapeHeight = 400;
          
          if (viewBox) {
            const parts = viewBox.split(/\s+/);
            // Parse viewBox: "x y width height"
            shapeWidth = parseFloat(parts[2]) || 400;
            shapeHeight = parseFloat(parts[3]) || 400;
          }
          
          // Scale shape to fit canvas (contain mode)
          const scale = Math.min(canvasWidth / shapeWidth, canvasHeight / shapeHeight);
          
          // Center the scaled shape
          const offsetX = Math.round((canvasWidth - shapeWidth * scale) / 2);
          const offsetY = Math.round((canvasHeight - shapeHeight * scale) / 2);
          
          let pathsContent = `<g transform="translate(${offsetX}, ${offsetY}) scale(${scale})">\n`;
          
          paths.forEach(path => {
            const d = path.getAttribute('d');
            if (d) {
              pathsContent += `  <path fill="${fill}" d="${d}"/>\n`;
            }
          });
          
          pathsContent += `</g>\n`;
          
          return pathsContent;
        }
      }
    } catch (error) {
      console.error('Failed to load shape SVG:', error);
    }
  }

  // Fallback: simple rectangle
  return `<rect fill="${fill}" x="0" y="0" width="${canvasWidth}" height="${canvasHeight}"/>`;
}

/**
 * Generate Serpentine path
 */
function generateSerpentinePath(w: number, h: number): string {
  const offsetX = 0;
  const curveHeight = h * 0.1;

  return `M${offsetX + w} ${curveHeight} L${offsetX + w} ${h} ${offsetX} ${h} ${offsetX} ${curveHeight} ` +
    `${offsetX + w * 0.064} ${curveHeight * 0.97} ${offsetX + w * 0.1275} ${curveHeight * 0.87} ` +
    `${offsetX + w * 0.19} ${curveHeight * 0.71} ${offsetX + w * 0.319} ${curveHeight * 0.25} ` +
    `${offsetX + w * 0.39} ${curveHeight * 0.08} ${offsetX + w * 0.463} 0 ${offsetX + w * 0.537} 0 ` +
    `${offsetX + w * 0.61} ${curveHeight * 0.08} ${offsetX + w * 0.681} ${curveHeight * 0.25} ` +
    `${offsetX + w * 0.81} ${curveHeight * 0.71} ${offsetX + w * 0.8725} ${curveHeight * 0.87} ` +
    `${offsetX + w * 0.936} ${curveHeight * 0.97} ${offsetX + w} ${curveHeight}`;
}

/**
 * Generate inscriptions as <text> elements
 */
function generateInscriptions(
  inscriptions: DesignItem[],
  vp: Viewport,
  au: Authoring,
  t: Transform,
  dpr: number = 1
): string {
  if (!inscriptions.length) return '';
  
  return inscriptions.map(inscription => {
    // Get coordinates in authoring space (center-origin)
    // These are stored in PHYSICAL pixels, must divide by DPR
    const xPhysical = inscription.x ?? 0;
    const yPhysical = inscription.y ?? 0;
    
    // Convert physical → logical (authoring) pixels
    const xAuth = xPhysical / dpr;
    const yAuth = yPhysical / dpr;
    
    // Map to display coordinates
    const { x, y } = mapXY(xAuth, yAuth, vp, au, t);
    
    // Get text properties
    const text = inscription.label || '';
    // Decode HTML entities first
    const decodedText = decodeHtmlEntities(text);
    
    // Font size - DON'T divide by DPR, it's already authoring size
    const fontSize = mapSize(inscription.font_size || 16, t);
    
    const fontFamily = inscription.font_family || 'serif';
    const color = inscription.color || '#000000';
    const textAlign = inscription.alignment || 'center';
    
    // Map alignment to SVG text-anchor
    const textAnchor = textAlign === 'left' ? 'start' : 
                      textAlign === 'right' ? 'end' : 'middle';
    
    // Baseline - use 'middle' for center-aligned Y
    const dominantBaseline = 'middle';
    
    // Handle multi-line text
    const lines = decodedText.split('\n');
    if (lines.length > 1) {
      const lineHeight = fontSize * 1.2;
      return `
  <text 
    x="${x}" 
    y="${y}" 
    font-family="${fontFamily}" 
    font-size="${fontSize}" 
    fill="${color}" 
    text-anchor="${textAnchor}"
    dominant-baseline="${dominantBaseline}"
  >
${lines.map((line: string, i: number) => 
    `    <tspan x="${x}" dy="${i === 0 ? 0 : lineHeight}">${escapeXML(line)}</tspan>`
  ).join('\n')}
  </text>`;
    }
    
    return `
  <text 
    x="${x}" 
    y="${y}" 
    font-family="${fontFamily}" 
    font-size="${fontSize}" 
    fill="${color}" 
    text-anchor="${textAnchor}"
    dominant-baseline="${dominantBaseline}"
  >${escapeXML(decodedText)}</text>`;
  }).join('\n');
}

/**
 * Generate motifs as <image> elements
 */
function generateMotifs(
  motifs: DesignItem[],
  vp: Viewport,
  au: Authoring,
  t: Transform,
  dpr: number = 1
): string {
  if (!motifs.length) return '';
  
  return motifs.map(motif => {
    // Get coordinates in authoring space (center-origin)
    // These are stored in PHYSICAL pixels, must divide by DPR
    const xPhysical = motif.x ?? 0;
    const yPhysical = motif.y ?? 0;
    
    // Convert physical → logical (authoring) pixels
    const xAuth = xPhysical / dpr;
    const yAuth = yPhysical / dpr;
    
    // Map to display coordinates (center point)
    const { x: cx, y: cy } = mapXY(xAuth, yAuth, vp, au, t);
    
    // Get rotation (in degrees)
    const rotation = motif.rotation || 0;
    
    // Get dimensions - DON'T divide by DPR, already authoring size
    const width = mapSize(motif.width || 100, t);
    const height = mapSize(motif.height || 100, t);
    
    // For <image>, we need top-left coordinates (motif center is at cx, cy)
    const x = cx - width / 2;
    const y = cy - height / 2;
    
    // Get motif path - ensure all motifs use /shapes/motifs/ prefix and .svg extension
    const src = motif.src || '';
    let motifPath = src;
    
    if (!src.startsWith('/')) {
      // Relative path - add /shapes/motifs/ prefix and .svg extension if missing
      motifPath = `/shapes/motifs/${src}`;
    } else if (src.startsWith('/motifs/')) {
      // Old /motifs/ path - update to /shapes/motifs/
      motifPath = src.replace('/motifs/', '/shapes/motifs/');
    }
    // else: already has full path (e.g., /shapes/motifs/...) - use as-is
    
    // Ensure .svg extension
    if (!motifPath.endsWith('.svg')) {
      motifPath += '.svg';
    }
    
    // Apply color filter for laser-etched (white motifs)
    const color = motif.color || '#000000';
    const needsColorFilter = color === '#ffffff';
    
    // Build transform attribute for rotation
    // Rotate around the center of the motif (cx, cy)
    const transforms = [];
    if (rotation !== 0) {
      transforms.push(`rotate(${rotation} ${cx} ${cy})`);
    }
    const transformAttr = transforms.length > 0 ? `transform="${transforms.join(' ')}"` : '';
    
    return `
  <image 
    href="${motifPath}" 
    x="${x}" 
    y="${y}" 
    width="${width}" 
    height="${height}"
    ${transformAttr}
    preserveAspectRatio="xMidYMid meet"
    ${needsColorFilter ? 'style="filter: brightness(0) invert(1);"' : ''}
  />`;
  }).join('\n');
}

/**
 * Escape XML special characters (but keep apostrophes as-is for SVG)
 */
function escapeXML(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
    // Note: Don't escape apostrophes - SVG handles them fine
}
