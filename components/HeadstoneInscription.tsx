// components/three/headstone/HeadstoneInscription.tsx
"use client";

import * as React from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import type { HeadstoneAPI } from "./SvgHeadstone";
import { useHeadstoneStore } from "#/lib/headstone-store";

/* ------------------------------------------------------------------ */
/* Props                                                               */
/* ------------------------------------------------------------------ */

type Props = {
  headstone: HeadstoneAPI;
  text?: string;
  height?: number;        // meters in world space
  color?: string;
  font?: string;
  lift?: number;          // meters in world space
  editable?: boolean;
  selected?: boolean;     // purely visual outline state
  onSelect?: () => void;  // internal (e.g., start dragging)
  approxHeight?: number;  // meters, used for an initial Y offset

  // External selection wiring (safe/optional)
  inscriptionRef?: React.MutableRefObject<THREE.Object3D | null>;
  onSelectInscription?: () => void;
};

/* ------------------------------------------------------------------ */

export default function HeadstoneInscription({
  headstone,
  text = "In Loving Memory",
  height = 0.8,
  color = "#fff8dc",
  font,
  lift = 0.002,
  editable = false,
  selected = false,
  onSelect,
  approxHeight,
  inscriptionRef,
  onSelectInscription,
}: Props) {
  const { camera, size, gl, controls } = useThree() as any;

  // tools reused during pointer placement
  const raycaster = React.useMemo(() => new THREE.Raycaster(), []);
  const mouse = React.useMemo(() => new THREE.Vector2(), []);

  const units = headstone.unitsPerMeter;
  const liftLocal = lift * units;

  // store hooks (guarded; if your store keys differ, adjust here)
  const setActiveText = useHeadstoneStore((s: any) => s?.setActiveInscriptionText);
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

  /* -------------------- center on current mesh bbox once available -------------------- */
  React.useEffect(() => {
    // read the ref *inside* the effect so it picks up later attachments
    const stone = headstone.mesh.current as THREE.Mesh | null;
    if (!stone || !stone.geometry) return;

    // schedule to ensure geometry/bounds are ready
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
      const hit = hits.find((h) => h.face?.normal?.z && h.face.normal.z > 0.2) ?? hits[0];
      if (!hit) return;

      const local = hit.point.clone();
      stone.worldToLocal(local);
      local.z = headstone.frontZ + liftLocal;
      setPos(local);
    },
    [camera, size.width, size.height, raycaster, headstone.mesh, headstone.frontZ, liftLocal, mouse]
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

  /* --------------------------------------- UI ---------------------------------------- */
  return (
    <group position={[pos.x, pos.y, pos.z]} scale={[1, -1, 1]}>
      <Text
        // troika Text is a mesh; accept any Object3D-like ref
        ref={inscriptionRef as any}
        font={font}
        color={color}
        anchorX="center"
        anchorY="middle"
        fontSize={height * units}
        outlineWidth={(selected ? 0.005 : 0.002) * units}
        outlineColor={selected ? "#ffd54a" : "black"}
        onPointerDown={(e) => {
          e.stopPropagation();

          // external selection (safe)
          if (typeof onSelectInscription === "function") onSelectInscription();

          // open overlay + prefill text if store is present
          try {
            setActiveText?.(text);
            openInscriptions?.();
          } catch {
            /* store not wired — ignore */
          }

          if (!editable) return;
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
