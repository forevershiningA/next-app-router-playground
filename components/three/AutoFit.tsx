// components/three/AutoFit.tsx
"use client";

import * as React from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useHeadstoneStore } from "#/lib/headstone-store";

type Props = {
  target: React.RefObject<THREE.Object3D>;
  margin?: number;            // extra framing space
  baseHeight?: number;        // include this much below the tablet (to cover the base)
  duration?: number;          // seconds for the tween
  pad?: number;               // small extra distance in front of the object
  front?: "posZ" | "negZ";    // which side is “front”
};

export default function AutoFit({
  target,
  margin = 1.15,
  baseHeight = 0,
  duration = 0.6,
  pad = 0.02,
  front = "posZ",
}: Props) {
  const { camera, size, controls, invalidate } = useThree() as {
    camera: THREE.PerspectiveCamera;
    size: { width: number; height: number };
    controls: any | undefined; // OrbitControls
    invalidate: () => void;
  };

  // Trigger only on size (mm) changes
  const heightMm = useHeadstoneStore((s: any) => s.heightMm);
  const widthMm  = useHeadstoneStore((s: any) => s.widthMm);

  const lastDims = React.useRef<{ h: number; w: number }>({ h: heightMm, w: widthMm });
  const animRef = React.useRef<number | null>(null);
  const isAnimating = React.useRef(false);
  const didInitFit = React.useRef(false);

  const easeInOutCubic = (x: number) =>
    x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

  const computePose = React.useCallback(() => {
    const obj = target.current;
    if (!obj) return null;

    obj.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(obj);
    if (box.isEmpty()) return null;

    // extend down to include the base (if desired)
    if (baseHeight > 0) box.min.y -= baseHeight;

    const center = box.getCenter(new THREE.Vector3());
    const sizeV  = box.getSize(new THREE.Vector3());
    if (sizeV.lengthSq() === 0) sizeV.setScalar(1e-3);

    // perspective fit
    const vFov = THREE.MathUtils.degToRad(camera.fov);
    const aspect = size.width / Math.max(1, size.height);
    const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);

    const halfY = sizeV.y * 0.5;
    const halfX = sizeV.x * 0.5;
    const halfZ = sizeV.z * 0.5;

    const distV = halfY / Math.tan(vFov / 2);
    const distH = halfX / Math.tan(hFov / 2);
    const dist  = Math.max(distV, distH) * Math.max(1, margin);

    const dir = front === "negZ" ? new THREE.Vector3(0, 0, -1) : new THREE.Vector3(0, 0, 1);
    const camDist = dist + halfZ + pad;

    const toPos = center.clone().addScaledVector(dir, camDist);
    const toTgt = center;

    // controls distances
    const sphere = new THREE.Sphere();
    box.getBoundingSphere(sphere);
    const safeMin = sphere.radius * 1.35 + 0.05;

    return { toPos, toTgt, safeMin };
  }, [target, camera.fov, size.width, size.height, margin, pad, front, baseHeight]);

  const animateTo = React.useCallback(
    (toPos: THREE.Vector3, toTgt: THREE.Vector3, safeMin: number) => {
      if (isAnimating.current) return;
      isAnimating.current = true;

      const fromPos = camera.position.clone();
      const fromTgt =
        controls?.target?.clone?.() ??
        camera.position.clone().add(camera.getWorldDirection(new THREE.Vector3()));

      const prevEnabled = controls?.enabled;
      if (controls) controls.enabled = false;

      const t0 = performance.now();
      const durMs = Math.max(1, duration * 1000);

      const step = () => {
        const t = Math.min(1, (performance.now() - t0) / durMs);
        const k = easeInOutCubic(t);

        camera.position.lerpVectors(fromPos, toPos, k);
        if (controls?.target) {
          controls.target.lerpVectors(fromTgt, toTgt, k);
          controls.update?.();
        } else {
          camera.lookAt(toTgt);
        }
        invalidate();

        if (t < 1) {
          animRef.current = requestAnimationFrame(step);
        } else {
          camera.position.copy(toPos);
          if (controls?.target) controls.target.copy(toTgt);
          if (controls) {
            controls.minDistance = safeMin;
            controls.maxDistance = Math.max(safeMin * 8, 5);
            controls.enabled = prevEnabled ?? true;
            controls.update?.();
          }
          isAnimating.current = false;
          animRef.current = null;
        }
      };

      animRef.current = requestAnimationFrame(step);
    },
    [camera, controls, duration, invalidate]
  );

  // 1) INIT: run once after first paint (so geometry has bounds)
  React.useEffect(() => {
    if (didInitFit.current) return;
    const id = requestAnimationFrame(() => {
      const pose = computePose();
      if (!pose) return;
      didInitFit.current = true;

      const { toPos, toTgt, safeMin } = pose;

      // If already in place, just snap limits
      const posDelta = camera.position.clone().sub(toPos).length();
      const tgtDelta =
        (controls?.target ? controls.target.clone() : toTgt.clone()).sub(toTgt).length();
      const EPS = 1e-3;

      if (posDelta < EPS && tgtDelta < EPS) {
        if (controls) {
          controls.minDistance = safeMin;
          controls.maxDistance = Math.max(safeMin * 8, 5);
          controls.update?.();
        }
        return;
      }

      animateTo(toPos, toTgt, safeMin);
    });
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ← once

  // 2) SIZE (mm) change: animate once per change
  React.useEffect(() => {
    const dimsChanged =
      Math.abs(heightMm - lastDims.current.h) > 1e-6 ||
      Math.abs(widthMm  - lastDims.current.w) > 1e-6;

    if (!dimsChanged) return;
    lastDims.current = { h: heightMm, w: widthMm };

    const pose = computePose();
    if (!pose) return;

    const { toPos, toTgt, safeMin } = pose;

    const posDelta = camera.position.clone().sub(toPos).length();
    const tgtDelta =
      (controls?.target ? controls.target.clone() : toTgt.clone()).sub(toTgt).length();
    const EPS = 1e-3;
    if (posDelta < EPS && tgtDelta < EPS) return;

    animateTo(toPos, toTgt, safeMin);

    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
        animRef.current = null;
        isAnimating.current = false;
        if (controls) controls.enabled = true;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [heightMm, widthMm]);

  return null;
}
