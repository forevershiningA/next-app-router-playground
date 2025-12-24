'use client';
import { OrbitControls, Environment, ContactShadows, useTexture, Sparkles, AdaptiveDpr } from '@react-three/drei';
import * as THREE from 'three';
import HeadstoneAssembly from './headstone/HeadstoneAssembly';
import AtmosphericSky from './AtmosphericSky';
import { useHeadstoneStore } from '#/lib/headstone-store';

import { useFrame, useThree } from '@react-three/fiber';
import { useRef, Suspense, useEffect } from 'react';

// --- CONFIGURATION ---
// UPDATED: Natural earthy green. Not neon, not white.
const GRASS_COLOR = '#5a7f3c'; 
const FOG_COLOR = '#e8e8e8';

function GrassFloor() {
  const gl = useThree((state) => state.gl);
  
  // Load grass textures from local public folder
  // REMOVED: roughnessMap (was causing "wet/blue" reflective look)
  const props = useTexture({
    map: '/textures/grass_color.jpg',
    normalMap: '/textures/grass_normal.jpg',
    aoMap: '/textures/grass_ao.jpg',
  });

  // --- TEXTURE FIXES ---
  // UPDATED: Reduced to 40 for better performance while maintaining quality
  const REPEAT_SCALE = 40;

  useEffect(() => {
    // OPTIMIZATION: Cap anisotropy at 8 instead of max (16)
    // Going to 16 is expensive and rarely noticeable on grass
    const anisotropy = Math.min(gl.capabilities.getMaxAnisotropy(), 8);

    [props.map, props.normalMap, props.aoMap].forEach((tex) => {
      if (tex) {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping; // Changed from Mirrored for organic textures
        tex.repeat.set(REPEAT_SCALE, REPEAT_SCALE);
        tex.colorSpace = THREE.SRGBColorSpace;
        
        // CRITICAL: Anisotropy fixes blur when looking at ground from an angle
        tex.anisotropy = anisotropy;
        tex.needsUpdate = true;
      }
    });
  }, [props, gl]);

  return (
    <group position={[0, -0.01, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[150, 150]} />
        <meshStandardMaterial 
          map={props.map}
          normalMap={props.normalMap}
          aoMap={props.aoMap}
          color={GRASS_COLOR}
          roughness={1}
          normalScale={new THREE.Vector2(0.5, 0.5)}
          metalness={0}
          envMapIntensity={0}
          fog={true}
        />
      </mesh>
      
      {/* Contact Shadow: Anchors the headstone */}
      {/* OPTIMIZATION: Reduced resolution and set frames={1} to bake shadow once */}
      <ContactShadows
        position={[0, 0.02, 0]}
        scale={15}
        blur={2.5}
        opacity={0.5}
        far={1.5}
        color="#001100"
        resolution={256}
        frames={1}
      />
    </group>
  );
}

// Fallback if internet is slow/textures fail
function SimpleGrassFloor() {
  return (
    <group position={[0, -0.01, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[150, 150]} />
        <meshStandardMaterial 
          color="#355c18"
          roughness={1}
          metalness={0}
          envMapIntensity={0}
        />
      </mesh>
      <ContactShadows position={[0, 0.02, 0]} scale={15} blur={2.5} opacity={0.6} far={1.5} color="#001100" resolution={256} frames={1} />
    </group>
  );
}

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
      {/* OPTIMIZATION: Downgrades quality while moving/rotating to keep 60fps */}
      <AdaptiveDpr pixelated />

      {is2DMode && <color attach="background" args={['#CFE8FC']} />}
      
      {/* Fog: Neutral warm grey prevents blue tint in distance */}
      {!is2DMode && <fog attach="fog" args={[FOG_COLOR, 50, 150]} />}
      
      {/* Invisible ground plane to capture clicks - only at ground level */}
      <mesh
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={handleCanvasClick}
      >
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>
      
      {/* Dust particles */}
      {!is2DMode && (
         <Sparkles 
           count={30}
           scale={12}
           size={3}
           speed={0.3}
           opacity={0.4}
           color="#fffee0"
           position={[0, 2, 0]}
         />
      )}
      
      {/* --- LIGHTING (Studio Setup) --- */}
      
      {/* 
         1. AMBIENT: High intensity (1.0).
         This ensures the dark granite is visible everywhere, with NO highlights. 
      */}
      <ambientLight intensity={1.0} color="#ffffff" />
      
      {/* 
         2. HEMISPHERE: Strong bounce.
         Reflects light from the "ground" up onto the vertical face.
      */}
      <hemisphereLight
        args={['#fff8e7', '#dcdcdc']}
        intensity={0.8}
      />
      
      {/* 
         3. KEY LIGHT (Sun):
         Moved Higher (Y=12) and Left (X=-10).
         This moves the specular reflection ("The Glow") to the top-left corner,
         keeping the main text area clear.
      */}
      <spotLight 
        color="#fffce6"
        intensity={1.8}
        angle={0.6}
        penumbra={1}
        position={[-10, 12, 12]}
        castShadow
        shadow-bias={-0.0001}
        shadow-mapSize={[1024, 1024]}
      />

      {/* 
         REMOVED: DirectionalLight (Face Fill).
         This was causing the "Big Light Glow" in the center.
         We rely on Ambient+Hemisphere for fill now.
      */}

      {/* Rim light (Back Right) - Separates stone from background */}
      <spotLight color="#ffffff" intensity={2} position={[5, 5, -5]} distance={30} />

      {/* 
        ENVIRONMENT:
        City preset with max blur (1.0) creates abstract light/dark patches.
        resolution={256} saves download and processing (we blur it anyway).
        environmentIntensity={0.5} provides balanced reflections.
        Blocked from grass via envMapIntensity={0}
      */}
      <Environment
        preset="city"
        background={false}
        blur={1.0}
        resolution={256}
        environmentIntensity={0.6}
      />

      <group ref={groupRef}>
        <HeadstoneAssembly />
        
        {/* TEXTURED FLOOR with fallback for slow connections */}
        <Suspense fallback={<SimpleGrassFloor />}>
          <GrassFloor />
        </Suspense>
      </group>
      
      {/* Sky doesn't rotate - stays stationary */}
      {!is2DMode && <AtmosphericSky />}

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
        minPolarAngle={Math.PI / 3.5}
        maxPolarAngle={Math.PI / 2 - 0.05} // Prevent camera going below ground
      />
    </>
  );
}
