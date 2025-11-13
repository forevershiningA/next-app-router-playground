/**
 * PNG to GLB Converter with 3D Relief
 * Converts a PNG image into a 3D GLB file with depth based on image brightness
 * Darker areas are extruded more to create an embossed/relief effect
 * 
 * Usage: node png-to-glb.js <input-png> [output-glb] [--depth=0.3] [--resolution=64]
 */

const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

// Get command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('\n=== PNG to 3D GLB Converter ===\n');
  console.log('USAGE:');
  console.log('  node png-to-glb.js <input-png> [output-glb] [--depth=0.3] [--resolution=64]\n');
  console.log('OPTIONS:');
  console.log('  --depth=N       Maximum extrusion depth (default: 0.3)');
  console.log('  --resolution=N  Mesh resolution, higher = more detail (default: 64)\n');
  console.log('EXAMPLES:');
  console.log('  node png-to-glb.js image.png');
  console.log('  node png-to-glb.js public/emblems/m/br139r-gum-leaves.png');
  console.log('  node png-to-glb.js image.png output.glb --depth=0.5 --resolution=128\n');
  process.exit(0);
}

// Parse arguments
let inputFile = null;
let outputFile = null;
let maxDepth = 0.3;
let meshResolution = 64;

for (const arg of args) {
  if (arg.startsWith('--depth=')) {
    maxDepth = parseFloat(arg.split('=')[1]);
  } else if (arg.startsWith('--resolution=')) {
    meshResolution = parseInt(arg.split('=')[1]);
  } else if (!inputFile) {
    inputFile = path.resolve(arg);
  } else if (!outputFile) {
    outputFile = path.resolve(arg);
  }
}

if (!outputFile) {
  outputFile = inputFile.replace(/\.png$/i, '.glb');
}

// Check if input file exists
if (!fs.existsSync(inputFile)) {
  console.error(`Error: Input file not found: ${inputFile}`);
  process.exit(1);
}

console.log(`Converting: ${path.basename(inputFile)} -> ${path.basename(outputFile)}`);
console.log(`Settings: depth=${maxDepth}, resolution=${meshResolution}`);

// Read PNG image
const pngData = fs.readFileSync(inputFile);
const png = PNG.sync.read(pngData);

console.log(`Image size: ${png.width}x${png.height}`);

// Helper function to get brightness from image
function getBrightness(x, y) {
  const idx = (png.width * y + x) << 2;
  const r = png.data[idx];
  const g = png.data[idx + 1];
  const b = png.data[idx + 2];
  const a = png.data[idx + 3];
  
  // Calculate perceived brightness (0-1), considering alpha
  const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const alpha = a / 255;
  
  // Invert brightness so darker areas extrude more
  // Areas with no alpha (transparent) have no depth
  return (1 - brightness) * alpha;
}

// Create heightmap mesh
const aspectRatio = png.width / png.height;
const width = aspectRatio >= 1 ? 1.0 : aspectRatio;
const height = aspectRatio >= 1 ? 1.0 / aspectRatio : 1.0;

console.log('Generating 3D mesh with relief...');

// Create grid of vertices
const positions = [];
const texcoords = [];
const vertexCount = (meshResolution + 1) * (meshResolution + 1);

for (let y = 0; y <= meshResolution; y++) {
  for (let x = 0; x <= meshResolution; x++) {
    // Position in world space
    const xPos = (x / meshResolution - 0.5) * width;
    const yPos = (y / meshResolution - 0.5) * height;
    
    // Sample image at this position
    const imgX = Math.floor((x / meshResolution) * (png.width - 1));
    const imgY = Math.floor((y / meshResolution) * (png.height - 1));
    const brightness = getBrightness(imgX, imgY);
    
    // Z position based on brightness (darker = more extruded)
    const zPos = brightness * maxDepth;
    
    positions.push(xPos, yPos, zPos);
    
    // UV coordinates
    texcoords.push(x / meshResolution, 1 - (y / meshResolution));
  }
}

