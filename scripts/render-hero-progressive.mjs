import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import ffmpeg from 'ffmpeg-static';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const intro = process.argv.includes('--intro');
const photographic = intro || process.argv.includes('--photographic');
const name = intro
  ? 'hero-garden-v5'
  : photographic
    ? 'hero-garden-v4'
    : 'hero-garden-v3';
const source = path.join(root, 'assets/video-sources', name);
const raw = path.join(
  root,
  intro
    ? 'output/hero-intro'
    : photographic
      ? 'output/hero-photographic'
      : 'output/hero-progressive',
);
const output = path.join(root, 'public/videos');
const duration = intro ? 24 : 18;
const transition = 0.4;
const lengths = [
  ...(intro ? [2.4, 2.4, 2.4] : []),
  2.4,
  2.8,
  2.8,
  2.8,
  2.8,
  5.6,
  1.2,
];
const stageCount = lengths.length - 1;
let elapsed = 0;
const offsets = lengths.slice(0, -1).map((length) => {
  elapsed += length - transition;
  return Number(elapsed.toFixed(2));
});
await mkdir(source, { recursive: true });
await mkdir(output, { recursive: true });

if (process.argv.includes('--package')) {
  const design = JSON.parse(
    await readFile(path.join(raw, 'design.json'), 'utf8'),
  );
  const expected = [
    ...(intro
      ? [
          [0, 0],
          [0, 0],
          [0, 0],
        ]
      : []),
    [0, 0],
    [1, 0],
    [2, 0],
    [2, 1],
    [2, 2],
    [2, 3],
  ];
  if (design.stages.length !== stageCount)
    throw new Error('Unexpected stage count');
  for (const [index, stage] of design.stages.entries()) {
    if (
      intro &&
      index > 0 &&
      (stage.state.widthMm !== 800 || stage.state.heightMm !== 600)
    )
      throw new Error(`Product dimensions changed at stage ${index}`);
    if (intro && index > 0) {
      const expectedMaterial =
        index === 1
          ? 'African-Black'
          : index === 2
            ? 'African-Red'
            : 'Blue-Pearl';
      if (
        stage.state.material !==
          `/textures/forever/l/${expectedMaterial}.webp` ||
        stage.state.baseMaterial !== stage.state.material
      )
        throw new Error(`Incorrect granite at stage ${index}`);
    }
    const actual = [stage.state.inscriptions.length, stage.state.motifs.length];
    if (String(actual) !== String(expected[index]))
      throw new Error(`Incorrect stage ${index}: ${actual}`);
    if (
      !(intro && index === 0) &&
      JSON.stringify(stage.camera) !==
        JSON.stringify(design.stages[intro ? 1 : 0].camera)
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
  for (let index = 0; index < stageCount; index++) {
    const product = photographic
      ? null
      : await sharp(path.join(raw, `${index}-product.png`))
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
const inputs = lengths.flatMap((length, index) => [
  '-loop',
  '1',
  '-framerate',
  '25',
  '-t',
  String(length),
  '-i',
  path.join(source, `stage-${index === stageCount ? 0 : index}.webp`),
]);
const filters = lengths.map(
  (_, i) =>
    `[${i}:v]fps=25,format=yuv420p,settb=AVTB,setpts=PTS-STARTPTS[s${i}]`,
);
for (let i = 1; i <= stageCount; i++) {
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
  `[mix${stageCount}]`,
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
  intro ? '20' : '14',
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
