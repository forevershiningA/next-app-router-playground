'use client';

import * as THREE from 'three';
import { FULL_MONUMENT_GROUP_NAME } from '#/components/three/constants';

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
  if (!renderer.domElement.width || !renderer.domElement.height)
    throw new Error('Canvas has no drawable size');
  const product = scene.getObjectByName(FULL_MONUMENT_GROUP_NAME);
  if (!product || !(camera instanceof THREE.PerspectiveCamera))
    throw new BlankDesignerPreviewError();
  product.updateWorldMatrix(true, true);
  const bounds = new THREE.Box3().setFromObject(product);
  if (bounds.isEmpty()) throw new BlankDesignerPreviewError();
  const center = bounds.getCenter(new THREE.Vector3());
  const size = bounds.getSize(new THREE.Vector3());
  if (![...center.toArray(), ...size.toArray()].every(Number.isFinite))
    throw new BlankDesignerPreviewError();

  // The interactive camera reserves space for editor panels, especially on
  // phones. Export the complete product with its own front-facing camera.
  const width = 1200;
  const height = 900;
  const captureCamera = camera.clone();
  captureCamera.aspect = width / height;
  captureCamera.zoom = 1;
  const tangent = Math.tan(THREE.MathUtils.degToRad(captureCamera.fov) / 2);
  const distance = Math.max(size.y / (2 * tangent), size.x / (2 * tangent * captureCamera.aspect)) * 1.5 + size.z / 2;
  if (!Number.isFinite(distance) || distance <= 0)
    throw new BlankDesignerPreviewError();
  captureCamera.position.set(center.x, center.y, center.z + distance);
  captureCamera.up.set(0, 1, 0);
  captureCamera.lookAt(center);
  captureCamera.near = Math.max(0.001, distance / 1000);
  captureCamera.far = Math.max(camera.far, distance * 10);
  captureCamera.updateProjectionMatrix();
  captureCamera.updateMatrixWorld();

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
    renderer.render(scene, captureCamera);
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
