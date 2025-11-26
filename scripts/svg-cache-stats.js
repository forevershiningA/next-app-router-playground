#!/usr/bin/env node

/**
 * SVG Cache Statistics
 * 
 * Shows statistics about the SVG cache.
 * 
 * Usage:
 *   node scripts/svg-cache-stats.js
 *   pnpm cache:stats
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

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function formatAge(ms) {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

async function scan(dir) {
  let totalFiles = 0;
  let freshFiles = 0;
  let expiredFiles = 0;
  let totalSize = 0;
  let oldestAge = 0;
  let newestAge = Infinity;
  
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      
      if (entry.isDirectory()) {
        const stats = await scan(fullPath);
        totalFiles += stats.totalFiles;
        freshFiles += stats.freshFiles;
        expiredFiles += stats.expiredFiles;
        totalSize += stats.totalSize;
        oldestAge = Math.max(oldestAge, stats.oldestAge);
        newestAge = Math.min(newestAge, stats.newestAge);
      } else if (entry.isFile() && entry.name.endsWith('.svg')) {
        totalFiles++;
        
        const stats = await fs.stat(fullPath);
        totalSize += stats.size;
        
        const age = Date.now() - stats.mtimeMs;
        oldestAge = Math.max(oldestAge, age);
        newestAge = Math.min(newestAge, age);
        
        const isFresh = await isCacheFresh(fullPath);
        if (isFresh) {
          freshFiles++;
        } else {
          expiredFiles++;
        }
      }
    }
  } catch (error) {
    // Directory might not exist
  }
  
  return { totalFiles, freshFiles, expiredFiles, totalSize, oldestAge, newestAge };
}

async function main() {
  console.log('📊 SVG Cache Statistics');
  console.log('═'.repeat(50));
  console.log();
  
  const stats = await scan(CACHE_DIR);
  
  if (stats.totalFiles === 0) {
    console.log('📁 Cache is empty');
    return;
  }
  
  console.log(`📁 Cache directory: ${CACHE_DIR}`);
  console.log();
  
  console.log('📈 Files:');
  console.log(`   Total:   ${stats.totalFiles}`);
  console.log(`   Fresh:   ${stats.freshFiles} (< 24h)`);
  console.log(`   Expired: ${stats.expiredFiles} (> 24h)`);
  console.log();
  
  console.log('💾 Storage:');
  console.log(`   Total size: ${formatBytes(stats.totalSize)}`);
  console.log(`   Avg size:   ${formatBytes(stats.totalSize / stats.totalFiles)}`);
  console.log();
  
  console.log('⏰ Age:');
  console.log(`   Oldest: ${formatAge(stats.oldestAge)}`);
  console.log(`   Newest: ${formatAge(stats.newestAge)}`);
  console.log();
  
  if (stats.expiredFiles > 0) {
    const reclaimable = formatBytes((stats.totalSize / stats.totalFiles) * stats.expiredFiles);
    console.log(`💡 Tip: Run 'pnpm cache:clear' to reclaim ~${reclaimable}`);
  }
}

main().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
