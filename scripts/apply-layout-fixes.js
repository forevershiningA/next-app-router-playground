/**
 * APPLY LAYOUT FIXES TO DESIGNS
 * Takes validated designs and applies auto-fixes to ensure perfect layouts
 * Creates production-ready design data with corrected positions and sizes
 */

const fs = require('fs');
const path = require('path');

// Import validation logic
const { 
  getShapeBoundary,
  parseMLDesignElements,
  isWithinBoundaries,
  checkOverlap,
  autoFixElement,
  validateAndFixDesign
} = require('./validate-design-layouts-utils');

// Load designs
const designsPath = path.join(__dirname, '../lib/saved-designs-analyzed.json');
const designs = JSON.parse(fs.readFileSync(designsPath, 'utf8'));

console.log(`🔧 Applying layout fixes to ${designs.length} designs...\n`);

const stats = {
  processed: 0,
  fixed: 0,
  alreadyValid: 0,
  fixes: []
};

const fixedDesigns = designs.map((design, index) => {
  const validation = validateAndFixDesign(design);
  
  stats.processed++;
  
  if (validation.valid) {
    stats.alreadyValid++;
    return design; // No changes needed
  }
  
  // Design has issues - apply fixes
  stats.fixed++;
  
  const fixedDesign = { ...design };
  
  // Store fix metadata
  fixedDesign._layoutFixes = {
    appliedAt: new Date().toISOString(),
    originalIssues: validation.issues.length,
    fixesApplied: validation.fixes.map(fix => ({
      element: fix.element,
      type: fix.type,
      changes: fix.changes
    }))
  };
  
  // Update design with fixed element positions
  // (This would integrate with your actual design storage format)
  if (validation.fixedElements && validation.fixedElements.length > 0) {
    fixedDesign._fixedLayout = {
      elements: validation.fixedElements,
      boundary: getShapeBoundary(design.shape || design.shapeName)
    };
  }
  
  stats.fixes.push({
    id: design.id,
    name: design.designName || design.id,
    shape: design.shape || design.shapeName,
    issues: validation.issues.length,
    fixes: validation.fixes.length
  });
  
  // Progress
  if ((index + 1) % 500 === 0) {
    console.log(`   Processed ${index + 1}/${designs.length} designs...`);
  }
  
  return fixedDesign;
});

// Save fixed designs
const outputPath = path.join(__dirname, '../lib/saved-designs-layout-fixed.json');
fs.writeFileSync(outputPath, JSON.stringify(fixedDesigns, null, 2));

console.log(`\n✅ LAYOUT FIXES APPLIED:\n`);
console.log(`   Total processed: ${stats.processed}`);
console.log(`   Already valid: ${stats.alreadyValid} (${(stats.alreadyValid / stats.processed * 100).toFixed(1)}%)`);
console.log(`   Fixed: ${stats.fixed} (${(stats.fixed / stats.processed * 100).toFixed(1)}%)`);
console.log(`\n📁 Fixed designs saved to: ${outputPath}`);

if (stats.fixes.length > 0) {
  console.log(`\n🔧 Designs with fixes applied:\n`);
  stats.fixes.forEach(fix => {
    console.log(`   ${fix.id} - ${fix.name}`);
    console.log(`      Shape: ${fix.shape} | Issues: ${fix.issues} | Fixes: ${fix.fixes}\n`);
  });
}

console.log(`\n💡 Next Steps:`);
console.log(`   1. Review fixed designs in: ${outputPath}`);
console.log(`   2. Replace original with fixed version if satisfied`);
console.log(`   3. Regenerate TypeScript exports`);
console.log(`   4. Update production design loader to use fixed positions\n`);
