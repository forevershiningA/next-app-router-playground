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

type SvgPath = {
  toShapes: (isCCW: boolean) => THREE.Shape[];
};

// --- Constants ---
const STONE_WIDTH = 2.55; 
const STONE_HEIGHT = 2.55; 
const STONE_THICKNESS = 0.44;
const BASE_HEIGHT = 0.46;
const BASE_EXTRA_WIDTH = 0.58;
const BEVEL_SIZE = 0.02;
const MODEL_SCALE = 0.94;
const MODEL_Y = -1.04;
const INTRO_START_Y = -1.42;
const INTRO_START_SCALE = 0.72;
const INTRO_DURATION = 0.9;
const FRONT_LAYOUT_Y_OFFSET = 0.12;

const easeOutSine = (value: number) => Math.sin((value * Math.PI) / 2);

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

// 1. Optimized Granite Material
const GraniteMaterial = () => {
  const texture = useTexture('/textures/forever/l/Blue-Pearl.webp');
  
  useMemo(() => {
    if (texture) {
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
      texture.repeat.set(0.2, 0.2);
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 16;
      texture.needsUpdate = true;
    }
  }, [texture]);
  
  return (
    <meshPhysicalMaterial
      color="#e6e6e6"
      map={texture}
      roughness={0.7}
      metalness={0}
      clearcoat={1}
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
      outlineWidth={0.012}
      outlineColor="#050505"
      outlineOpacity={1}
      renderOrder={10}
      fillOpacity={1}
    >
      {text}
      <meshStandardMaterial
        color="#ffd36a"
        emissive="#f2b84b"
        emissiveIntensity={0.72}
        roughness={0.22}
        metalness={0.7}
        toneMapped={false}
        envMapIntensity={1.8}
      />
    </Text>
  );
};

