import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import sharp from 'sharp';
import ffmpeg from 'ffmpeg-static';

const root = process.cwd();
const raw = path.join(root, 'output/hero-polished');
const source = path.join(root, 'assets/video-sources/hero-garden-v7');
const output = path.join(root, 'public/videos');
const outputName = 'hero-garden-v9';
await mkdir(source, { recursive: true });
await mkdir(path.join(raw, 'overlays'), { recursive: true });
async function run(args) {
  await new Promise((resolve, reject) => {
    const child = spawn(
      ffmpeg,
      ['-hide_banner', '-loglevel', 'warning', '-y', ...args],
      { stdio: 'inherit' },
    );
    child.once('error', reject);
    child.once('exit', (code) =>
      code === 0 ? resolve() : reject(new Error(`FFmpeg: ${code}`)),
    );
  });
}
if (process.argv.includes('--package')) {
  const design = JSON.parse(
    await readFile(path.join(root, 'output/hero-finale/design.json'), 'utf8'),
  );
  const reference = JSON.parse(
    await readFile(
      path.join(root, 'assets/video-sources/hero-garden-v6/design.json'),
      'utf8',
    ),
  );
  for (const key of [
    'productId',
    'shape',
    'material',
    'baseMaterial',
    'widthMm',
    'heightMm',
  ]) {
    if (design[key] !== reference[key])
      throw new Error(`Finale design changed: ${key}`);
  }
  if (
    design.inscriptions.map((line) => line.text).join('|') !==
      reference.inscriptions.map((line) => line.text).join('|') ||
    design.motifs.length !== 3
  )
    throw new Error('Finale engraving differs from the completed design');
  await mkdir(path.join(raw, 'finale'), { recursive: true });
  const plate = path.join(root, 'public/videos/hero-garden-scene-v1.webp');
  for (let frame = 0; frame < 130; frame++) {
    const ui = await sharp(
      path.join(
        root,
        'output/hero-finale/frames',
        `${String(frame).padStart(4, '0')}.png`,
      ),
    )
      .resize(576, 338, { fit: 'contain', background: '#171819' })
      .modulate({ brightness: 0.975, saturation: 0.92 })
      .png()
      .toBuffer();
    const composed = await sharp(plate)
      .composite([{ input: ui, left: 156, top: 311 }])
      .png()
      .toBuffer();
    await sharp(composed)
      .extract({ left: 0, top: 0, width: 1672, height: 940 })
      .resize(1280, 720)
      .png()
      .toFile(
        path.join(raw, 'finale', `${String(frame).padStart(4, '0')}.png`),
      );
  }
  await run([
    '-framerate',
    '25',
    '-i',
    path.join(raw, 'finale/%04d.png'),
    '-an',
    '-c:v',
    'libx264',
    '-crf',
    '14',
    '-preset',
    'slow',
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    path.join(source, 'finale.mp4'),
  ]);
  await copyFile(
    path.join(root, 'output/hero-finale/design.json'),
    path.join(source, 'design.json'),
  );
}

