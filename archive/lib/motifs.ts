/**
 * Motif category loader utility
 * Loads motif file lists from public/motifs directory based on product formula
 */

import { data } from '../app/_internal/_data';

export type ProductFormula = 'Bronze' | 'Laser' | 'Engraved' | 'Enamel';

interface MotifCategoryResult {
  files: string[];
  totalCount: number;
  hasMore: boolean;
}

/**
 * Get the list of motif files for a specific category
 * @param categoryIndex - Index of the category in the motifs array
 * @param formula - Product formula type (Bronze, Laser, Engraved, Enamel)
 * @param limit - Maximum number of files to return (default: 50)
 * @returns Promise with motif files and metadata
 */
export async function getMotifCategory(
  categoryIndex: number,
  formula?: ProductFormula,
  limit: number = 50
): Promise<MotifCategoryResult> {
  const category = data.motifs[categoryIndex];
  
  if (!category) {
    throw new Error(`Motif category not found at index ${categoryIndex}`);
  }

  // Determine which file list to load based on formula
  let fileName = 'files.txt'; // Default for all products
  
  // Uncomment to use different files per formula:
  // if (formula) {
  //   switch (formula) {
  //     case 'Bronze':
  //       fileName = 'bronze-files.txt';
  //       break;
  //     case 'Laser':
  //       fileName = 'laser-files.txt';
  //       break;
  //     case 'Engraved':
  //       fileName = 'engraved-files.txt';
  //       break;
  //     case 'Enamel':
  //       fileName = 'enamel-files.txt';
  //       break;
  //   }
  // }

  const url = `/motifs/${category.src}/${fileName}`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to load motif category: ${response.statusText}`);
    }

    const text = await response.text();
    const allFiles = text
      .split(',')
      .map(file => file.trim())
      .filter(file => file.length > 0);

    const files = limit > 0 ? allFiles.slice(0, limit) : allFiles;
    const hasMore = allFiles.length > limit;

    return {
      files,
      totalCount: allFiles.length,
      hasMore,
    };
  } catch (error) {
    console.error(`Error loading motif category ${category.name}:`, error);
    throw error;
  }
}

/**
 * Load more files from the current category
 * @param categoryIndex - Index of the category in the motifs array
 * @param formula - Product formula type
 * @param currentCount - Number of files already loaded
 * @param loadMore - Number of additional files to load (default: 50)
 */
export async function loadMoreMotifFiles(
  categoryIndex: number,
  formula?: ProductFormula,
  currentCount: number = 0,
  loadMore: number = 50
): Promise<MotifCategoryResult> {
  const category = data.motifs[categoryIndex];
  
  if (!category) {
    throw new Error(`Motif category not found at index ${categoryIndex}`);
  }

  const fileName = 'files.txt';
  const url = `/motifs/${category.src}/${fileName}`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to load motif category: ${response.statusText}`);
    }

    const text = await response.text();
    const allFiles = text
      .split(',')
      .map(file => file.trim())
      .filter(file => file.length > 0);

    const endIndex = currentCount + loadMore;
    const files = allFiles.slice(currentCount, endIndex);
    const hasMore = allFiles.length > endIndex;

    return {
      files,
      totalCount: allFiles.length,
      hasMore,
    };
  } catch (error) {
    console.error(`Error loading more motif files from ${category.name}:`, error);
    throw error;
  }
}

/**
 * Get all motif files for a category (no pagination)
 */
export async function getAllMotifFiles(
  categoryIndex: number,
  formula?: ProductFormula
): Promise<string[]> {
  const result = await getMotifCategory(categoryIndex, formula, 0);
  return result.files;
}

/**
 * Get the full path for a motif file
 * @param categoryIndex - Index of the category in the motifs array
 * @param fileName - Name of the motif file (with or without extension)
 * @param extension - File extension (default: 'png')
 */
export function getMotifFilePath(
  categoryIndex: number,
  fileName: string,
  extension: string = 'png'
): string {
  const category = data.motifs[categoryIndex];
  
  if (!category) {
    throw new Error(`Motif category not found at index ${categoryIndex}`);
  }

  // Remove extension from fileName if it already has one
  const fileNameWithoutExt = fileName.replace(/\.(png|svg|jpg|jpeg)$/i, '');

  return `/motifs/${category.src}/${fileNameWithoutExt}.${extension}`;
}

/**
 * Get the thumbnail path for a motif (PNG from shapes/motifs/s/)
 * @param fileName - Name of the motif file (with or without extension)
 */
export function getMotifThumbnailPath(fileName: string): string {
  // Remove extension from fileName if it already has one
  const fileNameWithoutExt = fileName.replace(/\.(png|svg|jpg|jpeg)$/i, '');
  return `/shapes/motifs/s/${fileNameWithoutExt}.png`;
}

/**
 * Get the SVG path for a motif (SVG from shapes/motifs/)
 * @param fileName - Name of the motif file (with or without extension)
 */
export function getMotifSvgPath(fileName: string): string {
  // Remove extension from fileName if it already has one
  const fileNameWithoutExt = fileName.replace(/\.(png|svg|jpg|jpeg)$/i, '');
  return `/shapes/motifs/${fileNameWithoutExt}.svg`;
}

/**
 * Get motif category by name (case-insensitive)
 */
export function getMotifCategoryByName(name: string): number {
  const index = data.motifs.findIndex(
    (motif) => motif.name.toLowerCase() === name.toLowerCase()
  );
  
  if (index === -1) {
    throw new Error(`Motif category "${name}" not found`);
  }
  
  return index;
}
