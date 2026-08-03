'use client';

import React, { useMemo, useRef, lazy } from 'react';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { 
  OrbitControls, 
  Environment, 
  PerspectiveCamera,
  ContactShadows,
  useTexture,
  Text
} from '@react-three/drei';

const LazyHeroDecor = lazy(() => import('./HeroDecor'));
import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';

// Resolve public base (Vite)
const BASE = import.meta.env.BASE_URL || '/';

// --- Constants ---
const STONE_WIDTH = 2.55; 
const STONE_HEIGHT = 2.55; 
const STONE_THICKNESS = 0.44;
const BASE_HEIGHT = 0.46;
const BASE_EXTRA_WIDTH = 0.58;
const BEVEL_SIZE = 0.02;
const HERO_PHOTO_URL = '/vitreous-enamel-image.png';

function buildBoxGeometryWithScaledUvs(width: number, height: number, depth: number) {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const position = geometry.getAttribute('position');
  const normal = geometry.getAttribute('normal');
  const uvs: number[] = [];
  const visibleFaceRepeatY = 0.2;

  for (let i = 0; i < position.count; i += 1) {
    const x = position.getX(i);
    const y = position.getY(i);
    const z = position.getZ(i);
    const nx = Math.abs(normal.getX(i));
    const ny = Math.abs(normal.getY(i));
    const nz = Math.abs(normal.getZ(i));

    if (ny >= nx && ny >= nz) {
      const repeatX = visibleFaceRepeatY * (width / depth);
      uvs.push(((x + width / 2) / width) * repeatX, ((z + depth / 2) / depth) * visibleFaceRepeatY);
    } else if (nx >= nz) {
      const repeatX = visibleFaceRepeatY * (depth / height);
      uvs.push(((z + depth / 2) / depth) * repeatX, ((y + height / 2) / height) * visibleFaceRepeatY);
    } else {
      const repeatX = visibleFaceRepeatY * (width / height);
      uvs.push(((x + width / 2) / width) * repeatX, ((y + height / 2) / height) * visibleFaceRepeatY);
    }
  }

  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  return geometry;
}

function fitCanvasText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxSize: number, minSize: number) {
  let size = maxSize;
  while (size > minSize) {
    ctx.font = `bold ${size}px serif`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 2;
  }
  ctx.font = `bold ${size}px serif`;
}

// --- Materials & Components ---

