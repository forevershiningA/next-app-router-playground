/**
 * Import reviewed inscription phrases and update slug generation
 * Run this after you've reviewed and marked phrases in inscription-phrases-review.json
 */

const fs = require('fs');
const path = require('path');

// Load reviewed phrases
const reviewPath = path.join(__dirname, '../lib/inscription-phrases-review.json');
const reviewedPhrases = JSON.parse(fs.readFileSync(reviewPath, 'utf8'));

console.log(`📊 Processing ${reviewedPhrases.length} reviewed phrases...\n`);

// Filter for SEO-useful phrases
const seoUsefulPhrases = reviewedPhrases
  .filter(p => p.usefulForSEO === true)
  .sort((a, b) => {
    // Sort by phrase length (longer first for better matching)
    return b.phrase.length - a.phrase.length;
  });

console.log(`✅ Found ${seoUsefulPhrases.length} SEO-useful phrases\n`);

// Group by category
const byType = {};
const byLanguage = {};

seoUsefulPhrases.forEach(phrase => {
  const type = phrase.phraseType || 'uncategorized';
  const lang = phrase.language || 'unknown';
  
  if (!byType[type]) byType[type] = [];
  if (!byLanguage[lang]) byLanguage[lang] = [];
  
  byType[type].push(phrase);
  byLanguage[lang].push(phrase);
});

// Show statistics
console.log(`📈 By Type:`);
Object.entries(byType).forEach(([type, phrases]) => {
  console.log(`   ${type}: ${phrases.length} phrases`);
});

console.log(`\n🌍 By Language:`);
Object.entries(byLanguage).forEach(([lang, phrases]) => {
  console.log(`   ${lang}: ${phrases.length} phrases`);
});

// Generate JavaScript code for slug generation
const normalizePhrase = (phrase) => {
  return phrase
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/['''`]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

// Create phrase list grouped by type
let codeOutput = '// Auto-generated from reviewed inscription phrases\n\n';
codeOutput += 'const meaningfulPhrases = [\n';

// Add phrases by priority (longer first)
seoUsefulPhrases.forEach(phrase => {
  const normalized = normalizePhrase(phrase.phrase);
  const comment = phrase.phraseType ? ` // ${phrase.phraseType}` : '';
  const langComment = phrase.language ? ` (${phrase.language})` : '';
  codeOutput += `  '${normalized}',${comment}${langComment}\n`;
});

codeOutput += '];\n';

// Save the code
const codeOutputPath = path.join(__dirname, '../lib/generated-memorial-phrases.js');
fs.writeFileSync(codeOutputPath, codeOutput);

console.log(`\n✅ Generated phrase list: ${codeOutputPath}`);
console.log(`\n💡 Next Steps:`);
console.log(`   1. Review the generated file`);
console.log(`   2. Copy the phrases array into generate-unique-slugs.js`);
console.log(`   3. Regenerate slugs\n`);

// Also create a summary JSON for reference
const summary = {
  totalReviewed: reviewedPhrases.length,
  seoUseful: seoUsefulPhrases.length,
  byType: Object.fromEntries(
    Object.entries(byType).map(([k, v]) => [k, v.length])
  ),
  byLanguage: Object.fromEntries(
    Object.entries(byLanguage).map(([k, v]) => [k, v.length])
  ),
  phrases: seoUsefulPhrases.map(p => ({
    phrase: p.phrase,
    normalized: normalizePhrase(p.phrase),
    frequency: p.frequency,
    type: p.phraseType,
    language: p.language
  }))
};

const summaryPath = path.join(__dirname, '../lib/seo-phrases-summary.json');
fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
console.log(`📊 Summary saved: ${summaryPath}\n`);
