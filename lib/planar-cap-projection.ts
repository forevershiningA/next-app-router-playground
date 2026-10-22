import { MeshPhysicalMaterial, Vector4, type Box3 } from 'three';

const projections = new WeakMap<MeshPhysicalMaterial, { value: Vector4 }>();
const PROGRAM_KEY = 'planar-cap:uniforms-v1';

/** Update planar UV mapping without recompiling a shader or uploading a texture. */
export function applyPlanarCapProjection(
  material: MeshPhysicalMaterial,
  bounds: Box3,
  repeatX: number,
  repeatY: number,
) {
  let projection = projections.get(material);
  if (!projection) {
    projection = { value: new Vector4() };
    projections.set(material, projection);
    const uniform = projection;
    material.onBeforeCompile = (shader) => {
      shader.uniforms.planarCapProjection = uniform;
      shader.vertexShader = `uniform vec4 planarCapProjection;\n${shader.vertexShader}`;
      shader.vertexShader = shader.vertexShader.replace(
        '#include <uv_vertex>',
        `#include <uv_vertex>
        vec2 planarCapUv = (position.xy - planarCapProjection.xy) * planarCapProjection.zw;
        #ifdef USE_MAP
          vMapUv = planarCapUv;
        #endif
        #ifdef USE_BUMPMAP
          vBumpMapUv = planarCapUv;
        #endif
        #ifdef USE_EMISSIVEMAP
          vEmissiveMapUv = planarCapUv;
        #endif
        #ifdef USE_ROUGHNESSMAP
          vRoughnessMapUv = planarCapUv;
        #endif`,
      );
    };
    material.customProgramCacheKey = () => PROGRAM_KEY;
  }

  projection.value.set(
    bounds.min.x,
    bounds.min.y,
    repeatX / Math.max(1e-9, bounds.max.x - bounds.min.x),
    repeatY / Math.max(1e-9, bounds.max.y - bounds.min.y),
  );
}
