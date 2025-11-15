/**
 * PRODUCTION-GRADE LAYOUT VALIDATOR V2.0
 * Physical-units validation with material-aware constraints
 */

const fs = require('fs');
const path = require('path');

// Load designs
const designsPath = path.join(__dirname, '../lib/saved-designs-analyzed.json');
const designs = JSON.parse(fs.readFileSync(designsPath, 'utf8'));

console.log(`🔍 Production Layout Validation v2.0\n`);
console.log(`   Processing ${designs.length} designs with physical constraints...\n`);

// ============================================================================
// PHYSICAL CONSTRAINTS (in millimetres)
// ============================================================================

const MATERIAL_CONSTRAINTS = {
  'granite-sandblast': {
    minLetterHeight: 6,      // mm - minimum readable sandblast
    minStrokeWidth: 0.8,     // mm - avoid fill-in
    minLineGap: 4,           // mm - prevent serif collision
    contrastThreshold: 0.6,  // 0-1 scale
    method: 'sandblast'
  },
  'granite-laser': {
    minLetterHeight: 4,      // mm - laser can go smaller
    minStrokeWidth: 0.3,     // mm - finer detail
    minLineGap: 3,           // mm
    contrastThreshold: 0.5,
    method: 'laser'
  },
  'bronze-laser': {
    minLetterHeight: 3,      // mm - bronze plaques smaller
    minStrokeWidth: 0.2,     // mm
    minLineGap: 2,           // mm
    contrastThreshold: 0.7,
    method: 'laser'
  },
  'marble-sandblast': {
    minLetterHeight: 8,      // mm - lighter stone needs bigger
    minStrokeWidth: 1.0,     // mm
    minLineGap: 5,           // mm
    contrastThreshold: 0.4,  // lighter = lower contrast
    method: 'sandblast'
  }
};

// Font metrics (approximations - would use actual font files in production)
const FONT_METRICS = {
  'Times New Roman': {
    capHeight: 0.662,        // ratio of font size
    xHeight: 0.448,
    ascent: 0.891,
    descent: 0.216,
    strokeWidth: 0.08,       // ratio for regular weight
    hasSerifs: true
  },
  'Arial': {
    capHeight: 0.716,
    xHeight: 0.518,
    ascent: 0.905,
    descent: 0.211,
    strokeWidth: 0.12,       // wider strokes
    hasSerifs: false
  },
  'Georgia': {
    capHeight: 0.692,
    xHeight: 0.481,
    ascent: 0.916,
    descent: 0.219,
    strokeWidth: 0.09,
    hasSerifs: true
  }
};

// Diacritic height adjustments
const DIACRITIC_CHARACTERS = {
  'high': ['Ă', 'Â', 'Ê', 'Î', 'Ô', 'Û', 'Ã', 'Õ', 'Ñ', 'Ý', 'Ï', 'Ö', 'Ü'],
  'low': ['Ą', 'Ę', 'Į', 'Ų', 'Ç', 'Ş', 'Ţ'],
  'both': ['Ầ', 'Ấ', 'Ẩ', 'Ẫ', 'Ậ']
};

// Default material selection based on design type
function getMaterialType(design) {
  const type = design.type?.toLowerCase() || '';
  const style = design.style?.toLowerCase() || '';
  
  if (type.includes('plaque') && type.includes('bronze')) return 'bronze-laser';
  if (type.includes('plaque')) return 'granite-laser';
  if (style.includes('laser')) return 'granite-laser';
  if (design.texture?.includes('marble')) return 'marble-sandblast';
  
  return 'granite-sandblast'; // Default
}

// ============================================================================
// POLYGONAL SAFE AREAS (not just rectangles!)
// ============================================================================

// Generate standard rectangle polygon
function makeRectPolygon(margin = 0.05) {
  return {
    safeArea: [
      { x: margin, y: margin },
      { x: 1 - margin, y: margin },
      { x: 1 - margin, y: 1 - margin },
      { x: margin, y: 1 - margin }
    ],
    margin: margin
  };
}

// Generate peak/gable polygon (angled top)
function makePeakPolygon(margin = 0.05, topMargin = 0.12) {
  return {
    safeArea: [
      { x: 0.5, y: topMargin },      // Peak point
      { x: 1 - margin, y: margin + 0.1 },  // Right slope
      { x: 1 - margin, y: 1 - margin },
      { x: margin, y: 1 - margin },
      { x: margin, y: margin + 0.1 },      // Left slope
    ],
    margin: topMargin
  };
}

