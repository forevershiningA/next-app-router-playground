// components/three/AutoFit.tsx
'use client';

import * as React from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useHeadstoneStore } from '#/lib/headstone-store';

type Props = {
  target: React.RefObject<THREE.Object3D>; // tablet/upright ONLY (no base/ground)
  margin?: number; // >=1, extra room from exact fit
  baseHeight?: number; // scene units BELOW tablet bottom to include
  duration?: number; // seconds for the move animation
  pad?: number; // extra distance in front (scene units)
  yBias?: number; // fraction of tablet height to nudge upward (e.g. 0.02)
  readyTimeoutMs?: number; // wait up to this long for a stable first fit
  resizeDebounceMs?: number; // debounce for resize refit
  trigger?: unknown; // bump to force a refit (e.g. after texture/shape is ready)
};

export default function AutoFit({
  target,
  margin = 1.12,
  baseHeight = 0,
  duration = 0.5,
  pad = 0.02,
  yBias = 0,
  readyTimeoutMs = 1500,
  resizeDebounceMs = 120,
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

  const lastDims = React.useRef({ h: heightMm, w: widthMm });
  const animId = React.useRef<number | null>(null);
  const didFirst = React.useRef(false);

  const easeInOutCubic = (x: number) =>
    x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

  /** Compute a deterministic pose given current camera view direction. */
  const computePose = React.useCallback(() => {
    const obj = target.current;
    if (!obj) return null;

    obj.updateWorldMatrix(true, true);

    // Tablet-only bounds (must NOT include base/ground)
    const boxTablet = new THREE.Box3().setFromObject(obj);
    if (boxTablet.isEmpty()) return null;

    const tabletSize = boxTablet.getSize(new THREE.Vector3());
    if (tabletSize.lengthSq() === 0) return null;

    // Fit volume = tablet + base downward (synthetic)
    const fitBox = boxTablet.clone();
    if (baseHeight > 0) fitBox.min.y -= baseHeight;

    // Robust radius via bounding sphere
    const sphere = new THREE.Sphere();
    fitBox.getBoundingSphere(sphere);

    // Vertical midline between tablet top and base bottom
    const topY = boxTablet.max.y;
    const bottomY = boxTablet.min.y;
    const baseBottom = bottomY - Math.max(0, baseHeight);

    let midY = (topY + baseBottom) / 2;
    if (yBias) midY += tabletSize.y * yBias;

    // Look target: use sphere X/Z but our midY
    const toTgt = new THREE.Vector3(sphere.center.x, midY, sphere.center.z);

    // Distance needed to fit the sphere (respect V/H FOV)
    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const aspect = Math.max(1e-6, size.width / Math.max(1, size.height));
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
    const dY = sphere.radius / Math.tan(vFov / 2);
    const dX = sphere.radius / Math.tan(hFov / 2);
    const dist = Math.max(dX, dY) * Math.max(1, margin) + pad;

    // Preserve current azimuth/elevation: move along vector from current target to camera
    const currTarget = controls?.target
      ? (controls.target as THREE.Vector3).clone()
      : (() => {
          const forward = new THREE.Vector3();
          camera.getWorldDirection(forward); // camera -> scene
          const guessDist = camera.position.distanceTo(toTgt);
          return camera.position.clone().addScaledVector(forward, guessDist);
        })();

    let dir = new THREE.Vector3().subVectors(camera.position, currTarget);
    if (dir.lengthSq() < 1e-8) dir.set(0, 0, 1);
    dir.normalize();

    const toPos = toTgt.clone().addScaledVector(dir, dist);

    // Keep near/far sensible for any scene scale
    const near = Math.max(0.01, dist * 0.01);
    const far = Math.max(dist * 10, camera.far);

    return { toPos, toTgt, near, far };
  }, [
    target,
    camera,
    size.width,
    size.height,
    margin,
    pad,
    baseHeight,
    yBias,
    controls,
  ]);

  /** Move camera/controls to pose (with animation). */
  const moveTo = React.useCallback(
    (toPos: THREE.Vector3, toTgt: THREE.Vector3, near: number, far: number) => {
      const fromPos = camera.position.clone();
      const fromTgt = controls?.target
        ? (controls.target as THREE.Vector3).clone()
        : (() => {
            const forward = new THREE.Vector3();
            camera.getWorldDirection(forward);
            const dist = camera.position.distanceTo(toTgt);
            return camera.position.clone().addScaledVector(forward, dist);
          })();

      const t0 = performance.now();
      const durMs = Math.max(1, duration * 1000);

      const step = () => {
        const t = Math.min(1, (performance.now() - t0) / durMs);
        const k = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; // easeInOutCubic

        camera.position.lerpVectors(fromPos, toPos, k);
        if (controls?.target) {
          controls.target.lerpVectors(fromTgt, toTgt, k);
          controls.update?.();
        } else {
          camera.lookAt(toTgt);
        }
        invalidate();

        if (t < 1) {
          requestAnimationFrame(step);
        } else {
          camera.position.copy(toPos);
          if (controls?.target) {
            controls.target.copy(toTgt);
            controls.update?.();
          } else {
            camera.lookAt(toTgt);
          }
          camera.near = near;
          camera.far = far;
          camera.updateProjectionMatrix();
        }
      };

      requestAnimationFrame(step);
    },
    [camera, controls, duration, invalidate],
  );

  /** Perform (or retry) the fit. Always runs; no delta skipping. */
  const runFit = React.useCallback(() => {
    const pose = computePose();
    if (!pose) return false;
    const { toPos, toTgt, near, far } = pose;
    moveTo(toPos, toTgt, near, far);
    return true;
  }, [computePose, moveTo]);

  // First fit — wait briefly for a stable target and canvas
  React.useEffect(() => {
    if (didFirst.current) return;

    let raf1 = 0,
      raf2 = 0,
      timeoutId: any;

    const tryFit = () => {
      if (runFit()) {
        didFirst.current = true;
        return;
      }
      // keep trying next frames until timeout
      raf2 = requestAnimationFrame(tryFit);
    };

    raf1 = requestAnimationFrame(tryFit);
    timeoutId = setTimeout(() => {
      // last-chance attempt even if not stable
      if (!didFirst.current) {
        runFit();
        didFirst.current = true;
      }
    }, readyTimeoutMs);

    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
      clearTimeout(timeoutId);
    };
  }, [runFit, readyTimeoutMs]);

  // Refit when OrbitControls finally exists (common mount race)
  React.useEffect(() => {
    if (!controls) return;
    requestAnimationFrame(() => runFit());
  }, [controls, runFit]);

  // Refit on canvas resize (debounced)
  React.useEffect(() => {
    if (!didFirst.current) return;
    const id = setTimeout(() => runFit(), resizeDebounceMs);
    return () => clearTimeout(id);
  }, [size.width, size.height, resizeDebounceMs, runFit]);

  // Refit when dimensions (mm) change
  React.useEffect(() => {
    const changed =
      Math.abs(heightMm - lastDims.current.h) > 1e-6 ||
      Math.abs(widthMm - lastDims.current.w) > 1e-6;
    if (!changed) return;

    lastDims.current = { h: heightMm, w: widthMm };
    runFit();
  }, [heightMm, widthMm, runFit]);

  // Refit on external trigger (shape/texture ready, etc.)
  React.useEffect(() => {
    if (trigger === undefined) return;
    runFit();
  }, [trigger, runFit]);

  // Cleanup
  React.useEffect(() => {
    return () => {
      if (animId.current !== null) {
        cancelAnimationFrame(animId.current);
        animId.current = null;
      }
    };
  }, []);

  return null;
}
