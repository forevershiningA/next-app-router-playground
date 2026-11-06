import { chromium } from 'playwright';
import fs from 'node:fs';

const PLAQUE_ROUTES = [
  { pid: '5', slug: 'bronze-plaque', name: 'Bronze Plaque' },
  { pid: '30', slug: 'laser-etched-black-granite-plaque', name: 'Laser-etched Black Granite Colour' },
  { pid: '32', slug: 'full-colour-plaque', name: 'Full Colour Plaque' },
  { pid: '34', slug: 'traditional-engraved-plaque', name: 'Traditional Engraved Plaque' },
  { pid: '52', slug: 'yag-lasered-stainless-steel-plaque', name: 'YAG Lasered Stainless Steel Plaque' },
];

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=default', '--enable-webgl', '--enable-webgl2']
  });

  const page = await browser.newPage({ viewport: { width: 1200, height: 1200 } });

  for (const item of PLAQUE_ROUTES) {
    console.log(`Loading ${item.name} (/ ${item.slug} / select-size)...`);
    await page.goto(`http://localhost:3000/${item.slug}/select-size`, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForSelector('#scene-root canvas', { timeout: 15000 });
    await page.waitForTimeout(2000);

    const canvas = await page.$('#scene-root canvas');
    if (canvas) {
      const buf = await canvas.screenshot();
      fs.writeFileSync(`tmp/native_plaque_${item.pid}.png`, buf);
      console.log(`Saved tmp/native_plaque_${item.pid}.png`);
    }

    const state = await page.evaluate(() => {
      const s = window.__headstoneStore?.getState?.();
      return {
        productId: s?.productId,
        shape: s?.shape?.id,
        material: s?.material,
        border: s?.border?.id,
        materialsCount: s?.materials?.length,
        shapesCount: s?.shapes?.length,
      };
    });
    console.log(`State for ${item.pid}:`, state);
  }

  await browser.close();
  console.log('All 5 plaques inspected!');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
