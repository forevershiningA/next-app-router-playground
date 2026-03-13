'use client';
import * as THREE from 'three';
import React, {
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
  useLayoutEffect,
  useMemo,
  Suspense,
} from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { useHeadstoneStore, Line } from '#/lib/headstone-store';
import HeadstoneInscription from '../../HeadstoneInscription';
import MotifModel from '../MotifModel';
import type { HeadstoneAPI } from '../../SvgHeadstone';
import {
  TEX_BASE,
  DEFAULT_TEX,
  BASE_WIDTH_MULTIPLIER,
  BASE_DEPTH_MULTIPLIER,
  BASE_MIN_DEPTH,
  LERP_FACTOR,
  EPSILON,
} from '#/lib/headstone-constants';

type HeadstoneBaseAutoProps = {
  headstoneObject: React.RefObject<THREE.Object3D>;
  wrapper: React.RefObject<THREE.Object3D>;
  onClick?: (e: any) => void;
  height?: number;
  name?: string;
};

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

/**
 * Helper to fix Multi-Material support on RoundedBoxGeometry
 * Assigns material groups based on the dominant normal direction of each face
 */
function fixRoundedBoxUVs(geometry: THREE.BufferGeometry) {
  if (!geometry.attributes.position || !geometry.index) return;

  geometry.clearGroups();

  const normal = geometry.attributes.normal;
  const index = geometry.index;

  // 0: Right (+x), 1: Left (-x), 2: Top (+y), 3: Bottom (-y), 4: Front (+z), 5: Back (-z)
  for (let i = 0; i < index.count; i += 3) {
    const a = index.getX(i);
    const nx = normal.getX(a);
    const ny = normal.getY(a);
    const nz = normal.getZ(a);

    let matIdx = 0;

    if (Math.abs(nx) > Math.abs(ny) && Math.abs(nx) > Math.abs(nz)) {
      matIdx = nx > 0 ? 0 : 1; // Right : Left
    } else if (Math.abs(ny) > Math.abs(nx) && Math.abs(ny) > Math.abs(nz)) {
      matIdx = ny > 0 ? 2 : 3; // Top : Bottom
    } else {
      matIdx = nz > 0 ? 4 : 5; // Front : Back
    }

    geometry.addGroup(i, 3, matIdx);
  }
}

