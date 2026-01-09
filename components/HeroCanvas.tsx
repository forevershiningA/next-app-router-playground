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
const STONE_WIDTH = 2.55; 
const STONE_HEIGHT = 2.55; 
const STONE_THICKNESS = 0.44;
const BASE_HEIGHT = 0.46;
const BASE_EXTRA_WIDTH = 0.58;
const BEVEL_SIZE = 0.02;

// --- Materials & Components ---

// 1. Optimized Granite Material
const GraniteMaterial = () => {
  const texture = useTexture('/textures/forever/l/Glory-Black-2.webp');
  
  useMemo(() => {
    if (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(2, 2);
      texture.anisotropy = 16; 
    }
  }, [texture]);
  
  return (
    <meshStandardMaterial
      color="#1a1a1a"
      map={texture}
      roughness={0.06}
      metalness={0.12}
      envMapIntensity={2.0}
      emissive="#0a0a0a"
      emissiveIntensity={0.05}
    />
  );
};

// 2. GoldText Component
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
      characters="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{};':,./<>? "
      outlineWidth={0.008}
      outlineColor="#1a1108"
      outlineOpacity={0.9}
      renderOrder={10}
      fillOpacity={1}
    >
      {text}
      <meshStandardMaterial
        color="#d4af37"
        emissive="#b8860b"
        emissiveIntensity={0.4}
        roughness={0.15}
        metalness={0.95}
        toneMapped={false}
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

const HeartHeadstone: React.FC<HeadstoneProps> = ({ width, height, thickness }) => {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const w2 = width / 2;
    const h = height;
    
    // Stand dimensions
    const baseW = 0.35; 
    const footH = 0.05; 
    
    // Width Multiplier: 
    // Increased from 1.0 to 1.12 to push the sides out, making the top wider
    const wMult = 1.12; 
    const wideX = w2 * wMult;

    // Start at bottom-left of the foot
    s.moveTo(-baseW, 0);
    s.lineTo(-baseW, footH);

    // Left Side of Heart (Bottom to Wide Side)
    // Adjusted control points to flare out wider
    s.bezierCurveTo(
      -w2 * 0.8, h * 0.15, 
      -wideX,    h * 0.5,  // Pushed out
      -wideX,    h * 0.65  // Pushed out
    );

    // Left Side Top Lobe -> Center Dip
    // Adjusted control points to support the wider top
    s.bezierCurveTo(
      -wideX,     h * 0.98, // CP1: Stays wide
      -w2 * 0.45, h * 1.05, // CP2: Shifted outward (from 0.3 to 0.45) for fuller lobes
      0,          h * 0.87  // End: Sharp center dip
    );

    // Right Side Top Lobe -> Wide Side (Mirrored)
    s.bezierCurveTo(
      w2 * 0.45,  h * 1.05,
      wideX,      h * 0.98,
      wideX,      h * 0.65
    );

    // Right Side (Wide Side to Bottom)
    s.bezierCurveTo(
      wideX,     h * 0.5,
      w2 * 0.8,  h * 0.15,
      baseW,     footH
    );
    
    // Right foot and close
    s.lineTo(baseW, 0);
    s.lineTo(-baseW, 0);

    return s;
  }, [width, height]);

  const extrudeSettings = useMemo(() => ({
    depth: thickness,
    bevelEnabled: true,
    bevelSegments: 8,
    bevelSize: BEVEL_SIZE,
    bevelThickness: BEVEL_SIZE,
    curveSegments: 48
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
  const lastInteractionTime = useRef(0);
  const controlsRef = useRef<any>(null);
  const isAnimatingToTarget = useRef(false);
  
  const { clock } = useThree();
  
  const textZ = (STONE_THICKNESS / 2) + BEVEL_SIZE + 0.02;

  React.useEffect(() => {
    isAnimatingToTarget.current = true;
    lastInteractionTime.current = clock.getElapsedTime();
  }, [targetRotation, clock]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (isAnimatingToTarget.current) {
      const step = 0.1;
      const diff = targetRotation - groupRef.current.rotation.y;
      
      if (Math.abs(diff) > 0.001) {
        groupRef.current.rotation.y += diff * step;
        lastInteractionTime.current = state.clock.elapsedTime;
      } else {
        groupRef.current.rotation.y = targetRotation;
        isAnimatingToTarget.current = false;
      }
      return;
    }

    const timeSinceInteraction = state.clock.elapsedTime - lastInteractionTime.current;
    const AUTO_ROTATE_DELAY = 3;
    
    if (timeSinceInteraction > AUTO_ROTATE_DELAY) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  return (
    <>
      <group ref={groupRef} position={[0, -1.2, 0]}>
        <HeartHeadstone width={STONE_WIDTH} height={STONE_HEIGHT} thickness={STONE_THICKNESS} />
        <Base stoneWidth={STONE_WIDTH} />
        
        <group position={[0, 0, 0]}>
          <GoldText
            position={[0, BASE_HEIGHT + STONE_HEIGHT * 0.62, textZ]}
            fontSize={0.11}
            text="In Loving Memory"
            font="/fonts/Garamond.ttf"
          />
          
          <GoldText
            position={[0, BASE_HEIGHT + STONE_HEIGHT * 0.52, textZ]}
            fontSize={0.22}
            text="Eleanor Rose"
            font="/fonts/Garamond.ttf"
            fontWeight="bold"
          />
          
          <GoldText
            position={[0, BASE_HEIGHT + STONE_HEIGHT * 0.42, textZ]}
            fontSize={0.11}
            text="☼ 1945   ✟ 2023"
            font="/fonts/Garamond.ttf"
          />
        </group>
      </group>
      
      <ContactShadows 
        position={[0, -1.4, 0]}
        opacity={1}
        scale={16}
        blur={2.8}
        far={2.5}
        resolution={1024}
        color="#000000"
      />
      
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
          <PerspectiveCamera makeDefault position={[0, 0.4, 5.5]} fov={40} />
          
          <ambientLight intensity={0.6} />
          
          <spotLight
            position={[0, 6, 2]}
            angle={0.8}
            penumbra={0.5}
            intensity={1.8}
            color="#ffffff"
            castShadow={false}
          />

          <spotLight 
            position={[-5, 5, -5]} 
            angle={0.5} 
            intensity={6} 
            color="#a0c0ff" 
            castShadow={false} 
          />

          <spotLight 
            position={[5, 5, -5]} 
            angle={0.5} 
            intensity={6} 
            color="#a0c0ff" 
            castShadow={false} 
          />

          <spotLight 
            position={[3, 5, 5]} 
            angle={0.5} 
            penumbra={1} 
            intensity={4} 
            color="#ffffff" 
            castShadow={true} 
          />

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
          
          <pointLight position={[3, 2, 5]} intensity={0.8} color="#e6f2ff" />
          <pointLight position={[0, -1, 3]} intensity={0.3} color="#6B5540" />
          <pointLight position={[0, 1.5, 3.5]} intensity={1.2} color="#ffd700" distance={7} decay={2} />

          <Environment preset="city" />

          <SceneContent targetRotation={rotation} />
        </React.Suspense>
      </Canvas>
    </div>
  );
}