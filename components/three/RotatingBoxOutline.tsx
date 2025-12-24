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
  lineLength = 0.15, // 15% of box size
}: RotatingBoxOutlineProps) {
  const helperRef = React.useRef<THREE.LineSegments | null>(null);

  // Create the helper geometry and material
  React.useEffect(() => {
    const obj = targetRef.current;
    if (!obj) return;

    // Create LineSegments for the box edges - solid gold
    const geometry = new THREE.BufferGeometry();
    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color(color as any).getHex(),
      depthTest: !through,
      depthWrite: false,
      transparent: true,
      opacity: 0.8, // Slightly transparent for elegant look
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

    // Calculate corner arm lengths based on box size
    const lenX = size.x * lineLength;
    const lenY = size.y * lineLength;
    const lenZ = size.z * lineLength;

    // Build the "Viewfinder" Geometry (8 corners, 3 lines per corner = 24 lines)
    const positions: number[] = [];
    
    // Helper to push a line segment
    const pushLine = (x1: number, y1: number, z1: number, x2: number, y2: number, z2: number) => {
      positions.push(x1, y1, z1, x2, y2, z2);
    };

    const hx = size.x / 2;
    const hy = size.y / 2;
    const hz = size.z / 2;
    const cx = center.x;
    const cy = center.y;
    const cz = center.z;

    // --- Bottom Corners ---
    // Front-Left-Bottom
    pushLine(cx - hx, cy - hy, cz + hz, cx - hx + lenX, cy - hy, cz + hz); // X
    pushLine(cx - hx, cy - hy, cz + hz, cx - hx, cy - hy + lenY, cz + hz); // Y
    pushLine(cx - hx, cy - hy, cz + hz, cx - hx, cy - hy, cz + hz - lenZ); // Z

    // Front-Right-Bottom
    pushLine(cx + hx, cy - hy, cz + hz, cx + hx - lenX, cy - hy, cz + hz);
    pushLine(cx + hx, cy - hy, cz + hz, cx + hx, cy - hy + lenY, cz + hz);
    pushLine(cx + hx, cy - hy, cz + hz, cx + hx, cy - hy, cz + hz - lenZ);

    // Back-Left-Bottom
    pushLine(cx - hx, cy - hy, cz - hz, cx - hx + lenX, cy - hy, cz - hz);
    pushLine(cx - hx, cy - hy, cz - hz, cx - hx, cy - hy + lenY, cz - hz);
    pushLine(cx - hx, cy - hy, cz - hz, cx - hx, cy - hy, cz - hz + lenZ);

    // Back-Right-Bottom
    pushLine(cx + hx, cy - hy, cz - hz, cx + hx - lenX, cy - hy, cz - hz);
    pushLine(cx + hx, cy - hy, cz - hz, cx + hx, cy - hy + lenY, cz - hz);
    pushLine(cx + hx, cy - hy, cz - hz, cx + hx, cy - hy, cz - hz + lenZ);

    // --- Top Corners ---
    // Front-Left-Top
    pushLine(cx - hx, cy + hy, cz + hz, cx - hx + lenX, cy + hy, cz + hz);
    pushLine(cx - hx, cy + hy, cz + hz, cx - hx, cy + hy - lenY, cz + hz);
    pushLine(cx - hx, cy + hy, cz + hz, cx - hx, cy + hy, cz + hz - lenZ);

    // Front-Right-Top
    pushLine(cx + hx, cy + hy, cz + hz, cx + hx - lenX, cy + hy, cz + hz);
    pushLine(cx + hx, cy + hy, cz + hz, cx + hx, cy + hy - lenY, cz + hz);
    pushLine(cx + hx, cy + hy, cz + hz, cx + hx, cy + hy, cz + hz - lenZ);

    // Back-Left-Top
    pushLine(cx - hx, cy + hy, cz - hz, cx - hx + lenX, cy + hy, cz - hz);
    pushLine(cx - hx, cy + hy, cz - hz, cx - hx, cy + hy - lenY, cz - hz);
    pushLine(cx - hx, cy + hy, cz - hz, cx - hx, cy + hy, cz - hz + lenZ);

    // Back-Right-Top
    pushLine(cx + hx, cy + hy, cz - hz, cx + hx - lenX, cy + hy, cz - hz);
    pushLine(cx + hx, cy + hy, cz - hz, cx + hx, cy + hy - lenY, cz - hz);
    pushLine(cx + hx, cy + hy, cz - hz, cx + hx, cy + hy, cz - hz + lenZ);

    const vertices = new Float32Array(positions);
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