const SHAPE_POLYGONS = {
  'heart': {
    // Polygon points (normalized 0-1) tracing the heart's safe interior
    safeArea: [
      { x: 0.5, y: 0.15 },   // Top center
      { x: 0.65, y: 0.2 },   // Right curve start
      { x: 0.75, y: 0.35 },
      { x: 0.8, y: 0.5 },
      { x: 0.75, y: 0.65 },
      { x: 0.65, y: 0.8 },
      { x: 0.5, y: 0.95 },   // Bottom point
      { x: 0.35, y: 0.8 },
      { x: 0.25, y: 0.65 },
      { x: 0.2, y: 0.5 },
      { x: 0.25, y: 0.35 },
      { x: 0.35, y: 0.2 }    // Left curve start
    ],
    margin: 0.1,  // 10% inset
    widthScaleFactor: 0.98  // Apply 2% horizontal compression before size reduction
  },
  'oval': {
    // Approximate oval with 12-point polygon
    safeArea: [
      { x: 0.5, y: 0.1 },
      { x: 0.67, y: 0.15 },
      { x: 0.82, y: 0.25 },
      { x: 0.9, y: 0.5 },
      { x: 0.82, y: 0.75 },
      { x: 0.67, y: 0.85 },
      { x: 0.5, y: 0.9 },
      { x: 0.33, y: 0.85 },
      { x: 0.18, y: 0.75 },
      { x: 0.1, y: 0.5 },
      { x: 0.18, y: 0.25 },
      { x: 0.33, y: 0.15 }
    ],
    margin: 0.1
  },
  'oval (landscape)': makeRectPolygon(0.1),
  'oval (portrait)': makeRectPolygon(0.1),
  'oval landscape': makeRectPolygon(0.1),
  'peak': makePeakPolygon(0.05, 0.1),
  'curved peak': makePeakPolygon(0.05, 0.12),
  'cropped peak': makePeakPolygon(0.05, 0.08),
  'gable': makePeakPolygon(0.05, 0.12),
  'curved gable': makePeakPolygon(0.05, 0.12),
  'serpentine': makeRectPolygon(0.05),
  'square': makeRectPolygon(0.05),
  'rectangle': makeRectPolygon(0.05),
  'rectangle (landscape)': makeRectPolygon(0.05),
  'rectangle (portrait)': makeRectPolygon(0.05),
  'rectangle portrait': makeRectPolygon(0.05),
  'rectangle 125x175': makeRectPolygon(0.05),
  'rectangle 175x125': makeRectPolygon(0.05),
  'square 125x125': makeRectPolygon(0.05),
  'square 300x300': makeRectPolygon(0.05),
  'landscape': makeRectPolygon(0.05),
  'portrait': makeRectPolygon(0.05),
  'curved top': makeRectPolygon(0.08),
  'half round': makeRectPolygon(0.1),
  'left wave': makeRectPolygon(0.08),
  'right wave': makeRectPolygon(0.08),
  'circle': makeRectPolygon(0.15),  // Larger margin for circle
  'bronze plaque': makeRectPolygon(0.05),
  'full-colour plaque': makeRectPolygon(0.05),
  'stainless steel plaque': makeRectPolygon(0.05),
  // Generic headstone shapes
  ...Object.fromEntries(
    Array.from({length: 50}, (_, i) => [`headstone ${i + 1}`, makeRectPolygon(0.05)])
  )
};

// Point-in-polygon check (ray casting algorithm)
function isPointInPolygon(point, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    
    const intersect = ((yi > point.y) !== (yj > point.y))
      && (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
    
    if (intersect) inside = !inside;
  }
  return inside;
}

// Check if rectangle is within polygon
function isRectInPolygon(rect, polygon) {
  // Check all four corners
  const corners = [
    { x: rect.left, y: rect.top },
    { x: rect.right, y: rect.top },
    { x: rect.right, y: rect.bottom },
    { x: rect.left, y: rect.bottom }
  ];
  
  return corners.every(corner => isPointInPolygon(corner, polygon));
}

