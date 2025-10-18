/**
 * 3D Model to glTF Converter Helper Script
 * 
 * This script provides instructions and methods for converting 3D models to glTF format.
 * 
 * RECOMMENDED METHODS:
 * 
 * 1. ONLINE CONVERTERS (Easiest):
 *    - https://products.aspose.app/3d/conversion/fbx-to-gltf (FBX to glTF)
 *    - https://products.aspose.app/3d/conversion/3ds-to-gltf (3DS to glTF)
 *    - https://imagetostl.com/convert/file/fbx/to/gltf (FBX to glTF)
 * 
 * 2. BLENDER (Most Powerful):
 *    - Install Blender: https://www.blender.org/download/
 *    - Import your model: File > Import > FBX/3DS/etc.
 *    - Export as glTF: File > Export > glTF 2.0
 *    - Choose settings (glTF Binary .glb or glTF Separate .gltf + .bin)
 * 
 * 3. FBX2glTF COMMAND LINE TOOL:
 *    - Download from: https://github.com/facebookincubator/FBX2glTF/releases
 *    - Usage: FBX2glTF.exe input.fbx
 * 
 * 4. AUTOMATED BLENDER CONVERSION (if Blender is installed):
 *    Run this with: node convert-to-gltf.js <input-file> <output-file>
 */

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('\n=== 3D Model to glTF Converter ===\n');
  console.log('USAGE:');
  console.log('  node convert-to-gltf.js <input-file> [output-file]\n');
  console.log('EXAMPLES:');
  console.log('  node convert-to-gltf.js model.fbx');
  console.log('  node convert-to-gltf.js model.3ds output.glb');
  console.log('  node convert-to-gltf.js model.max model.gltf\n');
  console.log('SUPPORTED FORMATS:');
  console.log('  Input:  .fbx, .3ds, .obj, .dae, .blend');
  console.log('  Output: .gltf (text + bin) or .glb (binary)\n');
  console.log('NOTE: Requires Blender to be installed and in PATH');
  console.log('      Download: https://www.blender.org/download/\n');
  console.log('ALTERNATIVE: Use online converters listed in this file\n');
  process.exit(0);
}

const inputFile = path.resolve(args[0]);
const outputFile = args[1] ? path.resolve(args[1]) : inputFile.replace(/\.[^.]+$/, '.glb');

// Check if input file exists
if (!fs.existsSync(inputFile)) {
  console.error(`Error: Input file not found: ${inputFile}`);
  process.exit(1);
}

// Check if Blender is available
const blenderCommand = process.platform === 'win32' ? 'blender' : 'blender';

// Create temporary Python script for Blender
const pythonScript = `
import bpy
import sys

# Clear default scene
bpy.ops.wm.read_factory_settings(use_empty=True)

# Get file paths from command line
input_file = sys.argv[-2]
output_file = sys.argv[-1]

# Import based on extension
ext = input_file.lower().split('.')[-1]

try:
    if ext == 'fbx':
        bpy.ops.import_scene.fbx(filepath=input_file)
    elif ext == '3ds':
        bpy.ops.import_scene.autodesk_3ds(filepath=input_file)
    elif ext == 'obj':
        bpy.ops.import_scene.obj(filepath=input_file)
    elif ext == 'dae':
        bpy.ops.wm.collada_import(filepath=input_file)
    elif ext == 'blend':
        bpy.ops.wm.open_mainfile(filepath=input_file)
    else:
        print(f"Unsupported format: {ext}")
        sys.exit(1)
    
    # Export as glTF
    if output_file.endswith('.glb'):
        bpy.ops.export_scene.gltf(filepath=output_file, export_format='GLB')
    else:
        bpy.ops.export_scene.gltf(filepath=output_file, export_format='GLTF_SEPARATE')
    
    print(f"Successfully converted: {output_file}")
except Exception as e:
    print(f"Error during conversion: {str(e)}")
    sys.exit(1)
`;

const scriptPath = path.join(__dirname, 'temp_convert.py');
fs.writeFileSync(scriptPath, pythonScript);

console.log(`Converting: ${path.basename(inputFile)} -> ${path.basename(outputFile)}`);
console.log('Running Blender in background...\n');

// Run Blender
const blender = spawn(blenderCommand, [
  '--background',
  '--python', scriptPath,
  '--', inputFile, outputFile
]);

blender.stdout.on('data', (data) => {
  const output = data.toString();
  if (output.includes('Successfully converted') || output.includes('Error')) {
    console.log(output);
  }
});

blender.stderr.on('data', (data) => {
  const error = data.toString();
  if (!error.includes('Warning') && !error.includes('Read new prefs')) {
    console.error(error);
  }
});

blender.on('close', (code) => {
  // Clean up temp script
  if (fs.existsSync(scriptPath)) {
    fs.unlinkSync(scriptPath);
  }
  
  if (code === 0 && fs.existsSync(outputFile)) {
    console.log('\n✓ Conversion successful!');
    console.log(`Output: ${outputFile}`);
  } else if (code !== 0) {
    console.error('\n✗ Conversion failed!');
    console.error('\nMake sure Blender is installed and in your PATH');
    console.error('Download from: https://www.blender.org/download/\n');
    console.error('Or use one of the online converters listed in this script.');
    process.exit(1);
  }
});
