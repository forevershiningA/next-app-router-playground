import * as THREE from 'three';

// Do not darken a correctly decoded sRGB granite swatch. The texture itself
// carries the stone's colour; a neutral multiplier keeps its rendered value
// aligned with the material selector preview.
export const POLISHED_GRANITE_TINT = 0xffffff;

// One physical swatch size for every polished granite component. Keeping this
// shared prevents a ledger, kerb or base from reading as a different stone.
export const GRANITE_TILE_SIZE_M = 0.35;

type GraniteTextureOptions = {
  repeatX: number;
  repeatY: number;
  anisotropy?: number;
};

type PolishedGraniteMaterialOptions = {
  texture: THREE.Texture;
  color?: THREE.ColorRepresentation;
  roughness?: number;
  metalness?: number;
  envMapIntensity?: number;
  clearcoat?: number;
  clearcoatRoughness?: number;
  normalMap?: THREE.Texture | null;
  normalScale?: THREE.Vector2;
  bumpMap?: THREE.Texture | null;
  bumpScale?: number;
  roughnessMap?: THREE.Texture | null;
};

export function configureGraniteTexture(
  texture: THREE.Texture,
  { repeatX, repeatY, anisotropy = 16 }: GraniteTextureOptions,
) {
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.repeat.set(repeatX, repeatY);
  texture.anisotropy = anisotropy;
  texture.needsUpdate = true;
}

export function createPolishedGraniteMaterial({
  texture,
  color = POLISHED_GRANITE_TINT,
  roughness = 0.18,
  metalness = 0,
  envMapIntensity = 1.1,
  clearcoat = 1,
  clearcoatRoughness = 0.08,
  normalMap,
  normalScale,
  bumpMap,
  bumpScale,
  roughnessMap,
}: PolishedGraniteMaterialOptions) {
  const optionalNormalProps =
    normalMap && normalScale
      ? { normalMap, normalScale }
      : normalMap
        ? { normalMap }
        : {};

  return new THREE.MeshPhysicalMaterial({
    map: texture,
    color,
    roughness,
    metalness,
    envMapIntensity,
    clearcoat,
    clearcoatRoughness,
    bumpMap: bumpMap ?? null,
    bumpScale: bumpScale ?? 1,
    roughnessMap: roughnessMap ?? null,
    ...optionalNormalProps,
  });
}
