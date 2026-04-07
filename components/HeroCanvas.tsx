'use client';

import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  PerspectiveCamera,
  ContactShadows,
  useTexture,
  Text
} from '@react-three/drei';
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';

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

interface GoldMotifProps {
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
}

interface HeroCeramicImageProps {
  position: [number, number, number];
  imageUrl: string;
  maskPath?: string;
  width: number;
  height: number;
}

const HeroCeramicImage: React.FC<HeroCeramicImageProps> = ({
  position,
  imageUrl,
  maskPath = '/shapes/masks/oval_horizontal.svg',
  width,
  height,
}) => {
  const svgData = useLoader(SVGLoader, maskPath);
  const photoTexture = useTexture(imageUrl);

  useMemo(() => {
    if (photoTexture) {
      photoTexture.colorSpace = THREE.SRGBColorSpace;
      photoTexture.wrapS = THREE.ClampToEdgeWrapping;
      photoTexture.wrapT = THREE.ClampToEdgeWrapping;
      photoTexture.anisotropy = 16;
      photoTexture.needsUpdate = true;
    }
  }, [photoTexture]);

  const shapeData = useMemo(() => {
    const paths = svgData?.paths ?? [];
    if (!paths.length) return null;
    const shapes = paths.flatMap((path) => path.toShapes(true));
    if (!shapes.length) return null;

    const photoGeometry = new THREE.ShapeGeometry(shapes, 64);
    const ceramicGeometry = new THREE.ExtrudeGeometry(shapes, {
      depth: 0.0046,
      bevelEnabled: true,
      bevelThickness: 0.00115,
      bevelSize: 0.00115,
      bevelSegments: 4,
      curveSegments: 64,
    });

    photoGeometry.computeBoundingBox();
    const bounds = photoGeometry.boundingBox;
    if (!bounds) {
      photoGeometry.dispose();
      ceramicGeometry.dispose();
      return null;
    }

    const shapeWidth = bounds.max.x - bounds.min.x;
    const shapeHeight = bounds.max.y - bounds.min.y;
    const centerX = (bounds.min.x + bounds.max.x) / 2;
    const centerY = (bounds.min.y + bounds.max.y) / 2;

    const positions = photoGeometry.getAttribute('position');
    const uvs = new Float32Array(positions.count * 2);
    for (let i = 0; i < positions.count; i += 1) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const u = (x - bounds.min.x) / shapeWidth;
      const v = (y - bounds.min.y) / shapeHeight;
      uvs[i * 2] = u;
      uvs[i * 2 + 1] = v;
    }
    photoGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

    photoGeometry.translate(-centerX, -centerY, 0);
    ceramicGeometry.translate(-centerX, -centerY, 0);

    return { photoGeometry, ceramicGeometry, shapeWidth, shapeHeight };
  }, [svgData]);

  React.useEffect(() => {
    return () => {
      shapeData?.photoGeometry.dispose();
      shapeData?.ceramicGeometry.dispose();
    };
  }, [shapeData]);

  if (!shapeData) return null;

  const { photoGeometry, ceramicGeometry, shapeWidth, shapeHeight } = shapeData;
  const scaleX = width / shapeWidth;
  const scaleY = height / shapeHeight;
  const ceramicBorder = 1.05;

  return (
    <group position={position}>
      <mesh
        geometry={ceramicGeometry}
        scale={[scaleX * ceramicBorder, scaleY * ceramicBorder, 1]}
        renderOrder={8}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#f3f3f3" roughness={0.2} metalness={0.05} />
      </mesh>

      <mesh
        geometry={photoGeometry}
        position={[0, 0, 0.0072]}
        scale={[scaleX, scaleY, 1]}
        renderOrder={9}
        castShadow
        receiveShadow
      >
        <meshBasicMaterial
          map={photoTexture}
          transparent
          side={THREE.DoubleSide}
          polygonOffset
          polygonOffsetFactor={-1}
          polygonOffsetUnits={-1}
        />
      </mesh>
    </group>
  );
};

const GoldMotif: React.FC<GoldMotifProps> = ({ position, rotation = [0, 0, 0], scale = 1 }) => {
  const svgData = useLoader(SVGLoader, '/shapes/motifs/hero_qr_forevershining.svg');

  const geometry = useMemo(() => {
    if (!svgData?.paths?.length) return null;
    const shapes = svgData.paths.flatMap((path) => path.toShapes(true));
    if (!shapes.length) return null;
    const geom = new THREE.ShapeGeometry(shapes);
    geom.center();
    return geom;
  }, [svgData]);

  React.useEffect(() => {
    return () => {
      geometry?.dispose();
    };
  }, [geometry]);

  const material = React.useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#d4af37',
        emissive: '#b8860b',
        emissiveIntensity: 0.35,
        roughness: 0.2,
        metalness: 0.9,
        toneMapped: false,
        envMapIntensity: 1.5,
      }),
    []
  );

  React.useEffect(() => () => material.dispose(), [material]);

  if (!geometry) return null;

  return (
    <group position={position} rotation={rotation} scale={scale}>
      <mesh geometry={geometry} material={material} renderOrder={9} />
    </group>
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
            position={[0, BASE_HEIGHT + STONE_HEIGHT * 0.755, textZ]}
            fontSize={0.11}
            text="In Loving Memory"
            font="/fonts/Garamond.ttf"
          />
          
          <GoldText
            position={[0, BASE_HEIGHT + STONE_HEIGHT * 0.655, textZ]}
            fontSize={0.22}
            text="Margaret Ann Cole"
            font="/fonts/Garamond.ttf"
            fontWeight="bold"
          />
          
          <GoldText
            position={[0, BASE_HEIGHT + STONE_HEIGHT * 0.555, textZ]}
            fontSize={0.11}
            text="Her kindness lives on in every life she touched"
            font="/fonts/Garamond.ttf"
          />

          <HeroCeramicImage
            position={[0, BASE_HEIGHT + STONE_HEIGHT * 0.32, textZ + 0.008]}
            imageUrl="/jpg/photos/vitreous-enamel-image.png"
            maskPath="/shapes/masks/oval_horizontal.svg"
            width={0.58}
            height={0.74}
          />

          <group
            position={[0, BASE_HEIGHT + STONE_HEIGHT * 0.55, -textZ]}
            rotation={[0, Math.PI, 0]}
          >
            <GoldText
              position={[0, 0.4, 0]}
              fontSize={0.14}
              text="Design Your Own"
              font="/fonts/Garamond.ttf"
            />
            <GoldText
              position={[0, 0.18, 0]}
              fontSize={0.11}
              text="forevershining.org"
              font="/fonts/Garamond.ttf"
            />
            <GoldText
              position={[0, -0.02, 0]}
              fontSize={0.095}
              text="Create a lasting tribute in minutes"
              font="/fonts/Garamond.ttf"
            />
            <GoldMotif
              position={[0, -0.38, 0]}
              rotation={[0, 0, Math.PI]}
              scale={0.018}
            />
          </group>
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