// Create indices for triangles
const indices = [];
for (let y = 0; y < meshResolution; y++) {
  for (let x = 0; x < meshResolution; x++) {
    const topLeft = y * (meshResolution + 1) + x;
    const topRight = topLeft + 1;
    const bottomLeft = (y + 1) * (meshResolution + 1) + x;
    const bottomRight = bottomLeft + 1;
    
    // Two triangles per quad
    indices.push(topLeft, bottomLeft, topRight);
    indices.push(topRight, bottomLeft, bottomRight);
  }
}

console.log(`Generated ${vertexCount} vertices, ${indices.length / 3} triangles`);

// Calculate normals
const normals = new Array(vertexCount * 3).fill(0);
const posArray = positions;

// Calculate face normals and accumulate to vertices
for (let i = 0; i < indices.length; i += 3) {
  const i0 = indices[i] * 3;
  const i1 = indices[i + 1] * 3;
  const i2 = indices[i + 2] * 3;
  
  // Get triangle vertices
  const v0 = [posArray[i0], posArray[i0 + 1], posArray[i0 + 2]];
  const v1 = [posArray[i1], posArray[i1 + 1], posArray[i1 + 2]];
  const v2 = [posArray[i2], posArray[i2 + 1], posArray[i2 + 2]];
  
  // Calculate edges
  const e1 = [v1[0] - v0[0], v1[1] - v0[1], v1[2] - v0[2]];
  const e2 = [v2[0] - v0[0], v2[1] - v0[1], v2[2] - v0[2]];
  
  // Cross product for normal
  const nx = e1[1] * e2[2] - e1[2] * e2[1];
  const ny = e1[2] * e2[0] - e1[0] * e2[2];
  const nz = e1[0] * e2[1] - e1[1] * e2[0];
  
  // Accumulate to vertex normals
  for (const idx of [i0, i1, i2]) {
    normals[idx] += nx;
    normals[idx + 1] += ny;
    normals[idx + 2] += nz;
  }
}

// Normalize all normals
for (let i = 0; i < normals.length; i += 3) {
  const len = Math.sqrt(normals[i] * normals[i] + normals[i + 1] * normals[i + 1] + normals[i + 2] * normals[i + 2]);
  if (len > 0) {
    normals[i] /= len;
    normals[i + 1] /= len;
    normals[i + 2] /= len;
  }
}

// Convert to typed arrays
const positionsArray = new Float32Array(positions);
const texcoordsArray = new Float32Array(texcoords);
const normalsArray = new Float32Array(normals);
const indicesArray = indices.length > 65535 ? new Uint32Array(indices) : new Uint16Array(indices);
const indexComponentType = indices.length > 65535 ? 5125 : 5123; // UNSIGNED_INT or UNSIGNED_SHORT

// Calculate bounds for accessor
let minX = Infinity, minY = Infinity, minZ = Infinity;
let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
for (let i = 0; i < positionsArray.length; i += 3) {
  minX = Math.min(minX, positionsArray[i]);
  maxX = Math.max(maxX, positionsArray[i]);
  minY = Math.min(minY, positionsArray[i + 1]);
  maxY = Math.max(maxY, positionsArray[i + 1]);
  minZ = Math.min(minZ, positionsArray[i + 2]);
  maxZ = Math.max(maxZ, positionsArray[i + 2]);
}

