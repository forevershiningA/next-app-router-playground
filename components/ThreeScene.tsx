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

/* ---------- constants ---------- */
const TEX_BASE = "/textures/forever/l/";
const DEFAULT_TEX = "Imperial-Red.jpg";
const BASE_H = 2; // 100 mm

/* ---------- UI loader ---------- */
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

/* ---------- optional outline for selection ---------- */
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

/* ---------- Preloader: arm after one RAF & invalidate once ---------- */
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

  const { invalidate } = useThree();
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setArmed(true);
      invalidate(); // render right after assets are ready
    });
    return () => cancelAnimationFrame(raf);
  }, [url, faceTexture, sideTexture, invalidate]);

  if (!armed) return null;
  return <SvgHeadstone {...props} />;
}

/* ---------- Base (frame-until-placed from TABLET bbox, in ASSEMBLY space) ---------- */
function HeadstoneBaseAuto({
  headstoneObject,   // tablet-only group (NOT including the base)
  wrapper,           // assembly group (parent of tablet + base)
  selected,
  onClick,
  height = 0.10,
  depsKey,           // optional; kept for compatibility, not required
}: {
  headstoneObject: React.RefObject<THREE.Object3D>;
  wrapper: React.RefObject<THREE.Object3D>;
  selected: boolean;
  onClick?: (e: any) => void;
  height?: number;
  depsKey?: string;
}) {
  const baseRef = useRef<THREE.Mesh>(null);

  // Track if we've ever had a valid transform, and targets for smooth updates
  const hasTransform = useRef(false);
  const targetPos = useRef(new THREE.Vector3());
  const targetScale = useRef(new THREE.Vector3(1, height, 1));

  const LERP = 0.25; // smoothing factor per frame
  const EPS = 1e-3;

  useFrame(() => {
    const tablet = headstoneObject.current as THREE.Object3D | null;
    const wrap   = wrapper.current as THREE.Object3D | null;
    const base   = baseRef.current;
    if (!tablet || !wrap || !base) return;

    // Read the TABLET bbox (base is excluded)
    tablet.updateWorldMatrix(true, true);
    const bbWorld = new THREE.Box3().setFromObject(tablet);

    if (!bbWorld.isEmpty()) {
      const min = bbWorld.min;
      const max = bbWorld.max;

      // Guard against transient zeros during rescale/remount
      const hsWidthW = Math.max(max.x - min.x, 1e-6);
      const hsDepthW = Math.max(max.z - min.z, 1e-6);

      const baseWidthW = Math.max(hsWidthW * 1.4, 0.05);
      const baseDepthW = Math.max(hsDepthW * 2.0, 0.05);

      // World-space target center: under tablet, back flush
      const centerWorld = new THREE.Vector3(
        (min.x + max.x) * 0.5,
        min.y - height * 0.5 + EPS,
        min.z + baseDepthW * 0.5
      );

      // World → wrapper local (the base lives under wrapper)
      wrap.updateWorldMatrix(true, false);
      const invWrapper = new THREE.Matrix4().copy(wrap.matrixWorld).invert();
      const posLocal = centerWorld.applyMatrix4(invWrapper);

      const s = new THREE.Vector3();
      wrap.getWorldScale(s);

      targetPos.current.copy(posLocal);
      targetScale.current.set(
        baseWidthW / Math.max(1e-9, s.x),
        height      / Math.max(1e-9, s.y),
        baseDepthW  / Math.max(1e-9, s.z)
      );

      if (!hasTransform.current) {
        // First valid frame: snap to target, show immediately (no flicker)
        base.position.copy(targetPos.current);
        base.scale.copy(targetScale.current);
        base.visible = true;
        hasTransform.current = true;
      }
    }

    // If we’ve never had a valid transform, keep hidden (initial load only)
    if (!hasTransform.current) {
      base.visible = false;
      return;
    }

    // Smoothly follow target transforms; never hide during updates
    base.position.lerp(targetPos.current, LERP);
    base.scale.lerp(targetScale.current, LERP);
    base.visible = true;
  });

  return (
    <mesh
      ref={baseRef}
      onClick={onClick}
      castShadow
      receiveShadow
      // keep visible managed in the frame loop
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#212529" metalness={0.1} roughness={0.55} />
      {selected && <Edges threshold={15} scale={1.002} color="white" />}
    </mesh>
  );
}

/* ---------- Scene contents ---------- */
function HeadstoneWithEditing() {
  const [selected, setSelected] = useState<"headstone" | "base" | null>(null);
  const [inscriptionSel, setInscriptionSel] = useState(false);

  const heightMm = useHeadstoneStore((s: any) => s.heightMm);
  const widthMm  = useHeadstoneStore((s: any) => s.widthMm);
  const shapeUrl = useHeadstoneStore((s: any) => s.shapeUrl);
  const materialUrl = useHeadstoneStore((s: any) => s.materialUrl);

  const heightM = useMemo(() => heightMm / 100, [heightMm]);
  const widthM  = useMemo(() => widthMm  / 100, [widthMm]);

  const svgUrl = shapeUrl || DEFAULT_SHAPE_URL;

  const materialFile = useMemo(() => {
    const file = materialUrl?.split("/").pop() ?? DEFAULT_TEX;
    return file.replace(/\.(png|webp|jpeg)$/i, ".jpg");
  }, [materialUrl]);
  const faceTex = useMemo(() => TEX_BASE + materialFile, [materialFile]);

  const remountKey = `${svgUrl}::${faceTex}`;
  const depsKey    = `${svgUrl}::${faceTex}::${heightM}::${widthM}`;

  const meshProps = {
    onPointerDown: (e: any) => {
      e.stopPropagation();
      setSelected("headstone");
    },
  } as const;

  const assemblyRef = useRef<THREE.Object3D>(new THREE.Group());
  const tabletRef   = useRef<THREE.Object3D>(new THREE.Group());

  return (
    <>
      <group ref={assemblyRef} position={[0, BASE_H, 0]}>
        <group ref={tabletRef}>
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
            {(api) => (
              <>
                {/* Fit camera to the TABLET group only */}
                <AutoFit target={tabletRef} />

                <MeshOutline
                  key={`outline::${remountKey}::${heightM}::${widthM}`}
                  object={tabletRef.current ?? undefined}
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
            )}
          </PreloadedHeadstone>
        </group>

        {/* Base: computed from TABLET bounds, positioned in ASSEMBLY space */}
        <HeadstoneBaseAuto
          headstoneObject={tabletRef}
          wrapper={assemblyRef}
          selected={selected === "base"}
          onClick={(e) => { e.stopPropagation(); setSelected("base"); }}
          height={BASE_H}
          depsKey={depsKey}
        />
      </group>

      {/* click-away to clear selection */}
      <mesh
        position={[0, -0.001, 0]}
        onPointerDown={() => setSelected(null)}
        visible={false}
      >
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
      <Canvas
        frameloop="always" // ensures initial frames for placement
        shadows
        camera={{ position: [2.6, 1.8, 2.6], fov: 45 }}
      >
        <gridHelper args={[20, 40, "#666", "#333"]} />
        <axesHelper args={[1]} />
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 6, 3]} intensity={1} castShadow />

        <Suspense fallback={<BigCenteredLoader />}>
          <HeadstoneWithEditing />
        </Suspense>

        {/* Ground a hair below y=0 to avoid z-fighting */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.001, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#e5e5e5" />
        </mesh>

        <OrbitControls makeDefault enableDamping dampingFactor={0.08} />
      </Canvas>
    </div>
  );
}
