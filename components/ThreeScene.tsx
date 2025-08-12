
"use client";

import React, { useRef, useState, useEffect, Suspense } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import SvgHeadstone from "./SvgHeadstone";
import HeadstoneInscription from "./HeadstoneInscription";
import AutoFit from "./AutoFit";
import { useHeadstoneStore } from "#/lib/headstone-store";

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

function HeadstoneWithEditing() {
  const { camera, controls, gl } = useThree() as any;
  const [edit, setEdit] = useState(false);
  const [sel, setSel] = useState(false);

  useEffect(() => {
    controls.enabled = !edit;
    controls.enableZoom = !edit;
  }, [edit, controls]);

  // block wheel-zoom while editing (so page scroll doesn't dive inside)
  useEffect(() => {
    const onWheel = (e: WheelEvent) => { if (edit) e.preventDefault(); };
    gl.domElement.addEventListener("wheel", onWheel, { passive: false });
    return () => gl.domElement.removeEventListener("wheel", onWheel);
  }, [gl.domElement, edit]);

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
    const min = controls.minDistance ?? 0.5;
    const dir = camera.position.clone().sub(controls.target);
    const next = Math.max(min * 1.05, dir.length() * 0.75);
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
      zoomToSafe();
    },
    onClick: (e: any) => {
      if (!edit) return;
      e.stopPropagation();
      setEdit(false);
      setSel(false);
      const root = (e.object as THREE.Object3D).parent ?? e.object;
      frameObject(root, 1.15);
    },
  };

  return (
    <SvgHeadstone
      url="/shapes/headstones/serpentine.svg"
      depth={100}
      scale={0.01}
      faceTexture="/textures/forever/l/Blue-Pearl-TILE-900-X-900.jpg"
      sideTexture="/textures/forever/l/Blue-Pearl-TILE-900-X-900.jpg"
      tileSize={10} sideTileSize={10} topTileSize={10}
      targetHeight={5}
      preserveTop
      showEdges={edit}
      meshProps={meshProps}
    >
      {(api) => (
        <>
          <AutoFit target={api.group} />
          <HeadstoneInscription
            headstone={api}
            text="In Loving Memory"
            height={0.5}
            color="#fff8dc"
            font="/fonts/ChopinScript.otf" // drop a .ttf into /public/fonts and uncomment
            lift={0.002}
            editable={edit}
            selected={sel}
            onSelect={() => setSel(true)}
            approxHeight={5}    // <- pass the world height here
          />
        </>
      )}
    </SvgHeadstone>
  );
}

export default function ThreeScene() {
  return (
    <div style={{ width: "100%", height: "50vh" }}>
      <Canvas camera={{ position: [0, 1.2, 3.2], fov: 40, near: 0.01, far: 100 }}>
        <color attach="background" args={["#f7f7f7"]} />
        <gridHelper args={[20, 40]} />
        <axesHelper args={[1]} />

        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 6, 3]} intensity={1} castShadow />

        <Suspense fallback={null}>
          <HeadstoneWithEditing />
        </Suspense>

        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#e5e5e5" />
        </mesh>

        <OrbitControls makeDefault enableDamping dampingFactor={0.08} />
      </Canvas>
    </div>
  );
}
