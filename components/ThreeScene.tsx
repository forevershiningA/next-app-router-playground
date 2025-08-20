// components/ThreeScene.tsx
"use client";

import React, { useState, useEffect, useMemo, useRef, Suspense } from "react";
import * as THREE from "three";
import { Canvas, useLoader, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Html, useTexture, Edges } from "@react-three/drei";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";

import SvgHeadstone from "./SvgHeadstone";
import HeadstoneInscription from "./HeadstoneInscription";
import AutoFit from "./AutoFit";
import { useHeadstoneStore } from "#/lib/headstone-store";
import { DEFAULT_SHAPE_URL } from "#/lib/headstone-constants";

const TEX_BASE = "/textures/forever/l/";
const DEFAULT_TEX = "Imperial-Red.jpg";

/* ---------- UI ---------- */

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
 * Mesh-accurate white outline that tracks the tablet *mesh*.
 * We recompute the mesh geometry's bounding box, transform it to world,
 * and feed it to a Box3Helper each frame. This makes the outline follow
 * height/width/shape changes precisely.
 */
/**
 * Mesh-accurate white outline that truly follows the tablet height.
 * Computes world-space bounds from the mesh each frame.
 */
/**
 * Mesh-accurate outline that follows the tablet height/width and
 * never shows the back edges through the stone.
 */
/**
 * Mesh-accurate outline that follows the WHOLE tablet (group).
 * Computes world-space bounds from the given Object3D each frame.
 */
function MeshOutline({
  object,
  visible = true,
  color = "white",
}: {
  object: THREE.Object3D | null | undefined; // pass api.group.current
  visible?: boolean;
  color?: string;
}) {
  const { scene } = useThree();
  const helperRef = useRef<THREE.Box3Helper | null>(null);
  const boxWorld = useRef(new THREE.Box3());
  const PAD = 0.0008; // tiny pad to avoid z-fighting

  useEffect(() => {
    if (helperRef.current) {
      scene.remove(helperRef.current);
      helperRef.current.geometry.dispose();
      // @ts-ignore
      helperRef.current.material.dispose?.();
      helperRef.current = null;
    }
    if (!visible || !object) return;

    const h = new THREE.Box3Helper(boxWorld.current, new THREE.Color(color).getHex());
    // keep depthTest ON so back edges don’t draw through the stone
    // @ts-ignore
    h.material.depthTest = true;
    // @ts-ignore
    h.material.depthWrite = false;
    h.renderOrder = 10;

    helperRef.current = h;
    scene.add(h);
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

    // include all children & ancestor transforms (AutoFit / height changes)
    obj.updateWorldMatrix(true, true);
    boxWorld.current.setFromObject(obj);

    if (boxWorld.current.isEmpty()) {
      helper.visible = false;
      return;
    }

    const padded = boxWorld.current.clone().expandByScalar(PAD);
    // @ts-ignore Box3Helper exposes .box
    helper.box.copy(padded);
    helper.visible = !!visible;
    helper.updateMatrixWorld(true);
  });

  return null;
}

/* ---------- Base (robust placement) ---------- */
function HeadstoneBaseAuto({
  headstoneMesh, // tablet mesh ref
  selected,
  onClick,
  height = 0.18, // 180 mm
}: {
  headstoneMesh: React.RefObject<THREE.Object3D>;
  selected: boolean;
  onClick?: (e: any) => void;
  height?: number;
}) {
  const baseRef = useRef<THREE.Mesh>(null);

  const bbWorld = useRef(new THREE.Box3());
  const size = useRef(new THREE.Vector3());
  const center = useRef(new THREE.Vector3());
  const EPS = 1e-4;

  useFrame(() => {
    const hs = headstoneMesh.current as THREE.Object3D | undefined;
    const base = baseRef.current;
    if (!hs || !base) return;

    bbWorld.current.setFromObject(hs);
    if (bbWorld.current.isEmpty()) {
      base.visible = false;
      return;
    }
    base.visible = true;

    bbWorld.current.getSize(size.current);
    bbWorld.current.getCenter(center.current);

    const baseWidth = size.current.x + 0.1; // +100 mm
    const baseDepth = size.current.z + 0.04; // +40 mm

    const baseCenterX = center.current.x;
    const hsBottomY = bbWorld.current.min.y;
    const baseCenterY = hsBottomY - height / 2 + EPS; // top flush to tablet bottom
    const hsBackZ = bbWorld.current.min.z;
    const baseCenterZ = hsBackZ + baseDepth / 2; // extra to +Z/front

    base.position.set(baseCenterX, baseCenterY, baseCenterZ);
    base.scale.set(baseWidth, height, baseDepth);
  });

  return (
    <mesh ref={baseRef} onClick={onClick} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#212529" metalness={0.1} roughness={0.55} />
      {selected && <Edges threshold={15} scale={1.002} color="white" />}
    </mesh>
  );
}

