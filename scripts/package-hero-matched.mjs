import { mkdir, copyFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import ffmpeg from 'ffmpeg-static';
import sharp from 'sharp';

const directory = 'assets/video-sources/hero-garden-v2';
await mkdir(directory, { recursive: true });
await copyFile('output/hero-matched/product.png', `${directory}/product.png`);
await copyFile('output/hero-matched/design.json', `${directory}/design.json`);
await sharp('output/hero-concept/garden-plate-v2.png')
  .webp({ quality: 94 })
  .toFile(`${directory}/garden-plate.webp`);
await new Promise((resolve, reject) => {
  const child = spawn(
    ffmpeg,
    [
      '-hide_banner',
      '-loglevel',
      'warning',
      '-y',
      '-framerate',
      '10',
      '-i',
      'output/hero-matched/frames/%04d.png',
      '-t',
      '12',
      '-an',
      '-c:v',
      'libx264',
      '-crf',
      '16',
      '-preset',
      'slow',
      '-pix_fmt',
      'yuv420p',
      '-movflags',
      '+faststart',
      `${directory}/configurator.mp4`,
    ],
    { stdio: 'inherit' },
  );
  child.once('error', reject);
  child.once('exit', (code) =>
    code === 0 ? resolve() : reject(new Error(`FFmpeg: ${code}`)),
  );
});
console.log(`Packaged reusable source assets in ${directory}`);
