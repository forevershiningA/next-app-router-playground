#!/usr/bin/env node
/**
 * Batch Screenshot Generator
 *
 * Uses Playwright to load each design in the 3D designer,
 * anonymize inscription text via route interception, wait for the
 * Three.js scene to finish rendering, then capture the WebGL canvas.
 *
 * Prerequisites:
 *   - Dev server running: pnpm dev
 *   - Playwright + Chromium installed: npx playwright install chromium
 *
 * Usage:
 *   node scripts/batch-screenshot.js                       # all designs
 *   node scripts/batch-screenshot.js --category=pets       # one category
 *   node scripts/batch-screenshot.js --ids=123,456,789     # specific IDs
 *   node scripts/batch-screenshot.js --limit=10            # first N designs
 *   node scripts/batch-screenshot.js --concurrency=2       # parallel tabs
 *   node scripts/batch-screenshot.js --out=screenshots     # custom output dir
 *   node scripts/batch-screenshot.js --dry-run             # list designs only
 *   node scripts/batch-screenshot.js --skip-existing       # skip already captured
 *   node scripts/batch-screenshot.js --width=1280 --height=960
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const { sanitizeInscription } = require('./utils/inscription-sanitizer');

// ─── Config ──────────────────────────────────────────────────────────────────

const ROOT = path.resolve(__dirname, '..');
const DESIGNS_DATA_PATH = path.join(ROOT, 'lib', 'saved-designs-data.ts');
const DEFAULT_OUTPUT_DIR = path.join(ROOT, 'public', 'screenshots', 'v2026-3d');
const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const DESIGNER_PATH = '/select-size';

// Designs that permanently fail (missing viewport dims, corrupt JSON, etc.)
const KNOWN_FAILURES = new Set([
  // Visibility failures (headstone not visible — missing viewport dims)
  '1587310089876', '1591313903992', '1595255616104', '1597617098967',
  '1598193944382', '1615779407165', '1620537504853', '1632791258768',
  '1636037970908', '1641476957186', '1644238842045', '1647828869487',
  '1647829703664', '1653887657613', '1654566043825', '1656992160525',
  '1661848089947', '1673300687155', '1726182269646', '1726754599177',
  '1726757840228', '1726807837626', '1727441794195', '1727444611151',
  '1727445171962', '1727533409906', '1727833230185', '1727927086942',
  '1728104658021', '1728354962938', '1735435908296', '1737599278768',
  '1751612915619', '1753878785927', '1758107003961', '1761405543829',
  // Canvas timeout failures
  '1730496721660', '1730771445921', '1730846919047', '1730875228895',
  '1731045326746', '1731546462793', '1731925181091', '1732340268903',
  '1732490707499', '1738461964558', '1748154427470',
]);

const DEFAULTS = {
  concurrency: 1,
  width: 1280,
  height: 960,
  renderWaitMs: 1500,
  maxRetries: 0,
  timeoutMs: 30_000,
};

// ─── CLI Args ────────────────────────────────────────────────────────────────

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { ...DEFAULTS };
  for (const arg of args) {
    if (arg === '--dry-run') { opts.dryRun = true; continue; }
    if (arg === '--skip-existing') { opts.skipExisting = true; continue; }
    if (arg === '--help' || arg === '-h') { opts.help = true; continue; }
    const [key, val] = arg.replace(/^--/, '').split('=');
    if (!val) continue;
    switch (key) {
      case 'category': opts.category = val; break;
      case 'ids': opts.ids = val.split(',').map(s => s.trim()); break;
      case 'limit': opts.limit = Number(val); break;
      case 'concurrency': opts.concurrency = Number(val); break;
      case 'out': opts.outputDir = val; break;
      case 'width': opts.width = Number(val); break;
      case 'height': opts.height = Number(val); break;
      case 'render-wait': opts.renderWaitMs = Number(val); break;
      case 'timeout': opts.timeoutMs = Number(val); break;
    }
  }
  opts.outputDir = opts.outputDir
    ? path.resolve(ROOT, opts.outputDir)
    : DEFAULT_OUTPUT_DIR;
  return opts;
}

function printUsage() {
  console.log(`
Batch Screenshot Generator — captures anonymized 3D renders of all designs.

Usage:
  node scripts/batch-screenshot.js [options]

Options:
  --category=NAME     Filter to a single category slug (e.g. "pets")
  --ids=ID1,ID2,...   Only process specific design IDs
  --limit=N           Process at most N designs
  --concurrency=N     Number of parallel browser tabs (default: 1)
  --out=DIR           Output directory (default: public/screenshots/v2026-3d)
  --width=N           Viewport width (default: 1280)
  --height=N          Viewport height (default: 960)
  --render-wait=MS    Extra wait after scene ready (default: 1500)
  --timeout=MS        Max wait per design (default: 30000)
  --skip-existing     Skip designs that already have screenshots
  --dry-run           List designs that would be processed, then exit
  --help              Show this help message
`);
}

// ─── Design Data Parser ──────────────────────────────────────────────────────

function loadDesignIds(opts) {
  const raw = fs.readFileSync(DESIGNS_DATA_PATH, 'utf8');

  // Extract all design ID keys from the SAVED_DESIGNS object
  const idRegex = /"(\d{10,15})":\s*\{/g;
  const allIds = [];
  let match;
  while ((match = idRegex.exec(raw)) !== null) {
    allIds.push(match[1]);
  }

  let candidates = allIds;

  if (opts.ids) {
    candidates = opts.ids.filter(id => allIds.includes(id));
  } else if (opts.category) {
    // Parse category for each design — look for category field near the ID
    const catLower = opts.category.toLowerCase();
    const filtered = [];
    for (const id of allIds) {
      // Find the block for this ID and extract category
      const idPos = raw.indexOf(`"${id}":`);
      if (idPos === -1) continue;
      const chunk = raw.substring(idPos, idPos + 800);
      const catMatch = chunk.match(/"category":\s*"([^"]+)"/);
      if (catMatch) {
        const designCat = catMatch[1].toLowerCase();
        // Match on slug or partial
        if (designCat === catLower || designCat.includes(catLower)) {
          filtered.push(id);
        }
      }
      // Also check productSlug for product-level filtering
      const prodMatch = chunk.match(/"productSlug":\s*"([^"]+)"/);
      if (prodMatch && prodMatch[1].toLowerCase() === catLower) {
        if (!filtered.includes(id)) filtered.push(id);
      }
    }
    candidates = filtered;
  }

  // Filter to only designs that have a canonical JSON file on disk
  const available = [];
  const missing = [];
  for (const id of candidates) {
    if (designJsonExists(id)) {
      available.push(id);
    } else {
      missing.push(id);
    }
  }

  if (missing.length > 0) {
    console.log(`\nNote: ${missing.length} designs have no canonical JSON (not yet converted) — skipped.`);
    console.log(`      ${available.length} designs have JSON files and will be processed.`);
  }

  return available;
}

/** Check if a canonical design JSON exists on disk */
function designJsonExists(designId) {
  const p3dPath = path.join(ROOT, 'public', 'designs', 'v2026-p3d', `${designId}.json`);
  const mainPath = path.join(ROOT, 'public', 'designs', 'v2026', `${designId}.json`);
  const canonicalPath = path.join(ROOT, 'public', 'canonical-designs', 'v2026', `${designId}.json`);
  return fs.existsSync(p3dPath) || fs.existsSync(mainPath) || fs.existsSync(canonicalPath);
}

