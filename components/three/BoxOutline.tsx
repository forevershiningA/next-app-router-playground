// components/three/BoxOutline.tsx
'use client';

import * as React from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';

type BoxOutlineProps<T extends THREE.Object3D = THREE.Object3D> = {
  /** Object whose world-space bounds should be outlined (e.g., your tablet group). */
  targetRef: React.RefObject<T> | React.MutableRefObject<T | null>;
  /** Toggle outline visibility. */
  visible?: boolean;
  /** Outline color. */
  color?: string | number;
  /** Expand the box slightly to avoid z-fighting with the mesh. */
  pad?: number;
  /** If true, draw through objects (no depth test) so it’s always visible. */
  through?: boolean;
  /** Render order for the helper (bigger = later). */
  renderOrder?: number;
};

/**
 * Lightweight world-space bounding box outline that follows a target object.
 * Uses THREE.Box3Helper under the hood and updates every frame.
 */
export default function BoxOutline<T extends THREE.Object3D = THREE.Object3D>({
  targetRef,
  visible = true,
  color = 'white',
  pad = 0.004,
  through = true,
  renderOrder = 1000,
}: BoxOutlineProps) {
  const { scene } = useThree();
  const helperRef = React.useRef<THREE.Box3Helper | null>(null);
  const boxRef = React.useRef(new THREE.Box3());

  // Create / recreate helper when color/through/target changes
  React.useEffect(() => {
    // Cleanup any previous helper
    if (helperRef.current) {
      scene.remove(helperRef.current);
      helperRef.current.geometry.dispose();
      (helperRef.current.material as THREE.Material | undefined)?.dispose?.();
      helperRef.current = null;
    }

    const obj = targetRef.current;
    if (!obj) return;

    const helper = new THREE.Box3Helper(
      boxRef.current,
      new THREE.Color(color as any).getHex(),
    );

    // Configure the line material
    const mat = helper.material as THREE.LineBasicMaterial;
    mat.depthTest = through ? false : true; // draw-through if requested
    mat.depthWrite = false;
    mat.transparent = true;

    helper.renderOrder = renderOrder;

    helperRef.current = helper;
    scene.add(helper);

    return () => {
      if (helperRef.current) {
        scene.remove(helperRef.current);
        helperRef.current.geometry.dispose();
        (helperRef.current.material as THREE.Material | undefined)?.dispose?.();
        helperRef.current = null;
      }
    };
  }, [scene, targetRef, color, through, renderOrder]);

  // Follow the target's world bbox each frame
  useFrame(() => {
    const obj = targetRef.current;
    const helper = helperRef.current;
    if (!obj || !helper) return;

    obj.updateWorldMatrix(true, true);
    boxRef.current.setFromObject(obj);

    if (boxRef.current.isEmpty()) {
      helper.visible = false;
      return;
    }

    const padded = boxRef.current.clone().expandByScalar(pad);
    // @ts-ignore - Box3Helper exposes .box
    helper.box.copy(padded);
    helper.visible = !!visible;
    helper.updateMatrixWorld(true);
  });

  return null;
}
