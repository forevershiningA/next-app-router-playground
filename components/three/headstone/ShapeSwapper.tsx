'use client';

import * as React from 'react';
import * as THREE from 'three';
import { useThree, useLoader } from '@react-three/fiber';
import { Html, useTexture } from '@react-three/drei';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';

import AutoFit from '../AutoFit';
import AdditionModel from '../AdditionModel';
import MotifModel from '../MotifModel';
import SvgHeadstone, { HeadstoneAPI } from '../../SvgHeadstone';
import HeadstoneInscription from '../../HeadstoneInscription';
import { BronzeBorder } from '../BronzeBorder';
import { useHeadstoneStore, Line } from '#/lib/headstone-store';
import { DEFAULT_SHAPE_URL } from '#/lib/headstone-constants';
import { data } from '#/app/_internal/_data';
import { AdditionData } from '#/lib/xml-parser';
import { usePathname, useRouter } from 'next/navigation';
import type { Component, ReactNode } from 'react';

/* --------------------------------- constants -------------------------------- */
const TEX_BASE = '/textures/forever/l/';
const DEFAULT_TEX = 'Imperial-Red.webp';
const BASE_H = 2; // used by AutoFit only

/* --------------------------------- font map --------------------------------- */
// Simply use the font files as specified in the data
const FONT_MAP: Record<string, string> = data.fonts.reduce(
  (map, font) => {
    map[font.name] = `/fonts/${font.image}`;
    return map;
  },
  {} as Record<string, string>,
);

/* ------------------------------- error boundary ------------------------------ */
class ErrorBoundary extends (
  React as unknown as { Component: typeof Component }
).Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(_: Error) {
    return { hasError: true };
  }
  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Font/model loading error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}

/* ------------------------------ preload helpers ----------------------------- */
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
        className="pointer-events-none fixed inset-0 flex items-center justify-center transition-opacity duration-200"
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

/* ----------------------------------- props ---------------------------------- */
export interface ShapeSwapperProps {
  tabletRef: React.RefObject<THREE.Object3D>;
  headstoneMeshRef?: React.RefObject<THREE.Mesh>;
}

