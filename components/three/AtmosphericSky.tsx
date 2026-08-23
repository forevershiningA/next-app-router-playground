// AtmosphericSky.tsx
import * as THREE from 'three';
import { Clouds, Cloud } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';

const SkyMaterial = {
  uniforms: {
    // UPDATED: Rich Sky Blue
    uColorTop: { value: new THREE.Color('#3b93ff') },    
    // UPDATED: Light White/Blue for horizon (blends with fog)
    uColorBottom: { value: new THREE.Color('#dbecf8') }, 
    uSunPosition: { value: new THREE.Vector3(10, 30, 10) },
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

type AtmosphericSkyProps = {
  showDome?: boolean;
  cloudColor?: string;
  compact?: boolean;
};

export default function AtmosphericSky({
  showDome = false,
  cloudColor = '#ffffff',
  compact = false,
}: AtmosphericSkyProps) {
  const invalidate = useThree((state) => state.invalidate);

  // Clouds fill their instanced mesh in a frame callback. The main canvas is
  // demand-rendered, so schedule one follow-up frame after mount; otherwise
  // the first captured frame can contain only empty cloud instances.
  useEffect(() => {
    const firstFrame = requestAnimationFrame(() => {
      invalidate();
      requestAnimationFrame(invalidate);
    });
    return () => cancelAnimationFrame(firstFrame);
  }, [invalidate]);

  return (
    <group>
      {/* The Sky Dome */}
      {/* OPTIMIZATION: Reduced segments from 64 to 32 for better performance */}
      {showDome && (
        <mesh scale={[-1, 1, 1]}>
          <sphereGeometry args={[60, 32, 32]} />
          <shaderMaterial
            attach="material"
            args={[SkyMaterial]}
            side={THREE.BackSide}
          />
        </mesh>
      )}

      {/* FLUFFY CLOUDS — colour tinted by scene variant */}
      {/* 
        OPTIMIZATION:
        Reduced segments from 40 -> 10. 
        Volumetric clouds are very expensive (fill rate overdraw). 
        Lowering segments makes them render much faster with barely noticeable difference.
      */}
      <Clouds
        material={THREE.MeshStandardMaterial}
        texture="/three-assets/cloud.png"
      >
        <Cloud
          seed={10} 
          bounds={[26, 0.75, 16]}
          segments={compact ? 8 : 18}
          volume={7.5}
          color={cloudColor}
          opacity={0.76}
          fade={35}
          position={[-12, 4.3, -22]}
          speed={0.05}
        />
        <Cloud 
          seed={24} 
          bounds={[22, 0.65, 14]}
          segments={compact ? 8 : 18}
          volume={6.6}
          color={cloudColor} 
          opacity={0.58}
          fade={35}
          position={[13, 4.45, -26]}
          speed={0.035}
        />
        {!compact && <Cloud
          seed={31} 
          bounds={[18, 0.55, 12]}
          segments={16} 
          volume={5.5}
          color={cloudColor} 
          opacity={0.44}
          fade={35}
          position={[-24, 4.15, -18]}
          speed={0.04}
        />}
        {!compact && <Cloud
          seed={44} 
          bounds={[20, 0.6, 12]}
          segments={16} 
          volume={5.8}
          color={cloudColor} 
          opacity={0.4}
          fade={35}
          position={[22, 4.25, -20]}
          speed={0.04}
        />}
        {!compact && <Cloud
          seed={57} 
          bounds={[16, 0.45, 10]}
          segments={14} 
          volume={4.8}
          color={cloudColor} 
          opacity={0.3}
          fade={35}
          position={[0, 4.55, -32]}
          speed={0.025}
        />}
      </Clouds>
    </group>
  );
}
