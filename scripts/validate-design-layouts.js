/**
 * DESIGN LAYOUT VALIDATOR & AUTO-FIXER
 * Ensures all inscriptions and motifs fit perfectly on headstones/bases
 * Automatically adjusts font sizes, positions, and prevents overlaps/overflow
 */

const fs = require('fs');
const path = require('path');

// Load designs
const designsPath = path.join(__dirname, '../lib/saved-designs-analyzed.json');
const designs = JSON.parse(fs.readFileSync(designsPath, 'utf8'));

console.log(`🔍 Validating layout for ${designs.length} designs...\n`);

// Define boundaries for each shape type (relative coordinates 0-1)
const SHAPE_BOUNDARIES = {
  'serpentine': { top: 0.05, bottom: 0.95, left: 0.05, right: 0.95, width: 1.0, height: 1.0 },
  'square': { top: 0.05, bottom: 0.95, left: 0.05, right: 0.95, width: 1.0, height: 1.0 },
  'peak': { top: 0.1, bottom: 0.95, left: 0.05, right: 0.95, width: 1.0, height: 1.0 }, // Angled top
  'curved-top': { top: 0.08, bottom: 0.95, left: 0.05, right: 0.95, width: 1.0, height: 1.0 },
  'curved-peak': { top: 0.12, bottom: 0.95, left: 0.05, right: 0.95, width: 1.0, height: 1.0 },
  'cropped-peak': { top: 0.08, bottom: 0.95, left: 0.05, right: 0.95, width: 1.0, height: 1.0 },
  'gable': { top: 0.12, bottom: 0.95, left: 0.05, right: 0.95, width: 1.0, height: 1.0 },
  'curved-gable': { top: 0.12, bottom: 0.95, left: 0.05, right: 0.95, width: 1.0, height: 1.0 },
  'half-round': { top: 0.1, bottom: 0.95, left: 0.05, right: 0.95, width: 1.0, height: 1.0 },
  'oval': { top: 0.1, bottom: 0.9, left: 0.1, right: 0.9, width: 1.0, height: 1.0 },
  'heart': { top: 0.15, bottom: 0.95, left: 0.1, right: 0.9, width: 1.0, height: 1.0 },
  'left-wave': { top: 0.08, bottom: 0.95, left: 0.08, right: 0.92, width: 1.0, height: 1.0 },
  'right-wave': { top: 0.08, bottom: 0.95, left: 0.08, right: 0.92, width: 1.0, height: 1.0 },
  'rectangle': { top: 0.05, bottom: 0.95, left: 0.05, right: 0.95, width: 1.0, height: 1.0 },
  // Bases typically have less vertical space
  'base': { top: 0.15, bottom: 0.85, left: 0.1, right: 0.9, width: 1.0, height: 0.3 },
};

/**
 * Get shape boundary for a given shape name
 */
function getShapeBoundary(shapeName) {
  if (!shapeName) return SHAPE_BOUNDARIES['square']; // Default
  
  const normalized = shapeName.toLowerCase().replace(/[_\s]+/g, '-');
  return SHAPE_BOUNDARIES[normalized] || SHAPE_BOUNDARIES['square'];
}

/**
 * Parse ML design data to extract elements
 */
