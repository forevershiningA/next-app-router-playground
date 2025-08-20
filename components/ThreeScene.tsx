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
 * White outline that follows the WHOLE tablet group.
 * Computes world-space bounds every frame. Depth test ON so back edges
 * do not render through the stone. Tiny pad prevents z-fighting.
 */
function MeshOutline({
  object,
  visible = true,
  color = "white",
}: {
  object: THREE.Object3D | null | undefined;
  visible?: boolean;
  color?: string;
}) {
  const { scene } = useThree();
  const helperRef = useRef<THREE.Box3Helper | null>(null);
  const boxWorld = useRef(new THREE.Box3());
  const PAD = 0.0008;

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

    obj.updateWorldMatrix(true, true);
    boxWorld.current.setFromObject(obj);

    if (boxWorld.current.isEmpty()) {
      helper.visible = false;
      return;
    }

    const padded = boxWorld.current.clone().expandByScalar(PAD);
    // @ts-ignore
    helper.box.copy(padded);
    helper.visible = !!visible;
    helper.updateMatrixWorld(true);
  });

  return null;
}

/* ---------- Base (world → wrapper local; +15% width, +10% depth) ---------- */
function HeadstoneBaseAuto({
  headstoneObject,           // tablet group (api.group)
  wrapper,                   // wrapper group (tablet + base)
  selected,
  onClick,
  height = 0.10,             // base height (meters) — 0.10 = 100 mm
}: {
  headstoneObject: React.RefObject<THREE.Object3D>;
  wrapper: React.RefObject<THREE.Object3D>;
  selected: boolean;
  onClick?: (e: any) => void;
  height?: number;
}) {
  const baseRef = useRef<THREE.Mesh>(null);

  const bbWorld = useRef(new THREE.Box3());
  const centerWorld = useRef(new THREE.Vector3());
  const posLocal = useRef(new THREE.Vector3());
  const invWrapper = useRef(new THREE.Matrix4());
  const wrapperScaleW = useRef(new THREE.Vector3());
  const EPS = 1e-3;

  useFrame(() => {
    const hs = headstoneObject.current;
    const wrap = wrapper.current as THREE.Object3D | null;
    const base = baseRef.current;
    if (!base || !wrap) return;

    if (!hs) {
      base.visible = false;   // hide until tablet exists
      return;
    }

    // WORLD bbox of the tablet group
    hs.updateWorldMatrix(true, true);
    bbWorld.current.setFromObject(hs);
    if (bbWorld.current.isEmpty()) {
      base.visible = false;
      return;
    }

    const min = bbWorld.current.min;
    const max = bbWorld.current.max;

    const hsWidthW = max.x - min.x;
    const hsDepthW = max.z - min.z;

    // +15% wider, +10% thicker
    const baseWidthW = hsWidthW * 1.4;
    const baseDepthW = hsDepthW * 2;

    // Base center in WORLD: top flush, back flush (extra to +Z/front)
    centerWorld.current.set(
      (min.x + max.x) * 0.5,      // X center
      min.y - height * 0.5 + EPS, // Y under the tablet
      min.z + baseDepthW * 0.5    // Z: back flush
    );

    // WORLD → WRAPPER LOCAL
    wrap.updateWorldMatrix(true, false);
    invWrapper.current.copy(wrap.matrixWorld).invert();
    posLocal.current.copy(centerWorld.current).applyMatrix4(invWrapper.current);

    // WORLD sizes → WRAPPER scales
    wrap.getWorldScale(wrapperScaleW.current);
    const s = wrapperScaleW.current;

    base.position.copy(posLocal.current);
    base.scale.set(
      baseWidthW / Math.max(1e-9, s.x),
      height      / Math.max(1e-9, s.y),
      baseDepthW  / Math.max(1e-9, s.z)
    );

    base.visible = true;       // show every frame once positioned
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

  // Defer one RAF to avoid a black frame while textures upload to GPU
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setArmed(true));
    return () => cancelAnimationFrame(raf);
  }, [url, faceTexture, sideTexture]);

  if (!armed) return null;
  return <SvgHeadstone {...props} />;
}

/* ---------- Scene contents ---------- */
function HeadstoneWithEditing() {
  const { controls, gl } = useThree() as any;

  const [selected, setSelected] = useState<"headstone" | "base" | null>(null);
  const [edit] = useState(false);
  const [inscriptionSel, setInscriptionSel] = useState(false);

  const heightMm = useHeadstoneStore((s) => s.heightMm);
  const widthMm  = useHeadstoneStore((s) => s.widthMm);
  const shapeUrl = useHeadstoneStore((s) => s.shapeUrl);
  const materialUrl = useHeadstoneStore((s) => s.materialUrl);

  const heightM = useMemo(() => heightMm / 100, [heightMm]);
  const widthM  = useMemo(() => widthMm  / 100, [widthMm]);

  const svgUrl = shapeUrl || DEFAULT_SHAPE_URL;

  // Normalize to .jpg and build texture path
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
    const onWheel = (e: WheelEvent) => { if (edit) e.preventDefault(); };
    gl.domElement.addEventListener("wheel", onWheel, { passive: false });
    return () => gl.domElement.removeEventListener("wheel", onWheel);
  }, [gl.domElement, edit]);

  const BASE_H = 2;

  const meshProps = {
    onPointerDown: (e: any) => {
      e.stopPropagation();
      setSelected("headstone");
    },
  } as const;

  // wrapper holds tablet group + base and is lifted by BASE_H so base sits on ground
  const wrapperRef = useRef<THREE.Group>(null);
  const tabletGroupRef = useRef<THREE.Group | null>(null);

  return (
    <>
      <group ref={wrapperRef} position={[0, BASE_H, 0]}>
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
            tabletGroupRef.current = api.group?.current ?? null;
            return (
              <>
                {/* Keep camera fitting locked to the tablet only */}
                <AutoFit target={api.group} />

                {/* Outline around the whole tablet group */}
                <MeshOutline
                  key={`outline::${remountKey}::${heightM}::${widthM}`}
                  object={api.group?.current ?? undefined}
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
              </>
            );
          }}
        </PreloadedHeadstone>

        {/* Base is a sibling of the tablet under the same wrapper (always rendered) */}
        <HeadstoneBaseAuto
          headstoneObject={tabletGroupRef}   // pass the ref itself, not .current
          wrapper={wrapperRef}
          selected={selected === "base"}
          onClick={(e) => { e.stopPropagation(); setSelected("base"); }}
          height={BASE_H}
        />
      </group>

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
