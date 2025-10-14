// components/three/AutoFit.tsx
'use client';

import * as React from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useHeadstoneStore } from '#/lib/headstone-store';

type Props = {
  target: React.RefObject<THREE.Object3D>; // tablet/upright ONLY (no base/ground)
  margin?: number; // >=1, extra room from exact fit
  duration?: number; // seconds for the move animation
  pad?: number; // extra distance in front (scene units)
  readyTimeoutMs?: number; // wait up to this long for a stable first fit
  resizeDebounceMs?: number; // debounce for resize refit
  trigger?: unknown; // bump to force a refit (e.g. after texture/shape is ready)
  view?: '2d' | '3d';
};

export default function AutoFit({
  target,
  margin = 10,
  duration = 0.25,
  pad = 1,
  readyTimeoutMs = 50,
  resizeDebounceMs = 1,
  trigger,
  view = '2d',
}: Props) {
  const { camera, size, controls, invalidate } = useThree() as {
    camera: THREE.PerspectiveCamera;
    size: { width: number; height: number };
    controls?: any; // OrbitControls if makeDefault
    invalidate: () => void;
  };

  // if you drive size from a store, keep these so refits happen on changes
  const heightMm = useHeadstoneStore((s: any) => s.heightMm);
  const widthMm = useHeadstoneStore((s: any) => s.widthMm);

  const lastDims = React.useRef({ h: heightMm, w: widthMm });
  const animId = React.useRef<number | null>(null);
  const didFirst = React.useRef(false);

  const easeInOutCubic = (x: number) =>
    x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

  /** Compute a deterministic pose given current camera view direction. */
  React.useLayoutEffect(() => {
    const obj = target.current;
    if (!obj) return;

    obj.updateWorldMatrix(true, true);

    const box = new THREE.Box3().setFromObject(obj);
    if (box.isEmpty()) return;

    const sphere = new THREE.Sphere();
    box.getBoundingSphere(sphere);

    const toTgt = sphere.center.clone();

    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const aspect = Math.max(1e-6, size.width / Math.max(1, size.height));
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
    const dY = sphere.radius / Math.tan(vFov / 2);
    const dX = sphere.radius / Math.tan(hFov / 2);
    const dist = Math.max(dX, dY) * Math.max(1, margin) + pad;

    let dir;
    if (view === '2d') {
      dir = new THREE.Vector3(0, 0, 1); // Front view
    } else {
      dir = new THREE.Vector3(0, 0, 1); // Fixed front view for 3D
    }
    dir.normalize();

    const toPos = toTgt.clone().addScaledVector(dir, dist);

    // Explicitly set camera rotation to look directly at the target
    camera.position.copy(toPos);
    camera.lookAt(toTgt);

    // If controls exist, update their target as well
    if (controls?.target) {
      controls.target.copy(toTgt);
      controls.update?.();
    }

    const near = Math.max(0.01, dist * 0.01);
    const far = Math.max(dist * 10, camera.far);
    camera.near = near;
    camera.far = far;
    camera.updateProjectionMatrix();
    invalidate();
  }, [target, camera, size.width, size.height, margin, pad, controls, view, trigger]);

  return null;
}
