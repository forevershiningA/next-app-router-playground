import { chromium } from 'playwright';
import fs from 'node:fs';

async function main() {
  console.log('Launching browser...');
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=default', '--enable-webgl', '--enable-webgl2']
  });
  
  const context = await browser.newContext({
    viewport: { width: 1200, height: 1200 },
    deviceScaleFactor: 1
  });
  
  const page = await context.newPage();
  console.log('Navigating to headstone designer...');
  await page.goto('http://localhost:3000/laser-etched-black-granite-headstone/select-shape', {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  console.log('Waiting for #scene-root canvas...');
  await page.waitForSelector('#scene-root canvas', { timeout: 20000 });
  await page.waitForTimeout(3000);

  // Check store state and R3F scene
  const info = await page.evaluate(() => {
    const store = window.__headstoneStore?.getState?.();
    return {
      productId: store?.productId,
      shape: store?.shape?.id,
      loading: store?.loading,
      hasScene: !!window.__r3fScene,
      hasGL: !!window.__r3fGL,
    };
  });
  console.log('Scene Info:', info);

  // Take screenshot of the canvas
  const canvas = await page.$('#scene-root canvas');
  if (canvas) {
    const buf = await canvas.screenshot();
    fs.writeFileSync('tmp/test_3d_headstone.png', buf);
    console.log('Saved tmp/test_3d_headstone.png');
  }

  await browser.close();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
