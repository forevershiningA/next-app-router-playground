#!/usr/bin/env node
/**
 * Generate _small.png thumbnails from full-size transparent PNGs.
 *
 * Usage:
 *   node scripts/generate-png-thumbnails.js [--skip-existing] [--width 300] [--concurrency 8]
 *
 * Reads all *.png (excluding *_small.png) from public/screenshots/v2026-3d/
 * and writes {id}_small.png at the specified width, preserving transparency.
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SCREENSHOT_DIR = path.join(__dirname, '..', 'public', 'screenshots', 'v2026-3d');

// Parse CLI args
const args = process.argv.slice(2);
const skipExisting = args.includes('--skip-existing');
const widthIdx = args.indexOf('--width');
const THUMB_WIDTH = widthIdx !== -1 ? parseInt(args[widthIdx + 1], 10) : 300;
const concIdx = args.indexOf('--concurrency');
const CONCURRENCY = concIdx !== -1 ? parseInt(args[concIdx + 1], 10) : 8;

async function main() {
  const allFiles = fs.readdirSync(SCREENSHOT_DIR);
  const fullPngs = allFiles.filter(f => f.endsWith('.png') && !f.includes('_small'));

  console.log(`Found ${fullPngs.length} full-size PNGs in ${SCREENSHOT_DIR}`);
  console.log(`Thumbnail width: ${THUMB_WIDTH}px | Concurrency: ${CONCURRENCY} | Skip existing: ${skipExisting}`);

  let created = 0;
  let skipped = 0;
  let failed = 0;
  const failures = [];

  // Process in batches
  for (let i = 0; i < fullPngs.length; i += CONCURRENCY) {
    const batch = fullPngs.slice(i, i + CONCURRENCY);
    const promises = batch.map(async (filename) => {
      const id = filename.replace('.png', '');
      const srcPath = path.join(SCREENSHOT_DIR, filename);
      const outPath = path.join(SCREENSHOT_DIR, `${id}_small.png`);

      if (skipExisting && fs.existsSync(outPath)) {
        skipped++;
        return;
      }

      try {
        await sharp(srcPath)
          .resize({ width: THUMB_WIDTH, withoutEnlargement: true })
          .png({ quality: 80, compressionLevel: 9 })
          .toFile(outPath);
        created++;
      } catch (err) {
        failed++;
        failures.push({ id, error: err.message });
        console.error(`  ✗ ${id}: ${err.message}`);
      }
    });

    await Promise.all(promises);

    // Progress every 200
    const done = Math.min(i + CONCURRENCY, fullPngs.length);
    if (done % 200 < CONCURRENCY || done === fullPngs.length) {
      console.log(`  Progress: ${done}/${fullPngs.length} (created: ${created}, skipped: ${skipped}, failed: ${failed})`);
    }
  }

  console.log(`\nDone! Created: ${created} | Skipped: ${skipped} | Failed: ${failed}`);
  if (failures.length > 0) {
    console.log('Failures:', JSON.stringify(failures, null, 2));
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
