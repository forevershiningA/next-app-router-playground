// components/three/headstone/ShapeSwapper.tsx
"use client";

import * as React from "react";
import * as THREE from "three";
import { useThree, useLoader } from "@react-three/fiber";
import { Html, useTexture } from "@react-three/drei";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader";

import AutoFit from "../../AutoFit"; // re-export points to components/three/AutoFit
import SvgHeadstone from "../../SvgHeadstone";
import HeadstoneInscription from "../../HeadstoneInscription";
import { useHeadstoneStore } from "#/lib/headstone-store";
import { DEFAULT_SHAPE_URL } from "#/lib/headstone-constants";

/* ---------- constants ---------- */
const TEX_BASE = "/textures/forever/l/";
const DEFAULT_TEX = "Imperial-Red.jpg";
const BASE_H = 2; // scene units (100mm)

/* ---------- tiny preloaders (no DOM output) ---------- */
function PreloadShape({ url, onReady }: { url: string; onReady?: () => void }) {
  useLoader(SVGLoader, url);
  React.useEffect(() => {
    const id = requestAnimationFrame(() => onReady?.());
    return () => cancelAnimationFrame(id);
  }, [onReady]);
  return null;
}

function PreloadTexture({ url, onReady }: { url: string; onReady?: () => void }) {
  // drei's useTexture
  useTexture(url);
  React.useEffect(() => {
    const id = requestAnimationFrame(() => onReady?.());
    return () => cancelAnimationFrame(id);
  }, [onReady]);
  return null;
}

/* ---------- centered white loader, portaled to #scene-root ---------- */
function InlineCanvasLoader({ show }: { show: boolean }) {
  const [mounted, setMounted] = React.useState(show);
  const [visible, setVisible] = React.useState(show);
  const portalRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      portalRef.current = document.getElementById("scene-root");
    }
  }, []);

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
      portal={portalRef as React.RefObject<HTMLElement>}
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

/* ---------- props ---------- */
export interface ShapeSwapperProps {
  tabletRef: React.RefObject<THREE.Object3D>;
  onSelectHeadstone?: () => void;
}

/* ---------- main ---------- */
export default function ShapeSwapper({ tabletRef, onSelectHeadstone }: ShapeSwapperProps) {
  const { invalidate } = useThree();

  // Store state
  const heightMm = useHeadstoneStore((s: any) => s.heightMm);
  const widthMm  = useHeadstoneStore((s: any) => s.widthMm);
  const shapeUrl = useHeadstoneStore((s: any) => s.shapeUrl);
  const materialUrl = useHeadstoneStore((s: any) => s.materialUrl);

  const heightM = React.useMemo(() => heightMm / 100, [heightMm]);
  const widthM  = React.useMemo(() => widthMm  / 100, [widthMm]);

  // Desired (requested) assets from store
  const requestedUrl = shapeUrl || DEFAULT_SHAPE_URL;
  const requestedTex = React.useMemo(() => {
    const file = materialUrl?.split("/").pop() ?? DEFAULT_TEX;
    const jpg = file.replace(/\.(png|webp|jpeg)$/i, ".jpg");
    return TEX_BASE + jpg;
  }, [materialUrl]);

  // Actually visible assets (lag behind while we preload)
  const [visibleUrl, setVisibleUrl] = React.useState<string>(requestedUrl);
  const [visibleTex, setVisibleTex] = React.useState<string>(requestedTex);

  // Force AutoFit refit once geometry/texture are truly visible
  const [fitTick, setFitTick] = React.useState(0);

  // Show loader if we're swapping either shape or texture
  const swapping = requestedUrl !== visibleUrl || requestedTex !== visibleTex;

  // On first paint, bump AutoFit once (in case assets were already ready)
  React.useEffect(() => {
    const id = requestAnimationFrame(() => setFitTick((n) => n + 1));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <>
      {/* Tablet group hosts the visible headstone */}
      <group
        ref={tabletRef}
          onPointerDown={(e) => {
            e.stopPropagation();
            console.log("🪨 headstone mesh wrapper clicked");
            onSelectHeadstone();
          }}
      >
        <SvgHeadstone
          key={`${visibleUrl}::${visibleTex}`}
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
          meshProps={{}}
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

        {/* Smooth framing – runs on init, on size changes, and when fitTick bumps */}
        <AutoFit
          target={tabletRef}
          baseHeight={BASE_H}  // scene units
          margin={1.15}
          pad={0.04}
          trigger={fitTick}
        />
      </group>

      {/* Preloaders for requested assets (update visible + nudge AutoFit when ready) */}
      {requestedUrl !== visibleUrl && (
        <React.Suspense fallback={null}>
          <PreloadShape
            url={requestedUrl}
            onReady={() => {
              setVisibleUrl(requestedUrl);
              requestAnimationFrame(() => setFitTick((n) => n + 1));
              invalidate();
            }}
          />
        </React.Suspense>
      )}

      {requestedTex !== visibleTex && (
        <React.Suspense fallback={null}>
          <PreloadTexture
            url={requestedTex}
            onReady={() => {
              setVisibleTex(requestedTex);
              requestAnimationFrame(() => setFitTick((n) => n + 1));
              invalidate();
            }}
          />
        </React.Suspense>
      )}

      {/* Centered loader while swapping */}
      <InlineCanvasLoader show={swapping} />
    </>
  );
}
