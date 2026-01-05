'use client';
import { OrbitControls, Environment, ContactShadows, useTexture } from '@react-three/drei';
// REMOVED: EffectComposer & DepthOfField (Causing artifacts)
import * as THREE from 'three';
import HeadstoneAssembly from './headstone/HeadstoneAssembly';
import SunRays from './SunRays';
import AtmosphericSky from './AtmosphericSky';
import { useHeadstoneStore } from '#/lib/headstone-store';

import { useFrame, useThree } from '@react-three/fiber';
import { useRef, Suspense, useEffect } from 'react';

// --- CONFIGURATION ---
const GRASS_COLOR = '#5a7f3c'; 

// UPDATED: Soft peach/gold horizon color for peaceful, sunlit meadow
const HORIZON_COLOR = '#e3cba5'; // Soft Peach/Gold - creates seamless infinite field

// --- COMPONENTS ---

// New: Custom Gradient Sky Sphere
// Golden Hour gradient with seamless horizon blend
const GradientBackground = () => {
  return (
    <mesh scale={[100, 100, 100]} position={[0, -10, 0]} renderOrder={-1}>
      <sphereGeometry args={[1, 64, 64]} />
      <shaderMaterial
        side={THREE.BackSide}
        depthWrite={false} // Draw behind everything
        uniforms={{
          colorTop: { value: new THREE.Color('#8FABD6') }, // Soft, calming blue
          colorBottom: { value: new THREE.Color(HORIZON_COLOR) }, // Warm, dusty gold - matches fog
        }}
        vertexShader={`
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform vec3 colorTop;
          uniform vec3 colorBottom;
          varying vec2 vUv;
          void main() {
            // Gradient Logic:
            // 0.0 - 0.45: Solid Horizon Color (Soft Peach/Gold)
            // 0.45 - 1.0: Fades to Soft Calming Blue
            // Seamless blend - peaceful sunlit meadow
            float h = smoothstep(0.45, 1.0, vUv.y);
            gl_FragColor = vec4(mix(colorBottom, colorTop, h), 1.0);
          }
        `}
      />
    </mesh>
  );
};

function GrassFloor() {
  const gl = useThree((state) => state.gl);
  
  const props = useTexture({
    map: '/textures/three/grass/grass_color.webp',
    normalMap: '/textures/three/grass/grass_normal.webp',
    aoMap: '/textures/three/grass/grass_ao.webp',
  });

  // --- CONFIGURATION ---
  const FLOOR_SIZE = 1000; // Massive floor - fog hides corners at 90 units
  // CRITICAL: High repeat (300) makes texture tiny and sharp - no pixelation
  const REPEAT_COUNT = 300; 

  useEffect(() => {
    const maxAnisotropy = gl.capabilities.getMaxAnisotropy();

    [props.map, props.normalMap, props.aoMap].forEach((tex) => {
      if (tex) {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(REPEAT_COUNT, REPEAT_COUNT);
        tex.colorSpace = THREE.SRGBColorSpace;
        
        // Ensure filters are set for maximum sharpness
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        
        tex.anisotropy = maxAnisotropy;
        tex.needsUpdate = true;
      }
    });
  }, [props, gl]);

  return (
    <group position={[0, -0.01, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        {/* PlaneGeometry for perfect texture tiling (no UV warping like Circle) */}
        <planeGeometry args={[FLOOR_SIZE, FLOOR_SIZE]} />
        <meshStandardMaterial 
          map={props.map}
          normalMap={props.normalMap}
          aoMap={props.aoMap}
          color={GRASS_COLOR}
          roughness={1} // High roughness prevents "wet" look
          metalness={0}
          normalScale={new THREE.Vector2(0.8, 0.8)}
          envMapIntensity={0}
          fog={true}
        />
      </mesh>
      
      {/* Contact Shadows: Anchor the headstone */}
      <ContactShadows 
        position={[0, 0.02, 0]} 
        scale={8} 
        blur={2} 
        opacity={0.7} 
        far={0.25} 
        color="#000000" 
        resolution={256} 
        frames={1} 
      />
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
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial 
          color="#355c18"
          roughness={1}
          metalness={0}
          envMapIntensity={0}
          fog={true}
        />
      </mesh>
      <ContactShadows 
        position={[0, 0.02, 0]} 
        scale={8} 
        blur={2} 
        opacity={0.7} 
        far={0.25} 
        color="#000000" 
        resolution={256} 
        frames={1} 
      />
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
  const viewportWidth = useThree((state) => state.size.width);
  const isMobileViewport = viewportWidth < 1024;
  
  // UPDATED: Optimized fog for 500-radius circular floor
  // Floor extends to 500 units, fog reaches 100% at 90 units
  // This ensures world fades to solid color long before floor edge
  // near: 20 keeps headstone and immediate area crisp
  // far: 90 creates seamless infinite meadow (5x before floor edge at 500)
  const fogSettings = isMobileViewport
    ? { near: 20, far: 90 }
    : { near: 20, far: 90 };

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
      {/* REMOVED: AdaptiveDpr - was causing pixelation by lowering resolution
          Scene now always renders at full quality for crisp grass textures */}

      {!is2DMode && <color attach="background" args={['#A8C9E6']} />}
      
      {/* 
        PERFECT FOG SETTINGS:
        Circular floor radius: 500 units
        Fog far: 90 units (5.5x before edge)
        Result: World fades to horizon color long before geometry ends
        No sharp edges ever visible - truly infinite field
      */}
      {!is2DMode && <fog attach="fog" args={[HORIZON_COLOR, fogSettings.near, fogSettings.far]} />}
      
      <mesh
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={handleCanvasClick}
      >
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>
      
      {!is2DMode && <SunRays />}

      {/* REMOVED: Sparkles (dust particles) for cleaner, professional look.
          Floating particles can look like visual noise or glitches in a product configurator. */}
      
      {/* --- LIGHTING (Studio Setup) --- */}
      
      {/* 
         1. AMBIENT: Lowered to 0.3 to create depth and shadows.
         This allows crevices to be dark and makes the stone look 3D instead of flat.
         Higher ambient (1.0) was making everything look like a 2D sticker.
      */}
      <ambientLight intensity={0.3} color="#ffffff" />
      
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
         Warmer sun color (#fff5d1) and increased intensity (2.5).
         Moved Higher (Y=12) and Left (X=-10) to keep specular glow away from text.
      */}
      <spotLight 
        color="#fff5d1"
        intensity={2.5}
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
        ENVIRONMENT: Increased intensity to 0.8 for better reflections on polished stone.
        This makes the gold engraving pop and the granite look more realistic.
      */}
      
      <Environment files="/hdri/spring.hdr" background={false} blur={1.0} resolution={256} environmentIntensity={0.8} />

      <group ref={groupRef}>
        <HeadstoneAssembly />
        
        {/* TEXTURED FLOOR with fallback for slow connections */}
        <Suspense fallback={<SimpleGrassFloor />}>
          <GrassFloor />
        </Suspense>
      </group>
      
      {!is2DMode && (
        <Suspense fallback={null}>
          <AtmosphericSky showDome={false} />
        </Suspense>
      )}
      {!is2DMode && <GradientBackground />}

      {/* REMOVED EffectComposer/DepthOfField to restore sharpness */}

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