function parseMLDesignElements(design) {
  const elements = [];
  
  // Parse inscriptions from tags
  if (design.inscriptions) {
    const lines = design.inscriptions
      .split(/\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    lines.forEach((text, index) => {
      // Estimate font size based on line position and length
      let estimatedSize = 60; // Default
      if (index === 0 && text.length < 30) estimatedSize = 100; // Title
      else if (index === 1 && text.length < 40) estimatedSize = 80; // Subtitle
      else if (text.length < 20) estimatedSize = 70;
      else if (text.length > 100) estimatedSize = 40;
      
      // Estimate position (vertical stacking)
      const yPosition = 0.2 + (index * 0.1);
      
      elements.push({
        type: 'inscription',
        text: text,
        fontSize: estimatedSize,
        x: 0.5, // Centered horizontally
        y: Math.min(yPosition, 0.9), // Don't exceed bottom
        width: 0.8, // 80% of width
        height: estimatedSize / 1000, // Relative height
        originalY: yPosition
      });
    });
  }
  
  // Parse motifs if present
  if (design.motif && design.motif !== 'None') {
    elements.push({
      type: 'motif',
      name: design.motif,
      x: 0.5, // Centered
      y: 0.1, // Top area
      width: 0.3,
      height: 0.2,
      scale: 1.0
    });
  }
  
  return elements;
}

/**
 * Check if element is within boundaries
 */
function isWithinBoundaries(element, boundary) {
  const issues = [];
  
  // Calculate element bounds
  const left = element.x - (element.width / 2);
  const right = element.x + (element.width / 2);
  const top = element.y - (element.height / 2);
  const bottom = element.y + (element.height / 2);
  
  // Check boundaries
  if (top < boundary.top) {
    issues.push({ type: 'overflow-top', amount: boundary.top - top });
  }
  if (bottom > boundary.bottom) {
    issues.push({ type: 'overflow-bottom', amount: bottom - boundary.bottom });
  }
  if (left < boundary.left) {
    issues.push({ type: 'overflow-left', amount: boundary.left - left });
  }
  if (right > boundary.right) {
    issues.push({ type: 'overflow-right', amount: boundary.right - right });
  }
  
  return {
    valid: issues.length === 0,
    issues: issues
  };
}

/**
 * Check if two elements overlap
 */
function checkOverlap(element1, element2) {
  // Calculate bounds
  const e1Left = element1.x - (element1.width / 2);
  const e1Right = element1.x + (element1.width / 2);
  const e1Top = element1.y - (element1.height / 2);
  const e1Bottom = element1.y + (element1.height / 2);
  
  const e2Left = element2.x - (element2.width / 2);
  const e2Right = element2.x + (element2.width / 2);
  const e2Top = element2.y - (element2.height / 2);
  const e2Bottom = element2.y + (element2.height / 2);
  
  // Check overlap
  const overlaps = !(e1Right < e2Left || e1Left > e2Right || 
                     e1Bottom < e2Top || e1Top > e2Bottom);
  
  if (overlaps) {
    // Calculate overlap area
    const overlapWidth = Math.min(e1Right, e2Right) - Math.max(e1Left, e2Left);
    const overlapHeight = Math.min(e1Bottom, e2Bottom) - Math.max(e1Top, e2Top);
    
    return {
      overlaps: true,
      area: overlapWidth * overlapHeight,
      width: overlapWidth,
      height: overlapHeight
    };
  }
  
  return { overlaps: false };
}

/**
 * Auto-fix element positioning
 */
function autoFixElement(element, boundary, otherElements = []) {
  const fixed = { ...element };
  const fixes = [];
  
  // 1. Fix overflow issues
  const boundaryCheck = isWithinBoundaries(element, boundary);
  
  if (!boundaryCheck.valid) {
    boundaryCheck.issues.forEach(issue => {
      switch (issue.type) {
        case 'overflow-top':
          fixed.y += issue.amount;
          fixes.push(`Moved down ${(issue.amount * 100).toFixed(1)}%`);
          break;
        case 'overflow-bottom':
          fixed.y -= issue.amount;
          fixes.push(`Moved up ${(issue.amount * 100).toFixed(1)}%`);
          break;
        case 'overflow-left':
          fixed.x += issue.amount;
          fixes.push(`Moved right ${(issue.amount * 100).toFixed(1)}%`);
          break;
        case 'overflow-right':
          fixed.x -= issue.amount;
          fixes.push(`Moved left ${(issue.amount * 100).toFixed(1)}%`);
          break;
      }
    });
  }
  
  // 2. Check for overlaps with other elements
  otherElements.forEach((other, index) => {
    const overlap = checkOverlap(fixed, other);
    if (overlap.overlaps) {
      // Move element down to avoid overlap
      fixed.y = other.y + (other.height / 2) + (fixed.height / 2) + 0.02;
      fixes.push(`Moved to avoid overlap with element ${index + 1}`);
    }
  });
  
  // 3. Re-check boundaries after overlap fixes
  const finalCheck = isWithinBoundaries(fixed, boundary);
  if (!finalCheck.valid) {
    // If still overflowing, reduce size instead
    if (element.type === 'inscription' && element.fontSize > 30) {
      fixed.fontSize = Math.max(30, element.fontSize * 0.8);
      fixed.height = fixed.fontSize / 1000;
      fixes.push(`Reduced font size to ${fixed.fontSize}px`);
    } else if (element.type === 'motif' && element.scale > 0.5) {
      fixed.scale = Math.max(0.5, element.scale * 0.8);
      fixed.width *= 0.8;
      fixed.height *= 0.8;
      fixes.push(`Reduced motif scale to ${(fixed.scale * 100).toFixed(0)}%`);
    }
  }
  
  return {
    fixed: fixed,
    applied: fixes
  };
}

/**
 * Validate and fix entire design layout
 */
function validateAndFixDesign(design) {
  const shapeName = design.shape || design.shapeName || 'square';
  const boundary = getShapeBoundary(shapeName);
  const elements = parseMLDesignElements(design);
  
  if (elements.length === 0) {
    return { valid: true, issues: [], fixes: [] };
  }
  
  const issues = [];
  const fixes = [];
  const fixedElements = [];
  
  // Check each element
  elements.forEach((element, index) => {
    // Check boundaries
    const boundaryCheck = isWithinBoundaries(element, boundary);
    if (!boundaryCheck.valid) {
      issues.push({
        element: index,
        type: element.type,
        problems: boundaryCheck.issues
      });
    }
    
    // Check overlaps with previous elements
    fixedElements.forEach((other, otherIndex) => {
      const overlap = checkOverlap(element, other);
      if (overlap.overlaps) {
        issues.push({
          element: index,
          type: 'overlap',
          overlaps: otherIndex,
          area: overlap.area
        });
      }
    });
    
    // Auto-fix if issues found
    if (issues.filter(i => i.element === index).length > 0) {
      const result = autoFixElement(element, boundary, fixedElements);
      fixedElements.push(result.fixed);
      
      if (result.applied.length > 0) {
        fixes.push({
          element: index,
          type: element.type,
          original: element,
          fixed: result.fixed,
          changes: result.applied
        });
      }
    } else {
      fixedElements.push(element);
    }
  });
  
  return {
    valid: issues.length === 0,
    issues: issues,
    fixes: fixes,
    fixedElements: fixedElements
  };
}

// Validate all designs
const results = {
  totalDesigns: designs.length,
  validDesigns: 0,
  designsWithIssues: 0,
  designsFixed: 0,
  issueTypes: {},
  fixTypes: {}
};

const designsWithIssues = [];

designs.forEach((design, index) => {
  const validation = validateAndFixDesign(design);
  
  if (validation.valid) {
    results.validDesigns++;
  } else {
    results.designsWithIssues++;
    
    // Track issue types
    validation.issues.forEach(issue => {
      const type = issue.type === 'overlap' ? 'overlap' : issue.problems?.[0]?.type || 'unknown';
      results.issueTypes[type] = (results.issueTypes[type] || 0) + 1;
    });
    
    // Track fixes
    if (validation.fixes.length > 0) {
      results.designsFixed++;
      
      validation.fixes.forEach(fix => {
        fix.changes.forEach(change => {
          const changeType = change.split(' ')[0]; // "Moved", "Reduced", etc.
          results.fixTypes[changeType] = (results.fixTypes[changeType] || 0) + 1;
        });
      });
    }
    
    // Save for detailed report
    if (designsWithIssues.length < 50) { // Limit sample
      designsWithIssues.push({
        id: design.id,
        name: design.designName || design.id,
        shape: design.shape || design.shapeName,
        category: design.category,
        issues: validation.issues.length,
        fixes: validation.fixes.length,
        details: validation
      });
    }
  }
  
  // Progress indicator
  if ((index + 1) % 500 === 0) {
    console.log(`   Processed ${index + 1}/${designs.length} designs...`);
  }
});

// Output results
console.log(`\n📊 VALIDATION RESULTS:\n`);
console.log(`   Total designs: ${results.totalDesigns}`);
console.log(`   ✅ Valid layouts: ${results.validDesigns} (${(results.validDesigns / results.totalDesigns * 100).toFixed(1)}%)`);
console.log(`   ⚠️  Issues found: ${results.designsWithIssues} (${(results.designsWithIssues / results.totalDesigns * 100).toFixed(1)}%)`);
console.log(`   🔧 Auto-fixed: ${results.designsFixed} (${(results.designsFixed / results.totalDesigns * 100).toFixed(1)}%)`);

console.log(`\n📈 Issue Types:`);
Object.entries(results.issueTypes)
  .sort((a, b) => b[1] - a[1])
  .forEach(([type, count]) => {
    console.log(`   ${type}: ${count}`);
  });

console.log(`\n🔧 Fix Types Applied:`);
Object.entries(results.fixTypes)
  .sort((a, b) => b[1] - a[1])
  .forEach(([type, count]) => {
    console.log(`   ${type}: ${count}`);
  });

// Sample issues
if (designsWithIssues.length > 0) {
  console.log(`\n🔍 Sample Designs with Issues (first 10):\n`);
  designsWithIssues.slice(0, 10).forEach(design => {
    console.log(`   ${design.id} - ${design.name}`);
    console.log(`      Shape: ${design.shape} | Category: ${design.category}`);
    console.log(`      Issues: ${design.issues} | Fixes applied: ${design.fixes}`);
    
    if (design.details.fixes.length > 0) {
      design.details.fixes.slice(0, 2).forEach(fix => {
        console.log(`      - ${fix.type}: ${fix.changes.join(', ')}`);
      });
    }
    console.log('');
  });
}

// Save detailed report
const reportPath = path.join(__dirname, '../lib/layout-validation-report.json');
fs.writeFileSync(reportPath, JSON.stringify({
  summary: results,
  samplesWithIssues: designsWithIssues
}, null, 2));

console.log(`\n✅ Detailed report saved: ${reportPath}\n`);

console.log(`💡 RECOMMENDATIONS:\n`);
console.log(`   1. Review the sample designs with issues`);
console.log(`   2. Apply auto-fixes to production designs`);
console.log(`   3. Update design templates with corrected positions`);
console.log(`   4. Re-generate screenshots with fixed layouts\n`);
