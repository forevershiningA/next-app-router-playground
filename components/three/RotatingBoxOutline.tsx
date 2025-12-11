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
};

/**
 * Bounding box outline that rotates with the target object.
 * Creates a BoxHelper that's parented to the target object.
 */
export default function RotatingBoxOutline<T extends THREE.Object3D = THREE.Object3D>({
  targetRef,
  visible = true,
  color = 'white',
  pad = 0.004,
  through = true,
  renderOrder = 1000,
  excludeAdditions = false,
}: RotatingBoxOutlineProps) {
  const helperRef = React.useRef<THREE.LineSegments | null>(null);

  // Create the helper geometry and material
  React.useEffect(() => {
    const obj = targetRef.current;
    if (!obj) return;

    // Create LineSegments for the box edges
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color(color as any).getHex(),
      depthTest: !through,
      depthWrite: false,
      transparent: true,
    });

    const helper = new THREE.LineSegments(geometry, material);
    helper.renderOrder = renderOrder;
    helperRef.current = helper;

    // Add to scene via the object's parent
    if (obj.parent) {
      obj.parent.add(helper);
    }

    return () => {
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

    // Calculate bounding box in local space - only for the mesh itself
    const localBox = new THREE.Box3();
    
    if (excludeAdditions) {
      // Calculate bounding box excluding addition models and text
      obj.traverse((child) => {
        if (child instanceof THREE.Mesh && child.geometry) {
          const parentName = child.parent?.name || '';
          const childName = child.name || '';
          
          const isAddition = parentName.startsWith('addition-') || childName.startsWith('addition-');
          const isText = child.geometry.type === 'TextGeometry' || 
                        childName.includes('text') || 
                        parentName.includes('text') ||
                        child.userData?.isText;
          
          if (!isAddition && !isText) {
            child.geometry.computeBoundingBox();
            if (child.geometry.boundingBox) {
              const childBox = child.geometry.boundingBox.clone();
              localBox.union(childBox);
            }
          }
        }
      });
    } else if (obj instanceof THREE.Mesh && obj.geometry) {
      // For a single mesh, calculate box from geometry in local space
      obj.geometry.computeBoundingBox();
      if (obj.geometry.boundingBox) {
        localBox.copy(obj.geometry.boundingBox);
      }
    } else {
      // Fallback: calculate in world space then convert
      const worldBox = new THREE.Box3().setFromObject(obj);
      const inverseMatrix = obj.matrixWorld.clone().invert();
      const min = worldBox.min.clone().applyMatrix4(inverseMatrix);
      const max = worldBox.max.clone().applyMatrix4(inverseMatrix);
      localBox.set(min, max);
    }

    if (localBox.isEmpty()) {
      helper.visible = false;
      return;
    }

    // Expand by padding
    localBox.expandByScalar(pad);

    // Get center and size in local space
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    localBox.getCenter(center);
    localBox.getSize(size);

    // Create 12 edges of the box in local space
    const hx = size.x / 2;
    const hy = size.y / 2;
    const hz = size.z / 2;

    const vertices = new Float32Array([
      // Bottom face (4 edges)
      center.x - hx, center.y - hy, center.z - hz,  center.x + hx, center.y - hy, center.z - hz,
      center.x + hx, center.y - hy, center.z - hz,  center.x + hx, center.y - hy, center.z + hz,
      center.x + hx, center.y - hy, center.z + hz,  center.x - hx, center.y - hy, center.z + hz,
      center.x - hx, center.y - hy, center.z + hz,  center.x - hx, center.y - hy, center.z - hz,
      // Top face (4 edges)
      center.x - hx, center.y + hy, center.z - hz,  center.x + hx, center.y + hy, center.z - hz,
      center.x + hx, center.y + hy, center.z - hz,  center.x + hx, center.y + hy, center.z + hz,
      center.x + hx, center.y + hy, center.z + hz,  center.x - hx, center.y + hy, center.z + hz,
      center.x - hx, center.y + hy, center.z + hz,  center.x - hx, center.y + hy, center.z - hz,
      // Vertical edges (4 edges)
      center.x - hx, center.y - hy, center.z - hz,  center.x - hx, center.y + hy, center.z - hz,
      center.x + hx, center.y - hy, center.z - hz,  center.x + hx, center.y + hy, center.z - hz,
      center.x + hx, center.y - hy, center.z + hz,  center.x + hx, center.y + hy, center.z + hz,
      center.x - hx, center.y - hy, center.z + hz,  center.x - hx, center.y + hy, center.z + hz,
    ]);

    helper.geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    helper.geometry.computeBoundingSphere();
    
    // Make helper follow object's world transform
    helper.position.copy(obj.position);
    helper.rotation.copy(obj.rotation);
    helper.scale.copy(obj.scale);
    helper.updateMatrixWorld();
    
    helper.visible = true;
  });

  return null;
}
