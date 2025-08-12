// FitOnReady.tsx
"use client";
import * as React from "react";
import { useBounds } from "@react-three/drei";
import * as THREE from "three";

export default function FitOnReady({ target }: { target: React.RefObject<THREE.Object3D> }) {
  const bounds = useBounds();
  React.useEffect(() => {
    const obj = target.current;
    if (!obj) return;
    const id = requestAnimationFrame(() => {
      bounds.refresh(obj).clip().fit();   // refit AFTER geometry is in place
    });
    return () => cancelAnimationFrame(id);
  }, [bounds, target]);
  return null;
}
