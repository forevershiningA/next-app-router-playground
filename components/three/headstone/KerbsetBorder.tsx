// components/three/headstone/KerbsetBorder.tsx
'use client';

import React, {
  useRef,
  useMemo,
  useEffect,
  forwardRef,
  useImperativeHandle,
  Suspense,
} from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { TEX_BASE, DEFAULT_TEX, EPSILON } from '#/lib/headstone-constants';
import {
  createPolishedGraniteMaterial,
  GRANITE_TILE_SIZE_M,
} from '#/lib/granite-material';

type KerbsetBorderProps = { onClick?: (e: any) => void };

const WALL_MM = 100;

function assignBoxFaceGroups(geometry: THREE.BufferGeometry) {
  if (!geometry.index) return;

  geometry.clearGroups();
  const normal = geometry.attributes.normal;
  const index = geometry.index;

  for (let i = 0; i < index.count; i += 3) {
    const vertex = index.getX(i);
    const nx = normal.getX(vertex);
    const ny = normal.getY(vertex);
    const nz = normal.getZ(vertex);
    const materialIndex =
      Math.abs(nx) > Math.abs(ny) && Math.abs(nx) > Math.abs(nz)
        ? nx > 0
          ? 0
          : 1
        : Math.abs(ny) > Math.abs(nx) && Math.abs(ny) > Math.abs(nz)
          ? ny > 0
            ? 2
            : 3
          : nz > 0
            ? 4
            : 5;
    geometry.addGroup(i, 3, materialIndex);
  }
}

function createKerbBarGeometry(width: number, height: number, depth: number) {
  // 3 mm is a real, restrained arris on a polished kerb. Geometry is made at
  // its physical size so the bevel does not become elliptical after scaling.
  const geometry = new RoundedBoxGeometry(width, height, depth, 3, 0.003);
  assignBoxFaceGroups(geometry);
  return geometry;
}

function createKerbBoxMaterials(
  texture: THREE.Texture,
  width: number,
  height: number,
  depth: number,
) {
  const createTexture = (repeatX: number, repeatY: number) => {
    const next = texture.clone();
    next.colorSpace = THREE.SRGBColorSpace;
    next.wrapS = next.wrapT = THREE.RepeatWrapping;
    next.repeat.set(Math.max(1, repeatX), Math.max(1, repeatY));
    next.anisotropy = 16;
    next.needsUpdate = true;
    return next;
  };

  const sideTexture = createTexture(
    depth / GRANITE_TILE_SIZE_M,
    height / GRANITE_TILE_SIZE_M,
  );
  const topTexture = createTexture(
    width / GRANITE_TILE_SIZE_M,
    depth / GRANITE_TILE_SIZE_M,
  );
  const faceTexture = createTexture(
    width / GRANITE_TILE_SIZE_M,
    height / GRANITE_TILE_SIZE_M,
  );

  const horizontal = createPolishedGraniteMaterial({
    texture: topTexture,
    envMapIntensity: 2.4,
    roughness: 0.15,
    clearcoatRoughness: 0.1,
  });
  const side = createPolishedGraniteMaterial({
    texture: sideTexture,
    envMapIntensity: 2.4,
    roughness: 0.15,
    clearcoatRoughness: 0.1,
  });
  side.emissive.set(0xffffff);
  side.emissiveMap = sideTexture;
  side.emissiveIntensity = 0.85;

  const face = createPolishedGraniteMaterial({
    texture: faceTexture,
    envMapIntensity: 2.4,
    roughness: 0.15,
    clearcoatRoughness: 0.1,
  });
  face.emissive.set(0xffffff);
  face.emissiveMap = faceTexture;
  face.emissiveIntensity = 0.85;

  return {
    materials: [side, side, horizontal, horizontal, face, face],
    textures: [sideTexture, topTexture, faceTexture],
  };
}

