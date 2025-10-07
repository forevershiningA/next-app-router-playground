'use client';
import { OrbitControls } from '@react-three/drei';
import HeadstoneAssembly from './headstone/HeadstoneAssembly';
import { useHeadstoneStore } from '#/lib/headstone-store';

export default function Scene() {
  const is2DMode = useHeadstoneStore((s) => s.is2DMode);

  return (
    <>
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 6, 3]} intensity={1} castShadow />

      <HeadstoneAssembly />

      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        position={[0, -0.001, 0]}
      >
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#9faf3f" />
      </mesh>

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        enableRotate={!is2DMode}
        enableZoom={!is2DMode}
        enablePan={!is2DMode}
      />
    </>
  );
}