function loadDesignMetadata(designId) {
  const raw = fs.readFileSync(DESIGNS_DATA_PATH, 'utf8');
  const idPos = raw.indexOf(`"${designId}":`);
  if (idPos === -1) return null;
  const chunk = raw.substring(idPos, idPos + 1200);
  const catMatch = chunk.match(/"category":\s*"([^"]+)"/);
  const titleMatch = chunk.match(/"title":\s*"([^"]+)"/);
  return {
    category: catMatch?.[1] || 'unknown',
    title: titleMatch?.[1] || 'Unknown',
  };
}

// ─── Inscription Anonymizer (for route interception) ─────────────────────────

function anonymizeDesignJson(jsonStr, designId) {
  try {
    const data = JSON.parse(jsonStr);
    if (!data.elements?.inscriptions) return jsonStr;

    const meta = loadDesignMetadata(designId);
    const category = meta?.category || '';

    for (const insc of data.elements.inscriptions) {
      if (insc.text) {
        insc.text = sanitizeInscription(insc.text, category);
      }
    }
    return JSON.stringify(data);
  } catch {
    return jsonStr;
  }
}

// ─── Screenshot Capture ──────────────────────────────────────────────────────

async function captureDesign(context, designId, opts, workerIdx) {
  const tag = `[W${workerIdx}][${designId}]`;
  const page = await context.newPage();

  try {
    // Set up route interception BEFORE navigating
    // Intercept design JSON fetches to anonymize inscriptions
    await page.route(/\/(designs|canonical-designs)\/v2026(-p3d)?\/\d+\.json/, async (route) => {
      const url = route.request().url();
      const idMatch = url.match(/\/(\d+)\.json/);
      const reqId = idMatch?.[1];

      // Fulfill from local filesystem (faster than letting the dev server serve it)
      const p3dPath = path.join(ROOT, 'public', 'designs', 'v2026-p3d', `${reqId}.json`);
      const mainPath = path.join(ROOT, 'public', 'designs', 'v2026', `${reqId}.json`);
      const canonicalPath = path.join(ROOT, 'public', 'canonical-designs', 'v2026', `${reqId}.json`);

      let filePath = null;
      if (url.includes('v2026-p3d') && fs.existsSync(p3dPath)) {
        filePath = p3dPath;
      } else if (url.includes('canonical-designs') && fs.existsSync(canonicalPath)) {
        filePath = canonicalPath;
      } else if (fs.existsSync(mainPath)) {
        filePath = mainPath;
      } else if (fs.existsSync(p3dPath)) {
        filePath = p3dPath;
      } else if (fs.existsSync(canonicalPath)) {
        filePath = canonicalPath;
      }

      if (filePath) {
        const raw = fs.readFileSync(filePath, 'utf8');
        const anonymized = anonymizeDesignJson(raw, reqId);
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: anonymized,
        });
      } else {
        // Let the request continue normally (it'll 404 on the server)
        await route.continue();
      }
    });

    // Navigate to the designer page
    console.log(`${tag} Navigating to designer...`);
    await page.goto(`${BASE_URL}${DESIGNER_PATH}`, {
      waitUntil: 'networkidle',
      timeout: opts.timeoutMs,
    });

    // Wait for the 3D canvas to appear
    await page.waitForSelector('#scene-root canvas', { timeout: opts.timeoutMs });

    // Wait a moment for the initial scene to finish loading
    await page.waitForTimeout(2000);

    // Trigger design loading
    console.log(`${tag} Loading design...`);
    const loadResult = await page.evaluate(async (id) => {
      if (typeof window.__loadDesignById === 'function') {
        return await window.__loadDesignById(id);
      }
      throw new Error('__loadDesignById not available on window');
    }, designId);

    if (!loadResult?.success) {
      console.warn(`${tag} Failed to load: ${loadResult?.message}`);
      await page.close();
      return { designId, success: false, error: loadResult?.message || 'Load failed' };
    }

    // Wait for the 3D scene to finish rendering.
    // First wait for loading === false (the primary gate), then give baseSwapping
    // a generous but bounded window — some designs have a bug where baseSwapping
    // never resets because the texture preload callback doesn't fire.
    console.log(`${tag} Waiting for render...`);
    try {
      await page.waitForFunction(() => {
        const store = window.__headstoneStore;
        if (!store) return false;
        return store.getState().loading === false;
      }, { timeout: opts.timeoutMs });
    } catch {
      // Force-clear loading — shape/texture preload may have failed (e.g. missing SVG)
      console.log(`${tag} loading stuck — force-clearing`);
      await page.evaluate(() => {
        const store = window.__headstoneStore;
        if (store?.getState()?.setLoading) {
          store.getState().setLoading(false);
        }
      });
      await page.waitForTimeout(1000);
    }

    // Give baseSwapping up to 8s to resolve, then force-clear it
    try {
      await page.waitForFunction(() => {
        const store = window.__headstoneStore;
        if (!store) return true;
        return store.getState().baseSwapping === false;
      }, { timeout: 8000 });
    } catch {
      console.log(`${tag} baseSwapping stuck — force-clearing`);
      await page.evaluate(() => {
        const store = window.__headstoneStore;
        if (store?.getState()?.setBaseSwapping) {
          store.getState().setBaseSwapping(false);
        }
      });
      await page.waitForTimeout(500);
    }

    // Extra wait for textures, animations, and final compositing
    await page.waitForTimeout(opts.renderWaitMs);

    // Deselect all items to hide selection outlines (RotatingBoxOutline, SelectionBox)
    await page.evaluate(() => {
      const store = window.__headstoneStore;
      if (!store) return;
      const s = store.getState();
      if (s.setSelected) s.setSelected(null);
      if (s.setSelectedInscriptionId) s.setSelectedInscriptionId(null);
      if (s.setSelectedAdditionId) s.setSelectedAdditionId(null);
      if (s.setSelectedMotifId) s.setSelectedMotifId(null);
      if (s.setSelectedImageId) s.setSelectedImageId(null);
      if (s.setSelectedEmblemId) s.setSelectedEmblemId(null);
    });

    // Brief wait for deselection outlines to disappear
    await page.waitForTimeout(200);

    // Verify the headstone is actually visible (not microscopic due to missing viewport dims)
    const headstoneVisible = await page.evaluate(() => {
      const canvas = document.querySelector('#scene-root canvas');
      if (!canvas) return false;
      // Sample pixels in the center region — if ALL are sky-blue, the headstone didn't render
      const ctx = canvas.getContext('webgl2') || canvas.getContext('webgl');
      if (!ctx) return true; // can't check, assume OK
      const w = canvas.width, h = canvas.height;
      const buf = new Uint8Array(4);
      // Check a few points in the center where the headstone should be
      const testPoints = [
        [Math.floor(w * 0.5), Math.floor(h * 0.5)],
        [Math.floor(w * 0.4), Math.floor(h * 0.4)],
        [Math.floor(w * 0.6), Math.floor(h * 0.6)],
      ];
      let allSky = true;
      for (const [x, y] of testPoints) {
        ctx.readPixels(x, h - y, 1, 1, ctx.RGBA, ctx.UNSIGNED_BYTE, buf);
        // Sky gradient is roughly rgb(160-200, 195-220, 230-255)
        const isSky = buf[2] > 200 && buf[1] > 170 && buf[0] > 130 && buf[0] < 210;
        if (!isSky) { allSky = false; break; }
      }
      return !allSky;
    });

    if (!headstoneVisible) {
      console.warn(`${tag} Headstone not visible (likely missing viewport dims) — skipping`);
      await page.close();
      return { designId, success: false, error: 'Headstone not visible in render' };
    }

    // ── Strip environment for clean thumbnail ──────────────────────────
    // Hide grass floor, sky background, fog, sun rays, particles.
    // Set transparent background so the PNG has alpha transparency.
    await page.evaluate(() => {
      // Scene is exposed on window by Scene.tsx for external tooling
      const scene = window.__r3fScene;
      const gl = window.__r3fGL;
      if (!scene) { console.warn('__r3fScene not found'); return; }

      scene.traverse((obj) => {
        if (obj.isMesh) {
          const geo = obj.geometry;
          const mat = obj.material;
          // Hide grass floor planes (large ground meshes)
          if (geo?.type === 'PlaneGeometry') {
            const params = geo.parameters;
            if (params && (params.width >= 10 || params.height >= 10)) {
              obj.visible = false;
            }
          }
          // Hide sky domes: any SphereGeometry rendered on BackSide (GradientBackground, AtmosphericSky)
          if (geo?.type === 'SphereGeometry' && mat?.side === 1) {
            obj.visible = false;
          }
          // Hide SunRays and any ShaderMaterial with sun/ray-related uniforms
          if (mat?.type === 'ShaderMaterial' && (mat.uniforms?.uInnerColor || mat.uniforms?.colorTop)) {
            obj.visible = false;
          }
        }
        // Hide ContactShadows group (drei renders them as a group with an ortho camera child)
        if (obj.isGroup && obj.children?.some(c => c.isOrthographicCamera)) {
          obj.visible = false;
        }
        // Hide Sparkles / particle systems
        if (obj.isPoints) {
          obj.visible = false;
        }
        // Hide SelectionBox outlines (LineSegments with AdditiveBlending, high renderOrder)
        if (obj.isLineSegments) {
          obj.visible = false;
        }
        // Hide Clouds (drei Cloud uses instancedMesh or sprite groups)
        if (obj.isGroup && obj.children?.some(c => c.isSprite || c.isInstancedMesh)) {
          obj.visible = false;
        }
      });

      // Remove fog
      scene.fog = null;

      // Set transparent background
      scene.background = null;
      if (gl) {
        gl.setClearColor(0x000000, 0);
      }
    });

    // Force a few render frames for the scene changes to take effect
    await page.evaluate(() => new Promise(resolve => {
      requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    }));
    await page.waitForTimeout(300);

    // Hide ALL UI chrome overlaying the 3D canvas.
    // The DOM structure is: #scene-root > div.relative > [ProductNameHeader, div>Canvas]
    // Plus overlay portals (CheckPricePanel, MotifOverlayPanel, SelectSizeOverlayCard)
    // are portaled into #scene-root as well.
    await page.evaluate(() => {
      // 1. Hide siblings of #scene-root (sidebar, nav, other layout)
      const sceneRoot = document.getElementById('scene-root');
      if (!sceneRoot) return;
      const parent = sceneRoot.parentElement;
      if (parent) {
        for (const child of parent.children) {
          if (child.id !== 'scene-root') {
            child.style.setProperty('visibility', 'hidden', 'important');
          }
        }
      }

      // 2. Inside #scene-root, hide everything except the canvas itself.
      //    Walk all descendants; skip <canvas> elements and their direct container.
      const canvas = sceneRoot.querySelector('canvas');
      if (!canvas) return;

      // Build set of ancestors from canvas up to scene-root (keep these visible)
      const canvasAncestors = new Set();
      let el = canvas;
      while (el && el !== sceneRoot) {
        canvasAncestors.add(el);
        el = el.parentElement;
      }

      // Hide direct children of scene-root that are NOT canvas ancestors
      for (const child of sceneRoot.children) {
        if (!canvasAncestors.has(child)) {
          child.style.setProperty('visibility', 'hidden', 'important');
        }
      }

      // Inside the canvas-ancestor subtree, hide siblings at each level
      for (const ancestor of canvasAncestors) {
        if (ancestor === canvas) continue; // don't touch the canvas itself
        const p = ancestor.parentElement;
        if (!p || p === sceneRoot) continue; // already handled scene-root children
        for (const sibling of p.children) {
          if (sibling !== ancestor && !canvasAncestors.has(sibling)) {
            sibling.style.setProperty('visibility', 'hidden', 'important');
          }
        }
      }

      // 3. Catch any remaining absolutely/fixed positioned UI elements
      sceneRoot.querySelectorAll('button, nav, [role="button"], h1, h2, a[class]').forEach(node => {
        if (node.tagName !== 'CANVAS' && !node.closest('canvas')) {
          node.style.setProperty('visibility', 'hidden', 'important');
        }
      });
    });

    // Brief wait for repaint
    await page.waitForTimeout(100);

    // Force a couple of render frames so text meshes fully resolve
    await page.evaluate(() => new Promise(resolve => {
      requestAnimationFrame(() => requestAnimationFrame(resolve));
    }));

    // Capture the canvas element (Playwright composites only the element, not page overlays)
    const canvas = await page.$('#scene-root canvas');
    if (!canvas) {
      console.warn(`${tag} Canvas not found after render`);
      await page.close();
      return { designId, success: false, error: 'Canvas not found' };
    }

    // Auto-crop: find the tight bounding box of the monument using alpha channel.
    // Read pixels from WebGL and detect non-transparent content bounds, then
    // produce a cropped transparent PNG and a JPEG thumbnail with dark background.
    const croppedImages = await page.evaluate(() => {
      const glCanvas = document.querySelector('#scene-root canvas');
      if (!glCanvas) return null;
      const gl = glCanvas.getContext('webgl2') || glCanvas.getContext('webgl');
      if (!gl) return null;

      const w = glCanvas.width;
      const h = glCanvas.height;
      const pixels = new Uint8Array(w * h * 4);
      gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

      // WebGL readPixels returns bottom-to-top, so y is flipped.
      // Detect monument pixels by alpha > threshold.
      const ALPHA_THRESHOLD = 10;
      let minX = w, maxX = 0, minY = h, maxY = 0;
      for (let glY = 0; glY < h; glY++) {
        const canvasY = h - 1 - glY; // flip to canvas coords (top-to-bottom)
        for (let x = 0; x < w; x++) {
          const idx = (glY * w + x) * 4;
          const a = pixels[idx + 3];
          if (a > ALPHA_THRESHOLD) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (canvasY < minY) minY = canvasY;
            if (canvasY > maxY) maxY = canvasY;
          }
        }
      }

      if (maxX <= minX || maxY <= minY) return null; // nothing found

      // Add padding (4% of each dimension, at least 8px)
      const padX = Math.max(8, Math.floor((maxX - minX) * 0.04));
      const padY = Math.max(8, Math.floor((maxY - minY) * 0.04));
      minX = Math.max(0, minX - padX);
      minY = Math.max(0, minY - padY);
      maxX = Math.min(w, maxX + padX);
      maxY = Math.min(h, maxY + padY);

      const cropW = maxX - minX;
      const cropH = maxY - minY;

      // Draw the WebGL canvas onto a 2D canvas and crop (preserves transparency)
      const crop2d = document.createElement('canvas');
      crop2d.width = cropW;
      crop2d.height = cropH;
      const ctx = crop2d.getContext('2d');
      ctx.drawImage(glCanvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);

      // Full-size transparent PNG (base64)
      const fullPng = crop2d.toDataURL('image/png').split(',')[1];

      // Small JPEG thumbnail with dark background (JPEG has no transparency)
      const THUMB_WIDTH = 400;
      const thumbRatio = cropH / cropW;
      const thumbH = Math.round(THUMB_WIDTH * thumbRatio);
      const thumb2d = document.createElement('canvas');
      thumb2d.width = THUMB_WIDTH;
      thumb2d.height = thumbH;
      const tctx = thumb2d.getContext('2d');
      // Fill dark background for JPEG
      tctx.fillStyle = '#1a1a1a';
      tctx.fillRect(0, 0, THUMB_WIDTH, thumbH);
      tctx.drawImage(crop2d, 0, 0, THUMB_WIDTH, thumbH);
      const thumbJpg = thumb2d.toDataURL('image/jpeg', 0.85).split(',')[1];

      return { fullPng, thumbJpg, cropW, cropH };
    });

    // Save cropped screenshots
    const outDir = opts.outputDir;
    fs.mkdirSync(outDir, { recursive: true });
    const fullPath = path.join(outDir, `${designId}.png`);

    if (croppedImages?.fullPng) {
      fs.writeFileSync(fullPath, Buffer.from(croppedImages.fullPng, 'base64'));
      if (croppedImages.thumbJpg) {
        const thumbPath = path.join(outDir, `${designId}_small.jpg`);
        fs.writeFileSync(thumbPath, Buffer.from(croppedImages.thumbJpg, 'base64'));
      }
      console.log(`${tag} ✓ Saved cropped screenshot (${croppedImages.cropW}×${croppedImages.cropH})`);
    } else {
      // Fallback: save uncropped canvas screenshot
      const screenshotBuffer = await canvas.screenshot({ type: 'png' });
      fs.writeFileSync(fullPath, screenshotBuffer);
      console.log(`${tag} ✓ Saved screenshot (uncropped fallback)`);

      // Uncropped thumbnail
      const thumbBuffer = await page.evaluate(() => {
        const canvas = document.querySelector('#scene-root canvas');
        if (!canvas) return null;
        const THUMB_WIDTH = 400;
        const ratio = canvas.height / canvas.width;
        const thumbHeight = Math.round(THUMB_WIDTH * ratio);
        const offscreen = document.createElement('canvas');
        offscreen.width = THUMB_WIDTH;
        offscreen.height = thumbHeight;
        const ctx = offscreen.getContext('2d');
        ctx.drawImage(canvas, 0, 0, THUMB_WIDTH, thumbHeight);
        return offscreen.toDataURL('image/jpeg', 0.85).split(',')[1];
      });
      if (thumbBuffer) {
        const thumbPath = path.join(outDir, `${designId}_small.jpg`);
        fs.writeFileSync(thumbPath, Buffer.from(thumbBuffer, 'base64'));
      }
    }

    console.log(`${tag} ✓ Saved screenshot`);
    await page.close();
    return { designId, success: true, fullPath };

  } catch (err) {
    console.error(`${tag} ✗ Error: ${err.message}`);
    try { await page.close(); } catch {}
    return { designId, success: false, error: err.message };
  }
}

