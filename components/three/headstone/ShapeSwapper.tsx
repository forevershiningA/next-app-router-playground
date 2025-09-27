'use client';

import * as React from 'react';
import * as THREE from 'three';
import { useThree, useLoader, useFrame } from '@react-three/fiber';
import { Html, useTexture } from '@react-three/drei';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';

import AutoFit from '../AutoFit';
import SvgHeadstone from '../../SvgHeadstone';
import HeadstoneInscription from '../../HeadstoneInscription';
import { useHeadstoneStore, Line } from '#/lib/headstone-store';
import { DEFAULT_SHAPE_URL } from '#/lib/headstone-constants';
import { data } from '#/app/_internal/_data';
import { Component, ReactNode } from 'react';

const FONT_MAP: Record<string, string> = data.fonts.reduce(
  (map, font) => {
    map[font.name] = `/fonts/${font.image}`;
    return map;
  },
  {} as Record<string, string>,
);

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Font loading error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return null; // Render nothing instead of crashing
    }

    return this.props.children;
  }
}

function HeadstoneAddition({
  additionId,
  frontZ,
  index,
}: {
  additionId: string;
  frontZ: number;
  index: number;
}) {
  const catalog = useHeadstoneStore((s) => s.catalog);
  const addition = catalog?.product.additions.find((a) => a.id === additionId);

  if (!addition || (addition.type !== 'motif' && addition.type !== 'image'))
    return null;

  // Assume image URL based on type and id, e.g., /motifs/motif1.png
  const imageUrl = `/${addition.type}s/${additionId}.png`; // placeholder

  const texture = useLoader(THREE.TextureLoader, imageUrl);

  return (
    <mesh position={[0, 0, frontZ + 0.001 + index * 0.001]}>
      <planeGeometry args={[0.2, 0.2]} />
      <meshBasicMaterial map={texture} transparent />
    </mesh>
  );
}

/* ---------- constants ---------- */
const TEX_BASE = '/textures/forever/l/';
const DEFAULT_TEX = 'Imperial-Red.jpg';
const BASE_H = 2; // scene units

/* ---------- tiny preloaders (no DOM output) ---------- */
function PreloadShape({ url, onReady }: { url: string; onReady?: () => void }) {
  useLoader(SVGLoader, url);
  React.useEffect(() => {
    const id = requestAnimationFrame(() => onReady?.());
    return () => cancelAnimationFrame(id);
  }, [onReady]);
  return null;
}

function PreloadTexture({
  url,
  onReady,
}: {
  url: string;
  onReady?: () => void;
}) {
  useTexture(url);
  React.useEffect(() => {
    const id = requestAnimationFrame(() => onReady?.());
    return () => cancelAnimationFrame(id);
  }, [onReady]);
  return null;
}

function PreloadFont({ url, onReady }: { url: string; onReady?: () => void }) {
  // For fonts, we can't preload easily, so just delay
  React.useEffect(() => {
    const id = setTimeout(() => onReady?.(), 500); // Simulate loading time
    return () => clearTimeout(id);
  }, [onReady]);
  return null;
}

/* ---------- centered white loader, portaled to #scene-root ---------- */
function InlineCanvasLoader({ show }: { show: boolean }) {
  const [mounted, setMounted] = React.useState(show);
  const [visible, setVisible] = React.useState(show);
  const portalRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      portalRef.current = document.getElementById('scene-root');
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
        className="pointer-events-none absolute inset-0 grid place-items-center transition-opacity duration-200"
        style={{ opacity: visible ? 1 : 0 }}
      >
        <div className="flex flex-col items-center gap-4 text-white drop-shadow">
          <div className="h-16 w-16 animate-spin rounded-full border-[6px] border-white/30 border-t-white" />
          <div className="font-mono text-sm opacity-90">Loading assets…</div>
        </div>
      </div>
    </Html>
  );
}

/* ---------- props ---------- */
export interface ShapeSwapperProps {
  tabletRef: React.RefObject<THREE.Object3D>;
  /** DEPRECATED: avoid passing a single ref to all inscriptions (last one wins). */
  inscriptionRef?: React.MutableRefObject<THREE.Object3D | null>;
}

