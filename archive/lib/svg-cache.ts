/**
 * SVG Cache System for Saved Designs
 * 
 * Generates and caches SVG files to avoid re-generation on every page visit.
 * 
 * Cache Strategy:
 * 1. On first visit: Generate SVG and save to /ml/forevershining/saved-designs/svg/{year}/{month}/{designId}.svg
 * 2. On subsequent visits: Serve cached SVG file
 * 3. Cache expiration: 24 hours (check file modification time)
 * 4. Cache invalidation: Delete cached file if older than 24 hours
 * 
 * File structure:
 * /ml/forevershining/saved-designs/svg/
 *   2024/
 *     07/
 *       1721009360757.svg
 *   2023/
 *     11/
 *       1700517739396.svg
 */

import fs from 'fs/promises';
import path from 'path';
import { generateDesignSVG } from './svg-generator';

const CACHE_DIR = 'public/ml/forevershining/saved-designs/svg';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

interface CachedSVGOptions {
  designId: string;
  designData: any[];
  initWidth: number;
  initHeight: number;
  shapeImagePath?: string;
  textureData?: string;
  isLaserEtched?: boolean;
}

/**
 * Get the cache file path for a design
 */
function getCachePath(designId: string): string {
  // Extract year/month from design ID (timestamp)
  const timestamp = parseInt(designId);
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  return path.join(process.cwd(), CACHE_DIR, String(year), month, `${designId}.svg`);
}

/**
 * Check if cached SVG exists and is fresh (< 24 hours old)
 */
async function isCacheFresh(cachePath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(cachePath);
    const age = Date.now() - stats.mtimeMs;
    return age < CACHE_DURATION_MS;
  } catch (error) {
    // File doesn't exist or error reading
    return false;
  }
}

/**
 * Read cached SVG from disk
 */
async function readCachedSVG(cachePath: string): Promise<string | null> {
  try {
    const svg = await fs.readFile(cachePath, 'utf-8');
    return svg;
  } catch (error) {
    console.error('Failed to read cached SVG:', error);
    return null;
  }
}

/**
 * Save generated SVG to cache
 */
async function saveSVGToCache(cachePath: string, svg: string): Promise<void> {
  try {
    // Ensure directory exists
    const dir = path.dirname(cachePath);
    await fs.mkdir(dir, { recursive: true });
    
    // Write SVG file
    await fs.writeFile(cachePath, svg, 'utf-8');
    
    console.log(`✅ Cached SVG saved: ${cachePath}`);
  } catch (error) {
    console.error('Failed to save SVG to cache:', error);
    // Don't throw - caching failure shouldn't break the page
  }
}

/**
 * Delete expired cache file
 */
async function deleteExpiredCache(cachePath: string): Promise<void> {
  try {
    await fs.unlink(cachePath);
    console.log(`🗑️ Deleted expired cache: ${cachePath}`);
  } catch (error) {
    // Ignore errors - file might not exist
  }
}

/**
 * Get SVG for design (from cache or generate new)
 * 
 * This is the main function to use from components:
 * 
 * @example
 * const svg = await getOrGenerateSVG({
 *   designId: '1721009360757',
 *   designData,
 *   initWidth: 360,
 *   initHeight: 591,
 *   shapeImagePath: '/shapes/curved-gable.svg',
 *   textureData: 'data:image/jpeg;base64,...',
 *   isLaserEtched: false
 * });
 */
export async function getOrGenerateSVG(options: CachedSVGOptions): Promise<string> {
  const { designId } = options;
  const cachePath = getCachePath(designId);
  
  console.log(`🔍 Checking SVG cache for design ${designId}...`);
  
  // Check if cache exists and is fresh
  const isFresh = await isCacheFresh(cachePath);
  
  if (isFresh) {
    console.log(`✅ Using cached SVG (fresh)`);
    const cachedSVG = await readCachedSVG(cachePath);
    if (cachedSVG) {
      return cachedSVG;
    }
  } else {
    // Delete expired cache
    await deleteExpiredCache(cachePath);
  }
  
  // Generate new SVG
  console.log(`🎨 Generating new SVG...`);
  const svg = await generateDesignSVG({
    designData: options.designData,
    initWidth: options.initWidth,
    initHeight: options.initHeight,
    shapeImagePath: options.shapeImagePath,
    textureData: options.textureData,
    isLaserEtched: options.isLaserEtched
  });
  
  // Save to cache (async, don't wait)
  saveSVGToCache(cachePath, svg).catch(err => {
    console.error('Cache save failed (non-fatal):', err);
  });
  
  return svg;
}

/**
 * API route handler for SVG generation
 * 
 * Usage in API route:
 * 
 * @example
 * // pages/api/designs/[designId]/svg.ts
 * export default async function handler(req, res) {
 *   const { designId } = req.query;
 *   const design = await loadDesign(designId);
 *   
 *   const svg = await handleSVGRequest({
 *     designId,
 *     designData: design.data,
 *     initWidth: design.width,
 *     initHeight: design.height,
 *     ...
 *   });
 *   
 *   res.setHeader('Content-Type', 'image/svg+xml');
 *   res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours
 *   res.send(svg);
 * }
 */
export async function handleSVGRequest(options: CachedSVGOptions): Promise<string> {
  return getOrGenerateSVG(options);
}

/**
 * Clear all expired cache files
 * 
 * Can be run as a cron job or manually:
 * 
 * @example
 * // scripts/clear-svg-cache.ts
 * import { clearExpiredCache } from '@/lib/svg-cache';
 * await clearExpiredCache();
 */
export async function clearExpiredCache(): Promise<void> {
  console.log('🧹 Clearing expired SVG cache...');
  
  const baseDir = path.join(process.cwd(), CACHE_DIR);
  
  try {
    // Recursively scan cache directory
    await scanAndDeleteExpired(baseDir);
    console.log('✅ Cache cleanup complete');
  } catch (error) {
    console.error('Cache cleanup failed:', error);
  }
}

/**
 * Recursively scan directory and delete expired files
 */
async function scanAndDeleteExpired(dir: string): Promise<void> {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        await scanAndDeleteExpired(fullPath);
      } else if (entry.isFile() && entry.name.endsWith('.svg')) {
        const isFresh = await isCacheFresh(fullPath);
        if (!isFresh) {
          await deleteExpiredCache(fullPath);
        }
      }
    }
  } catch (error) {
    // Directory might not exist yet
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  totalFiles: number;
  freshFiles: number;
  expiredFiles: number;
  totalSize: number;
}> {
  const baseDir = path.join(process.cwd(), CACHE_DIR);
  let totalFiles = 0;
  let freshFiles = 0;
  let expiredFiles = 0;
  let totalSize = 0;
  
  async function scan(dir: string): Promise<void> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          await scan(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.svg')) {
          totalFiles++;
          const stats = await fs.stat(fullPath);
          totalSize += stats.size;
          
          const isFresh = await isCacheFresh(fullPath);
          if (isFresh) {
            freshFiles++;
          } else {
            expiredFiles++;
          }
        }
      }
    } catch (error) {
      // Ignore
    }
  }
  
  await scan(baseDir);
  
  return { totalFiles, freshFiles, expiredFiles, totalSize };
}
