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
import { useHeadstoneStore, Line } from '#/lib/headstone-store';
import { DEFAULT_SHAPE_URL } from '#/lib/headstone-constants';
import { data } from '#/app/_internal/_data';
import { AdditionData } from '#/lib/xml-parser';
import { usePathname } from 'next/navigation';
import type { Component, ReactNode } from 'react';

/* --------------------------------- constants -------------------------------- */
const TEX_BASE = '/textures/forever/l/';
const DEFAULT_TEX = 'Imperial-Red.jpg';
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

/* ------------------------ addition image/application placeholders ----------------------- */
function AdditionImage({ index, imageUrl }: { index: number; imageUrl: string }) {
  // Placeholder for image-based additions (motifs/images)
  return null;
}

function AdditionApplication({ index, number }: { index: number; number: string }) {
  // Placeholder for 3D application additions
  return null;
}

/* ------------------------- isolated loader subcomponents --------------------- */
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

/* ------------------------------ addition wrapper ---------------------------- */
/**
 * Addition positioned and dragged strictly in HEADSTONE LOCAL SPACE.
 * Bounds are derived from the headstone geometry's boundingBox.
 * IMPORTANT: we **render Z using api.frontZ** so the addition is visible on first frame.
 */
function HeadstoneAddition({
  additionId,
  index,
  widthM, // kept for signature compatibility
  heightM, // kept for signature compatibility
  headstone,
  frontZ, // <- from SvgHeadstone API (stable on first frame)
}: {
  additionId: string;
  index: number;
  widthM: number;
  heightM: number;
  headstone: HeadstoneAPI;
  frontZ: number;
}) {
  /* ----------------------- store hooks (stable order) ----------------------- */
  const catalog = useHeadstoneStore((s) => s.catalog);
  const selectedAdditionId = useHeadstoneStore((s) => s.selectedAdditionId);
  const setSelectedAdditionId = useHeadstoneStore(
    (s) => s.setSelectedAdditionId,
  );
  const setAdditionRef = useHeadstoneStore((s) => s.setAdditionRef);
  const additionOffsets = useHeadstoneStore((s) => s.additionOffsets);
  const setAdditionOffset = useHeadstoneStore((s) => s.setAdditionOffset);

  /* ------------------------------ local hooks -------------------------------- */
  const ref = React.useRef<THREE.Group>(null!);
  React.useEffect(() => {
    setAdditionRef(additionId, ref);
  }, [additionId, setAdditionRef]);

  const { camera, gl, controls } = useThree() as any;
  const raycaster = React.useMemo(() => new THREE.Raycaster(), []);
  const mouse = React.useMemo(() => new THREE.Vector2(), []);
  const [dragging, setDragging] = React.useState(false);
  const [dragOffset, setDragOffset] = React.useState(() => new THREE.Vector3());
  const hasReset = React.useRef(false);

  /* ----------------------- data lookups (no early return) -------------------- */
  let addition = catalog?.product.additions.find(
    (a: AdditionData) => a.id === additionId,
  );
  if (!addition && additionId === 'B1134S') {
    addition = {
      id: 'B1134S',
      type: 'application',
      name: 'Applicazione Angelo',
    } as any;
  }

  const stone = headstone.mesh.current as THREE.Mesh | null;

  // local bbox if available
  const bboxLocal = React.useMemo(() => {
    if (stone?.geometry) {
      if (!stone.geometry.boundingBox) stone.geometry.computeBoundingBox();
      return stone.geometry.boundingBox?.clone() ?? null;
    }
    return null;
  }, [stone]);

  // safe fallback so math is defined even before mesh/bbox is ready
  const fallbackBbox = React.useMemo(
    () =>
      new THREE.Box3(
        new THREE.Vector3(-0.5, 0.0, 0.0),
        new THREE.Vector3(0.5, 1.0, 0.1),
      ),
    [],
  );

  // use actual bbox when present, fallback otherwise
  const bbox = bboxLocal ?? fallbackBbox;
  const frontZLocal = bbox.max.z; // for hit/local math
  const inset = 0.01;
  const minX = bbox.min.x - 0.5;
  const maxX = bbox.max.x + 0.5;
  const minY = bbox.min.y - 0.5;
  const maxY = bbox.max.y + 0.5;

  // Store offsets in headstone local space; clamp them to bbox
  const defaultOffset = React.useMemo(
    () => ({ xPos: THREE.MathUtils.lerp(minX, maxX, 0.5), yPos: -100 }),
    [minX, maxX, minY, maxY],
  );
  const offset = additionOffsets?.[additionId] || defaultOffset;

  /* ------------------------------- pointer logic ----------------------------- */
  const placeFromClientXY = React.useCallback(
    (clientX: number, clientY: number) => {
      const canvas: HTMLCanvasElement | undefined = gl?.domElement;
      if (!stone || !canvas) return;

      const rect = canvas.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObject(stone, true);
      if (!hits.length) return;

      const hit =
        hits.find((h) => h.face?.normal?.z && h.face.normal.z > 0) ?? hits[0];

      const local = hit.point.clone();
      stone.worldToLocal(local);
      // lock to local front if bbox known; otherwise use 0 (we only need x/y)
      local.z = bboxLocal ? frontZLocal : 0;

      const next = local.add(dragOffset);
      next.x = Math.max(minX, Math.min(maxX, next.x));
      next.y = Math.max(minY, Math.min(maxY, next.y));

      setAdditionOffset(additionId, {
        xPos: next.x,
        yPos: next.y,
        scale: offset.scale,
        rotationZ: offset.rotationZ,
      });
    },
    [
      camera,
      gl,
      stone,
      mouse,
      raycaster,
      dragOffset,
      frontZLocal,
      minX,
      maxX,
      minY,
      maxY,
      additionId,
      setAdditionOffset,
      bboxLocal,
    ],
  );

  React.useEffect(() => {
    if (!dragging) return;
    const canvas: HTMLElement | undefined = gl?.domElement;
    if (!canvas) return;

    const onMove = (e: PointerEvent) => {
      e.preventDefault();
      placeFromClientXY(e.clientX, e.clientY);
    };
    const onUp = (e: PointerEvent) => {
      e.preventDefault();
      setDragging(false);
      if (controls) (controls as any).enabled = true;
      document.body.style.cursor = 'auto';
      (e.target as any)?.releasePointerCapture?.(e.pointerId);
    };

    if (controls) (controls as any).enabled = false;
    canvas.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });
    document.body.style.cursor = 'grabbing';

    return () => {
      canvas.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      if (controls) (controls as any).enabled = true;
      document.body.style.cursor = 'auto';
    };
  }, [dragging, gl, controls, placeFromClientXY]);

  const onClick = React.useCallback(
    (e: any) => {
      e.stopPropagation();
      setSelectedAdditionId(additionId);
    },
    [additionId, setSelectedAdditionId],
  );

  const onPointerDown = React.useCallback(
    (e: any) => {
      e.stopPropagation();
      const canvas: HTMLCanvasElement | undefined = gl?.domElement;
      if (!stone || !canvas) return;

      const rect = canvas.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const hits = raycaster.intersectObject(stone, true);
      if (hits.length) {
        const hit =
          hits.find((h) => h.face?.normal?.z && h.face.normal.z > 0) ?? hits[0];

        const localPoint = hit.point.clone();
        stone.worldToLocal(localPoint);
        localPoint.z = bboxLocal ? frontZLocal : 0;

        const currentLocal = new THREE.Vector3(
          offset.xPos,
          offset.yPos,
          bboxLocal ? frontZLocal : 0,
        );
        setDragOffset(currentLocal.sub(localPoint));
      }

      (e.target as any)?.setPointerCapture?.(e.pointerId);
      setDragging(true);
    },
    [
      camera,
      gl,
      stone,
      mouse,
      raycaster,
      bboxLocal,
      frontZLocal,
      offset.xPos,
      offset.yPos,
    ],
  );

  const onPointerOver = React.useCallback(() => {
    document.body.style.cursor = 'grab';
  }, []);
  const onPointerOut = React.useCallback(() => {
    if (!dragging) document.body.style.cursor = 'auto';
  }, [dragging]);

  /* ------------------------------- render branch ----------------------------- */
  // Decide what to render **after** all hooks have executed
  if (!addition || !stone) return null;

  // ✅ Render Z using api.frontZ so it's visible immediately
  const wrapperProps = {
    ref,
    position: [offset.xPos, offset.yPos, frontZ + 0.001] as [
      number,
      number,
      number,
    ],
    onClick,
    onPointerDown,
    onPointerOver,
    onPointerOut,
  };

  if (addition.type === 'motif' || addition.type === 'image') {
    const imageUrl = `/${addition.type}s/${additionId}.png`;
    return (
      <group {...wrapperProps}>
        <AdditionImage index={index} imageUrl={imageUrl} />
      </group>
    );
  }

  const number = additionId.replace(/[^\d]/g, '') || '0000';
  return (
    <group {...wrapperProps}>
      <AdditionApplication index={index} number={number} />
    </group>
  );
}

