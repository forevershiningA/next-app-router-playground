/**
 * Convert all JPEG textures to WebP format
 * Reduces file size while maintaining quality
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const TEXTURES_DIR = path.join(__dirname, '..', 'public', 'textures');
const QUALITY = 90; // WebP quality (0-100)

async function convertToWebP(jpegPath) {
  const webpPath = jpegPath.replace(/\.jpe?g$/i, '.webp');
  
  try {
    await sharp(jpegPath)
      .webp({ quality: QUALITY })
      .toFile(webpPath);
    
    const jpegSize = fs.statSync(jpegPath).size;
    const webpSize = fs.statSync(webpPath).size;
    const savings = ((jpegSize - webpSize) / jpegSize * 100).toFixed(1);
    
    console.log(`✓ ${path.basename(jpegPath)} → ${path.basename(webpPath)} (${savings}% smaller)`);
    
    // Delete original JPEG after successful conversion
    fs.unlinkSync(jpegPath);
    
    return { success: true, jpegSize, webpSize };
  } catch (error) {
    console.error(`✗ Failed to convert ${jpegPath}:`, error.message);
    return { success: false, error };
  }
}

async function findJPEGFiles(dir) {
  const files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      files.push(...await findJPEGFiles(fullPath));
    } else if (/\.jpe?g$/i.test(entry.name)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

async function main() {
  console.log('🔍 Scanning for JPEG files in public/textures/...\n');
  
  const jpegFiles = await findJPEGFiles(TEXTURES_DIR);
  console.log(`Found ${jpegFiles.length} JPEG files\n`);
  
  if (jpegFiles.length === 0) {
    console.log('No JPEG files to convert!');
    return;
  }
  
  console.log('🔄 Converting to WebP...\n');
  
  let totalJpegSize = 0;
  let totalWebpSize = 0;
  let successCount = 0;
  
  for (const jpegPath of jpegFiles) {
    const result = await convertToWebP(jpegPath);
    
    if (result.success) {
      totalJpegSize += result.jpegSize;
      totalWebpSize += result.webpSize;
      successCount++;
    }
  }
  
  console.log('\n✨ Conversion complete!');
  console.log(`\nSuccessfully converted: ${successCount}/${jpegFiles.length} files`);
  
  if (totalJpegSize > 0) {
    const totalSavings = ((totalJpegSize - totalWebpSize) / totalJpegSize * 100).toFixed(1);
    const jpegMB = (totalJpegSize / 1024 / 1024).toFixed(2);
    const webpMB = (totalWebpSize / 1024 / 1024).toFixed(2);
    const savedMB = (jpegMB - webpMB).toFixed(2);
    
    console.log(`\nSize comparison:`);
    console.log(`  Original JPEG: ${jpegMB} MB`);
    console.log(`  WebP format:   ${webpMB} MB`);
    console.log(`  Saved:         ${savedMB} MB (${totalSavings}% reduction)`);
  }
}

main().catch(console.error);
