// components/three/headstone/HeadstoneAssembly.tsx
"use client";

import React, { useRef, useState } from "react";
import * as THREE from "three";

import ShapeSwapper from "./ShapeSwapper";
import HeadstoneBaseAuto from "./HeadstoneBaseAuto";
import BoxOutline from "../BoxOutline";
import { useHeadstoneStore } from "#/lib/headstone-store";

const BASE_H = 2;

export default function HeadstoneAssembly() {
  const [sel, setSel] = useState<"headstone" | "base" | null>(null);

  const selectedInscriptionId = useHeadstoneStore((s) => s.selectedInscriptionId);
  const setSelectedInscriptionId = useHeadstoneStore((s) => s.setSelectedInscriptionId);

  const assemblyRef = useRef<THREE.Object3D>(new THREE.Group());
  const tabletRef = useRef<THREE.Object3D>(new THREE.Group());
  const inscriptionRef = useRef<THREE.Object3D>(null!);

  return (
    <>
      <group ref={assemblyRef} position={[0, BASE_H, 0]}>
        <ShapeSwapper
          tabletRef={tabletRef}
          onSelectHeadstone={() => {
            setSel("headstone");
            setSelectedInscriptionId(null);
          }}
          inscriptionRef={inscriptionRef}
        />

        <BoxOutline
          targetRef={tabletRef}
          visible={sel === "headstone"}
          color="white"
          pad={0.004}
          through={false}
        />

        <BoxOutline
          targetRef={inscriptionRef}
          visible={selectedInscriptionId !== null}
          color="yellow"
          pad={0.02}
          through={false}
        />

        <HeadstoneBaseAuto
          headstoneObject={tabletRef}
          wrapper={assemblyRef}
          selected={sel === "base"}
          onClick={(e) => {
            e.stopPropagation();
            setSel("base");
            setSelectedInscriptionId(null);
          }}
          height={BASE_H}
        />
      </group>

      <mesh
        position={[0, -0.001, 0]}
        onPointerDown={() => {
          setSel(null);
          setSelectedInscriptionId(null);
        }}
        visible={false}
      >
        <boxGeometry args={[100, 0.001, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </>
  );
}