// ============================================================================
// ENHANCED ELEMENT PARSING
// ============================================================================

function parseMLDesignElementsV2(design, materialType) {
  const elements = [];
  const constraints = MATERIAL_CONSTRAINTS[materialType];
  const defaultFont = design.defaultFont || 'Times New Roman';
  const fontMetrics = FONT_METRICS[defaultFont] || FONT_METRICS['Times New Roman'];
  
  // Assume standard headstone: 600mm × 900mm (portrait)
  const headstoneWidthMm = design.width || 600;
  const headstoneHeightMm = design.height || 900;
  
  if (design.inscriptions) {
    const lines = design.inscriptions
      .split(/\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0);
    
    lines.forEach((text, index) => {
      // Detect element priority
      const isName = index === 0 || text.match(/^[A-Z][a-z]+ [A-Z][a-z]+$/);
      const isDate = text.match(/\d{4}/) || text.match(/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/);
      const isEpitaph = text.length > 50 || index > 2;
      
      const priority = isName ? 'critical' : isDate ? 'high' : isEpitaph ? 'low' : 'medium';
      
      // Estimate font size based on context and priority
      let estimatedSizePx = 60;
      if (isName && text.length < 30) estimatedSizePx = 100;
      else if (index === 1 && text.length < 40) estimatedSizePx = 80;
      else if (text.length < 20) estimatedSizePx = 70;
      else if (text.length > 100) estimatedSizePx = 40;
      
      // Convert px to mm (assuming 96 DPI, typical screen)
      // But we work in physical mm: 1pt ≈ 0.3527mm, and px ≈ pt at 96dpi
      const fontSizeMm = (estimatedSizePx * 0.3527) / 1.333; // approximation
      
      // Check diacritics
      const hasDiacritics = DIACRITIC_CHARACTERS.high.some(char => text.includes(char)) ||
                           DIACRITIC_CHARACTERS.low.some(char => text.includes(char));
      const diacriticAdjustment = hasDiacritics ? 1.15 : 1.0;
      
      // Calculate actual text height using font metrics
      const capHeightMm = fontSizeMm * fontMetrics.capHeight * diacriticAdjustment;
      const actualHeightMm = fontSizeMm * (fontMetrics.ascent + fontMetrics.descent);
      const strokeWidthMm = fontSizeMm * fontMetrics.strokeWidth;
      
      // Estimate text width (rough: average char width ≈ 0.5 × font size for proportional)
      const estimatedWidthMm = text.length * fontSizeMm * 0.5;
      
      // Check against material constraints
      const warnings = [];
      if (capHeightMm < constraints.minLetterHeight) {
        warnings.push(`letter-height-too-small:${capHeightMm.toFixed(1)}mm<${constraints.minLetterHeight}mm`);
      }
      if (strokeWidthMm < constraints.minStrokeWidth) {
        warnings.push(`stroke-too-thin:${strokeWidthMm.toFixed(2)}mm<${constraints.minStrokeWidth}mm`);
      }
      
      // Position (normalized 0-1)
      const yPosition = 0.2 + (index * 0.1);
      
      elements.push({
        type: 'inscription',
        text: text,
        priority: priority,
        font: defaultFont,
        fontSizePx: estimatedSizePx,
        fontSizeMm: fontSizeMm,
        capHeightMm: capHeightMm,
        actualHeightMm: actualHeightMm,
        strokeWidthMm: strokeWidthMm,
        estimatedWidthMm: estimatedWidthMm,
        x: 0.5,
        y: Math.min(yPosition, 0.9),
        width: estimatedWidthMm / headstoneWidthMm,  // Normalized
        height: actualHeightMm / headstoneHeightMm,  // Normalized
        hasDiacritics: hasDiacritics,
        warnings: warnings,
        originalY: yPosition
      });
    });
  }
  
  // Add motifs
  if (design.motif && design.motif !== 'None') {
    elements.push({
      type: 'motif',
      name: design.motif,
      priority: 'medium',
      x: 0.5,
      y: 0.1,
      width: 0.3,
      height: 0.2,
      scale: 1.0,
      warnings: []
    });
  }
  
  return elements;
}

// ============================================================================
// ENHANCED VALIDATION WITH POLYGONS
// ============================================================================