function BaseMesh({
  baseRef,
  baseTexture,
  onClick,
  name,
  dimensions,
  finish,
}: {
  baseRef: React.RefObject<THREE.Mesh | null>;
  baseTexture: THREE.Texture;
  onClick?: (e: any) => void;
  name?: string;
  dimensions: { width: number; height: number; depth: number };
  finish: 'default' | 'rock-pitch';
}) {
  // 1. Generate the Source Canvas (The "Great" Texture)
  const rockNormalCanvas = useMemo(() => {
    if (finish !== 'rock-pitch') return null;

    const size = 1024; // Increased from 512 for better detail
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    const imageData = ctx.getImageData(0, 0, size, size);
    const data = imageData.data;

    // Pseudo-random deterministic noise
    const fract = (x: number) => x - Math.floor(x);
    const random2 = (x: number, y: number) => {
      return {
        x: fract(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453),
        y: fract(Math.sin(x * 26.345 + y * 42.123) * 31421.3551)
      };
    };

    // Voronoi-based faceted height map - matching slant headstone quality
    const getHeight = (u: number, v: number) => {
      const scale = 24.0; // Increased from 12.0 for smaller, sharper chips
      const su = u * scale;
      const sv = v * scale;

      let minDist = 999;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const cellX = Math.floor(su) + dx;
          const cellY = Math.floor(sv) + dy;
          const rand = random2(cellX, cellY);
          const pointX = cellX + rand.x;
          const pointY = cellY + rand.y;
          const dist = Math.sqrt((su - pointX) ** 2 + (sv - pointY) ** 2);
          if (dist < minDist) minDist = dist;
        }
      }
      return Math.pow(1.0 - Math.min(minDist, 1.0), 0.5);
    };

    // Generate height map first
    const heights: number[][] = [];
    for (let y = 0; y < size; y++) {
      heights[y] = [];
      for (let x = 0; x < size; x++) {
        heights[y][x] = getHeight(x / size, y / size);
      }
    }

    // FIX from advice22: Invert strength to make chips convex (bumps) not concave (holes)
    const strength = -25.0; // Negative makes chips pop out instead of looking like craters

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const xRight = (x + 1) % size;
        const yDown = (y + 1) % size;
        const h0 = heights[y][x];
        const hRight = heights[y][xRight];
        const hDown = heights[yDown][x];
        const dX = (h0 - hRight) * strength;
        const dY = (h0 - hDown) * strength;
        const norm = Math.sqrt(dX * dX + dY * dY + 1);
        const nx = dX / norm;
        const ny = dY / norm;
        const nz = 1 / norm;
        const idx = (y * size + x) * 4;
        data[idx] = ((nx * 0.5 + 0.5) * 255) | 0;
        data[idx + 1] = ((ny * 0.5 + 0.5) * 255) | 0;
        data[idx + 2] = ((nz * 0.5 + 0.5) * 255) | 0;
        data[idx + 3] = 255;
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    return canvas;
  }, [finish]);

  // 2. Manage Base Texture Settings
  useLayoutEffect(() => {
    if (baseTexture) {
      baseTexture.wrapS = THREE.RepeatWrapping;
      baseTexture.wrapT = THREE.RepeatWrapping;
      const textureScale = 0.15;
      baseTexture.repeat.set(
        dimensions.width / textureScale,
        dimensions.height / textureScale
      );
      baseTexture.anisotropy = 16;
      baseTexture.needsUpdate = true;
    }
  }, [baseTexture, dimensions.width, dimensions.height]);

  // 3. Create Materials
  const materials = useMemo(() => {
    const polishedMaterial = new THREE.MeshPhysicalMaterial({
      map: baseTexture,
      color: 0x888888,
      metalness: 0.0,
      roughness: 0.08, // Very low for polished granite sparkle
      envMapIntensity: 2.0, // Increased for better reflections
      clearcoat: 1.0,
      clearcoatRoughness: 0.05, // Lower for shinier polish layer
    });

    if (finish === 'rock-pitch' && rockNormalCanvas) {
      const texShort = new THREE.CanvasTexture(rockNormalCanvas);
      const texLong = new THREE.CanvasTexture(rockNormalCanvas);

      [texShort, texLong].forEach((tex) => {
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.colorSpace = THREE.NoColorSpace; 
        tex.needsUpdate = true;
      });

      // Rock Pitch Material Settings - upgraded for realistic granite sparkle
      const rockColor = 0x444444; 
      
      const matShort = new THREE.MeshPhysicalMaterial({
        map: baseTexture,
        normalMap: texShort,
        normalScale: new THREE.Vector2(2.0, 2.0), // Enhanced for crystalline detail
        color: rockColor,
        metalness: 0.0,
        roughness: 0.08, // Polished granite - very reflective
        envMapIntensity: 2.0, // Strong environment reflections for sparkle
        clearcoat: 1.0, // Polish layer on top
        clearcoatRoughness: 0.05, // Shiny polish
      });

      const matLong = new THREE.MeshPhysicalMaterial({
        map: baseTexture,
        normalMap: texLong,
        normalScale: new THREE.Vector2(2.0, 2.0), // Enhanced for crystalline detail
        color: rockColor,
        metalness: 0.0,
        roughness: 0.08, // Polished granite - very reflective
        envMapIntensity: 2.0, // Strong environment reflections for sparkle
        clearcoat: 1.0, // Polish layer on top
        clearcoatRoughness: 0.05, // Shiny polish
      });

      return [
        matShort,
        matShort,
        polishedMaterial,
        polishedMaterial,
        matLong,
        matLong,
      ];
    }

    return polishedMaterial;
  }, [baseTexture, finish, rockNormalCanvas]);

  // 4. Update Material Repeats - matching slant headstone quality
  useLayoutEffect(() => {
    if (Array.isArray(materials) && finish === 'rock-pitch') {
      // Increased density from 0.5 to 20.0 to match slant headstone
      // Creates much smaller, sharper chips matching the 24x24 Voronoi grid
      const density = 20.0;
      
      const matRight = materials[0] as THREE.MeshStandardMaterial;
      const matFront = materials[4] as THREE.MeshStandardMaterial;

      if (matRight.normalMap) {
        // Right/Left sides (shorter dimension = depth)
        matRight.normalMap.repeat.set(
          Math.max(1, dimensions.depth * density),
          Math.max(1, dimensions.height * density)
        );
      }

      if (matFront.normalMap) {
        // Front/Back sides (longer dimension = width)
        matFront.normalMap.repeat.set(
          Math.max(1, dimensions.width * density),
          Math.max(1, dimensions.height * density)
        );
      }
    }
  }, [materials, dimensions, finish]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (Array.isArray(materials)) {
        materials.forEach((m) => {
          if (m instanceof THREE.MeshStandardMaterial && m.normalMap) {
            m.normalMap.dispose();
          }
        });
      }
    };
  }, [materials]);

  // 5. Geometry Logic
  const geometry = useMemo(() => {
    if (finish === 'rock-pitch') {
      // Small 3% bevel for realistic stone edge
      const geo = new RoundedBoxGeometry(1, 1, 1, 8, 0.03);
      fixRoundedBoxUVs(geo);
      return geo;
    }
    return new THREE.BoxGeometry(1, 1, 1);
  }, [finish]);

  return (
    <mesh
      ref={baseRef}
      name={name}
      onClick={onClick}
      castShadow
      receiveShadow
      geometry={geometry}
      onUpdate={(self) => {
        if (self.geometry) self.geometry.computeBoundingBox();
      }}
    >
      {Array.isArray(materials) ? (
        materials.map((mat, i) => (
          <primitive key={i} object={mat} attach={`material-${i}`} />
        ))
      ) : (
        <primitive object={materials} attach="material" />
      )}
    </mesh>
  );
}

