/** Local 3D renders for editorial review. Never replaces approved gallery assets. */
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import os from 'node:os';
import { chromium } from 'playwright';
import sharp from 'sharp';
import fixtures from './utils/design-preview-fixtures.cjs';
const { PORTRAIT_PATH, PORTRAIT_SVG, preparePreviewContent } = fixtures;
const demoPortrait = await sharp(Buffer.from(PORTRAIT_SVG)).png().toBuffer();

const root = process.cwd();
const catalog = JSON.parse(
  await fs.readFile(path.join(root, 'lib/saved-designs-data.json'), 'utf8'),
);
const sources = JSON.parse(
  await fs.readFile(path.join(root, 'lib/design-source-manifest.json'), 'utf8'),
);
const pilot = JSON.parse(
  await fs.readFile(
    path.join(root, 'docs/audits/2026-10-16-designs/pilot.json'),
    'utf8',
  ),
).projects;
const arg = (key) =>
  process.argv
    .find((value) => value.startsWith('--' + key + '='))
    ?.split('=')
    .slice(1)
    .join('=');
const ids = arg('ids')?.split(',') ?? pilot.map((design) => design.id);
if (ids.some((id) => !pilot.some((design) => design.id === id)))
  throw new Error('Only audited pilot IDs may be rendered');
const base = arg('base') ?? 'http://localhost:3002';
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname))
  throw new Error('Candidate rendering requires a local development server');
const destination = path.join(
  root,
  'docs/audits/2026-10-16-designs/preview-candidates',
);
const previousManifest = await fs
  .readFile(path.join(destination, 'manifest.json'), 'utf8')
  .then(JSON.parse)
  .catch((error) => {
    if (error.code === 'ENOENT') return { records: [] };
    throw error;
  });
const retainedRecords = previousManifest.records.filter(
  (record) => !ids.includes(record.id),
);
const manifest = (records) =>
  JSON.stringify(
    {
      status: 'candidates-not-approved',
      records: [...retainedRecords, ...records],
    },
    null,
    2,
  ) + '\n';
// Writing assets into the watched repo during capture can trigger Fast Refresh
// between HTML and chunk requests. Stage the whole batch outside the repo.
const output = await fs.mkdtemp(path.join(os.tmpdir(), 'fs-design-previews-'));
await fs.mkdir(destination, { recursive: true });
const launchBrowser = () =>
  chromium.launch({
    headless: true,
    args: [
      '--use-angle=swiftshader',
      '--enable-webgl',
      '--disable-gpu-sandbox',
    ],
  });
let browser = await launchBrowser();
const records = [];
const runtimeSha256 = crypto
  .createHash('sha256')
  .update(
    (
      await Promise.all(
        [
          'lib/saved-design-loader-utils.ts',
          'lib/canonical-design-source.ts',
          'lib/design-layout-contracts.ts',
          'lib/legacy-photo-size.js',
          'lib/image-size-options.json',
          'lib/headstone-store/project-slice.ts',
          'lib/headstone-store/product-appearance-slice.ts',
          'lib/headstone-store/product-configuration-slice.ts',
          'components/three/ImageModel.tsx',
          'components/three/headstone/ShapeSwapper.tsx',
          'scripts/utils/design-preview-fixtures.cjs',
        ].map((filename) => fs.readFile(path.join(root, filename))),
      )
    )
      .map((buffer) => buffer.toString('utf8'))
      .join('\n'),
  )
  .digest('hex');
