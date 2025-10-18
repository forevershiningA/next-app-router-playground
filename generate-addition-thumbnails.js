const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Import the additions data
const dataPath = './app/_internal/_data.ts';
const dataContent = fs.readFileSync(dataPath, 'utf8');

// Extract additions array from the TypeScript file
const additionsMatch = dataContent.match(/const additions: Addition\[\] = \[([\s\S]*?)\];/);
if (!additionsMatch) {
  console.error('Could not find additions array in _data.ts');
  process.exit(1);
}

// Parse additions manually (simple regex-based parsing)
const additionsText = additionsMatch[1];
const additionRegex = /{\s*id:\s*'([^']+)',\s*(?:file:\s*"([^"]+)",\s*)?name:\s*'([^']+)',\s*image:\s*'([^']+)',\s*type:\s*'([^']+)',\s*category:\s*'([^']+)'\s*}/g;

const additions = [];
let match;
while ((match = additionRegex.exec(additionsText)) !== null) {
  additions.push({
    id: match[1],
    file: match[2],
    name: match[3],
    image: match[4],
    type: match[5],
    category: match[6]
  });
}

console.log(`Found ${additions.length} additions to process`);

// Thumbnail settings
const THUMBNAIL_SIZE = 400; // 400x400 pixels
const THUMBNAIL_QUALITY = 85;
const FORCE_REGENERATE = true; // Force regenerate all thumbnails

async function generateThumbnail(addition) {
  // Extract directory number from ID and remove leading zeros
  // e.g., K0383 -> 383, B1134S -> 1134
  const dirMatch = addition.id.match(/\d+/);
  const dirNum = dirMatch ? parseInt(dirMatch[0], 10).toString() : addition.id;
  
  const sourceImagePath = path.join('public', 'additions', dirNum, addition.image);
  
  // Skip if source doesn't exist
  if (!fs.existsSync(sourceImagePath)) {
    console.log(`⚠️  Source not found: ${sourceImagePath}`);
    return { success: false, reason: 'source_not_found' };
  }
  
  // Create thumbnail filename
  const ext = path.extname(addition.image);
  const baseName = path.basename(addition.image, ext);
  const thumbnailName = `${baseName}_thumb.jpg`; // Always use .jpg for thumbnails
  const thumbnailPath = path.join('public', 'additions', dirNum, thumbnailName);
  
  // Delete existing thumbnail if forcing regeneration
  if (FORCE_REGENERATE && fs.existsSync(thumbnailPath)) {
    fs.unlinkSync(thumbnailPath);
  }
  
  // Skip if thumbnail already exists (when not forcing)
  if (!FORCE_REGENERATE && fs.existsSync(thumbnailPath)) {
    console.log(`⏭️  Already exists: ${thumbnailPath}`);
    return { success: true, thumbnailName, skipped: true };
  }
  
  try {
    // Generate thumbnail with WHITE background
    await sharp(sourceImagePath)
      .resize(THUMBNAIL_SIZE, THUMBNAIL_SIZE, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 1 } // WHITE background
      })
      .jpeg({ quality: THUMBNAIL_QUALITY })
      .toFile(thumbnailPath);
    
    console.log(`✓ Generated: ${thumbnailPath}`);
    return { success: true, thumbnailName };
  } catch (error) {
    console.error(`✗ Error processing ${sourceImagePath}:`, error.message);
    return { success: false, reason: error.message };
  }
}

async function processAllAdditions() {
  console.log('\n🖼️  Generating thumbnails for additions with WHITE background...\n');
  
  const results = {
    success: 0,
    failed: 0,
    skipped: 0,
    alreadyExists: 0
  };
  
  for (const addition of additions) {
    const result = await generateThumbnail(addition);
    
    if (result.success) {
      if (result.skipped) {
        results.alreadyExists++;
      } else {
        results.success++;
      }
    } else if (result.reason === 'source_not_found') {
      results.skipped++;
    } else {
      results.failed++;
    }
  }
  
  console.log('\n📊 Summary:');
  console.log(`   ✓ Successfully generated: ${results.success}`);
  console.log(`   ⏭️  Already existed: ${results.alreadyExists}`);
  console.log(`   ⚠️  Skipped (no source): ${results.skipped}`);
  console.log(`   ✗ Failed: ${results.failed}`);
  console.log(`   Total processed: ${additions.length}\n`);
}

// Run the script
processAllAdditions().catch(console.error);
