/**
 * Utility functions for loading saved designs into the DYO tool
 */

import { useHeadstoneStore } from '#/lib/headstone-store';
import type { SavedDesignData } from '#/components/SavedDesignLoader';

export interface LoadDesignOptions {
  clearExisting?: boolean; // Whether to clear existing inscriptions first
  autoSave?: boolean; // Whether to auto-save after loading
}

/**
 * Bronze texture mapping
 */
const BRONZE_TEXTURES = [
  { name: "Black", color: "#000000", img: "/textures/phoenix/s/01.jpg" },
  { name: "Brown", color: "#48280f", img: "/textures/phoenix/s/02.jpg" },
  { name: "Casino Blue", color: "#0c1137", img: "/textures/phoenix/s/03.jpg" },
  { name: "Dark Brown", color: "#24160b", img: "/textures/phoenix/s/04.jpg" },
  { name: "Dark Green", color: "#1a391a", img: "/textures/phoenix/s/05.jpg" },
  { name: "Grey", color: "#6d696a", img: "/textures/phoenix/s/06.jpg" },
  { name: "Holly Green", color: "#07723a", img: "/textures/phoenix/s/07.jpg" },
  { name: "Ice Blue", color: "#afcadb", img: "/textures/phoenix/s/08.jpg" },
  { name: "Maroon", color: "#4c0f1e", img: "/textures/phoenix/s/09.jpg" },
  { name: "Navy Blue", color: "#2c2c76", img: "/textures/phoenix/s/10.jpg" },
  { name: "Purple", color: "#513a68", img: "/textures/phoenix/s/11.jpg" },
  { name: "Red", color: "#c72028", img: "/textures/phoenix/s/12.jpg" },
  { name: "Sundance Pink", color: "#c99cb0", img: "/textures/phoenix/s/13.jpg" },
  { name: "Turquoise", color: "#295363", img: "/textures/phoenix/s/14.jpg" },
  { name: "White", color: "#ffffff", img: "/textures/phoenix/s/15.jpg" }
];

/**
 * Material/texture mapping for headstones and plaques
 */
const MATERIAL_TEXTURES: Record<string, string> = {
  // Blue Pearl variants
  'blue-pearl': '/textures/forever/l/Blue-Pearl.jpg',
  'blue pearl': '/textures/forever/l/Blue-Pearl.jpg',
  
  // Glory Black (for laser etched - IDs 18 and 19)
  'glory-black': '/textures/forever/l/Glory-Black-2.jpg',
  'glory black': '/textures/forever/l/Glory-Black-2.jpg',
  'glory-gold-spots': '/textures/forever/l/Glory-Black-1.jpg',
  
  // Other common materials
  'african-black': '/textures/forever/l/African-Black.jpg',
  'noble-black': '/textures/forever/l/Noble-Black.jpg',
  'g654': '/textures/forever/l/01.jpg', // Fallback to numbered texture
};

/**
 * Map texture path from saved design to actual texture
 */
