/**
 * Batch crop screenshots to remove white left/right borders
 * Usage: node scripts/crop-screenshots.js
 * 
 * Using sharp's built-in trim() for automatic cropping
 * Saves cropped images with _cropped suffix and metadata JSON in same directory
 * Processes subdirectories and handles JPG/PNG files
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SCREENSHOTS_BASE_DIR = path.join(__dirname, '../public/ml/bronze-plaque/saved-designs/screenshots');
const TRIM_THRESHOLD = 10; // Threshold for trim (default is 10, lower = more aggressive)

/**
 * Crop image using sharp's auto-trim and save metadata
 */
async function cropImage(inputPath) {
  const originalMetadata = await sharp(inputPath).metadata();
  
  // Generate output filename with _cropped suffix
  const dir = path.dirname(inputPath);
  const ext = path.extname(inputPath);
  const basename = path.basename(inputPath, ext);
  const outputPath = path.join(dir, `${basename}_cropped${ext}`);
  const metadataPath = path.join(dir, `${basename}_cropped.json`);
  
  // Use sharp's built-in trim to remove whitespace
  // trim() expects an object with threshold property, not a number
  await sharp(inputPath)
    .trim({ threshold: TRIM_THRESHOLD })
    .toFile(outputPath);
  
  const croppedMetadata = await sharp(outputPath).metadata();
  
  const wasCropped = originalMetadata.width !== croppedMetadata.width || 
                     originalMetadata.height !== croppedMetadata.height;
  
  // Create metadata JSON
  const metadata = {
    designId: basename,
    original: {
      width: originalMetadata.width,
      height: originalMetadata.height
    },
    cropped: {
      width: croppedMetadata.width,
      height: croppedMetadata.height
    },
    wasCropped: wasCropped,
    timestamp: new Date().toISOString()
  };
  
  // Save metadata JSON
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
  
  return {
    original: {
      width: originalMetadata.width,
      height: originalMetadata.height
    },
    cropped: {
      width: croppedMetadata.width,
      height: croppedMetadata.height
    },
    wasCropped: wasCropped,
    outputPath: outputPath,
    metadataPath: metadataPath
  };
}

/**
 * Get all image files recursively from directory
 */
function getImageFiles(dir) {
  const imageFiles = [];
  
  function scan(currentDir) {
    const items = fs.readdirSync(currentDir);
    
    for (const item of items) {
      const fullPath = path.join(currentDir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Recursively scan subdirectories
        scan(fullPath);
      } else if (stat.isFile()) {
        // Check if it's an image file and not already cropped
        const ext = path.extname(item).toLowerCase();
        if ((ext === '.png' || ext === '.jpg' || ext === '.jpeg') && !item.includes('_cropped') && !item.includes('_small')) {
          imageFiles.push(fullPath);
        }
      }
    }
  }
  
  scan(dir);
  return imageFiles;
}

/**
 * Process all screenshots in directory
 */
async function processScreenshots() {
  console.log(`Scanning for images in: ${SCREENSHOTS_BASE_DIR}`);
  const imageFiles = getImageFiles(SCREENSHOTS_BASE_DIR);
  
  console.log(`Found ${imageFiles.length} image files`);
  console.log(`Trim threshold: ${TRIM_THRESHOLD}\n`);
  
  let processed = 0;
  let cropped = 0;
  let skipped = 0;
  
  for (const filePath of imageFiles) {
    const relativePath = path.relative(SCREENSHOTS_BASE_DIR, filePath);
    
    try {
      const result = await cropImage(filePath);
      
      if (result.wasCropped) {
        const savingsPercent = ((1 - (result.cropped.width * result.cropped.height) / 
                                     (result.original.width * result.original.height)) * 100);
        console.log(`✅ CROPPED: ${relativePath}`);
        console.log(`   Original: ${result.original.width}×${result.original.height}`);
        console.log(`   Cropped: ${result.cropped.width}×${result.cropped.height}`);
        console.log(`   Output: ${path.basename(result.outputPath)}`);
        console.log(`   Metadata: ${path.basename(result.metadataPath)}`);
        console.log(`   Saved ${savingsPercent.toFixed(1)}% file size\n`);
        cropped++;
      } else {
        console.log(`⏭️  SKIPPED: ${relativePath} (no white space to trim)`);
        console.log(`   Created: ${path.basename(result.outputPath)} (unchanged)`);
        console.log(`   Metadata: ${path.basename(result.metadataPath)}\n`);
        skipped++;
      }
      
      processed++;
      
      // Progress indicator every 50 files
      if (processed % 50 === 0) {
        console.log(`📊 Progress: ${processed}/${imageFiles.length} files processed...\n`);
      }
    } catch (error) {
      console.error(`❌ ERROR processing ${relativePath}:`, error.message);
    }
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`SUMMARY:`);
  console.log(`  Total files: ${imageFiles.length}`);
  console.log(`  Processed: ${processed}`);
  console.log(`  Cropped: ${cropped}`);
  console.log(`  Skipped (no trim needed): ${skipped}`);
  console.log(`  Failed: ${imageFiles.length - processed}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`\nAll cropped images and metadata saved to their source directories`);
}

// Run the script
processScreenshots().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
