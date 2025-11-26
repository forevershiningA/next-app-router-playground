/**
 * SVG Generator for Saved Designs
 * 
 * Generates a complete SVG representation of a saved design with:
 * - Headstone shape (from SVG file or dynamic generation)
 * - Inscriptions (as <text> elements - selectable!)
 * - Motifs (as <image> elements)
 * - Proper coordinate space (single viewBox)
 * 
 * Benefits:
 * - No coordinate transformations needed
 * - Single source of truth (SVG viewBox)
 * - Consistent rendering across devices
 * - Text is still selectable/searchable (SEO)
 * - Much simpler than HTML overlay
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

/**
 * Generate complete SVG for a saved design
 */
export async function generateDesignSVG(options: SVGGeneratorOptions): Promise<string> {
  const { designData, initWidth, initHeight, shapeImagePath, textureData, isLaserEtched } = options;

  // Extract design elements
  const headstone = designData.find(item => item.type === 'Headstone');
  const inscriptions = designData.filter(item => item.type === 'Inscription');
  const motifs = designData.filter(item => item.type === 'Motif');

  const shapeName = headstone?.shape || 'Unknown';
  const centerX = initWidth / 2;
  const centerY = initHeight / 2;

  // Build SVG parts
  const defsContent = await generateDefs(textureData, isLaserEtched);
  const shapeContent = await generateShape(shapeName, initWidth, initHeight, shapeImagePath, textureData, isLaserEtched);
  const inscriptionsContent = generateInscriptions(inscriptions, centerX, centerY, headstone);
  const motifsContent = generateMotifs(motifs, centerX, centerY, headstone);

  // Assemble complete SVG
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg 
  xmlns="http://www.w3.org/2000/svg" 
  xmlns:xlink="http://www.w3.org/1999/xlink"
  viewBox="0 0 ${initWidth} ${initHeight}"
  width="100%"
  height="100%"
  preserveAspectRatio="xMidYMid meet"
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
async function generateDefs(textureData?: string, isLaserEtched?: boolean): Promise<string> {
  let defs = '<defs>\n';

  // Add granite texture pattern (for traditional designs)
  if (textureData && !isLaserEtched) {
    defs += `
  <pattern id="graniteTexture" patternUnits="userSpaceOnUse" width="520" height="520">
    <image href="${textureData}" x="0" y="0" width="520" height="520"/>
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
 * Generate headstone shape
 */
async function generateShape(
  shapeName: string,
  initWidth: number,
  initHeight: number,
  shapeImagePath?: string,
  textureData?: string,
  isLaserEtched?: boolean
): Promise<string> {
  // Determine fill
  const fill = isLaserEtched 
    ? '#000000' 
    : (textureData ? 'url(#graniteTexture)' : '#808080');

  // For Serpentine, generate path dynamically
  if (shapeName === 'Serpentine') {
    const path = generateSerpentinePath(initWidth, initHeight);
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
          let pathsContent = '';
          
          paths.forEach(path => {
            const d = path.getAttribute('d');
            if (d) {
              pathsContent += `  <path fill="${fill}" d="${d}"/>\n`;
            }
          });
          
          return pathsContent;
        }
      }
    } catch (error) {
      console.error('Failed to load shape SVG:', error);
    }
  }

  // Fallback: simple rectangle
  return `<rect fill="${fill}" x="0" y="0" width="${initWidth}" height="${initHeight}"/>`;
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
  centerX: number,
  centerY: number,
  headstone?: DesignItem
): string {
  if (!inscriptions.length) return '';

  const dpr = headstone?.dpr || 1;
  
  return inscriptions.map(inscription => {
    // Get coordinates (center-origin in design data)
    const rawX = inscription.x ?? 0;
    const rawY = inscription.y ?? 0;
    
    // Normalize coordinates (handle DPR)
    const x = rawX / dpr;
    const y = rawY / dpr;
    
    // Convert to SVG coordinates (top-left origin)
    const svgX = centerX + x;
    const svgY = centerY + y;
    
    // Get text properties
    const text = inscription.label || '';
    const fontSize = (inscription.font_size || 16) / dpr;
    const fontFamily = inscription.font_family || 'serif';
    const color = inscription.color || '#000000';
    const textAlign = inscription.alignment || 'center';
    
    // Map alignment to SVG text-anchor
    const textAnchor = textAlign === 'left' ? 'start' : 
                      textAlign === 'right' ? 'end' : 'middle';
    
    // Handle multi-line text
    const lines = text.split('\n');
    if (lines.length > 1) {
      const lineHeight = fontSize * 1.2;
      return `
  <text 
    x="${svgX}" 
    y="${svgY}" 
    font-family="${fontFamily}" 
    font-size="${fontSize}" 
    fill="${color}" 
    text-anchor="${textAnchor}"
  >
${lines.map((line: string, i: number) => 
    `    <tspan x="${svgX}" dy="${i === 0 ? 0 : lineHeight}">${escapeXML(line)}</tspan>`
  ).join('\n')}
  </text>`;
    }
    
    return `
  <text 
    x="${svgX}" 
    y="${svgY}" 
    font-family="${fontFamily}" 
    font-size="${fontSize}" 
    fill="${color}" 
    text-anchor="${textAnchor}"
  >${escapeXML(text)}</text>`;
  }).join('\n');
}

/**
 * Generate motifs as <image> elements
 */
function generateMotifs(
  motifs: DesignItem[],
  centerX: number,
  centerY: number,
  headstone?: DesignItem
): string {
  if (!motifs.length) return '';

  const dpr = headstone?.dpr || 1;
  
  return motifs.map(motif => {
    // Get coordinates (center-origin in design data)
    const rawX = motif.x ?? 0;
    const rawY = motif.y ?? 0;
    
    // Normalize coordinates (handle DPR)
    const cx = rawX / dpr;
    const cy = rawY / dpr;
    
    // Get dimensions
    const width = (motif.width || 100) / dpr;
    const height = (motif.height || 100) / dpr;
    
    // Convert to SVG coordinates (top-left for <image>)
    const x = centerX + cx - width / 2;
    const y = centerY + cy - height / 2;
    
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
    
    return `
  <image 
    href="${motifPath}" 
    x="${x}" 
    y="${y}" 
    width="${width}" 
    height="${height}"
    ${needsColorFilter ? 'style="filter: brightness(0) invert(1);"' : ''}
  />`;
  }).join('\n');
}

/**
 * Escape XML special characters
 */
function escapeXML(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