function InscriptionMesh({
  text,
  width = 1.6,
  height = 0.22,
  position = [0, 0, 0],
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
    ctx.fillStyle = '#FFE68A';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const fontSize = Math.floor(canvas.height * 0.65);
    const horizontalPadding = Math.round(canvas.width * 0.12);
    fitCanvasText(ctx, text, canvas.width - horizontalPadding * 2, fontSize, Math.floor(canvas.height * 0.36));

    ctx.shadowColor = 'rgba(0,0,0,0.95)';
    ctx.shadowBlur = 6;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    ctx.strokeStyle = 'rgba(4,3,2,0.96)';
    ctx.lineWidth = Math.max(4, Math.round(canvas.height * 0.034));
    ctx.lineJoin = 'round';
    ctx.strokeText(text, canvas.width / 2, canvas.height / 2);
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }, [text, width, height, textureOverscan]);

  React.useEffect(() => {
    return () => {
      tex?.dispose();
    };
  }, [tex]);

  return (
    <mesh position={position} renderOrder={2000}>
      <planeGeometry args={[width, height]} />
      <meshStandardMaterial
        map={tex ?? undefined}
        transparent
        depthTest
        depthWrite={false}
        toneMapped={false}
        alphaTest={0.05}
        side={THREE.FrontSide}
        polygonOffset
        polygonOffsetFactor={-10}
        polygonOffsetUnits={-10}
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

// A lightweight, scene-local grounding shadow keeps the transparent 3D canvas
// visually connected to the photographic hero background.
function GroundingShadow() {
  const texture = React.useMemo(() => {
    if (typeof document === 'undefined') return null;

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    if (!context) return null;

    const gradient = context.createRadialGradient(128, 128, 20, 128, 128, 124);
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.72)');
    gradient.addColorStop(0.42, 'rgba(0, 0, 0, 0.42)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const shadowTexture = new THREE.CanvasTexture(canvas);
    shadowTexture.colorSpace = THREE.SRGBColorSpace;
    shadowTexture.needsUpdate = true;
    return shadowTexture;
  }, []);

  React.useEffect(() => () => texture?.dispose(), [texture]);

  return (
    <mesh position={[0, -1.07, 0]} rotation={[-Math.PI / 2, 0, 0]} renderOrder={1}>
      <planeGeometry args={[3.5, 1.15]} />
      <meshBasicMaterial
        map={texture ?? undefined}
        transparent
        depthWrite={false}
        toneMapped={false}
        opacity={0.95}
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
      photoTexture.anisotropy = 4;
      photoTexture.needsUpdate = true;
    }
  }, [photoTexture]);

  const shapeData = useMemo(() => {
    const paths = svgData?.paths ?? [];
    if (!paths.length) return null;
    const shapes = paths.flatMap((path: SvgPath) => path.toShapes(true));
    if (!shapes.length) return null;

    const photoGeometry = new THREE.ShapeGeometry(shapes, 24);
    const ceramicGeometry = new THREE.ExtrudeGeometry(shapes, {
      depth: 0.0046,
      bevelEnabled: true,
      bevelThickness: 0.00115,
      bevelSize: 0.00115,
      bevelSegments: 2,
      curveSegments: 24,
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
      >
        <meshStandardMaterial color="#f3f3f3" roughness={0.2} metalness={0.05} />
      </mesh>

      <mesh
        geometry={photoGeometry}
        position={[0, 0, 0.0072]}
        scale={[scaleX, scaleY, 1]}
        renderOrder={9}
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
    const shapes = svgData.paths.flatMap((path: SvgPath) => path.toShapes(true));
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
    bevelSegments: 4,
    bevelSize: BEVEL_SIZE,
    bevelThickness: BEVEL_SIZE,
    curveSegments: 28
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
  const tex = useTexture('/textures/forever/l/Blue-Pearl.webp');
  const baseTex = useMemo(() => (tex ? tex.clone() : null), [tex]);
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

  React.useEffect(() => {
    return () => {
      baseTex?.dispose();
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
        clearcoat={1}
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
  onReady?: () => void;
}

const SceneContent = ({ targetRotation, onReady }: { targetRotation: number; onReady?: () => void }) => {
  const groupRef = useRef<THREE.Group>(null);
  const lastInteractionTime = useRef(0);
  const introStartTime = useRef<number | null>(null);
  const introInitialized = useRef(false);
  const readySignaled = useRef(false);
  const isAnimatingToTarget = useRef(false);
  
  const { clock } = useThree();
  
  const textZ = (STONE_THICKNESS / 2) + BEVEL_SIZE + 0.02;

  const setGroupRef = React.useCallback((group: THREE.Group | null) => {
    groupRef.current = group;

    if (!group || introInitialized.current) return;
    group.visible = false;
    group.position.set(0, INTRO_START_Y, 0);
    group.scale.setScalar(INTRO_START_SCALE);
    introInitialized.current = true;
  }, []);

  React.useEffect(() => {
    isAnimatingToTarget.current = true;
    lastInteractionTime.current = clock.getElapsedTime();
  }, [targetRotation, clock]);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (introStartTime.current === null) {
      introStartTime.current = state.clock.elapsedTime;
    }

    const introProgress = Math.min((state.clock.elapsedTime - introStartTime.current) / INTRO_DURATION, 1);
    const introEase = easeOutSine(introProgress);
    const y = THREE.MathUtils.lerp(INTRO_START_Y, MODEL_Y, introEase);
    const scale = THREE.MathUtils.lerp(INTRO_START_SCALE, MODEL_SCALE, introEase);
    groupRef.current.visible = introProgress > 0.015;
    groupRef.current.position.set(0, y, 0);
    groupRef.current.scale.setScalar(scale);

    if (!readySignaled.current && introProgress > 0.015) {
      readySignaled.current = true;
      onReady?.();
    }

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
      const idleRotation = targetRotation + Math.sin(state.clock.elapsedTime * 0.65) * 0.08;
      groupRef.current.rotation.y += (idleRotation - groupRef.current.rotation.y) * Math.min(delta * 3, 0.08);
    }
  });

  return (
    <>
      <group
        ref={setGroupRef}
        visible={false}
        position={[0, INTRO_START_Y, 0]}
        scale={[INTRO_START_SCALE, INTRO_START_SCALE, INTRO_START_SCALE]}
      >
        <HeartHeadstone width={STONE_WIDTH} height={STONE_HEIGHT} thickness={STONE_THICKNESS} />
        <Base stoneWidth={STONE_WIDTH} />
        
        <group position={[0, FRONT_LAYOUT_Y_OFFSET, 0]}>
          <InscriptionMesh
            text="In Loving Memory"
            width={1.5}
            height={0.41}
            position={[0, BASE_HEIGHT + STONE_HEIGHT * 0.735, textZ]}
          />
          
          <InscriptionMesh
            text="Margaret Ann Cole"
            width={1.75}
            height={0.53}
            position={[0, BASE_HEIGHT + STONE_HEIGHT * 0.655, textZ]}
          />
          
          <HeroCeramicImage
            position={[0, BASE_HEIGHT + STONE_HEIGHT * 0.465, textZ + 0.008]}
            imageUrl="/jpg/photos/vitreous-enamel-image.webp"
            maskPath="/shapes/masks/oval_horizontal.svg"
            width={0.44}
            height={0.58}
          />

          <InscriptionMesh
            text="Her kindness lives on"
            width={1.5}
            height={0.28}
            position={[0, BASE_HEIGHT + STONE_HEIGHT * 0.255, textZ]}
          />

          <InscriptionMesh
            text="in every life she touched"
            width={1.95}
            height={0.28}
            position={[0, BASE_HEIGHT + STONE_HEIGHT * 0.205, textZ]}
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
      
      <GroundingShadow />
      <ContactShadows 
        position={[0, -1.06, 0]}
        opacity={0.62}
        scale={6.5}
        blur={2.2}
        far={2.5}
        resolution={512}
        color="#15110d"
      />
      
      <OrbitControls
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

export default function HeroCanvas({ rotation = 0, onReady }: HeroCanvasProps) {
  return (
    <div style={{ width: '100%', height: '100%', margin: '0 auto' }}>
      <Canvas
        key="hero-canvas"
        shadows
        dpr={[1, 2]}
        gl={{ 
          alpha: true, 
          antialias: true,
          powerPreference: 'high-performance',
          stencil: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.1
        }} 
        style={{ background: 'transparent' }}
      >
        <React.Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0.4, 5.5]} fov={40} />
          
          <ambientLight intensity={0.3} color="#ffffff" />
          <directionalLight position={[0, 2, 5]} intensity={1.2} color="#ffffff" />
          
          <directionalLight
            position={[5, 8, 5]}
            intensity={1.5}
            color="#fff9f0"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-bias={-0.0005}
          />

          <directionalLight position={[-5, 5, 2]} intensity={0.4} color="#a0c0ff" />

          <Environment files="/hdri/spring.hdr" background={false} blur={0.8} />

          <SceneContent targetRotation={rotation} onReady={onReady} />
        </React.Suspense>
      </Canvas>
    </div>
  );
}
