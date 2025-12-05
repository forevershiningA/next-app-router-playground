// components/three/SelectionBox.tsx
'use client';

import * as React from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';

type SelectionBoxProps<T extends THREE.Object3D = THREE.Object3D> = {
  targetRef: React.RefObject<T> | React.MutableRefObject<T | null>;
  visible?: boolean;
  color?: string | number;
  pad?: number;
  through?: boolean;
  renderOrder?: number;
  showHandles?: boolean;
  handleSize?: number;
};

export default function SelectionBox<T extends THREE.Object3D = THREE.Object3D>({
  targetRef,
  visible = true,
  color = 'white',
  pad = 0.01,
  through = true,
  renderOrder = 1000,
  showHandles = true,
  handleSize = 0.03,
}: SelectionBoxProps) {
  const { scene } = useThree();
  const groupRef = React.useRef<THREE.Group>(null);
  const boxRef = React.useRef(new THREE.Box3());
  const [targetReady, setTargetReady] = React.useState(false);

  // Check if target becomes available
  React.useEffect(() => {
    if (targetRef.current && !targetReady) {
      setTargetReady(true);
    }
  });

  // Create selection box with handles
  React.useEffect(() => {
    if (!targetReady) return;
    
    const group = new THREE.Group();
    group.renderOrder = renderOrder;
    
    // Create box outline
    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    const edges = new THREE.EdgesGeometry(boxGeometry);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: new THREE.Color(color as any),
      depthTest: !through,
      depthWrite: false,
      transparent: true,
      linewidth: 2,
    });
    const lineSegments = new THREE.LineSegments(edges, lineMaterial);
    group.add(lineSegments);
    
    if (showHandles) {
      // Create corner handles (8 corners)
      const handleGeometry = new THREE.SphereGeometry(handleSize, 8, 8);
      const handleMaterial = new THREE.MeshBasicMaterial({
        color: new THREE.Color(color as any),
        depthTest: !through,
        depthWrite: false,
        transparent: true,
      });
      
      // Corner positions (in unit cube space)
      const corners = [
        [-0.5, -0.5, -0.5], [0.5, -0.5, -0.5],
        [-0.5,  0.5, -0.5], [0.5,  0.5, -0.5],
        [-0.5, -0.5,  0.5], [0.5, -0.5,  0.5],
        [-0.5,  0.5,  0.5], [0.5,  0.5,  0.5],
      ];
      
      corners.forEach(([x, y, z]) => {
        const handle = new THREE.Mesh(handleGeometry, handleMaterial.clone());
        handle.position.set(x, y, z);
        handle.userData.isHandle = true;
        group.add(handle);
      });
      
      // Add edge handles (12 edges) - smaller spheres at midpoints
      const edgeMidpoints = [
        // Bottom edges
        [0, -0.5, -0.5], [0.5, -0.5, 0], [0, -0.5, 0.5], [-0.5, -0.5, 0],
        // Top edges
        [0, 0.5, -0.5], [0.5, 0.5, 0], [0, 0.5, 0.5], [-0.5, 0.5, 0],
        // Vertical edges
        [-0.5, 0, -0.5], [0.5, 0, -0.5], [-0.5, 0, 0.5], [0.5, 0, 0.5],
      ];
      
      const edgeHandleGeometry = new THREE.SphereGeometry(handleSize * 0.6, 6, 6);
      edgeMidpoints.forEach(([x, y, z]) => {
        const handle = new THREE.Mesh(edgeHandleGeometry, handleMaterial.clone());
        handle.position.set(x, y, z);
        handle.userData.isEdgeHandle = true;
        group.add(handle);
      });
    }
    
    groupRef.current = group;
    scene.add(group);
    
    return () => {
      if (groupRef.current) {
        scene.remove(groupRef.current);
        groupRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            (child.material as THREE.Material).dispose();
          } else if (child instanceof THREE.LineSegments) {
            child.geometry.dispose();
            (child.material as THREE.Material).dispose();
          }
        });
      }
    };
  }, [scene, color, through, renderOrder, targetReady, showHandles, handleSize]);

  // Update selection box to match target
  useFrame(() => {
    const obj = targetRef.current;
    const group = groupRef.current;
    if (!obj || !group) return;

    obj.updateWorldMatrix(true, true);
    boxRef.current.setFromObject(obj);

    if (boxRef.current.isEmpty()) {
      group.visible = false;
      return;
    }

    const padded = boxRef.current.clone().expandByScalar(pad);
    const center = new THREE.Vector3();
    const size = new THREE.Vector3();
    padded.getCenter(center);
    padded.getSize(size);

    // Update group position and scale
    group.position.copy(center);
    group.scale.copy(size);
    group.visible = !!visible;
    group.updateMatrixWorld(true);
  });

  return null;
}
