'use client';
import { OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import HeadstoneAssembly from './headstone/HeadstoneAssembly';
import { useHeadstoneStore } from '#/lib/headstone-store';

export default function Scene() {
  const is2DMode = useHeadstoneStore((s) => s.is2DMode);
  const loading = useHeadstoneStore((s) => s.loading);
  const baseSwapping = useHeadstoneStore((s) => s.baseSwapping);

  return (
    <>
      {/* Simple gradient sky */}
      <mesh scale={[100, 100, 100]}>
        <sphereGeometry args={[1, 32, 32]} />
        <shaderMaterial
          side={THREE.BackSide}
          vertexShader={`
            varying vec3 vPosition;
            void main() {
              vPosition = position;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            varying vec3 vPosition;
            void main() {
              float h = normalize(vPosition).y;
              vec3 topColor = vec3(0.4, 0.7, 1.0);    // Light blue at top
              vec3 bottomColor = vec3(0.7, 0.9, 1.0);  // Lighter blue at horizon
              vec3 color = mix(bottomColor, topColor, smoothstep(-0.2, 0.8, h));
              gl_FragColor = vec4(color, 1.0);
            }
          `}
        />
      </mesh>

      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 6, 3]} intensity={1} castShadow />

      <HeadstoneAssembly />

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        position={[0, -0.001, 0]}
      >
        <planeGeometry args={[40, 40]} />
        <shaderMaterial
          vertexShader={`
            varying vec3 vPosition;
            void main() {
              vPosition = position;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            varying vec3 vPosition;

            void main() {
              vec3 darkGrass = vec3(0.3, 0.5, 0.2);   // Dark green
              vec3 lightGrass = vec3(0.4, 0.6, 0.3);  // Light green

              // Create distance-based gradient (closer = lighter)
              float dist = length(vPosition.xz);
              float gradient = smoothstep(0.0, 20.0, dist);

              vec3 color = mix(lightGrass, darkGrass, gradient);

              gl_FragColor = vec4(color, 1.0);
            }
          `}
        />
      </mesh>

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
