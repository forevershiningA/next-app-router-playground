import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import ffmpegPath from 'ffmpeg-static';

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const outputDir = path.join(rootDir, 'public', 'videos');
const baseUrl = process.env.HERO_VIDEO_BASE_URL ?? 'http://127.0.0.1:3100';
const route = '/traditional-engraved-headstone/select-material?capture=hero';
const outputDurationSeconds = 64;

const pause = (page, milliseconds) => page.waitForTimeout(milliseconds);

async function isServerReady() {
  try {
    const response = await fetch(baseUrl, {
      signal: AbortSignal.timeout(1500),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForServer(timeoutMs = 120_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (await isServerReady()) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Designer did not start at ${baseUrl} within ${timeoutMs}ms`);
}

function startDevServer() {
  const nextBin = path.join(
    rootDir,
    'node_modules',
    'next',
    'dist',
    'bin',
    'next',
  );
  const port = new URL(baseUrl).port || '3100';
  return spawn(process.execPath, [nextBin, 'dev', '--port', port], {
    cwd: rootDir,
    env: { ...process.env, NODE_ENV: 'development' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

async function runFfmpeg(args) {
  if (!ffmpegPath) throw new Error('ffmpeg-static did not provide a binary');
  await new Promise((resolve, reject) => {
    const process = spawn(ffmpegPath, args, { cwd: rootDir, stdio: 'inherit' });
    process.once('error', reject);
    process.once('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}`));
    });
  });
}

async function installCaptureUi(page) {
  await page.evaluate(() => {
    document.documentElement.dataset.heroCapture = 'true';
    const style = document.createElement('style');
    style.textContent = `
      html[data-hero-capture='true'], html[data-hero-capture='true'] * {
        cursor: none !important;
      }
      #hero-capture-cursor {
        position: fixed;
        top: 0;
        left: 0;
        z-index: 2147483647;
        width: 24px;
        height: 24px;
        border: 2px solid rgba(255,255,255,.95);
        border-radius: 999px;
        background: rgba(26,18,8,.36);
        box-shadow: 0 2px 12px rgba(0,0,0,.4);
        pointer-events: none;
        transform: translate3d(1180px, 720px, 0);
        transition: transform 520ms cubic-bezier(.22,1,.36,1),
          width 140ms ease, height 140ms ease, background 140ms ease;
      }
      #hero-capture-cursor.is-clicking {
        width: 18px;
        height: 18px;
        background: rgba(215,179,86,.85);
      }
    `;
    document.head.append(style);
    const cursor = document.createElement('div');
    cursor.id = 'hero-capture-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    document.body.append(cursor);
  });
}

async function moveCursor(page, locator) {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (!box)
    throw new Error('Cannot position capture cursor over hidden element');
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.evaluate(
    ({ x, y }) => {
      const cursor = document.querySelector('#hero-capture-cursor');
      if (cursor instanceof HTMLElement) {
        cursor.style.transform = `translate3d(${x - 12}px, ${y - 12}px, 0)`;
      }
    },
    { x, y },
  );
  await page.mouse.move(x, y, { steps: 18 });
  await pause(page, 600);
}

async function clickWithCursor(page, locator) {
  await moveCursor(page, locator);
  await page.evaluate(() =>
    document
      .querySelector('#hero-capture-cursor')
      ?.classList.add('is-clicking'),
  );
  await pause(page, 120);
  await locator.click();
  await page.evaluate(() =>
    document
      .querySelector('#hero-capture-cursor')
      ?.classList.remove('is-clicking'),
  );
}

async function clickWithCursorFast(page, locator) {
  await locator.scrollIntoViewIfNeeded();
  const box = await locator.boundingBox();
  if (!box) throw new Error('Cannot click hidden element');
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.evaluate(
    ({ x, y }) => {
      const cursor = document.querySelector('#hero-capture-cursor');
      if (cursor instanceof HTMLElement) {
        cursor.style.transform = `translate3d(${x - 12}px, ${y - 12}px, 0)`;
      }
    },
    { x, y },
  );
  await page.mouse.move(x, y);
  await pause(page, 260);
  await locator.click();
}