// 1. Optimized Granite Material (photoreal)
const GraniteMaterial = () => {
  const texture = useTexture(`${BASE}textures/forever/l/Blue-Pearl.webp`);

  useMemo(() => {
    if (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      // reduce tiling so the grain looks larger and less repetitive
      texture.repeat.set(0.2, 0.2);
      texture.anisotropy = 16;
      // Ensure texture colors render in the expected color space.
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.needsUpdate = true;
    }
  }, [texture]);

  // Use meshPhysicalMaterial for realistic clearcoat/polish
  return (
    <meshPhysicalMaterial
      color="#e6e6e6"
      map={texture}
      roughness={0.7}          // textured stone beneath the polish
      metalness={0.0}         // stone is not metallic
      clearcoat={1.0}         // polished clearcoat layer
      clearcoatRoughness={0.03}
      envMapIntensity={1.4}
      reflectivity={0.55}
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
  const resolvedFont = font && font.startsWith('/') ? `${BASE}${font.replace(/^\//, '')}` : font;
  return (
    <Text
      position={position}
      fontSize={fontSize}
      font={resolvedFont}
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
        emissiveIntensity={0.6}
        roughness={0.12}
        metalness={0.95}
        toneMapped={false}
        envMapIntensity={1.8}
        depthTest={false}
      />
    </Text>
  );
};

// Canvas-based inscription mesh (gold, raised look)
function InscriptionMesh({
  text,
  width = 1.6,
  height = 0.22,
  position = [0, 0, 0] as [number, number, number],
  textureOverscan = 1,
}: {
  text: string;
  width?: number;
  height?: number;
  position?: [number, number, number];
  textureOverscan?: number;
}) {
  const tex = React.useMemo(() => {
    if (typeof document === 'undefined') return null;
    const scale = 2;
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(512, Math.round(width * 512 * textureOverscan)) * scale;
    canvas.height = Math.max(128, Math.round(height * 512)) * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Brighter gold fill, bold font, and a subtle shadow for depth (no dark stroke)
    ctx.fillStyle = '#FFDF73';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const fontSize = Math.floor(canvas.height * 0.65);
    const horizontalPadding = Math.round(canvas.width * 0.12);
    fitCanvasText(ctx, text, canvas.width - horizontalPadding * 2, fontSize, Math.floor(canvas.height * 0.36));

    // subtle drop shadow to give the letters a slightly inset look on the stone
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }, [text, width, height, textureOverscan]);

  React.useEffect(() => {
    return () => {
      if (tex) tex.dispose();
    };
  }, [tex]);

  // use provided world-space position for text plane
  const textPos = [position[0], position[1], position[2]] as [number, number, number];

  if (!tex) {
    return (
      <mesh position={textPos}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#FFDF73" roughness={0.3} metalness={0.5} emissive="#664d00" emissiveIntensity={0.4} />
      </mesh>
    );
  }

  return (
    <mesh position={textPos} renderOrder={2000}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial
        map={tex}
        transparent={true}
        depthTest={true}
        depthWrite={false} /* keep text visually on top but avoid z-fighting */
        toneMapped={false}
        alphaTest={0.05}
        side={THREE.FrontSide}
        // Polygon offset (decal trick) — keeps the plane mathematically flush but drawn on top
        polygonOffset={true}
        polygonOffsetFactor={-10}
        polygonOffsetUnits={-10}
        // Premium gold settings
        color="#FDE895"
        roughness={0.35}
        metalness={0.65}
        emissive="#4a3600"
        emissiveIntensity={0.7}
        envMapIntensity={1.2}
      />
    </mesh>
  );
}

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

// HeroCeramicImage intentionally left in file for future use, but disabled to avoid loader errors when mask/image assets are missing.
const HeroCeramicImage: React.FC<HeroCeramicImageProps> = () => null;

const GoldMotif: React.FC<GoldMotifProps> = ({ position, rotation = [0, 0, 0], scale = 1 }) => {
  const svgData = useLoader(SVGLoader, `${BASE}shapes/motifs/hero_qr_forevershining.svg`);

  const geometry = useMemo(() => {
    if (!svgData?.paths?.length) return null;
    const shapes = svgData.paths.flatMap((path: any) => (path as any).toShapes(true));
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
  const tex = useTexture(`${BASE}textures/forever/l/Blue-Pearl.webp`);

  // Clone the texture for the base so we don't mutate the shared texture used by the headstone.
  const baseTex = useMemo(() => (tex ? (tex.clone() as THREE.Texture) : null), [tex]);
  const geometry = useMemo(() => buildBoxGeometryWithScaledUvs(width, BASE_HEIGHT, depth), [width, depth]);

  useMemo(() => {
    if (baseTex) {
      baseTex.wrapS = baseTex.wrapT = THREE.RepeatWrapping;
      baseTex.repeat.set(1, 1);
      baseTex.anisotropy = 16;
      baseTex.colorSpace = THREE.SRGBColorSpace;
      baseTex.needsUpdate = true;
    }
  }, [baseTex]);

  // Clean up cloned texture when component unmounts
  React.useEffect(() => {
    return () => {
      if (baseTex) baseTex.dispose();
      geometry.dispose();
    };
  }, [baseTex, geometry]);

  return (
    <mesh geometry={geometry} position={[0, BASE_HEIGHT / 2, 0]} castShadow receiveShadow>
      <meshPhysicalMaterial
        map={baseTex ?? undefined}
        color="#e6e6e6"
        roughness={0.7}
        metalness={0}
        clearcoat={1.0}
        clearcoatRoughness={0.03}
        envMapIntensity={1.4}
        reflectivity={0.55}
      />
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
  const interactingRef = useRef<boolean>(false);
  
  const { clock } = useThree();
  
  // position text flush to the stone face (slightly inset so it reads as engraved)
  const textZ = (STONE_THICKNESS / 2) + BEVEL_SIZE;

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
          <InscriptionMesh
            text="In Loving Memory"
            width={1.6}
            height={0.33}
            position={[0, BASE_HEIGHT + STONE_HEIGHT * 0.765, textZ]}
          />

          <InscriptionMesh
            text="Margaret Ann Cole"
            width={1.75}
            height={0.43}
            position={[0, BASE_HEIGHT + STONE_HEIGHT * 0.670, textZ]}
          />

          <InscriptionMesh
            text="Her kindness lives on in every life she touched"
            width={1.6}
            height={0.20}
            position={[0, BASE_HEIGHT + STONE_HEIGHT * 0.575, textZ]}
          />

          {/* Ceramic image temporarily removed to avoid loader errors when asset is missing */}

          <group
            position={[0, BASE_HEIGHT + STONE_HEIGHT * 0.55, -textZ]}
            rotation={[0, Math.PI, 0]}
          >
            <GoldText
              position={[0, 0.4, 0]}
              fontSize={0.14}
              text="Design Your Own"
            />
            <GoldText
              position={[0, 0.18, 0]}
              fontSize={0.11}
              text="discountheadstones.com.au"
            />
            <GoldText
              position={[0, -0.02, 0]}
              fontSize={0.095}
              text="Create a lasting tribute in minutes"
            />
            {/* Gold motif removed to avoid missing asset loader errors */}
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
      
          {/* Slow, desktop-only auto-rotation handled by rotating group below; OrbitControls allow user interaction but do not auto-rotate camera */}
          <OrbitControls
            ref={controlsRef}
            enablePan={false}
            enableZoom={true}
            enableRotate={true}
            minPolarAngle={0}
            maxPolarAngle={Math.PI / 2 - 0.05}
            enableDamping={true}
            dampingFactor={0.06}
            autoRotate={false}
            onStart={() => { interactingRef.current = true; }}
            onEnd={() => { interactingRef.current = false; lastInteractionTime.current = clock.getElapsedTime(); }}
            onChange={() => {
              lastInteractionTime.current = clock.getElapsedTime();
              isAnimatingToTarget.current = false;
            }}
          />
        </>
      );
};

// --- Rotating wrapper ---
function RotatingGroup({ children, pauseRef }: { children: React.ReactNode; pauseRef?: React.RefObject<boolean> }) {
  const ref = useRef<THREE.Group | null>(null);
  useFrame((state, delta) => {
    if (!ref.current) return;
    if (pauseRef && pauseRef.current) return;
    // slow rotation
    ref.current.rotation.y += delta * 0.04; // ~0.04 rad/s
  });
  return (
    <group ref={ref} position={[0, -1.2, 0]}>
      {children}
    </group>
  );
}

// --- Main Component ---

class CanvasErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  componentDidCatch(error: any, info: any) {
    // production: suppress console noise; error boundary preserves UI without throwing
    // (consider reporting errors to monitoring in the future)
  }
  render() {
    if (this.state.hasError) {
      // Render a minimal set of three.js objects (not a nested Canvas) so the outer Canvas can show a fallback scene
      return (
        <>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 10, 5]} intensity={1} />
          <mesh position={[0, -0.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[6, 6]} />
            <meshStandardMaterial color="#e6e6e6" />
          </mesh>
          <mesh position={[0, 0.2, 0]}>
            <boxGeometry args={[1.2, 1.8, 0.4]} />
            <meshStandardMaterial color="#9b9b9b" />
          </mesh>
        </>
      );
    }
    return this.props.children as React.ReactNode;
  }
}

function CanvasReadyEmitter() {
  // Dispatch a 'hero-ready' event after a few frames to indicate the scene has been drawn.
  const frames = useRef(0);
  useFrame(() => {
    frames.current++;
    // fire once after 4 frames
    if (frames.current === 4) {
      try { window.dispatchEvent(new CustomEvent('hero-ready')); } catch {};
    }
  });
  return null;
}

export default function HeroCanvas({ rotation = 0 }: HeroCanvasProps) {
  const interactingRef = useRef<boolean>(false);
  // textZ used for positioning inscription planes
  const textZ = (STONE_THICKNESS / 2) + BEVEL_SIZE;
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Keep a ref for the wrapper but allow default wheel scrolling so page can scroll.
  // OrbitControls already has enableZoom={false}, so wheel won't zoom the scene.
  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%', margin: '0 auto' }}>
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
        <CanvasErrorBoundary>
          <React.Suspense fallback={null}>
            <PerspectiveCamera makeDefault position={[0, 0.4, 5.5]} fov={40} />
            
            {/* Natural outdoor / studio lighting: smaller set for photorealism */}
            <ambientLight intensity={0.3} color="#ffffff" />

            {/* Frontal key that lights the stone face and inscriptions */}
            <directionalLight position={[0, 2, 5]} intensity={1.2} color="#ffffff" />

            {/* Key directional sunlight */}
            <directionalLight
              position={[5, 8, 5]}
              intensity={1.5}
              color="#fff9f0"
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-bias={-0.0005}
            />

            {/* Soft fill light from the opposite side */}
            <directionalLight position={[-5, 5, 2]} intensity={0.4} color="#a0c0ff" />

            {/* Environment for reflections (slightly blurred to avoid sharp sparkles) */}
            <Environment preset="city" background={false} blur={0.8} />

            {/* OrbitControls for user interaction on desktop */}
            <OrbitControls
              enablePan={false}
              enableZoom={false}
              enableRotate={true}
              autoRotate={false}
              onStart={() => { interactingRef.current = true; }}
              onEnd={() => { interactingRef.current = false; }}
            />

            <RotatingGroup pauseRef={interactingRef}>
              <HeartHeadstone width={STONE_WIDTH} height={STONE_HEIGHT} thickness={STONE_THICKNESS} />
              <Base stoneWidth={STONE_WIDTH} />

              {/* Inscriptions: canvas-texture meshes placed on the stone face */}
              <InscriptionMesh
                text="In Loving Memory"
                width={1.5}
                height={0.41}
                position={[0, BASE_HEIGHT + STONE_HEIGHT * 0.765, textZ]}
              />

              <InscriptionMesh
                text="Margaret Ann Cole"
                width={1.75}
                height={0.53}
                position={[0, BASE_HEIGHT + STONE_HEIGHT * 0.670, textZ]}
              />

              <InscriptionMesh
                text="Her kindness lives on"
                width={1.5}
                height={0.28}
                position={[0, BASE_HEIGHT + STONE_HEIGHT * 0.305, textZ]}
              />

              <InscriptionMesh
                text="in every life she touched"
                width={1.5}
                height={0.28}
                position={[0, BASE_HEIGHT + STONE_HEIGHT * 0.252, textZ]}
              />

              {/* Visible debug cube to confirm placement during development */}

              <React.Suspense fallback={null}>
                <LazyHeroDecor photoUrl={HERO_PHOTO_URL} />
              </React.Suspense>
            </RotatingGroup>

            <CanvasReadyEmitter />
          </React.Suspense>
        </CanvasErrorBoundary>
      </Canvas>
    </div>
  );
}
