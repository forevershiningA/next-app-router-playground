// components/three/FullMonumentFit.tsx
// Replaces AutoFit for 'full-monument' product type.
// Positions the camera to show the complete grave plot from an elevated front angle.
'use client';

import * as React from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { FULL_MONUMENT_GROUP_NAME } from './constants';

type FullMonumentFitProps = {
  trigger?: number;
};

export default function FullMonumentFit({ trigger }: FullMonumentFitProps) {
  const { camera, controls, size, invalidate, scene } = useThree() as {
    camera: THREE.PerspectiveCamera;
    controls?: any;
    size: { width: number; height: number };
    invalidate: () => void;
    scene: THREE.Scene;
  };

  const ledgerDepthMm   = useHeadstoneStore((s) => s.ledgerDepthMm);
  const kerbWidthMm     = useHeadstoneStore((s) => s.kerbWidthMm);
  const kerbHeightMm    = useHeadstoneStore((s) => s.kerbHeightMm);
  const kerbDepthMm     = useHeadstoneStore((s) => s.kerbDepthMm);
  const heightMm        = useHeadstoneStore((s) => s.heightMm);
  const baseHeightMm    = useHeadstoneStore((s) => s.baseHeightMm);
  const uprightThickness = useHeadstoneStore((s) => s.uprightThickness);
  const productId       = useHeadstoneStore((s) => s.productId);
  const shapeUrl        = useHeadstoneStore((s) => s.shapeUrl);
  const showLedger      = useHeadstoneStore((s) => s.showLedger);
  const showKerbset     = useHeadstoneStore((s) => s.showKerbset);

  React.useLayoutEffect(() => {
    let rafId: number | null = null;

    const applyFitFromBox = (box: THREE.Box3) => {
      const sizeVec = box.getSize(new THREE.Vector3());
      if (!isFinite(sizeVec.lengthSq()) || sizeVec.lengthSq() === 0) {
        scheduleRetry();
        return;
      }

      const center = box.getCenter(new THREE.Vector3());
      const halfWidth = Math.max(0.2, sizeVec.x / 2);
      const halfHeight = Math.max(0.3, sizeVec.y / 2);

      const margin = 1.08;
      const vFov = THREE.MathUtils.degToRad(camera.fov);
      const aspect = Math.max(1e-6, size.width / Math.max(1, size.height));
      const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
      const distY = (halfHeight * margin) / Math.tan(vFov / 2);
      const distX = (halfWidth * margin) / Math.tan(hFov / 2);
      const depthPad = sizeVec.z * 0.4 + 0.4;
      const distance = Math.max(distX, distY) + depthPad;

      const elevation = THREE.MathUtils.degToRad(12);
      const dir = new THREE.Vector3(0, Math.sin(elevation), Math.cos(elevation));

      const minTargetY = box.min.y + sizeVec.y * 0.35;
      const maxTargetY = box.min.y + sizeVec.y * 0.65;
      const targetY = THREE.MathUtils.clamp(
        box.min.y + sizeVec.y * 0.48,
        minTargetY,
        maxTargetY,
      );

      const target = new THREE.Vector3(center.x, targetY, center.z);
      const camPos = target.clone().addScaledVector(dir, distance);
      const camDist = camPos.distanceTo(target);

      camera.position.copy(camPos);
      camera.lookAt(target);
      camera.up.set(0, 1, 0);
      camera.near = Math.max(0.01, camDist * 0.015);
      camera.far = Math.max(100, camDist * 8);
      camera.updateProjectionMatrix();

      if (controls?.target) {
        controls.target.copy(target);
        controls.update?.();
      }

      invalidate();
    };

    const scheduleRetry = () => {
      rafId = window.requestAnimationFrame(fitCamera);
    };

    const fitCamera = () => {
      const targetObj = scene.getObjectByName(
        FULL_MONUMENT_GROUP_NAME,
      ) as THREE.Object3D | undefined;

      if (!targetObj) {
        scheduleRetry();
        return;
      }

      targetObj.updateWorldMatrix(true, true);
      const box = new THREE.Box3().setFromObject(targetObj);
      if (box.isEmpty()) {
        scheduleRetry();
        return;
      }

      applyFitFromBox(box);
      rafId = null;
    };

    fitCamera();

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, [
    ledgerDepthMm, kerbDepthMm, kerbWidthMm, kerbHeightMm,
    heightMm, baseHeightMm, uprightThickness,
    productId, shapeUrl, showLedger, showKerbset, trigger,
    camera, size.width, size.height, controls, invalidate, scene,
  ]);

  return null;
}
