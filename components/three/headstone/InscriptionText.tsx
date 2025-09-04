// components/three/headstone/InscriptionText.tsx
"use client";

import React, { useRef, useState, forwardRef } from "react";
import * as THREE from "three";
import { Text } from "@react-three/drei";

type Props = {
  parentRef: React.RefObject<THREE.Object3D>;
  text?: string;
  fontSize?: number;
  y?: number;
  frontOffset?: number;   // distance in front of tablet face
  selected: boolean;
  onSelect: () => void;
};

const InscriptionText = forwardRef<THREE.Group, Props>(function InscriptionText(
  {
    parentRef,
    text = "In Loving Memory",
    fontSize = 0.06,
    y = 0.25,
    frontOffset = 0.06, // make it clearly in front (increase if needed)
    selected,
    onSelect,
  },
  ref
) {
  const root = useRef<THREE.Group>(null!);
  const textRef = useRef<any>(null);
  const [size, setSize] = useState<{ w: number; h: number }>({ w: 0.6, h: 0.12 });

  // expose to parent
  React.useImperativeHandle(ref, () => root.current, []);

  // keep it under the tablet in the tree
  // (rendered as a child in HeadstoneAssembly, so no imperative .add())

  return (
    <group ref={root} name="inscription-root" position={[0, 0, frontOffset]}>
      {/* 1) The visible text */}
      <Text
        ref={textRef}
        name="inscription-text"
        position={[0, y, 0]}
        anchorX="center"
        anchorY="middle"
        fontSize={fontSize}
        maxWidth={2}
        onSync={(glyphs) => {
          // compute tight bounds for the click plane
          glyphs.geometry.computeBoundingBox();
          const bb = glyphs.geometry.boundingBox!;
          const w = bb.max.x - bb.min.x;
          const h = bb.max.y - bb.min.y;
          setSize({ w: Math.max(0.05, w), h: Math.max(0.03, h) });
        }}
        onPointerDown={(e) => {
          e.stopPropagation();
          console.log("✅ inscription TEXT clicked");
          onSelect();
        }}
      >
        {text}
        <meshStandardMaterial color="#eeeeee" emissive="#222222" depthTest={false} />
      </Text>

      {/* 2) Invisible click plane (slightly in front of the text) */}
      <mesh
        name="inscription-click-plane"
        position={[0, y, 0.005]} // 5mm in front of the text -> wins the raycast
        onPointerDown={(e) => {
          e.stopPropagation();
          console.log("✅ inscription PLANE clicked (guaranteed)");
          onSelect();
        }}
      >
        <planeGeometry args={[size.w * 1.1, size.h * 1.4]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
});

export default InscriptionText;
