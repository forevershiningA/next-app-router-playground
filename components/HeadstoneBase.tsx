// components/HeadstoneBase.tsx
"use client";

import * as React from "react";
import * as THREE from "three";
import { Edges } from "@react-three/drei";

export type HeadstoneBaseProps = {
  /** meters */
  width?: number;   // left↔right
  depth?: number;   // front↔back
  height?: number;  // ground↔up
  /** world position of the base's center */
  position?: [number, number, number];
  /** material/appearance */
  color?: string;
  metalness?: number;
  roughness?: number;

  /** selection */
  selected?: boolean;
  /** click handler to toggle selection */
  onClick?: (e: THREE.Event) => void;
};

export default function HeadstoneBase({
  width = 0.90,
  depth = 0.35,
  height = 0.18,
  position = [0, height / 2, -0.95], // sits near the “back” of a ~2.0m ledger
  color = "#212529",
  metalness = 0.1,
  roughness = 0.55,
  selected = false,
  onClick,
}: HeadstoneBaseProps) {
  const baseRef = React.useRef<THREE.Mesh>(null);

  return (
    <group>
      <mesh ref={baseRef} position={position} onClick={onClick} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
        {selected && (
          // Crisp white edges slightly “above” the surface so they don’t z-fight
          <Edges threshold={15} scale={1.002} color="white" />
        )}
      </mesh>
    </group>
  );
}
