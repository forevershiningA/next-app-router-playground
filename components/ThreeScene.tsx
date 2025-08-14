"use client";

import React, { useRef, useState, useEffect, Suspense } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import SvgHeadstone from "./SvgHeadstone";
import HeadstoneInscription from "./HeadstoneInscription";
import AutoFit from "./AutoFit";
import { useHeadstoneStore } from "#/lib/headstone-store";

function HeadstoneWithEditing() {
  const { camera, controls, gl } = useThree() as any;
  const [edit, setEdit] = useState(false);
  const [sel, setSel] = useState(false);

  const heightMm = useHeadstoneStore((s) => s.heightMm);
  const heightM  = React.useMemo(() => (heightMm / 100), [heightMm]);

  const widthMm = useHeadstoneStore((s) => s.widthMm);
  const widthM  = React.useMemo(() => (widthMm / 100), [widthMm]);

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
    onPointerDown: (e: any) => {
      e.stopPropagation();
      setSel(true);
    },
  } as const;

  return (
    <SvgHeadstone
      url="/shapes/headstones/serpentine.svg"
      depth={100}
      scale={0.01}
      faceTexture="/textures/forever/l/Imperial-Red-TILE-900-X-900.jpg"
      sideTexture="/textures/forever/l/Imperial-Red-TILE-900-X-900.jpg"
      tileSize={10} sideTileSize={10} topTileSize={10}
      targetHeight={heightM}
      targetWidth={widthM}
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
            font="/fonts/ChopinScript.otf"
            lift={0.002}
            editable={edit}
            selected={sel}
            onSelect={() => setSel(true)}
            approxHeight={heightM}
          />
        </>
      )}
    </SvgHeadstone>
  );
}

export default function ThreeScene() {
  return (
    <div className="w-full h-[600px] bg-black">
      <Canvas shadows camera={{ position: [2.6, 1.8, 2.6], fov: 45 }}>
        <gridHelper args={[20, 40, "#666", "#333"]} />
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
