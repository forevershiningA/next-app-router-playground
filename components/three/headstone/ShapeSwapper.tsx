'use client';

import * as React from 'react';
import * as THREE from 'three';
import { useThree, useLoader } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
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
  useTexture.preload(url);
  useTexture(url);
  React.useEffect(() => {
    const id = requestAnimationFrame(() => onReady?.());
    return () => cancelAnimationFrame(id);
  }, [onReady]);
  return null;
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
  const setBorderName = useHeadstoneStore((s) => s.setBorderName);
  const inscriptions = useHeadstoneStore((s) => s.inscriptions);
  const selected = useHeadstoneStore((s) => s.selected);
  const setSelected = useHeadstoneStore((s) => s.setSelected);
  const setEditingObject = useHeadstoneStore((s) => s.setEditingObject);
  const headstoneStyle = useHeadstoneStore((s) => s.headstoneStyle);
  const uprightThickness = useHeadstoneStore((s) => s.uprightThickness);
  const slantThickness = useHeadstoneStore((s) => s.slantThickness);
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
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);
  const motifOffsets = useHeadstoneStore((s) => s.motifOffsets);
  const openInscriptions = useHeadstoneStore((s) => s.openInscriptions);
  const openSizePanel = useHeadstoneStore((s) => s.openSizePanel);
  const fontLoading = useHeadstoneStore((s) => s.fontLoading);
  const baseSwapping = useHeadstoneStore((s) => s.baseSwapping);
  const selectedAdditions = useHeadstoneStore((s) => s.selectedAdditions);
  const selectedMotifs = useHeadstoneStore((s) => s.selectedMotifs);
  const isMaterialChange = useHeadstoneStore((s) => s.isMaterialChange);
  const pathname = usePathname();
  const setLoading = useHeadstoneStore((s) => s.setLoading);
  const catalog = useHeadstoneStore((s) => s.catalog);
  const isPlaque = catalog?.product.type === 'plaque' || catalog?.product.type === 'bronze_plaque';
  const bronzeBorderColor = '#FFB65A';
  const isSelectSizeRoute = pathname === '/select-size';
  const isSelectMaterialRoute = pathname === '/select-material';
  const shouldKeepPanelOpen = isSelectSizeRoute || isSelectMaterialRoute;

  const heightM = React.useMemo(() => heightMm / 1000, [heightMm]);
  const widthM = React.useMemo(() => widthMm / 1000, [widthMm]);

  const requestedUrl = shapeUrl || DEFAULT_SHAPE_URL;
  const requestedTex = React.useMemo(() => {
    if (!headstoneMaterialUrl) {
      return `${TEX_BASE}${DEFAULT_TEX}`;
    }
    if (headstoneMaterialUrl.startsWith('http')) {
      return headstoneMaterialUrl;
    }
    if (headstoneMaterialUrl.startsWith('/')) {
      return headstoneMaterialUrl;
    }
    return `/${headstoneMaterialUrl.replace(/^\/+/, '')}`;
  }, [headstoneMaterialUrl]);

  const [visibleUrl, setVisibleUrl] = React.useState<string | null>(null);
  // Re-introduce visibleTex state to decouple loading from display
  const [visibleTex, setVisibleTex] = React.useState<string | null>(null);
  const pendingTextureSwap = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const [fitTick, setFitTick] = React.useState(0);

  const resolvedUrl = visibleUrl ?? requestedUrl;
  const resolvedTex = visibleTex ?? requestedTex;
  const shapeSwapping = requestedUrl !== visibleUrl;
  const isPending = false;

  const builtinPedestalShapes = React.useMemo(
    () => new Set(['headstone_3.svg', 'headstone_5.svg']),
    []
  );
  const currentShapeSlug = React.useMemo(() => {
    if (!resolvedUrl) return null;
    const parts = resolvedUrl.split('/');
    return parts[parts.length - 1]?.toLowerCase() ?? null;
  }, [resolvedUrl]);
  const isFixedHeadstoneAsset = React.useMemo(() => {
    if (!currentShapeSlug) return false;
    if (builtinPedestalShapes.has(currentShapeSlug)) return true;
    return currentShapeSlug.includes('headstone_');
  }, [currentShapeSlug, builtinPedestalShapes]);
  const preserveTopForShape = !isFixedHeadstoneAsset;
  const targetHeightForShape = heightM;
  const targetWidthForShape = widthM;
  const headstoneDepth = isPlaque ? 0.5 : uprightThickness / 10;

  // Removed auto-initialization - let users choose "No Border" if they want
  // React.useEffect(() => {
  //   if (isPlaque && !borderName) {
  //     setBorderName('Border 1');
  //   }
  // }, [isPlaque, borderName, setBorderName]);

  React.useEffect(() => {
    return () => {
      if (pendingTextureSwap.current) {
        clearTimeout(pendingTextureSwap.current);
        pendingTextureSwap.current = null;
      }
    };
  }, []);

  const textureTransitioning = requestedTex !== visibleTex;

  React.useEffect(() => {
    const shouldLoad = shapeSwapping || textureTransitioning || fontLoading;
    setLoading(shouldLoad);
  }, [shapeSwapping, textureTransitioning, fontLoading, setLoading]);

  // Handle Texture Updates via Transition
  // When shape is swapping we can update immediately (full-screen loader visible)
  // For material changes, also update immediately to avoid suspense delays
  React.useEffect(() => {
    if ((shapeSwapping || isMaterialChange) && requestedTex !== visibleTex) {
      setVisibleTex(requestedTex);
      invalidate();
    }
  }, [requestedTex, visibleTex, shapeSwapping, isMaterialChange, invalidate]);

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
    requestedTex
  ]);

  React.useEffect(() => {
    const id = requestAnimationFrame(() => setFitTick((n) => n + 1));
    return () => cancelAnimationFrame(id);
  }, []);


  return (
    <>
      <group ref={tabletRef}>
        <React.Suspense fallback={null}>
          <SvgHeadstone
            key={resolvedUrl}
            url={resolvedUrl}
            depth={headstoneDepth}
            scale={0.01}
            faceTexture={resolvedTex}
            sideTexture={resolvedTex}
            tileSize={0.35}
            sideTileSize={0.35}
            topTileSize={0.35}
            targetHeight={targetHeightForShape}
            targetWidth={targetWidthForShape}
            preserveTop={preserveTopForShape}
            showEdges={false}
            headstoneStyle={headstoneStyle}
            slantThickness={slantThickness}
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
                setActivePanel(null); // Clear active panel state
                // Trigger close fullscreen panel (same as "Back to Menu" button)
                // But keep panel open on select-size and select-material pages
                if (!shouldKeepPanelOpen) {
                  window.dispatchEvent(new CustomEvent('closeFullscreenPanel'));
                }
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

                        if (typeof window !== 'undefined') {
                          window.dispatchEvent(
                            new CustomEvent('openFullscreenPanel', {
                              detail: { panel: 'inscriptions' },
                            }),
                          );
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
                      plaqueWidth={api.worldWidth}
                      plaqueHeight={api.worldHeight}
                      unitsPerMeter={api.unitsPerMeter}
                      frontZ={api.frontZ}
                      color={bronzeBorderColor}
                      depth={headstoneDepth}
                    />
                  </React.Suspense>
                </ErrorBoundary>
              )}
            </>
            );
          }}
        </SvgHeadstone>
        </React.Suspense>

        <AutoFit
          target={tabletRef}
          anchor={headstoneMeshRef}
          margin={1.20}
          pad={0}
          duration={0.25}
          readyTimeoutMs={100}
          trigger={fitTick}
        />
      </group>

      {!shapeSwapping && !isMaterialChange && textureTransitioning && (
        <React.Suspense fallback={null}>
          <PreloadTexture
            url={requestedTex}
            onReady={() => {
              if (pendingTextureSwap.current) {
                clearTimeout(pendingTextureSwap.current);
              }
              pendingTextureSwap.current = setTimeout(() => {
                setVisibleTex(requestedTex);
                invalidate();
                pendingTextureSwap.current = null;
              }, 300);
            }}
          />
        </React.Suspense>
      )}

      {shapeSwapping && (
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
    </>
  );
}