/* ---------- Preloader ---------- */
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
  useLoader(SVGLoader, url);
  useTexture([faceTexture, sideTexture ?? faceTexture]);

  const [armed, setArmed] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setArmed(true));
    return () => cancelAnimationFrame(raf);
  }, [url, faceTexture, sideTexture]);

  if (!armed) return null;
  return <SvgHeadstone {...props} />;
}

// Keep position side-effect out of render
const HeadstonePositioner = ({ api, yPosition }: { api: any; yPosition: number }) => {
  useEffect(() => {
    if (api?.group?.current) {
      api.group.current.position.y = yPosition;
    }
  }, [api, yPosition]);
  return null;
};

/* ---------- Scene contents ---------- */

function HeadstoneWithEditing() {
  const { controls, gl } = useThree() as any;

  const [selected, setSelected] = useState<"headstone" | "base" | null>(null);
  const [edit] = useState(false);
  const [inscriptionSel, setInscriptionSel] = useState(false);

  const heightMm = useHeadstoneStore((s) => s.heightMm);
  const widthMm = useHeadstoneStore((s) => s.widthMm);
  const shapeUrl = useHeadstoneStore((s) => s.shapeUrl);
  const materialUrl = useHeadstoneStore((s) => s.materialUrl);

  const heightM = useMemo(() => heightMm / 100, [heightMm]);
  const widthM = useMemo(() => widthMm / 100, [widthMm]);

  const svgUrl = shapeUrl || DEFAULT_SHAPE_URL;

  const materialFile = useMemo(() => {
    const file = materialUrl?.split("/").pop() ?? DEFAULT_TEX;
    return file.replace(/\.(png|webp|jpeg)$/i, ".jpg");
  }, [materialUrl]);
  const faceTex = useMemo(() => TEX_BASE + materialFile, [materialFile]);

  const remountKey = `${svgUrl}::${faceTex}`;

  useEffect(() => {
    controls.enabled = !edit;
    controls.enableZoom = !edit;
  }, [edit, controls]);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      if (edit) e.preventDefault();
    };
    gl.domElement.addEventListener("wheel", onWheel, { passive: false });
    return () => gl.domElement.removeEventListener("wheel", onWheel);
  }, [gl.domElement, edit]);

  const BASE_H = 0.18; // 180 mm
  const apiRef = useRef<any>(null);

  const meshProps = {
    onPointerDown: (e: any) => {
      e.stopPropagation();
      setSelected("headstone");
    },
  } as const;

  return (
    <>
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
        showEdges={false}
        meshProps={meshProps}
      >
        {(api) => {
          apiRef.current = api;
          return (
            <>
              <HeadstonePositioner api={api} yPosition={BASE_H} />
              <AutoFit target={api.group} />

              {/* Outline now follows the *mesh geometry* → height changes included */}
              <MeshOutline
                key={`outline::${remountKey}::${heightM}::${widthM}`}
                object={api.group?.current ?? undefined}   // ← whole tablet group
                visible={selected === "headstone"}
                color="white"
              />
              <HeadstoneInscription
                headstone={api}
                text="In Loving Memory"
                height={0.5}
                color="#fff8dc"
                font="/fonts/ChopinScript.otf"
                lift={0.002}
                editable={false}
                selected={inscriptionSel}
                onSelect={() => setInscriptionSel(true)}
                approxHeight={heightM}
              />

              {/* Base: +100mm width, +40mm depth, back flush */}
              <HeadstoneBaseAuto
                headstoneMesh={api.mesh}
                selected={selected === "base"}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelected("base");
                }}
                height={BASE_H}
              />
            </>
          );
        }}
      </PreloadedHeadstone>

      {/* click-away to clear selection */}
      <mesh position={[0, -0.001, 0]} onPointerDown={() => setSelected(null)} visible={false}>
        <boxGeometry args={[100, 0.001, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </>
  );
}

/* ---------- Exported Canvas ---------- */

export default function ThreeScene() {
  return (
    <div className="w-full h-[600px] bg-black relative">
      <Canvas shadows camera={{ position: [2.6, 1.8, 2.6], fov: 45 }}>
        <gridHelper args={[20, 40, "#666", "#333"]} />
        <axesHelper args={[1]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 6, 3]} intensity={1} castShadow />

        <Suspense fallback={<BigCenteredLoader />}>
          <HeadstoneWithEditing />
        </Suspense>

        {/* Ground a hair below y=0 to avoid z-fighting with base bottom */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.001, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#e5e5e5" />
        </mesh>

        <OrbitControls makeDefault enableDamping dampingFactor={0.08} />
      </Canvas>
    </div>
  );
}
