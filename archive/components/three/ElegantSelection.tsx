// components/three/ElegantSelection.tsx
'use client';

import * as React from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

type ElegantSelectionProps = {
  targetRef: React.RefObject<THREE.Object3D> | React.MutableRefObject<THREE.Object3D | null>;
  visible?: boolean;
  color?: string;
  padding?: number; // How far from the object the corners sit
  lineLength?: number; // Length of the corner arms relative to size (0 to 0.5)
};

export default function ElegantSelection({
  targetRef,
  visible = true,
  color = '#ffffff', // White looks cleanest
  padding = 0.02,
  lineLength = 0.15, // Short, elegant corners
}: ElegantSelectionProps) {
  const lineRef = React.useRef<THREE.LineSegments>(null);
  const groupRef = React.useRef<THREE.Group>(null);

  // Re-calculate the corner geometry every frame to handle animation/resizing
  useFrame(() => {
    const obj = targetRef.current;
    const lines = lineRef.current;
    const group = groupRef.current;
    
    if (!obj || !lines || !group || !visible) {
      if (group) group.visible = false;
      return;
    }

    // 1. Calculate Bounding Box in WORLD space
    const box = new THREE.Box3().setFromObject(obj);

    if (box.isEmpty()) {
      group.visible = false;
      return;
    }

    group.visible = true;

    // Expand slightly so it doesn't clip
    box.expandByScalar(padding);

    // Position the group at world origin - the lines will be in world coordinates
    group.position.set(0, 0, 0);
    group.rotation.set(0, 0, 0);
    group.scale.set(1, 1, 1);

    const min = box.min;
    const max = box.max;

    // Calculate dynamic line length based on object size
    const size = new THREE.Vector3();
    box.getSize(size);
    const lenX = size.x * lineLength;
    const lenY = size.y * lineLength;
    const lenZ = size.z * lineLength;

    // 2. Build the "Viewfinder" Geometry (8 corners, 3 lines per corner)
    const positions: number[] = [];

    // Helper to push a line segment
    const pushLine = (x1: number, y1: number, z1: number, x2: number, y2: number, z2: number) => {
      positions.push(x1, y1, z1, x2, y2, z2);
    };

    // --- Bottom Corners ---
    // Front-Left-Bottom
    pushLine(min.x, min.y, max.z, min.x + lenX, min.y, max.z); // X
    pushLine(min.x, min.y, max.z, min.x, min.y + lenY, max.z); // Y
    pushLine(min.x, min.y, max.z, min.x, min.y, max.z - lenZ); // Z

    // Front-Right-Bottom
    pushLine(max.x, min.y, max.z, max.x - lenX, min.y, max.z);
    pushLine(max.x, min.y, max.z, max.x, min.y + lenY, max.z);
    pushLine(max.x, min.y, max.z, max.x, min.y, max.z - lenZ);

    // Back-Left-Bottom
    pushLine(min.x, min.y, min.z, min.x + lenX, min.y, min.z);
    pushLine(min.x, min.y, min.z, min.x, min.y + lenY, min.z);
    pushLine(min.x, min.y, min.z, min.x, min.y, min.z + lenZ);

    // Back-Right-Bottom
    pushLine(max.x, min.y, min.z, max.x - lenX, min.y, min.z);
    pushLine(max.x, min.y, min.z, max.x, min.y + lenY, min.z);
    pushLine(max.x, min.y, min.z, max.x, min.y, min.z + lenZ);

    // --- Top Corners ---
    // Front-Left-Top
    pushLine(min.x, max.y, max.z, min.x + lenX, max.y, max.z);
    pushLine(min.x, max.y, max.z, min.x, max.y - lenY, max.z);
    pushLine(min.x, max.y, max.z, min.x, max.y, max.z - lenZ);

    // Front-Right-Top
    pushLine(max.x, max.y, max.z, max.x - lenX, max.y, max.z);
    pushLine(max.x, max.y, max.z, max.x, max.y - lenY, max.z);
    pushLine(max.x, max.y, max.z, max.x, max.y, max.z - lenZ);

    // Back-Left-Top
    pushLine(min.x, max.y, min.z, min.x + lenX, max.y, min.z);
    pushLine(min.x, max.y, min.z, min.x, max.y - lenY, min.z);
    pushLine(min.x, max.y, min.z, min.x, max.y, min.z + lenZ);

    // Back-Right-Top
    pushLine(max.x, max.y, min.z, max.x - lenX, max.y, min.z);
    pushLine(max.x, max.y, min.z, max.x, max.y - lenY, min.z);
    pushLine(max.x, max.y, min.z, max.x, max.y, min.z + lenZ);

    // Update geometry
    lines.geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    lines.geometry.computeBoundingSphere();
  });

  return (
    <group ref={groupRef}>
      <lineSegments ref={lineRef}>
        <bufferGeometry />
        <lineBasicMaterial 
          color={color} 
          depthTest={false} // Draw on top of everything
          opacity={0.8} 
          transparent 
          linewidth={1} // Note: WebGL limits line width to 1 on most browsers
        />
      </lineSegments>
    </group>
  );
}
