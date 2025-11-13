/**
 * Generate additions data from public/additions folder structure
 */

const fs = require('fs');
const path = require('path');

const ADDITIONS_DIR = path.join(__dirname, 'public', 'additions');

function generateAdditionsData() {
    const additions = [];
    const folders = fs.readdirSync(ADDITIONS_DIR);
    
    for (const folder of folders) {
        const folderPath = path.join(ADDITIONS_DIR, folder);
        if (!fs.statSync(folderPath).isDirectory()) continue;
        
        const files = fs.readdirSync(folderPath);
        
        // Find GLB file
        const glbFile = files.find(f => f.toLowerCase().endsWith('.glb'));
        if (!glbFile) continue;
        
        // Find JPG thumbnail (prefer files starting with _)
        let jpgFile = files.find(f => f.toLowerCase().endsWith('.jpg') && f.startsWith('_'));
        if (!jpgFile) {
            jpgFile = files.find(f => f.toLowerCase().endsWith('.jpg'));
        }
        if (!jpgFile) continue;
        
        // Create addition entry
        const id = folder.replace(/[^a-zA-Z0-9]/g, '');
        const name = folder
            .replace(/[_-]/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
        
        additions.push({
            id,
            name,
            glb: `${folder}/${glbFile}`,
            image: `${folder}/${jpgFile}`,
            category: '1' // Default category for now
        });
    }
    
    // Sort by folder name
    additions.sort((a, b) => a.glb.localeCompare(b.glb));
    
    // Generate TypeScript code
    let tsCode = 'const additions: Addition[] = [\n';
    
    for (const addition of additions) {
        tsCode += `  { id: '${addition.id}', name: '${addition.name}', glb: '${addition.glb}', image: '${addition.image}', category: '${addition.category}' },\n`;
    }
    
    tsCode += '];\n';
    
    return { additions, tsCode };
}

// Run and output
const result = generateAdditionsData();
console.log(`Generated ${result.additions.length} additions\n`);
console.log('TypeScript code to add to _data.ts:\n');
console.log(result.tsCode);

// Save to file for reference
fs.writeFileSync(
    path.join(__dirname, 'additions-data-generated.ts'),
    result.tsCode
);
console.log('\nSaved to: additions-data-generated.ts');
