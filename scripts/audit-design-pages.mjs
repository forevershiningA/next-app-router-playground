/**
 * Read-only public-page and isolated editor baseline; no save/order requests.
 * pnpm exec node scripts/audit-design-pages.mjs
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { expect } from '@playwright/test';

const root = process.cwd();
const output = path.join(root, 'docs/audits/2026-10-16-designs');
const base = process.env.DESIGNS_AUDIT_BASE_URL ?? 'https://forevershining.org';
const pilot = JSON.parse(
  await fs.readFile(path.join(output, 'pilot.json'), 'utf8'),
).projects;
const inventory = JSON.parse(
  await fs.readFile(path.join(output, 'catalog-inventory.json'), 'utf8'),
);
const flowsOnly = process.argv.includes('--flows-only');
const previous = flowsOnly
  ? JSON.parse(
      await fs.readFile(path.join(output, 'browser-baseline.json'), 'utf8'),
    )
  : null;
const first = pilot[0];
if (!first) throw new Error('Run the catalog audit first.');
const samples = [
  { name: 'index', path: '/designs' },
  { name: 'product', path: '/designs/' + first.productSlug },
  {
    name: 'category',
    path: '/designs/' + first.productSlug + '/' + first.category,
  },
  { name: 'detail', path: first.url, id: first.id },
];
const browser = await chromium.launch({
  headless: true,
  args: ['--enable-webgl', '--ignore-gpu-blocklist'],
});
const results = {
  generatedAt: new Date().toISOString(),
  base,
  source:
    'Live production pages; local source/data may differ from deployed code.',
  pages: previous?.pages ?? [],
  previousPageCaptureAt: previous?.generatedAt ?? null,
  flows: [],
  errors: [],
  limitations: [
    'Navigation measurements are laboratory observations, not field Core Web Vitals.',
    'Successful editor navigation/canvas does not establish complete visual parity.',
    'No historical conversion funnel is available; audit clicks are isolated functional checks.',
  ],
};
function cleanUrl(value) {
  try {
    const url = new URL(value);
    return (
      url.origin +
      url.pathname +
      (url.pathname === '/_next/image'
        ? '?url=' + encodeURIComponent(url.searchParams.get('url') ?? '')
        : '')
    );
  } catch {
    return 'unparseable-url';
  }
}
async function contextFor(mobile) {
  const context = await browser.newContext({
    viewport: mobile
      ? { width: 390, height: 844 }
      : { width: 1440, height: 1000 },
    isMobile: mobile,
    hasTouch: mobile,
    deviceScaleFactor: 1,
    colorScheme: 'light',
  });
  await context.addInitScript(() => {
    localStorage.setItem('fs_ui_theme', 'day');
    window.__auditLcp = null;
    try {
      new PerformanceObserver((entries) => {
        window.__auditLcp = entries.getEntries().at(-1)?.startTime ?? null;
      }).observe({ type: 'largest-contentful-paint', buffered: true });
    } catch {
      /* Unsupported entry type is recorded as null. */
    }
  });
  // Production audit must not create telemetry or submit customer mutations.
  await context.route('**/*', async (route) => {
    const request = route.request(),
      url = new URL(request.url());
    if (
      url.pathname.includes('sentry') ||
      url.hostname.endsWith('sentry.io') ||
      (!['GET', 'HEAD', 'OPTIONS'].includes(request.method()) &&
        /^\/api\/(orders|projects|checkout|share|email|enquiries)/.test(
          url.pathname,
        ))
    ) {
      return route.abort('blockedbyclient');
    }
    return route.continue();
  });
  return context;
}
async function screenshotReady(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    const visible = [...document.images].filter((img) => {
      const rect = img.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < innerHeight;
    });
    await Promise.all(
      visible.map((img) =>
        Promise.race([
          img.decode().catch(() => {}),
          new Promise((resolve) => setTimeout(resolve, 5000)),
        ]),
      ),
    );
  });
}
async function waitForContent(page, sample) {
  await expect(
    page.getByText('Loading designs...', { exact: true }),
  ).toBeHidden({ timeout: 45000 });
  if (sample.id) {
    await page.waitForFunction(
      () => {
        const fallback = document.getElementById('design-ssr-content');
        return !fallback || getComputedStyle(fallback).display === 'none';
      },
      undefined,
      { timeout: 45000 },
    );
    await expect(page.getByRole('heading', { level: 1 }).last()).toBeVisible({
      timeout: 45000,
    });
  } else {
    await expect(page.locator('main')).toBeVisible({ timeout: 45000 });
    await expect(page.locator('main img').first()).toBeVisible({
      timeout: 45000,
    });
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible({
      timeout: 45000,
    });
  }
}
try {
  for (const mobile of flowsOnly ? [] : [false, true]) {
    for (const sample of samples) {
      const device = mobile ? 'mobile' : 'desktop';
      const context = await contextFor(mobile);
      const page = await context.newPage();
      const failed = [],
        errors = [];
      page.on('response', (response) => {
        if (response.status() >= 400)
          failed.push({
            status: response.status(),
            url: cleanUrl(response.url()),
          });
      });
      page.on('pageerror', (error) => errors.push(error.message.slice(0, 350)));
      const entry = { device, sample: sample.name, requestedPath: sample.path };
      try {
        console.log('Inspecting ' + device + ' ' + sample.path);
        const start = Date.now();
        const response = await page.goto(base + sample.path, {
          waitUntil: 'domcontentloaded',
          timeout: 90000,
        });
        entry.status = response?.status();
        await expect(
          page.getByRole('heading', { level: 1 }).first(),
        ).toBeVisible({ timeout: 45000 });
        await waitForContent(page, sample);
        entry.readinessErrors = [];
        if (sample.id) {
          try {
            await expect(
              page
                .getByRole('button', { name: /^start with this design$/i })
                .first(),
            ).toBeEnabled({ timeout: 45000 });
          } catch {
            entry.readinessErrors.push(
              'Hydrated primary personalization button not enabled within 45 seconds.',
            );
          }
        }
        await screenshotReady(page);
        entry.elapsedToCaptureMs = Date.now() - start;
        entry.finalUrl = cleanUrl(page.url());
        entry.dom = await page.evaluate(() => ({
          title: document.title,
          canonical: document
            .querySelector('link[rel="canonical"]')
            ?.getAttribute('href'),
          robots: document
            .querySelector('meta[name="robots"]')
            ?.getAttribute('content'),
          visibleHeadings: [...document.querySelectorAll('h1')]
            .filter((h) => h.getClientRects().length)
            .map((h) => h.textContent?.trim()),
          horizontalOverflowPx: Math.max(
            0,
            document.documentElement.scrollWidth - innerWidth,
          ),
          designLinks: document.querySelectorAll('a[href^="/designs/"]').length,
          designImages: [...document.images].filter((img) =>
            img.src.includes('v2026-3d'),
          ).length,
          failedLoadedImages: [...document.images]
            .filter((img) => img.complete && !img.naturalWidth)
            .map((img) => img.getAttribute('src')?.split('?')[0]),
          ssrContentHidden:
            document.getElementById('design-ssr-content')?.style.display ===
            'none',
          lcpObservedMs: window.__auditLcp,
          jsResources: performance
            .getEntriesByType('resource')
            .filter((r) => r.initiatorType === 'script').length,
          transferredResourceBytesReported: performance
            .getEntriesByType('resource')
            .reduce((sum, r) => sum + r.transferSize, 0),
        }));
        const file = device + '-' + sample.name + '.png';
        await page.screenshot({
          path: path.join(output, file),
          animations: 'disabled',
        });
        entry.screenshot = file;
        if (sample.name === 'category' || sample.name === 'detail') {
          await page.evaluate(() => scrollBy(0, innerHeight * 0.85));
          await screenshotReady(page);
          const second = device + '-' + sample.name + '-below.png';
          await page.screenshot({
            path: path.join(output, second),
            animations: 'disabled',
          });
          entry.secondScreenshot = second;
        }
      } catch (error) {
        entry.error = error.message.slice(0, 500);
      }
      entry.httpFailures = failed;
      entry.pageErrors = errors;
      results.pages.push(entry);
      await context.close();
      await fs.writeFile(
        path.join(output, 'browser-baseline.json'),
        JSON.stringify(results, null, 2) + '\n',
      );
    }
  }
  // One source-checked project per pilot product; fresh context for each.
  for (const product of [...new Set(pilot.map((p) => p.productSlug))]) {
    const target = pilot.find((p) => p.productSlug === product);
    const context = await contextFor(false),
      page = await context.newPage();
    const flow = {
      id: target.id,
      product,
      url: target.url,
      expectedConfiguration: inventory.records.find((r) => r.id === target.id)
        ?.configuration.path,
    };
    const configResponses = [];
    const consoleErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error')
        consoleErrors.push(message.text().slice(0, 700));
    });
    page.on('response', (response) => {
      if (
        /\/(designs|canonical-designs)\/[^/]+\/\d+\.json/.test(response.url())
      )
        configResponses.push({
          url: cleanUrl(response.url()),
          status: response.status(),
          contentType: response.headers()['content-type'],
        });
    });
    try {
      console.log('Checking editor entry ' + product + ' ' + target.id);
      await page.goto(base + target.url, {
        waitUntil: 'domcontentloaded',
        timeout: 90000,
      });
      await waitForContent(page, { id: target.id });
      const button = page
        .getByRole('button', { name: /^start with this design$/i })
        .first();
      await expect(button).toBeEnabled({ timeout: 45000 });
      const started = Date.now();
      await button.click();
      await page.waitForURL(/\/[^/]+\/select-size(?:\?|$)/, { timeout: 60000 });
      await expect(page.locator('canvas').first()).toBeVisible({
        timeout: 60000,
      });
      await page.waitForFunction(
        () => Boolean(window.__r3fGL && window.__r3fCamera),
        undefined,
        { timeout: 30000 },
      );
      flow.navigationToCanvasMs = Date.now() - started;
      flow.finalUrl = cleanUrl(page.url());
      flow.canvasReady = true;
      flow.expectedDesignFetched = configResponses.some(
        (r) =>
          r.url.endsWith('/' + target.id + '.json') &&
          r.status === 200 &&
          r.contentType?.includes('application/json'),
      );
      await page.waitForFunction(
        () => {
          const mesh = window.__r3fScene?.getObjectByName('headstone');
          if (!mesh?.geometry?.getAttribute('position')?.count) return false;
          for (let node = mesh; node; node = node.parent)
            if (!node.visible) return false;
          const materials = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];
          return materials.every((m) => !m?.map || Boolean(m.map.image));
        },
        undefined,
        { timeout: 45000 },
      );
      await page.evaluate(
        () =>
          new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          ),
      );
      flow.productMeshReady = true;
      const getProjectedBounds = () => {
        const mesh = window.__r3fScene?.getObjectByName('headstone');
        const camera = window.__r3fCamera;
        if (!mesh?.geometry || !camera) return null;
        mesh.geometry.computeBoundingBox();
        const box = mesh.geometry.boundingBox;
        if (!box) return null;
        const points = [];
        for (const x of [box.min.x, box.max.x])
          for (const y of [box.min.y, box.max.y])
            for (const z of [box.min.z, box.max.z]) {
              const point = box.min
                .clone()
                .set(x, y, z)
                .applyMatrix4(mesh.matrixWorld)
                .project(camera);
              points.push(point);
            }
        return {
          minX: Math.min(...points.map((p) => p.x)),
          maxX: Math.max(...points.map((p) => p.x)),
          minY: Math.min(...points.map((p) => p.y)),
          maxY: Math.max(...points.map((p) => p.y)),
          minZ: Math.min(...points.map((p) => p.z)),
          maxZ: Math.max(...points.map((p) => p.z)),
          opacity: Array.isArray(mesh.material)
            ? mesh.material.map((m) => m.opacity)
            : mesh.material?.opacity,
        };
      };
      flow.initialProjectedBounds = await page.evaluate(getProjectedBounds);
      await page.waitForFunction(
        () => {
          const mesh = window.__r3fScene?.getObjectByName('headstone'),
            camera = window.__r3fCamera;
          if (!mesh?.geometry?.boundingBox || !camera) return false;
          const box = mesh.geometry.boundingBox;
          for (const x of [box.min.x, box.max.x])
            for (const y of [box.min.y, box.max.y])
              for (const z of [box.min.z, box.max.z]) {
                const point = box.min
                  .clone()
                  .set(x, y, z)
                  .applyMatrix4(mesh.matrixWorld)
                  .project(camera);
                if (
                  !Number.isFinite(point.x) ||
                  Math.abs(point.x) > 1 ||
                  Math.abs(point.y) > 1 ||
                  point.z < -1 ||
                  point.z > 1
                )
                  return false;
              }
          return true;
        },
        undefined,
        { timeout: 15000 },
      );
      flow.productCenterInView = true;
      flow.productBoundsInView = true;
      flow.projectedBounds = await page.evaluate(getProjectedBounds);
      await page.evaluate(
        () =>
          new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          ),
      );
      const file = 'editor-' + product + '.png';
      await page.screenshot({ path: path.join(output, file) });
      flow.screenshot = file;
    } catch (error) {
      flow.error = error.message.slice(0, 500);
      flow.finalUrl = cleanUrl(page.url());
      const file = 'editor-' + product + '-failure.png';
      await page
        .screenshot({ path: path.join(output, file) })
        .then(() => {
          flow.screenshot = file;
        })
        .catch(() => {});
    }
    flow.configurationResponses = configResponses;
    flow.consoleErrors = consoleErrors;
    results.flows.push(flow);
    await context.close();
    await fs.writeFile(
      path.join(output, 'browser-baseline.json'),
      JSON.stringify(results, null, 2) + '\n',
    );
  }
} finally {
  await browser.close();
  await fs.writeFile(
    path.join(output, 'browser-baseline.json'),
    JSON.stringify(results, null, 2) + '\n',
  );
}
console.log(
  JSON.stringify({
    pages: results.pages.length,
    pageErrors: results.pages.filter((p) => p.error).length,
    editorChecks: results.flows.map((f) => ({
      product: f.product,
      canvasReady: f.canvasReady ?? false,
      error: f.error,
    })),
  }),
);
