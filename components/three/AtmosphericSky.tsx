// AtmosphericSky.tsx
import * as THREE from 'three';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Clouds, Cloud } from '@react-three/drei';

const SkyMaterial = {
  uniforms: {
    // UPDATED: Rich Sky Blue
    uColorTop: { value: new THREE.Color('#3b93ff') },    
    // UPDATED: Light White/Blue for horizon (blends with fog)
    uColorBottom: { value: new THREE.Color('#dbecf8') }, 
    uSunPosition: { value: new THREE.Vector3(10, 20, 10) },
  },
  vertexShader: `
    varying vec3 vWorldPosition;
    varying vec2 vUv;
    void main() {
      vUv = uv;
      vec4 worldPosition = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPosition.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPosition;
    }
  `,
  fragmentShader: `
    uniform vec3 uColorTop;
    uniform vec3 uColorBottom;
    varying vec3 vWorldPosition;
    varying vec2 vUv;

    void main() {
      vec3 direction = normalize(vWorldPosition);
      float y = direction.y; 

      // Smooth gradient from horizon to zenith
      float t = max(0.0, (y + 0.15) * 0.8);
      t = pow(t, 0.6); // Non-linear curve for more natural horizon

      vec3 color = mix(uColorBottom, uColorTop, t);

      // Add subtle dithering to prevent banding
      float noise = fract(sin(dot(vUv, vec2(12.9898, 78.233))) * 43758.5453);
      color += (noise - 0.5) * 0.01;

      gl_FragColor = vec4(color, 1.0);
    }
  `
};

export default function AtmosphericSky() {
  return (
    <group>
      {/* The Sky Dome */}
      {/* OPTIMIZATION: Reduced segments from 64 to 32 for better performance */}
      <mesh scale={[-1, 1, 1]}>
        <sphereGeometry args={[60, 32, 32]} />
        <shaderMaterial
          attach="material"
          args={[SkyMaterial]}
          side={THREE.BackSide}
        />
      </mesh>

      {/* WHITE FLUFFY CLOUDS */}
      {/* 
        OPTIMIZATION:
        Reduced segments from 40 -> 10. 
        Volumetric clouds are very expensive (fill rate overdraw). 
        Lowering segments makes them render much faster with barely noticeable difference.
      */}
      <Clouds material={THREE.MeshBasicMaterial}>
        <Cloud 
          seed={10} 
          bounds={[50, 6, 50]} 
          segments={10} 
          volume={8} 
          color="#ffffff"
          opacity={0.6} 
          position={[0, 10, -10]} 
          speed={0.1} 
        />
        <Cloud 
          seed={20} 
          bounds={[50, 6, 50]} 
          segments={10} 
          volume={8} 
          color="#ffffff" 
          opacity={0.4} 
          position={[0, 15, 0]} 
          speed={0.05} 
        />
      </Clouds>
    </group>
  );
}