async function dragBetween(page, start, end, steps = 10) {
  await page.evaluate(({ x, y }) => {
    const cursor = document.querySelector('#hero-capture-cursor');
    if (cursor instanceof HTMLElement) {
      cursor.style.transform = `translate3d(${x - 12}px, ${y - 12}px, 0)`;
    }
  }, start);
  await page.mouse.move(start.x, start.y, { steps: 18 });
  await pause(page, 450);
  await page.mouse.down();
  await page.evaluate(({ x, y }) => {
    const cursor = document.querySelector('#hero-capture-cursor');
    if (cursor instanceof HTMLElement) {
      cursor.classList.add('is-clicking');
      cursor.style.transform = `translate3d(${x - 12}px, ${y - 12}px, 0)`;
    }
  }, end);
  await page.mouse.move(end.x, end.y, { steps });
  await page.mouse.up();
  await page.evaluate(() =>
    document
      .querySelector('#hero-capture-cursor')
      ?.classList.remove('is-clicking'),
  );
}

async function dragRangeToFraction(page, range, fraction) {
  await range.scrollIntoViewIfNeeded();
  const box = await range.boundingBox();
  if (!box) throw new Error('Cannot drag hidden range input');
  const start = { x: box.x + box.width * 0.12, y: box.y + box.height / 2 };
  const end = {
    x: box.x + box.width * Math.max(0, Math.min(1, fraction)),
    y: start.y,
  };
  await dragBetween(page, start, end, 8);
}

async function waitForDesigner(page) {
  await page.locator('canvas').waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForFunction(
    () => {
      const canvas = document.querySelector('canvas');
      const renderer = window.__r3fGL;
      return Boolean(canvas && renderer && window.__r3fCamera);
    },
    undefined,
    { timeout: 30_000 },
  );
}

async function recordDemo(page, recordingStartedAt) {
  await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded' });
  await waitForDesigner(page);
  const motifWarmup = await page.request.get(
    `${baseUrl}/api/motifs/db?category=motif`,
  );
  if (!motifWarmup.ok()) {
    throw new Error(`Motif warmup failed with ${motifWarmup.status()}`);
  }
  await installCaptureUi(page);
  const contentStartSeconds = Math.max(
    0,
    (Date.now() - recordingStartedAt) / 1000,
  );
  await pause(page, 1800);

  const shapes = page.locator('[data-quick-nav-slug="select-shape"]');
  await clickWithCursor(page, shapes);
  const shapeChoices = ['Curved Peak', 'Cropped Peak', 'Serpentine'];
  for (const shapeName of shapeChoices) {
    const shape = page
      .getByRole('button', { name: new RegExp(shapeName, 'i') })
      .first();
    await shape.waitFor({ state: 'visible', timeout: 20_000 });
    await clickWithCursor(page, shape);
    await pause(page, 650);
  }

  await clickWithCursor(
    page,
    page.locator('[data-quick-nav-slug="select-material"]'),
  );

  const africanRed = page.getByRole('button', { name: /African Red/i }).first();
  await africanRed.waitFor({ state: 'visible', timeout: 20_000 });
  await clickWithCursor(page, africanRed);
  await pause(page, 800);

  const bluePearl = page.getByRole('button', { name: /Blue Pearl/i }).first();
  await clickWithCursor(page, bluePearl);
  await pause(page, 800);

  const inscriptions = page.locator('[data-quick-nav-slug="inscriptions"]');
  await clickWithCursor(page, inscriptions);
  await page.waitForURL(/\/inscriptions(?:\?|$)/, { timeout: 15_000 });
  await page.locator('#inscriptionTextInput').waitFor({ state: 'visible' });
  await pause(page, 700);

  const input = page.locator('#inscriptionTextInput');
  await moveCursor(page, input);
  await input.fill('In Loving Memory\nAlways in our hearts');
  await pause(page, 500);

  await clickWithCursor(
    page,
    page.getByRole('button', { name: 'Add Inscription' }),
  );
  await pause(page, 500);

  const inscriptionSizeSlider = page.locator('input[type="range"]').first();
  await dragRangeToFraction(page, inscriptionSizeSlider, 0.25);
  await pause(page, 700);

  const canvas = page.locator('canvas');
  let canvasBox = await canvas.boundingBox();
  if (canvasBox) {
    const inscriptionX = canvasBox.x + canvasBox.width * 0.57;
    const inscriptionY = canvasBox.y + canvasBox.height * 0.4;
    await dragBetween(
      page,
      { x: inscriptionX, y: inscriptionY },
      { x: inscriptionX, y: inscriptionY - 125 },
    );
  }
  await pause(page, 700);

  const motifs = page.locator('[data-quick-nav-slug="select-motifs"]');
  await clickWithCursor(page, motifs);
  await page.waitForURL(/\/select-motifs(?:\?|$)/, { timeout: 15_000 });

  const birds = page.getByRole('button', { name: /Birds/i }).first();
  await pause(page, 500);
  if (!(await birds.isVisible())) {
    await clickWithCursor(page, motifs);
  }
  await birds.waitFor({ state: 'visible', timeout: 20_000 });
  await clickWithCursor(page, birds);
  const birdMotif = page.locator('div.grid.grid-cols-3 > button').first();
  await birdMotif.waitFor({ state: 'visible', timeout: 20_000 });
  await clickWithCursor(page, birdMotif);
  await pause(page, 900);

  canvasBox = await canvas.boundingBox();
  if (canvasBox) {
    const motifX = canvasBox.x + canvasBox.width * 0.5;
    const motifY = canvasBox.y + canvasBox.height * 0.41;
    await dragBetween(
      page,
      { x: motifX, y: motifY },
      { x: motifX + 80, y: motifY + 135 },
    );
  }
  await pause(page, 700);

  const rotateRight = page.getByRole('button', { name: 'Rotate right' });
  await clickWithCursorFast(page, rotateRight);
  await pause(page, 850);
  await clickWithCursorFast(page, rotateRight);
  await pause(page, 1100);

  await clickWithCursorFast(
    page,
    page.getByRole('button', { name: 'Open check price breakdown' }),
  );
  await page
    .getByText(/price|estimate|total/i)
    .first()
    .waitFor({ state: 'visible', timeout: 10_000 });
  await pause(page, 2600);
  return contentStartSeconds;
}

