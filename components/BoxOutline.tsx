// components/BoxOutline.tsx
"use client";

import * as React from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";

/** Mesh-accurate white outline that resizes with the tablet mesh */
/** White bounding box that truly tracks the selected object (mesh) */
function BoxOutline({
  object,
  visible = true,
  color = "white",
}: {
  object: THREE.Object3D | null | undefined; // pass api.mesh.current
  visible?: boolean;
  color?: string;
}) {
  const { scene } = useThree();
  const helperRef = useRef<THREE.Box3Helper | null>(null);
  const box = useRef(new THREE.Box3());
  const EPS = 0.002; // small pad to avoid z-fighting with the face

  useEffect(() => {
    // clean up any existing helper
    if (helperRef.current) {
      scene.remove(helperRef.current);
      helperRef.current.geometry.dispose();
      // @ts-ignore
      helperRef.current.material.dispose?.();
      helperRef.current = null;
    }
    if (!visible || !object) return;

    const helper = new THREE.Box3Helper(box.current, new THREE.Color(color).getHex());
    // Always render on top of the stone
    // @ts-ignore (LineBasicMaterial)
    helper.material.depthTest = false;
    // @ts-ignore
    helper.material.depthWrite = false;
    helper.renderOrder = 9999;

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
    const obj = object as THREE.Object3D | undefined;
    if (!helper || !obj) return;

    // Ensure latest transforms (incl. parent scaling from AutoFit / height changes)
    obj.updateWorldMatrix(true, true);

    // World-space box from the *object and all its descendants*
    box.current.setFromObject(obj);

    if (box.current.isEmpty()) {
      helper.visible = false;
      return;
    }

    // Slightly inflate to avoid overlap with the face edges
    const padded = box.current.clone().expandByScalar(EPS);

    // @ts-ignore Box3Helper exposes .box
    helper.box.copy(padded);
    helper.visible = !!visible;
    helper.updateMatrixWorld(true);
  });

  return null;
}