// Create GLB structure
const gltf = {
  asset: {
    version: "2.0",
    generator: "PNG to 3D GLB Converter with Relief"
  },
  scene: 0,
  scenes: [{
    nodes: [0]
  }],
  nodes: [{
    mesh: 0
  }],
  meshes: [{
    primitives: [{
      attributes: {
        POSITION: 0,
        NORMAL: 1,
        TEXCOORD_0: 2
      },
      indices: 3,
      material: 0
    }]
  }],
  materials: [{
    pbrMetallicRoughness: {
      baseColorTexture: {
        index: 0
      },
      metallicFactor: 0.0,
      roughnessFactor: 0.8
    },
    alphaMode: "BLEND",
    doubleSided: false
  }],
  textures: [{
    source: 0
  }],
  images: [{
    mimeType: "image/png",
    bufferView: 4
  }],
  accessors: [
    {
      bufferView: 0,
      byteOffset: 0,
      componentType: 5126, // FLOAT
      count: vertexCount,
      type: "VEC3",
      max: [maxX, maxY, maxZ],
      min: [minX, minY, minZ]
    },
    {
      bufferView: 1,
      byteOffset: 0,
      componentType: 5126, // FLOAT
      count: vertexCount,
      type: "VEC3"
    },
    {
      bufferView: 2,
      byteOffset: 0,
      componentType: 5126, // FLOAT
      count: vertexCount,
      type: "VEC2"
    },
    {
      bufferView: 3,
      byteOffset: 0,
      componentType: indexComponentType,
      count: indicesArray.length,
      type: "SCALAR"
    }
  ],
  bufferViews: [
    {
      buffer: 0,
      byteOffset: 0,
      byteLength: positionsArray.byteLength,
      target: 34962 // ARRAY_BUFFER
    },
    {
      buffer: 0,
      byteOffset: positionsArray.byteLength,
      byteLength: normalsArray.byteLength,
      target: 34962 // ARRAY_BUFFER
    },
    {
      buffer: 0,
      byteOffset: positionsArray.byteLength + normalsArray.byteLength,
      byteLength: texcoordsArray.byteLength,
      target: 34962 // ARRAY_BUFFER
    },
    {
      buffer: 0,
      byteOffset: positionsArray.byteLength + normalsArray.byteLength + texcoordsArray.byteLength,
      byteLength: indicesArray.byteLength,
      target: 34963 // ELEMENT_ARRAY_BUFFER
    },
    {
      buffer: 0,
      byteOffset: positionsArray.byteLength + normalsArray.byteLength + texcoordsArray.byteLength + indicesArray.byteLength,
      byteLength: pngData.byteLength
    }
  ],
  buffers: [{
    byteLength: positionsArray.byteLength + normalsArray.byteLength + texcoordsArray.byteLength + indicesArray.byteLength + pngData.byteLength
  }]
};

// Convert GLTF JSON to binary
const gltfJson = JSON.stringify(gltf);
const gltfJsonBuffer = Buffer.from(gltfJson);
const gltfJsonAligned = Buffer.alloc(Math.ceil(gltfJsonBuffer.length / 4) * 4, 0x20); // Pad with spaces
gltfJsonBuffer.copy(gltfJsonAligned);

// Create binary buffer with all data
const binaryBuffer = Buffer.concat([
  Buffer.from(positionsArray.buffer),
  Buffer.from(normalsArray.buffer),
  Buffer.from(texcoordsArray.buffer),
  Buffer.from(indicesArray.buffer),
  pngData
]);

// Align binary buffer to 4-byte boundary
const binaryBufferAligned = Buffer.alloc(Math.ceil(binaryBuffer.length / 4) * 4, 0);
binaryBuffer.copy(binaryBufferAligned);

// Create GLB file structure
const glbHeaderSize = 12;
const jsonChunkHeaderSize = 8;
const binaryChunkHeaderSize = 8;
const totalSize = glbHeaderSize + jsonChunkHeaderSize + gltfJsonAligned.length + binaryChunkHeaderSize + binaryBufferAligned.length;

const glbBuffer = Buffer.alloc(totalSize);
let offset = 0;

// GLB Header
glbBuffer.writeUInt32LE(0x46546C67, offset); offset += 4; // magic: 'glTF'
glbBuffer.writeUInt32LE(2, offset); offset += 4; // version: 2
glbBuffer.writeUInt32LE(totalSize, offset); offset += 4; // total length

// JSON Chunk
glbBuffer.writeUInt32LE(gltfJsonAligned.length, offset); offset += 4; // chunk length
glbBuffer.writeUInt32LE(0x4E4F534A, offset); offset += 4; // chunk type: 'JSON'
gltfJsonAligned.copy(glbBuffer, offset); offset += gltfJsonAligned.length;

// Binary Chunk
glbBuffer.writeUInt32LE(binaryBufferAligned.length, offset); offset += 4; // chunk length
glbBuffer.writeUInt32LE(0x004E4942, offset); offset += 4; // chunk type: 'BIN\0'
binaryBufferAligned.copy(glbBuffer, offset);

// Write GLB file
fs.writeFileSync(outputFile, glbBuffer);

console.log('\n✓ Conversion successful!');
console.log(`Output: ${outputFile}`);
console.log(`File size: ${(glbBuffer.length / 1024).toFixed(2)} KB`);