async function bounded(promise, milliseconds = 60000) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(
          () => reject(new Error('Preview operation timed out')),
          milliseconds,
        );
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}
try {
  for (const id of ids) {
    const metadata = catalog[id],
      source = sources[id];
    const record = {
      id,
      approval: 'pending',
      contentPolicy: 'synthetic-word-length-and-demo-portrait-v2',
      cameraPolicy: 'product-front-bounds-v2',
      source: source.path,
      runtimeSha256,
      images: [],
      errors: [],
    };
    records.push(record);
    if (source.status !== 'source-ready') {
      record.errors.push('Source requires review');
      continue;
    }
    if (source.elementCounts.logos) {
      record.errors.push('Demonstration photo/logo required before rendering');
      continue;
    }
    const context = await browser.newContext({
      viewport: { width: 1600, height: 1200 },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    const evaluate = (callback, argument) =>
      bounded(page.evaluate(callback, argument));
    page.on('pageerror', (error) => record.errors.push(error.message));
    console.log(id + ': opening local designer');
    try {
      // Exact local paths preserve the runtime fallback order. A missing p3d
      // candidate gets 404; it must not be fulfilled with an unrelated version.
      await page.route(
        /\/(?:designs|canonical-designs)\/[^/]+\/\d+\.json(?:\?.*)?$/,
        async (route) => {
          const pathname = new URL(route.request().url()).pathname;
          const requestedId = pathname.match(/\/(\d+)\.json$/)?.[1];
          if (requestedId !== id) {
            await route.fulfill({ status: 404, body: '' });
            return;
          }
          try {
            const payload = JSON.parse(
              await fs.readFile(
                path.join(root, 'public', pathname.replace(/^\/+/, '')),
                'utf8',
              ),
            );
            if (
              String(payload.source?.id) !== id ||
              String(payload.product?.id) !== source.productId
            )
              throw new Error('Source mismatch');
            preparePreviewContent(payload);
            await route.fulfill({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify(payload),
            });
          } catch {
            await route.fulfill({ status: 404, body: '' });
          }
        },
      );
      // Avoid telemetry and external media in isolated asset generation.
      await page.route('**/*', async (route) => {
        const url = new URL(route.request().url());
        if (url.pathname.endsWith(PORTRAIT_PATH)) {
          await route.fulfill({
            status: 200,
            contentType: 'image/png',
            body: demoPortrait,
          });
          return;
        }
        if (
          url.origin !== new URL(base).origin ||
          /\/api\/(?:analytics|client-webgl-report)/.test(url.pathname) ||
          (url.pathname.startsWith('/api/') &&
            route.request().method() !== 'GET')
        )
          await route.abort();
        else await route.fallback();
      });
      await page.goto(base + '/select-size', {
        waitUntil: 'domcontentloaded',
        timeout: 90000,
      });
      await page.waitForFunction(
        () => typeof window.__loadDesignById === 'function' && !!window.__r3fGL,
        undefined,
        { timeout: 90000 },
      );
      console.log(id + ': loading canonical source');
      const loaded = await evaluate(
        (designId) => window.__loadDesignById(designId),
        id,
      );
      if (!loaded.success) throw new Error(loaded.message);
      await evaluate(() => {
        const state = window.__headstoneStore.getState();
        state.setScreenshotMode(true);
        for (const setter of [
          'setSelected',
          'setSelectedInscriptionId',
          'setSelectedAdditionId',
          'setSelectedMotifId',
          'setSelectedImageId',
          'setSelectedEmblemId',
        ])
          state[setter]?.(null);
      });
      await page.waitForFunction(
        () => {
          const state = window.__headstoneStore?.getState();
          const headstone = window.__r3fScene?.getObjectByName('headstone');
          return (
            state &&
            !state.loading &&
            !state.baseSwapping &&
            headstone?.geometry?.attributes?.position?.count > 0
          );
        },
        undefined,
        { timeout: 60000 },
      );
      // Observe a stable scene rather than clearing flags or accepting a fixed delay.
      await evaluate(async () => {
        let signature = '',
          stable = 0;
        const deadline = performance.now() + 30000;
        while (stable < 12 && performance.now() < deadline) {
          await new Promise(requestAnimationFrame);
          const scene = window.__r3fScene;
          let next = '';
          scene.traverse((object) => {
            if (object.isMesh)
              next +=
                object.uuid +
                ':' +
                object.geometry?.attributes?.position?.count +
                ':' +
                object.material?.map?.version +
                ';';
          });
          stable = next === signature ? stable + 1 : 0;
          signature = next;
        }
        if (stable < 12) throw new Error('Scene did not settle');
      });
      record.layout = await evaluate(() => {
        const state = window.__headstoneStore.getState();
        const scene = window.__r3fScene;
        scene.updateMatrixWorld(true);
        const body = scene.getObjectByName('headstone');
        body.geometry.computeBoundingBox();
        const boundsOf = (object) => {
          const box = body.geometry.boundingBox.clone().makeEmpty();
          object.traverse((mesh) => {
            if (!mesh.isMesh || !mesh.visible || !mesh.geometry) return;
            mesh.geometry.computeBoundingBox();
            box.union(
              mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld),
            );
          });
          return { min: box.min.toArray(), max: box.max.toArray() };
        };
        const imageBounds = [];
        scene.traverse((object) => {
          if (object.name.startsWith('image-') && object.isGroup)
            imageBounds.push({ name: object.name, bounds: boundsOf(object) });
        });
        return {
          productMm: { width: state.widthMm, height: state.heightMm },
          inscriptions: state.inscriptions.map(
            ({ xPos, yPos, sizeMm, target, coordinateSpace }) => ({
              xPos,
              yPos,
              sizeMm,
              target,
              coordinateSpace: coordinateSpace ?? 'surface-local',
            }),
          ),
          images: state.selectedImages.map(
            ({ widthMm, heightMm, xPos, yPos, target }) => ({
              widthMm,
              heightMm,
              xPos,
              yPos,
              target,
            }),
          ),
          bodyBounds: boundsOf(body),
          imageBounds,
        };
      });
      for (const axis of ['width', 'height']) {
        const expected = source.dimensionsMm[axis];
        if (
          expected > 0 &&
          Math.abs(record.layout.productMm[axis] - expected) > 1
        ) {
          throw new Error(
            'Rendered product dimensions differ from the source: ' + axis,
          );
        }
      }
      const sourceBytes = await fs.readFile(
        path.join(root, 'public', source.path.replace(/^\/+/, '')),
      );
      record.sourceSha256 = crypto
        .createHash('sha256')
        .update(sourceBytes)
        .digest('hex');
      record.configurationVersion = source.version;
      for (const role of ['overview', 'detail']) {
        const render = await evaluate(
          ({ role }) => {
            const scene = window.__r3fScene,
              renderer = window.__r3fGL;
            const headstone = scene.getObjectByName('headstone');
            if (!headstone?.geometry)
              throw new Error('Product geometry missing');
            scene.updateMatrixWorld(true);
            const box = headstone.geometry.boundingBox?.clone();
            if (!box) {
              headstone.geometry.computeBoundingBox();
            }
            const bounds = (
              box ?? headstone.geometry.boundingBox.clone()
            ).makeEmpty();
            for (const name of ['headstone', 'base', 'ledger', 'kerbset']) {
              const object = scene.getObjectByName(name);
              if (!object) continue;
              object.traverse((mesh) => {
                if (!mesh.isMesh || !mesh.visible || !mesh.geometry) return;
                mesh.geometry.computeBoundingBox();
                bounds.union(
                  mesh.geometry.boundingBox
                    .clone()
                    .applyMatrix4(mesh.matrixWorld),
                );
              });
            }
            if (bounds.isEmpty()) throw new Error('Product bounds empty');
            const camera = window.__r3fCamera.clone();
            if (!camera.isPerspectiveCamera)
              throw new Error('Expected perspective camera');
            const center = bounds.getCenter(camera.position.clone());
            const size = bounds.getSize(camera.position.clone());
            camera.aspect = 4 / 3;
            const vertical = (camera.fov * Math.PI) / 360;
            const horizontal = Math.atan(Math.tan(vertical) * camera.aspect);
            const radius = size.length() / 2;
            const distance =
              (radius / Math.sin(Math.min(vertical, horizontal))) * 1.12;
            const direction = camera.position
              .clone()
              .set(0.08, 0.12, 1)
              .transformDirection(headstone.matrixWorld);
            camera.up.copy(
              camera.position
                .clone()
                .set(0, 1, 0)
                .transformDirection(headstone.matrixWorld),
            );
            if (role === 'detail') {
              headstone.geometry.computeBoundingBox();
              headstone.geometry.boundingBox
                .clone()
                .applyMatrix4(headstone.matrixWorld)
                .getCenter(center);
            }
            camera.position
              .copy(center)
              .addScaledVector(
                direction,
                role === 'detail' ? distance * 0.55 : distance,
              );
            camera.lookAt(center);
            camera.near = Math.max(0.0001, distance / 1000);
            camera.far = Math.max(100, distance * 20);
            camera.updateProjectionMatrix();
            camera.updateMatrixWorld(true);
            const projected = [];
            for (const x of [bounds.min.x, bounds.max.x])
              for (const y of [bounds.min.y, bounds.max.y])
                for (const z of [bounds.min.z, bounds.max.z])
                  projected.push(center.clone().set(x, y, z).project(camera));
            const clipped = projected.some(
              (point) =>
                !Number.isFinite(point.x) ||
                Math.abs(point.x) > 0.94 ||
                Math.abs(point.y) > 0.94 ||
                Math.abs(point.z) > 1,
            );
            if (role === 'overview' && clipped)
              throw new Error('Product is clipped by the overview camera');
            scene.traverse((object) => {
              if (
                object.userData?.selectionGeometry ||
                object.userData?.outlineGeometry ||
                object.isLineSegments
              )
                object.visible = false;
            });
            scene.background = null;
            scene.fog = null;
            renderer.setPixelRatio(1);
            renderer.setSize(1600, 1200, false);
            renderer.setClearColor(0, 0);
            renderer.render(scene, camera);
            return {
              png: renderer.domElement.toDataURL('image/png').split(',')[1],
              bounds: { min: bounds.min.toArray(), max: bounds.max.toArray() },
              projected: projected.map((p) => p.toArray()),
            };
          },
          { role },
        );
        const png = Buffer.from(render.png, 'base64');
        const stats = await sharp(png)
          .ensureAlpha()
          .raw()
          .toBuffer({ resolveWithObject: true });
        let opaque = 0,
          touchesEdge = false;
        for (let y = 0; y < stats.info.height; y++)
          for (let x = 0; x < stats.info.width; x++) {
            if (stats.data[(y * stats.info.width + x) * 4 + 3] > 10) {
              opaque++;
              if (
                x < 4 ||
                y < 4 ||
                x >= stats.info.width - 4 ||
                y >= stats.info.height - 4
              )
                touchesEdge = true;
            }
          }
        if (opaque < 1600 * 1200 * 0.01)
          throw new Error('Empty or microscopic render');
        for (const width of [480, 960, 1600]) {
          const filename = id + '-' + role + '-' + width + '.webp';
          const budget = { 480: 50000, 960: 150000, 1600: 300000 }[width];
          let buffer, quality;
          for (quality of [86, 82, 78, 74]) {
            buffer = await sharp(png)
              .resize(width, (width * 3) / 4)
              .webp({ quality })
              .toBuffer();
            if (buffer.length <= budget) break;
          }
          if (buffer.length > budget)
            record.errors.push('Image exceeds byte budget: ' + filename);
          await fs.writeFile(path.join(output, filename), buffer);
          record.images.push({
            role,
            filename,
            width,
            height: (width * 3) / 4,
            bytes: buffer.length,
            quality,
            contentTouchesEdge: touchesEdge,
            alt: `${metadata.productSlug.replaceAll('-', ' ')} template, ${role === 'overview' ? 'full product view' : 'layout detail'}`,
            generatedAt: new Date().toISOString(),
          });
        }
        if (role === 'overview' && touchesEdge)
          record.errors.push(
            'Rendered content reaches the overview edge; inspect layout overflow',
          );
      }
      console.log(id + ': candidate images saved, review pending');
    } catch (error) {
      record.errors.push(error.message);
      record.readiness = await evaluate(() => ({
        loader: typeof window.__loadDesignById,
        scene: !!window.__r3fScene,
        canvas: !!document.querySelector('canvas'),
        loading: window.__headstoneStore?.getState()?.loading,
        baseSwapping: window.__headstoneStore?.getState()?.baseSwapping,
      })).catch(() => null);
      console.log(id + ': ' + error.message);
    } finally {
      await bounded(context.close(), 15000);
      await bounded(browser.close(), 15000);
      browser = await launchBrowser();
    }
    await fs.writeFile(path.join(output, 'manifest.json'), manifest(records));
  }
} finally {
  await bounded(browser.close(), 15000);
  await fs.writeFile(path.join(output, 'manifest.json'), manifest(records));
  await fs.cp(output, destination, { recursive: true });
  for (const filename of await fs.readdir(output))
    await fs.unlink(path.join(output, filename));
  await fs.rmdir(output);
}
