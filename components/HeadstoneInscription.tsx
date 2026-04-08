'use client';

import * as React from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import type { HeadstoneAPI } from './SvgHeadstone';
import { useHeadstoneStore } from '#/lib/headstone-store';
import type { ThreeContextValue } from '#/lib/three-types';
import SelectionBox from './SelectionBox';
import { data } from '#/app/_internal/_data';

/* ------------------------------------------------------------------ */
/* Props                                                               */
/* ------------------------------------------------------------------ */

type Props = {
  id: string;
  headstone: HeadstoneAPI;
  text?: string;
  height: number; // SVG units
  color?: string;
  font?: string;
  lift?: number; // meters in world space
  editable?: boolean;
  selected?: boolean; // also controls per-item BoxHelper
  onSelect?: () => void; // drag start hook
  approxHeight?: number; // meters, used for an initial Y offset
  xPos?: number; // horizontal offset (local units of headstone)
  yPos?: number; // vertical offset   (local units of headstone)
  rotationDeg?: number; // rotation in degrees
  onSelectInscription?: () => void;
  /** tiny Z offset to disambiguate picking when items overlap in Z */
  zBump?: number;
  surface?: 'headstone' | 'base' | 'ledger';
  /** When 'mm-center', xPos/yPos are mm offsets from headstone center (Y-up). */
  coordinateSpace?: 'mm-center';
};

/* ------------------------------------------------------------------ */

