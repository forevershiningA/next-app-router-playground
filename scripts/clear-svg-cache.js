#!/usr/bin/env node

/**
 * Clear Expired SVG Cache
 * 
 * Removes cached SVG files older than 24 hours.
 * 
 * Usage:
 *   node scripts/clear-svg-cache.js
 *   
 * Or add to package.json:
 *   "scripts": {
 *     "cache:clear": "node scripts/clear-svg-cache.js"
 *   }
 */

const fs = require('fs/promises');
const path = require('path');

const CACHE_DIR = path.join(process.cwd(), 'public/ml/forevershining/saved-designs/svg');
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

async function isCacheFresh(filePath) {
  try {
    const stats = await fs.stat(filePath);
    const age = Date.now() - stats.mtimeMs;
    return age < CACHE_DURATION_MS;
  } catch (error) {
    return false;
  }
}

async function scanAndDelete(dir) {
  let deleted = 0;
  let kept = 0;
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        const [d, k] = await scanAndDelete(fullPath);
        deleted += d;
        kept += k;
      } else if (entry.isFile() && entry.name.endsWith('.svg')) {
        const isFresh = await isCacheFresh(fullPath);
        
        if (!isFresh) {
          await fs.unlink(fullPath);
          console.log(`🗑️  Deleted: ${fullPath}`);
          deleted++;
        } else {
          kept++;
        }
      }
    }
  } catch (error) {
    // Directory might not exist
  }
  
  return [deleted, kept];
}

async function main() {
  console.log('🧹 Clearing expired SVG cache...');
  console.log(`📁 Cache directory: ${CACHE_DIR}`);
  console.log(`⏰ Max age: 24 hours\n`);
  
  const [deleted, kept] = await scanAndDelete(CACHE_DIR);
  
  console.log(`\n✅ Done!`);
  console.log(`   Deleted: ${deleted} expired files`);
  console.log(`   Kept: ${kept} fresh files`);
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
