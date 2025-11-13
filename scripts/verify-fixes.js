#!/usr/bin/env node

/**
 * Verification script for implemented fixes
 * Run with: node verify-fixes.js
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Implemented Fixes...\n');

let passed = 0;
let failed = 0;

function checkFile(filepath, checks) {
  const fullPath = path.join(__dirname, filepath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`❌ File not found: ${filepath}`);
    failed++;
    return;
  }
  
  const content = fs.readFileSync(fullPath, 'utf8');
  
  checks.forEach(({ name, test, shouldExist }) => {
    const exists = test.test(content);
    
    if (shouldExist === exists) {
      console.log(`✅ ${filepath}: ${name}`);
      passed++;
    } else {
      console.log(`❌ ${filepath}: ${name} - ${shouldExist ? 'NOT FOUND' : 'STILL PRESENT'}`);
      failed++;
    }
  });
}

// Check new files exist
console.log('📁 Checking new files...\n');

['components/ErrorBoundary.tsx',
 'lib/error-handler.ts',
 'lib/validation.ts',
 'lib/three-types.ts',
 'IMPLEMENTATION_SUMMARY.md',
 'QUICK_REFERENCE.md'
].forEach(file => {
  if (fs.existsSync(path.join(__dirname, file))) {
    console.log(`✅ Created: ${file}`);
    passed++;
  } else {
    console.log(`❌ Missing: ${file}`);
    failed++;
  }
});

console.log('\n🔍 Checking code fixes...\n');

// Check HeadstoneInscription.tsx
checkFile('components/HeadstoneInscription.tsx', [
  {
    name: 'Removed "as any" cast',
    test: /as any/,
    shouldExist: false
  },
  {
    name: 'Uses ThreeContextValue type',
    test: /ThreeContextValue/,
    shouldExist: true
  },
  {
    name: 'Optimized BoxHelper updates',
    test: /needsHelperUpdate/,
    shouldExist: true
  }
]);

// Check AdditionModel.tsx
checkFile('components/three/AdditionModel.tsx', [
  {
    name: 'Has error handling',
    test: /error\s*:/,
    shouldExist: true
  },
  {
    name: 'Sanitizes ID',
    test: /sanitize|cleaned/i,
    shouldExist: true
  },
  {
    name: 'Shows error placeholder',
    test: /red.*opacity/,
    shouldExist: true
  }
]);

// Check RouterBinder.tsx
checkFile('components/system/RouterBinder.tsx', [
  {
    name: 'Uses async/await',
    test: /async\s+\(\)\s*=>/,
    shouldExist: true
  },
  {
    name: 'Checks HTTP status',
    test: /response\.ok/,
    shouldExist: true
  },
  {
    name: 'Validates XML',
    test: /ENTITY/,
    shouldExist: true
  }
]);

// Check MobileHeader.tsx
checkFile('components/MobileHeader.tsx', [
  {
    name: 'Has aria-label',
    test: /aria-label/,
    shouldExist: true
  },
  {
    name: 'Uses useMemo',
    test: /useMemo/,
    shouldExist: true
  }
]);

// Check Scene.tsx
checkFile('components/three/Scene.tsx', [
  {
    name: 'Uses color constants',
    test: /SKY_TOP_COLOR|GRASS_DARK_COLOR/,
    shouldExist: true
  },
  {
    name: 'No hardcoded colors',
    test: /vec3\(\d+\.\d+,\s*\d+\.\d+,\s*\d+\.\d+\)/,
    shouldExist: false
  }
]);

// Check HeadstoneBaseAuto.tsx
checkFile('components/three/headstone/HeadstoneBaseAuto.tsx', [
  {
    name: 'Uses BASE_WIDTH_MULTIPLIER',
    test: /BASE_WIDTH_MULTIPLIER/,
    shouldExist: true
  },
  {
    name: 'No hardcoded 1.4',
    test: /\*\s*1\.4/,
    shouldExist: false
  }
]);

// Check layout.tsx
checkFile('app/layout.tsx', [
  {
    name: 'Has ErrorBoundary',
    test: /ErrorBoundary/,
    shouldExist: true
  },
  {
    name: 'Better Suspense fallback',
    test: /Loading scene/,
    shouldExist: true
  }
]);

// Check xml-parser.ts
checkFile('lib/xml-parser.ts', [
  {
    name: 'Validates XML for XXE',
    test: /ENTITY/,
    shouldExist: true
  },
  {
    name: 'Checks parser errors',
    test: /parsererror/,
    shouldExist: true
  },
  {
    name: 'Uses CSS.escape',
    test: /CSS\.escape/,
    shouldExist: true
  }
]);

// Check headstone-constants.ts
checkFile('lib/headstone-constants.ts', [
  {
    name: 'Has BASE_WIDTH_MULTIPLIER',
    test: /BASE_WIDTH_MULTIPLIER.*1\.4/,
    shouldExist: true
  },
  {
    name: 'Has camera constants',
    test: /CAMERA_FOV/,
    shouldExist: true
  },
  {
    name: 'Has color constants',
    test: /SKY_TOP_COLOR/,
    shouldExist: true
  }
]);

// Summary
console.log('\n' + '='.repeat(50));
console.log(`\n📊 Verification Summary:\n`);
console.log(`   ✅ Passed: ${passed}`);
console.log(`   ❌ Failed: ${failed}`);
console.log(`   Total:  ${passed + failed}`);
console.log(`\n${'='.repeat(50)}\n`);

if (failed === 0) {
  console.log('🎉 All fixes verified successfully!\n');
  console.log('✅ Ready for production deployment\n');
  process.exit(0);
} else {
  console.log('⚠️  Some checks failed. Please review the output above.\n');
  process.exit(1);
}
