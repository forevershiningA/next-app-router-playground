/**
 * Generate metadata JSON files for cropped screenshots
 * Usage: node scripts/generate-screenshot-metadata.js
 * 
 * Creates {designId}.json files with width and height of cropped screenshots
 */

const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const SCREENSHOTS_DIR = path.join(__dirname, '../public/ml/forevershining/saved-designs/screenshots-cropped');
const OUTPUT_DIR = path.join(__dirname, '../public/ml/forevershining/saved-designs/screenshot-metadata');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Get image dimensions using sharp
 */
async function getImageDimensions(imagePath) {
  const metadata = await sharp(imagePath).metadata();
  return {
    width: metadata.width,
    height: metadata.height
  };
}

/**
 * Extract design ID from filename
 * Examples: 
 *   1725769905504.png -> 1725769905504
 *   design-123456.png -> 123456
 */
function extractDesignId(filename) {
  // Remove .png extension
  const nameWithoutExt = filename.replace(/\.png$/i, '');
  
  // If it's just a number, return it
  if (/^\d+$/.test(nameWithoutExt)) {
    return nameWithoutExt;
  }
  
  // If it has a prefix like "design-", extract the number
  const match = nameWithoutExt.match(/(\d+)$/);
  if (match) {
    return match[1];
  }
  
  return nameWithoutExt;
}

/**
 * Process all screenshots and generate metadata files
 */
async function generateMetadata() {
  const files = fs.readdirSync(SCREENSHOTS_DIR);
  const pngFiles = files.filter(f => f.toLowerCase().endsWith('.png'));
  
  console.log(`Found ${pngFiles.length} PNG files in ${SCREENSHOTS_DIR}`);
  console.log(`Output directory: ${OUTPUT_DIR}\n`);
  
  let processed = 0;
  let succeeded = 0;
  let failed = 0;
  
  for (const file of pngFiles) {
    const inputPath = path.join(SCREENSHOTS_DIR, file);
    const designId = extractDesignId(file);
    const outputPath = path.join(OUTPUT_DIR, `${designId}.json`);
    
    try {
      const dimensions = await getImageDimensions(inputPath);
      
      const metadata = {
        designId: designId,
        screenshot: {
          width: dimensions.width,
          height: dimensions.height
        },
        cropped: true,
        timestamp: new Date().toISOString()
      };
      
      fs.writeFileSync(outputPath, JSON.stringify(metadata, null, 2));
      
      console.log(`✅ ${file} -> ${designId}.json`);
      console.log(`   Dimensions: ${dimensions.width}×${dimensions.height}\n`);
      
      succeeded++;
    } catch (error) {
      console.error(`❌ ERROR processing ${file}:`, error.message, '\n');
      failed++;
    }
    
    processed++;
  }
  
  console.log(`\n${'='.repeat(60)}`);
  console.log(`SUMMARY:`);
  console.log(`  Total files: ${pngFiles.length}`);
  console.log(`  Processed: ${processed}`);
  console.log(`  Succeeded: ${succeeded}`);
  console.log(`  Failed: ${failed}`);
  console.log(`${'='.repeat(60)}`);
  console.log(`\nMetadata files saved to: ${OUTPUT_DIR}`);
}

// Run the script
generateMetadata().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
