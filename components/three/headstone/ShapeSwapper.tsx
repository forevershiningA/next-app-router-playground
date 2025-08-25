// components/three/headstone/ShapeSwapper.tsx
"use client";

import React, { Suspense, useMemo, useState, useEffect } from "react";
import type * as THREE from "three";
import { useThree, useLoader } from "@react-three/fiber";
import { Html, useTexture } from "@react-three/drei";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";

import { useHeadstoneStore } from "#/lib/headstone-store";
import { DEFAULT_SHAPE_URL } from "#/lib/headstone-constants";
import SvgHeadstone from "../../SvgHeadstone";
import HeadstoneInscription from "../../HeadstoneInscription";
import AutoFit from "../../AutoFit";

const TEX_BASE = "/textures/forever/l/";
const DEFAULT_TEX = "Imperial-Red.jpg";
const BASE_H = 2;

/* ---------- small, centered loader (Html → portal to #scene-root) ---------- */
function InlineCanvasLoader({ show }: { show: boolean }) {
  const [mounted, setMounted] = React.useState(show);
  const [visible, setVisible] = React.useState(show);

  // <-- hold the portal container as a RefObject<HTMLElement>
  const portalRef = React.useRef<HTMLElement | null>(null);

  // find #scene-root once on mount
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    portalRef.current = document.getElementById("scene-root");
  }, []);

  // fade in/out
  React.useEffect(() => {
    if (show) {
      setMounted(true);
      const id = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(id);
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 200);
      return () => clearTimeout(t);
    }
  }, [show]);

  if (!mounted) return null;

  return (
    <Html
      fullscreen
      transform={false}
      portal={portalRef as React.RefObject<HTMLElement>} // ✅ ref, not element
      zIndexRange={[1000, 0]}
    >
      <div
        className="absolute inset-0 grid place-items-center pointer-events-none transition-opacity duration-200"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <div className="flex flex-col items-center gap-4 text-white drop-shadow">
          <div className="h-16 w-16 rounded-full border-[6px] border-white/30 border-t-white animate-spin" />
          <div className="text-sm font-mono opacity-90">Loading assets…</div>
        </div>
      </div>
    </Html>
  );
}

/* ---------- hidden preloaders (suspend locally, not at Canvas) ---------- */
function PreloadShape({ url, onReady }: { url: string; onReady: () => void }) {
  useLoader(SVGLoader, url); // suspends here until loaded
  useEffect(() => onReady(), [onReady]); // mount => ready
  return null;
}

function PreloadTexture({ url, onReady }: { url: string; onReady: () => void }) {
  useTexture([url]); // suspends here until loaded
  useEffect(() => onReady(), [onReady]); // mount => ready
  return null;
}

export default function ShapeSwapper({
  tabletRef,
  onSelectHeadstone,
}: {
  tabletRef: React.RefObject<THREE.Object3D>;
  onSelectHeadstone: () => void;
}) {
  const heightMm     = useHeadstoneStore((s: any) => s.heightMm);
  const widthMm      = useHeadstoneStore((s: any) => s.widthMm);
  const requestedUrl = useHeadstoneStore((s: any) => s.shapeUrl) || DEFAULT_SHAPE_URL;
  const materialUrl  = useHeadstoneStore((s: any) => s.materialUrl);

  const heightM = useMemo(() => heightMm / 100, [heightMm]);
  const widthM  = useMemo(() => widthMm  / 100, [widthMm]);

  const requestedTex = useMemo(() => {
    const f = (materialUrl?.split("/").pop() ?? DEFAULT_TEX).replace(/\.(png|webp|jpeg)$/i, ".jpg");
    return TEX_BASE + f;
  }, [materialUrl]);

  // what’s currently visible
  const [visibleUrl, setVisibleUrl] = useState(requestedUrl);
  const [visibleTex, setVisibleTex] = useState(requestedTex);

  const { invalidate } = useThree();

  // are we warming either a new shape or a new texture?
  const loading = requestedUrl !== visibleUrl || requestedTex !== visibleTex;

  return (
    <>
      {/* Visible tablet – never suspends because we only swap to preloaded URLs */}
      <group
        ref={tabletRef}
        onPointerDown={(e) => {
          e.stopPropagation();
          onSelectHeadstone();
        }}
      >
        <SvgHeadstone
          url={visibleUrl}
          depth={100}
          scale={0.01}
          faceTexture={visibleTex}
          sideTexture={visibleTex}
          tileSize={10}
          sideTileSize={10}
          topTileSize={10}
          targetHeight={heightM}
          targetWidth={widthM}
          preserveTop
          showEdges={false}
        >
          {(api: any) => (
            <HeadstoneInscription
              headstone={api}
              text="In Loving Memory"
              height={0.5}
              color="#fff8dc"
              font="/fonts/ChopinScript.otf"
              lift={0.002}
              editable={false}
              selected={false}
              approxHeight={heightM}
            />
          )}
        </SvgHeadstone>
        <AutoFit target={tabletRef} baseHeight={BASE_H} />
      </group>

      {/* Hidden preloaders — each suspends locally and calls onReady when done */}
      {requestedUrl !== visibleUrl && (
        <Suspense fallback={null}>
          <PreloadShape
            url={requestedUrl}
            onReady={() => {
              setVisibleUrl(requestedUrl);
              invalidate();
            }}
          />
        </Suspense>
      )}

      {requestedTex !== visibleTex && (
        <Suspense fallback={null}>
          <PreloadTexture
            url={requestedTex}
            onReady={() => {
              setVisibleTex(requestedTex);
              invalidate();
            }}
          />
        </Suspense>
      )}

      {/* Centered loader overlay while either preloader is active */}
      <InlineCanvasLoader show={loading} />
    </>
  );
}
