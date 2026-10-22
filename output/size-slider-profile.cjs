const { chromium } = require('@playwright/test');
const fs = require('node:fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1740, height: 1000 } });
  page.setDefaultTimeout(120000);
  page.on('pageerror', error => console.log('PAGE ERROR', error.message));
  await page.addInitScript(() => {
    window.__gpuCounts = { compileShader: 0, texImage2D: 0, texSubImage2D: 0, generateMipmap: 0 };
    for (const name of Object.keys(window.__gpuCounts)) {
      for (const prototype of [WebGLRenderingContext.prototype, WebGL2RenderingContext.prototype]) {
        const original = prototype[name];
        prototype[name] = function (...args) {
          window.__gpuCounts[name]++;
          return original.apply(this, args);
        };
      }
    }
  });
  try {
    await page.goto(`http://localhost:3103/select-size${process.argv[3] === 'square' ? '#base' : ''}`, { waitUntil: 'domcontentloaded', timeout: 180000 });
    console.log('Loaded', page.url());
    await page.waitForFunction(() => window.__headstoneStore && window.__r3fScene && window.__r3fGL);
    await page.evaluate(shape => window.__headstoneStore.setState({ productId: '124', shapeUrl: `/shapes/headstones/${shape}.svg`, widthMm: 900, heightMm: 600, showBase: true }), process.argv[3] || 'serpentine');
    await page.waitForFunction(() => {
      let ready = false;
      window.__r3fScene.traverse(o => { if (o.isMesh && o.material?.[0]?.customProgramCacheKey?.().includes('planar-cap:')) ready = true; });
      return ready;
    });
    const result = await page.evaluate(async () => {
      const frame = () => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      for (let i = 0; i < 10; i++) await frame();
      const before = { ...window.__gpuCounts };
      const times = [];
      const geometry = [];
      for (const dimension of ['widthMm', 'heightMm', ...(location.hash === '#base' ? ['baseWidthMm', 'baseHeightMm'] : [])]) {
        for (let i = 0; i < 20; i++) {
          const start = performance.now();
          const setter = `set${dimension[0].toUpperCase()}${dimension.slice(1)}`;
          window.__headstoneStore.getState()[setter]((dimension === 'baseWidthMm' ? 1100 : dimension === 'baseHeightMm' ? 100 : dimension === 'widthMm' ? 800 : 500) + i * 10);
          await frame();
          times.push(performance.now() - start);
        }
        window.__r3fScene.traverse(o => {
          if (o.isMesh && o.material?.[0]?.customProgramCacheKey?.().includes('planar-cap:')) {
            const p = o.geometry.attributes.position.array;
            geometry.push({ dimension, positions: Array.from(p), matrix: Array.from(o.matrixWorld.elements) });
          }
        });
      }
      const counts = Object.fromEntries(Object.entries(window.__gpuCounts).map(([key, value]) => [key, value - before[key]]));
      times.sort((a,b) => a-b);
      return { counts, medianMs: times[Math.floor(times.length / 2)], p95Ms: times[Math.min(times.length - 1, Math.floor(times.length * 0.95))], geometry };
    });
    fs.writeFileSync(`output/size-slider-${process.argv[2] || 'profile'}.json`, JSON.stringify(result, null, 2));
    if (process.argv[2] !== 'before' && Object.values(result.counts).some(value => value !== 0)) throw new Error('Unexpected GPU compilation or texture upload during resizing');
    await page.screenshot({ path: `output/size-slider-${process.argv[2] || 'profile'}.png` });
    console.log(JSON.stringify({ ...result, geometry: result.geometry.map(g => ({ dimension: g.dimension, vertices: g.positions.length / 3 })) }));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
