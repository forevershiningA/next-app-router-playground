// components/three/FullMonumentFit.tsx
// Replaces AutoFit for 'full-monument' product type.
// Positions the camera to show the complete grave plot from an elevated front angle.
'use client';

import * as React from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { FULL_MONUMENT_GROUP_NAME, UPRIGHT_ASSEMBLY_NAME } from './constants';

type FullMonumentFitProps = {
  trigger?: number;
};

const HEADSTONE_OBJECT_NAME = 'headstone';
const CAMERA_ANIMATION_MS = 630;
const BOX_EPSILON = 1e-4;
const HEADSTONE_FRONT_ELEVATION = 0.06;

/** Compute bounding box from structural Mesh children only, skipping motifs/helpers. */
const computeMeshBox = (root: THREE.Object3D): THREE.Box3 => {
  const box = new THREE.Box3();
  const _childBox = new THREE.Box3();
  root.updateWorldMatrix(true, true);
  root.traverse((child) => {
    if (!child.visible) return;
    if (!(child instanceof THREE.Mesh)) return;
    if (!child.geometry) return;
    // Skip motifs — placed on surfaces, shouldn't affect camera framing
    if (child.name.startsWith('motif-')) return;
    if (!child.geometry.boundingBox) child.geometry.computeBoundingBox();
    if (!child.geometry.boundingBox) return;
    _childBox.copy(child.geometry.boundingBox);
    _childBox.applyMatrix4(child.matrixWorld);
    // Sanity: skip meshes with extreme world positions (>10m from origin)
    const cx = (_childBox.min.x + _childBox.max.x) / 2;
    const cy = (_childBox.min.y + _childBox.max.y) / 2;
    const cz = (_childBox.min.z + _childBox.max.z) / 2;
    if (Math.abs(cx) > 10 || Math.abs(cy) > 10 || Math.abs(cz) > 10) return;
    box.union(_childBox);
  });
  return box;
};

