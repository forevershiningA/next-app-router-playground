import { chromium } from 'playwright';
import fs from 'node:fs';

async function main() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=default', '--enable-webgl', '--enable-webgl2']
  });

  const page = await browser.newPage({ viewport: { width: 1200, height: 1200 } });
  await page.goto('http://localhost:3000/bronze-plaque/select-size', { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForSelector('#scene-root canvas', { timeout: 15000 });
  await page.waitForTimeout(2000);

  // Add bronze inscriptions
  await page.evaluate(() => {
    const store = window.__headstoneStore?.getState?.();
    if (!store) return;

    // Clear existing
    if (store.inscriptions && store.deleteInscription) {
      [...store.inscriptions].forEach(i => store.deleteInscription(i.id));
    }

    // Add bronze lines
    store.addInscriptionLine({
      text: 'In Loving Memory',
      font: 'times-new-roman',
      sizeMm: 24,
      color: '#c7a06a',
      xPos: 0,
      yPos: 42,
      textAlign: 'center'
    });
    store.addInscriptionLine({
      text: 'ARTHUR PHILLIP',
      font: 'times-new-roman',
      sizeMm: 32,
      color: '#c7a06a',
      xPos: 0,
      yPos: 12,
      textAlign: 'center'
    });
    store.addInscriptionLine({
      text: '1940 – 2022',
      font: 'times-new-roman',
      sizeMm: 22,
      color: '#c7a06a',
      xPos: 0,
      yPos: -16,
      textAlign: 'center'
    });
    store.addInscriptionLine({
      text: 'Forever In Our Hearts',
      font: 'times-new-roman',
      sizeMm: 18,
      color: '#c7a06a',
      xPos: 0,
      yPos: -44,
      textAlign: 'center'
    });

    if (store.setSelected) store.setSelected(null);
  });

  await page.waitForTimeout(1500);

  const b64 = await page.evaluate(() => {
    const scene = window.__r3fScene;
    const gl = window.__r3fGL;
    const camera = window.__r3fCamera;
    const canvas = document.querySelector('#scene-root canvas');
    if (!scene || !gl || !camera || !canvas) return null;

    scene.traverse((obj) => {
      if (obj.isMesh) {
        const geo = obj.geometry;
        if (geo?.type === 'PlaneGeometry' && (geo.parameters?.width >= 4 || geo.parameters?.height >= 4)) obj.visible = false;
        if (geo?.type === 'SphereGeometry') obj.visible = false;
      }
      if (obj.isLineSegments || obj.type === 'SelectionBox') obj.visible = false;
      if (obj.userData?.previewImagePlaceholder) obj.visible = false;
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
    fs.writeFileSync('tmp/test_bronze_perfect.png', Buffer.from(b64, 'base64'));
    console.log('Saved tmp/test_bronze_perfect.png');
  }

  await browser.close();
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