/* ---------- main ---------- */
export default function ShapeSwapper({
  tabletRef,
  inscriptionRef,
}: ShapeSwapperProps) {
  const { invalidate } = useThree();

  const heightMm = useHeadstoneStore((s) => s.heightMm);
  const widthMm = useHeadstoneStore((s) => s.widthMm);
  const shapeUrl = useHeadstoneStore((s) => s.shapeUrl);
  const materialUrl = useHeadstoneStore((s) => s.materialUrl);
  const inscriptions = useHeadstoneStore((s) => s.inscriptions);
  const catalog = useHeadstoneStore((s) => s.catalog);

  const setSelected = useHeadstoneStore((s) => s.setSelected);

  const selectedInscriptionId = useHeadstoneStore(
    (s) => s.selectedInscriptionId,
  );
  const setSelectedInscriptionId = useHeadstoneStore(
    (s) => s.setSelectedInscriptionId,
  );
  const openInscriptions = useHeadstoneStore((s) => s.openInscriptions);
  const openSizePanel = useHeadstoneStore((s) => s.openSizePanel);
  const fontLoading = useHeadstoneStore((s) => s.fontLoading);
  const selectedAdditions = useHeadstoneStore((s) => s.selectedAdditions);

  const heightM = React.useMemo(() => heightMm / 100, [heightMm]);
  const widthM = React.useMemo(() => widthMm / 100, [widthMm]);

  const requestedUrl = shapeUrl || DEFAULT_SHAPE_URL;
  const requestedTex = React.useMemo(() => {
    const file = materialUrl?.split('/').pop() ?? DEFAULT_TEX;
    const jpg = file.replace(/\.(png|webp|jpeg)$/i, '.jpg');
    return TEX_BASE + jpg;
  }, [materialUrl]);

  const [visibleUrl, setVisibleUrl] = React.useState<string>(requestedUrl);
  const [visibleTex, setVisibleTex] = React.useState<string>(requestedTex);
  const [fitTick, setFitTick] = React.useState(0);

  const swapping = requestedUrl !== visibleUrl || requestedTex !== visibleTex;

  React.useEffect(() => {
    const id = requestAnimationFrame(() => setFitTick((n) => n + 1));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <>
      <group ref={tabletRef}>
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
          inscriptions={inscriptions}
          selectedAdditions={selectedAdditions}
          meshProps={{
            name: 'headstone',
            onClick: (e) => {
              e.stopPropagation();
              setSelected('headstone');
              setSelectedInscriptionId(null);
              openSizePanel?.();
            },
          }}
        >
          {(api: any, selectedAdditions: string[]) => (
            <>
              {inscriptions.map((line: Line, i: number) => (
                <ErrorBoundary key={line.id}>
                  <React.Suspense fallback={null}>
                    <HeadstoneInscription
                      id={line.id}
                      headstone={api}
                      font={FONT_MAP[line.font] || '/fonts/ebgaramond.woff2'}
                      editable
                      selected={selectedInscriptionId === line.id}
                      onSelectInscription={() => {
                        // Single source of truth: id-based selection via store helper
                        setSelected(null);
                        openInscriptions?.(line.id);
                      }}
                      color="#fff8dc"
                      lift={0.002}
                      xPos={line.xPos}
                      yPos={line.yPos}
                      rotationDeg={line.rotationDeg}
                      height={line.sizeMm}
                      text={line.text}
                      // NEGATIVE bump so later items are slightly farther away
                      zBump={-i * 0.00005}
                    />
                  </React.Suspense>
                </ErrorBoundary>
              ))}
              {selectedAdditions.map((additionId, i) => (
                <HeadstoneAddition
                  key={additionId}
                  additionId={additionId}
                  frontZ={api.frontZ}
                  index={i}
                />
              ))}
            </>
          )}
        </SvgHeadstone>

        <AutoFit
          target={tabletRef}
          baseHeight={BASE_H}
          margin={1.15}
          pad={0.04}
          trigger={fitTick}
        />
      </group>

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

      <InlineCanvasLoader show={swapping || fontLoading} />
    </>
  );
}
