/**
 * Batch convert all FBX/3DS files in public/additions to glTF format
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const ADDITIONS_DIR = path.join(__dirname, 'public', 'additions');
const BLENDER_PATH = 'C:\\Program Files\\Blender Foundation\\Blender 3.4\\blender.exe';

// Python script for Blender conversion
const pythonScript = `
import bpy
import sys
import os

# Get file paths from command line
input_file = sys.argv[-2]
output_file = sys.argv[-1]

# Clear default scene
bpy.ops.wm.read_factory_settings(use_empty=True)

# Get extension
ext = input_file.lower().split('.')[-1]

try:
    # Import based on extension
    if ext == 'fbx':
        bpy.ops.import_scene.fbx(filepath=input_file)
    elif ext == '3ds':
        bpy.ops.import_scene.autodesk_3ds(filepath=input_file)
    else:
        print(f"Unsupported format: {ext}")
        sys.exit(1)
    
    # Export as glTF binary (GLB)
    bpy.ops.export_scene.gltf(
        filepath=output_file,
        export_format='GLB',
        export_texcoords=True,
        export_normals=True,
        export_materials='EXPORT',
        export_colors=True,
        export_cameras=False,
        export_lights=False
    )
    
    print(f"SUCCESS: {os.path.basename(output_file)}")
    
except Exception as e:
    print(f"ERROR: {str(e)}")
    sys.exit(1)
`;

const scriptPath = path.join(__dirname, 'temp_batch_convert.py');
fs.writeFileSync(scriptPath, pythonScript);

// Find all FBX and 3DS files
function findModels() {
    const models = [];
    const folders = fs.readdirSync(ADDITIONS_DIR);
    
    for (const folder of folders) {
        const folderPath = path.join(ADDITIONS_DIR, folder);
        if (!fs.statSync(folderPath).isDirectory()) continue;
        
        const files = fs.readdirSync(folderPath);
        
        // Look for FBX first, then 3DS as fallback
        let modelFile = files.find(f => f.toLowerCase().endsWith('.fbx'));
        if (!modelFile) {
            modelFile = files.find(f => f.toLowerCase().endsWith('.3ds'));
        }
        
        if (modelFile) {
            const inputPath = path.join(folderPath, modelFile);
            const outputName = modelFile.replace(/\.(fbx|3ds)$/i, '.glb');
            const outputPath = path.join(folderPath, outputName);
            
            // Only convert if GLB doesn't exist
            if (!fs.existsSync(outputPath)) {
                models.push({ inputPath, outputPath, folder, modelFile });
            }
        }
    }
    
    return models;
}

// Convert a single model
function convertModel(model) {
    return new Promise((resolve, reject) => {
        const blender = spawn(BLENDER_PATH, [
            '--background',
            '--python', scriptPath,
            '--', model.inputPath, model.outputPath
        ]);
        
        let output = '';
        let hasError = false;
        
        blender.stdout.on('data', (data) => {
            output += data.toString();
        });
        
        blender.stderr.on('data', (data) => {
            const error = data.toString();
            if (error.includes('ERROR:')) {
                hasError = true;
                output += error;
            }
        });
        
        blender.on('close', (code) => {
            if (code === 0 && fs.existsSync(model.outputPath) && output.includes('SUCCESS')) {
                resolve({ success: true, model });
            } else {
                reject({ success: false, model, error: output });
            }
        });
    });
}

// Main conversion process
async function main() {
    console.log('🔍 Scanning for models in public/additions...\n');
    
    const models = findModels();
    
    if (models.length === 0) {
        console.log('✅ All models already converted to glTF!');
        fs.unlinkSync(scriptPath);
        return;
    }
    
    console.log(`Found ${models.length} models to convert:\n`);
    
    const results = {
        success: [],
        failed: []
    };
    
    // Convert models one by one (sequential to avoid resource issues)
    for (let i = 0; i < models.length; i++) {
        const model = models[i];
        const progress = `[${i + 1}/${models.length}]`;
        
        process.stdout.write(`${progress} Converting ${model.folder}/${model.modelFile}... `);
        
        try {
            await convertModel(model);
            console.log('✓');
            results.success.push(model);
        } catch (err) {
            console.log('✗');
            results.failed.push(model);
        }
    }
    
    // Clean up temp script
    if (fs.existsSync(scriptPath)) {
        fs.unlinkSync(scriptPath);
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 CONVERSION SUMMARY');
    console.log('='.repeat(50));
    console.log(`✓ Successful: ${results.success.length}`);
    console.log(`✗ Failed: ${results.failed.length}`);
    console.log('='.repeat(50));
    
    if (results.failed.length > 0) {
        console.log('\n❌ Failed conversions:');
        results.failed.forEach(m => {
            console.log(`   - ${m.folder}/${m.modelFile}`);
        });
    }
    
    if (results.success.length > 0) {
        console.log('\n✅ All conversions completed!');
    }
}

// Run
main().catch(err => {
    console.error('Fatal error:', err);
    if (fs.existsSync(scriptPath)) {
        fs.unlinkSync(scriptPath);
    }
    process.exit(1);
});
