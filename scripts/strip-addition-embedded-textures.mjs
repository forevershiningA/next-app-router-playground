import { readFile, writeFile } from 'node:fs/promises';

const GLB_MAGIC = 0x46546c67;
const JSON_CHUNK = 0x4e4f534a;
const BIN_CHUNK = 0x004e4942;

const align4 = (value) => (value + 3) & ~3;

function parseGlb(buffer) {
  if (buffer.readUInt32LE(0) !== GLB_MAGIC) {
    throw new Error('Expected a binary glTF (.glb) file.');
  }

  let offset = 12;
  let json;
  let binary = Buffer.alloc(0);

  while (offset < buffer.length) {
    const length = buffer.readUInt32LE(offset);
    const type = buffer.readUInt32LE(offset + 4);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === JSON_CHUNK) json = JSON.parse(data.toString('utf8').trim());
    if (type === BIN_CHUNK) binary = data;
    offset += 8 + length;
  }

  if (!json) throw new Error('The GLB does not contain a JSON chunk.');
  return { json, binary };
}

function removeTextureReferences(value) {
  if (!value || typeof value !== 'object') return;
  for (const key of Object.keys(value)) {
    if (key.toLowerCase().includes('texture')) {
      delete value[key];
    } else {
      removeTextureReferences(value[key]);
    }
  }
}

function remapBufferViews(value, remap) {
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    if (key === 'bufferView' && Number.isInteger(child)) {
      const next = remap.get(child);
      if (next === undefined) throw new Error(`Referenced texture buffer view ${child}.`);
      value[key] = next;
    } else {
      remapBufferViews(child, remap);
    }
  }
}

function createGlb(json, binary) {
  const jsonBuffer = Buffer.from(JSON.stringify(json));
  const jsonLength = align4(jsonBuffer.length);
  const binLength = align4(binary.length);
  const totalLength = 12 + 8 + jsonLength + 8 + binLength;
  const output = Buffer.alloc(totalLength, 0);

  output.writeUInt32LE(GLB_MAGIC, 0);
  output.writeUInt32LE(2, 4);
  output.writeUInt32LE(totalLength, 8);
  output.writeUInt32LE(jsonLength, 12);
  output.writeUInt32LE(JSON_CHUNK, 16);
  jsonBuffer.copy(output, 20);
  output.fill(0x20, 20 + jsonBuffer.length, 20 + jsonLength);
  output.writeUInt32LE(binLength, 20 + jsonLength);
  output.writeUInt32LE(BIN_CHUNK, 24 + jsonLength);
  binary.copy(output, 28 + jsonLength);
  return output;
}

const [inputPath, outputPath] = process.argv.slice(2);
if (!inputPath || !outputPath) {
  throw new Error('Usage: node strip-addition-embedded-textures.mjs <input.glb> <output.glb>');
}

const input = await readFile(inputPath);
const { json, binary } = parseGlb(input);
const removedViews = new Set(
  (json.images ?? []).flatMap((image) =>
    Number.isInteger(image.bufferView) ? [image.bufferView] : [],
  ),
);

if (removedViews.size === 0) {
  await writeFile(outputPath, input);
  process.exit(0);
}

const originalViews = json.bufferViews ?? [];
const nextViews = [];
const chunks = [];
const bufferViewRemap = new Map();
let nextOffset = 0;

for (let index = 0; index < originalViews.length; index += 1) {
  if (removedViews.has(index)) continue;
  const view = { ...originalViews[index], byteOffset: nextOffset };
  const start = originalViews[index].byteOffset ?? 0;
  const data = binary.subarray(start, start + originalViews[index].byteLength);
  chunks.push(data, Buffer.alloc(align4(data.length) - data.length));
  nextOffset += align4(data.length);
  bufferViewRemap.set(index, nextViews.length);
  nextViews.push(view);
}

json.images = [];
json.textures = [];
json.samplers = [];
for (const material of json.materials ?? []) removeTextureReferences(material);
remapBufferViews(json, bufferViewRemap);
json.bufferViews = nextViews;
json.buffers = [{ byteLength: nextOffset }];

await writeFile(outputPath, createGlb(json, Buffer.concat(chunks)));
