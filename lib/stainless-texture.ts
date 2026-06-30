import * as THREE from 'three';

const STAINLESS_TEXTURE_SIZE = 512;

export type StainlessFinish = 'brushed' | 'polished';

type StainlessTextureKind = 'color' | 'roughness' | 'normal';

export type StainlessTextureSet = {
  colorMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
};

function seededNoise(x: number, y: number, seed: number) {
  const n = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453123;
  return n - Math.floor(n);
}

function createStainlessCanvas(
  finish: StainlessFinish,
  kind: StainlessTextureKind,
) {
  if (typeof document === 'undefined') return null;

  const canvas = document.createElement('canvas');
  canvas.width = STAINLESS_TEXTURE_SIZE;
  canvas.height = STAINLESS_TEXTURE_SIZE;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  const image = ctx.createImageData(canvas.width, canvas.height);
  const data = image.data;
  const isPolished = finish === 'polished';

  for (let y = 0; y < canvas.height; y += 1) {
    const rowNoise = seededNoise(0, y, isPolished ? 19 : 7);
    const brushBand = Math.sin(y * (isPolished ? 0.09 : 0.42)) * (isPolished ? 2 : 10);

    for (let x = 0; x < canvas.width; x += 1) {
      const idx = (y * canvas.width + x) * 4;
      const longScratch = seededNoise(Math.floor(x / 42), y, 31) > (isPolished ? 0.992 : 0.978);
      const fineNoise = seededNoise(x, y, isPolished ? 43 : 13) - 0.5;
      const crossNoise = seededNoise(x, Math.floor(y / 4), 23) - 0.5;

      if (kind === 'normal') {
        const horizontalGroove = isPolished
          ? fineNoise * 7 + brushBand * 0.25
          : fineNoise * 12 + brushBand * 0.8 + crossNoise * 5;
        data[idx] = 128 + (longScratch ? 7 : 0);
        data[idx + 1] = Math.max(96, Math.min(160, 128 + horizontalGroove));
        data[idx + 2] = 255;
        data[idx + 3] = 255;
        continue;
      }

      if (kind === 'roughness') {
        const base = isPolished ? 205 : 176;
        const value = base + fineNoise * (isPolished ? 18 : 34) + brushBand + (longScratch ? 18 : 0);
        const clamped = Math.max(105, Math.min(240, value));
        data[idx] = clamped;
        data[idx + 1] = clamped;
        data[idx + 2] = clamped;
        data[idx + 3] = 255;
        continue;
      }

      const base = isPolished ? 242 : 232;
      const warmTint = isPolished ? 1 : 3;
      const value = base + fineNoise * (isPolished ? 5 : 10) + rowNoise * (isPolished ? 3 : 7) + brushBand * 0.35;
      data[idx] = Math.max(210, Math.min(255, value + warmTint));
      data[idx + 1] = Math.max(210, Math.min(255, value + warmTint));
      data[idx + 2] = Math.max(216, Math.min(255, value + 5));
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  return canvas;
}

export function createStainlessTextureSet(finish: StainlessFinish): StainlessTextureSet | null {
  const colorCanvas = createStainlessCanvas(finish, 'color');
  const roughnessCanvas = createStainlessCanvas(finish, 'roughness');
  const normalCanvas = createStainlessCanvas(finish, 'normal');
  if (!colorCanvas || !roughnessCanvas || !normalCanvas) return null;

  const colorMap = new THREE.CanvasTexture(colorCanvas);
  colorMap.colorSpace = THREE.SRGBColorSpace;
  const roughnessMap = new THREE.CanvasTexture(roughnessCanvas);
  const normalMap = new THREE.CanvasTexture(normalCanvas);

  [colorMap, roughnessMap, normalMap].forEach((texture) => {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(finish === 'polished' ? 3 : 5, finish === 'polished' ? 8 : 16);
    texture.minFilter = THREE.LinearMipmapLinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.anisotropy = 16;
    texture.needsUpdate = true;
  });

  return { colorMap, roughnessMap, normalMap };
}
