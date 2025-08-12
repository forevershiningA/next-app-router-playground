"use client";

import * as React from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import type { HeadstoneAPI } from "./SvgHeadstone";

type Props = {
  headstone: HeadstoneAPI;
  text?: string;
  height?: number;        // world meters
  color?: string;
  font?: string;          // /fonts/YourFont.ttf (TTF/OTF recommended)
  lift?: number;          // world meters off the face
  editable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  approxHeight?: number;  // world meters (use same as targetHeight)
};

export default function HeadstoneInscription({
  headstone,
  text = "In Loving Memory",
  height = 0.12,
  color = "#fff8dc",
  font,
  lift = 0.002,
  editable = false,
  selected = false,
  onSelect,
  approxHeight,
}: Props) {
  const { camera, size, gl, controls } = useThree() as any;
  const raycaster = React.useMemo(() => new THREE.Raycaster(), []);
  const mouse = React.useMemo(() => new THREE.Vector2(), []);
  const stone = headstone.mesh.current;
  const liftLocal = lift * headstone.unitsPerMeter;

  // initial centered Y so there’s no “bottom flash” on first frame
  const initialYLocal = React.useMemo(() => {
    if (!approxHeight) return 0;
    const hLocal = approxHeight * headstone.unitsPerMeter;
    return -hLocal / 2; // our mesh uses top=0 before flip; center = -H/2
  }, [approxHeight, headstone.unitsPerMeter]);

  // SINGLE pos state (← this replaces both previous declarations)
  const [pos, setPos] = React.useState<THREE.Vector3>(
    () => new THREE.Vector3(0, initialYLocal, headstone.frontZ + liftLocal)
  );
  const [dragging, setDragging] = React.useState(false);

  // recenter precisely when geometry is ready
  React.useEffect(() => {
    if (!stone) return;
    const id = requestAnimationFrame(() => {
      const g = stone.geometry as THREE.BufferGeometry;
      g.computeBoundingBox();
      const bb = g.boundingBox!;
      setPos(new THREE.Vector3(
        (bb.min.x + bb.max.x) / 2,
        (bb.min.y + bb.max.y) / 2,
        headstone.frontZ + liftLocal
      ));
    });
    return () => cancelAnimationFrame(id);
  }, [stone, headstone.frontZ, liftLocal]);

  const placeFromClientXY = React.useCallback((clientX: number, clientY: number) => {
    if (!stone) return;
    mouse.x = (clientX / size.width) * 2 - 1;
    mouse.y = -(clientY / size.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObject(stone, true);
    if (!hits.length) return;
    const hit = hits.find((h) => h.face?.normal?.z && h.face.normal.z > 0.2);
    if (!hit) return;
    const local = hit.point.clone();
    stone.worldToLocal(local);
    local.z = headstone.frontZ + liftLocal; // stick to front plane
    setPos(local);
  }, [camera, size.width, size.height, raycaster, stone, headstone.frontZ, liftLocal, mouse]);

  // drag loop (disables orbit while dragging)
  React.useEffect(() => {
    if (!dragging) return;
    const onMove = (e: PointerEvent) => placeFromClientXY(e.clientX, e.clientY);
    const onUp = () => {
      setDragging(false);
      if (controls) controls.enabled = true;
      document.body.style.cursor = "auto";
    };
    if (controls) controls.enabled = false;
    gl.domElement.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp, { once: true });
    document.body.style.cursor = "grabbing";
    return () => {
      gl.domElement.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      if (controls) controls.enabled = true;
      document.body.style.cursor = "auto";
    };
  }, [dragging, placeFromClientXY, gl.domElement, controls]);

  return (
    // flip Y so text reads upright in the flipped headstone group
    <group position={[pos.x, pos.y, pos.z]} scale={[1, -1, 1]}>
      <Text
        font={font}                      // e.g. "/fonts/YourFont.ttf"
        color={color}
        anchorX="center"
        anchorY="middle"
        fontSize={height * headstone.unitsPerMeter}
        outlineWidth={(selected ? 0.005 : 0.002) * headstone.unitsPerMeter}
        outlineColor={selected ? "#ffd54a" : "black"}
        onPointerDown={(e) => {
          if (!editable) return;
          e.stopPropagation();
          onSelect?.();
          setDragging(true);
        }}
        onPointerOver={() => editable && (document.body.style.cursor = "grab")}
        onPointerOut={() => (document.body.style.cursor = "auto")}
      >
        {text}
      </Text>
    </group>
  );
}
