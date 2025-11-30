// lib/ml-to-canvas-loader.ts
// Load ML design data into the 3D canvas for personalization

import React from 'react';
import { useHeadstoneStore } from './headstone-store';

export type MLDesign = {
  id: string;
  stampId: string;
  domain: string;
  productName: string;
  productId: string;
  shape: string;
  texture: string;
  width: number;
  height: number;
  orientation: string;
  designName: string;
  motif: string;
  tags: string;
  price: number;
  preview: string;
  style: string;
  type: string;
  language: string;
};

/**
 * Parse inscription text from ML tags
 * Extracts lines of text to populate inscription fields
 */
export function parseInscriptions(tags: string): Array<{ text: string; size?: number }> {
  if (!tags) return [];
  
  // Split by double spaces, newlines, or multiple spaces
  const lines = tags
    .split(/\n{2,}|\s{4,}/)
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .slice(0, 10); // Max 10 inscription lines
  
  return lines.map((text, index) => ({
    text: text,
    // Estimate size based on position (larger for titles)
    size: index === 0 ? 100 : index === 1 ? 80 : 60,
  }));
}

/**
 * Map ML shape names to your shape SVG files
 */
export function mapShapeToSVG(mlShape: string): string {
  const shapeMap: Record<string, string> = {
    'Serpentine': 'serpentine.svg',
    'Square': 'square.svg',
    'Peak': 'peak.svg',
    'Curved Top': 'curved_top.svg',
    'Curved Peak': 'curved_peak.svg',
    'Cropped Peak': 'cropped_peak.svg',
    'Gable': 'gable.svg',
    'Half Round': 'half_round.svg',
    'Left Wave': 'left_wave.svg',
    'Right Wave': 'right_wave.svg',
    'Curved Gable': 'curved_gable.svg',
    'Rectangle': 'square.svg', // Use square for rectangle
    'Rectangle (Landscape)': 'square.svg',
    'Rectangle (Portrait)': 'square.svg',
    'Bronze Plaque': 'square.svg', // Bronze plaques are rectangular
    // Add more mappings as needed
  };
  
  return shapeMap[mlShape] || 'serpentine.svg'; // Default fallback
}

/**
 * Map ML texture paths to your texture files
 */
export function mapTextureToFile(mlTexture: string): string {
  // ML textures are like: "src/granites/forever2/l/18.jpg"
  // Your textures are in: "/textures/forever/l/Imperial-Red.webp"
  
  if (!mlTexture) return '/textures/forever/l/Imperial-Red.webp';
  
  // Extract filename from path
  const parts = mlTexture.split('/');
  const filename = parts[parts.length - 1];
  
  // Check if it's granite or bronze
  if (mlTexture.includes('granite')) {
    return `/textures/forever/l/${filename}`;
  } else if (mlTexture.includes('bronze')) {
    return `/textures/bronze/${filename}`;
  }
  
  return `/textures/forever/l/${filename}`;
}

/**
 * Calculate appropriate font based on design type
 */
export function getDefaultFont(design: MLDesign): string {
  if (design.type === 'Plaque') {
    return 'Times New Roman'; // Classic for plaques
  }
  if (design.style.includes('Traditional')) {
    return 'Times New Roman'; // Classic for traditional
  }
  if (design.style.includes('Laser')) {
    return 'Arial'; // Modern for laser etched
  }
  return 'Times New Roman';
}

/**
 * Main function: Load ML design into canvas store
 */
export function loadMLDesignToCanvas(design: MLDesign) {
  const store = useHeadstoneStore.getState();
  
  console.log('📐 Loading ML design into canvas:', design.designName);
  
  // 1. Set shape
  const shapeSVG = mapShapeToSVG(design.shape);
  store.setShapeUrl(`/shapes/headstones/${shapeSVG}`);
  console.log('  Shape:', shapeSVG);
  
  // 2. Set texture/material
  const textureFile = mapTextureToFile(design.texture);
  store.setHeadstoneMaterialUrl(textureFile);
  console.log('  Texture:', textureFile);
  
  // 3. Set size
  const width = design.width || 600;
  const height = design.height || 600;
  store.setWidthMm(width);
  store.setHeightMm(height);
  console.log('  Size:', `${width}×${height}mm`);
  
  // 4. Parse and set inscriptions
  const inscriptions = parseInscriptions(design.tags);
  const defaultFont = getDefaultFont(design);
  
  inscriptions.forEach((inscription, index) => {
    if (index < 10) { // Max 10 inscription lines in your store
      const yPosition = 0.3 - (index * 0.08); // Vertical spacing
      
      store.addInscriptionLine({
        text: inscription.text,
        font: defaultFont,
        color: design.type === 'Plaque' && design.style.includes('Bronze') 
          ? '#8B7355' // Bronze color
          : '#000000', // Black for granite
        sizeMm: inscription.size || 60,
        xPos: 0,
        yPos: yPosition * 100, // Convert to mm
        rotationDeg: 0,
      });
    }
  });
  console.log('  Inscriptions:', inscriptions.length, 'lines loaded');
  
  // 5. Store design metadata for reference
  // Metadata storage removed - not currently supported by store
  
  console.log('✅ ML design loaded successfully!');
  
  return true;
}

/**
 * Client-side hook to load design on page mount
 */
export function useMLDesignLoader(design: MLDesign | null) {
  if (typeof window === 'undefined' || !design) return;
  
  // Load on mount
  React.useEffect(() => {
    if (design) {
      loadMLDesignToCanvas(design);
    }
  }, [design?.id]);
}

/**
 * Get design data from URL params
 * Use this in your page components
 */
export function getDesignFromParams(searchParams: URLSearchParams): string | null {
  return searchParams.get('designId') || searchParams.get('ml');
}

/**
 * Generate URL to jump to canvas with design loaded
 */
export function getCanvasURLForDesign(design: MLDesign, targetProduct: string = 'inscriptions'): string {
  // Different products use different pages
  const pageMap: Record<string, string> = {
    'bronze-plaque': '/inscriptions',
    'laser-etched-headstone': '/inscriptions',
    'traditional-headstone': '/inscriptions',
    'granite-plaque': '/inscriptions',
    'memorial-urn': '/inscriptions',
  };
  
  const page = pageMap[targetProduct] || '/inscriptions';
  
  return `${page}?designId=${design.stampId}&ml=true`;
}

/**
 * Example usage in a design page:
 * 
 * 'use client';
 * import { useSearchParams } from 'next/navigation';
 * import { useEffect } from 'react';
 * import { loadMLDesignToCanvas, getDesignFromParams } from '@/lib/ml-to-canvas-loader';
 * import { getMLTemplateByStampId } from '@/lib/seo-templates-ml';
 * 
 * export default function DesignClient() {
 *   const searchParams = useSearchParams();
 *   
 *   useEffect(() => {
 *     const designId = getDesignFromParams(searchParams);
 *     if (designId) {
 *       const design = getMLTemplateByStampId(designId);
 *       if (design) {
 *         loadMLDesignToCanvas(design);
 *       }
 *     }
 *   }, [searchParams]);
 *   
 *   return <div>Design loaded into canvas!</div>;
 * }
 */

