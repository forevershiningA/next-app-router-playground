import { chromium } from 'playwright';
import fs from 'node:fs';

const TEST_DESIGNS = [
  { pid: '4', id: '1761266111708', name: 'Headstone Serpentine' },
  { pid: '5', id: '1672466366226', name: 'Bronze Plaque' },
  { pid: '22', id: '1626230401752', name: 'Mini Headstone' },
];

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
  await page.goto('http://localhost:3000/select-size', {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  await page.waitForSelector('#scene-root canvas', { timeout: 15000 });
  await page.waitForTimeout(2000);

  for (const item of TEST_DESIGNS) {
    console.log(`Loading ${item.name} (${item.id})...`);
    const res = await page.evaluate(async (id) => {
      return await window.__loadDesignById(id);
    }, item.id);
    console.log(`Load result for ${item.id}:`, res);

    await page.waitForFunction(() => {
      const store = window.__headstoneStore?.getState?.();
      return store && store.loading === false && store.baseSwapping === false;
    }, { timeout: 15000 }).catch(e => console.log('Wait caught:', e.message));

    await page.waitForTimeout(1500);

    // Deselect
    await page.evaluate(() => {
      const store = window.__headstoneStore?.getState?.();
      if (store?.setSelected) store.setSelected(null);
      if (store?.setSelectedInscriptionId) store.setSelectedInscriptionId(null);
    });

    const b64 = await page.evaluate(() => {
      const scene = window.__r3fScene;
      const gl = window.__r3fGL;
      const camera = window.__r3fCamera;
      const canvas = document.querySelector('#scene-root canvas');
      if (!scene || !gl || !camera || !canvas) return null;

      scene.traverse((obj) => {
        if (obj.isMesh) {
          const geo = obj.geometry;
          if (geo?.type === 'PlaneGeometry' && (geo.parameters?.width >= 5 || geo.parameters?.height >= 5)) {
            obj.visible = false;
          }
          if (geo?.type === 'SphereGeometry') obj.visible = false;
        }
        if (obj.isLineSegments || obj.type === 'SelectionBox') obj.visible = false;
      });

      scene.background = null;
      gl.setClearColor(0x000000, 0);
      gl.render(scene, camera);

      const w = canvas.width, h = canvas.height;
      const glCtx = canvas.getContext('webgl2') || canvas.getContext('webgl');
      const pixels = new Uint8Array(w * h * 4);
      glCtx.readPixels(0, 0, w, h, glCtx.RGBA, glCtx.UNSIGNED_BYTE, pixels);

      let minX = w, maxX = 0, minY = h, maxY = 0;
      for (let glY = 0; glY < h; glY++) {
        const cy = h - 1 - glY;
        for (let x = 0; x < w; x++) {
          if (pixels[(glY * w + x) * 4 + 3] > 15) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (cy < minY) minY = cy;
            if (cy > maxY) maxY = cy;
          }
        }
      }

      if (maxX <= minX || maxY <= minY) return null;

      const cropW = maxX - minX, cropH = maxY - minY;
      const c2d = document.createElement('canvas');
      c2d.width = cropW;
      c2d.height = cropH;
      c2d.getContext('2d').drawImage(canvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);
      return c2d.toDataURL('image/png').split(',')[1];
    });

    if (b64) {
      fs.writeFileSync(`tmp/test_3d_${item.pid}.png`, Buffer.from(b64, 'base64'));
      console.log(`Saved tmp/test_3d_${item.pid}.png`);
    } else {
      console.warn(`Failed to capture 3D for ${item.id}`);
    }
  }

  await browser.close();
  console.log('Done!');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
