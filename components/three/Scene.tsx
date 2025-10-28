'use client';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import HeadstoneAssembly from './headstone/HeadstoneAssembly';
import { useHeadstoneStore } from '#/lib/headstone-store';
import {
  SKY_TOP_COLOR,
  SKY_BOTTOM_COLOR,
  GRASS_DARK_COLOR,
  GRASS_LIGHT_COLOR,
} from '#/lib/headstone-constants';

export default function Scene() {
  const is2DMode = useHeadstoneStore((s) => s.is2DMode);
  const baseSwapping = useHeadstoneStore((s) => s.baseSwapping);

  return (
    <>
      {/* Sophisticated sky with atmospheric effects */}
      <mesh scale={[100, 100, 100]}>
        <sphereGeometry args={[1, 32, 32]} />
        <shaderMaterial
          side={THREE.BackSide}
          uniforms={{
            uTime: { value: 0 }
          }}
          vertexShader={`
            varying vec3 vPosition;
            varying vec3 vWorldPosition;
            
            void main() {
              vPosition = position;
              vec4 worldPosition = modelMatrix * vec4(position, 1.0);
              vWorldPosition = worldPosition.xyz;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            uniform float uTime;
            varying vec3 vPosition;
            varying vec3 vWorldPosition;
            
            // Noise function for clouds
            float hash(vec3 p) {
              p = fract(p * 0.3183099 + 0.1);
              p *= 17.0;
              return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
            }
            
            float noise(vec3 x) {
              vec3 i = floor(x);
              vec3 f = fract(x);
              f = f * f * (3.0 - 2.0 * f);
              
              return mix(
                mix(mix(hash(i + vec3(0, 0, 0)), hash(i + vec3(1, 0, 0)), f.x),
                    mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), f.x), f.y),
                mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), f.x),
                    mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), f.x), f.y),
                f.z
              );
            }
            
            void main() {
              vec3 direction = normalize(vPosition);
              float h = direction.y;
              
              // Sky colors
              vec3 topColor = vec3(0.3, 0.5, 0.95);        // Deeper blue at zenith
              vec3 horizonColor = vec3(0.8, 0.85, 0.95);   // Lighter blue near horizon
              vec3 sunsetGlow = vec3(1.0, 0.95, 0.85);     // Warm glow at horizon
              
              // Base gradient with atmospheric perspective
              float horizonFade = smoothstep(-0.1, 0.3, h);
              vec3 skyColor = mix(horizonColor, topColor, horizonFade);
              
              // Add warm glow near horizon
              float glowStrength = smoothstep(0.3, -0.1, h) * 0.4;
              skyColor = mix(skyColor, sunsetGlow, glowStrength);
              
              // Subtle clouds
              float cloudNoise = noise(direction * 8.0 + vec3(uTime * 0.02, 0.0, 0.0));
              cloudNoise += noise(direction * 16.0 + vec3(uTime * 0.03, 0.0, 0.0)) * 0.5;
              cloudNoise /= 1.5;
              
              // Only show clouds in upper sky
              float cloudMask = smoothstep(-0.05, 0.2, h) * smoothstep(1.0, 0.4, h);
              float cloudStrength = smoothstep(0.45, 0.65, cloudNoise) * cloudMask * 0.25;
              
              vec3 cloudColor = vec3(1.0, 1.0, 1.0);
              skyColor = mix(skyColor, cloudColor, cloudStrength);
              
              // Subtle color variation
              float colorNoise = noise(direction * 3.0) * 0.05;
              skyColor += colorNoise;
              
              gl_FragColor = vec4(skyColor, 1.0);
            }
          `}
        />
      </mesh>

      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />
      <directionalLight position={[-3, 4, -3]} intensity={0.4} />
      <hemisphereLight
        color={0xffffff}
        groundColor={0x444444}
        intensity={0.5}
      />
      
      {/* Environment map for reflections */}
      <Environment
        background={false}
        preset="sunset"
        environmentIntensity={0.6}
      />

      <HeadstoneAssembly />

      <OrbitControls
        makeDefault
        enabled={!baseSwapping}
        enableDamping={true}
        dampingFactor={baseSwapping ? 0 : 0.05}
        enableRotate={!is2DMode}
        enableZoom={!is2DMode}
        enablePan={!is2DMode}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
        panSpeed={0.8}
      />
    </>
  );
}
