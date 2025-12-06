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
};

export default function AutoFit({
  target,
  margin = 0.5,
  duration = 0.25,
  pad = 0,
  readyTimeoutMs = 50,
  resizeDebounceMs = 1,
  trigger,
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
  const showBase = useHeadstoneStore((s: any) => s.showBase);

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

    const boxSize = new THREE.Vector3();
    box.getSize(boxSize);
    
    // Calculate proportional offset based on object height and whether base is shown
    // For plaques (no base), center more precisely without accounting for ground
    // For headstones with base, offset to account for header
    let verticalOffset;
    if (!showBase) {
      // Plaque: minimal offset, just center it
      verticalOffset = 0;
    } else {
      // Headstone with base: use proportional offset for header
      const heightRatio = boxSize.y > 1 ? 0.15 : 0.20;
      verticalOffset = boxSize.y * heightRatio;
    }
    
    // Offset the target downward so camera shows more of the top
    const toTgt = sphere.center.clone();
    toTgt.y -= verticalOffset; // Dynamic offset based on object size and type

    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const aspect = Math.max(1e-6, size.width / Math.max(1, size.height));
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
    const dY = sphere.radius / Math.tan(vFov / 2);
    const dX = sphere.radius / Math.tan(hFov / 2);
    const dist = Math.max(dX, dY) * Math.max(1, margin) + pad;

    const dir = new THREE.Vector3(0, 0, 1); // Front view
    dir.normalize();

    const toPos = toTgt.clone().addScaledVector(dir, dist);

    // Explicitly set camera rotation to look directly at the target
    camera.position.copy(toPos);
    camera.lookAt(toTgt);
    
    // For 2D view, ensure camera stays perfectly level (no tilt)
    if (view === '2d') {
      camera.rotation.z = 0; // No roll
      camera.up.set(0, 1, 0); // Ensure up vector is correct
    }

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
  }, [target, camera, size.width, size.height, margin, pad, controls, trigger, heightMm, widthMm, showBase]);

  return null;
}
