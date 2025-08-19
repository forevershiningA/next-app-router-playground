"use client";

import React, { useState, useEffect, Suspense, useMemo } from "react";
import * as THREE from "three";
import { Canvas, useLoader, useThree } from "@react-three/fiber";
import { OrbitControls, Html, useTexture } from "@react-three/drei";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";
import SvgHeadstone from "./SvgHeadstone";
import HeadstoneInscription from "./HeadstoneInscription";
import AutoFit from "./AutoFit";
import { useHeadstoneStore } from "#/lib/headstone-store";
import { DEFAULT_SHAPE_URL } from "#/lib/headstone-constants";

const TEX_BASE = "/textures/forever/l/";
const DEFAULT_TEX = "Imperial-Red.jpg";

/* Fullscreen, big spinner overlay (no setState during render) */
function BigCenteredLoader() {
  return (
    <Html fullscreen>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-gray-100">
          <div className="h-16 w-16 rounded-full border-[6px] border-white/30 border-t-white animate-spin" />
          <div className="text-sm font-mono opacity-80">Loading assets…</div>
        </div>
      </div>
    </Html>
  );
}

/**
 * Preload SVG + textures (Suspense) and delay first draw by one RAF.
 * This avoids a single black frame while the GPU uploads the maps.
 */
function PreloadedHeadstone(props: {
  url: string;
  faceTexture: string;
  sideTexture?: string;
  depth: number;
  scale: number;
  tileSize?: number;
  sideTileSize?: number;
  topTileSize?: number;
  targetHeight: number;
  targetWidth: number;
  preserveTop?: boolean;
  showEdges?: boolean;
  meshProps?: any;
  children: (api: any) => React.ReactNode;
}) {
  const { url, faceTexture, sideTexture } = props;

  // Suspend until assets fetched & decoded
  useLoader(SVGLoader, url);
  useTexture([faceTexture, sideTexture ?? faceTexture]);

  // Defer first render one RAF to avoid a black frame while textures upload to GPU
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    let raf = requestAnimationFrame(() => setArmed(true));
    return () => cancelAnimationFrame(raf);
  }, [url, faceTexture, sideTexture]);

  if (!armed) return null;
  return <SvgHeadstone {...props} />;
}

function HeadstoneWithEditing() {
  const { controls, gl } = useThree() as any;
  const [edit, setEdit] = useState(false);
  const [sel, setSel] = useState(false);

  const heightMm = useHeadstoneStore((s) => s.heightMm);
  const widthMm  = useHeadstoneStore((s) => s.widthMm);
  const shapeUrl = useHeadstoneStore((s) => s.shapeUrl);
  const materialUrl = useHeadstoneStore((s) => s.materialUrl);

  const heightM = useMemo(() => heightMm / 100, [heightMm]);
  const widthM  = useMemo(() => widthMm  / 100, [widthMm]);

  const svgUrl = shapeUrl || DEFAULT_SHAPE_URL;

  // Normalize filename → .jpg and build texture path
  const materialFile = useMemo(() => {
    const file = (materialUrl?.split("/").pop() ?? DEFAULT_TEX);
    return file.replace(/\.(png|webp|jpeg)$/i, ".jpg");
  }, [materialUrl]);
  const faceTex = useMemo(() => TEX_BASE + materialFile, [materialFile]);

  // Remount when either SVG or texture changes → re-trigger Suspense
  const remountKey = `${svgUrl}::${faceTex}`;

  useEffect(() => {
    controls.enabled = !edit;
    controls.enableZoom = !edit;
  }, [edit, controls]);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => { if (edit) e.preventDefault(); };
    gl.domElement.addEventListener("wheel", onWheel, { passive: false });
    return () => gl.domElement.removeEventListener("wheel", onWheel);
  }, [gl.domElement, edit]);

  const meshProps = {
    onPointerDown: (e: any) => { e.stopPropagation(); setSel(true); },
  } as const;

  return (
    <PreloadedHeadstone
      key={remountKey}
      url={svgUrl}
      depth={100}
      scale={0.01}
      faceTexture={faceTex}
      sideTexture={faceTex}
      tileSize={10}
      sideTileSize={10}
      topTileSize={10}
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
    </PreloadedHeadstone>
  );
}

export default function ThreeScene() {
  return (
    <div className="w-full h-[600px] bg-black relative">
      <Canvas shadows camera={{ position: [2.6, 1.8, 2.6], fov: 45 }}>
        <gridHelper args={[20, 40, "#666", "#333"]} />
        <axesHelper args={[1]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 6, 3]} intensity={1} castShadow />

        {/* Fullscreen big loader while SVG/texture assets are loading */}
        <Suspense fallback={<BigCenteredLoader />}>
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
