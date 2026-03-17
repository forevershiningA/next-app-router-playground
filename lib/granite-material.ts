import * as THREE from 'three';

const DEFAULT_GRANITE_TINT = 0xa6a6a6;

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
  color = DEFAULT_GRANITE_TINT,
  roughness = 0.2,
  metalness = 0,
  envMapIntensity = 0.95,
  clearcoat = 1,
  clearcoatRoughness = 0.14,
  normalMap,
  normalScale,
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
    ...optionalNormalProps,
  });
}
