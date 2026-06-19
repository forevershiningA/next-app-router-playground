import { expect, test, type Page, type TestInfo } from '@playwright/test';
import { DesignerPage } from './pages/DesignerPage';

type AuditMetrics = {
  viewport: { width: number; height: number };
  canvas: {
    count: number;
    cssWidth: number | null;
    cssHeight: number | null;
    backingWidth: number | null;
    backingHeight: number | null;
    nonBlank: boolean;
  };
  navigation: {
    ttfb: number;
    domContentLoaded: number;
    loadComplete: number;
  } | null;
  resources: {
    totalTransferSize: number;
    scriptTransferSize: number;
    imageTransferSize: number;
    textureTransferSize: number;
    resourceCount: number;
    largeResources: Array<{ name: string; size: number; duration: number; type: string }>;
    slowResources: Array<{ name: string; size: number; duration: number; type: string }>;
  };
  memory: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
  } | null;
  consoleErrors: string[];
  failedRequests: Array<{ url: string; method: string; failure: string | null }>;
};

async function collectDesignerAudit(page: Page): Promise<AuditMetrics> {
  return page.evaluate(() => {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight,
    };

    const canvas = document.querySelector('canvas') as HTMLCanvasElement | null;
    let nonBlank = false;
    if (canvas) {
      const gl =
        (window as unknown as { __r3fGL?: { getContext?: () => WebGLRenderingContext | WebGL2RenderingContext } })
          .__r3fGL?.getContext?.() ?? canvas.getContext('webgl2');
      if (gl) {
        const samplePoints = [
          [0.5, 0.5],
          [0.35, 0.45],
          [0.65, 0.45],
          [0.5, 0.3],
          [0.5, 0.7],
        ];
        const pixels = new Uint8Array(4);
        nonBlank = samplePoints.some(([x, y]) => {
          gl.readPixels(
            Math.floor(canvas.width * x),
            Math.floor(canvas.height * y),
            1,
            1,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            pixels,
          );
          return pixels.some((value) => value > 0);
        });
      }
    }

    const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    const toResourceSummary = (entry: PerformanceResourceTiming) => ({
      name: entry.name.replace(window.location.origin, ''),
      size: entry.transferSize || 0,
      duration: Math.round(entry.duration),
      type: entry.initiatorType,
    });

    const textureResources = resources.filter((entry) =>
      /\/(textures|hdri|models|shapes)\//.test(entry.name),
    );

    const memory = (performance as Performance & {
      memory?: { usedJSHeapSize: number; totalJSHeapSize: number };
    }).memory;

    return {
      viewport,
      canvas: {
        count: document.querySelectorAll('canvas').length,
        cssWidth: canvas?.getBoundingClientRect().width ?? null,
        cssHeight: canvas?.getBoundingClientRect().height ?? null,
        backingWidth: canvas?.width ?? null,
        backingHeight: canvas?.height ?? null,
        nonBlank,
      },
      navigation: nav
        ? {
            ttfb: Math.round(nav.responseStart - nav.requestStart),
            domContentLoaded: Math.round(nav.domContentLoadedEventEnd - nav.startTime),
            loadComplete: Math.round(nav.loadEventEnd - nav.startTime),
          }
        : null,
      resources: {
        totalTransferSize: resources.reduce((sum, entry) => sum + (entry.transferSize || 0), 0),
        scriptTransferSize: resources
          .filter((entry) => entry.initiatorType === 'script')
          .reduce((sum, entry) => sum + (entry.transferSize || 0), 0),
        imageTransferSize: resources
          .filter((entry) => entry.initiatorType === 'img')
          .reduce((sum, entry) => sum + (entry.transferSize || 0), 0),
        textureTransferSize: textureResources.reduce((sum, entry) => sum + (entry.transferSize || 0), 0),
        resourceCount: resources.length,
        largeResources: resources
          .filter((entry) => (entry.transferSize || 0) > 750_000)
          .map(toResourceSummary)
          .sort((a, b) => b.size - a.size)
          .slice(0, 10),
        slowResources: resources
          .filter((entry) => entry.duration > 1_500)
          .map(toResourceSummary)
          .sort((a, b) => b.duration - a.duration)
          .slice(0, 10),
      },
      memory: memory
        ? {
            usedJSHeapSize: memory.usedJSHeapSize,
            totalJSHeapSize: memory.totalJSHeapSize,
          }
        : null,
      consoleErrors: [],
      failedRequests: [],
    };
  });
}

async function runDesignerAudit(
  page: Page,
  testInfo: TestInfo,
  name: string,
  viewport: { width: number; height: number },
) {
  const consoleErrors: string[] = [];
  const failedRequests: AuditMetrics['failedRequests'] = [];

  page.on('console', (message) => {
    if (message.type() === 'error') {
      consoleErrors.push(message.text());
    }
  });
  page.on('requestfailed', (request) => {
    failedRequests.push({
      url: request.url(),
      method: request.method(),
      failure: request.failure()?.errorText ?? null,
    });
  });

  await page.setViewportSize(viewport);
  const designer = new DesignerPage(page);
  await designer.goto('/select-material');
  await designer.waitForReady();
  await expect(page.locator('canvas')).toBeVisible({ timeout: 30_000 });
  await page.waitForLoadState('networkidle');

  const metrics = await collectDesignerAudit(page);
  metrics.consoleErrors = consoleErrors;
  metrics.failedRequests = failedRequests;

  await testInfo.attach(`${name}-designer-audit.json`, {
    body: JSON.stringify(metrics, null, 2),
    contentType: 'application/json',
  });

  console.log(`[designer-audit:${name}]`, JSON.stringify(metrics, null, 2));

  expect(metrics.canvas.count).toBeGreaterThan(0);
  expect(metrics.failedRequests).toEqual([]);
}

test.describe('Designer performance and mobile audit', () => {
  test('desktop designer renders without failed resources and reports performance metrics', async ({ page }, testInfo) => {
    await runDesignerAudit(page, testInfo, 'desktop', { width: 1440, height: 900 });
  });

  test('mobile designer renders without failed resources and reports performance metrics', async ({ page }, testInfo) => {
    await runDesignerAudit(page, testInfo, 'mobile', { width: 390, height: 844 });
  });
});
