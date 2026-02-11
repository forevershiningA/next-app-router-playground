// components/three/RotatingBoxOutline.tsx
'use client';

import * as React from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

type RotatingBoxOutlineProps<T extends THREE.Object3D = THREE.Object3D> = {
  /** Object whose bounds should be outlined */
  targetRef: React.RefObject<T> | React.MutableRefObject<T | null>;
  /** Toggle outline visibility */
  visible?: boolean;
  /** Outline color */
  color?: string | number;
  /** Expand the box slightly to avoid z-fighting (width/height planes) */
  pad?: number;
  /** Optional override specifically for depth padding */
  depthPad?: number;
  /** Push only the front corners outward along the local Z axis */
  frontExtension?: number;
  /** If true, draw through objects (no depth test) */
  through?: boolean;
  /** Render order for the helper */
  renderOrder?: number;
  /** If true, exclude addition models from bounding box calculation */
  excludeAdditions?: boolean;
  /** Length of corner arms relative to box size (0 to 0.5) */
  lineLength?: number;
  /** Only render corners facing the active camera */
  frontFacingOnly?: boolean;
  /** Raise bottom corners upward along the local Y axis (world units) */
  bottomLift?: number;
  /** Animate corner arms when the outline first becomes visible */
  animateOnShow?: boolean;
  /** Duration of the show animation in milliseconds */
  animationDuration?: number;
};

/**
 * Elegant bounding box outline with viewfinder corners that rotates with the target object.
 * Shows corner brackets instead of full box edges for a cleaner, professional look.
 */