function mapTexture(texturePath: string, productId: string): string {
  if (!texturePath) return '';
  
  // Check if it's a bronze plaque (productId 5)
  if (productId === '5') {
    // Handle paths like "src/bronzes/phoenix/l/04.jpg" -> "/textures/phoenix/l/04.jpg"
    if (texturePath.includes('phoenix')) {
      const match = texturePath.match(/phoenix[\/\\](l|s)[\/\\](\d+)\.jpg$/);
      if (match) {
        const size = match[1]; // 'l' or 's'
        const number = match[2];
        return `/textures/phoenix/${size}/${number}.jpg`;
      }
    }
    
    // Extract bronze color from path if possible (fallback)
    const bronzeMatch = texturePath.match(/[\/\\](\d+)\.jpg$/);
    if (bronzeMatch) {
      const number = bronzeMatch[1];
      return `/textures/phoenix/l/${number}.jpg`;
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
  
  // If path already looks valid, return as is
  if (texturePath.startsWith('/textures/')) {
    return texturePath;
  }
  
  // Default fallback
  return texturePath;
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

  // Get the stored dimensions for coordinate conversion
  const init_width = baseProduct?.init_width || 1116;
  const init_height = baseProduct?.init_height || 654;
  const raw_dpr = baseProduct?.dpr || 1;
  const device = baseProduct?.device || 'desktop';
  const orientation = baseProduct?.orientation || 'landscape';
  
  // Normalize DPR for desktop designs
  // Desktop designs should always use DPR = 1.0 regardless of saved DPR
  // Unusual DPR values (like 1.47) come from browser zoom or display scaling
  // and should be ignored for desktop designs to prevent scaling issues
  let design_dpr = raw_dpr;
  
  if (device === 'desktop') {
    // For desktop designs, always use DPR = 1.0
    // This prevents font size and positioning issues from browser zoom
    if (Math.abs(raw_dpr - 1.0) > 0.01) {
      design_dpr = 1.0;
    }
  } else {
    // For mobile designs, normalize to standard mobile DPR values
    const standardMobileDpr = [1.0, 1.5, 2.0, 2.5, 3.0, 4.0];
    const isStandardDpr = standardMobileDpr.some(std => Math.abs(raw_dpr - std) < 0.01);
    
    if (!isStandardDpr) {
      const nearest = standardMobileDpr.reduce((prev, curr) => 
        Math.abs(curr - raw_dpr) < Math.abs(prev - raw_dpr) ? curr : prev
      );
      design_dpr = nearest;
    }
  }
  
  // Extract viewport size from navigator string if available
  let viewportWidth = init_width;
  let viewportHeight = init_height;
  if (baseProduct?.navigator) {
    const viewportMatch = baseProduct.navigator.match(/(\d+)x(\d+)/);
    if (viewportMatch) {
      viewportWidth = parseInt(viewportMatch[1]);
      viewportHeight = parseInt(viewportMatch[2]);
    }
  }
  
  // Product dimensions in mm (from saved data)
  const productWidthMm = baseProduct?.width || 400;
  const productHeightMm = baseProduct?.height || 300;
  
  // Current canvas/store dimensions (these should match productWidthMm/productHeightMm after setting)
  const currentWidth = productWidthMm; // Use saved dimensions directly
  const currentHeight = productHeightMm; // Use saved dimensions directly
  
  // Current DPR (our system uses DPR 1 effectively since we work in mm)
  const currentDpr = 1;
  
  // REVERSE ENGINEERING THE SAVED DATA:
  // At design time:
  //   - Canvas viewport: viewportWidth x viewportHeight pixels (physical pixels)
  //   - DPR: design_dpr (e.g., 1.75)
  //   - Product: productWidthMm x productHeightMm mm
  //   - In portrait: canvas width → product width, canvas height → product height
  //   - In landscape: canvas height → product height, canvas width → product width
  
  // Calculate the pixels-per-mm ratio at design time
  const designCanvasWidth = viewportWidth * design_dpr;
  const designCanvasHeight = viewportHeight * design_dpr;
  
  // For portrait: use width for X, height for Y
  // For landscape: use height for both (as per old system)
  const designPixelsPerMmX = orientation === 'portrait' 
    ? designCanvasWidth / productWidthMm
    : designCanvasWidth / productWidthMm;
  const designPixelsPerMmY = orientation === 'portrait'
    ? designCanvasHeight / productHeightMm
    : designCanvasHeight / productHeightMm;

  for (const insc of sortedInscriptions) {
    const text = insc.label || '';
    const font = insc.font_family || 'Arial';
    
    // Extract font size from the 'font' field if available
    // Format: "18.771183846705306px Garamond" or "27px Arial"
    let fontPixels = 0;
    if (insc.font && typeof insc.font === 'string') {
      const fontMatch = insc.font.match(/([\d.]+)px/);
      if (fontMatch) {
        fontPixels = parseFloat(fontMatch[1]);
      }
    }
    
    // Calculate font size in mm from pixels
    // The font pixels were rendered at design time with design_dpr
    // We need to convert them to mm using the design-time pixels-per-mm ratio
    let sizeMm = insc.font_size || 10;
    
    if (fontPixels > 0) {
      // Font size was in pixels at design time, convert to mm
      // Use the X-axis pixels-per-mm ratio for font sizing
      sizeMm = fontPixels / designPixelsPerMmX;
    }
    
    // Get raw saved position (these are screen pixels relative to canvas center in old system)
    let xPixels = typeof insc.x === 'number' ? insc.x : 0;
    let yPixels = typeof insc.y === 'number' ? insc.y : 0;
    
    // Convert pixel positions to mm using the design-time pixels-per-mm ratios
    // Use separate ratios for X and Y to handle different aspect ratios correctly
    const xMmFromCenter = xPixels / designPixelsPerMmX;
    const yMmFromCenter = yPixels / designPixelsPerMmY;

    // Use position as is from saved design
    const xPos = xMmFromCenter;
    const yPos = yMmFromCenter;
    
    // Add inscription
    const id = store.addInscriptionLine({
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
    
    // Add the motif using the store's addMotif function
    store.addMotif(svgPath);
    
    // Get the newly added motif's ID (it's the last one in the array)
    const addedMotifs = store.selectedMotifs;
    if (addedMotifs.length > 0) {
      const newMotif = addedMotifs[addedMotifs.length - 1];
      
      // Set the color
      store.setMotifColor(newMotif.id, color);
      
      // Convert pixel positions to mm
      const xPixels = typeof motif.x === 'number' ? motif.x : 0;
      const yPixels = typeof motif.y === 'number' ? motif.y : 0;
      
      const xMmFromCenter = xPixels / designPixelsPerMmX;
      const yMmFromCenter = yPixels / designPixelsPerMmY;
      
      // Motifs need Y negation (different from inscriptions which have scale flip)
      const xPos = xMmFromCenter;
      const yPos = -yMmFromCenter;
      
      // Set the motif offset with position, scale, rotation, and height
      store.setMotifOffset(newMotif.id, {
        xPos,
        yPos,
        scale: 1.0, // Default scale
        rotationZ: typeof motif.rotation === 'number' ? motif.rotation : 0,
        heightMm: typeof motif.height === 'number' ? motif.height : 100,
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