/* ----------------------------------- props ---------------------------------- */
export interface ShapeSwapperProps {
  tabletRef: React.RefObject<THREE.Object3D>;
  headstoneMeshRef?: React.RefObject<THREE.Mesh>;
  inscriptionRef?: React.MutableRefObject<THREE.Object3D | null>; // deprecated
}

/* ----------------------------------- main ----------------------------------- */
export default function ShapeSwapper({ tabletRef, headstoneMeshRef }: ShapeSwapperProps) {
  const { invalidate, controls, camera } = useThree();

  const heightMm = useHeadstoneStore((s) => s.heightMm);
  const widthMm = useHeadstoneStore((s) => s.widthMm);
  const shapeUrl = useHeadstoneStore((s) => s.shapeUrl);
  const headstoneMaterialUrl = useHeadstoneStore((s) => s.headstoneMaterialUrl);
  const inscriptions = useHeadstoneStore((s) => s.inscriptions);
  const selected = useHeadstoneStore((s) => s.selected);
  const setSelected = useHeadstoneStore((s) => s.setSelected);
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
  const openInscriptions = useHeadstoneStore((s) => s.openInscriptions);
  const openSizePanel = useHeadstoneStore((s) => s.openSizePanel);
  const fontLoading = useHeadstoneStore((s) => s.fontLoading);
  const baseSwapping = useHeadstoneStore((s) => s.baseSwapping);
  const selectedAdditions = useHeadstoneStore((s) => s.selectedAdditions);
  const selectedMotifs = useHeadstoneStore((s) => s.selectedMotifs);
  const is2DMode = useHeadstoneStore((s) => s.is2DMode);
  const isMaterialChange = useHeadstoneStore((s) => s.isMaterialChange);
  const loading = useHeadstoneStore((s) => s.loading);
  const pathname = usePathname();
  const setLoading = useHeadstoneStore((s) => s.setLoading);
  const catalog = useHeadstoneStore((s) => s.catalog);
  const isPlaque = catalog?.product.type === 'plaque';

  const prevIs2DMode = React.useRef(is2DMode);

  // Removed: Controls disabling during baseSwapping was causing camera rotation issues
  // The texture loading is now handled properly with Suspense boundaries

  React.useEffect(() => {
    if (controls && prevIs2DMode.current !== is2DMode) {
      (controls as any).enabled = false;

      // Explicitly set camera position and target for 2D/3D switch
      if (is2DMode) {
        camera.position.set(0, 0, 5); // Example 2D position
        camera.lookAt(0, 0, 0); // Example 2D target
      } else {
        camera.position.set(0, 2, 5); // Example 3D position (slightly elevated)
        camera.lookAt(0, 0, 0); // Example 3D target
      }
      camera.updateProjectionMatrix();
      invalidate();

      setTimeout(() => {
        (controls as any).enabled = true;
      }, 100); // Re-enable controls after a short delay
    }
    prevIs2DMode.current = is2DMode;
  }, [is2DMode, controls, invalidate, camera]);

  const heightM = React.useMemo(() => heightMm / 100, [heightMm]);
  const widthM = React.useMemo(() => widthMm / 100, [widthMm]);

  const requestedUrl = shapeUrl || DEFAULT_SHAPE_URL;
  const requestedTex = React.useMemo(() => {
    if (headstoneMaterialUrl?.startsWith('textures/')) {
      return `/${headstoneMaterialUrl}`;
    }
    const file = headstoneMaterialUrl?.split('/').pop() ?? DEFAULT_TEX;
    const jpg = file.replace(/\.(png|webp|jpeg)$/i, '.jpg');
    return TEX_BASE + jpg;
  }, [headstoneMaterialUrl]);

  const [visibleUrl, setVisibleUrl] = React.useState<string>(requestedUrl);
  const [visibleTex, setVisibleTex] = React.useState<string>(requestedTex);
  const [fitTick, setFitTick] = React.useState(0);

  const swapping = requestedUrl !== visibleUrl || requestedTex !== visibleTex;

  // Trigger fit when switching to 3D mode and assets are ready
  React.useEffect(() => {
    if (
      !is2DMode &&
      !isMaterialChange &&
      visibleUrl === requestedUrl &&
      visibleTex === requestedTex
    ) {
      // Trigger fit immediately and again after a short delay to ensure geometry is ready
      setFitTick((n) => n + 1);
      const timeoutId = setTimeout(() => setFitTick((n) => n + 1), 100);
      return () => clearTimeout(timeoutId);
    }
  }, [
    is2DMode,
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
          depth={isPlaque ? 5 : 100}
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
              setSelectedAdditionId(null); // Close addition panel
              setSelectedMotifId(null); // Close motif panel
              if (pathname === '/') {
                openSizePanel?.();
              }
            },
          }}
        >
          {(api: HeadstoneAPI, selectedAdditionIds: string[]) => {
            // Set the headstone mesh ref directly (safe in render since it's just a ref assignment)
            if (headstoneMeshRef && api.mesh.current) {
              // Direct assignment - refs can be updated synchronously in render
              (headstoneMeshRef as any).current = api.mesh.current;
            }
            
            return (
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
                        setSelected(null);
                        openInscriptions?.(line.id);
                      }}
                      color={line.color}
                      lift={0.002}
                      xPos={line.xPos}
                      yPos={line.yPos}
                      rotationDeg={line.rotationDeg}
                      height={line.sizeMm}
                      text={line.text}
                      zBump={-i * 0.00005}
                    />
                  </React.Suspense>
                </ErrorBoundary>
              ))}

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
            </>
            );
          }}
        </SvgHeadstone>

        <AutoFit
          target={tabletRef}
          margin={1.15}
          pad={0.04}
          duration={0.25}
          readyTimeoutMs={100}
          trigger={fitTick}
          view={is2DMode ? '2d' : '3d'}
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

