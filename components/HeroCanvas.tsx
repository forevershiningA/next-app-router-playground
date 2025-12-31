'use client';

import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  PerspectiveCamera,
  ContactShadows,
  useTexture,
  Text
} from '@react-three/drei';
import * as THREE from 'three';

// --- Constants ---
const STONE_WIDTH = 2.3;
const STONE_HEIGHT = 2.5;
const STONE_THICKNESS = 0.35;
const SHOULDER_HEIGHT = 2.05;
const BASE_HEIGHT = 0.46;
const BASE_EXTRA_WIDTH = 0.58;
const BEVEL_SIZE = 0.02; // Defined constant for calculation

// --- Materials & Components ---

// 1. Optimized Granite Material
// Added distinct metalness/roughness to look polished but not plastic
const GraniteMaterial = () => {
  // Use suspense-friendly texture loading
  const texture = useTexture('/textures/forever/l/Glory-Black-2.webp');
  
  useMemo(() => {
    if (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(2, 2);
      // Anisotropy improves texture sharpness at oblique angles
      texture.anisotropy = 16; 
    }
  }, [texture]);
  
  return (
    <meshStandardMaterial
      color="#1a1a1a" // Fallback color if texture loads slowly
      map={texture}
      roughness={0.06} // Even more polished for realistic granite
      metalness={0.12}
      envMapIntensity={2.0} // Stronger reflections
      // Add subtle specular highlights
      emissive="#0a0a0a"
      emissiveIntensity={0.05}
    />
  );
};

// 2. New "GoldText" Component
// Creates a metallic gold look with better visibility
interface GoldTextProps {
  text: string;
  position: [number, number, number];
  fontSize: number;
  font?: string;
  fontWeight?: number | string;
}

const GoldText: React.FC<GoldTextProps> = ({ text, position, fontSize, font, fontWeight = 'normal' }) => {
  return (
    <Text
      position={position}
      fontSize={fontSize}
      font={font}
      anchorX="center"
      anchorY="middle"
      letterSpacing={0.02}
      lineHeight={1.2}
      fontWeight={fontWeight}
      // Text quality settings
      characters="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{};':,./<>? "
      outlineWidth={0.008}
      outlineColor="#1a1108"
      outlineOpacity={0.9}
      renderOrder={10}
      // Depth for engraved effect
      fillOpacity={1}
    >
      {text}
      {/* Enhanced Gold Leaf with metallic gradient effect */}
      <meshStandardMaterial
        color="#d4af37"
        emissive="#b8860b"
        emissiveIntensity={0.4}
        roughness={0.15}
        metalness={0.95}
        toneMapped={false}
        // Add slight normal map effect for texture
        envMapIntensity={1.8}
      />
    </Text>
  );
};

// --- Geometry Components ---

interface HeadstoneProps {
  width: number;
  height: number;
  thickness: number;
}

const SerpentineHeadstone: React.FC<HeadstoneProps> = ({ width, height, thickness }) => {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const w2 = width / 2;
    s.moveTo(-w2, 0);
    s.lineTo(-w2, SHOULDER_HEIGHT);
    
    // Serpentine Curve
    s.bezierCurveTo(-w2, height, -w2 / 3, height, 0, height * 0.95);
    s.bezierCurveTo(w2 / 3, height, w2, height, w2, SHOULDER_HEIGHT);

    s.lineTo(w2, 0);
    s.lineTo(-w2, 0);
    return s;
  }, [width, height]);

  const extrudeSettings = useMemo(() => ({
    depth: thickness,
    bevelEnabled: true,
    bevelSegments: 5, // Smoother edges
    bevelSize: BEVEL_SIZE,
    bevelThickness: BEVEL_SIZE,
  }), [thickness]);

  return (
    <group position={[0, BASE_HEIGHT, 0]}>
      <mesh position={[0, 0, -thickness / 2]} castShadow receiveShadow>
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <GraniteMaterial />
      </mesh>
    </group>
  );
};

const Base: React.FC<{ stoneWidth: number }> = ({ stoneWidth }) => {
  const width = stoneWidth + BASE_EXTRA_WIDTH;
  const depth = STONE_THICKNESS + 0.3;

  return (
    <mesh position={[0, BASE_HEIGHT / 2, 0]} castShadow receiveShadow>
      <boxGeometry args={[width, BASE_HEIGHT, depth]} />
      <GraniteMaterial />
    </mesh>
  );
};

// --- Scene Setup ---

interface HeroCanvasProps {
  rotation?: number;
}

