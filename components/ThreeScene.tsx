"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Scene from "./three/Scene";

export default function ThreeScene() {
  return (
    <div className="relative w-full h-[800px] bg-[#cfe8fc]">
      <Canvas shadows camera={{ position: [2.6, 1.8, 2.6], fov: 45 }}>
        <color attach="background" args={["#cfe8fc"]} />
        {/* IMPORTANT: no global fallback here */}
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