export default function RotatingBoxOutline<T extends THREE.Object3D = THREE.Object3D>({
  targetRef,
  visible = true,
  color = 'white',
  pad = 0.004,
  depthPad,
  frontExtension = 0,
  through = true,
  renderOrder = 1000,
  excludeAdditions = false,
  lineLength = 0.15,
  frontFacingOnly = false,
  bottomLift = 0,
  animateOnShow = false,
  animationDuration = 420,
}: RotatingBoxOutlineProps) {
  const { gl } = useThree();
  const helperRef = React.useRef<THREE.LineSegments | null>(null);
  const depthPadding = depthPad ?? pad;
  const localBox = new THREE.Box3();
  const childBox = new THREE.Box3();
  const inverseMatrix = new THREE.Matrix4();
  const localCenter = new THREE.Vector3();
  const localSize = new THREE.Vector3();
  const worldCenter = new THREE.Vector3();
  const axisXVec = new THREE.Vector3();
  const axisYVec = new THREE.Vector3();
  const axisZVec = new THREE.Vector3();
  const axisXDir = new THREE.Vector3();
  const axisYDir = new THREE.Vector3();
  const axisZDir = new THREE.Vector3();
  const halfAxisX = new THREE.Vector3();
  const halfAxisY = new THREE.Vector3();
  const halfAxisZ = new THREE.Vector3();
  const armXVector = new THREE.Vector3();
  const armYVector = new THREE.Vector3();
  const cornerTemp = new THREE.Vector3();
  const endpointTemp = new THREE.Vector3();
  const cameraDir = new THREE.Vector3();
  const clippingPlaneRef = React.useRef(new THREE.Plane());
  const animationStartRef = React.useRef<number | null>(null);
  const animationProgressRef = React.useRef(animateOnShow ? 0 : 1);
  const prevVisibleRef = React.useRef(false);

  React.useEffect(() => {
    if (!frontFacingOnly) return;
    const prev = gl.localClippingEnabled;
    gl.localClippingEnabled = true;
    return () => {
      gl.localClippingEnabled = prev;
    };
  }, [gl, frontFacingOnly]);

  // Create the helper geometry and material (wait until target is ready)
  React.useEffect(() => {
    let rafId: number | null = null;

    const attachHelper = () => {
      const obj = targetRef.current;
      if (!obj) {
        rafId = requestAnimationFrame(attachHelper);
        return;
      }

      const geometry = new THREE.BufferGeometry();
      const material = new THREE.LineBasicMaterial({
        color: new THREE.Color(color as any).getHex(),
        depthTest: !through,
        depthWrite: false,
        transparent: true,
        opacity: 1.0,
        linewidth: 2,
        clippingPlanes: frontFacingOnly ? [clippingPlaneRef.current] : null,
        clipIntersection: false,
      });

      const helper = new THREE.LineSegments(geometry, material);
      helper.renderOrder = renderOrder;
      helper.matrixAutoUpdate = false;
      helperRef.current = helper;

      // Add helper to the scene root, not to the object's parent
      // This way it won't inherit any transforms
      let sceneRoot = obj;
      while (sceneRoot.parent) {
        sceneRoot = sceneRoot.parent;
      }
      sceneRoot.add(helper);
    };

    attachHelper();

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      if (helperRef.current) {
        helperRef.current.parent?.remove(helperRef.current);
        helperRef.current.geometry.dispose();
        (helperRef.current.material as THREE.Material)?.dispose();
        helperRef.current = null;
      }
    };
  }, [targetRef, color, through, renderOrder]);

  // Update the helper every frame
  useFrame((state) => {
    const obj = targetRef.current;
    const helper = helperRef.current;

    if (!helper || !obj || !visible) {
      if (helper) {
        helper.visible = false;
      }
      prevVisibleRef.current = false;
      animationStartRef.current = null;
      animationProgressRef.current = animateOnShow ? 0 : 1;
      return;
    }

    if (!prevVisibleRef.current) {
      animationStartRef.current = state.clock.elapsedTime;
    }

    if (animateOnShow) {
      const durationSec = Math.max(animationDuration / 1000, 1e-4);
      const startTime = animationStartRef.current ?? state.clock.elapsedTime;
      const elapsed = state.clock.elapsedTime - startTime;
      animationProgressRef.current = Math.min(1, elapsed / durationSec);
    } else {
      animationProgressRef.current = 1;
    }
    prevVisibleRef.current = true;

    const rawAnimProgress = animateOnShow ? animationProgressRef.current : 1;
    const easedProgress = rawAnimProgress >= 1 ? 1 : 1 - Math.pow(1 - rawAnimProgress, 3);
    const horizontalScale = animateOnShow
      ? Math.min(1, easedProgress * 1.35)
      : 1;
    const verticalScale = animateOnShow
      ? THREE.MathUtils.clamp((easedProgress - 0.2) / 0.8, 0, 1)
      : 1;

    const material = helper.material as THREE.LineBasicMaterial;
    const targetOpacity = animateOnShow ? 0.35 + 0.65 * easedProgress : 1;
    if (material.opacity !== targetOpacity) {
      material.opacity = targetOpacity;
    }

    // Calculate oriented bounding box in local space
    obj.updateWorldMatrix(true, true);
    inverseMatrix.copy(obj.matrixWorld).invert();
    localBox.makeEmpty();

    obj.traverse((child) => {
      if (!(child instanceof THREE.Mesh) || !child.geometry) {
        return;
      }

      const parentName = child.parent?.name || '';
      const childName = child.name || '';
      const isAddition = parentName.startsWith('addition-') || childName.startsWith('addition-');
      const isText = child.geometry.type === 'TextGeometry' ||
        childName.includes('text') ||
        parentName.includes('text') ||
        child.userData?.isText;

      if (excludeAdditions && (isAddition || isText)) {
        return;
      }

      if (!child.geometry.boundingBox) {
        child.geometry.computeBoundingBox();
      }
      if (child.geometry.boundingBox) {
        childBox.copy(child.geometry.boundingBox);
        childBox.applyMatrix4(child.matrixWorld);
        childBox.applyMatrix4(inverseMatrix);
        localBox.union(childBox);
      }
    });

    if (localBox.isEmpty()) {
      helper.visible = false;
      return;
    }

    localBox.getCenter(localCenter);
    localBox.getSize(localSize);

    if (localSize.lengthSq() === 0) {
      helper.visible = false;
      return;
    }

    axisXVec.setFromMatrixColumn(obj.matrixWorld, 0);
    axisYVec.setFromMatrixColumn(obj.matrixWorld, 1);
    axisZVec.setFromMatrixColumn(obj.matrixWorld, 2);

    const axisXLength = axisXVec.length() || 1;
    const axisYLength = axisYVec.length() || 1;
    const axisZLength = axisZVec.length() || 1;

    axisXDir.copy(axisXVec).divideScalar(axisXLength);
    axisYDir.copy(axisYVec).divideScalar(axisYLength);
    axisZDir.copy(axisZVec).divideScalar(axisZLength);

    const width = localSize.x * axisXLength;
    const height = localSize.y * axisYLength;
    const depth = localSize.z * axisZLength;

    const paddedWidth = width + pad * 2;
    const paddedHeight = height + pad * 2;
    const paddedDepth = depth + depthPadding * 2;

    const halfWidth = paddedWidth / 2;
    const halfHeight = paddedHeight / 2;
    const halfDepth = paddedDepth / 2;

    halfAxisX.copy(axisXDir).multiplyScalar(halfWidth);
    halfAxisY.copy(axisYDir).multiplyScalar(halfHeight);
    halfAxisZ.copy(axisZDir).multiplyScalar(halfDepth);

    const lenX = paddedWidth * lineLength;
    const lenY = paddedHeight * lineLength;

    armXVector.copy(axisXDir).multiplyScalar(lenX);
    armYVector.copy(axisYDir).multiplyScalar(lenY);

    worldCenter.copy(localCenter).applyMatrix4(obj.matrixWorld);

    cameraDir.copy(state.camera.position).sub(worldCenter);
    const cameraDistanceSq = cameraDir.lengthSq();
    if (cameraDistanceSq > 1e-9) {
      cameraDir.divideScalar(Math.sqrt(cameraDistanceSq));
    } else {
      cameraDir.set(0, 0, 1);
    }

    if (frontFacingOnly && helper) {
      clippingPlaneRef.current.setFromNormalAndCoplanarPoint(cameraDir, worldCenter);
      clippingPlaneRef.current.constant += depthPadding;
      (helper.material as THREE.LineBasicMaterial).clippingPlanes = [clippingPlaneRef.current];
    }

    const positions: number[] = [];
    const pushLine = (start: THREE.Vector3, end: THREE.Vector3) => {
      positions.push(start.x, start.y, start.z, end.x, end.y, end.z);
    };

    const cornerSigns: [number, number, number][] = [
      [-1, -1, 1],
      [1, -1, 1],
      [-1, -1, -1],
      [1, -1, -1],
      [-1, 1, 1],
      [1, 1, 1],
      [-1, 1, -1],
      [1, 1, -1],
    ];

    cornerSigns.forEach(([sx, sy, sz]) => {
      cornerTemp
        .copy(worldCenter)
        .addScaledVector(halfAxisX, sx)
        .addScaledVector(halfAxisY, sy)
        .addScaledVector(halfAxisZ, sz);

      if (sy < 0 && bottomLift !== 0) {
        cornerTemp.addScaledVector(axisYDir, bottomLift);
      }

      if (frontExtension !== 0 && sz > 0) {
        cornerTemp.addScaledVector(axisZDir, frontExtension);
      }

      if (horizontalScale > 0.0001) {
        endpointTemp.copy(cornerTemp).addScaledVector(armXVector, -sx * horizontalScale);
        pushLine(cornerTemp, endpointTemp);
      }

      if (verticalScale > 0.0001) {
        endpointTemp.copy(cornerTemp).addScaledVector(armYVector, -sy * verticalScale);
        pushLine(cornerTemp, endpointTemp);
      }

      // Skip the depth leg so corners stay like a 2D viewfinder even on thick meshes
    });

    const vertices = new Float32Array(positions);
    helper.geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    helper.geometry.computeBoundingSphere();
    
    // Position helper at world origin with identity transform
    // The geometry vertices are already in world space
    helper.position.set(0, 0, 0);
    helper.rotation.set(0, 0, 0);
    helper.scale.set(1, 1, 1);
    helper.updateMatrix();
    helper.matrixAutoUpdate = false;
    
    helper.visible = true;
  });

  return null;
}