const SceneContent = ({ targetRotation }: { targetRotation: number }) => {
  const groupRef = useRef<THREE.Group>(null);
  const lastInteractionTime = useRef(0); // Start at 0 so auto-rotation begins immediately
  const controlsRef = useRef<any>(null);
  
  // State to track if we are currently animating to a specific button click
  const isAnimatingToTarget = useRef(false);
  
  // Get the shared clock from R3F state for synchronized timing
  const { clock } = useThree();
  
  // FIX: Position Z Calculation
  // Thickness/2 (Front Face) + Bevel Thickness + Gap
  const textZ = (STONE_THICKNESS / 2) + BEVEL_SIZE + 0.02;

  // Detect when targetRotation changes (user clicked arrow button)
  React.useEffect(() => {
    isAnimatingToTarget.current = true;
    lastInteractionTime.current = clock.getElapsedTime();
  }, [targetRotation, clock]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    // Handle Forced Animation (Arrow Buttons)
    if (isAnimatingToTarget.current) {
      const step = 0.1;
      const diff = targetRotation - groupRef.current.rotation.y;
      
      // If we are far from target, keep animating
      if (Math.abs(diff) > 0.001) {
        groupRef.current.rotation.y += diff * step;
        lastInteractionTime.current = state.clock.elapsedTime; // Keep resetting timer while moving
      } else {
        // We arrived at the target, stop forced animation
        groupRef.current.rotation.y = targetRotation;
        isAnimatingToTarget.current = false;
      }
      return; // Skip auto-rotation loop this frame
    }

    // Handle Auto-Rotation (Idle)
    const timeSinceInteraction = state.clock.elapsedTime - lastInteractionTime.current;
    const AUTO_ROTATE_DELAY = 3; // Wait 3 seconds after last interaction
    
    if (timeSinceInteraction > AUTO_ROTATE_DELAY) {
      // Gentle auto-rotation (full rotation in ~40 seconds)
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <>
      {/* Rotating Group: Lowered to overlap buttons, compensated for camera distance */}
      <group ref={groupRef} position={[0, -1.2, 0]}>
        <SerpentineHeadstone width={STONE_WIDTH} height={STONE_HEIGHT} thickness={STONE_THICKNESS} />
        <Base stoneWidth={STONE_WIDTH} />
        
        {/* Inscriptions using the new GoldText component */}
        <group position={[0, 0, 0]}>
          <GoldText
            position={[0, BASE_HEIGHT + STONE_HEIGHT * 0.60, textZ]}
            fontSize={0.11}
            text="In Loving Memory"
            font="/fonts/Garamond.ttf"
          />
          
          <GoldText
            position={[0, BASE_HEIGHT + STONE_HEIGHT * 0.50, textZ]}
            fontSize={0.22}
            text="Eleanor Rose"
            font="/fonts/Garamond.ttf"
            fontWeight="bold"
          />
          
          <GoldText
            position={[0, BASE_HEIGHT + STONE_HEIGHT * 0.40, textZ]}
            fontSize={0.11}
            text="☼ 1945   ✟ 2023"
            font="/fonts/Garamond.ttf"
          />
        </group>
      </group>
      
      {/* Enhanced Ground Shadow - More realistic weight and depth */}
      <ContactShadows 
        position={[0, -1.4, 0]}
        opacity={1}
        scale={16}
        blur={2.8}
        far={2.5}
        resolution={1024}
        color="#000000"
      />
      
      {/* OrbitControls with synchronized clock timing */}
      <OrbitControls
        ref={controlsRef}
        enablePan={false}
        enableZoom={false}
        enableRotate={true}
        minPolarAngle={0} 
        maxPolarAngle={Math.PI / 2 - 0.05} 
        enableDamping={true}
        dampingFactor={0.05}
        onChange={() => {
          // User dragged with mouse - reset timer and cancel button animation
          lastInteractionTime.current = clock.getElapsedTime();
          isAnimatingToTarget.current = false;
        }}
      />
    </>
  );
};

// --- Main Component ---

export default function HeroCanvas({ rotation = 0 }: HeroCanvasProps) {
  return (
    // FIX: Removed fixed minHeight to respect parent responsive container (380px/500px)
    <div style={{ width: '100%', height: '100%', margin: '0 auto' }}>
      <Canvas
        key="hero-canvas"
        shadows 
        dpr={[1, 2]}
        gl={{ 
          alpha: true, 
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1
        }} 
        style={{ background: 'transparent' }}
      >
        <React.Suspense fallback={null}>
          {/* Camera moved back to fit full headstone without clipping */}
          <PerspectiveCamera makeDefault position={[0, 0.4, 5.5]} fov={40} />
          
          <ambientLight intensity={0.6} />
          
          {/* Top Edge Highlight - Creates polished top edge effect */}
          <spotLight
            position={[0, 6, 2]}
            angle={0.8}
            penumbra={0.5}
            intensity={1.8}
            color="#ffffff"
            castShadow={false}
          />

          {/* --- RIM LIGHTS (The "Halo" Effect) --- */}
          {/* Left Back Rim - Cool Blue */}
          <spotLight 
            position={[-5, 5, -5]} 
            angle={0.5} 
            intensity={6} 
            color="#a0c0ff" 
            castShadow={false} 
          />

          {/* Right Back Rim - Cool Blue (Balances the shape) */}
          <spotLight 
            position={[5, 5, -5]} 
            angle={0.5} 
            intensity={6} 
            color="#a0c0ff" 
            castShadow={false} 
          />

          {/* --- KEY LIGHT (The Main Front Light) --- */}
          {/* Front Right - Warm/White (Illuminates the Gold Text) */}
          <spotLight 
            position={[3, 5, 5]} 
            angle={0.5} 
            penumbra={1} 
            intensity={4} 
            color="#ffffff" 
            castShadow={true} 
          />

          {/* Main Key Light - Positioned to create depth and dimension */}
          <spotLight 
            position={[8, 8, 8]}
            angle={0.5}
            penumbra={1}
            intensity={1.5}
            castShadow
            shadow-bias={-0.0001}
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            color="#fff5e6"
          />
          
          {/* Fill Light - Softens shadows on front */}
          <pointLight position={[3, 2, 5]} intensity={0.8} color="#e6f2ff" />
          
          {/* Bottom Edge Shadow Helper - Darkens lower edge for weight */}
          <pointLight position={[0, -1, 3]} intensity={0.3} color="#6B5540" />

          {/* Text Highlight Light - Makes gold pop */}
          <pointLight position={[0, 1.5, 3.5]} intensity={1.2} color="#ffd700" distance={7} decay={2} />

          <Environment preset="city" />

          <SceneContent targetRotation={rotation} />
        </React.Suspense>
      </Canvas>
    </div>
  );
}

