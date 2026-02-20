'use client';

import * as React from 'react';
import * as THREE from 'three';
import { useThree, useLoader } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';

import AutoFit from '../AutoFit';
import AdditionModel from '../AdditionModel';
import MotifModel from '../MotifModel';
import ImageModel from '../ImageModel';
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
const BBOX_EPSILON = 1e-6;

type BoxMetrics = {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
};

const getBoxMetrics = (box: THREE.Box3): BoxMetrics => {
  const center = new THREE.Vector3();
  box.getCenter(center);
  const size = new THREE.Vector3();
  box.getSize(size);
  return {
    centerX: center.x,
    centerY: center.y,
    width: Math.max(size.x, BBOX_EPSILON),
    height: Math.max(size.y, BBOX_EPSILON),
  };
};

const remapPointBetweenBoxes = (
  x: number,
  y: number,
  oldMetrics: BoxMetrics,
  newMetrics: BoxMetrics,
) => {
  const nx = (x - oldMetrics.centerX) / oldMetrics.width;
  const ny = (y - oldMetrics.centerY) / oldMetrics.height;
  return {
    x: newMetrics.centerX + nx * newMetrics.width,
    y: newMetrics.centerY + ny * newMetrics.height,
  };
};

const absoluteFromCenterOffsets = (
  offsetX: number | undefined,
  offsetY: number | undefined,
  metrics: BoxMetrics,
) => ({
  x: metrics.centerX + (offsetX ?? 0),
  y: metrics.centerY - (offsetY ?? 0),
});

