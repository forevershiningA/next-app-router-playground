'use client';

import * as React from 'react';
import * as THREE from 'three';

type SsHoles = 'corner' | 'side-center' | 'none';

interface SsPlaqueHolesProps {
  ssHoles: SsHoles;
  worldWidth: number;   // plaque width in world metres
  worldHeight: number;  // plaque height in world metres
  meshRef: React.RefObject<THREE.Mesh | null>;
}

const HOLE_RADIUS_M = 0.004; // 4 mm
const EDGE_INSET_M  = 0.018; // 18 mm
const CANVAS_SIZE   = 1024;
const RIM_RATIO     = 1.65;  // rim outer radius / hole radius

/** UV positions (0-1) for each hole, given the selected option. */
function holeUVs(
  ssHoles: SsHoles,
  worldWidth: number,
  worldHeight: number,
): { u: number; v: number }[] {
  if (ssHoles === 'none') return [];
  const iu = EDGE_INSET_M / worldWidth;
  const iv = EDGE_INSET_M / worldHeight;
  if (ssHoles === 'corner') {
    return [
      { u: iu,     v: iv     }, // bottom-left
      { u: 1 - iu, v: iv     }, // bottom-right
      { u: iu,     v: 1 - iv }, // top-left
      { u: 1 - iu, v: 1 - iv }, // top-right
    ];
  }
  // side-center
  return [
    { u: iu,     v: 0.5 },
    { u: 1 - iu, v: 0.5 },
  ];
}

/**
 * Punches real transparent holes through the SS plaque face by applying a
 * canvas-based alpha map to the front face material.  The rim zone is kept
 * opaque so the PBR metallic material shows a natural drilled-edge ring.
 */
export function SsPlaqueHoles({
  ssHoles,
  worldWidth,
  worldHeight,
  meshRef,
}: SsPlaqueHolesProps) {
  React.useLayoutEffect(() => {
    const mesh = meshRef?.current;
    if (!mesh || ssHoles === 'none') return;

    const origMaterials = Array.isArray(mesh.material)
      ? (mesh.material as THREE.Material[])
      : [mesh.material as THREE.Material];
    const origFace = origMaterials[0] as THREE.MeshPhysicalMaterial;
    if (!origFace) return;

    // Build the alpha-map canvas ------------------------------------------------
    const canvas = document.createElement('canvas');
    canvas.width  = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    const ctx = canvas.getContext('2d')!;

    // White = fully opaque
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Ellipse radii in canvas pixels, corrected for plaque aspect ratio
    const rimRU  = (HOLE_RADIUS_M * RIM_RATIO / worldWidth)  * CANVAS_SIZE;
    const rimRV  = (HOLE_RADIUS_M * RIM_RATIO / worldHeight) * CANVAS_SIZE;
    const holeRU = (HOLE_RADIUS_M / worldWidth)  * CANVAS_SIZE;
    const holeRV = (HOLE_RADIUS_M / worldHeight) * CANVAS_SIZE;

    for (const { u, v } of holeUVs(ssHoles, worldWidth, worldHeight)) {
      const cx = u * CANVAS_SIZE;
      // UV v=0 is bottom; canvas y=0 is top → flip
      const cy = (1 - v) * CANVAS_SIZE;

      // Grey rim — stays opaque; lets the metallic PBR colour show naturally
      ctx.fillStyle = '#b0b0b0';
      ctx.beginPath();
      ctx.ellipse(cx, cy, rimRU, rimRV, 0, 0, Math.PI * 2);
      ctx.fill();

      // Black centre — alphaMap black = transparent → actual see-through hole
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.ellipse(cx, cy, holeRU, holeRV, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    const alphaMap = new THREE.CanvasTexture(canvas);

    // Clone face material so we don't mutate the shared instance
    const clonedFace = origFace.clone();
    clonedFace.alphaMap  = alphaMap;
    clonedFace.alphaTest = 0.5; // hard cutout — discard pixels inside the hole
    clonedFace.transparent = false;

    // Apply same punch-through to back face (material[1]) — same UV layout as front.
    // Note: material[1] also covers the narrow side walls; the tiny alpha-circle
    // footprint on the perimeter UV is negligible at typical plaque depths.
    const clonedBack = (origMaterials[1] as THREE.MeshPhysicalMaterial ?? origFace).clone();
    clonedBack.alphaMap  = alphaMap;
    clonedBack.alphaTest = 0.5;
    clonedBack.transparent = false;

    // Apply — both face groups get holes
    mesh.material = [clonedFace, clonedBack];

    return () => {
      // Restore original face material and free GPU resources
      mesh.material = origMaterials.length > 1
        ? [origMaterials[0], origMaterials[1]]
        : origMaterials[0];
      clonedFace.dispose();
      clonedBack.dispose();
      alphaMap.dispose();
    };
  }, [ssHoles, worldWidth, worldHeight, meshRef]);

  return null;
}
