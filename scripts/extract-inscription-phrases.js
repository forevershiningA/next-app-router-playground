/**
 * Extract all unique inscription phrases from saved designs
 * This will help identify SEO-valuable memorial phrases for your market
 */

const fs = require('fs');
const path = require('path');

// Load analyzed designs
const designsPath = path.join(__dirname, '../lib/saved-designs-analyzed.json');
const designs = JSON.parse(fs.readFileSync(designsPath, 'utf8'));

console.log(`📊 Analyzing ${designs.length} designs for inscription phrases...\n`);

// Extract all inscription phrases
const inscriptionMap = new Map();

designs.forEach(design => {
  if (design.inscriptions && design.inscriptions.trim()) {
    const text = design.inscriptions.trim();
    
    // Split by common separators and extract phrases
    const phrases = text.split(/[\n\r]+/)
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    phrases.forEach(phrase => {
      // Store unique phrases with their frequency and examples
      if (!inscriptionMap.has(phrase)) {
        inscriptionMap.set(phrase, {
          phrase: phrase,
          frequency: 0,
          exampleDesignIds: [],
          categories: new Set(),
          products: new Set()
        });
      }
      
      const entry = inscriptionMap.get(phrase);
      entry.frequency++;
      
      // Add up to 3 example design IDs
      if (entry.exampleDesignIds.length < 3) {
        entry.exampleDesignIds.push(design.id);
      }
      
      // Track categories and products
      entry.categories.add(design.category);
      entry.products.add(design.productSlug);
    });
  }
});

// Convert to array and sort by frequency
const inscriptions = Array.from(inscriptionMap.values())
  .map(entry => ({
    phrase: entry.phrase,
    frequency: entry.frequency,
    exampleDesignIds: entry.exampleDesignIds,
    categories: Array.from(entry.categories),
    products: Array.from(entry.products),
    // Fields for manual review
    usefulForSEO: null, // true/false/null - to be filled by you
    language: null, // 'en', 'ro', 'sm', 'mi', etc. - to be filled by you
    phraseType: null, // 'biblical', 'poetic', 'tribute', 'cultural', etc. - to be filled by you
    notes: '' // Any notes about this phrase
  }))
  .sort((a, b) => b.frequency - a.frequency);

// Save to JSON file
const outputPath = path.join(__dirname, '../lib/inscription-phrases-review.json');
fs.writeFileSync(outputPath, JSON.stringify(inscriptions, null, 2));

console.log(`✅ Extracted ${inscriptions.length} unique inscription phrases`);
console.log(`📁 Saved to: ${outputPath}\n`);

// Show statistics
console.log(`📈 Statistics:`);
console.log(`   Total unique phrases: ${inscriptions.length}`);
console.log(`   Total designs with inscriptions: ${designs.filter(d => d.inscriptions).length}`);

// Show top 20 most common phrases
console.log(`\n🔝 Top 20 Most Common Phrases:\n`);
inscriptions.slice(0, 20).forEach((entry, index) => {
  const preview = entry.phrase.substring(0, 80);
  console.log(`   ${index + 1}. [${entry.frequency}x] ${preview}${entry.phrase.length > 80 ? '...' : ''}`);
});

console.log(`\n💡 Next Steps:`);
console.log(`   1. Open: lib/inscription-phrases-review.json`);
console.log(`   2. For each phrase, set:`);
console.log(`      - usefulForSEO: true/false (should this be in slugs?)`);
console.log(`      - language: 'en', 'ro', 'sm', 'mi', etc.`);
console.log(`      - phraseType: 'biblical', 'poetic', 'tribute', 'cultural', etc.`);
console.log(`      - notes: any comments`);
console.log(`   3. Save the file`);
console.log(`   4. Run the import script to use your selections\n`);
