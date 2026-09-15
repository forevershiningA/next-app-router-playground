import { chromium, expect } from '@playwright/test';
import { writeFile } from 'node:fs/promises';

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
const page = await context.newPage();
const result = { errors: [], steps: [] };
page.on('pageerror', (error) => result.errors.push(error.message));
try {
  await page.goto('http://localhost:3107/select-material', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => window.__r3fGL?.info.render.triangles > 0, undefined, { timeout: 45000 });
  await page.getByText('African Black', { exact: true }).click();
  result.steps.push('Selected African Black');
  // Material selection may advance automatically in the current guided flow.
  if (!/select-size/.test(page.url())) {
    await Promise.race([
      page.waitForURL(/select-size/),
      page.getByRole('button', { name: /Next: Select Size/ }).click(),
    ]);
  }
  await expect(page).toHaveURL(/select-size/);
  result.steps.push('Opened size step');
  const width = page.getByRole('button', { name: 'Increase width by 10mm', exact: true });
  if (await width.count()) {
    await width.click();
    result.steps.push('Increased width');
  }
  await page.screenshot({ path: 'docs/audits/2026-09-13/mobile-size.png' });
  result.url = page.url();
  result.metrics = await page.evaluate(() => ({
    viewport: innerWidth, documentWidth: document.documentElement.scrollWidth,
    visibleButtons: [...document.querySelectorAll('button')].filter((button) => button.getBoundingClientRect().width > 0).map((button) => button.innerText || button.getAttribute('aria-label')).slice(-20),
  }));
  console.log(JSON.stringify(result));
} catch (error) {
  result.failure = error.message;
  result.url = page.url();
  console.log(JSON.stringify(result));
  process.exitCode = 1;
} finally {
  await writeFile('docs/audits/2026-09-13/mobile-flow-results.json', JSON.stringify(result, null, 2));
  await browser.close();
}
