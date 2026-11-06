import { chromium } from 'playwright';
import fs from 'node:fs';

async function main() {
  console.log('Launching browser...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=default', '--enable-webgl', '--enable-webgl2']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1280, height: 960 },
    deviceScaleFactor: 1
  });
  
  const page = await context.newPage();
  console.log('Navigating to select-size...');
  await page.goto('http://localhost:3000/laser-etched-black-granite-headstone/select-size', {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  console.log('Waiting for #scene-root canvas...');
  await page.waitForSelector('#scene-root canvas', { timeout: 15000 });
  console.log('Canvas found!');
  
  // Wait for loading to finish
  await page.waitForFunction(() => {
    const store = window.__headstoneStore?.getState?.();
    return store && store.loading === false;
  }, { timeout: 20000 }).catch(e => console.log('Wait loading caught:', e.message));

  await page.waitForTimeout(2000);

  const state = await page.evaluate(() => {
    const store = window.__headstoneStore?.getState?.();
    return {
      productId: store?.productId,
      shape: store?.shape?.id,
      loading: store?.loading,
      hasScene: !!window.__r3fScene,
      hasGL: !!window.__r3fGL,
    };
  });
  console.log('State:', state);

  // Take screenshot of canvas
  const canvas = await page.$('#scene-root canvas');
  if (canvas) {
    const buf = await canvas.screenshot();
    fs.writeFileSync('tmp/test_headstone_canvas.png', buf);
    console.log('Saved tmp/test_headstone_canvas.png');
  }

  await browser.close();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
