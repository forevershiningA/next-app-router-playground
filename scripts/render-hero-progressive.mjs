import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import ffmpeg from 'ffmpeg-static';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const photographic = process.argv.includes('--photographic');
const name = photographic ? 'hero-garden-v4' : 'hero-garden-v3';
const source = path.join(root, 'assets/video-sources', name);
const raw = path.join(
  root,
  photographic ? 'output/hero-photographic' : 'output/hero-progressive',
);
const output = path.join(root, 'public/videos');
const duration = 18;
const transition = 0.4;
const offsets = [2, 4.4, 6.8, 9.2, 11.6, 16.8];
await mkdir(source, { recursive: true });
await mkdir(output, { recursive: true });

if (process.argv.includes('--package')) {
  const design = JSON.parse(
    await readFile(path.join(raw, 'design.json'), 'utf8'),
  );
  const expected = [
    [0, 0],
    [1, 0],
    [2, 0],
    [2, 1],
    [2, 2],
    [2, 3],
  ];
  for (const [index, stage] of design.stages.entries()) {
    const actual = [stage.state.inscriptions.length, stage.state.motifs.length];
    if (String(actual) !== String(expected[index]))
      throw new Error(`Incorrect stage ${index}: ${actual}`);
    if (
      JSON.stringify(stage.camera) !== JSON.stringify(design.stages[0].camera)
    )
      throw new Error(`Camera changed at stage ${index}`);
  }
  const shadow = Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="1672" height="941"><defs><filter id="b"><feGaussianBlur stdDeviation="20"/></filter></defs><ellipse cx="1282" cy="766" rx="310" ry="33" fill="#0b140d" opacity=".55" filter="url(#b)"/></svg>',
  );
  const plate = await sharp(
    path.join(
      root,
      photographic
        ? 'public/videos/hero-garden-scene-v1.webp'
        : 'assets/video-sources/hero-garden-v2/garden-plate.webp',
    ),
  )
    .composite(photographic ? [] : [{ input: shadow }])
    .png()
    .toBuffer();
  for (let index = 0; index < 6; index++) {
    const product = await sharp(path.join(raw, `${index}-product.png`))
      .resize(640, 600, { fit: 'inside' })
      .png()
      .toBuffer();
    const ui = await sharp(path.join(raw, `${index}-ui.png`))
      .resize(576, 338, { fit: 'contain', background: '#171819' })
      .modulate({ brightness: 0.975, saturation: 0.92 })
      .png()
      .toBuffer();
    const composed = await sharp(plate)
      .composite([
        ...(!photographic ? [{ input: product, left: 970, top: 165 }] : []),
        { input: ui, left: 156, top: 311 },
      ])
      .png()
      .toBuffer();
    await sharp(composed)
      .extract({ left: 0, top: 0, width: 1672, height: 940 })
      .resize(1280, 720)
      .webp({ lossless: true })
      .toFile(path.join(source, `stage-${index}.webp`));
  }
  await copyFile(
    path.join(raw, 'design.json'),
    path.join(source, 'design.json'),
  );
  await writeFile(
    path.join(source, 'timeline.json'),
    JSON.stringify(
      {
        duration,
        transition,
        offsets,
        stages: design.stages.map((stage) => stage.name),
        camera: 'fixed; no orbit, pan or zoom',
      },
      null,
      2,
    ) + '\n',
  );
}

async function run(args) {
  await new Promise((resolve, reject) => {
    const child = spawn(
      ffmpeg,
      ['-hide_banner', '-loglevel', 'warning', '-y', ...args],
      { cwd: root, stdio: 'inherit' },
    );
    child.once('error', reject);
    child.once('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`FFmpeg: ${code}`)),
    );
  });
}

// Both sides are composited into each stage before its transition. They can
// never drift out of sync. The final transition returns to the same blank
// first frame, giving the finished memorial five seconds of uninterrupted hold.
const lengths = [2.4, 2.8, 2.8, 2.8, 2.8, 5.6, 1.2];
const inputs = lengths.flatMap((length, index) => [
  '-loop',
  '1',
  '-framerate',
  '25',
  '-t',
  String(length),
  '-i',
  path.join(source, `stage-${index === 6 ? 0 : index}.webp`),
]);
const filters = lengths.map(
  (_, i) =>
    `[${i}:v]fps=25,format=yuv420p,settb=AVTB,setpts=PTS-STARTPTS[s${i}]`,
);
for (let i = 1; i < 7; i++) {
  filters.push(
    `[${i === 1 ? 's0' : `mix${i - 1}`}][s${i}]xfade=transition=fade:duration=${transition}:offset=${offsets[i - 1]}[mix${i}]`,
  );
}
await run([
  ...inputs,
  '-filter_complex_threads',
  '1',
  '-filter_complex',
  filters.join(';'),
  '-map',
  '[mix6]',
  '-t',
  String(duration),
  '-an',
  '-c:v',
  'libx264',
  '-crf',
  '21',
  '-preset',
  'slow',
  '-pix_fmt',
  'yuv420p',
  '-movflags',
  '+faststart',
  path.join(output, `${name}.mp4`),
]);
await run([
  '-i',
  path.join(output, `${name}.mp4`),
  '-an',
  '-c:v',
  'libvpx-vp9',
  '-crf',
  '33',
  '-b:v',
  '0',
  '-row-mt',
  '1',
  path.join(output, `${name}.webm`),
]);
await run([
  '-ss',
  '14',
  '-i',
  path.join(output, `${name}.mp4`),
  '-frames:v',
  '1',
  '-c:v',
  'libwebp',
  '-quality',
  '86',
  path.join(output, `${name}-poster.webp`),
]);
console.log(
  `Created ${name}: ${duration}s, fixed camera, ${photographic ? 'original monument with progressive laptop design' : 'synchronized assembly'}`,
);