function KerbMesh({
  texUrl,
  kerbWidthMm,
  kerbHeightMm,
  kerbDepthMm,
  uprightThickness,
  baseThickness,
  onClick,
  groupRef,
}: {
  texUrl: string;
  kerbWidthMm: number;
  kerbHeightMm: number;
  kerbDepthMm: number;
  uprightThickness: number;
  baseThickness: number;
  onClick?: (e: any) => void;
  groupRef: React.RefObject<THREE.Group | null>;
}) {
  const texture = useTexture(texUrl);

  const kW = kerbWidthMm / 1000;
  const kH = kerbHeightMm / 1000;
  const kD = kerbDepthMm / 1000;
  const wall = WALL_MM / 1000;
  // Start at base front face: -(uprightThickness/2) + baseThickness (all in metres)
  const standBackZ = -(uprightThickness / 1000) / 2 + baseThickness / 1000;
  const kerbCenterZ = standBackZ + kD / 2;
  const centerY = kH / 2 + EPSILON;

  // Inner depth (between the two end bars)
  const innerDepth = kD - wall * 2;

  const endBar = useMemo(
    () => createKerbBoxMaterials(texture, kW, kH, wall),
    [texture, kW, kH, wall],
  );
  const sideBar = useMemo(
    () => createKerbBoxMaterials(texture, wall, kH, innerDepth),
    [texture, wall, kH, innerDepth],
  );

  const endBarGeometry = useMemo(
    () => createKerbBarGeometry(kW, kH, wall),
    [kW, kH, wall],
  );
  const sideBarGeometry = useMemo(
    () => createKerbBarGeometry(wall, kH, innerDepth),
    [wall, kH, innerDepth],
  );

  useEffect(() => {
    return () => {
      [...new Set([...endBar.materials, ...sideBar.materials])].forEach(
        (material) => material.dispose(),
      );
      [...endBar.textures, ...sideBar.textures].forEach((materialTexture) =>
        materialTexture.dispose(),
      );
      endBarGeometry.dispose();
      sideBarGeometry.dispose();
    };
  }, [endBar, endBarGeometry, sideBar, sideBarGeometry]);

  const targetGroupY = useRef(centerY);
  const targetGroupZ = useRef(kerbCenterZ);
  const targetPosition = useRef(new THREE.Vector3(0, centerY, kerbCenterZ));
  const visualScaleRef = useRef<THREE.Group>(null);
  const unitScaleRef = useRef(new THREE.Vector3(1, 1, 1));
  const previousDimensionsRef = useRef<THREE.Vector3 | null>(null);
  const initializedRef = useRef(false);

  React.useLayoutEffect(() => {
    const group = groupRef.current;
    const visual = visualScaleRef.current;
    if (!group || !visual) return;

    const nextDimensions = new THREE.Vector3(kW, kH, kD);
    if (!initializedRef.current) {
      group.position.set(0, centerY, kerbCenterZ);
      visual.scale.set(1, 1, 1);
      initializedRef.current = true;
    } else if (previousDimensionsRef.current) {
      const previous = previousDimensionsRef.current;
      visual.scale.multiply(
        new THREE.Vector3(
          previous.x / Math.max(1e-6, nextDimensions.x),
          previous.y / Math.max(1e-6, nextDimensions.y),
          previous.z / Math.max(1e-6, nextDimensions.z),
        ),
      );
    }
    previousDimensionsRef.current = nextDimensions;
  }, [centerY, groupRef, kD, kH, kW, kerbCenterZ]);

  useFrame((state, delta) => {
    if (!groupRef.current || !visualScaleRef.current) return;
    const newKD = kerbDepthMm / 1000;
    const newKH = kerbHeightMm / 1000;
    const newStandBackZ = -(uprightThickness / 1000) / 2 + baseThickness / 1000;
    targetGroupY.current = newKH / 2 + EPSILON;
    targetGroupZ.current = newStandBackZ + newKD / 2;
    targetPosition.current.set(0, targetGroupY.current, targetGroupZ.current);
    const alpha = 1 - Math.exp(-14 * delta);
    const stillMoving =
      groupRef.current.position.distanceToSquared(targetPosition.current) >
        1e-10 ||
      visualScaleRef.current.scale.distanceToSquared(unitScaleRef.current) >
        1e-10;
    if (stillMoving) {
      groupRef.current.position.lerp(targetPosition.current, alpha);
      visualScaleRef.current.scale.lerp(unitScaleRef.current, alpha);
      state.gl.shadowMap.needsUpdate = true;
      state.invalidate();
    }
  });

  return (
    <group
      ref={groupRef as React.RefObject<THREE.Group>}
      onClick={onClick}
      name="kerbset"
    >
      <group ref={visualScaleRef}>
        {/* Back bar (head end) */}
        <mesh
          geometry={endBarGeometry}
          material={endBar.materials}
          position={[0, 0, -(kD / 2 - wall / 2)]}
        />
        {/* Front bar (foot end) */}
        <mesh
          geometry={endBarGeometry}
          material={endBar.materials}
          position={[0, 0, kD / 2 - wall / 2]}
        />
        {/* Left side bar */}
        <mesh
          geometry={sideBarGeometry}
          material={sideBar.materials}
          position={[-(kW / 2 - wall / 2), 0, 0]}
        />
        {/* Right side bar */}
        <mesh
          geometry={sideBarGeometry}
          material={sideBar.materials}
          position={[kW / 2 - wall / 2, 0, 0]}
        />
      </group>
    </group>
  );
}

