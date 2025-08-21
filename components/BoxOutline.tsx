// components/BoxOutline.tsx
"use client";

import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";

type Props = {
  object?: THREE.Object3D | null;
  visible?: boolean;
  color?: string;
  pad?: number;
};

export default function BoxOutline({
  object,
  visible = true,
  color = "white",
  pad = 0.0008,
}: Props) {
  const { scene } = useThree();
  const helperRef = useRef<THREE.Box3Helper | null>(null);
  const boxWorld = useRef(new THREE.Box3());

  useEffect(() => {
    // cleanup any previous helper
    if (helperRef.current) {
      scene.remove(helperRef.current);
      helperRef.current.geometry.dispose();
      // @ts-ignore
      helperRef.current.material.dispose?.();
      helperRef.current = null;
    }
    if (!visible || !object) return;

    const helper = new THREE.Box3Helper(
      boxWorld.current,
      new THREE.Color(color).getHex()
    );
    // @ts-ignore
    helper.material.depthTest = true;
    // @ts-ignore
    helper.material.depthWrite = false;
    helper.renderOrder = 10;

    helperRef.current = helper;
    scene.add(helper);

    return () => {
      if (helperRef.current) {
        scene.remove(helperRef.current);
        helperRef.current.geometry.dispose();
        // @ts-ignore
        helperRef.current.material.dispose?.();
        helperRef.current = null;
      }
    };
  }, [scene, object, visible, color]);

  useFrame(() => {
    const helper = helperRef.current;
    const obj = object ?? undefined;
    if (!helper || !obj) return;

    obj.updateWorldMatrix(true, true);
    boxWorld.current.setFromObject(obj);
    if (boxWorld.current.isEmpty()) {
      helper.visible = false;
      return;
    }

    const padded = boxWorld.current.clone().expandByScalar(pad);
    // @ts-ignore three’s helper has a .box
    helper.box.copy(padded);
    helper.visible = !!visible;
  });

  return null;
}

// also allow named import if you like
export { BoxOutline as BoxOutline };
