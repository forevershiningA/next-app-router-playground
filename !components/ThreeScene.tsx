"use client";

import React, { useRef, useState, useEffect, Suspense } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import SvgHeadstone from "#/components/SvgHeadstone";
import HeadstoneInscription from "#/components/HeadstoneInscription";

/** One-time frame so the camera sees the target nicely */
function AutoFit({ target, margin = 1.15 }: { target: React.RefObject<THREE.Object3D>; margin?: number }) {
  const { camera, controls } = useThree() as any;
  useEffect(() => {
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

      // SAFE MIN DISTANCE (prevents diving inside on wheel/dblclick)
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


function Box(props: JSX.IntrinsicElements["mesh"]) {
  const meshRef = useRef<THREE.Mesh>(null!);
  const [hovered, setHover] = useState(false);
  const [active, setActive] = useState(false);
  useFrame((_, d) => meshRef.current && (meshRef.current.rotation.x += d));
  return (
    <mesh {...props} ref={meshRef} scale={active ? 1.5 : 1}
      onClick={() => setActive(!active)}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}>
      <boxGeometry args={[0.2, 0.2, 0.2]} />
      <meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
    </mesh>
  );
}

/** Headstone + inscription with edit mode */
function HeadstoneWithEditing() {
  const { camera, controls } = useThree() as any;
  const [edit, setEdit] = useState(false);
  const [sel, setSel] = useState(false);

  useEffect(() => {
    controls.enabled = !edit;
    controls.enableZoom = !edit;   // scrolling the page won’t zoom the canvas in edit mode
  }, [edit, controls]);

  const frameObject = (obj: THREE.Object3D, margin = 1.1) => {
    const box = new THREE.Box3().setFromObject(obj);
    const size = new THREE.Vector3(); box.getSize(size);
    const center = new THREE.Vector3(); box.getCenter(center);
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = (camera.fov * Math.PI) / 180;
    let dist = (maxDim / 2) / Math.tan(fov / 2) * margin;
    camera.position.set(center.x, center.y + size.y * 0.05, center.z + dist);
    controls.target.copy(center);
    controls.update();
  };

  const zoomToSafe = () => {
    // Use the minDistance we set in AutoFit; go a little closer but never below it
    const min = controls.minDistance ?? 0.5;
    const dir = camera.position.clone().sub(controls.target);
    const next = Math.max(min * 1.05, dir.length() * 0.75); // clamp to just above min
    dir.setLength(next);
    camera.position.copy(controls.target).add(dir);
    controls.update();
  };

  const meshProps = {
    onDoubleClick: (e: any) => {
      e.stopPropagation();
      setEdit(true);
      setSel(true);
      const root = (e.object as THREE.Object3D).parent ?? e.object;
      frameObject(root, 1.05);
      zoomToSafe();          // never dives inside
    },
    onClick: (e: any) => {
      if (!edit) return;
      e.stopPropagation();
      setEdit(false);
      setSel(false);
      const root = (e.object as THREE.Object3D).parent ?? e.object;
      frameObject(root, 1.15);  // reset
    },
  };

  return (
    <SvgHeadstone
      showEdges={edit}
      meshProps={meshProps}
    >
      {(api) => (
        <>
          <AutoFit target={api.group} />
          <HeadstoneInscription
            headstone={api}
            text="In Loving Memory"
            height={0.12}
            color="#fff8dc"
            font="/fonts/ChopinScript.otf"   // <- use TTF/OTF
            lift={0.002}
            editable={edit}
            selected={sel}
            onSelect={() => setSel(true)}
          />
        </>
      )}
    </SvgHeadstone>
  );
}

export default function ThreeScene() {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <Canvas camera={{ position: [0, 1.2, 3.2], fov: 40, near: 0.01, far: 100 }}>
        <color attach="background" args={["#0a0a0a"]} />

        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 6, 3]} intensity={1} castShadow />

        <Suspense fallback={null}>
          <HeadstoneWithEditing />
        </Suspense>

        <OrbitControls makeDefault enableDamping dampingFactor={0.08} />
      </Canvas>
    </div>
  );
}