async function main() {
  await mkdir(outputDir, { recursive: true });
  const tempDir = await mkdtemp(path.join(tmpdir(), 'fs-hero-video-'));
  let server = null;
  let browser = null;

  try {
    if (!(await isServerReady())) {
      server = startDevServer();
      server.stdout.on('data', (chunk) => process.stdout.write(chunk));
      server.stderr.on('data', (chunk) => process.stderr.write(chunk));
      await waitForServer();
    }

    browser = await chromium.launch({
      headless: true,
      args: ['--use-angle=swiftshader-webgl', '--enable-webgl'],
    });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 1,
      colorScheme: 'light',
      recordVideo: { dir: tempDir, size: { width: 1440, height: 900 } },
    });
    await context.addInitScript(() => {
      localStorage.setItem('fs_ui_theme', 'day');
    });
    const recordingStartedAt = Date.now();
    const page = await context.newPage();
    const video = page.video();

    const contentStartSeconds = await recordDemo(page, recordingStartedAt);
    await page.close();
    const rawVideoPath = await video.path();
    await context.close();

    const webmOutput = path.join(outputDir, 'configurator-hero.webm');
    const mp4Output = path.join(outputDir, 'configurator-hero.mp4');
    const posterOutput = path.join(outputDir, 'configurator-hero-poster.webp');

    const videoFilter =
      'fps=30,scale=1280:800:force_original_aspect_ratio=decrease,pad=1280:800:(ow-iw)/2:(oh-ih)/2';
    await runFfmpeg([
      '-y',
      '-ss',
      contentStartSeconds.toFixed(3),
      '-i',
      rawVideoPath,
      '-t',
      String(outputDurationSeconds),
      '-an',
      '-vf',
      videoFilter,
      '-c:v',
      'libvpx-vp9',
      '-crf',
      '34',
      '-b:v',
      '0',
      '-row-mt',
      '1',
      webmOutput,
    ]);
    await runFfmpeg([
      '-y',
      '-ss',
      contentStartSeconds.toFixed(3),
      '-i',
      rawVideoPath,
      '-t',
      String(outputDurationSeconds),
      '-an',
      '-vf',
      videoFilter,
      '-c:v',
      'libx264',
      '-preset',
      'slow',
      '-crf',
      '25',
      '-pix_fmt',
      'yuv420p',
      '-movflags',
      '+faststart',
      mp4Output,
    ]);
    await runFfmpeg([
      '-y',
      '-ss',
      (contentStartSeconds + 1.5).toFixed(3),
      '-i',
      rawVideoPath,
      '-frames:v',
      '1',
      '-vf',
      'scale=1280:800:force_original_aspect_ratio=decrease,pad=1280:800:(ow-iw)/2:(oh-ih)/2',
      '-c:v',
      'libwebp',
      '-quality',
      '82',
      posterOutput,
    ]);

    console.log(`Hero video created in ${outputDir}`);
  } finally {
    await browser?.close().catch(() => {});
    server?.kill();
    await rm(tempDir, { recursive: true, force: true }).catch((error) => {
      console.warn(`Could not remove temporary capture directory: ${error}`);
    });
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
