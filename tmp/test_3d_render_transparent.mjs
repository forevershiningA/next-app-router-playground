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
  await page.goto('http://localhost:3000/laser-etched-black-granite-headstone/select-size', {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  await page.waitForSelector('#scene-root canvas', { timeout: 15000 });
  await page.waitForFunction(() => {
    const store = window.__headstoneStore?.getState?.();
    return store && store.loading === false;
  }, { timeout: 15000 });
  await page.waitForTimeout(2000);

  // Deselect all items to remove white selection corners
  await page.evaluate(() => {
    const store = window.__headstoneStore?.getState?.();
    if (store?.setSelected) store.setSelected(null);
    if (store?.setSelectedInscriptionId) store.setSelectedInscriptionId(null);
  });
  await page.waitForTimeout(300);

  // Render transparent product
  const transparentPngBase64 = await page.evaluate(() => {
    const scene = window.__r3fScene;
    const gl = window.__r3fGL;
    const camera = window.__r3fCamera;
    const canvas = document.querySelector('#scene-root canvas');
    if (!scene || !gl || !camera || !canvas) return null;

    // Traverse and hide environment / floor / sky
    const hiddenObjects = [];
    scene.traverse((obj) => {
      if (obj.isMesh) {
        const geo = obj.geometry;
        // Hide ground planes
        if (geo?.type === 'PlaneGeometry') {
          const params = geo.parameters;
          if (params && (params.width >= 5 || params.height >= 5)) {
            if (obj.visible) {
              obj.visible = false;
              hiddenObjects.push(obj);
            }
          }
        }
        // Hide sky / background meshes
        if (geo?.type === 'SphereGeometry') {
          if (obj.visible) {
            obj.visible = false;
            hiddenObjects.push(obj);
          }
        }
      }
      // Hide selection outlines & helpers
      if (obj.isLineSegments || obj.type === 'SelectionBox') {
        if (obj.visible) {
          obj.visible = false;
          hiddenObjects.push(obj);
        }
      }
    });

    const origBg = scene.background;
    scene.background = null;
    gl.setClearColor(0x000000, 0);

    // Render with transparent background
    gl.render(scene, camera);

    // Read pixels to get bounding box
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

    // Crop onto 2D canvas
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
    fs.writeFileSync('tmp/test_3d_headstone_transparent.png', Buffer.from(transparentPngBase64, 'base64'));
    console.log('Successfully saved tmp/test_3d_headstone_transparent.png!');
  } else {
    console.log('Failed to capture transparent 3D render');
  }

  await browser.close();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
