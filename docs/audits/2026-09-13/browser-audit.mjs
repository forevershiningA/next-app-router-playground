import { chromium, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

const baseURL = 'http://localhost:3107';
const outputDir = 'docs/audits/2026-09-13';
const browser = await chromium.launch({ headless: true });
const results = [];
const onlyCheckout = process.argv.includes('--checkout-only');

try {
  // These requests contain no session, so auth must fail before any mutation.
  const apiContext = await browser.newContext();
  const checks = [
    ['GET', '/api/projects'], ['POST', '/api/projects'],
    ['DELETE', '/api/projects?id=audit-nonexistent'], ['POST', '/api/orders'],
    ['PATCH', '/api/orders/audit-nonexistent'], ['POST', '/api/checkout/stripe'],
    ['POST', '/api/share/create'],
  ];
  for (const [method, path] of onlyCheckout ? [] : checks) {
    const response = await apiContext.request.fetch(`${baseURL}${path}`, { method, data: {}, timeout: 30000 });
    results.push({ type: 'auth-boundary', method, path, status: response.status() });
    console.log(method, path, response.status());
  }
  await apiContext.close();

  for (const mobile of onlyCheckout ? [] : [false, true]) {
    const context = await browser.newContext({
      viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
      deviceScaleFactor: mobile ? 3 : 1, isMobile: mobile, hasTouch: mobile,
    });
    const page = await context.newPage();
    for (const path of ['/', '/select-material']) {
      const item = { type: 'render-smoke', mobile, path, errors: [], failed: [] };
      const onError = (error) => item.errors.push(error.message);
      const onResponse = (response) => { if (response.status() >= 400) item.failed.push({ status: response.status(), url: response.url() }); };
      page.on('pageerror', onError);
      page.on('response', onResponse);
      try {
        const response = await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
        item.status = response.status();
        await expect(page.locator('canvas').first()).toBeVisible({ timeout: 45000 });
        if (path !== '/') {
          await page.waitForFunction(() => window.__r3fGL?.info?.render?.triangles > 0, undefined, { timeout: 45000 });
          await expect(page.getByText('Loading scene...', { exact: true })).toBeHidden({ timeout: 45000 });
          await expect(page.getByText('Loading material…', { exact: true })).toBeHidden({ timeout: 45000 });
        }
        item.metrics = await page.evaluate(() => ({
          viewport: innerWidth, documentWidth: document.documentElement.scrollWidth,
          canvases: [...document.querySelectorAll('canvas')].map((canvas) => ({
            width: canvas.width, height: canvas.height, cssWidth: canvas.clientWidth, cssHeight: canvas.clientHeight,
          })),
          resources: performance.getEntriesByType('resource').reduce((sum, entry) => sum + (entry.transferSize || 0), 0),
          render: window.__r3fGL ? { ...window.__r3fGL.info.render } : null,
          gpuMemory: window.__r3fGL ? { ...window.__r3fGL.info.memory } : null,
        }));
        item.screenshot = `${mobile ? 'mobile' : 'desktop'}-${path === '/' ? 'home' : 'designer'}.png`;
        await page.screenshot({ path: `${outputDir}/${item.screenshot}` });
      } catch (error) { item.failure = error.message; }
      page.off('pageerror', onError); page.off('response', onResponse);
      results.push(item);
      console.log(JSON.stringify(item));
    }
    await context.close();
  }

  // Checkout UI with all backend calls and payment SDKs intercepted.
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const writes = [];
  await context.route('**/*', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin !== baseURL) return route.fulfill({ status: 200, contentType: 'application/javascript', body: '' });
    if (!url.pathname.startsWith('/api/')) return route.continue();
    let body = {};
    let status = 200;
    if (request.method() !== 'GET') {
      writes.push({ path: url.pathname, data: request.postDataJSON() });
      status = url.pathname === '/api/orders' ? 500 : 200;
      body = status === 500 ? { error: 'Audit simulated database failure' } : { success: true };
    } else if (url.pathname === '/api/auth/session') {
      body = { session: { accountId: 'audit', email: 'audit@example.invalid', role: 'client' } };
    } else if (url.pathname.startsWith('/api/projects/')) {
      body = { project: { id: 'audit-project', title: 'Audit sample', totalPriceCents: 110000 } };
    } else if (url.pathname === '/api/account/profile') {
      body = { profile: { firstName: 'Audit', lastName: 'Example' }, account: { email: 'audit@example.invalid' } };
    } else if (url.pathname === '/api/account/invoice') {
      body = { invoiceDetails: { address: '1 Sample Street', city: 'Perth', postcode: '6000', country: 'Australia' } };
    }
    return route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) });
  });
  const page = await context.newPage();
  await page.goto(`${baseURL}/my-account/designs/audit-project/buy`, { waitUntil: 'domcontentloaded' });
  await expect(page.locator('input[autocomplete="name"]')).toHaveValue('Audit Example');
  await page.getByRole('button', { name: 'Pay by Phone / BPAY / Cheque' }).click();
  await page.locator('textarea').fill('Audit delivery instructions');
  await page.getByRole('button', { name: 'Place Order', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Order Received!' })).toBeVisible();
  results.push({ type: 'A09-checkout-failure', confirmed: true, writes });
  await page.screenshot({ path: `${outputDir}/checkout-false-success.png` });
  console.log('A09: order API 500 still displays Order Received');

  await page.goto(`${baseURL}/my-account/designs/audit-project/buy?payment=success`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByRole('heading', { name: 'Order Received!' })).toBeVisible();
  results.push({ type: 'A01-checkout-query', confirmed: true });
  console.log('A01: payment=success alone displays Order Received');
  await context.close();
} finally {
  await writeFile(`${outputDir}/${onlyCheckout ? 'checkout-results' : 'browser-results'}.json`, JSON.stringify(results, null, 2));
  await browser.close();
}
