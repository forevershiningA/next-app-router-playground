'use client';

import * as THREE from 'three';

type ScreenshotRenderer = {
  render: (scene: THREE.Scene, camera: THREE.Camera) => void;
  getRenderTarget: () => THREE.WebGLRenderTarget | null;
  readRenderTargetPixels: (
    target: THREE.WebGLRenderTarget,
    x: number,
    y: number,
    width: number,
    height: number,
    buffer: Uint8Array,
  ) => void;
  setRenderTarget: (target: THREE.WebGLRenderTarget | null) => void;
  domElement: HTMLCanvasElement;
};

export class BlankDesignerPreviewError extends Error {
  constructor() {
    super('The product is not visible in the preview yet.');
  }
}

export function captureDesignerScreenshot(
  requireRenderer = false,
): string | null {
  const browser = window as unknown as Record<string, unknown>;
  const renderer = browser.__r3fGL as ScreenshotRenderer | undefined;
  const scene = browser.__r3fScene as THREE.Scene | undefined;
  const camera = browser.__r3fCamera as THREE.Camera | undefined;

  if (renderer && scene && camera) {
    try {
      return captureRendererFrame(renderer, scene, camera);
    } catch (error) {
      if (requireRenderer) throw error;
      console.warn('R3F screenshot failed, falling back to DOM canvas:', error);
    }
  }

  if (requireRenderer) {
    throw new Error(
      'The design preview is unavailable. Please wait for it to load and save again.',
    );
  }

  const rankedCanvases = Array.from(document.querySelectorAll('canvas'))
    .map((canvas) => ({
      canvas,
      area:
        (canvas.width || canvas.clientWidth || 0) *
        (canvas.height || canvas.clientHeight || 0),
    }))
    .filter(({ area }) => area > 0)
    .sort((left, right) => right.area - left.area);

  for (const { canvas } of rankedCanvases) {
    try {
      if (!isLikelyBlankCanvas(canvas)) return encodeCanvasForUpload(canvas);
    } catch {
      // Try the next canvas.
    }
  }

  const fallback = rankedCanvases[0]?.canvas;
  if (!fallback) return null;
  try {
    return encodeCanvasForUpload(fallback);
  } catch {
    return null;
  }
}

function captureRendererFrame(
  renderer: ScreenshotRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
): string {
  const width = renderer.domElement.width;
  const height = renderer.domElement.height;
  if (!width || !height) throw new Error('Canvas has no drawable size');

  const target = new THREE.WebGLRenderTarget(width, height, {
    format: THREE.RGBAFormat,
    type: THREE.UnsignedByteType,
    depthBuffer: true,
    stencilBuffer: false,
  });
  target.texture.colorSpace = THREE.SRGBColorSpace;
  const pixels = new Uint8Array(width * height * 4);
  const previousTarget = renderer.getRenderTarget();

  try {
    renderer.setRenderTarget(target);
    renderer.render(scene, camera);
    renderer.readRenderTargetPixels(target, 0, 0, width, height, pixels);
  } finally {
    renderer.setRenderTarget(previousTarget);
    target.dispose();
  }

  const source = document.createElement('canvas');
  source.width = width;
  source.height = height;
  const context = source.getContext('2d');
  if (!context) throw new Error('Unable to create screenshot canvas');

  const image = context.createImageData(width, height);
  const rowSize = width * 4;
  for (let y = 0; y < height; y += 1) {
    const sourceOffset = (height - y - 1) * rowSize;
    image.data.set(
      pixels.subarray(sourceOffset, sourceOffset + rowSize),
      y * rowSize,
    );
  }
  context.putImageData(image, 0, 0);
  if (isLikelyBlankCanvas(source)) throw new BlankDesignerPreviewError();
  return encodeCanvasForUpload(source);
}

function encodeCanvasForUpload(source: HTMLCanvasElement): string {
  const sourceWidth = source.width || source.clientWidth || 1;
  const sourceHeight = source.height || source.clientHeight || 1;
  const scale = Math.min(1, 1920 / sourceWidth, 1080 / sourceHeight);
  const output = document.createElement('canvas');
  output.width = Math.max(1, Math.round(sourceWidth * scale));
  output.height = Math.max(1, Math.round(sourceHeight * scale));
  const context = output.getContext('2d');
  if (!context) return source.toDataURL('image/jpeg', 0.86);

  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, output.width, output.height);
  context.drawImage(source, 0, 0, output.width, output.height);
  return output.toDataURL('image/jpeg', 0.86);
}

function isLikelyBlankCanvas(canvas: HTMLCanvasElement): boolean {
  const probe = document.createElement('canvas');
  probe.width = 64;
  probe.height = 48;
  const context = probe.getContext('2d', { willReadFrequently: true });
  if (!context) return false;

  try {
    context.drawImage(canvas, 0, 0, probe.width, probe.height);
    const pixels = context.getImageData(0, 0, probe.width, probe.height).data;
    let nonTrivial = 0;
    for (let index = 0; index < pixels.length; index += 4) {
      const red = pixels[index];
      const green = pixels[index + 1];
      const blue = pixels[index + 2];
      const alpha = pixels[index + 3];
      if (alpha > 10 && !(red > 245 && green > 245 && blue > 245)) {
        nonTrivial += 1;
      }
    }
    return nonTrivial / (pixels.length / 4) < 0.01;
  } catch {
    return false;
  }
}
