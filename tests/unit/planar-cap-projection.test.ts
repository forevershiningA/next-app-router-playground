import { describe, expect, it } from 'vitest';
import { Box3, MeshPhysicalMaterial, Vector3, WebGLRenderer } from 'three';
import { applyPlanarCapProjection } from '#/lib/planar-cap-projection';

describe('planar cap projection during dimension changes', () => {
  it('updates the compiled shader uniform without changing its program or material version', () => {
    const material = new MeshPhysicalMaterial();
    applyPlanarCapProjection(
      material,
      new Box3(new Vector3(-50, 0, -5), new Vector3(50, 60, 5)),
      2,
      3,
    );
    const shader = {
      uniforms: {},
      vertexShader: '#include <uv_vertex>',
      fragmentShader: '',
    } as Parameters<typeof material.onBeforeCompile>[0];
    material.onBeforeCompile(shader, {} as WebGLRenderer);
    const source = shader.vertexShader;
    const key = material.customProgramCacheKey();
    const version = material.version;
    const uniform = shader.uniforms.planarCapProjection;
    expect(uniform.value.toArray()).toEqual([-50, 0, 0.02, 0.05]);

    for (let height = 30; height <= 120; height += 10) {
      applyPlanarCapProjection(
        material,
        new Box3(new Vector3(-40, 0, -5), new Vector3(40, height, 5)),
        4,
        height / 10,
      );
      expect(shader.uniforms.planarCapProjection).toBe(uniform);
      expect(uniform.value.toArray()).toEqual([-40, 0, 0.05, 0.1]);
      expect(material.customProgramCacheKey()).toBe(key);
      expect(material.version).toBe(version);
      expect(shader.vertexShader).toBe(source);
    }
    const second = new MeshPhysicalMaterial();
    applyPlanarCapProjection(
      second,
      new Box3(new Vector3(), new Vector3(2, 3, 1)),
      1,
      1,
    );
    expect(second.customProgramCacheKey()).toBe(key);
    material.dispose();
    second.dispose();
  });
});
