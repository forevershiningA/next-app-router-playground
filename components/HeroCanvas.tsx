'use client';

import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
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
const STONE_WIDTH = 2.0;
const STONE_HEIGHT = 2.2;
const STONE_THICKNESS = 0.3;
const SHOULDER_HEIGHT = 1.8; // Where the curve starts
const BASE_HEIGHT = 0.4;
const BASE_EXTRA_WIDTH = 0.5; // 130mm scaled relative to generic units (approx)

// --- Materials ---

// Polished Black Granite with Glory Black texture
const GraniteMaterial = () => {
  const texture = useTexture('/textures/forever/l/Glory-Black-2.webp');
  
  // Configure texture
  React.useEffect(() => {
    if (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(2, 2);
      texture.needsUpdate = true;
    }
  }, [texture]);
  
  return (
    <meshPhysicalMaterial
      map={texture}
      roughness={0.12}
      metalness={0.15}
      envMapIntensity={2.5}
      clearcoat={1.0}
      clearcoatRoughness={0.1}
    />
  );
};

// --- Sub-Components ---

interface HeadstoneProps {
  width: number;
  height: number;
  thickness: number;
}

const SerpentineHeadstone: React.FC<HeadstoneProps> = ({ width, height, thickness }) => {
  
  // Create the Serpentine Shape procedurally
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    const w2 = width / 2;
    
    // 1. Start bottom left
    s.moveTo(-w2, 0);
    
    // 2. Line to top-left shoulder
    s.lineTo(-w2, SHOULDER_HEIGHT);
    
    // 3. The Serpentine Curve (S-Curve top)
    // Left hump
    s.bezierCurveTo(
      -w2, height,          // Control point 1 (up from shoulder)
      -w2 / 3, height,      // Control point 2 (peak area)
      0, height * 0.95      // End point (center dip slightly)
    );
    
    // Right hump
    s.bezierCurveTo(
      w2 / 3, height,       // Control point 1
      w2, height,           // Control point 2
      w2, SHOULDER_HEIGHT   // End point (right shoulder)
    );

    // 4. Line to bottom right
    s.lineTo(w2, 0);
    
    // 5. Close shape
    s.lineTo(-w2, 0);
    
    return s;
  }, [width, height]);

  const extrudeSettings = useMemo(() => ({
    depth: thickness,
    bevelEnabled: true,
    bevelSegments: 4,
    bevelSize: 0.02,
    bevelThickness: 0.02,
  }), [thickness]);

  return (
    <group position={[0, BASE_HEIGHT, 0]}>
      <mesh position={[0, 0, -thickness / 2]}>
        <extrudeGeometry args={[shape, extrudeSettings]} />
        <GraniteMaterial />
      </mesh>
    </group>
  );
};

const Base: React.FC<{ stoneWidth: number }> = ({ stoneWidth }) => {
  // Base is 130mm wider (represented as BASE_EXTRA_WIDTH units here)
  const width = stoneWidth + BASE_EXTRA_WIDTH;
  const depth = STONE_THICKNESS + 0.3;

  return (
    <mesh position={[0, BASE_HEIGHT / 2, 0]}>
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

  // Animate to target rotation smoothly
  useFrame((state) => {
    if (groupRef.current) {
      // Smooth interpolation to target rotation
      groupRef.current.rotation.y += (targetRotation - groupRef.current.rotation.y) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, -1, 0]}>
      <SerpentineHeadstone 
        width={STONE_WIDTH} 
        height={STONE_HEIGHT} 
        thickness={STONE_THICKNESS} 
      />
      <Base stoneWidth={STONE_WIDTH} />
      
      {/* Sample Inscription */}
      <Text
        position={[0, BASE_HEIGHT + STONE_HEIGHT * 0.58, STONE_THICKNESS / 2 + 0.05]}
        fontSize={0.12}
        color="#d4af37"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Garamond.ttf"
        letterSpacing={0.05}
        depthOffset={-2}
        renderOrder={2}
      >
        In Loving Memory
      </Text>
      <Text
        position={[0, BASE_HEIGHT + STONE_HEIGHT * 0.48, STONE_THICKNESS / 2 + 0.05]}
        fontSize={0.16}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Garamond.ttf"
        letterSpacing={0.02}
        fontWeight="bold"
        depthOffset={-2}
        renderOrder={2}
      >
        Eleanor Rose
      </Text>
      <Text
        position={[0, BASE_HEIGHT + STONE_HEIGHT * 0.38, STONE_THICKNESS / 2 + 0.05]}
        fontSize={0.11}
        color="#d4af37"
        anchorX="center"
        anchorY="middle"
        font="/fonts/Garamond.ttf"
        letterSpacing={0.02}
        depthOffset={-2}
        renderOrder={2}
      >
        ☼ 1945  ✟ 2023
      </Text>
      
      {/* Shadow catcher for realism */}
      <ContactShadows 
        opacity={0.6} 
        scale={10} 
        blur={2} 
        far={2} 
        resolution={256} 
        color="#000000" 
      />
    </group>
  );
};

// --- Main Component ---

export default function HeroCanvas({ rotation = 0 }: HeroCanvasProps) {
  const glRef = React.useRef<any>(null);

  // Cleanup WebGL context on unmount
  React.useEffect(() => {
    return () => {
      if (glRef.current) {
        const gl = glRef.current;
        gl.dispose?.();
        const loseContext = gl.getContext()?.getExtension('WEBGL_lose_context');
        if (loseContext) {
          loseContext.loseContext();
        }
      }
    };
  }, []);

  return (
    <div style={{ width: '480px', height: '480px', margin: '0 auto' }}>
      <Canvas 
        key="hero-canvas"
        shadows 
        gl={{ 
          alpha: true, 
          preserveDrawingBuffer: false,
          antialias: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
        }} 
        style={{ background: 'transparent' }}
        onCreated={({ gl }) => {
          glRef.current = gl;
        }}
      >
        <React.Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[2, 1.5, 3.5]} fov={45} />
          
          {/* Lighting Setup - Warmer tones with rim light */}
          <ambientLight intensity={0.4} />
          <spotLight 
            position={[5, 5, 5]} 
            angle={0.5} 
            penumbra={1} 
            intensity={1.2} 
            castShadow
            color="#fff8e7"
          />
          <pointLight position={[-2, 3, 2]} intensity={0.6} color="#ffd89b" />
          <pointLight position={[3, 1, -2]} intensity={0.4} color="#d4af37" />
          {/* Rim light for beveled edges */}
          <pointLight position={[-3, 2, -1]} intensity={0.8} color="#ffffff" />
          <pointLight position={[3, 2, -1]} intensity={0.8} color="#ffffff" />
          
          {/* Environment map creates the reflections on the polished granite */}
          <Environment preset="city" />

          <SceneContent targetRotation={rotation} />

          <OrbitControls
            enablePan={false}
            enableZoom={false}
            autoRotate={false}
            minPolarAngle={0} 
            maxPolarAngle={Math.PI / 2 - 0.05} 
          />
        </React.Suspense>
      </Canvas>
    </div>
  );
}

