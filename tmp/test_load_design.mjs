import { chromium } from 'playwright';
import fs from 'node:fs';

async function main() {
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

  console.log('Loading design 1742574117321...');
  const res = await page.evaluate(async (id) => {
    return await window.__loadDesignById(id);
  }, '1742574117321');
  console.log('Load result:', res);

  // Wait for loading to finish
  await page.waitForFunction(() => {
    const store = window.__headstoneStore?.getState?.();
    return store && store.loading === false && store.baseSwapping === false;
  }, { timeout: 20000 }).catch(e => console.log('Wait caught:', e.message));

  await page.waitForTimeout(2000);

  // Deselect all
  await page.evaluate(() => {
    const store = window.__headstoneStore?.getState?.();
    if (store?.setSelected) store.setSelected(null);
    if (store?.setSelectedInscriptionId) store.setSelectedInscriptionId(null);
  });

  // Capture transparent
  const transparentPngBase64 = await page.evaluate(() => {
    const scene = window.__r3fScene;
    const gl = window.__r3fGL;
    const camera = window.__r3fCamera;
    const canvas = document.querySelector('#scene-root canvas');
    if (!scene || !gl || !camera || !canvas) return null;

    scene.traverse((obj) => {
      if (obj.isMesh) {
        const geo = obj.geometry;
        if (geo?.type === 'PlaneGeometry') {
          const params = geo.parameters;
          if (params && (params.width >= 5 || params.height >= 5)) {
            obj.visible = false;
          }
        }
        if (geo?.type === 'SphereGeometry') {
          obj.visible = false;
        }
      }
      if (obj.isLineSegments || obj.type === 'SelectionBox') {
        obj.visible = false;
      }
    });

    scene.background = null;
    gl.setClearColor(0x000000, 0);
    gl.render(scene, camera);

    const w = canvas.width;
    const h = canvas.height;
    const glCtx = canvas.getContext('webgl2') || canvas.getContext('webgl');
    const pixels = new Uint8Array(w * h * 4);
    glCtx.readPixels(0, 0, w, h, glCtx.RGBA, glCtx.UNSIGNED_BYTE, pixels);

    let minX = w, maxX = 0, minY = h, maxY = 0;
    for (let glY = 0; glY < h; glY++) {
      const cy = h - 1 - glY;
      for (let x = 0; x < w; x++) {
        const a = pixels[(glY * w + x) * 4 + 3];
        if (a > 15) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (cy < minY) minY = cy;
          if (cy > maxY) maxY = cy;
        }
      }
    }

    if (maxX <= minX || maxY <= minY) return null;

    const cropW = maxX - minX;
    const cropH = maxY - minY;
    const c2d = document.createElement('canvas');
    c2d.width = cropW;
    c2d.height = cropH;
    const ctx2d = c2d.getContext('2d');
    ctx2d.drawImage(canvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);

    return c2d.toDataURL('image/png').split(',')[1];
  });

  if (transparentPngBase64) {
    fs.writeFileSync('tmp/test_3d_design_transparent.png', Buffer.from(transparentPngBase64, 'base64'));
    console.log('Saved tmp/test_3d_design_transparent.png');
  }

  await browser.close();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
