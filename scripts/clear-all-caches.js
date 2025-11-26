#!/usr/bin/env node

/**
 * Clear All Caches
 * 
 * Clears both Next.js build cache and SVG cache.
 * Useful during development when you want a fresh start.
 * 
 * Usage:
 *   node scripts/clear-all-caches.js
 *   pnpm cache:clear-all
 */

const fs = require('fs/promises');
const path = require('path');

async function clearNextCache() {
  const nextDir = path.join(process.cwd(), '.next');
  try {
    await fs.rm(nextDir, { recursive: true, force: true });
    console.log('✅ Cleared Next.js build cache (.next/)');
  } catch (error) {
    console.log('ℹ️  Next.js cache already clear');
  }
}

async function clearSVGCache() {
  const svgDir = path.join(process.cwd(), 'public/ml/forevershining/saved-designs/svg');
  let count = 0;
  
  async function deleteFiles(dir) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          await deleteFiles(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.svg')) {
          await fs.unlink(fullPath);
          count++;
        }
      }
    } catch (error) {
      // Directory might not exist
    }
  }
  
  await deleteFiles(svgDir);
  console.log(`✅ Cleared SVG cache (${count} files deleted)`);
}

async function main() {
  console.log('🧹 Clearing all caches...\n');
  
  await clearNextCache();
  await clearSVGCache();
  
  console.log('\n✅ All caches cleared!');
  console.log('💡 Restart dev server for changes to take effect');
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