const centerOffsetsFromAbsolute = (x: number, y: number, metrics: BoxMetrics) => ({
  xPos: x - metrics.centerX,
  yPos: metrics.centerY - y,
});

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

  const internalHeadstoneMeshRef = React.useRef<THREE.Mesh | null>(null);
  const resolvedHeadstoneMeshRef = headstoneMeshRef ?? internalHeadstoneMeshRef;
  const currentBoundingBoxRef = React.useRef<THREE.Box3 | null>(null);
  const [bboxVersion, setBboxVersion] = React.useState(0);
  const pendingRemapRef = React.useRef<{ oldBox: THREE.Box3; targetShapeUrl: string } | null>(null);
  const prevShapeUrlRef = React.useRef<string | null>(null);

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
  const selectedImages = useHeadstoneStore((s) => s.selectedImages || []);
  const isMaterialChange = useHeadstoneStore((s) => s.isMaterialChange);
  const pathname = usePathname();
  const setLoading = useHeadstoneStore((s) => s.setLoading);
  const catalog = useHeadstoneStore((s) => s.catalog);
  const isPlaque = catalog?.product.type === 'plaque' || catalog?.product.type === 'bronze_plaque';
  const bronzeBorderColor = '#FFDFA3';
  const isSelectSizeRoute = pathname === '/select-size';
  const isSelectMaterialRoute = pathname === '/select-material';
  const shouldKeepPanelOpen = isSelectSizeRoute || isSelectMaterialRoute;

  const remapLayoutsBetweenBoxes = React.useCallback((oldBox: THREE.Box3, newBox: THREE.Box3) => {
    const oldMetrics = getBoxMetrics(oldBox);
    const newMetrics = getBoxMetrics(newBox);

    useHeadstoneStore.setState((state) => {
      const updates: Partial<typeof state> = {};

      if (state.inscriptions.length > 0) {
        let linesChanged = false;
        const remappedLines = state.inscriptions.map((line) => {
          if (line.target === 'base') {
            return line;
          }
          const originalX = line.xPos ?? 0;
          const originalY = line.yPos ?? 0;
          const mapped = remapPointBetweenBoxes(originalX, originalY, oldMetrics, newMetrics);
          if (
            Math.abs(mapped.x - originalX) > BBOX_EPSILON ||
            Math.abs(mapped.y - originalY) > BBOX_EPSILON
          ) {
            linesChanged = true;
            return { ...line, xPos: mapped.x, yPos: mapped.y };
          }
          return line;
        });
        if (linesChanged) {
          updates.inscriptions = remappedLines;
        }
      }

      if (Object.keys(state.additionOffsets).length > 0) {
        let additionClone: typeof state.additionOffsets | null = null;
        for (const [id, offset] of Object.entries(state.additionOffsets)) {
          const surface = offset.targetSurface ?? 'headstone';
          if (surface === 'base') continue;
          const absolutePoint = absoluteFromCenterOffsets(offset.xPos, offset.yPos, oldMetrics);
          const mapped = remapPointBetweenBoxes(absolutePoint.x, absolutePoint.y, oldMetrics, newMetrics);
          const nextOffsets = centerOffsetsFromAbsolute(mapped.x, mapped.y, newMetrics);
          if (
            Math.abs((offset.xPos ?? 0) - nextOffsets.xPos) > BBOX_EPSILON ||
            Math.abs((offset.yPos ?? 0) - nextOffsets.yPos) > BBOX_EPSILON
          ) {
            if (!additionClone) {
              additionClone = { ...state.additionOffsets };
            }
            additionClone[id] = { ...offset, xPos: nextOffsets.xPos, yPos: nextOffsets.yPos };
          }
        }
        if (additionClone) {
          updates.additionOffsets = additionClone;
        }
      }

      if (Object.keys(state.motifOffsets).length > 0) {
        let motifClone: typeof state.motifOffsets | null = null;
        for (const [id, offset] of Object.entries(state.motifOffsets)) {
          const surface = offset.target ?? 'headstone';
          if (surface === 'base') continue;
          const isAbsolute = (offset.coordinateSpace ?? 'offset') === 'absolute';

          if (isAbsolute) {
            const originalX = offset.xPos ?? 0;
            const originalY = offset.yPos ?? 0;
            const mapped = remapPointBetweenBoxes(originalX, originalY, oldMetrics, newMetrics);
            if (
              Math.abs(mapped.x - originalX) > BBOX_EPSILON ||
              Math.abs(mapped.y - originalY) > BBOX_EPSILON
            ) {
              if (!motifClone) {
                motifClone = { ...state.motifOffsets };
              }
              motifClone[id] = { ...offset, xPos: mapped.x, yPos: mapped.y };
            }
          } else {
            const absolutePoint = absoluteFromCenterOffsets(offset.xPos, offset.yPos, oldMetrics);
            const mapped = remapPointBetweenBoxes(absolutePoint.x, absolutePoint.y, oldMetrics, newMetrics);
            const nextOffsets = centerOffsetsFromAbsolute(mapped.x, mapped.y, newMetrics);
            if (
              Math.abs((offset.xPos ?? 0) - nextOffsets.xPos) > BBOX_EPSILON ||
              Math.abs((offset.yPos ?? 0) - nextOffsets.yPos) > BBOX_EPSILON
            ) {
              if (!motifClone) {
                motifClone = { ...state.motifOffsets };
              }
              motifClone[id] = { ...offset, xPos: nextOffsets.xPos, yPos: nextOffsets.yPos };
            }
          }
        }
        if (motifClone) {
          updates.motifOffsets = motifClone;
        }
      }

      return updates;
    });
  }, []);

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

  React.useEffect(() => {
    const id = requestAnimationFrame(() => {
      const mesh = resolvedHeadstoneMeshRef.current;
      if (!mesh?.geometry) return;
      const geometry = mesh.geometry as THREE.BufferGeometry;
      geometry.computeBoundingBox();
      const bbox = geometry.boundingBox?.clone();
      if (!bbox) return;
      const prev = currentBoundingBoxRef.current;
      if (!prev || !prev.equals(bbox)) {
        currentBoundingBoxRef.current = bbox;
        setBboxVersion((v) => v + 1);
      }
    });
    return () => cancelAnimationFrame(id);
  }, [resolvedHeadstoneMeshRef, visibleUrl, widthMm, heightMm, fitTick]);

  React.useEffect(() => {
    if (!shapeUrl) return;
    if (
      prevShapeUrlRef.current &&
      prevShapeUrlRef.current !== shapeUrl &&
      currentBoundingBoxRef.current
    ) {
      pendingRemapRef.current = {
        oldBox: currentBoundingBoxRef.current.clone(),
        targetShapeUrl: shapeUrl,
      };
    }
    prevShapeUrlRef.current = shapeUrl;
  }, [shapeUrl]);

  React.useEffect(() => {
    const pending = pendingRemapRef.current;
    if (!pending) return;
    if (visibleUrl !== pending.targetShapeUrl) return;
    const newBox = currentBoundingBoxRef.current;
    if (!newBox) return;
    remapLayoutsBetweenBoxes(pending.oldBox, newBox);
    pendingRemapRef.current = null;
  }, [visibleUrl, remapLayoutsBetweenBoxes, bboxVersion]);


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
                console.log('[ShapeSwapper] Headstone onClick, event object:', e.object.name);
                e.stopPropagation();
                
                // Don't select headstone if clicking on an image
                // Images have renderOrder 999, headstone has lower/default
                if (e.object.renderOrder === 999) {
                  console.log('[ShapeSwapper] Ignoring click - it was on an image');
                  return;
                }
                
                console.log('[ShapeSwapper] Headstone clicked');
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
              if (resolvedHeadstoneMeshRef && api.mesh.current) {
                (resolvedHeadstoneMeshRef as any).current = api.mesh.current;
              }
            }, [resolvedHeadstoneMeshRef, api.mesh]);
            
            return (
            <>
              {inscriptions.map((line: Line, i: number) => {
                const zBump = (inscriptions.length - 1 - i) * 0.00005;
                const scaledX = line.xPos ?? 0;
                const scaledY = line.yPos ?? 0;
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
                      xPos={scaledX}
                      yPos={scaledY}
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

              {selectedImages.map((image, i) => (
                <ErrorBoundary key={`${image.id}-${i}`}>
                  <React.Suspense fallback={null}>
                    <ImageModel
                      id={image.id}
                      imageUrl={image.imageUrl}
                      widthMm={image.widthMm}
                      heightMm={image.heightMm}
                      xPos={image.xPos}
                      yPos={image.yPos}
                      rotationZ={image.rotationZ}
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
          anchor={resolvedHeadstoneMeshRef}
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