function PreloadTexture({
  url,
  onReady,
}: {
  url: string;
  onReady: () => void;
}) {
  useTexture.preload(url);
  useTexture(url);
  useEffect(() => {
    const frame = requestAnimationFrame(onReady);
    return () => cancelAnimationFrame(frame);
  }, [onReady]);
  return null;
}

const KerbsetBorder = forwardRef<THREE.Group, KerbsetBorderProps>(
  function KerbsetBorder({ onClick }, ref) {
    const internalRef = useRef<THREE.Group>(null!);
    useImperativeHandle(
      ref,
      () => internalRef.current as unknown as THREE.Group,
    );

    const kerbWidthMm = useHeadstoneStore((s) => s.kerbWidthMm);
    const kerbHeightMm = useHeadstoneStore((s) => s.kerbHeightMm);
    const kerbDepthMm = useHeadstoneStore((s) => s.kerbDepthMm);
    const uprightThickness = useHeadstoneStore((s) => s.uprightThickness);
    const baseThickness = useHeadstoneStore((s) => s.baseThickness);
    const kerbsetMaterialUrl = useHeadstoneStore((s) => s.kerbsetMaterialUrl);

    const texUrl = kerbsetMaterialUrl
      ? kerbsetMaterialUrl.startsWith('/')
        ? kerbsetMaterialUrl
        : `/${kerbsetMaterialUrl}`
      : `${TEX_BASE}${DEFAULT_TEX}`;
    const [visibleTexUrl, setVisibleTexUrl] = React.useState(texUrl);
    const pendingTextureSwap = useRef<ReturnType<typeof setTimeout> | null>(
      null,
    );

    useEffect(() => {
      return () => {
        if (pendingTextureSwap.current)
          clearTimeout(pendingTextureSwap.current);
      };
    }, []);

    return (
      <>
        <Suspense fallback={null}>
          <KerbMesh
            texUrl={visibleTexUrl}
            kerbWidthMm={kerbWidthMm}
            kerbHeightMm={kerbHeightMm}
            kerbDepthMm={kerbDepthMm}
            uprightThickness={uprightThickness}
            baseThickness={baseThickness}
            onClick={onClick}
            groupRef={internalRef}
          />
        </Suspense>
        {texUrl !== visibleTexUrl && (
          <Suspense fallback={null}>
            <PreloadTexture
              url={texUrl}
              onReady={() => {
                if (pendingTextureSwap.current)
                  clearTimeout(pendingTextureSwap.current);
                pendingTextureSwap.current = setTimeout(() => {
                  setVisibleTexUrl(texUrl);
                  pendingTextureSwap.current = null;
                }, 300);
              }}
            />
          </Suspense>
        )}
      </>
    );
  },
);

export default KerbsetBorder;