// Coordinates map real 1440 × 900 UI captures to the laptop screen. The
// pointer indicates product, shape, red granite, Blue Pearl and inscription nav.
const uiPoint = (x, y) => ({ x: 133 + x * 0.287, y: 238 + y * 0.287 });
const actions = [
  { time: 1.6, ...uiPoint(720, 744) },
  { time: 3.6, ...uiPoint(520, 600) },
  { time: 5.6, ...uiPoint(200, 420) },
  { time: 7.6, ...uiPoint(70, 650) },
  { time: 9.6, ...uiPoint(294, 200) },
];
const captions = [
  { start: 0.2, end: 2, text: 'Choose your memorial' },
  { start: 2.1, end: 4, text: 'Explore headstone shapes' },
  { start: 4.1, end: 6, text: 'Select your preferred shape' },
  { start: 6.1, end: 8, text: 'Compare granite colours' },
  { start: 10.1, end: 12.4, text: 'Add a personal dedication' },
  { start: 12.5, end: 14.8, text: 'Write a message of remembrance' },
  { start: 14.9, end: 17.2, text: 'Add a symbolic dove' },
  { start: 17.3, end: 19.6, text: 'Add decorative branches' },
  { start: 19.7, end: 21, text: 'View your memorial in 3D' },
  { start: 21, end: 25.1, text: 'Your design. A lasting tribute.' },
];
const timeline = {
  duration: 26,
  fps: 25,
  actions,
  captions,
  orbit: { start: 20, duration: 5.2, amplitude: 0.22 },
  title: { text: 'Your design. A lasting tribute.', start: 21, fadeOut: 24.6 },
};
await writeFile(
  path.join(source, 'timeline.json'),
  JSON.stringify(timeline, null, 2) + '\n',
);
for (let frame = 0; frame < 650; frame++) {
  const t = frame / 25;
  const nextIndex = actions.findIndex((action) => action.time >= t);
  const next = actions[nextIndex < 0 ? actions.length - 1 : nextIndex];
  const previous = actions[Math.max(0, nextIndex - 1)];
  const start = next.time - 0.65;
  const progress = Math.max(0, Math.min(1, (t - start) / 0.5));
  const ease = progress * progress * (3 - 2 * progress);
  const x = previous.x + (next.x - previous.x) * ease;
  const y = previous.y + (next.y - previous.y) * ease;
  const cursorOpacity = Math.min(
    1,
    Math.max(0, (t - 0.3) / 0.3),
    Math.max(0, (10 - t) / 0.3),
  );
  const click = actions.find(
    (action) => t >= action.time && t < action.time + 0.5,
  );
  const pulse = click ? (t - click.time) / 0.5 : 0;
  const caption = captions.find(({ start, end }) => t >= start && t < end);
  const titleOpacity = caption
    ? Math.max(
        0,
        Math.min(1, (t - caption.start) / 0.2, (caption.end - t) / 0.2),
      )
    : 0;
  const captionText = caption?.text ?? '';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720">
    ${click ? `<circle cx="${click.x}" cy="${click.y}" r="${5 + pulse * 17}" fill="#d7b356" fill-opacity="${0.16 * (1 - pulse)}" stroke="#f3d58d" stroke-width="2.5" opacity="${1 - pulse}"/>` : ''}
    <path transform="translate(${x} ${y})" d="M0 0L0 23L6 17L11 28L16 26L11 15L20 15Z" fill="white" stroke="#17120d" stroke-width="1.7" stroke-linejoin="round" opacity="${cursorOpacity}"/>
    <g opacity="${titleOpacity}" font-family="Georgia,serif" font-size="38" text-anchor="middle"><text x="641" y="97" fill="#08120c" stroke="#08120c" stroke-width="3" opacity=".7">${captionText}</text><text x="640" y="96" fill="#f5ead4">${captionText}</text></g>
  </svg>`;
  await sharp(Buffer.from(svg))
    .png()
    .toFile(
      path.join(raw, 'overlays', `${String(frame).padStart(4, '0')}.png`),
    );
}
await run([
  '-i',
  path.join(output, 'hero-garden-v6.mp4'),
  '-i',
  path.join(source, 'finale.mp4'),
  '-framerate',
  '25',
  '-i',
  path.join(raw, 'overlays/%04d.png'),
  '-filter_complex_threads',
  '1',
  '-filter_complex',
  '[1:v]format=rgba,fade=t=in:st=0:d=0.3:alpha=1,fade=t=out:st=4.8:d=0.4:alpha=1,setpts=PTS-STARTPTS+20/TB[orbit];[0:v][orbit]overlay=0:0:eof_action=pass[scene];[scene][2:v]overlay=0:0:shortest=1[out]',
  '-map',
  '[out]',
  '-t',
  '26',
  '-an',
  '-c:v',
  'libx264',
  '-crf',
  '20',
  '-preset',
  'slow',
  '-pix_fmt',
  'yuv420p',
  '-movflags',
  '+faststart',
  path.join(output, `${outputName}.mp4`),
]);
await run([
  '-i',
  path.join(output, `${outputName}.mp4`),
  '-an',
  '-c:v',
  'libvpx-vp9',
  '-crf',
  '32',
  '-b:v',
  '0',
  '-row-mt',
  '1',
  path.join(output, `${outputName}.webm`),
]);
await run([
  '-ss',
  '22',
  '-i',
  path.join(output, `${outputName}.mp4`),
  '-frames:v',
  '1',
  '-c:v',
  'libwebp',
  '-quality',
  '86',
  path.join(output, `${outputName}-poster.webp`),
]);
console.log(
  `Created ${outputName}: cursor, click pulses, action captions, model orbit and closing title; 26 seconds`,
);
