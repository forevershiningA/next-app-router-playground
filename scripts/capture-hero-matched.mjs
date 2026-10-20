import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

// Local-only development capture uses the existing automation store/renderer.
const progressive = process.argv.includes('--progressive');
const photographic = process.argv.includes('--photographic');
const destination = path.resolve(
  photographic
    ? 'output/hero-photographic'
    : progressive
      ? 'output/hero-progressive'
      : 'output/hero-matched',
);
const base = process.env.HERO_MATCHED_BASE_URL ?? 'http://localhost:3102';
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname))
  throw new Error('Matched hero capture requires a local development server');
await mkdir(path.join(destination, 'frames'), { recursive: true });
const browser = await chromium.launch({
  headless: true,
  args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-angle=d3d11'],
});
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
  });
  page.on('pageerror', (error) => console.error('Browser:', error.message));
  page.on('requestfailed', (request) =>
    console.error(
      'Request failed:',
      request.url(),
      request.failure()?.errorText,
    ),
  );
  await page.addInitScript(() => localStorage.setItem('fs_ui_theme', 'day'));
  await page.goto(
    `${base}/traditional-engraved-headstone/select-material?capture=hero`,
    { waitUntil: 'domcontentloaded', timeout: 120000 },
  );
  console.log('Designer document loaded');
  await page.waitForFunction(
    () => window.__headstoneStore?.getState().catalog && window.__r3fGL,
    undefined,
    { timeout: 120000 },
  );
  console.log('Renderer ready');
  await page.waitForFunction(
    () => {
      const s = window.__headstoneStore.getState();
      return (
        !s.loading &&
        !s.baseSwapping &&
        window.__r3fScene.getObjectByName('headstone')
      );
    },
    undefined,
    { timeout: 60000 },
  );
  console.log('Product ready');
  await page.evaluate((photographic) => {
    const store = window.__headstoneStore;
    const s = store.getState();
    s.setShapeUrl('/shapes/headstones/serpentine.svg');
    s.setHeadstoneMaterialUrl('/textures/forever/l/Blue-Pearl.webp');
    s.setBaseMaterialUrl('/textures/forever/l/Blue-Pearl.webp');
    if (photographic) {
      s.setWidthMm(800);
      s.setHeightMm(600);
    }
    s.setInscriptions([]);
    for (const [text, sizeMm, yPos] of [
      ['In Loving Memory', photographic ? 58 : 42, 0],
      ['Always in our hearts', photographic ? 42 : 30, -65],
    ]) {
      const id = store
        .getState()
        .addInscriptionLine({
          text,
          sizeMm,
          color: '#e7d9b5',
          font: 'Garamond',
        });
      store
        .getState()
        .updateInscription(id, { xPos: 0, yPos, coordinateSpace: 'mm-center' });
    }
    for (const motif of s.selectedMotifs) s.removeMotif(motif.id);
    store
      .getState()
      .addMotif(
        photographic
          ? '/shapes/motifs/hero-dove-outline.svg'
          : '/shapes/motifs/dove_01.svg',
      );
    const motif = store.getState().selectedMotifs.at(-1);
    store.getState().setMotifColor(motif.id, '#e7d9b5');
    store
      .getState()
      .setMotifOffset(motif.id, {
        xPos: 0,
        yPos: 160,
        heightMm: 130,
        coordinateSpace: 'mm-center',
      });
    for (const xPos of photographic ? [-310, 310] : [-205, 205]) {
      store
        .getState()
        .addMotif(
          photographic
            ? '/shapes/motifs/hero-botanical-outline.svg'
            : '/shapes/motifs/branch_001 [przekonwertowany].svg',
        );
      const branch = store.getState().selectedMotifs.at(-1);
      store.getState().setMotifColor(branch.id, '#e7d9b5');
      store
        .getState()
        .setMotifOffset(branch.id, {
          xPos,
          yPos: photographic ? -20 : -160,
          heightMm: photographic ? 430 : 200,
          coordinateSpace: 'mm-center',
          flipX: xPos > 0,
        });
    }
    store.setState({
      selected: null,
      selectedInscriptionId: null,
      selectedMotifId: null,
      activePanel: null,
    });
  }, photographic);
  console.log('Applied matched design');
  await page.waitForFunction(
    () => {
      const s = window.__headstoneStore.getState();
      return (
        !s.loading &&
        !s.baseSwapping &&
        !s.fontLoading &&
        s.inscriptions.length === 2
      );
    },
    undefined,
    { timeout: 60000 },
  );
  await page.waitForTimeout(2500);
  console.log('Design settled');
  await page.addStyleTag({
    content: 'nextjs-portal{display:none!important}*{cursor:none!important}',
  });
  const manifest = await page.evaluate(() => {
    const scene = window.__r3fScene,
      gl = window.__r3fGL,
      body = scene.getObjectByName('headstone');
    scene.updateMatrixWorld(true);
    body.geometry.computeBoundingBox();
    const bounds = body.geometry.boundingBox.clone().makeEmpty();
    for (const name of ['headstone', 'base']) {
      scene.getObjectByName(name)?.traverse((mesh) => {
        if (!mesh.isMesh || !mesh.visible || !mesh.geometry) return;
        mesh.geometry.computeBoundingBox();
        bounds.union(
          mesh.geometry.boundingBox.clone().applyMatrix4(mesh.matrixWorld),
        );
      });
    }
    const center = bounds.getCenter(body.position.clone());
    const size = bounds.getSize(body.position.clone());
    const camera = window.__r3fCamera.clone();
    const radius = size.length() / 2;
    const distance = (radius / Math.sin((camera.fov * Math.PI) / 360)) * 1.06;
    const up = body.position
      .clone()
      .set(0, 1, 0)
      .transformDirection(body.matrixWorld);
    camera.up.copy(up);
    camera.near = 0.001;
    camera.far = 100;
    const render = gl.render.bind(gl);
    window.__heroCapture = {
      scene,
      gl,
      body,
      bounds,
      center,
      size,
      camera,
      distance,
      render,
    };
    // Keep R3F's normal loop and lighting; use a fixed, fitted capture camera.
    gl.render = (scene, originalCamera) =>
      render(scene, window.__heroUiCamera ?? originalCamera);
    scene.traverse((object) => {
      if (
        object.isLineSegments ||
        object.userData?.selectionGeometry ||
        object.userData?.outlineGeometry
      )
        object.visible = false;
    });
    const s = window.__headstoneStore.getState();
    window.__heroDesign = {
      inscriptions: s.inscriptions,
      selectedMotifs: s.selectedMotifs,
      motifOffsets: s.motifOffsets,
    };
    return {
      productId: s.productId,
      shape: s.shapeUrl,
      material: s.headstoneMaterialUrl,
      baseMaterial: s.baseMaterialUrl,
      widthMm: s.widthMm,
      heightMm: s.heightMm,
      inscriptions: s.inscriptions.map(({ ref, ...line }) => line),
      motifs: s.selectedMotifs,
      motifOffsets: s.motifOffsets,
      bounds: { min: bounds.min.toArray(), max: bounds.max.toArray() },
    };
  });
  // Render the garden product from the very same scene, with alpha, before
  // returning the renderer to the original UI canvas dimensions.
  const captureProduct = () =>
    page.evaluate(() => {
      const { scene, gl, body, center, camera, distance, render } =
        window.__heroCapture;
      const originalSize = gl.getSize(body.position.clone());
      const originalRatio = gl.getPixelRatio();
      const background = scene.background,
        fog = scene.fog;
      const hidden = [];
      scene.traverse((o) => {
        if (o.name === 'foundation-contact-shadow') {
          hidden.push([o, o.visible]);
          o.visible = false;
        }
      });
      camera.aspect = 1;
      const direction = body.position
        .clone()
        .set(0.14, 0.12, 1)
        .transformDirection(body.matrixWorld);
      camera.position.copy(center).addScaledVector(direction, distance);
      camera.lookAt(center);
      camera.updateProjectionMatrix();
      camera.updateMatrixWorld(true);
      scene.background = null;
      scene.fog = null;
      gl.setPixelRatio(1);
      gl.setSize(1100, 1100, false);
      gl.setClearColor(0, 0);
      render(scene, camera);
      const png = gl.domElement.toDataURL('image/png').split(',')[1];
      scene.background = background;
      scene.fog = fog;
      gl.setPixelRatio(originalRatio);
      gl.setSize(originalSize.x, originalSize.y, false);
      hidden.forEach(([o, visible]) => (o.visible = visible));
      return png;
    });
  if (progressive) {
    const stages = [
      { name: 'blank', inscriptions: 0, motifs: 0 },
      { name: 'dedication', inscriptions: 1, motifs: 0 },
      { name: 'remembrance', inscriptions: 2, motifs: 0 },
      { name: 'dove', inscriptions: 2, motifs: 1 },
      { name: 'left-branch', inscriptions: 2, motifs: 2 },
      { name: 'finished', inscriptions: 2, motifs: 3 },
    ];
    let productSize;
    for (const [index, stage] of stages.entries()) {
      if (index === 1 || index === 3) {
        const slug = index === 1 ? 'inscriptions' : 'select-motifs';
        if (photographic) {
          // These capture-only stages share the mounted scene. Native history
          // updates Next's pathname subscribers without remounting the renderer.
          await page.evaluate((slug) => {
            window.history.pushState(
              null,
              '',
              `/traditional-engraved-headstone/${slug}?capture=hero`,
            );
          }, slug);
        } else {
          await page.locator(`[data-quick-nav-slug="${slug}"]`).first().click();
        }
        await page
          .waitForFunction(
            (slug) => location.pathname.replace(/\/$/, '').endsWith('/' + slug),
            slug,
            { timeout: 60000, polling: 100 },
          )
          .catch(async (error) => {
            console.error('Navigation stalled at', page.url());
            await page.screenshot({
              path: path.join(destination, 'navigation-error.png'),
            });
            throw error;
          });
        console.log('Capture route:', page.url());
      }
      const state = await page.evaluate(({ inscriptions, motifs }) => {
        const full = window.__heroDesign;
        const store = window.__headstoneStore;
        store.setState({
          inscriptions: full.inscriptions.slice(0, inscriptions),
          selectedMotifs: full.selectedMotifs.slice(0, motifs),
          motifOffsets: full.motifOffsets,
          selected: null,
          selectedInscriptionId: null,
          selectedMotifId: null,
          activePanel: null,
        });
        store.getState().calculateInscriptionCost();
        store.getState().calculateMotifCost();
        return {
          inscriptions: store.getState().inscriptions.map((line) => line.text),
          motifs: store.getState().selectedMotifs.map((motif) => motif.svgPath),
        };
      }, stage);
      await page.waitForFunction(
        () => !window.__headstoneStore.getState().fontLoading,
      );
      await page.waitForTimeout(1200);
      const product = Buffer.from(await captureProduct(), 'base64');
      const trimmed = await sharp(product)
        .trim()
        .png()
        .toBuffer({ resolveWithObject: true });
      const size = [trimmed.info.width, trimmed.info.height].join('x');
      if (productSize && size !== productSize)
        throw new Error(`Product framing changed: ${size} vs ${productSize}`);
      productSize = size;
      await writeFile(
        path.join(destination, `${index}-product.png`),
        trimmed.data,
      );
      const camera = await page.evaluate(() => {
        const { gl, body, center, camera, distance, scene } =
          window.__heroCapture;
        if (gl !== window.__r3fGL)
          throw new Error('Renderer changed during capture');
        camera.aspect = gl.domElement.clientWidth / gl.domElement.clientHeight;
        const direction = body.position
          .clone()
          .set(0.14, 0.12, 1)
          .transformDirection(body.matrixWorld);
        camera.position
          .copy(center)
          .addScaledVector(direction, distance * 0.95);
        camera.lookAt(center);
        camera.updateProjectionMatrix();
        camera.updateMatrixWorld(true);
        window.__heroUiCamera = camera;
        scene.traverse((o) => {
          if (
            o.isLineSegments ||
            o.userData?.selectionGeometry ||
            o.userData?.outlineGeometry
          )
            o.visible = false;
        });
        gl.render(scene, camera);
        return {
          position: camera.position.toArray(),
          projection: camera.projectionMatrix.toArray(),
        };
      });
      await page.evaluate(
        () =>
          new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          ),
      );
      await page.screenshot({
        path: path.join(destination, `${index}-ui.png`),
      });
      Object.assign(stage, { state, camera, productSize });
      console.log(`Captured matched stage ${index}: ${stage.name}`);
    }
    await writeFile(
      path.join(destination, 'design.json'),
      JSON.stringify({ ...manifest, stages }, null, 2) + '\n',
    );
  } else {
    const product = await captureProduct();
    await sharp(Buffer.from(product, 'base64'))
      .trim()
      .png()
      .toFile(path.join(destination, 'product.png'));
    const frames = process.argv.includes('--still') ? 1 : 120;
    for (let frame = 0; frame < frames; frame++) {
      await page.evaluate(
        ({ frame }) => {
          const { gl, body, center, camera, distance } = window.__heroCapture;
          const aspect = gl.domElement.clientWidth / gl.domElement.clientHeight;
          camera.aspect = aspect;
          const phase = (2 * Math.PI * frame) / 120;
          const direction = body.position
            .clone()
            .set(0.14 + 0.075 * Math.sin(phase), 0.12, 1)
            .transformDirection(body.matrixWorld);
          camera.position
            .copy(center)
            .addScaledVector(direction, distance * 0.95);
          camera.lookAt(center);
          camera.updateProjectionMatrix();
          camera.updateMatrixWorld(true);
          window.__heroUiCamera = camera;
          gl.render(window.__heroCapture.scene, camera);
        },
        { frame },
      );
      await page.evaluate(
        () =>
          new Promise((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(resolve)),
          ),
      );
      await page.screenshot({
        path: path.join(
          destination,
          'frames',
          `${String(frame).padStart(4, '0')}.png`,
        ),
      });
      if (frame % 30 === 0) console.log(`Captured ${frame}/${frames}`);
    }
    await writeFile(
      path.join(destination, 'design.json'),
      JSON.stringify(manifest, null, 2) + '\n',
    );
  }
  console.log('Saved matched product and UI from one scene:', destination);
} finally {
  await browser.close();
}
