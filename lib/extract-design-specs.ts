/**
 * Extract design specifications (dimensions, granite) from saved JSON files
 */

export interface DesignSpecs {
  width: number;
  height: number;
  graniteName: string;
  graniteThumb?: string;
}

/**
 * Map granite ID to name based on _data.ts material definitions
 */
const GRANITE_MAP: Record<string, string> = {
  '1': 'Absolute Black',
  '2': 'Auroro Granito',
  '3': 'Australian Calca',
  '4': 'Australian Grandee',
  '5': 'Balmoral Green',
  '6': 'Balmoral Red',
  '7': 'Blue Pearl',
  '8': 'Chinese Calca',
  '9': 'Darwin Brown',
  '10': 'Darwin Brown',
  '11': 'Emerald Pearl',
  '12': 'English Brown',
  '13': 'G439',
  '14': 'G623',
  '15': 'G633',
  '16': 'G654',
  '17': 'G788',
  '18': 'Glory Gold Spots',
  '19': 'Glory Black',
  '20': 'G9426',
  '21': 'Imperial Red',
  '22': 'Marron Brown',
  '23': 'Multicolour Red',
  '24': 'Noble Black',
  '25': 'Noble Red',
  '26': 'Paradiso',
  '27': 'Sandstone',
  '28': 'Sapphire Brown',
  '29': 'Visage Blue',
  '30': 'White Carrara',
};

/**
 * Extract granite name from texture path
 * Example: "src/granites/forever2/l/18.jpg" → "Glory Gold Spots"
 */
function extractGraniteName(texturePath: string): string {
  if (!texturePath) return 'Black Granite';
  
  // Extract filename from path
  const filename = texturePath.split('/').pop() || '';
  
  // Extract ID from numeric filenames (e.g., "18.jpg" → "18")
  const numericMatch = filename.match(/^(\d+)\./);
  if (numericMatch) {
    const graniteId = numericMatch[1];
    return GRANITE_MAP[graniteId] || 'Black Granite';
  }
  
  // Fallback: parse from descriptive filename
  const name = filename
    .replace(/\.jpg$/i, '')
    .replace(/\.png$/i, '')
    .replace(/\.webp$/i, '')
    .replace(/-TILE-\d+-X-\d+$/i, '')
    .replace(/_/g, ' ')
    .replace(/-/g, ' ');
  
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Generate thumbnail path with year/month structure from timestamp
 * Returns both primary path (with year/month) and fallback path (without)
 */
function generateThumbnailPath(designId: string, mlDir: string): string {
  // Extract timestamp from design ID (e.g., "1725769905504")
  const timestamp = parseInt(designId, 10);
  
  if (isNaN(timestamp)) {
    // Fallback if design ID is not a timestamp
    return `/ml/${mlDir}/saved-designs/screenshots/${designId}_small.jpg`;
  }
  
  // Convert timestamp to date
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  // Try path with year/month structure first, fallback is handled in component
  return `/ml/${mlDir}/saved-designs/screenshots/${year}/${month}/${designId}_small.jpg`;
}

/**
 * Get fallback thumbnail path (without year/month subdirs)
 */
function getFallbackThumbnailPath(designId: string, mlDir: string): string {
  return `/ml/${mlDir}/saved-designs/screenshots/${designId}_small.jpg`;
}

/**
 * Fetch design specifications from JSON file
 */
export async function extractDesignSpecs(
  designId: string,
  mlDir: string = 'forevershining'
): Promise<DesignSpecs | null> {
  try {
    const jsonPath = `/ml/${mlDir}/saved-designs/json/${designId}.json`;
    const response = await fetch(jsonPath);
    
    if (!response.ok) {
      return null;
    }
    
    const jsonData = await response.json();
    
    // Find the headstone object (first item with type: "Headstone")
    const headstone = Array.isArray(jsonData) 
      ? jsonData.find((item: any) => item.type === 'Headstone')
      : jsonData.type === 'Headstone' ? jsonData : null;
    
    if (!headstone) {
      return null;
    }
    
    // Round dimensions up using Math.ceil
    const width = Math.ceil(headstone.width || 0);
    const height = Math.ceil(headstone.height || 0);
    
    return {
      width,
      height,
      graniteName: extractGraniteName(headstone.texture || ''),
      graniteThumb: generateThumbnailPath(designId, mlDir),
    };
  } catch (error) {
    console.error(`Failed to extract specs for design ${designId}:`, error);
    return null;
  }
}
