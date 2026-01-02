'use client';

import * as THREE from 'three';
import { useMemo } from 'react';

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform vec3 uInnerColor;
  uniform vec3 uOuterColor;
  uniform float uOpacity;
  varying vec2 vUv;

  void main() {
    vec2 centered = (vUv * 2.0) - 1.0;
    float radius = length(centered);
    if (radius > 1.0) discard;

    float angle = atan(centered.y, centered.x);
    float rays = pow(max(0.0, cos(angle * 10.0)), 3.0);
    float falloff = smoothstep(0.95, 0.1, radius);
    float halo = smoothstep(0.8, 0.0, radius);

    float alpha = clamp((rays * 0.75 + halo * 0.25) * falloff * uOpacity, 0.0, 1.0);
    vec3 color = mix(uOuterColor, uInnerColor, smoothstep(0.9, 0.0, radius));

    gl_FragColor = vec4(color, alpha);
  }
`;

export default function SunRays() {
  const uniforms = useMemo(
    () => ({
      uInnerColor: { value: new THREE.Color('#fff8dc') },
      uOuterColor: { value: new THREE.Color('#f2cf95') },
      uOpacity: { value: 0.65 },
    }),
    []
  );

  return (
    <group position={[0, 1.5, -10]}>
      <mesh rotation={[-0.05, 0.15, 0]} scale={[10, 6, 1]} renderOrder={-5}>
        <planeGeometry args={[1, 1, 1, 1]} />
        <shaderMaterial
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={uniforms}
          transparent
          depthWrite={false}
          depthTest
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