const HeadstoneInscription = React.forwardRef<THREE.Object3D, Props>(
  (
    {
      id,
      headstone,
      text = '',
      height,
      color = '#fff8dc',
      font,
      lift = 0.002,
      xPos = 0,
      yPos = 0,
      rotationDeg = 0,
      editable = false,
      selected = false,
      onSelect,
      approxHeight,
      onSelectInscription,
      zBump = 0,
      surface = 'headstone',
      coordinateSpace,
    },
    ref,
  ) => {
    const threeContext = useThree() as ThreeContextValue;
    const { camera, gl, controls, scene } = threeContext;

    // Check if this is a Traditional Engraved product (sandblasted effect)
    const productId = useHeadstoneStore((s) => s.productId);
    const catalog = useHeadstoneStore((s) => s.catalog);
    const ledgerWidthMm = useHeadstoneStore((s) => s.ledgerWidthMm);
    const ledgerDepthMm = useHeadstoneStore((s) => s.ledgerDepthMm);
    const product = React.useMemo(() => {
      if (!productId) return null;
      return data.products.find(p => p.id === productId);
    }, [productId]);
    const isTraditionalEngraved = product?.name.includes('Traditional Engraved') ?? false;
    const isPlaque = catalog?.product.type === 'plaque';
    const isLedgerSurface = surface === 'ledger';
    const isBaseSurface = surface === 'base';

    // root object users can reference
    const groupRef = React.useRef<THREE.Group | null>(null);
    React.useImperativeHandle(ref, () => groupRef.current!, []);

    const helperRef = React.useRef<THREE.BoxHelper | null>(null);
    const updateLineStore = useHeadstoneStore((s) => s.updateInscription);
    type SurfaceBounds = {
      centerX: number;
      centerY: number;
      centerZ: number;
      minX: number;
      maxX: number;
      minY: number;
      maxY: number;
      minZ: number;
      maxZ: number;
      topY: number;
    };
    const [surfaceBounds, setSurfaceBounds] = React.useState<SurfaceBounds | null>(null);

    // tools reused during pointer placement - memoized to prevent recreating
    const raycaster = React.useMemo(() => new THREE.Raycaster(), []);
    const mouse = React.useMemo(() => new THREE.Vector2(), []);
    const fallbackIntersection = React.useMemo(() => new THREE.Vector3(), []);

    const units = headstone.unitsPerMeter;
    const mmToLocalUnits = React.useMemo(() => {
      const safeUnitsPerMeter = Math.abs(units) > 1e-6 ? Math.abs(units) : 1000;
      return safeUnitsPerMeter / 1000;
    }, [units]);
    const fontSizeUnits = React.useMemo(() => {
      const converted = height * mmToLocalUnits;
      if (!Number.isFinite(converted) || converted <= 0) {
        return height;
      }
      return converted;
    }, [height, mmToLocalUnits]);
    // Keep text just above the surface to prevent z-fighting (0.05 mm, scaled to local units)
    const liftLocal = 0.05 * mmToLocalUnits;

    // initial Y based on approx height
    const initialYLocal = React.useMemo(() => {
      if (!approxHeight) return 0;
      const hLocal = approxHeight * units;
      return -hLocal / 2;
    }, [approxHeight, units]);

    const [pos, setPos] = React.useState(
      () => new THREE.Vector3(0, 0, headstone.frontZ + liftLocal),
    );
    const [dragging, setDragging] = React.useState(false);
    const [dragOffset, setDragOffset] = React.useState(new THREE.Vector3());
    const [textBounds, setTextBounds] = React.useState({ width: 0, height: 0 });
    const textMeshRef = React.useRef<THREE.Mesh | null>(null);

    /* ---------------- position on current mesh bbox once available ---------------- */
    React.useEffect(() => {
      let cancelled = false;
      let rafId: number;

      const trySetup = () => {
        if (cancelled) return;
        const stone = headstone.mesh.current as THREE.Mesh | null;
        if (!stone || !stone.geometry) {
          // Mesh not ready yet (e.g. base texture still loading via Suspense).
          // Retry next frame so we don't miss the conversion.
          rafId = requestAnimationFrame(trySetup);
          return;
        }

        const g = stone.geometry as THREE.BufferGeometry;
        g.computeBoundingBox();
        const bb = g.boundingBox;
        if (!bb) return;
        const bounds: SurfaceBounds = {
          centerX: (bb.min.x + bb.max.x) / 2,
          centerY: (bb.min.y + bb.max.y) / 2,
          centerZ: (bb.min.z + bb.max.z) / 2,
          minX: bb.min.x,
          maxX: bb.max.x,
          minY: bb.min.y,
          maxY: bb.max.y,
          minZ: bb.min.z,
          maxZ: bb.max.z,
          topY: bb.max.y,
        };
        setSurfaceBounds(bounds);
        if (isLedgerSurface) {
          // For ledger: use stone.position/scale for real monument-local anchor.
          // The geometry bbox gives ±0.5 (unit cube) but the mesh has position+scale applied.
          setPos(new THREE.Vector3(
            stone.position.x,
            stone.position.y + stone.scale.y / 2 + liftLocal,
            stone.position.z,
          ));
        } else if (isBaseSurface && coordinateSpace === 'mm-center') {
          // Base mesh is a unit cube scaled in meters (assembly space).
          // Anchor mm offsets to the base mesh's world position.
          const absX = stone.position.x + xPos * mmToLocalUnits;
          const absY = stone.position.y + yPos * mmToLocalUnits;
          updateLineStore(id, { xPos: absX, yPos: absY, coordinateSpace: undefined });
          setPos(new THREE.Vector3(0, 0, stone.position.z + stone.scale.z / 2 + liftLocal));
        } else if (coordinateSpace === 'mm-center') {
          // Headstone: geometry is in mm, convert mm center-offsets to absolute local coordinates.
          // Positive yPos = above center → higher Y in geometry space.
          const absX = bounds.centerX + xPos * mmToLocalUnits;
          const absY = bounds.centerY + yPos * mmToLocalUnits;
          updateLineStore(id, { xPos: absX, yPos: absY, coordinateSpace: undefined });
          setPos(new THREE.Vector3(0, 0, headstone.frontZ + liftLocal));
        } else if (xPos === 0 && yPos === 0) {
          setPos(new THREE.Vector3(bounds.centerX, bounds.centerY, headstone.frontZ + liftLocal));
        }
      };

      rafId = requestAnimationFrame(trySetup);
      return () => { cancelled = true; cancelAnimationFrame(rafId); };
    }, [headstone.mesh, headstone.frontZ, isLedgerSurface, isBaseSurface, liftLocal, xPos, yPos, coordinateSpace, mmToLocalUnits, id, updateLineStore]);

    /* ------------------------------ helper: place by pointer ----------------------------- */
    const placeOnLedgerSurface = React.useCallback(
      (clientX: number, clientY: number) => {
        if (!isLedgerSurface) return;
        const stone = headstone.mesh.current as THREE.Mesh | null;
        const canvas: HTMLCanvasElement | undefined = gl?.domElement;
        if (!stone || !canvas || !surfaceBounds) return;

        const rect = canvas.getBoundingClientRect();
        mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObject(stone, true);
        let hit =
          hits.find((h) => h.face?.normal?.y && h.face.normal.y > 0.4) ??
          hits[0];

        if (!hit) {
          // Use the real monument-local top Y (stone.position.y + stone.scale.y/2)
          // instead of surfaceBounds.topY which is in geometry space (0.5 for unit cube).
          const actualTopY = stone.position.y + stone.scale.y / 2;
          const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -actualTopY);
          if (raycaster.ray.intersectPlane(plane, fallbackIntersection)) {
            hit = { point: fallbackIntersection.clone() } as THREE.Intersection;
          }
        }
        if (!hit) return;

        const local = stone.worldToLocal(hit.point.clone());

        const inset = 0.01;
        const depthInset = Math.min((surfaceBounds.maxZ - surfaceBounds.minZ) * 0.05, 0.01);
        const minX = surfaceBounds.minX + inset;
        const maxX = surfaceBounds.maxX - inset;
        const minZ = surfaceBounds.minZ + depthInset;
        const maxZ = surfaceBounds.maxZ - depthInset;

        let nextX = local.x;
        let nextZ = local.z;

        if (dragOffset) {
          nextX -= dragOffset.x;
          nextZ -= dragOffset.z ?? 0;
        }

        nextX = Math.max(minX, Math.min(maxX, nextX));
        nextZ = Math.max(minZ, Math.min(maxZ, nextZ));

        const ledgerX = nextX - surfaceBounds.centerX;
        const ledgerZ = nextZ - surfaceBounds.centerZ;

        const state = useHeadstoneStore.getState();
        updateLineStore(id, {
          xPos: ledgerX,
          yPos: ledgerZ,
          target: 'ledger',
          baseWidthMm: ledgerWidthMm ?? state.ledgerWidthMm ?? state.widthMm,
          baseHeightMm: ledgerDepthMm ?? state.ledgerDepthMm ?? state.heightMm,
        });
        // Do NOT call setPos here — surfaceBounds.topY is from the unit-cube geometry (0.5),
        // not the actual world top-Y. The useEffect at the top of the component already
        // maintains pos correctly using stone.position + stone.scale for the ledger.
      },
      [
        camera,
        gl,
        headstone.mesh,
        id,
        isLedgerSurface,
        ledgerDepthMm,
        ledgerWidthMm,
        mouse,
        raycaster,
        surfaceBounds,
        dragOffset,
        updateLineStore,
      ],
    );

    const placeOnVerticalSurface = React.useCallback(
      (clientX: number, clientY: number) => {
        if (isLedgerSurface) return;
        const stone = headstone.mesh.current as THREE.Mesh | null;
        const canvas: HTMLCanvasElement | undefined = gl?.domElement;
        if (!stone || !canvas || !surfaceBounds) return;

        const rect = canvas.getBoundingClientRect();
        mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObject(stone, true);
        if (!hits.length) return;

        const hit =
          hits.find((h) => h.face?.normal?.z && h.face.normal.z > 0.2) ?? hits[0];
        if (!hit) return;

        const local = stone.worldToLocal(hit.point.clone());
        local.z = headstone.frontZ + liftLocal;

        const next = local.add(dragOffset);

        const inset = 0.01;
        const spanY = surfaceBounds.maxY - surfaceBounds.minY;
        const minX = surfaceBounds.minX + inset;
        const maxX = surfaceBounds.maxX - inset;
        const minY = surfaceBounds.minY + inset + 0.04 * spanY;
        const maxY = surfaceBounds.maxY - inset;

        const clampedX = Math.max(minX, Math.min(maxX, next.x));
        const clampedY = Math.max(minY, Math.min(maxY, next.y));

        const state = useHeadstoneStore.getState();
        const targetSurface = isBaseSurface ? 'base' : 'headstone';
        const baseWidth =
          targetSurface === 'base'
            ? state.baseWidthMm ?? state.widthMm
            : state.widthMm;
        const baseHeight =
          targetSurface === 'base'
            ? state.baseHeightMm ?? state.heightMm
            : state.heightMm;

        updateLineStore(id, {
          xPos: clampedX,
          yPos: clampedY,
          baseWidthMm: baseWidth,
          baseHeightMm: baseHeight,
        });
        setPos(new THREE.Vector3(0, 0, headstone.frontZ + liftLocal));
      },
      [
        camera,
        dragOffset,
        gl,
        headstone.frontZ,
        headstone.mesh,
        id,
        isBaseSurface,
        isLedgerSurface,
        liftLocal,
        mouse,
        raycaster,
        surfaceBounds,
        updateLineStore,
      ],
    );

    const placeFromClientXY = React.useCallback(
      (clientX: number, clientY: number) => {
        if (isLedgerSurface) {
          placeOnLedgerSurface(clientX, clientY);
        } else {
          placeOnVerticalSurface(clientX, clientY);
        }
      },
      [isLedgerSurface, placeOnLedgerSurface, placeOnVerticalSurface],
    );

    /* ---------------------------- drag wiring (pointermove/up) --------------------------- */
    React.useEffect(() => {
      if (!dragging) return;
      const canvas: HTMLElement | undefined = gl?.domElement;
      if (!canvas) return;

      let rafId: number | null = null;
      let pendingUpdate: { x: number; y: number } | null = null;

      const onMove = (e: PointerEvent) => {
        e.preventDefault();
        // Store the latest pointer position
        pendingUpdate = { x: e.clientX, y: e.clientY };

        // Only schedule one RAF at a time for smooth updates
        if (rafId === null) {
          rafId = requestAnimationFrame(() => {
            if (pendingUpdate) {
              placeFromClientXY(pendingUpdate.x, pendingUpdate.y);
              pendingUpdate = null;
            }
            rafId = null;
          });
        }
      };

      const onUp = (e: PointerEvent) => {
        e.preventDefault();
        
        // Cancel any pending RAF
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }
        
        setDragging(false);
        if (controls) controls.enabled = true;
        document.body.style.cursor = 'auto';
        const target = e.target as Element;
        if (target && 'releasePointerCapture' in target) {
          (target as HTMLElement).releasePointerCapture?.(e.pointerId);
        }
      };

      if (controls) controls.enabled = false;
      canvas.addEventListener('pointermove', onMove, { passive: false });
      window.addEventListener('pointerup', onUp);
      document.body.style.cursor = 'grabbing';

      return () => {
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
        }
        canvas.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        if (controls) controls.enabled = true;
        document.body.style.cursor = 'auto';
      };
    }, [dragging, gl, controls, placeFromClientXY]);

    /* ---------------------- PER-ITEM HIGHLIGHT (BoxHelper) - DISABLED ---------------------- */
    // Removed white outline box helper - using custom selection box instead
    /*
    React.useEffect(() => {
      const obj = groupRef.current;
      if (!obj || !selected) return;

      const helper = new THREE.BoxHelper(obj, 0xffff00);
      // keep helper out of picking by disabling raycast
      helper.raycast = () => null;
      helper.layers.set(obj.layers.mask);
      scene.add(helper);
      helperRef.current = helper;

      return () => {
        scene.remove(helper);
        helper.geometry.dispose();
        (helper.material as THREE.Material).dispose?.();
        helperRef.current = null;
      };
    }, [selected, scene]);

    // Only update helper when selection state changes or text updates
    const textRef = React.useRef<string>(text);
    const needsHelperUpdate = textRef.current !== text || selected;
    textRef.current = text;

    useFrame(() => {
      if (selected && helperRef.current && groupRef.current && needsHelperUpdate) {
        helperRef.current.update();
        helperRef.current.scale.setScalar(1.01);
      }
    });
    */

    /* --------------------------------------- UI ---------------------------------------- */
    
    // Calculate text bounds for the selection box
    const handleTextSync = React.useCallback((sprite: any) => {
      // The sprite/mesh is available after text is rendered
      if (sprite && sprite.geometry) {
        sprite.geometry.computeBoundingBox();
        const bbox = sprite.geometry.boundingBox;
        if (bbox) {
          const width = bbox.max.x - bbox.min.x;
          const height = bbox.max.y - bbox.min.y;
          setTextBounds({ width, height });
          textMeshRef.current = sprite;
        }
      }
      // Also refresh helper bounds if present
      helperRef.current?.update();
    }, []);
    
    const rotationRad = (rotationDeg * Math.PI) / 180;
    // For ledger: xPos/yPos are fractional (from worldToLocal on unit-cube mesh).
    // Multiply by stone.scale to convert to monument-local meters.
    const ledgerMesh = isLedgerSurface ? (headstone.mesh.current as THREE.Mesh | null) : null;
    const ledgerScaleX = ledgerMesh ? ledgerMesh.scale.x : 1;
    const ledgerScaleZ = ledgerMesh ? ledgerMesh.scale.z : 1;
    const groupPosition: [number, number, number] = isLedgerSurface
      ? [pos.x + (xPos ?? 0) * ledgerScaleX, pos.y + zBump, pos.z + (yPos ?? 0) * ledgerScaleZ]
      : coordinateSpace === 'mm-center' && surfaceBounds
        ? [
            surfaceBounds.centerX + (xPos ?? 0) * mmToLocalUnits,
            surfaceBounds.centerY + (yPos ?? 0) * mmToLocalUnits,
            (headstone.frontZ + liftLocal) + zBump,
          ]
        : [pos.x + (xPos ?? 0), pos.y + (yPos ?? 0), pos.z + zBump];
    const groupRotation: [number, number, number] = isLedgerSurface
      ? [-Math.PI / 2, rotationRad, 0]
      : [0, 0, rotationRad];

    return (
      <group
        ref={groupRef}
        position={groupPosition}
        rotation={groupRotation}
        visible={coordinateSpace !== 'mm-center' || !!surfaceBounds}
      >
        {/* Main text */}
        <Text
          font={font}
          color={color}
          anchorX="center"
          anchorY="middle"
          fontSize={fontSizeUnits}
          outlineWidth={isTraditionalEngraved || isPlaque ? 0 : 0.002 * units}
          outlineColor={isTraditionalEngraved || isPlaque ? color : "black"}
          fillOpacity={isTraditionalEngraved ? 1 : 1}
          {...(color.toLowerCase().includes('gold') || color.toLowerCase() === '#d4af37' || color.toLowerCase() === '#ffd700'
            ? { 
                metalness: 1.0,
                roughness: 0.3,
                envMapIntensity: 2.0
              }
            : {
                metalness: 0.2,
                roughness: 0.4,
                envMapIntensity: 1.5
              }
          )}
          onSync={handleTextSync}
          // Use onClick for selection; onPointerDown stays for drag init only
          onClick={(e) => {
            e.stopPropagation();
            onSelectInscription?.();
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            if (!editable) return;

            const stone = headstone.mesh.current as THREE.Mesh | null;
            if (stone) {
              // world → headstone local at click
              const localPoint = stone.worldToLocal(e.point.clone());

              if (isLedgerSurface) {
                const anchorY = surfaceBounds?.topY ?? 0;
                const centerX = surfaceBounds?.centerX ?? 0;
                const centerZ = surfaceBounds?.centerZ ?? 0;
                const currentLocal = new THREE.Vector3(
                  centerX + (xPos ?? 0),
                  anchorY,
                  centerZ + (yPos ?? 0),
                );
                const diff = currentLocal.sub(localPoint);
                setDragOffset(new THREE.Vector3(diff.x, 0, diff.z));
              } else {
                // ✅ FIX: compute grab offset from the *rendered* local position = pos + xPos/yPos
                const currentLocal = new THREE.Vector3(
                  pos.x + xPos,
                  pos.y + yPos,
                  headstone.frontZ + liftLocal,
                );
                setDragOffset(currentLocal.sub(localPoint));
              }
            }

            // capture & start drag
            const target = e.target as Element;
            if (target && 'setPointerCapture' in target) {
              (target as HTMLElement).setPointerCapture?.(e.pointerId);
            }
            onSelect?.();
            setDragging(true);
          }}
          onPointerOver={() => {
            if (editable && document.body) {
              document.body.style.cursor = 'grab';
            }
          }}
          onPointerOut={() => {
            if (editable && !dragging && document.body) {
              document.body.style.cursor = 'auto';
            }
          }}
        >
          {text}
        </Text>
        
        {/* Selection box with resize and rotation handles */}
        {selected && textBounds.width > 0 && (
          <SelectionBox
            objectId={id}
            position={new THREE.Vector3(0, 0, 0.01)}
            bounds={{
              width: textBounds.width,
              height: textBounds.height,
            }}
            rotation={0} // Rotation is already applied to parent group
            unitsPerMeter={units}
            currentSizeMm={height} // height is already in mm!
            objectType="inscription"
            animateOnShow
            animationDuration={520}
            onUpdate={(data) => {
              if (data.sizeMm !== undefined) {
                // Use the absolute size value directly
                updateLineStore(id, { sizeMm: data.sizeMm });
              }
              if (data.rotationDeg !== undefined) {
                // Add the rotation delta to current rotation
                const newRotation = rotationDeg + data.rotationDeg;
                updateLineStore(id, { rotationDeg: newRotation });
              }
            }}
          />
        )}
      </group>
    );
  },
);

HeadstoneInscription.displayName = 'HeadstoneInscription';
export default HeadstoneInscription;
