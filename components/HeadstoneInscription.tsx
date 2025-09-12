'use client';
import * as React from "react";
import * as THREE from "three";
import { useThree, useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import type { HeadstoneAPI } from "./SvgHeadstone";
import { useHeadstoneStore } from "#/lib/headstone-store";

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
      text = "",
      height,
      color = "#fff8dc",
      font,
      lift = 0.002,
      xPos = 0,
      yPos = 0,
      editable = false,
      selected = false,
      onSelect,
      approxHeight,
      onSelectInscription,
      zBump = 0,
    },
    ref
  ) => {
    const { camera, size, gl, controls, scene } = useThree() as any;

    // root object users can reference
    const groupRef = React.useRef<THREE.Group | null>(null);
    React.useImperativeHandle(ref, () => groupRef.current!, []);

    const helperRef = React.useRef<THREE.BoxHelper | null>(null);
    const setInscriptions = useHeadstoneStore((s) => s.setInscriptions);

    React.useEffect(() => {
      setInscriptions((inscriptions) =>
        inscriptions.map((inscription) =>
          inscription.id === id ? { ...inscription, ref: groupRef } : inscription
        )
      );
    }, [id, setInscriptions]);

    // tools reused during pointer placement
    const raycaster = React.useMemo(() => new THREE.Raycaster(), []);
    const mouse = React.useMemo(() => new THREE.Vector2(), []);

    const units = headstone.unitsPerMeter;
    const liftLocal = lift * units;

    // store hooks (guarded; if your store keys differ, adjust here)
    const openInscriptions = useHeadstoneStore((s: any) => s?.openInscriptions);

    // initial Y based on approx height
    const initialYLocal = React.useMemo(() => {
      if (!approxHeight) return 0;
      const hLocal = approxHeight * units;
      return -hLocal / 2;
    }, [approxHeight, units]);

    const [pos, setPos] = React.useState(
      () => new THREE.Vector3(0, initialYLocal, headstone.frontZ + liftLocal)
    );
    const [dragging, setDragging] = React.useState(false);
    const [dragOffset, setDragOffset] = React.useState(new THREE.Vector3());

    /* ---------------- center on current mesh bbox once available ---------------- */
    React.useEffect(() => {
      const stone = headstone.mesh.current as THREE.Mesh | null;
      if (!stone || !stone.geometry) return;

      const id = requestAnimationFrame(() => {
        const g = stone.geometry as THREE.BufferGeometry;
        g.computeBoundingBox();
        const bb = g.boundingBox;
        if (!bb) return;
        setPos(
          new THREE.Vector3(
            (bb.min.x + bb.max.x) / 2,
            (bb.min.y + bb.max.y) / 2,
            headstone.frontZ + liftLocal
          )
        );
      });
      return () => cancelAnimationFrame(id);
    }, [headstone.mesh, headstone.frontZ, liftLocal]);

    /* ------------------------------ helper: place by pointer ----------------------------- */
    const placeFromClientXY = React.useCallback(
      (clientX: number, clientY: number) => {
        const stone = headstone.mesh.current as THREE.Mesh | null;
        if (!stone) return;

        mouse.x = (clientX / size.width) * 2 - 1;
        mouse.y = -(clientY / size.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObject(stone, true);
        if (!hits.length) return;

        // prefer front-facing triangles
        const hit =
          hits.find((h) => h.face?.normal?.z && h.face.normal.z > 0.2) ?? hits[0];
        if (!hit) return;

        const local = hit.point.clone();
        stone.worldToLocal(local);
        local.z = headstone.frontZ + liftLocal;
        setPos(local.add(dragOffset));
      },
      [
        camera,
        size.width,
        size.height,
        raycaster,
        headstone.mesh,
        headstone.frontZ,
        liftLocal,
        mouse,
        dragOffset,
      ]
    );

    /* ---------------------------- drag wiring (pointermove/up) --------------------------- */
    React.useEffect(() => {
      if (!dragging) return;
      const dom: HTMLElement | undefined = gl?.domElement;
      if (!dom) return;

      const onMove = (e: PointerEvent) => placeFromClientXY(e.clientX, e.clientY);
      const onUp = () => {
        setDragging(false);
        if (controls) controls.enabled = true;
        document.body.style.cursor = "auto";
      };

      if (controls) controls.enabled = false;
      dom.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp, { once: true });
      document.body.style.cursor = "grabbing";

      return () => {
        dom.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        if (controls) controls.enabled = true;
        document.body.style.cursor = "auto";
      };
    }, [dragging, gl, controls, placeFromClientXY]);

    /* ---------------------- PER-ITEM HIGHLIGHT (BoxHelper) ---------------------- */
    React.useEffect(() => {
      const obj = groupRef.current;
      if (!obj || !selected) return;

      const helper = new THREE.BoxHelper(obj, 0xffff00);
      // keep helper out of picking
      (helper as any).raycast = () => null;
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

    useFrame(() => {
      if (selected && helperRef.current && groupRef.current) {
        helperRef.current.update();
        helperRef.current.scale.setScalar(1.01);
      }
    });

    /* --------------------------------------- UI ---------------------------------------- */
    return (
      <group
        ref={groupRef}
        position={[pos.x + xPos, pos.y + yPos, pos.z + zBump]}
        scale={[1, -1, 1]}
      >
        <Text
          font={font}
          color={color}
          anchorX="center"
          anchorY="middle"
          fontSize={height}
          outlineWidth={(selected ? 0.005 : 0.002) * units}
          outlineColor={selected ? "#ffffff" : "black"}
          onSync={() => {
            // geometry finished updating; refresh helper bounds if present
            helperRef.current?.update();
          }}
          // Use onClick for selection; onPointerDown stays for drag init only
          onClick={(e) => {
            e.stopPropagation();
            onSelectInscription?.();
            try {
              // openInscriptions?.(id);
            } catch {}
          }}
          onPointerDown={(e) => {
            e.stopPropagation();

            if (!editable) return;
            const stone = headstone.mesh.current as THREE.Mesh | null;
            if (stone) {
              const localPoint = stone.worldToLocal(e.point.clone());
              setDragOffset(pos.clone().sub(localPoint));
            }
            onSelect?.();
            setDragging(true);
          }}
          onPointerOver={() => {
            if (editable) document.body.style.cursor = "grab";
          }}
          onPointerOut={() => {
            if (editable && !dragging) document.body.style.cursor = "auto";
          }}
        >
          {text}
        </Text>
      </group>
    );
  }
);

HeadstoneInscription.displayName = "HeadstoneInscription";
export default HeadstoneInscription;
