'use client';
import * as React from 'react';
import * as THREE from 'three';
import type { HeadstoneAPI } from '#/components/SvgHeadstone';

// Stainless steel border width in millimetres (equal on all bounding-box sides)
const BORDER_MM = 20;

type Props = {
  api: HeadstoneAPI;
  textureUrl: string | null;
};

/**
 * Renders a vitreous enamel inlay panel inset from the urn face.
 *
 * Architecture:
 * - ShapeGeometry clipped to urn outline scaled down by BORDER_MM on each side
 *   → gives the visual stainless steel border (outer steel minus inner inlay)
 * - MeshBasicMaterial (unlit) with background texture stretched to fill the shape
 *   → matches Full Color Plaque approach; image renders without lighting distortion
 * - THREE.TextureLoader (NOT canvas) to load the image
 *   → flipY=true default is correct for ShapeGeometry UVs (V=0 at bottom)
 *
 * Rendered inside SvgHeadstone children callback (pre-meshScale space).
 * outlinePoints are in the same coordinate space as children positions.
 * cy = outH/2 centres the inlay mesh on the urn face.
 * z = 0.5 places it just in front of the urn surface (in pre-meshScale units).
 */
export default function UrnEnamelInlay({ api, textureUrl }: Props) {
  const [tex, setTex] = React.useState<THREE.Texture | null>(null);

  const geomData = React.useMemo(() => {
    const pts = api.outlinePoints;
    if (!pts || pts.length < 3) return null;

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const p of pts) {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    }
    const outW = maxX - minX;
    const outH = maxY - minY;
    const cy = outH / 2; // centre of urn face in children-group Y

    // Equal mm border on all 4 bounding-box sides via separate X/Y scale factors.
    // No polygon inset — avoids self-intersections at heart notch and triangle tips.
    const borderPU = BORDER_MM * api.unitsPerMeter / 1000; // mm → pre-meshScale units
    const scaleX = Math.max(0.1, (outW - 2 * borderPU) / outW);
    const scaleY = Math.max(0.1, (outH - 2 * borderPU) / outH);

    // Downsample to ~256 points for earcut performance
    const step = Math.max(1, Math.floor(pts.length / 256));
    const shapePts: THREE.Vector2[] = [];
    for (let i = 0; i < pts.length; i += step) {
      const p = pts[i];
      const corrY = p.y - minY; // align bottom to 0
      shapePts.push(new THREE.Vector2(
        p.x * scaleX,           // centred at 0 (outlinePoints X is already centred)
        (corrY - cy) * scaleY,  // centred at 0 around cy
      ));
    }

    const shape = new THREE.Shape(shapePts);
    const geom = new THREE.ShapeGeometry(shape);
    return { geom, cy };
  }, [api.outlinePoints, api.unitsPerMeter]);

  // Load background texture with TextureLoader (not canvas).
  // flipY=true (default THREE.js): correct for ShapeGeometry where V=0 at bottom.
  // Image stretches to fill the inlay shape, same as Full Color Plaque.
  React.useEffect(() => {
    if (!textureUrl) {
      setTex(null);
      return;
    }

    let cancelled = false;
    const loader = new THREE.TextureLoader();
    loader.load(
      textureUrl,
      (loaded) => {
        if (cancelled) { loaded.dispose(); return; }
        loaded.colorSpace = THREE.SRGBColorSpace;
        // flipY=true (default) is correct: image top → shape top, image bottom → shape bottom
        setTex(prev => { prev?.dispose(); return loaded; });
      },
      undefined,
      () => { if (!cancelled) setTex(null); },
    );

    return () => { cancelled = true; };
  }, [textureUrl]);

  const material = React.useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        // Unlit, like Full Color Plaque — image renders at full colour without lighting distortion
        color: new THREE.Color(0.88, 0.88, 0.88),
        toneMapped: false,
        side: THREE.FrontSide,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      }),
    [],
  );

  React.useEffect(() => {
    material.map = tex ?? null;
    material.needsUpdate = true;
  }, [tex, material]);

  React.useEffect(() => {
    return () => {
      geomData?.geom.dispose();
      material.dispose();
      tex?.dispose();
    };
  }, [geomData, material, tex]);

  // Don't render until texture is loaded — steel face shows through until then
  if (!geomData || !tex) return null;

  return (
    <mesh
      geometry={geomData.geom}
      material={material}
      position={[0, geomData.cy, 0.5]}
      renderOrder={5}
    />
  );
}

