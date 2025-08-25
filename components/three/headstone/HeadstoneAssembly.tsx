// components/three/headstone/HeadstoneAssembly.tsx
"use client";

import React, { useRef, useState } from "react";
import * as THREE from "three";

import ShapeSwapper from "./ShapeSwapper";
import HeadstoneBaseAuto from "./HeadstoneBaseAuto";
import BoxOutline from "../BoxOutline"; // ← up one level

const BASE_H = 2; // 100 mm

export default function HeadstoneAssembly() {
  const [sel, setSel] = useState<"headstone" | "base" | null>(null);

  // Assembly = parent of tablet + base
  const assemblyRef = useRef<THREE.Object3D>(new THREE.Group());
  // Tablet-only group (used for outline/camera/base sizing)
  const tabletRef = useRef<THREE.Object3D>(new THREE.Group());

  return (
    <>
      <group ref={assemblyRef} position={[0, BASE_H, 0]}>
        {/* Tablet with atomic shape/material swap */}
        <ShapeSwapper
          tabletRef={tabletRef}
          onSelectHeadstone={() => setSel("headstone")}
        />

        {/* Headstone selection outline */}
        <BoxOutline
        targetRef={tabletRef}
        visible={sel === "headstone"}
        color="white"
        pad={0.004}
        through={false}   // ← hide back lines (enable depth test)
        // you can also just remove the prop since false is the default below
        />

        {/* Auto-sized base from tablet bounds */}
        <HeadstoneBaseAuto
          headstoneObject={tabletRef}
          wrapper={assemblyRef}
          selected={sel === "base"}
          onClick={(e) => {
            e.stopPropagation();
            setSel("base");
          }}
          height={BASE_H}
        />
      </group>

      {/* Click-away to clear selection */}
      <mesh
        position={[0, -0.001, 0]}
        onPointerDown={() => setSel(null)}
        visible={false}
      >
        <boxGeometry args={[100, 0.001, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </>
  );
}
