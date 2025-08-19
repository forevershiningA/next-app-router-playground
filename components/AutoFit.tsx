"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { useHeadstoneStore } from "#/lib/headstone-store";

export default function AutoFit({
  target,
  margin = 1.15,
}: {
  target: React.RefObject<THREE.Object3D>;
  margin?: number;
}) {
  const { camera, controls } = useThree() as any;
  const heightMm = useHeadstoneStore((state) => state.heightMm);
  const widthMm  = useHeadstoneStore((state) => state.widthMm);

  React.useEffect(() => {

    const checkMobile = /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(
      navigator.userAgent
    );

    const obj = target.current;
    if (!obj) return;

    const id = requestAnimationFrame(() => {
      const box = new THREE.Box3().setFromObject(obj);
      const size = new THREE.Vector3();
      box.getSize(size);
      const center = new THREE.Vector3();
      box.getCenter(center);

      // frame
      let half = 180;
      if (checkMobile) { 
        half = 300;
      }
      const maxDim = Math.max(size.x, size.y, size.z);
      const fov = (camera.fov * Math.PI) / half;
      let dist = (maxDim / 2) / Math.tan(fov / 2) * margin;
      camera.position.set(
        center.x,
        center.y + size.y * 0.05,
        center.z + dist
      );
      controls?.target.copy(center);

      // SAFE MIN DISTANCE
      const sphere = new THREE.Sphere();
      box.getBoundingSphere(sphere);
      const safeMin = sphere.radius * 1.35 + 0.05;
      controls.minDistance = safeMin;
      controls.maxDistance = Math.max(safeMin * 8, 5);

      controls?.update?.();
    });

    return () => cancelAnimationFrame(id);
  }, [target, camera, controls, margin, heightMm, widthMm]);


  return null;
}
