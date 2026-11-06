#!/usr/bin/env node
/**
 * 3D Catalog Products Renderer (Variant 2: Representative 3D Models)
 *
 * Captures pixel-perfect transparent 3D renders from the Forever Shining 3D configurator
 * (Three.js/WebGL), eliminates all outdoor grass and cropping artifacts, and composites
 * each product onto the Warm Minimal Studio architectural background.
 *
 * Usage:
 *   node scripts/generate-3d-catalog-products.mjs           # Preview mode (renders to tmp/studio-3d/)
 *   node scripts/generate-3d-catalog-products.mjs --apply   # Apply to public/webp/products/
 */

import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const ROOT = process.cwd();
const TMP_3D_DIR = path.join(ROOT, 'tmp', 'renders-3d');
const OUTPUT_DIR = path.join(ROOT, 'tmp', 'studio-3d');
const PUBLIC_DIR = path.join(ROOT, 'public', 'webp', 'products');
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

fs.mkdirSync(TMP_3D_DIR, { recursive: true });
fs.mkdirSync(OUTPUT_DIR, { recursive: true });

const PRODUCTS = [
  // PLAQUES
  {
    pid: '5',
    name: 'Bronze Plaque',
    designId: '1578436806381',
    scale: 0.82,
    shadowOffset: [8, 24],
    shadowBlur: 22,
    shadowOpacity: 0.35,
  },
  {
    pid: '30',
    name: 'Laser-etched Black Granite Colour',
    designId: '1578917832314',
    scale: 0.83,
    shadowOffset: [10, 28],
    shadowBlur: 26,
    shadowOpacity: 0.40,
  },
  {
    pid: '32',
    name: 'Full Colour Plaque',
    designId: '1734833707214',
    scale: 0.82,
    shadowOffset: [0, 30],
    shadowBlur: 26,
    shadowOpacity: 0.36,
  },
  {
    pid: '34',
    name: 'Traditional Engraved Plaque',
    designId: '1709635454417',
    scale: 0.83,
    shadowOffset: [10, 30],
    shadowBlur: 26,
    shadowOpacity: 0.40,
  },
  {
    pid: '52',
    name: 'YAG Lasered Stainless Steel Plaque',
    designId: '1670836691344',
    scale: 0.82,
    shadowOffset: [10, 28],
    shadowBlur: 24,
    shadowOpacity: 0.38,
  },

  // HEADSTONES
  {
    pid: '1',
    name: 'Stainless Steel Light Transmitting Headstone',
    route: '/stainless-steel-light-transmitting-headstone/select-size',
    inscriptions: [
      { text: 'In Loving Memory', font: 'monotype-corsiva', sizeMm: 34, color: '#ffffff', yPos: 55 },
      { text: 'THOMAS ANDERSON\n1945 - 2022', font: 'times-new-roman', sizeMm: 26, color: '#ffffff', yPos: -30 }
    ],
    showBase: true,
    scale: 0.83,
    shadowOffset: [0, 32],
    shadowBlur: 28,
    shadowOpacity: 0.38,
  },
  {
    pid: '4',
    name: 'Laser-etched Black Granite Headstone',
    designId: '1725130114917',
    showBase: true,
    scale: 0.83,
    shadowOffset: [0, 32],
    shadowBlur: 28,
    shadowOpacity: 0.40,
  },
  {
    pid: '22',
    name: 'Laser-etched Black Granite Mini Headstone',
    designId: '1606468591455',
    showBase: true,
    scale: 0.83,
    shadowOffset: [0, 32],
    shadowBlur: 28,
    shadowOpacity: 0.40,
  },
  {
    pid: '23',
    name: 'Stainless Steel Light Reflective Headstone',
    route: '/stainless-steel-light-reflective-headstone/select-size',
    inscriptions: [
      { text: 'In Loving Memory', font: 'monotype-corsiva', sizeMm: 34, color: '#ffffff', yPos: 55 },
      { text: 'ELIZABETH TAYLOR\n1952 - 2023', font: 'times-new-roman', sizeMm: 26, color: '#ffffff', yPos: -30 }
    ],
    showBase: true,
    scale: 0.83,
    shadowOffset: [0, 32],
    shadowBlur: 28,
    shadowOpacity: 0.38,
  },
  {
    pid: '124',
    name: 'Traditional Engraved Headstone',
    designId: '1726249924135',
    showBase: true,
    scale: 0.83,
    shadowOffset: [0, 32],
    shadowBlur: 28,
    shadowOpacity: 0.40,
  },

  // MONUMENTS
  {
    pid: '100',
    name: 'Laser-etched Black Granite Full Monument',
    designId: '1600603072791',
    scale: 0.84,
    shadowOffset: [16, 32],
    shadowBlur: 30,
    shadowOpacity: 0.42,
  },
  {
    pid: '101',
    name: 'Traditional Engraved Full Monument',
    designId: '1615903477262',
    scale: 0.84,
    shadowOffset: [16, 32],
    shadowBlur: 30,
    shadowOpacity: 0.42,
  },

  // URNS
  {
    pid: '2350',
    name: 'Stainless Steel Vitreous Enamel Inlaid Urn',
    route: '/stainless-steel-vitreous-enamel-inlaid-urn/select-size',
    scale: 0.84,
    shadowOffset: [0, 32],
    shadowBlur: 28,
    shadowOpacity: 0.38,
  },

  // PET MEMORIALS
  {
    pid: '8',
    name: 'Laser-Etched Pet Mini Headstone',
    designId: '1589791598418',
    showBase: true,
    scale: 0.83,
    shadowOffset: [0, 30],
    shadowBlur: 26,
    shadowOpacity: 0.40,
  },
  {
    pid: '9',
    name: 'Laser-Etched Pet Plaque',
    designId: '1738607735696',
    sanitizeInscriptions: [
      { text: 'In Loving Memory', font: 'monotype-corsiva', sizeMm: 28, yPos: 40 },
      { text: 'Forever In Our Hearts', font: 'times-new-roman', sizeMm: 20, yPos: -10 }
    ],
    scale: 0.82,
    shadowOffset: [8, 26],
    shadowBlur: 24,
    shadowOpacity: 0.38,
  },
  {
    pid: '135',
    name: 'Laser-Etched Pet Rock',
    designId: '1672839040121',
    scale: 0.84,
    shadowOffset: [0, 32],
    shadowBlur: 28,
    shadowOpacity: 0.40,
  },
];

