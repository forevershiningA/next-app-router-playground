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
    },
    ref,
  ) => {
    const threeContext = useThree() as ThreeContextValue;
    const { camera, gl, controls, scene } = threeContext;

    // Check if this is a Traditional Engraved product (sandblasted effect)
    const productId = useHeadstoneStore((s) => s.productId);
    const product = React.useMemo(() => {
      if (!productId) return null;
      return data.products.find(p => p.id === productId);
    }, [productId]);
    const isTraditionalEngraved = product?.name.includes('Traditional Engraved') ?? false;

    // root object users can reference
    const groupRef = React.useRef<THREE.Group | null>(null);
    React.useImperativeHandle(ref, () => groupRef.current!, []);

    const helperRef = React.useRef<THREE.BoxHelper | null>(null);
    const updateLineStore = useHeadstoneStore((s) => s.updateInscription);

    // tools reused during pointer placement - memoized to prevent recreating
    const raycaster = React.useMemo(() => new THREE.Raycaster(), []);
    const mouse = React.useMemo(() => new THREE.Vector2(), []);

    const units = headstone.unitsPerMeter;
    // Keep text on surface for both types (0.5mm offset prevents z-fighting)
    const liftLocal = 0.5;

    // initial Y based on approx height
    const initialYLocal = React.useMemo(() => {
      if (!approxHeight) return 0;
      const hLocal = approxHeight * units;
      return -hLocal / 2;
    }, [approxHeight, units]);

    const [pos, setPos] = React.useState(
      () => new THREE.Vector3(0, initialYLocal, headstone.frontZ + liftLocal),
    );
    const [dragging, setDragging] = React.useState(false);
    const [dragOffset, setDragOffset] = React.useState(new THREE.Vector3());
    const [textBounds, setTextBounds] = React.useState({ width: 0, height: 0 });
    const textMeshRef = React.useRef<THREE.Mesh | null>(null);

    /* ---------------- position on current mesh bbox once available ---------------- */
    React.useEffect(() => {
      const stone = headstone.mesh.current as THREE.Mesh | null;
      if (!stone || !stone.geometry) return;

      // Only position initial and duplicated inscriptions (xPos=0)
      if (xPos !== 0) return;

      const raf = requestAnimationFrame(() => {
        const g = stone.geometry as THREE.BufferGeometry;
        g.computeBoundingBox();
        const bb = g.boundingBox;
        if (!bb) return;
        setPos(
          new THREE.Vector3(
            (bb.min.x + bb.max.x) / 2,
            (bb.min.y + bb.max.y) / 2,
            headstone.frontZ + liftLocal,
          ),
        );
      });
      return () => cancelAnimationFrame(raf);
    }, [headstone.mesh, headstone.frontZ, liftLocal, xPos, yPos]);

    /* ------------------------------ helper: place by pointer ----------------------------- */
    const placeFromClientXY = React.useCallback(
      (clientX: number, clientY: number) => {
        const stone = headstone.mesh.current as THREE.Mesh | null;
        const canvas: HTMLCanvasElement | undefined = gl?.domElement;
        if (!stone || !canvas) return;

        // ✅ FIX: Use canvas rect for correct NDC mapping (canvas may not be at 0,0)
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObject(stone, true);
        if (!hits.length) return;

        // prefer front-facing triangles
        const hit =
          hits.find((h) => h.face?.normal?.z && h.face.normal.z > 0.2) ??
          hits[0];
        if (!hit) return;

        const local = hit.point.clone();
        stone.worldToLocal(local);
        local.z = headstone.frontZ + liftLocal;

        // next is in headstone-local space, corrected by the initial grab offset
        const next = local.add(dragOffset);

        // Update store with new position offsets
        updateLineStore(id, { xPos: next.x, yPos: next.y });

        // Reset local pos to base position (0, 0)
        setPos(new THREE.Vector3(0, 0, headstone.frontZ + liftLocal));
      },
      [
        camera,
        gl,
        raycaster,
        headstone.mesh,
        headstone.frontZ,
        liftLocal,
        mouse,
        dragOffset,
        id,
        updateLineStore,
      ],
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
    
    return (
      <group
        ref={groupRef}
        position={[pos.x + xPos, pos.y + yPos, pos.z + zBump]}
        rotation={[0, 0, (rotationDeg * Math.PI) / 180]}
      >
        {/* Drop shadow for Traditional Engraved (sandblasted effect) */}
        {/* Single blurred shadow layer behind the text */}
        {isTraditionalEngraved && (
          <>
            {/* Blur simulation - multiple layers at same position with increasing size */}
            <Text
              font={font}
              color="#000000"
              anchorX="center"
              anchorY="middle"
              fontSize={height * 1.08}
              outlineWidth={0}
              fillOpacity={0.2}
              position={[0, 0, -0.55]}
            >
              {text}
            </Text>
            <Text
              font={font}
              color="#000000"
              anchorX="center"
              anchorY="middle"
              fontSize={height * 1.05}
              outlineWidth={0}
              fillOpacity={0.3}
              position={[0, 0, -0.52]}
            >
              {text}
            </Text>
            <Text
              font={font}
              color="#000000"
              anchorX="center"
              anchorY="middle"
              fontSize={height}
              outlineWidth={0}
              fillOpacity={0.8}
              position={[0, 0, -0.5]}
            >
              {text}
            </Text>
          </>
        )}
        
        {/* Main text */}
        <Text
          font={font}
          color={color}
          anchorX="center"
          anchorY="middle"
          fontSize={height}
          outlineWidth={isTraditionalEngraved ? 0 : 0.002 * units}
          outlineColor={isTraditionalEngraved ? color : "black"}
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

              // ✅ FIX: compute grab offset from the *rendered* local position = pos + xPos/yPos
              const currentLocal = new THREE.Vector3(
                pos.x + xPos,
                pos.y + yPos,
                headstone.frontZ + liftLocal,
              );
              setDragOffset(currentLocal.sub(localPoint));
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