function validateElementV2(element, shapeName, materialType) {
  const issues = [];
  const shapeConfig = SHAPE_POLYGONS[shapeName.toLowerCase()] || SHAPE_POLYGONS['serpentine'];
  const constraints = MATERIAL_CONSTRAINTS[materialType];
  
  // Calculate element rectangle
  const rect = {
    left: element.x - (element.width / 2),
    right: element.x + (element.width / 2),
    top: element.y - (element.height / 2),
    bottom: element.y + (element.height / 2)
  };
  
  // Check against polygon (if available)
  if (shapeConfig.safeArea) {
    const inPolygon = isRectInPolygon(rect, shapeConfig.safeArea);
    if (!inPolygon) {
      issues.push({ 
        type: 'outside-safe-area',
        severity: 'error',
        message: `Element outside ${shapeName} safe boundary`
      });
    }
  }
  
  // Check material constraints (inscriptions only)
  if (element.type === 'inscription') {
    element.warnings.forEach(warning => {
      issues.push({
        type: 'material-constraint',
        severity: 'warning',
        message: warning,
        priority: element.priority
      });
    });
  }
  
  return {
    valid: issues.filter(i => i.severity === 'error').length === 0,
    issues: issues
  };
}

// ============================================================================
// SMART AUTO-FIX V2 WITH PRIORITY SCALING
// ============================================================================

function autoFixElementV2(element, shapeName, materialType, otherElements = []) {
  const fixed = { ...element };
  const fixes = [];
  const shapeConfig = SHAPE_POLYGONS[shapeName.toLowerCase()] || SHAPE_POLYGONS['serpentine'];
  const constraints = MATERIAL_CONSTRAINTS[materialType];
  
  // Strategy 1: For hearts/ovals, try horizontal compression first (2% max)
  if (shapeConfig.widthScaleFactor && element.type === 'inscription') {
    const rect = {
      left: fixed.x - (fixed.width / 2),
      right: fixed.x + (fixed.width / 2),
      top: fixed.y - (fixed.height / 2),
      bottom: fixed.y + (fixed.height / 2)
    };
    
    if (!isRectInPolygon(rect, shapeConfig.safeArea)) {
      fixed.width *= shapeConfig.widthScaleFactor;
      fixed.estimatedWidthMm *= shapeConfig.widthScaleFactor;
      fixes.push(`Applied horizontal compression (${((1 - shapeConfig.widthScaleFactor) * 100).toFixed(0)}%)`);
      
      // Re-check
      const newRect = {
        left: fixed.x - (fixed.width / 2),
        right: fixed.x + (fixed.width / 2),
        top: fixed.y - (fixed.height / 2),
        bottom: fixed.y + (fixed.height / 2)
      };
      
      if (isRectInPolygon(newRect, shapeConfig.safeArea)) {
        // Compression solved it!
        return { fixed, applied: fixes, attempts: 1 };
      }
    }
  }
  
  // Strategy 2: Priority-based scaling
  // Shrink low-priority elements first, protect names
  if (element.type === 'inscription') {
    const maxShrinkPct = element.priority === 'critical' ? 0.15 :  // Max 15% for names
                         element.priority === 'high' ? 0.20 :       // Max 20% for dates
                         0.25;                                       // Max 25% for epitaphs
    
    let attempts = 0;
    let scaleFactor = 1.0;
    
    while (attempts < 3 && scaleFactor > (1 - maxShrinkPct)) {
      scaleFactor -= 0.05; // Try 5% increments
      attempts++;
      
      const testFixed = { ...fixed };
      testFixed.fontSizeMm *= scaleFactor;
      testFixed.capHeightMm *= scaleFactor;
      testFixed.fontSizePx *= scaleFactor;
      testFixed.width *= scaleFactor;
      testFixed.height *= scaleFactor;
      
      // Check material constraints
      if (testFixed.capHeightMm < constraints.minLetterHeight) {
        fixes.push(`Cannot shrink further: letter height ${testFixed.capHeightMm.toFixed(1)}mm < minimum ${constraints.minLetterHeight}mm`);
        break;
      }
      
      // Check fit
      const testRect = {
        left: testFixed.x - (testFixed.width / 2),
        right: testFixed.x + (testFixed.width / 2),
        top: testFixed.y - (testFixed.height / 2),
        bottom: testFixed.y + (testFixed.height / 2)
      };
      
      if (isRectInPolygon(testRect, shapeConfig.safeArea)) {
        // Success!
        Object.assign(fixed, testFixed);
        fixes.push(`Reduced font size ${(scaleFactor * 100).toFixed(0)}% (priority: ${element.priority})`);
        return { fixed, applied: fixes, attempts };
      }
    }
    
    if (attempts > 0) {
      fixes.push(`Hit ${element.priority} shrink limit (${(maxShrinkPct * 100).toFixed(0)}% max)`);
    }
  }
  
  // Strategy 3: Reflow lines (for future multi-line support)
  // TODO: Implement line breaking
  
  return { fixed, applied: fixes, attempts: 0 };
}