async function captureTransparent3D(page, item) {
  const targetUrl = item.route ? `${BASE_URL}${item.route}` : `${BASE_URL}/select-size`;
  
  if (item.route) {
    await page.goto(targetUrl, { waitUntil: 'networkidle', timeout: 30000 });
  }

  await page.waitForSelector('#scene-root canvas', { timeout: 20000 });
  await page.waitForTimeout(1000);

  if (item.designId) {
    await page.evaluate(async (id) => {
      return await window.__loadDesignById(id);
    }, item.designId);
  }

  // Wait for loading to complete
  await page.waitForFunction(() => {
    const store = window.__headstoneStore?.getState?.();
    return store && store.loading === false && store.baseSwapping === false;
  }, { timeout: 15000 }).catch(() => {});

  await page.waitForTimeout(1500);

  // Apply customizations (base, custom inscriptions, sanitization)
  await page.evaluate((cfg) => {
    const store = window.__headstoneStore?.getState?.();
    if (!store) return;

    if (cfg.showBase && store.setShowBase) {
      store.setShowBase(true);
    }

    if (cfg.inscriptions && store.addInscriptionLine) {
      for (const line of cfg.inscriptions) {
        store.addInscriptionLine({
          text: line.text,
          font: line.font || 'times-new-roman',
          sizeMm: line.sizeMm || 28,
          color: line.color || '#ffffff',
          xPos: 0,
          yPos: line.yPos || 0,
          textAlign: 'center'
        });
      }
    }

    if (cfg.sanitizeInscriptions && store.inscriptions) {
      store.inscriptions.forEach((insc, idx) => {
        if (cfg.sanitizeInscriptions[idx]) {
          insc.text = cfg.sanitizeInscriptions[idx].text;
        }
      });
    }

    // Hide selection outlines
    if (store.setSelected) store.setSelected(null);
    if (store.setSelectedInscriptionId) store.setSelectedInscriptionId(null);
  }, item);

  await page.waitForTimeout(500);

  // Render transparent buffer and auto-crop bounds
  const b64 = await page.evaluate(() => {
    const scene = window.__r3fScene;
    const gl = window.__r3fGL;
    const camera = window.__r3fCamera;
    const canvas = document.querySelector('#scene-root canvas');
    if (!scene || !gl || !camera || !canvas) return null;

    scene.traverse((obj) => {
      if (obj.isMesh) {
        const geo = obj.geometry;
        if (geo?.type === 'PlaneGeometry' && (geo.parameters?.width >= 4 || geo.parameters?.height >= 4)) {
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

  return b64;
}

async function main() {
  const isApply = process.argv.includes('--apply');
  console.log(`=== 3D Catalog Products Renderer (Variant 2) [Apply: ${isApply}] ===`);

  const browser = await chromium.launch({
    headless: true,
    args: ['--use-gl=angle', '--use-angle=default', '--enable-webgl', '--enable-webgl2']
  });

  const page = await browser.newPage({ viewport: { width: 1280, height: 1280 } });

  // Pre-load designer
  console.log('Initializing 3D configurator on local server...');
  await page.goto(`${BASE_URL}/select-size`, { waitUntil: 'networkidle', timeout: 35000 });
  await page.waitForSelector('#scene-root canvas', { timeout: 20000 });
  await page.waitForTimeout(2000);

  const capturedList = [];

  for (const item of PRODUCTS) {
    console.log(`\n[PID ${item.pid}] Capturing 3D model: ${item.name}...`);
    try {
      const b64 = await captureTransparent3D(page, item);
      if (b64) {
        const outPath = path.join(TMP_3D_DIR, `APP_ID_${item.pid}.png`);
        fs.writeFileSync(outPath, Buffer.from(b64, 'base64'));
        console.log(`  ✓ Saved transparent cutout: ${outPath}`);
        capturedList.push(item);
      } else {
        console.warn(`  ✗ Failed to capture 3D cutout for PID ${item.pid}`);
      }
    } catch (err) {
      console.error(`  ✗ Error capturing PID ${item.pid}:`, err.message);
    }
  }

  await browser.close();
  console.log(`\nCaptured ${capturedList.length}/${PRODUCTS.length} 3D models.`);

  // Composite step with Python Pillow
  console.log('\n--- Compositing onto Warm Minimal Studio background ---');
  const pythonCmd = `python scripts/composite-3d-studio-products.py ${isApply ? '--apply' : ''}`;
  execSync(pythonCmd, { stdio: 'inherit', cwd: ROOT });

  console.log('\n=== All 3D Catalog Products Completed Successfully! ===');
}

main().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
