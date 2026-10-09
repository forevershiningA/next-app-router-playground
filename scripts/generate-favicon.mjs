import fs from 'node:fs/promises';
import sharp from 'sharp';

const sourcePath = 'public/ico/forever-transparent-logo-bw.png';

async function createIcon(size) {
  const cornerRadius = Math.round(size * 0.2);
  const background = Buffer.from(`
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" rx="${cornerRadius}" fill="#15120d"/>
    </svg>
  `);

  const rayHalf = await sharp(sourcePath)
    .extract({ left: 277, top: 0, width: 123, height: 246 })
    .png()
    .toBuffer();
  const mirroredRayHalf = await sharp(rayHalf).flop().png().toBuffer();
  const rays = await sharp({
    create: {
      width: 246,
      height: 246,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      { input: mirroredRayHalf, left: 0, top: 0 },
      { input: rayHalf, left: 123, top: 0 },
    ])
    .png()
    .toBuffer();
  const mark = await sharp(rays)
    .resize(Math.round(size * 0.92), Math.round(size * 0.92), {
      fit: 'contain',
    })
    .png()
    .toBuffer();

  return sharp(background)
    .composite([{ input: mark, gravity: 'center' }])
    .png()
    .toBuffer();
}

function pngToIco(png, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);

  const entry = Buffer.alloc(16);
  entry.writeUInt8(size === 256 ? 0 : size, 0);
  entry.writeUInt8(size === 256 ? 0 : size, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(header.length + entry.length, 12);

  return Buffer.concat([header, entry, png]);
}

const [icon, appleIcon, faviconPng] = await Promise.all([
  createIcon(512),
  createIcon(180),
  createIcon(64),
]);

await Promise.all([
  fs.writeFile('app/icon.png', icon),
  fs.writeFile('app/apple-icon.png', appleIcon),
  fs.writeFile('app/favicon.ico', pngToIco(faviconPng, 64)),
]);
