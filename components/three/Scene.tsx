'use client';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
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

import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';

export default function Scene({ 
  targetRotation = 0,
  currentRotation
}: { 
  targetRotation?: number;
  currentRotation?: React.MutableRefObject<number>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const is2DMode = useHeadstoneStore((s) => s.is2DMode);
  const baseSwapping = useHeadstoneStore((s) => s.baseSwapping);
  const setSelected = useHeadstoneStore((s) => s.setSelected);
  const setEditingObject = useHeadstoneStore((s) => s.setEditingObject);
  const setSelectedInscriptionId = useHeadstoneStore((s) => s.setSelectedInscriptionId);
  const setSelectedAdditionId = useHeadstoneStore((s) => s.setSelectedAdditionId);
  const setSelectedMotifId = useHeadstoneStore((s) => s.setSelectedMotifId);

  // Smooth rotation animation
  useFrame(() => {
    if (groupRef.current && currentRotation) {
      const diff = targetRotation - currentRotation.current;
      const delta = diff * 0.1; // Lerp factor (adjust for speed)
      
      if (Math.abs(diff) > 0.001) {
        currentRotation.current += delta;
        groupRef.current.rotation.y = currentRotation.current;
      }
    }
  });

  const handleCanvasClick = (e: any) => {
    // Only deselect if clicking on empty space (not on any 3D object)
    if (e.eventObject === e.object) {
      setSelected(null);
      setEditingObject('headstone');
      setSelectedInscriptionId(null);
      setSelectedAdditionId(null);
      setSelectedMotifId(null);
    }
  };

  return (
    <>
      {/* Disable Sky Shader for transparent background */}
      {/* {!is2DMode && <SkyShader />} */}
      
      {is2DMode && <color attach="background" args={['#CFE8FC']} />}
      
      {/* Invisible background plane to capture clicks */}
      <mesh
        position={[0, 0, -5]}
        onClick={handleCanvasClick}
      >
        <planeGeometry args={[100, 100]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
      
      {/* Hero canvas style lighting */}
      <ambientLight intensity={0.3} />
      <spotLight 
        position={[5, 5, 5]} 
        angle={0.5} 
        penumbra={1} 
        intensity={1} 
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <pointLight position={[-2, 3, 2]} intensity={0.5} color="#badbff" />
      
      {/* Environment map for realistic reflections on polished granite */}
      <Environment 
        preset="city" 
        environmentIntensity={1.5}
      />

      <group ref={groupRef}>
        <HeadstoneAssembly />
      </group>
      
      {/* Contact shadows like Hero canvas */}
      <ContactShadows
        opacity={0.6} 
        scale={10} 
        blur={2} 
        far={2} 
        resolution={256} 
        color="#000000" 
      />

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