const HeadstoneBaseAuto = forwardRef<THREE.Mesh, HeadstoneBaseAutoProps>(
  ({ headstoneObject: _headstoneObject, wrapper: _wrapper, onClick, height = 0.1, name }, ref) => {
    const baseRef = useRef<THREE.Mesh>(null);
    useImperativeHandle(ref, () => baseRef.current!);

    // Dummy group ref for baseAPI (base doesn't use group)
    const dummyGroupRef = useRef<THREE.Group>(null);

    const baseMaterialUrl = useHeadstoneStore((s) => s.baseMaterialUrl);
    const setBaseSwapping = useHeadstoneStore((s) => s.setBaseSwapping);
    const hasStatue = useHeadstoneStore((s) => s.hasStatue);
    const widthMm = useHeadstoneStore((s) => s.widthMm);
    const heightMm = useHeadstoneStore((s) => s.heightMm);
    const baseWidthMm = useHeadstoneStore((s) => s.baseWidthMm);
    const baseHeightMm = useHeadstoneStore((s) => s.baseHeightMm);
    const baseThickness = useHeadstoneStore((s) => s.baseThickness);
    const baseFinish = useHeadstoneStore((s) => s.baseFinish);
    const headstoneStyle = useHeadstoneStore((s) => s.headstoneStyle);
    const uprightThickness = useHeadstoneStore((s) => s.uprightThickness);
    const slantThickness = useHeadstoneStore((s) => s.slantThickness);
    const inscriptions = useHeadstoneStore((s) => s.inscriptions);
    const selectedMotifs = useHeadstoneStore((s) => s.selectedMotifs);
    const motifOffsets = useHeadstoneStore((s) => s.motifOffsets);
    
    const baseHeightMeters = baseHeightMm / 1000;
    const selectedInscriptionId = useHeadstoneStore((s) => s.selectedInscriptionId);
    const setSelectedInscriptionId = useHeadstoneStore(
      (s) => s.setSelectedInscriptionId
    );
    const setSelectedMotifId = useHeadstoneStore((s) => s.setSelectedMotifId);
    const setSelected = useHeadstoneStore((s) => s.setSelected);
    const setSelectedAdditionId = useHeadstoneStore(
      (s) => s.setSelectedAdditionId
    );
    const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);

    const baseAPI: HeadstoneAPI = useMemo(() => {
      const baseDepth = baseThickness / 1000; // Convert mm to meters
      return {
        group: dummyGroupRef as React.RefObject<THREE.Group>,
        mesh: baseRef as React.RefObject<THREE.Mesh>,
        frontZ: baseDepth / 2,
        unitsPerMeter: 1000,
        version: 1,
        worldWidth: (widthMm / 1000) * BASE_WIDTH_MULTIPLIER,
        worldHeight: height,
      };
    }, [widthMm, height, baseThickness]);

    const requestedBaseTex = useMemo(() => {
      if (!baseMaterialUrl) {
        return `${TEX_BASE}${DEFAULT_TEX}`;
      }
      if (baseMaterialUrl.startsWith('http')) {
        return baseMaterialUrl;
      }
      if (baseMaterialUrl.startsWith('/')) {
        return baseMaterialUrl;
      }
      return `/${baseMaterialUrl.replace(/^\/+/, '')}`;
    }, [baseMaterialUrl]);

    const [visibleBaseTex, setVisibleBaseTex] = React.useState(requestedBaseTex);

    const baseSwapping = requestedBaseTex !== visibleBaseTex;

    useEffect(() => {
      setBaseSwapping(baseSwapping);
    }, [baseSwapping, setBaseSwapping]);

    const baseTexture = useTexture(visibleBaseTex);

    const hasTx = useRef(false);
    const targetPos = useRef(new THREE.Vector3());
    const targetScale = useRef(new THREE.Vector3(1, height, 1));
    const [baseDimensions, setBaseDimensions] = React.useState({
      width: 1,
      height: height,
      depth: 1,
    });

    useFrame(() => {
      const b = baseRef.current;
      if (!b) return;

      const hsH = heightMm / 1000;
      // CRITICAL: Base back should align with UPRIGHT thickness reference
      // Both upright and slant headstones align their backs to -uprightThickness/2
      // So base should also align to the same position
      const alignmentDepth = uprightThickness / 1000; // Use upright thickness as alignment reference
      const baseW = baseWidthMm / 1000;
      const baseD = baseThickness / 1000; // Convert mm to meters

      const statuePresent = hasStatue();
      const baseWTotal = statuePresent ? baseW * 1.3 : baseW; // widen by 30%
      const baseDTotal = statuePresent ? baseD * 1.5 : baseD; // 75% of previous doubling

      // CRITICAL: Align base back edge with headstone back edge
      // Both upright and slant headstones have their backs at: -(uprightThickness / 2 / 1000)
      // Base back should match, so: baseZCenter - baseD/2 = -(alignmentDepth / 2)
      // Therefore: baseZCenter = -(alignmentDepth / 2) + baseD / 2
      const baseZCenter = -(alignmentDepth / 2) + baseDTotal / 2;

      targetPos.current.set(
        0,
        -baseHeightMeters * 0.5 + EPSILON,
        baseZCenter
      );
      targetScale.current.set(baseWTotal, baseHeightMeters, baseDTotal);

      if (
        baseDimensions.width !== baseWTotal ||
        baseDimensions.height !== baseHeightMeters ||
        baseDimensions.depth !== baseDTotal
      ) {
        setBaseDimensions({
          width: baseWTotal,
          height: baseHeightMeters,
          depth: baseDTotal,
        });
      }

      if (!hasTx.current) {
        b.position.copy(targetPos.current);
        b.scale.copy(targetScale.current);
        hasTx.current = true;
      }

      b.visible = true;

      if (!hasTx.current) {
        return;
      }

      if (!baseSwapping) {
        b.position.lerp(targetPos.current, LERP_FACTOR);
        b.scale.lerp(targetScale.current, LERP_FACTOR);
      }

      b.visible = true;
    });

    return (
      <React.Fragment>
        <Suspense fallback={null}>
          <BaseMesh
            baseRef={baseRef}
            baseTexture={baseTexture}
            onClick={(e) => {
              // Prevent click from interfering with drag
              e.stopPropagation();
              // Only handle click if not dragging (check for small movement)
              if (onClick && (!e.delta || e.delta < 2)) {
                onClick(e);
              }
            }}
            name={name}
            dimensions={baseDimensions}
            finish={baseFinish}
          />
        </Suspense>

        {/* Render inscriptions that belong to the base */}
        {inscriptions
          .filter((line: Line) => line.target === 'base')
          .map((line: Line, i: number) => {
            const zBump = (inscriptions.length - 1 - i) * 0.00005;
            return (
              <Suspense key={line.id} fallback={null}>
                <HeadstoneInscription
                  id={line.id}
                  headstone={baseAPI}
                  font={`/fonts/${line.font}.woff2`}
                  editable
                  selected={selectedInscriptionId === line.id}
                  onSelectInscription={() => {
                    setSelected('base');
                    setSelectedMotifId(null);
                    setSelectedAdditionId(null);
                    setSelectedInscriptionId(line.id);
                    setActivePanel('inscription');
                    // Open inscriptions fullscreen panel
                    window.dispatchEvent(new CustomEvent('openFullscreenPanel', { detail: { panel: 'inscriptions' } }));
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
              </Suspense>
            );
          })}

        {/* Render motifs that belong to the base */}
        {selectedMotifs
          .filter((motif) => {
            const offset = motifOffsets[motif.id];
            return offset?.target === 'base';
          })
          .map((motif, i) => (
            <Suspense key={`${motif.id}-${i}`} fallback={null}>
              <MotifModel
                id={motif.id}
                svgPath={motif.svgPath}
                color={motif.color}
                headstone={baseAPI}
                index={i}
              />
            </Suspense>
          ))}

        {requestedBaseTex !== visibleBaseTex && (
          <Suspense fallback={null}>
            <PreloadTexture
              url={requestedBaseTex}
              onReady={() => {
                // Wait longer to ensure texture is fully cached in GPU
                setTimeout(() => {
                  setVisibleBaseTex(requestedBaseTex);
                }, 500);
              }}
            />
          </Suspense>
        )}
      </React.Fragment>
    );
  },
);

HeadstoneBaseAuto.displayName = 'HeadstoneBaseAuto';
export default HeadstoneBaseAuto;
