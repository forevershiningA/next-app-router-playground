const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function convertJpgToWebp(inputPath, outputPath) {
  try {
    await sharp(inputPath)
      .webp({ quality: 85 })
      .toFile(outputPath);
    console.log(`✓ Converted: ${path.relative(process.cwd(), inputPath)}`);
  } catch (error) {
    console.error(`✗ Failed: ${path.relative(process.cwd(), inputPath)} - ${error.message}`);
  }
}

async function findAndConvertJpgFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const conversions = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      conversions.push(...await findAndConvertJpgFiles(fullPath));
    } else if (entry.isFile() && /\.(jpg|jpeg)$/i.test(entry.name)) {
      const outputPath = fullPath.replace(/\.(jpg|jpeg)$/i, '.webp');
      conversions.push(convertJpgToWebp(fullPath, outputPath));
    }
  }

  return conversions;
}

async function main() {
  const jpgDir = path.join(process.cwd(), 'public', 'jpg');
  
  if (!fs.existsSync(jpgDir)) {
    console.error(`Directory not found: ${jpgDir}`);
    process.exit(1);
  }

  console.log('Starting JPG to WebP conversion...\n');
  const conversions = await findAndConvertJpgFiles(jpgDir);
  await Promise.all(conversions);
  console.log(`\nCompleted! Converted ${conversions.length} images.`);
}

main().catch(console.error);