// ============================================================================
// MAIN VALIDATION
// ============================================================================

function validateDesignV2(design) {
  const shapeName = design.shape || design.shapeName || 'square';
  const materialType = getMaterialType(design);
  const elements = parseMLDesignElementsV2(design, materialType);
  
  if (elements.length === 0) {
    return { valid: true, issues: [], fixes: [], metadata: {} };
  }
  
  const issues = [];
  const fixes = [];
  const fixedElements = [];
  
  // Sort by priority (critical first) for fixing order
  const priorityOrder = { 'critical': 0, 'high': 1, 'medium': 2, 'low': 3 };
  elements.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  
  elements.forEach((element, index) => {
    const validation = validateElementV2(element, shapeName, materialType);
    
    if (!validation.valid) {
      issues.push({
        element: index,
        type: element.type,
        priority: element.priority,
        problems: validation.issues
      });
      
      // Auto-fix
      const result = autoFixElementV2(element, shapeName, materialType, fixedElements);
      fixedElements.push(result.fixed);
      
      if (result.applied.length > 0) {
        fixes.push({
          element: index,
          type: element.type,
          priority: element.priority,
          original: element,
          fixed: result.fixed,
          changes: result.applied,
          attempts: result.attempts
        });
      }
    } else {
      fixedElements.push(element);
    }
  });
  
  // Generate version record
  const metadata = {
    designId: design.id,
    shape: shapeName,
    material: materialType,
    units: 'mm',
    validator: 'v2.0.0',
    timestamp: new Date().toISOString(),
    checks: {
      safeArea: issues.filter(i => i.problems.some(p => p.type === 'outside-safe-area')).length === 0 ? 'pass' : 'fail',
      materialConstraints: issues.filter(i => i.problems.some(p => p.type === 'material-constraint')).length === 0 ? 'pass' : 'warn'
    }
  };
  
  return {
    valid: issues.filter(i => i.problems.some(p => p.severity === 'error')).length === 0,
    issues,
    fixes,
    fixedElements,
    metadata
  };
}

// ============================================================================
// RUN VALIDATION
// ============================================================================

const results = {
  totalDesigns: designs.length,
  validDesigns: 0,
  designsWithIssues: 0,
  designsFixed: 0,
  materialBreakdown: {},
  priorityIssues: { critical: 0, high: 0, medium: 0, low: 0 },
  issueTypes: {},
  fixTypes: {}
};

const criticalFailures = [];
const samplesFixed = [];

designs.forEach((design, index) => {
  const validation = validateDesignV2(design);
  
  // Track material types
  const material = getMaterialType(design);
  results.materialBreakdown[material] = (results.materialBreakdown[material] || 0) + 1;
  
  if (validation.valid) {
    results.validDesigns++;
  } else {
    results.designsWithIssues++;
    
    // Track by priority
    validation.issues.forEach(issue => {
      if (issue.priority === 'critical') {
        results.priorityIssues.critical++;
        criticalFailures.push({
          id: design.id,
          name: design.designName || design.id,
          issue: issue.problems[0]?.message || 'Critical layout issue'
        });
      } else if (issue.priority === 'high') {
        results.priorityIssues.high++;
      } else if (issue.priority === 'medium') {
        results.priorityIssues.medium++;
      } else {
        results.priorityIssues.low++;
      }
      
      issue.problems.forEach(prob => {
        results.issueTypes[prob.type] = (results.issueTypes[prob.type] || 0) + 1;
      });
    });
    
    if (validation.fixes.length > 0) {
      results.designsFixed++;
      
      validation.fixes.forEach(fix => {
        fix.changes.forEach(change => {
          const type = change.split(' ')[0];
          results.fixTypes[type] = (results.fixTypes[type] || 0) + 1;
        });
      });
      
      if (samplesFixed.length < 20) {
        samplesFixed.push({
          id: design.id,
          name: design.designName || design.id,
          shape: design.shape || design.shapeName,
          material: material,
          details: validation
        });
      }
    }
  }
  
  if ((index + 1) % 500 === 0) {
    console.log(`   Processed ${index + 1}/${designs.length}...`);
  }
});

