import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright';
import ffmpegPath from 'ffmpeg-static';
import { VIDEO_FORMATS, createVideoFilter } from './formats.mjs';

const CAPTURE_VIEWPORT = Object.freeze({ width: 1440, height: 900 });
const pause = (page, milliseconds) => page.waitForTimeout(milliseconds);

async function isServerReady(baseUrl) {
  try {
    const response = await fetch(baseUrl, {
      signal: AbortSignal.timeout(1500),
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForServer(baseUrl, timeoutMs = 120_000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (await isServerReady(baseUrl)) return;
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Designer did not start at ${baseUrl} within ${timeoutMs}ms`);
}

function startProductionServer(rootDir, baseUrl) {
  const nextBin = path.join(
    rootDir,
    'node_modules',
    'next',
    'dist',
    'bin',
    'next',
  );
  const port = new URL(baseUrl).port || '3100';
  return spawn(process.execPath, [nextBin, 'start', '--port', port], {
    cwd: rootDir,
    env: { ...process.env, NODE_ENV: 'production' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
}

async function runFfmpeg(rootDir, args) {
  if (!ffmpegPath) throw new Error('ffmpeg-static did not provide a binary');
  await new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, args, { cwd: rootDir, stdio: 'inherit' });
    child.once('error', reject);
    child.once('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`FFmpeg exited with code ${code}`));
    });
  });
}

async function installCaptureUi(page) {
  await page.evaluate(() => {
    document.documentElement.dataset.videoCapture = 'true';
    const style = document.createElement('style');
    style.textContent = `
      html[data-video-capture='true'], html[data-video-capture='true'] * { cursor: none !important; }
      #video-capture-cursor {
        position: fixed; top: 0; left: 0; z-index: 2147483647;
        width: 24px; height: 24px; border: 2px solid rgba(255,255,255,.95);
        border-radius: 999px; background: rgba(26,18,8,.36);
        box-shadow: 0 2px 12px rgba(0,0,0,.4); pointer-events: none;
        transform: translate3d(1180px,720px,0);
        transition: transform 520ms cubic-bezier(.22,1,.36,1), width 140ms ease,
          height 140ms ease, background 140ms ease;
      }
      #video-capture-cursor.is-clicking { width: 18px; height: 18px; background: rgba(215,179,86,.85); }
      #video-capture-caption {
        position: fixed; top: 32px; right: 32px; z-index: 2147483646;
        width: min(430px, calc(100vw - 64px)); padding: 18px 22px;
        border: 1px solid rgba(255,255,255,.26); border-radius: 18px;
        color: white; background: rgba(18,15,12,.84);
        box-shadow: 0 18px 50px rgba(0,0,0,.28);
        font-family: Arial, Helvetica, sans-serif; pointer-events: none;
        opacity: 0; transform: translateY(-12px);
        transition: opacity 260ms ease, transform 260ms ease;
        backdrop-filter: blur(12px);
      }
      #video-capture-caption.is-visible { opacity: 1; transform: translateY(0); }
      #video-capture-caption-eyebrow {
        margin: 0 0 6px; color: #e1bc62; font-size: 12px;
        font-weight: 700; letter-spacing: .14em; text-transform: uppercase;
      }
      #video-capture-caption-title {
        margin: 0; font-family: Georgia, 'Times New Roman', serif;
        font-size: 28px; font-weight: 500; line-height: 1.08;
      }
      #video-capture-caption-body {
        margin: 8px 0 0; color: rgba(255,255,255,.78);
        font-size: 15px; line-height: 1.4;
      }
    `;
    document.head.append(style);
    const cursor = document.createElement('div');
    cursor.id = 'video-capture-cursor';
    cursor.setAttribute('aria-hidden', 'true');
    document.body.append(cursor);
    const caption = document.createElement('div');
    caption.id = 'video-capture-caption';
    caption.setAttribute('aria-hidden', 'true');
    caption.innerHTML = `
      <p id="video-capture-caption-eyebrow"></p>
      <p id="video-capture-caption-title"></p>
      <p id="video-capture-caption-body"></p>
    `;
    document.body.append(caption);
  });
}

function locatorFromSpec(page, spec) {
  let locator;
  switch (spec.by) {
    case 'role':
      locator = page.getByRole(spec.role, {
        name: spec.name,
        exact: spec.exact,
      });
      break;
    case 'label':
      locator = page.getByLabel(spec.name, { exact: spec.exact });
      break;
    case 'text':
      locator = page.getByText(spec.text, { exact: spec.exact });
      break;
    case 'quickNav':
      locator = page.locator(`[data-quick-nav-slug="${spec.slug}"]`);
      break;
    case 'css':
      locator = page.locator(spec.selector);
      break;
    default:
      throw new Error(`Unsupported locator type: ${spec.by}`);
  }
  return spec.first ? locator.first() : locator;
}

async function moveCursor(page, locator, fast = false) {
  await locator.scrollIntoViewIfNeeded();
  await locator.waitFor({ state: 'visible', timeout: 20_000 });
  const box = await locator.boundingBox();
  if (!box)
    throw new Error('Cannot position capture cursor over hidden element');
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.evaluate(
    ({ x, y }) => {
      const cursor = document.querySelector('#video-capture-cursor');
      if (cursor instanceof HTMLElement)
        cursor.style.transform = `translate3d(${x - 12}px,${y - 12}px,0)`;
    },
    { x, y },
  );
  await page.mouse.move(x, y, { steps: fast ? 1 : 18 });
  await pause(page, fast ? 260 : 600);
}

async function clickWithCursor(page, locator, fast = false) {
  await moveCursor(page, locator, fast);
  await page.evaluate(() =>
    document
      .querySelector('#video-capture-cursor')
      ?.classList.add('is-clicking'),
  );
  if (!fast) await pause(page, 120);
  await locator.click();
  await page.evaluate(() =>
    document
      .querySelector('#video-capture-cursor')
      ?.classList.remove('is-clicking'),
  );
}

async function dragBetween(page, start, end, steps = 10) {
  await page.evaluate(({ x, y }) => {
    const cursor = document.querySelector('#video-capture-cursor');
    if (cursor instanceof HTMLElement)
      cursor.style.transform = `translate3d(${x - 12}px,${y - 12}px,0)`;
  }, start);
  await page.mouse.move(start.x, start.y, { steps: 18 });
  await pause(page, 450);
  await page.mouse.down();
  await page.evaluate(({ x, y }) => {
    const cursor = document.querySelector('#video-capture-cursor');
    if (cursor instanceof HTMLElement) {
      cursor.classList.add('is-clicking');
      cursor.style.transform = `translate3d(${x - 12}px,${y - 12}px,0)`;
    }
  }, end);
  await page.mouse.move(end.x, end.y, { steps });
  await page.mouse.up();
  await page.evaluate(() =>
    document
      .querySelector('#video-capture-cursor')
      ?.classList.remove('is-clicking'),
  );
}

async function waitForDesigner(page) {
  await page.locator('canvas').waitFor({ state: 'visible', timeout: 30_000 });
  await page.waitForFunction(
    () =>
      Boolean(
        document.querySelector('canvas') &&
          window.__r3fGL &&
          window.__r3fCamera,
      ),
    undefined,
    { timeout: 30_000 },
  );
}

async function runStep(page, step, baseUrl, rootDir) {
  const locator = step.target ? locatorFromSpec(page, step.target) : null;
  switch (step.action) {
    case 'pause':
      await pause(page, step.ms);
      return;
    case 'caption':
      await page.evaluate(({ eyebrow, title, body }) => {
        const caption = document.querySelector('#video-capture-caption');
        const eyebrowElement = document.querySelector(
          '#video-capture-caption-eyebrow',
        );
        const titleElement = document.querySelector(
          '#video-capture-caption-title',
        );
        const bodyElement = document.querySelector(
          '#video-capture-caption-body',
        );
        if (
          caption instanceof HTMLElement &&
          eyebrowElement instanceof HTMLElement &&
          titleElement instanceof HTMLElement &&
          bodyElement instanceof HTMLElement
        ) {
          eyebrowElement.textContent = eyebrow ?? '';
          eyebrowElement.style.display = eyebrow ? '' : 'none';
          titleElement.textContent = title ?? '';
          bodyElement.textContent = body ?? '';
          bodyElement.style.display = body ? '' : 'none';
          caption.classList.add('is-visible');
        }
      }, step);
      if (step.afterMs) await pause(page, step.afterMs);
      return;
    case 'hideCaption':
      await page.evaluate(() =>
        document
          .querySelector('#video-capture-caption')
          ?.classList.remove('is-visible'),
      );
      if (step.afterMs) await pause(page, step.afterMs);
      return;
    case 'request': {
      const response = await page.request.get(`${baseUrl}${step.path}`);
      if (!response.ok())
        throw new Error(
          `${step.label ?? step.path} failed with ${response.status()}`,
        );
      return;
    }
    case 'click':
      await clickWithCursor(page, locator, step.fast);
      break;
    case 'repeatClick':
      await moveCursor(page, locator, true);
      for (let index = 0; index < step.count; index += 1) {
        await locator.click();
        if (step.intervalMs) await pause(page, step.intervalMs);
      }
      break;
    case 'fill':
      await moveCursor(page, locator);
      await locator.fill(step.value);
      break;
    case 'upload':
      await locator.setInputFiles(path.resolve(rootDir, step.file));
      break;
    case 'waitForUrl':
      await page.waitForURL(step.url, { timeout: step.timeout ?? 15_000 });
      return;
    case 'waitForVisible':
      await locator.waitFor({
        state: 'visible',
        timeout: step.timeout ?? 20_000,
      });
      return;
    case 'waitForDesigner':
      await waitForDesigner(page);
      return;
    case 'clickIfHidden':
      if (!(await locator.isVisible()))
        await clickWithCursor(page, locatorFromSpec(page, step.fallbackTarget));
      break;
    case 'dragRange': {
      await locator.scrollIntoViewIfNeeded();
      const box = await locator.boundingBox();
      if (!box) throw new Error('Cannot drag hidden range input');
      const fraction = Math.max(0, Math.min(1, step.fraction));
      await dragBetween(
        page,
        { x: box.x + box.width * 0.12, y: box.y + box.height / 2 },
        { x: box.x + box.width * fraction, y: box.y + box.height / 2 },
        8,
      );
      break;
    }
    case 'dragCanvas': {
      const box = await page.locator('canvas').boundingBox();
      if (!box) throw new Error('Cannot drag on a hidden canvas');
      const start = {
        x: box.x + box.width * step.from.x,
        y: box.y + box.height * step.from.y,
      };
      await dragBetween(
        page,
        start,
        { x: start.x + step.delta.x, y: start.y + step.delta.y },
        step.steps ?? 10,
      );
      break;
    }
    case 'clickCanvas': {
      const box = await page.locator('canvas').boundingBox();
      if (!box) throw new Error('Cannot click on a hidden canvas');
      await page.mouse.click(
        box.x + box.width * step.at.x,
        box.y + box.height * step.at.y,
      );
      break;
    }
    default:
      throw new Error(`Unsupported scenario action: ${step.action}`);
  }
  if (step.afterMs) await pause(page, step.afterMs);
}

function validateScenario(scenario) {
  if (!scenario?.id || !scenario?.route || !Array.isArray(scenario.steps))
    throw new Error('A video scenario requires id, route and steps');
  if (!scenario.outputBaseName)
    throw new Error(`Scenario ${scenario.id} requires outputBaseName`);
}

async function exportFormat({
  rootDir,
  outputDir,
  rawVideoPath,
  scenario,
  formatName,
  contentStartSeconds,
}) {
  const format = VIDEO_FORMATS[formatName];
  const targetDir = path.join(outputDir, format.directory);
  await mkdir(targetDir, { recursive: true });
  const baseName = `${scenario.outputBaseName}${format.suffix}`;
  const mp4Output = path.join(targetDir, `${baseName}.mp4`);
  const posterOutput = path.join(targetDir, `${baseName}-poster.webp`);
  const videoFilter = createVideoFilter(formatName);
  const commonInput = [
    '-y',
    '-ss',
    contentStartSeconds.toFixed(3),
    '-i',
    rawVideoPath,
    '-t',
    String(scenario.maxDurationSeconds),
    '-an',
    '-vf',
    videoFilter,
  ];
  if (format.webm) {
    await runFfmpeg(rootDir, [
      ...commonInput,
      '-c:v',
      'libvpx-vp9',
      '-crf',
      '34',
      '-b:v',
      '0',
      '-row-mt',
      '1',
      path.join(targetDir, `${baseName}.webm`),
    ]);
  }
  await runFfmpeg(rootDir, [
    ...commonInput,
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
  await runFfmpeg(rootDir, [
    '-y',
    '-ss',
    (contentStartSeconds + (scenario.posterTimeSeconds ?? 1.5)).toFixed(3),
    '-i',
    rawVideoPath,
    '-frames:v',
    '1',
    '-vf',
    videoFilter,
    '-c:v',
    'libwebp',
    '-quality',
    '82',
    posterOutput,
  ]);
  return { format: formatName, mp4Output, posterOutput };
}

export async function renderVideoScenario({
  rootDir,
  outputDir,
  baseUrl,
  scenario,
  formats,
}) {
  validateScenario(scenario);
  await mkdir(outputDir, { recursive: true });
  const tempDir = await mkdtemp(path.join(tmpdir(), 'fs-video-'));
  let server = null;
  let browser = null;
  try {
    if (!(await isServerReady(baseUrl))) {
      server = startProductionServer(rootDir, baseUrl);
      server.stdout.on('data', (chunk) => process.stdout.write(chunk));
      server.stderr.on('data', (chunk) => process.stderr.write(chunk));
      await waitForServer(baseUrl);
    }
    const useSoftwareRenderer =
      process.env.VIDEO_USE_SWIFTSHADER === '1' ||
      process.env.HERO_VIDEO_USE_SWIFTSHADER === '1';
    const gpuArgs = useSoftwareRenderer
      ? ['--use-angle=swiftshader-webgl', '--enable-webgl']
      : [
          '--enable-webgl',
          '--enable-gpu-rasterization',
          '--ignore-gpu-blocklist',
          ...(process.platform === 'win32' ? ['--use-angle=d3d11'] : []),
        ];
    browser = await chromium.launch({ headless: true, args: gpuArgs });
    const context = await browser.newContext({
      viewport: CAPTURE_VIEWPORT,
      deviceScaleFactor: 1,
      colorScheme: 'light',
      recordVideo: { dir: tempDir, size: CAPTURE_VIEWPORT },
    });
    await context.addInitScript(() =>
      localStorage.setItem('fs_ui_theme', 'day'),
    );
    const recordingStartedAt = Date.now();
    const page = await context.newPage();
    const video = page.video();
    await page.goto(`${baseUrl}${scenario.route}`, {
      waitUntil: 'domcontentloaded',
    });
    if (scenario.requiresDesigner !== false) await waitForDesigner(page);
    await installCaptureUi(page);
    const contentStartSeconds = Math.max(
      0,
      (Date.now() - recordingStartedAt) / 1000,
    );
    for (const step of scenario.steps)
      await runStep(page, step, baseUrl, rootDir);
    await page.close();
    const rawVideoPath = await video.path();
    await context.close();
    const outputs = [];
    for (const formatName of formats) {
      outputs.push(
        await exportFormat({
          rootDir,
          outputDir,
          rawVideoPath,
          scenario,
          formatName,
          contentStartSeconds,
        }),
      );
    }
    return outputs;
  } finally {
    await browser?.close().catch(() => {});
    server?.kill();
    await rm(tempDir, { recursive: true, force: true }).catch((error) =>
      console.warn(`Could not remove temporary capture directory: ${error}`),
    );
  }
}
