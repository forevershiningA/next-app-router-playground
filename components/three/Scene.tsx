'use client';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';
import HeadstoneAssembly from './headstone/HeadstoneAssembly';
import SkyShader from './SkyShader';
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
      {!is2DMode && <SkyShader />}
      
      {is2DMode && <color attach="background" args={['#CFE8FC']} />}
      
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[5, 8, 5]} 
        intensity={1.2} 
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <directionalLight position={[-3, 4, -3]} intensity={0.4} />
      <hemisphereLight
        color={0xffffff}
        groundColor={0x444444}
        intensity={0.5}
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
        maxPolarAngle={Math.PI / 2}
      />
    </>
  );
}
