'use client';
import { OrbitControls, Environment, ContactShadows, useTexture, Sparkles, AdaptiveDpr } from '@react-three/drei';
// REMOVED: EffectComposer & DepthOfField (Causing artifacts)
import * as THREE from 'three';
import HeadstoneAssembly from './headstone/HeadstoneAssembly';
import SunRays from './SunRays';
import AtmosphericSky from './AtmosphericSky';
import { useHeadstoneStore } from '#/lib/headstone-store';

import { useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { useRef, Suspense, useEffect } from 'react';

// --- CONFIGURATION ---
const GRASS_COLOR = '#5a7f3c'; 

// UPDATED: Pale atmospheric blue (matches the horizon, not white)
const FOG_COLOR = '#dcebf5';
const FOG_COLOR_2 = '#ADCCE7'

// --- COMPONENTS ---

// New: Custom Gradient Sky Sphere
// Replaces the realistic atmosphere with a stylized gradient background
const GradientBackground = () => {
  return (
    <mesh scale={[100, 100, 100]} position={[0, -10, 0]} renderOrder={-1}>
      <sphereGeometry args={[1, 64, 64]} />
      <shaderMaterial
        side={THREE.BackSide}
        depthWrite={false} // Draw behind everything
        uniforms={{
          colorTop: { value: new THREE.Color('#5ca0e5') }, // Richer Sky Blue
          colorBottom: { value: new THREE.Color(FOG_COLOR) }, // Matches Fog perfectly
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
            // 0.0 - 0.45: Solid Horizon Color (Fog Color)
            // 0.45 - 1.0: Fades to Sky Blue
            // This ensures the point where grass meets sky is invisible
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
  
  // Load grass textures from local public folder
  // REMOVED: roughnessMap (was causing "wet/blue" reflective look)
  /*
  const props = useTexture({
    map: '/textures/three/leaves/brown_mud_leaves_01_diff_1k.webp',
    normalMap: '/textures/three/leaves/brown_mud_leaves_01_nor_gl_1k.webp',
    aoMap: '/textures/three/leaves/brown_mud_leaves_01_arm_1k.webp',
  });
  */

  const props = useTexture({
    map: '/textures/three/grass/grass_color.webp',
    normalMap: '/textures/three/grass/grass_normal.webp',
    aoMap: '/textures/three/grass/grass_ao.webp',
  });

  // --- TEXTURE FIXES ---
  // UPDATED: Reduced to 40 for better performance while maintaining quality
  const REPEAT_SCALE = 80;

  useEffect(() => {
    // OPTIMIZATION: Cap anisotropy at 8 instead of max (16)
    // Going to 16 is expensive and rarely noticeable on grass
    const anisotropy = Math.min(gl.capabilities.getMaxAnisotropy(), 16);

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
        <planeGeometry args={[105, 105]} />
        <meshStandardMaterial 
          map={props.map}
          normalMap={props.normalMap}
          aoMap={props.aoMap}
          color={GRASS_COLOR}
          roughness={1}
          normalScale={new THREE.Vector2(0.5, 0.5)}
          metalness={0}
          envMapIntensity={0}
          // Important: Floor accepts fog to fade into distance
          fog={false}
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
        <planeGeometry args={[105, 105]} />
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
  currentRotation,
  onReady
}: { 
  targetRotation?: number;
  currentRotation?: React.MutableRefObject<number>;
  onReady?: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const readySignaledRef = useRef(false);
  const is2DMode = useHeadstoneStore((s) => s.is2DMode);
  const baseSwapping = useHeadstoneStore((s) => s.baseSwapping);
  const shapeUrl = useHeadstoneStore((s) => s.shapeUrl);
  const loading = useHeadstoneStore((s) => s.loading);
  const setSelected = useHeadstoneStore((s) => s.setSelected);
  const setEditingObject = useHeadstoneStore((s) => s.setEditingObject);
  const setSelectedInscriptionId = useHeadstoneStore((s) => s.setSelectedInscriptionId);
  const setSelectedAdditionId = useHeadstoneStore((s) => s.setSelectedAdditionId);
  const setSelectedMotifId = useHeadstoneStore((s) => s.setSelectedMotifId);
  const viewportWidth = useThree((state) => state.size.width);
  const isMobileViewport = viewportWidth < 1024;
  const fogSettings = isMobileViewport
    ? { near: 9, far: 24 }
    : { near: 9, far: 48 };

  // Call onReady after the scene finishes loading/swapping
  useEffect(() => {
    if (loading || baseSwapping) {
      readySignaledRef.current = false;
      return;
    }

    if (readySignaledRef.current) {
      return;
    }

    const timer = setTimeout(() => {
      readySignaledRef.current = true;
      onReady?.();
    }, 100);

    return () => clearTimeout(timer);
  }, [loading, baseSwapping, onReady]);

  // Reset camera when scene becomes ready
  const { camera, controls } = useThree();
  useEffect(() => {
    if (!camera || !controls) return;
    
    camera.position.set(0, 4.2, 10);
    camera.lookAt(0, 3.8, 0);
    camera.updateProjectionMatrix();
    
    (controls as any).target.set(0, 3.8, 0);
    (controls as any).update();
  }, [camera, controls]);

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

  const DRAG_DESELECT_THRESHOLD = 4;

  const handleCanvasClick = (e: ThreeEvent<PointerEvent>) => {
    // Ignore drag gestures (OrbitControls rotation/pan)
    if (e.delta > DRAG_DESELECT_THRESHOLD) {
      return;
    }

    // Only deselect if clicking on empty space (not on any 3D object)
    if (e.eventObject === e.object) {
      setSelected(null);
      setEditingObject('headstone');
      setSelectedInscriptionId(null);
      setSelectedAdditionId(null);
      setSelectedMotifId(null);
    }
  };

  const showSunRays = !is2DMode && !loading && !baseSwapping;

  return (
    <>
      {/* OPTIMIZATION: Downgrades quality while moving/rotating to keep 60fps */}
      <AdaptiveDpr pixelated />

      {!is2DMode && <color attach="background" args={['#A8C9E6']} />}
      
      {/* 
        UPDATED FOG SETTINGS:
        Desktop keeps a tight falloff (1 → 4) while mobile/tablet pushes the fog farther out (9 → 24)
        so the headstone stays clear when viewed on smaller screens.
      */}
      {!is2DMode && <fog attach="fog" args={[FOG_COLOR_2, fogSettings.near, fogSettings.far]} />}
      
      <mesh
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={handleCanvasClick}
      >
        <planeGeometry args={[200, 200]} />
        <meshBasicMaterial transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>
      
      <group ref={groupRef}>
        {/* Keep SunRays gated independently so scene geometry doesn't disappear during swaps */}
        {showSunRays && (
          <Suspense fallback={null}>
            <SunRays />
          </Suspense>
        )}

        {/* Headstone content manages its own suspense boundaries internally */}
        <HeadstoneAssembly />
        
        {/* TEXTURED FLOOR with fallback for slow connections */}
        <Suspense fallback={<SimpleGrassFloor />}>
          <GrassFloor />
        </Suspense>
      </group>

      {/* Dust particles */}
      {!is2DMode && (
         <Sparkles
           count={30}
           scale={12}
           size={3}
           speed={0.3}
           opacity={0.4}
           color="#fffee0"
           position={[0, 1, 0]}
         />
      )}
      
      {/* --- LIGHTING (Studio Setup) --- */}
      
      {/* 
         1. AMBIENT: High intensity (1.0).
         This ensures the dark granite is visible everywhere, with NO highlights. 
      */}
      <ambientLight intensity={0.6} color="#ffffff" />
      
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
        ENVIRONMENT: Removed to fix Vercel build timeout
        The forest HDRI preset was causing build to hang (downloads large file)
        Ambient + Hemisphere + Spot lights provide sufficient lighting
      */}
      
      <Environment files="/hdri/spring.hdr" background={false} blur={1.0} resolution={256} environmentIntensity={0.5} />
      
      {!is2DMode && (
        <Suspense fallback={null}>
          <AtmosphericSky showDome={false} />
        </Suspense>
      )}
      {!is2DMode && <GradientBackground />}

      {/* REMOVED EffectComposer/DepthOfField to restore sharpness */}

      <OrbitControls
        makeDefault
        enabled={!baseSwapping && !loading}
        enableDamping={true}
        dampingFactor={baseSwapping || loading ? 0 : 0.05}
        enableRotate={!is2DMode}
        enableZoom={!is2DMode}
        enablePan={!is2DMode}
        rotateSpeed={0.5}
        zoomSpeed={0.8}
        panSpeed={0.8}
        minPolarAngle={Math.PI / 3.5}
        maxPolarAngle={Math.PI / 2 - 0.05} // Prevent camera going below ground
        target={[0, 3.8, 0]}
      />
    </>
  );
}
