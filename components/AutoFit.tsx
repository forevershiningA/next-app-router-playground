
"use client";

import * as React from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

/** One-time frame so the camera sees the target nicely and set safe min distance */
export default function AutoFit({ target, margin = 1.15 }: { target: React.RefObject<THREE.Object3D>; margin?: number }) {
  const { camera, controls } = useThree() as any;
  React.useEffect(() => {
    const obj = target.current;
    if (!obj) return;
    const id = requestAnimationFrame(() => {
      const box = new THREE.Box3().setFromObject(obj);
      const size = new THREE.Vector3(); box.getSize(size);
      const center = new THREE.Vector3(); box.getCenter(center);

      // frame
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = (camera.fov * Math.PI) / 180;
      let dist = (maxDim / 2) / Math.tan(fov / 2) * margin;
      camera.position.set(center.x, center.y + size.y * 0.05, center.z + dist);
      controls?.target.copy(center);

      // SAFE MIN DISTANCE
      const sphere = new THREE.Sphere(); box.getBoundingSphere(sphere);
      const safeMin = sphere.radius * 1.35 + 0.05;
      controls.minDistance = safeMin;
      controls.maxDistance = Math.max(safeMin * 8, 5);

      controls?.update?.();
    });
    return () => cancelAnimationFrame(id);
  }, [target, camera, controls, margin]);
  return null;
}