// ─── Worker Pool ─────────────────────────────────────────────────────────────

async function processDesigns(browser, designIds, opts) {
  const results = { success: 0, failed: 0, skipped: 0, errors: [] };
  const total = designIds.length;
  let processed = 0;
  const errorsPath = path.join(opts.outputDir, '_errors.json');

  // Save errors incrementally so we don't lose data on crash
  function saveErrors() {
    if (results.errors.length > 0) {
      fs.writeFileSync(errorsPath, JSON.stringify(results.errors, null, 2));
    }
  }

  // Process in batches based on concurrency
  const queue = [...designIds];

  // Refresh context every N captures to prevent memory accumulation
  const CONTEXT_REFRESH_INTERVAL = 50;

  async function worker(workerIdx) {
    let context = await browser.newContext({
      viewport: { width: opts.width, height: opts.height },
      deviceScaleFactor: 1,
    });
    let capturesSinceRefresh = 0;

    while (queue.length > 0) {
      const designId = queue.shift();
      if (!designId) break;

      // Skip known permanently-failing designs
      if (KNOWN_FAILURES.has(designId)) {
        processed++;
        results.skipped++;
        console.log(`[W${workerIdx}][${designId}] Skipped (known failure) [${processed}/${total}]`);
        continue;
      }

      // Skip if already exists
      if (opts.skipExisting) {
        const existing = path.join(opts.outputDir, `${designId}.png`);
        if (fs.existsSync(existing)) {
          processed++;
          results.skipped++;
          console.log(`[W${workerIdx}][${designId}] Skipped (exists) [${processed}/${total}]`);
          continue;
        }
      }

      // Refresh browser context periodically to free WebGL memory
      if (capturesSinceRefresh >= CONTEXT_REFRESH_INTERVAL) {
        console.log(`[W${workerIdx}] Refreshing browser context (after ${capturesSinceRefresh} captures)...`);
        try { await context.close(); } catch {}
        context = await browser.newContext({
          viewport: { width: opts.width, height: opts.height },
          deviceScaleFactor: 1,
        });
        capturesSinceRefresh = 0;
      }

      let success = false;
      for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
        if (attempt > 0) {
          console.log(`[W${workerIdx}][${designId}] Retry ${attempt}/${opts.maxRetries}...`);
        }

        try {
          const result = await captureDesign(context, designId, opts, workerIdx);
          if (result.success) {
            success = true;
            results.success++;
            capturesSinceRefresh++;
            break;
          }

          if (attempt === opts.maxRetries) {
            results.failed++;
            results.errors.push({ id: designId, error: result.error });
            saveErrors();
            // Refresh context after a failed design to prevent corruption
            try { await context.close(); } catch {}
            context = await browser.newContext({
              viewport: { width: opts.width, height: opts.height },
              deviceScaleFactor: 1,
            });
            capturesSinceRefresh = 0;
          }
        } catch (err) {
          // Browser context may have crashed — recreate it
          console.error(`[W${workerIdx}][${designId}] Context error: ${err.message}`);
          try { await context.close(); } catch {}
          context = await browser.newContext({
            viewport: { width: opts.width, height: opts.height },
            deviceScaleFactor: 1,
          });
          capturesSinceRefresh = 0;
          if (attempt === opts.maxRetries) {
            results.failed++;
            results.errors.push({ id: designId, error: `Context crash: ${err.message}` });
            saveErrors();
          }
        }
      }

      processed++;
      const pct = ((processed / total) * 100).toFixed(1);
      console.log(`Progress: ${processed}/${total} (${pct}%) — ✓${results.success} ✗${results.failed} ⊘${results.skipped}`);
    }

    try { await context.close(); } catch {}
  }

  // Launch workers
  const workers = [];
  for (let i = 0; i < opts.concurrency; i++) {
    workers.push(worker(i));
  }
  await Promise.all(workers);

  return results;
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const opts = parseArgs();

  if (opts.help) {
    printUsage();
    process.exit(0);
  }

  console.log('═══════════════════════════════════════════════════');
  console.log('  Batch Screenshot Generator');
  console.log('═══════════════════════════════════════════════════');

  // Load design IDs
  let designIds = loadDesignIds(opts);

  if (opts.limit) {
    designIds = designIds.slice(0, opts.limit);
  }

  console.log(`\nDesigns to process: ${designIds.length}`);
  console.log(`Output directory:   ${opts.outputDir}`);
  console.log(`Viewport:           ${opts.width}×${opts.height}`);
  console.log(`Concurrency:        ${opts.concurrency}`);
  console.log(`Render wait:        ${opts.renderWaitMs}ms`);

  if (designIds.length === 0) {
    console.log('\nNo designs found matching filters.');
    process.exit(0);
  }

  if (opts.dryRun) {
    console.log('\n── Dry Run (designs that would be processed) ──');
    for (const id of designIds) {
      const meta = loadDesignMetadata(id);
      console.log(`  ${id}  ${meta?.category || '?'}  ${meta?.title || '?'}`);
    }
    console.log(`\nTotal: ${designIds.length} designs`);
    process.exit(0);
  }

  // Check dev server is running
  try {
    const res = await fetch(`${BASE_URL}/select-size`);
    if (!res.ok) throw new Error(`Status ${res.status}`);
  } catch (err) {
    console.error(`\n✗ Dev server not reachable at ${BASE_URL}`);
    console.error('  Start it first: pnpm dev');
    process.exit(1);
  }

  // Launch browser
  const BROWSER_ARGS = [
    '--disable-gpu-sandbox',
    '--use-gl=angle',
    '--use-angle=swiftshader',
    '--enable-webgl',
    '--disable-dev-shm-usage',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-extensions',
    '--disable-background-networking',
  ];

  // Process in chunks, relaunching the browser between chunks to prevent OOM
  const CHUNK_SIZE = 200;
  const chunks = [];
  for (let i = 0; i < designIds.length; i += CHUNK_SIZE) {
    chunks.push(designIds.slice(i, i + CHUNK_SIZE));
  }

  const startTime = Date.now();
  const totalResults = { success: 0, failed: 0, skipped: 0, errors: [] };

  for (let ci = 0; ci < chunks.length; ci++) {
    console.log(`\n── Chunk ${ci + 1}/${chunks.length} (${chunks[ci].length} designs) ──`);
    console.log('Launching Chromium...');

    let browser;
    try {
      browser = await chromium.launch({ headless: true, args: BROWSER_ARGS });
    } catch (err) {
      console.error(`Failed to launch browser: ${err.message}`);
      continue;
    }

    try {
      const results = await processDesigns(browser, chunks[ci], opts);
      totalResults.success += results.success;
      totalResults.failed += results.failed;
      totalResults.skipped += results.skipped;
      totalResults.errors.push(...results.errors);
    } catch (err) {
      console.error(`Chunk ${ci + 1} failed: ${err.message}`);
    }

    try { await browser.close(); } catch {}

    // Brief pause between chunks to let OS reclaim memory
    if (ci < chunks.length - 1) {
      console.log('Pausing 5s between chunks...');
      await new Promise(r => setTimeout(r, 5000));
    }
  }

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const results = totalResults;

  // Summary
  console.log('\n═══════════════════════════════════════════════════');
  console.log('  Results');
  console.log('═══════════════════════════════════════════════════');
  console.log(`  ✓ Success:  ${results.success}`);
  console.log(`  ✗ Failed:   ${results.failed}`);
  console.log(`  ⊘ Skipped:  ${results.skipped}`);
  console.log(`  ⏱ Elapsed:  ${elapsed}s`);

  if (results.errors.length > 0) {
    console.log('\n── Failed Designs ──');
    for (const { id, error } of results.errors) {
      console.log(`  ${id}: ${error}`);
    }

    // Save error report
    const reportPath = path.join(opts.outputDir, '_errors.json');
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, JSON.stringify(results.errors, null, 2));
    console.log(`\nError report saved to: ${reportPath}`);
  }

  process.exit(results.failed > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