type CameraPose = {
  position: THREE.Vector3;
  target: THREE.Vector3;
  near: number;
  far: number;
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
  const selected        = useHeadstoneStore((s) => s.selected);
  const selectedInscriptionId = useHeadstoneStore((s) => s.selectedInscriptionId);
  const selectedAdditionId = useHeadstoneStore((s) => s.selectedAdditionId);
  const selectedMotifId = useHeadstoneStore((s) => s.selectedMotifId);
  const selectedImageId = useHeadstoneStore((s) => s.selectedImageId);
  const selectedInscriptionSurface = useHeadstoneStore((s) =>
    selectedInscriptionId
      ? (s.inscriptions.find((line) => line.id === selectedInscriptionId)?.target ?? 'headstone')
      : null,
  );
  const selectedAdditionSurface = useHeadstoneStore((s) =>
    selectedAdditionId
      ? (s.additionOffsets[selectedAdditionId]?.targetSurface ?? 'headstone')
      : null,
  );
  const selectedMotifSurface = useHeadstoneStore((s) =>
    selectedMotifId
      ? (s.motifOffsets[selectedMotifId]?.target ?? 'headstone')
      : null,
  );
  const selectedImageSurface = useHeadstoneStore((s) =>
    selectedImageId
      ? (s.selectedImages.find((image) => image.id === selectedImageId)?.target ?? 'headstone')
      : null,
  );
  const isMaterialChange = useHeadstoneStore((s) => s.isMaterialChange);
  const animationFrameRef = React.useRef<number | null>(null);
  const hasAppliedInitialPoseRef = React.useRef(false);
  const shouldFocusHeadstone =
    selected === 'headstone' ||
    selectedInscriptionSurface === 'headstone' ||
    selectedAdditionSurface === 'headstone' ||
    selectedMotifSurface === 'headstone' ||
    selectedImageSurface === 'headstone';
  const shouldFocusBase =
    selected === 'base' ||
    selectedInscriptionSurface === 'base' ||
    selectedAdditionSurface === 'base' ||
    selectedMotifSurface === 'base' ||
    selectedImageSurface === 'base';
  // Zoom in for headstone or base (both are on the upright assembly)
  const shouldZoomIn = shouldFocusHeadstone || shouldFocusBase;
  const lastSelectedRef = React.useRef(shouldZoomIn);
  const lastFitKeyRef = React.useRef<string | null>(null);
  const materialChangeActiveRef = React.useRef(false);
  const lastAppliedBoxRef = React.useRef<THREE.Box3 | null>(null);
  const lastZoomModeRef = React.useRef<boolean | null>(null);
  const fitKey = [
    ledgerDepthMm,
    kerbWidthMm,
    kerbHeightMm,
    kerbDepthMm,
    heightMm,
    baseHeightMm,
    uprightThickness,
    productId ?? '',
    shapeUrl ?? '',
    showLedger ? '1' : '0',
    showKerbset ? '1' : '0',
    size.width,
    size.height,
  ].join('|');

  React.useLayoutEffect(() => {
    let retryRafId: number | null = null;
    const previousZoomIn = lastSelectedRef.current;
    const previousFitKey = lastFitKeyRef.current;
    const selectionChanged = previousZoomIn !== shouldZoomIn;
    const fitInputsChanged = previousFitKey !== fitKey;
    const materialChangeJustEnded = materialChangeActiveRef.current && !isMaterialChange;

    if (isMaterialChange) {
      materialChangeActiveRef.current = true;
    } else {
      materialChangeActiveRef.current = false;
    }

    lastSelectedRef.current = shouldZoomIn;
    lastFitKeyRef.current = fitKey;

    if (isMaterialChange && hasAppliedInitialPoseRef.current) {
      return;
    }

    if (materialChangeJustEnded && hasAppliedInitialPoseRef.current) {
      return;
    }

    if (
      hasAppliedInitialPoseRef.current &&
      selectionChanged &&
      !fitInputsChanged &&
      !shouldZoomIn &&
      !previousZoomIn
    ) {
      return;
    }

    const easeInOutCubic = (x: number) =>
      x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

    const getPoseFromBox = (
      box: THREE.Box3,
      zoomToHeadstone: boolean,
      preferredDirection?: THREE.Vector3,
    ): CameraPose | null => {
      const sizeVec = box.getSize(new THREE.Vector3());
      if (!isFinite(sizeVec.lengthSq()) || sizeVec.lengthSq() === 0) {
        return null;
      }

      const center = box.getCenter(new THREE.Vector3());
      const halfWidth = Math.max(0.2, sizeVec.x / 2);
      const halfHeight = Math.max(0.3, sizeVec.y / 2);

      const margin = zoomToHeadstone ? 1.02 : 1.08;
      const vFov = THREE.MathUtils.degToRad(camera.fov);
      const aspect = Math.max(1e-6, size.width / Math.max(1, size.height));
      const hFov = 2 * Math.atan(Math.tan(vFov / 2) * aspect);
      const distY = (halfHeight * margin) / Math.tan(vFov / 2);
      const distX = (halfWidth * margin) / Math.tan(hFov / 2);
      const depthPad = zoomToHeadstone
        ? sizeVec.z * 0.25 + 0.2
        : sizeVec.z * 0.4 + 0.4;
      const distance = Math.max(distX, distY) + depthPad;

      const elevation = THREE.MathUtils.degToRad(zoomToHeadstone ? 10 : 12);
      const fallbackDirection = new THREE.Vector3(0, Math.sin(elevation), Math.cos(elevation));
      const dir = preferredDirection && preferredDirection.lengthSq() > 1e-6
        ? preferredDirection.clone().normalize()
        : fallbackDirection;

      const minTargetY = box.min.y + sizeVec.y * (zoomToHeadstone ? 0.3 : 0.35);
      const maxTargetY = box.min.y + sizeVec.y * (zoomToHeadstone ? 0.6 : 0.65);
      const targetY = THREE.MathUtils.clamp(
        box.min.y + sizeVec.y * (zoomToHeadstone ? 0.45 : 0.48),
        minTargetY,
        maxTargetY,
      );

      const target = new THREE.Vector3(center.x, targetY, center.z);
      const camPos = target.clone().addScaledVector(dir, distance);
      const camDist = camPos.distanceTo(target);

      return {
        position: camPos,
        target,
        near: Math.max(0.01, camDist * 0.015),
        far: Math.max(100, camDist * 8),
      };
    };

    const getHeadstoneFrontDirection = (targetObj: THREE.Object3D) => {
      const worldQuaternion = new THREE.Quaternion();
      targetObj.getWorldQuaternion(worldQuaternion);

      const frontDirection = new THREE.Vector3(0, 0, 1).applyQuaternion(worldQuaternion);
      frontDirection.y = 0;

      if (frontDirection.lengthSq() <= 1e-6) {
        frontDirection.set(0, 0, 1);
      } else {
        frontDirection.normalize();
      }

      frontDirection.y = HEADSTONE_FRONT_ELEVATION;
      return frontDirection.normalize();
    };

    const applyPose = (pose: CameraPose) => {
      camera.position.copy(pose.position);
      camera.up.set(0, 1, 0);
      camera.near = pose.near;
      camera.far = pose.far;
      camera.lookAt(pose.target);
      camera.updateProjectionMatrix();

      if (controls?.target) {
        controls.target.copy(pose.target);
        controls.update?.();
      }

      invalidate();
    };

    const animateToPose = (pose: CameraPose) => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      if (!hasAppliedInitialPoseRef.current) {
        applyPose(pose);
        hasAppliedInitialPoseRef.current = true;
        return;
      }

      const startPosition = camera.position.clone();
      const startTarget = controls?.target
        ? controls.target.clone()
        : new THREE.Vector3(0, 0, 0);
      const startNear = camera.near;
      const startFar = camera.far;
      const startTime = performance.now();

      const step = (now: number) => {
        const progress = Math.min(1, (now - startTime) / CAMERA_ANIMATION_MS);
        const eased = easeInOutCubic(progress);

        camera.position.lerpVectors(startPosition, pose.position, eased);
        const nextTarget = new THREE.Vector3().lerpVectors(
          startTarget,
          pose.target,
          eased,
        );

        camera.up.set(0, 1, 0);
        camera.near = THREE.MathUtils.lerp(startNear, pose.near, eased);
        camera.far = THREE.MathUtils.lerp(startFar, pose.far, eased);
        camera.lookAt(nextTarget);
        camera.updateProjectionMatrix();

        if (controls?.target) {
          controls.target.copy(nextTarget);
          controls.update?.();
        }

        invalidate();

        if (progress < 1) {
          animationFrameRef.current = window.requestAnimationFrame(step);
          return;
        }

        animationFrameRef.current = null;
        applyPose(pose);
      };

      animationFrameRef.current = window.requestAnimationFrame(step);
    };

    const applyFitFromBox = (
      box: THREE.Box3,
      zoomToHeadstone: boolean,
      preferredDirection?: THREE.Vector3,
    ) => {
      const pose = getPoseFromBox(box, zoomToHeadstone, preferredDirection);
      if (!pose) {
        scheduleRetry();
        return;
      }

      animateToPose(pose);
      lastAppliedBoxRef.current = box.clone();
      lastZoomModeRef.current = zoomToHeadstone;
    };

    const scheduleRetry = () => {
      retryRafId = window.requestAnimationFrame(fitCamera);
    };

    const fitCamera = () => {
      const zoomIn = shouldZoomIn;
      const shouldAnimateFromZoomOut =
        hasAppliedInitialPoseRef.current &&
        selectionChanged &&
        !fitInputsChanged &&
        previousZoomIn &&
        !shouldZoomIn;
      // Headstone → headstone mesh, Base → upright assembly, otherwise → full monument
      const targetObj = shouldFocusHeadstone
        ? scene.getObjectByName(HEADSTONE_OBJECT_NAME)
        : shouldFocusBase
          ? (scene.getObjectByName(UPRIGHT_ASSEMBLY_NAME) ?? scene.getObjectByName(HEADSTONE_OBJECT_NAME))
          : scene.getObjectByName(FULL_MONUMENT_GROUP_NAME);

      if (!targetObj) {
        scheduleRetry();
        return;
      }

      targetObj.updateWorldMatrix(true, true);
      const box = computeMeshBox(targetObj);
      if (box.isEmpty()) {
        scheduleRetry();
        return;
      }

      const previousBox = lastAppliedBoxRef.current;
      const boxChanged =
        !previousBox ||
        lastZoomModeRef.current !== zoomIn ||
        previousBox.min.distanceToSquared(box.min) > BOX_EPSILON ||
        previousBox.max.distanceToSquared(box.max) > BOX_EPSILON;

      if (
        hasAppliedInitialPoseRef.current &&
        !selectionChanged &&
        !fitInputsChanged &&
        !boxChanged
      ) {
        return;
      }

      const currentTarget = controls?.target
        ? controls.target.clone()
        : new THREE.Vector3(0, 0, 0);
      const preferredDirection = zoomIn
        ? getHeadstoneFrontDirection(targetObj)
        : shouldAnimateFromZoomOut
          ? camera.position.clone().sub(currentTarget).normalize()
          : undefined;

      applyFitFromBox(box, zoomIn, preferredDirection);
      retryRafId = null;
    };

    fitCamera();

    return () => {
      if (retryRafId !== null) {
        window.cancelAnimationFrame(retryRafId);
      }
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [
    ledgerDepthMm, kerbDepthMm, kerbWidthMm, kerbHeightMm,
    heightMm, baseHeightMm, uprightThickness,
    productId, shapeUrl, showLedger, showKerbset, selected, trigger,
    selectedInscriptionId, selectedAdditionId, selectedMotifId, selectedImageId,
    selectedInscriptionSurface, selectedAdditionSurface, selectedMotifSurface, selectedImageSurface,
    isMaterialChange, camera, size.width, size.height, controls, invalidate, scene, fitKey,
    shouldFocusHeadstone, shouldFocusBase, shouldZoomIn,
  ]);

  return null;
}
