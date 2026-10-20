import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const base = process.env.HERO_MATCHED_BASE_URL ?? 'http://localhost:3102';
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname))
  throw new Error('Hero capture requires a local development server');
const destination = path.resolve('output/hero-product-intro');
await mkdir(destination, { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem('fs_ui_theme', 'day'));
  await page.goto(`${base}/select-product`, {
    waitUntil: 'domcontentloaded',
    timeout: 120000,
  });
  await page.waitForFunction(() => !!window.__headstoneStore, undefined, {
    timeout: 60000,
  });
  await page.getByRole('button', { name: /^Headstones\s*\(/ }).click();
  const product = page
    .getByRole('button', { name: /Traditional Engraved Headstone/i })
    .first();
  await product.waitFor({ timeout: 60000 });
  await product.hover();
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      Array.from(document.images).map((image) =>
        image.decode().catch(() => {}),
      ),
    );
    window.scrollTo(0, 0);
  });
  await page.addStyleTag({
    content: 'nextjs-portal{display:none!important}*{cursor:none!important}',
  });
  await page.waitForTimeout(1000);
  if (errors.length) throw new Error(errors.join('\n'));
  await page.screenshot({ path: path.join(destination, 'product-ui.png') });
  await writeFile(
    path.join(destination, 'capture.json'),
    JSON.stringify(
      {
        route: '/select-product',
        category: 'Headstones',
        target: 'Traditional Engraved Headstone',
        viewport: { width: 1440, height: 900 },
        errors,
      },
      null,
      2,
    ) + '\n',
  );
  console.log('Captured /select-product with Headstones selected');
} finally {
  await browser.close();
}
