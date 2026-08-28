'use client';

import * as THREE from 'three';
import { useMemo, useRef } from 'react';

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
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vec2 centered = (vUv * 2.0) - 1.0;
    float radius = length(centered);
    if (radius > 1.0) discard;

    float angle = atan(centered.y, centered.x);

    // Per-ray pulsing: phase rays independently using angle as offset
    float rayPhase = sin(uTime * 1.5 + angle * 4.5);
    float rayPulse = mix(0.45, 1.15, 0.5 + 0.5 * rayPhase);

    // Fewer, broader rays read as one sunlight direction instead of a UI burst.
    float rayMask = max(0.0, cos(angle * 10.0));
    float rays = smoothstep(0.12, 0.94, rayMask) * rayPulse;

    // Subtle breathing for the halo / gradient
    float haloWave = 0.65 + 0.35 * sin(uTime * 0.9 + radius * 4.0);
    float falloff = smoothstep(0.95, 0.1, radius);
    float halo = smoothstep(0.8, 0.0, radius) * haloWave;

    float alpha = clamp((rays * 0.48 + halo * 0.34) * falloff * uOpacity, 0.0, 1.0);
    vec3 color = mix(uOuterColor, uInnerColor, smoothstep(0.9, 0.0, radius));

    gl_FragColor = vec4(color, alpha);
  }
`;

export default function SunRays() {
  const uniforms = useMemo(
    () => ({
      uInnerColor: { value: new THREE.Color('#fff8dc') },
      uOuterColor: { value: new THREE.Color('#f3d8a8') },
      uOpacity: { value: 0.18 },
      uTime: { value: 0 },
    }),
    []
  );

  const materialRef = useRef<THREE.ShaderMaterial | null>(null);

  return (
    <group position={[3.5, 4.6, -6]}>
      <mesh rotation={[-0.05, 0.15, 0]} scale={[18, 8, 1]} renderOrder={10}>
        <planeGeometry args={[1, 1, 1, 1]} />
        <shaderMaterial
          ref={materialRef}
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
