// AtmosphericSky.tsx
import * as THREE from 'three';
import { Clouds, Cloud } from '@react-three/drei';

const CLOUD_EMISSIVE = new THREE.Color('#ffffff');

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
};

export default function AtmosphericSky({ showDome = false }: AtmosphericSkyProps) {
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

      {/* WHITE FLUFFY CLOUDS */}
      {/* 
        OPTIMIZATION:
        Reduced segments from 40 -> 10. 
        Volumetric clouds are very expensive (fill rate overdraw). 
        Lowering segments makes them render much faster with barely noticeable difference.
      */}
      <Clouds
        material={THREE.MeshStandardMaterial}
        materialProps={{
          transparent: true,
          depthWrite: false,
          depthTest: false,
          toneMapped: false,
          color: '#ffffff',
          opacity: 0.98,
          emissive: CLOUD_EMISSIVE,
          emissiveIntensity: 0.45,
        }}
      >
        <Cloud 
          seed={10} 
          bounds={[60, 8, 60]} 
          segments={18} 
          volume={11} 
          color="#ffffff"
          opacity={0.92} 
          position={[0, 11, -8]} 
          speed={0.12} 
        />
        <Cloud 
          seed={24} 
          bounds={[55, 7, 55]} 
          segments={18} 
          volume={10} 
          color="#ffffff" 
          opacity={0.72} 
          position={[10, 12.5, -1]} 
          speed={0.08} 
        />
        <Cloud 
          seed={31} 
          bounds={[42, 5, 42]} 
          segments={16} 
          volume={8} 
          color="#ffffff" 
          opacity={0.62} 
          position={[-12, 11, 6]} 
          speed={0.09} 
        />
        <Cloud 
          seed={44} 
          bounds={[48, 6, 48]} 
          segments={16} 
          volume={9} 
          color="#ffffff" 
          opacity={0.58} 
          position={[4, 10.5, 8]} 
          speed={0.11} 
        />
        <Cloud 
          seed={57} 
          bounds={[35, 5, 35]} 
          segments={14} 
          volume={7} 
          color="#ffffff" 
          opacity={0.5} 
          position={[-6, 13.5, -5]} 
          speed={0.06} 
        />
      </Clouds>
    </group>
  );
}
