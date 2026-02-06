// components/three/RotatingBoxOutline.tsx
'use client';

import * as React from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

type RotatingBoxOutlineProps<T extends THREE.Object3D = THREE.Object3D> = {
  /** Object whose bounds should be outlined */
  targetRef: React.RefObject<T> | React.MutableRefObject<T | null>;
  /** Toggle outline visibility */
  visible?: boolean;
  /** Outline color */
  color?: string | number;
  /** Expand the box slightly to avoid z-fighting */
  pad?: number;
  /** If true, draw through objects (no depth test) */
  through?: boolean;
  /** Render order for the helper */
  renderOrder?: number;
  /** If true, exclude addition models from bounding box calculation */
  excludeAdditions?: boolean;
  /** Length of corner arms relative to box size (0 to 0.5) */
  lineLength?: number;
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
  through = true,
  renderOrder = 1000,
  excludeAdditions = false,
  lineLength = 0.15,
}: RotatingBoxOutlineProps) {
  const helperRef = React.useRef<THREE.LineSegments | null>(null);
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
  const armZVector = new THREE.Vector3();
  const cornerTemp = new THREE.Vector3();
  const endpointTemp = new THREE.Vector3();

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
  useFrame(() => {
    const obj = targetRef.current;
    const helper = helperRef.current;
    
    if (!obj || !helper || !visible) {
      if (helper) helper.visible = false;
      return;
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
    const paddedDepth = depth + pad * 2;

    const halfWidth = paddedWidth / 2;
    const halfHeight = paddedHeight / 2;
    const halfDepth = paddedDepth / 2;

    halfAxisX.copy(axisXDir).multiplyScalar(halfWidth);
    halfAxisY.copy(axisYDir).multiplyScalar(halfHeight);
    halfAxisZ.copy(axisZDir).multiplyScalar(halfDepth);

    const lenX = paddedWidth * lineLength;
    const lenY = paddedHeight * lineLength;
    const lenZ = paddedDepth * lineLength;

    armXVector.copy(axisXDir).multiplyScalar(lenX);
    armYVector.copy(axisYDir).multiplyScalar(lenY);
    armZVector.copy(axisZDir).multiplyScalar(lenZ);

    worldCenter.copy(localCenter).applyMatrix4(obj.matrixWorld);

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

      endpointTemp.copy(cornerTemp).addScaledVector(armXVector, -sx);
      pushLine(cornerTemp, endpointTemp);

      endpointTemp.copy(cornerTemp).addScaledVector(armYVector, -sy);
      pushLine(cornerTemp, endpointTemp);

      endpointTemp.copy(cornerTemp).addScaledVector(armZVector, -sz);
      pushLine(cornerTemp, endpointTemp);
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