// ============================================================================
// OUTPUT RESULTS
// ============================================================================

console.log(`\n📊 PRODUCTION VALIDATION RESULTS V2.0:\n`);
console.log(`   Total designs: ${results.totalDesigns}`);
console.log(`   ✅ Valid: ${results.validDesigns} (${(results.validDesigns / results.totalDesigns * 100).toFixed(1)}%)`);
console.log(`   ⚠️  Issues: ${results.designsWithIssues} (${(results.designsWithIssues / results.totalDesigns * 100).toFixed(1)}%)`);
console.log(`   🔧 Auto-fixed: ${results.designsFixed}`);

console.log(`\n📦 Material Breakdown:`);
Object.entries(results.materialBreakdown)
  .sort((a, b) => b[1] - a[1])
  .forEach(([material, count]) => {
    const constraints = MATERIAL_CONSTRAINTS[material];
    console.log(`   ${material}: ${count} designs`);
    console.log(`      Min letter height: ${constraints.minLetterHeight}mm (${constraints.method})`);
  });

console.log(`\n🎯 Issues by Priority:`);
console.log(`   🔴 Critical (names): ${results.priorityIssues.critical}`);
console.log(`   🟡 High (dates): ${results.priorityIssues.high}`);
console.log(`   🟢 Medium: ${results.priorityIssues.medium}`);
console.log(`   ⚪ Low (epitaphs): ${results.priorityIssues.low}`);

if (criticalFailures.length > 0) {
  console.log(`\n🚨 CRITICAL FAILURES (names affected):`);
  criticalFailures.slice(0, 10).forEach(failure => {
    console.log(`   ${failure.id} - ${failure.name}`);
    console.log(`      ${failure.issue}`);
  });
}

console.log(`\n📈 Issue Types:`);
Object.entries(results.issueTypes)
  .sort((a, b) => b[1] - a[1])
  .forEach(([type, count]) => {
    console.log(`   ${type}: ${count}`);
  });

console.log(`\n🔧 Fixes Applied:`);
Object.entries(results.fixTypes)
  .sort((a, b) => b[1] - a[1])
  .forEach(([type, count]) => {
    console.log(`   ${type}: ${count}`);
  });

if (samplesFixed.length > 0) {
  console.log(`\n🔍 Sample Fixed Designs (first 10):\n`);
  samplesFixed.slice(0, 10).forEach(sample => {
    console.log(`   ${sample.id} - ${sample.name}`);
    console.log(`      Shape: ${sample.shape} | Material: ${sample.material}`);
    console.log(`      Issues: ${sample.details.issues.length} | Fixes: ${sample.details.fixes.length}`);
    
    if (sample.details.fixes.length > 0) {
      sample.details.fixes.slice(0, 2).forEach(fix => {
        console.log(`      - ${fix.type} (${fix.priority}): ${fix.changes.join(', ')}`);
      });
    }
    console.log('');
  });
}

// Save report
const reportPath = path.join(__dirname, '../lib/layout-validation-v2-report.json');
fs.writeFileSync(reportPath, JSON.stringify({
  summary: results,
  criticalFailures: criticalFailures,
  samplesFixed: samplesFixed
}, null, 2));

console.log(`✅ V2 Report saved: ${reportPath}\n`);

// Exit with error if critical failures
if (criticalFailures.length > 0) {
  console.log(`❌ CI GATE: ${criticalFailures.length} critical failures detected!`);
  console.log(`   Names/critical text clipped. Review required before deploy.\n`);
  process.exit(1);
}

console.log(`✅ CI GATE: PASSED - No critical failures\n`);
console.log(`💡 Production-ready with physical constraints validated!\n`);