/* ----------------------------------- main ----------------------------------- */
export default function ShapeSwapper({ tabletRef, headstoneMeshRef }: ShapeSwapperProps) {
  const { invalidate, controls, camera } = useThree();
  const router = useRouter();

  const heightMm = useHeadstoneStore((s) => s.heightMm);
  const widthMm = useHeadstoneStore((s) => s.widthMm);
  const shapeUrl = useHeadstoneStore((s) => s.shapeUrl);
  const headstoneMaterialUrl = useHeadstoneStore((s) => s.headstoneMaterialUrl);
  const borderName = useHeadstoneStore((s) => s.borderName);
  const inscriptions = useHeadstoneStore((s) => s.inscriptions);
  const selected = useHeadstoneStore((s) => s.selected);
  const setSelected = useHeadstoneStore((s) => s.setSelected);
  const setEditingObject = useHeadstoneStore((s) => s.setEditingObject);
  const headstoneStyle = useHeadstoneStore((s) => s.headstoneStyle);
  const selectedInscriptionId = useHeadstoneStore(
    (s) => s.selectedInscriptionId,
  );
  const setSelectedInscriptionId = useHeadstoneStore(
    (s) => s.setSelectedInscriptionId,
  );
  const setSelectedAdditionId = useHeadstoneStore(
    (s) => s.setSelectedAdditionId,
  );
  const setSelectedMotifId = useHeadstoneStore(
    (s) => s.setSelectedMotifId,
  );
  const motifOffsets = useHeadstoneStore((s) => s.motifOffsets);
  const openInscriptions = useHeadstoneStore((s) => s.openInscriptions);
  const openSizePanel = useHeadstoneStore((s) => s.openSizePanel);
  const fontLoading = useHeadstoneStore((s) => s.fontLoading);
  const baseSwapping = useHeadstoneStore((s) => s.baseSwapping);
  const selectedAdditions = useHeadstoneStore((s) => s.selectedAdditions);
  const selectedMotifs = useHeadstoneStore((s) => s.selectedMotifs);
  const isMaterialChange = useHeadstoneStore((s) => s.isMaterialChange);
  const loading = useHeadstoneStore((s) => s.loading);
  const pathname = usePathname();
  const setLoading = useHeadstoneStore((s) => s.setLoading);
  const catalog = useHeadstoneStore((s) => s.catalog);
  const isPlaque = catalog?.product.type === 'plaque';

  const heightM = React.useMemo(() => heightMm / 1000, [heightMm]);
  const widthM = React.useMemo(() => widthMm / 1000, [widthMm]);

  const requestedUrl = shapeUrl || DEFAULT_SHAPE_URL;
  const requestedTex = React.useMemo(() => {
    // Check if it's already a full path starting with /textures/
    if (headstoneMaterialUrl?.startsWith('/textures/')) {
      return headstoneMaterialUrl;
    }
    // Check if it's a path without leading slash
    if (headstoneMaterialUrl?.startsWith('textures/')) {
      return `/${headstoneMaterialUrl}`;
    }
    // Otherwise extract filename and use default base
    const file = headstoneMaterialUrl?.split('/').pop() ?? DEFAULT_TEX;
    // Keep the original extension or convert .jpg to .webp
    const webp = file.replace(/\.jpg$/i, '.webp');
    return TEX_BASE + webp;
  }, [headstoneMaterialUrl]);

  const [visibleUrl, setVisibleUrl] = React.useState<string>(requestedUrl);
  const [visibleTex, setVisibleTex] = React.useState<string>(requestedTex);
  const [fitTick, setFitTick] = React.useState(0);

  const swapping = requestedUrl !== visibleUrl || requestedTex !== visibleTex;

  // Trigger fit when switching view modes and assets are ready
  React.useEffect(() => {
    if (
      !isMaterialChange &&
      visibleUrl === requestedUrl &&
      visibleTex === requestedTex
    ) {
      // Trigger fit
      setFitTick((n) => n + 1);
    }
  }, [
    isMaterialChange,
    visibleUrl,
    requestedUrl,
    visibleTex,
    requestedTex,
  ]);

  React.useEffect(() => {
    const id = requestAnimationFrame(() => setFitTick((n) => n + 1));
    return () => cancelAnimationFrame(id);
  }, []);

  React.useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [setLoading]);

  return (
    <>
      <group ref={tabletRef} visible={!loading}>
        <SvgHeadstone
          key={`${visibleUrl}::${visibleTex}`}
          url={visibleUrl}
          depth={isPlaque ? 5 : 15}
          scale={0.01}
          faceTexture={visibleTex}
          sideTexture={visibleTex}
          tileSize={0.35}
          sideTileSize={0.35}
          topTileSize={0.35}
          targetHeight={heightM}
          targetWidth={widthM}
          preserveTop
          showEdges={false}
          headstoneStyle={headstoneStyle}
          selectedAdditions={selectedAdditions}
          meshProps={{
            name: 'headstone',
            onClick: (e) => {
              e.stopPropagation();
              setSelected('headstone');
              setEditingObject('headstone');
              setSelectedInscriptionId(null);
              setSelectedAdditionId(null); // Close addition panel
              setSelectedMotifId(null); // Close motif panel
              // Disabled: Don't open size panel when clicking headstone
              // openSizePanel?.();
            },
          }}
        >
          {(api: HeadstoneAPI, selectedAdditionIds: string[]) => {
            // Safe ref assignment using useLayoutEffect to avoid render phase side-effects
            React.useLayoutEffect(() => {
              if (headstoneMeshRef && api.mesh.current) {
                (headstoneMeshRef as any).current = api.mesh.current;
              }
            }, [headstoneMeshRef, api.mesh]);
            
            return (
            <>
              {inscriptions.map((line: Line, i: number) => {
                const zBump = (inscriptions.length - 1 - i) * 0.00005;
                return (
                <ErrorBoundary key={line.id}>
                  <React.Suspense fallback={null}>
                    <HeadstoneInscription
                      id={line.id}
                      headstone={api}
                      font={FONT_MAP[line.font] || '/fonts/ebgaramond.woff2'}
                      editable
                      selected={selectedInscriptionId === line.id}
                      onSelectInscription={() => {
                        setSelected(null);
                        setSelectedMotifId(null); // Clear motif selection
                        setSelectedAdditionId(null); // Clear addition selection
                        setSelectedInscriptionId(line.id);
                        
                        // Navigate to inscriptions if not already there
                        if (pathname !== '/inscriptions') {
                          router.push('/inscriptions');
                        }
                      }}
                      color={line.color}
                      lift={0.002}
                      xPos={line.xPos}
                      yPos={line.yPos}
                      rotationDeg={line.rotationDeg}
                      height={line.sizeMm}
                      text={line.text}
                      zBump={zBump}
                    />
                  </React.Suspense>
                </ErrorBoundary>
              )})}

              {selectedAdditionIds.map((additionId, i) => (
                <ErrorBoundary key={`${additionId}-${i}`}>
                  <React.Suspense fallback={null}>
                    <AdditionModel
                      id={additionId}
                      headstone={api}
                      index={i}
                    />
                  </React.Suspense>
                </ErrorBoundary>
              ))}

              {selectedMotifs.map((motif, i) => (
                <ErrorBoundary key={`${motif.id}-${i}`}>
                  <React.Suspense fallback={null}>
                    <MotifModel
                      id={motif.id}
                      svgPath={motif.svgPath}
                      color={motif.color}
                      headstone={api}
                      index={i}
                    />
                  </React.Suspense>
                </ErrorBoundary>
              ))}

              {/* Render bronze border if set */}
              {borderName && isPlaque && (
                <ErrorBoundary>
                  <React.Suspense fallback={null}>
                    <BronzeBorder
                      borderName={borderName}
                      plaqueWidth={widthM * 100}
                      plaqueHeight={heightM * 100}
                      color={headstoneMaterialUrl?.includes('phoenix') ? '#c99d44' : '#c99d44'}
                      depth={5}
                    />
                  </React.Suspense>
                </ErrorBoundary>
              )}
            </>
            );
          }}
        </SvgHeadstone>

        <AutoFit
          target={tabletRef}
          margin={1.04}
          pad={0}
          duration={0.25}
          readyTimeoutMs={100}
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

