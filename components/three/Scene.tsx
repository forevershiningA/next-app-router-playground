'use client';
import { OrbitControls, Environment, ContactShadows, useTexture, Sparkles } from '@react-three/drei';
// REMOVED: EffectComposer & DepthOfField (Causing artifacts)
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import HeadstoneAssembly from './headstone/HeadstoneAssembly';
import SunRays from './SunRays';
import AtmosphericSky from './AtmosphericSky';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { data } from '#/app/_internal/_data';

import { useFrame, useThree, ThreeEvent } from '@react-three/fiber';
import { useRef, Suspense, useEffect, useMemo } from 'react';

// Deterministic LCG so bush positions are stable across renders
function lcg(seed: number) {
  let s = seed;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// --- SCENERY CONFIGS ---
const SCENERY = {
  day: {
    grassColor:       '#9aaa72',
    fogColor:         '#dcebf5',
    fogColor2:        '#ADCCE7',
    bgSky:            '#A8C9E6',
    gradientTop:      '#5ca0e5',
    gradientBottom:   '#dcebf5',
    sparklesColor:    '#fffee0',
    sparklesCount:    30,
    sparklesScale:    12,
    sparklesSize:     3,
    sparklesSpeed:    0.3,
    sparklesOpacity:  0.4,
    sparklesPosition: [0, 1, 0] as [number, number, number],
    cloudColor:       '#edf1ec',
    ambientColor:     '#ffffff',
    ambientIntensity: 0.6,
    hemiSky:          '#fff8e7',
    hemiGround:       '#dcdcdc',
    hemiIntensity:    0.8,
    sunColor:         '#fffce6',
    sunIntensity:     2.5,
    rimColor:         '#ffffff',
    rimIntensity:     2,
  },
  outback: {
    grassColor:       '#e0a870',   // lighter sandy-orange (was too dark/saturated red)
    fogColor:         '#ccdde8',   // pale atmospheric blue (distant haze)
    fogColor2:        '#d5e5f0',   // very pale blue near-fog
    bgSky:            '#b8d4e8',   // pale washed-out sky blue
    gradientTop:      '#5fa8d3',   // moderate Australian blue at zenith
    gradientBottom:   '#daeaf6',   // almost white/pale near horizon
    sparklesColor:    '#e8c870',   // golden dust motes
    sparklesCount:    0,           // no sparkles in outback — clear air
    sparklesScale:    14,
    sparklesSize:     2.5,
    sparklesSpeed:    0.15,
    sparklesOpacity:  0,
    sparklesPosition: [0, 1.5, 0] as [number, number, number],
    cloudColor:       '#ffffff',   // clean white clouds
    ambientColor:     '#fffde8',   // warm bright ambient
    ambientIntensity: 0.8,
    hemiSky:          '#b0cfe8',   // pale blue sky bounce
    hemiGround:       '#c86030',   // red earth bounce
    hemiIntensity:    0.9,
    sunColor:         '#fff8e0',   // bright warm sun
    sunIntensity:     3.0,
    rimColor:         '#e8f0ff',   // cool sky rim
    rimIntensity:     1.2,
  },
} as const;

const GRASS_NORMAL_SCALE = new THREE.Vector2(0.72, 0.72);
const OUTBACK_NORMAL_SCALE = new THREE.Vector2(0.4, 0.4);

// --- COMPONENTS ---

// Gradient sky sphere — colours driven by active scenery config
const GradientBackground = ({ top, bottom }: { top: string; bottom: string }) => {
  return (
    <mesh scale={[100, 100, 100]} position={[0, -10, 0]} renderOrder={-1}>
      <sphereGeometry args={[1, 64, 64]} />
      <shaderMaterial
        side={THREE.BackSide}
        depthWrite={false}
        uniforms={{
          colorTop:    { value: new THREE.Color(top) },
          colorBottom: { value: new THREE.Color(bottom) },
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
            float h = smoothstep(0.45, 1.0, vUv.y);
            gl_FragColor = vec4(mix(colorBottom, colorTop, h), 1.0);
          }
        `}
      />
    </mesh>
  );
};

function GrassFloor({ color, repeat = 28 }: { color: string; repeat?: number }) {
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);
  const viewportWidth = useThree((state) => state.size.width);
  const useCompactTextures = viewportWidth < 1024;
  const maxAnisotropy = viewportWidth < 1024 ? 4 : 8;
  const contactShadowResolution = viewportWidth < 1024 ? 128 : 256;
  
  // Load grass textures from local public folder
  // REMOVED: roughnessMap (was causing "wet/blue" reflective look)
  /*
  const props = useTexture({
    map: '/textures/three/leaves/brown_mud_leaves_01_diff_1k.webp',
    normalMap: '/textures/three/leaves/brown_mud_leaves_01_nor_gl_1k.webp',
    aoMap: '/textures/three/leaves/brown_mud_leaves_01_arm_1k.webp',
  });
  */

  const texturePaths = useMemo(
    () => ({
      map: useCompactTextures
        ? '/textures/three/grass/grass_color_optimized.webp'
        : '/textures/three/grass/grass_color.webp',
      normalMap: useCompactTextures
        ? '/textures/three/grass/grass_normal_optimized.webp'
        : '/textures/three/grass/grass_normal.webp',
      aoMap: useCompactTextures
        ? '/textures/three/grass/grass_ao_optimized.webp'
        : '/textures/three/grass/grass_ao.webp',
    }),
    [useCompactTextures],
  );
  const props = useTexture(texturePaths);

  useEffect(() => {
    const anisotropy = Math.min(gl.capabilities.getMaxAnisotropy(), maxAnisotropy);

    [props.map, props.normalMap, props.aoMap].forEach((tex) => {
      if (tex) {
        tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(repeat, repeat);
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.anisotropy = anisotropy;
        tex.needsUpdate = true;
      }
    });

    // Diffuse map must be sRGB; normal + AO maps must be linear
    if (props.map) props.map.colorSpace = THREE.SRGBColorSpace;
    if (props.normalMap) props.normalMap.colorSpace = THREE.NoColorSpace;
    if (props.aoMap) props.aoMap.colorSpace = THREE.NoColorSpace;
  }, [props, gl, maxAnisotropy, repeat]);

  // Break up the obvious texture grid with broad, world-space colour variation.
  // This keeps the meadow to one material/draw call and costs no extra texture sample.
  useEffect(() => {
    const material = materialRef.current;
    if (!material) return;

    material.onBeforeCompile = (shader) => {
      shader.vertexShader = shader.vertexShader
        .replace(
          '#include <common>',
          '#include <common>\nvarying vec3 vGrassWorldPosition;',
        )
        .replace(
          '#include <worldpos_vertex>',
          '#include <worldpos_vertex>\nvGrassWorldPosition = (modelMatrix * vec4(transformed, 1.0)).xyz;',
        );
      shader.fragmentShader = shader.fragmentShader
        .replace(
          '#include <common>',
          '#include <common>\nvarying vec3 vGrassWorldPosition;',
        )
        .replace(
          '#include <tonemapping_fragment>',
          `
            float grassMacro =
              sin(vGrassWorldPosition.x * 0.42 + vGrassWorldPosition.z * 0.19) * 0.5 +
              sin(vGrassWorldPosition.z * 0.31 - vGrassWorldPosition.x * 0.13) * 0.3 +
              sin((vGrassWorldPosition.x + vGrassWorldPosition.z) * 0.08) * 0.2;
            float grassLuma = dot(gl_FragColor.rgb, vec3(0.299, 0.587, 0.114));
            gl_FragColor.rgb = mix(gl_FragColor.rgb, vec3(grassLuma), 0.12);
            gl_FragColor.rgb *= 0.96 + grassMacro * 0.08;
            #include <tonemapping_fragment>
          `,
        );
    };
    material.customProgramCacheKey = () => 'meadow-warm-multiscale-v2';
    material.needsUpdate = true;
    invalidate();
  }, [invalidate]);

  // The floor texture resolves independently from the monument geometry.
  // Requesting another demand-frame lets ContactShadows capture the fully
  // mounted stone instead of baking an empty scene on its first frame.
  useEffect(() => {
    invalidate();
  }, [invalidate, props]);

  return (
    <group position={[0, -0.01, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial
          ref={materialRef}
          map={props.map}
          normalMap={props.normalMap}
          aoMap={props.aoMap}
          color={color}
          roughness={1}
          normalScale={GRASS_NORMAL_SCALE}
          metalness={0}
          envMapIntensity={0}
          fog={true}
        />
      </mesh>
      
      {/* Soft AO-style shadow where granite meets the grass. */}
      <ContactShadows
        position={[0, 0.002, 0]}
        scale={15}
        blur={1.8}
        opacity={0.68}
        far={1.2}
        color="#001100"
        resolution={contactShadowResolution}
        frames={2}
      />
    </group>
  );
}

// Fallback if internet is slow/textures fail
function SimpleGroundFloor({ color }: { color: string }) {
  return (
    <group position={[0, -0.01, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial 
          color={color}
          roughness={1}
          metalness={0}
          envMapIntensity={0}
        />
      </mesh>
      <ContactShadows position={[0, 0.002, 0]} scale={15} blur={1.8} opacity={0.68} far={1.2} color="#001100" resolution={256} frames={2} />
    </group>
  );
}

// Red sand outback ground — CC0 texture from Poly Haven (red_sand)
function OutbackFloor({ color }: { color: string }) {
  const gl = useThree((state) => state.gl);
  const viewportWidth = useThree((state) => state.size.width);
  const useCompactTextures = viewportWidth < 1024;
  const maxAnisotropy = viewportWidth < 1024 ? 4 : 8;
  const contactShadowResolution = viewportWidth < 1024 ? 128 : 256;

  const texturePaths = useMemo(
    () => ({
      map: useCompactTextures
        ? '/textures/three/outback/red_sand_diff_1k.webp'
        : '/textures/three/outback/red_sand_diff_2k.jpg',
      normalMap: useCompactTextures
        ? '/textures/three/outback/red_sand_nor_gl_1k.webp'
        : '/textures/three/outback/red_sand_nor_gl_2k.jpg',
    }),
    [useCompactTextures],
  );
  const props = useTexture(texturePaths);

  const REPEAT_SCALE = 12; // bigger tiles = less visible tiling at close range

  useEffect(() => {
    const anisotropy = Math.min(gl.capabilities.getMaxAnisotropy(), maxAnisotropy);
    [props.map, props.normalMap].forEach((tex) => {
      if (tex) {
        tex.wrapS = tex.wrapT = THREE.MirroredRepeatWrapping;
        tex.repeat.set(REPEAT_SCALE, REPEAT_SCALE);
        tex.generateMipmaps = true;
        tex.minFilter = THREE.LinearMipmapLinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.anisotropy = anisotropy;
        tex.needsUpdate = true;
      }
    });
    if (props.map) props.map.colorSpace = THREE.SRGBColorSpace;
    if (props.normalMap) props.normalMap.colorSpace = THREE.NoColorSpace;
  }, [props, gl, maxAnisotropy]);

  return (
    <group position={[0, -0.01, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        {/* Bigger plane so sand stretches to the horizon treeline */}
        <planeGeometry args={[180, 180]} />
        <meshStandardMaterial
          map={props.map}
          normalMap={props.normalMap}
          color={color}
          roughness={1}
          normalScale={OUTBACK_NORMAL_SCALE}
          metalness={0}
          envMapIntensity={0}
          fog={true}
        />
      </mesh>
      <ContactShadows
        position={[0, 0.002, 0]}
        scale={15}
        blur={1.8}
        opacity={0.68}
        far={1.2}
        color="#1a0800"
        resolution={contactShadowResolution}
        frames={2}
      />
    </group>
  );
}

// Ring of sparse low scrub bushes mimicking the outback horizon treeline
function OutbackTreeline() {
  const SCRUB_COUNT = 160;
  const SHRUB_COUNT = 40;
  const scrubRef = useRef<THREE.InstancedMesh>(null);
  const shrubRef = useRef<THREE.InstancedMesh>(null);

  const scrubMatrices = useMemo(() => {
    const rng = lcg(42);
    const dummy = new THREE.Object3D();
    const result: THREE.Matrix4[] = [];
    for (let i = 0; i < SCRUB_COUNT; i++) {
      const angle = (i / SCRUB_COUNT) * Math.PI * 2 + rng() * 0.08;
      const radius = 48 + rng() * 14;  // much further — thin strip at horizon
      const sx = 0.9 + rng() * 1.4;
      const sy = 0.18 + rng() * 0.28;  // keep very flat/low
      const sz = 0.9 + rng() * 1.2;
      dummy.position.set(Math.cos(angle) * radius, sy * 0.5, Math.sin(angle) * radius);
      dummy.scale.set(sx, sy, sz);
      dummy.rotation.y = rng() * Math.PI * 2;
      dummy.updateMatrix();
      result.push(dummy.matrix.clone());
    }
    return result;
  }, []);

  const shrubMatrices = useMemo(() => {
    const rng = lcg(77);
    const dummy = new THREE.Object3D();
    const result: THREE.Matrix4[] = [];
    for (let i = 0; i < SHRUB_COUNT; i++) {
      const angle = (i / SHRUB_COUNT) * Math.PI * 2 + rng() * 0.15;
      const radius = 50 + rng() * 12;  // same far distance
      const sy = 0.4 + rng() * 0.6;
      dummy.position.set(Math.cos(angle) * radius, sy * 0.4, Math.sin(angle) * radius);
      dummy.scale.set(0.4 + rng() * 0.5, sy, 0.4 + rng() * 0.5);
      dummy.rotation.y = rng() * Math.PI * 2;
      dummy.updateMatrix();
      result.push(dummy.matrix.clone());
    }
    return result;
  }, []);

  useEffect(() => {
    if (scrubRef.current) {
      scrubMatrices.forEach((mat, i) => scrubRef.current!.setMatrixAt(i, mat));
      scrubRef.current.instanceMatrix.needsUpdate = true;
    }
    if (shrubRef.current) {
      shrubMatrices.forEach((mat, i) => shrubRef.current!.setMatrixAt(i, mat));
      shrubRef.current.instanceMatrix.needsUpdate = true;
    }
  }, [scrubMatrices, shrubMatrices]);

  return (
    <>
      {/* Low wide scrubs */}
      <instancedMesh ref={scrubRef} args={[undefined, undefined, SCRUB_COUNT]}>
        <sphereGeometry args={[1, 10, 7]} />
        <meshStandardMaterial color="#3d5428" roughness={1} metalness={0} envMapIntensity={0} fog={true} />
      </instancedMesh>
      {/* Occasional taller shrubs for depth variation */}
      <instancedMesh ref={shrubRef} args={[undefined, undefined, SHRUB_COUNT]}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color="#2e4020" roughness={1} metalness={0} envMapIntensity={0} fog={true} />
      </instancedMesh>
    </>
  );
}

// A subtle, low silhouette band breaks the perfectly straight meadow horizon
// without loading a tree model or adding per-object draw calls.
function MeadowHorizon() {
  const SHRUB_COUNT = 128;
  const shrubRef = useRef<THREE.InstancedMesh>(null);

  const shrubMatrices = useMemo(() => {
    const rng = lcg(103);
    const dummy = new THREE.Object3D();
    const result: THREE.Matrix4[] = [];

    for (let i = 0; i < SHRUB_COUNT; i++) {
      const angle = (i / SHRUB_COUNT) * Math.PI * 2 + rng() * 0.09;
      const radius = 50 + rng() * 24;
      const height = 0.28 + rng() * 0.8;
      const width = 1.25 + rng() * 2.1;
      dummy.position.set(
        Math.cos(angle) * radius,
        height * 0.5,
        Math.sin(angle) * radius,
      );
      dummy.scale.set(width, height, width * (0.55 + rng() * 0.28));
      dummy.rotation.y = rng() * Math.PI * 2;
      dummy.updateMatrix();
      result.push(dummy.matrix.clone());
    }

    return result;
  }, []);

  useEffect(() => {
    if (!shrubRef.current) return;
    shrubMatrices.forEach((matrix, index) => shrubRef.current!.setMatrixAt(index, matrix));
    shrubRef.current.instanceMatrix.needsUpdate = true;
  }, [shrubMatrices]);

  return (
    <instancedMesh ref={shrubRef} args={[undefined, undefined, SHRUB_COUNT]}>
      <sphereGeometry args={[1, 8, 5]} />
      <meshStandardMaterial
        color="#566643"
        roughness={1}
        metalness={0}
        envMapIntensity={0}
      />
    </instancedMesh>
  );
}

function MemorialFoundation({
  width,
  depth,
  centerZ,
}: {
  width: number;
  depth: number;
  centerZ: number;
}) {
  const geometry = useMemo(
    () => new RoundedBoxGeometry(width, 0.1, depth, 4, 0.008),
    [width, depth],
  );
  const concreteTexture = useMemo(() => {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    if (!context) return null;

    const pixels = context.createImageData(size, size);
    const random = lcg(0x4c7a31);
    for (let i = 0; i < pixels.data.length; i += 4) {
      const grain = 108 + Math.floor(random() * 24);
      const aggregate = random() > 0.972 ? (random() > 0.5 ? 38 : -32) : 0;
      pixels.data[i] = grain + aggregate + 4;
      pixels.data[i + 1] = grain + aggregate + 3;
      pixels.data[i + 2] = grain + aggregate;
      pixels.data[i + 3] = 255;
    }
    context.putImageData(pixels, 0, 0);
    // Larger aggregate marks remain visible at the camera distance where
    // single-pixel noise would collapse into a flat grey band.
    for (let i = 0; i < 340; i += 1) {
      const shade = random() > 0.5 ? 'rgba(62, 63, 59, 0.42)' : 'rgba(174, 173, 166, 0.3)';
      context.fillStyle = shade;
      const sizePx = 1 + Math.floor(random() * 4);
      context.fillRect(
        Math.floor(random() * size),
        Math.floor(random() * size),
        sizePx,
        sizePx,
      );
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(Math.max(1, width / 0.5), Math.max(1, depth / 0.5));
    texture.anisotropy = 4;
    texture.needsUpdate = true;
    return texture;
  }, [width, depth]);

  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => concreteTexture?.dispose(), [concreteTexture]);

  return (
    <mesh
      geometry={geometry}
      // The 100 mm slab top sits 5 mm above grass: thick enough to read as a
      // proper pad while avoiding z-fighting with the ground plane.
      position={[0, -0.045, centerZ]}
      castShadow
      receiveShadow
      name="concrete-foundation"
    >
      <meshStandardMaterial
        map={concreteTexture ?? undefined}
        roughnessMap={concreteTexture ?? undefined}
        color="#96968e"
        roughness={0.9}
        metalness={0}
        envMapIntensity={0.15}
      />
    </mesh>
  );
}

function FoundationContactShadow({
  width,
  depth,
  centerZ,
  padding = 0.26,
  opacity = 0.58,
}: {
  width: number;
  depth: number;
  centerZ: number;
  padding?: number;
  opacity?: number;
}) {
  const texture = useMemo(() => {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');
    if (!context) return null;

    context.clearRect(0, 0, size, size);
    context.filter = 'blur(18px)';
    context.fillStyle = 'rgba(0, 0, 0, 0.78)';
    context.fillRect(34, 34, size - 68, size - 68);
    context.filter = 'none';

    const next = new THREE.CanvasTexture(canvas);
    next.colorSpace = THREE.NoColorSpace;
    next.needsUpdate = true;
    return next;
  }, []);

  useEffect(() => () => texture?.dispose(), [texture]);

  return (
    <mesh
      position={[0, -0.0085, centerZ]}
      rotation={[-Math.PI / 2, 0, 0]}
      renderOrder={1}
      name="foundation-contact-shadow"
    >
      <planeGeometry args={[width + padding, depth + padding]} />
      <meshBasicMaterial
        map={texture ?? undefined}
        color="#071006"
        transparent
        opacity={opacity}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
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
  const { scene, gl, camera } = useThree();
  const is2DMode = useHeadstoneStore((s) => s.is2DMode);
  const screenshotMode = useHeadstoneStore((s) => s.screenshotMode);
  const hideScenery = useHeadstoneStore((s) => s.hideScenery);
  const baseSwapping = useHeadstoneStore((s) => s.baseSwapping);
  const sceneryVariant = useHeadstoneStore((s) => s.sceneryVariant);
  const cfg = SCENERY[sceneryVariant];

  // Camera movement changes the view, not the light or model. Reusing the
  // spotlight shadow map during orbiting avoids an expensive extra scene pass.
  // Store changes and active geometry transitions explicitly mark it dirty.
  useEffect(() => {
    gl.shadowMap.autoUpdate = false;
    gl.shadowMap.needsUpdate = true;
    const unsubscribe = useHeadstoneStore.subscribe(() => {
      gl.shadowMap.needsUpdate = true;
    });

    return () => {
      unsubscribe();
      gl.shadowMap.autoUpdate = true;
      gl.shadowMap.needsUpdate = true;
    };
  }, [gl]);

  // Any mode that suppresses the outdoor scene (screenshot capture or user toggle)
  const noScenery = screenshotMode || hideScenery;

  // Expose scene, renderer & camera for external tools (batch screenshot, save thumbnail)
  useEffect(() => {
    (window as unknown as Record<string, unknown>).__r3fScene = scene;
    (window as unknown as Record<string, unknown>).__r3fGL = gl;
    (window as unknown as Record<string, unknown>).__r3fCamera = camera;
    return () => {
      delete (window as unknown as Record<string, unknown>).__r3fScene;
      delete (window as unknown as Record<string, unknown>).__r3fGL;
      delete (window as unknown as Record<string, unknown>).__r3fCamera;
    };
  }, [scene, gl, camera]);

  // Imperatively clear fog and background when hideScenery is active.
  // This guarantees THREE.js state is cleared regardless of R3F reconciler timing.
  useEffect(() => {
    if (hideScenery) {
      scene.background = null; // Let CSS backgroundColor on the canvas container show through
      scene.fog = null;
    }
  }, [hideScenery, scene]);
  const shapeUrl = useHeadstoneStore((s) => s.shapeUrl);
  const loading = useHeadstoneStore((s) => s.loading);
  const setSelected = useHeadstoneStore((s) => s.setSelected);
  const setEditingObject = useHeadstoneStore((s) => s.setEditingObject);
  const setSelectedInscriptionId = useHeadstoneStore((s) => s.setSelectedInscriptionId);
  const setSelectedAdditionId = useHeadstoneStore((s) => s.setSelectedAdditionId);
  const setSelectedMotifId = useHeadstoneStore((s) => s.setSelectedMotifId);
  const setSelectedImageId = useHeadstoneStore((s) => s.setSelectedImageId);
  const setSelectedEmblemId = useHeadstoneStore((s) => s.setSelectedEmblemId);
  const productType = useHeadstoneStore((s) => s.catalog?.product.type);
  const productId = useHeadstoneStore((s) => s.productId);
  const widthMm = useHeadstoneStore((s) => s.widthMm);
  const baseWidthMm = useHeadstoneStore((s) => s.baseWidthMm);
  const selectedAdditions = useHeadstoneStore((s) => s.selectedAdditions);
  const additionOffsets = useHeadstoneStore((s) => s.additionOffsets);
  const baseOption = useHeadstoneStore((s) => s.baseOption);
  const showBase = useHeadstoneStore((s) => s.showBase);
  const ledgerDepthMm = useHeadstoneStore((s) => s.ledgerDepthMm);
  const kerbWidthMm = useHeadstoneStore((s) => s.kerbWidthMm);
  const kerbDepthMm = useHeadstoneStore((s) => s.kerbDepthMm);
  const baseThickness = useHeadstoneStore((s) => s.baseThickness);
  const uprightThickness = useHeadstoneStore((s) => s.uprightThickness);
  const isFullMonument = productType === 'full-monument';
  const isPlaque = productType === 'plaque' || productType === 'bronze_plaque';
  const isUrn = productType === 'urn';
  const isMiniHeadstone = productId === '22';
  const assemblyZOffset = -(ledgerDepthMm / 1000);
  // Extend from behind the upright/base to just beyond the kerb's front edge;
  // a full monument's foundation must support both, not only the grave slab.
  const foundationRearZ = assemblyZOffset - (uprightThickness / 1000) / 2 - 0.08;
  const foundationFrontZ =
    assemblyZOffset -
    (uprightThickness / 1000) / 2 +
    baseThickness / 1000 +
    kerbDepthMm / 1000 +
    0.08;
  const foundationCenterZ = (foundationRearZ + foundationFrontZ) / 2;
  const foundationDepth = foundationFrontZ - foundationRearZ;
  const hasBaseMountedStatueOrVase = useMemo(
    () =>
      selectedAdditions.some((instanceId) => {
        if ((additionOffsets[instanceId]?.targetSurface ?? 'headstone') !== 'base') {
          return false;
        }

        const baseId = instanceId.replace(/_\d+$/, '');
        const type = data.additions.find((addition) => addition.id === baseId)?.type;
        return type === 'statue' || type === 'vase';
      }),
    [additionOffsets, selectedAdditions],
  );
  // HeadstoneBaseAuto expands the granite base by 30% for a base-mounted vase
  // or statue, and makes it 50% deeper. The concrete pad must use the same
  // footprint and alignment.
  const baseFootprintWidth =
    (baseWidthMm / 1000) * (hasBaseMountedStatueOrVase || baseOption === 'flower-pots' ? 1.3 : 1);
  const baseFootprintDepth =
    (baseThickness / 1000) * (hasBaseMountedStatueOrVase || baseOption === 'flower-pots' ? 1.5 : 1);
  const contactWidth = showBase ? baseFootprintWidth : widthMm / 1000;
  const contactDepth = showBase ? baseFootprintDepth : uprightThickness / 1000;
  const contactCenterZ = showBase
    ? -(uprightThickness / 1000) / 2 + contactDepth / 2
    : 0;
  const standaloneFoundationPadding = isMiniHeadstone ? 0.04 : 0.16;
  const hasStandaloneHeadstoneFoundation =
    !isFullMonument &&
    !isPlaque &&
    !isUrn &&
    showBase &&
    contactWidth > 0 &&
    contactDepth > 0;

  // For full monument the whole assembly is shifted back by ledgerDepthMm/1000 in Z.
  // The camera target needs to follow: lower Y (ledger is at ground level, not 3.8m up)
  // and negative Z to orbit around the centre of the grave plot.
  // For plaques: they sit near ground level (Y≈0.1m), so target much lower than headstones.
  const orbitTarget: [number, number, number] = isFullMonument
    ? [0, 0.8, -(ledgerDepthMm / 1000) * 0.55]
    : isPlaque
      ? [0, 0.15, 0]
      : [0, 3.8, 0];
  const viewportWidth = useThree((state) => state.size.width);
  const isMobileViewport = viewportWidth < 1024;
  // Keep the meadow texture density stable across products so the floor does
  // not change character when switching between headstones and plaques.
  const grassRepeat = 180;

  // Outback needs fog pushed further so the red dirt stretches to the treeline
  const fogSettings = sceneryVariant === 'outback'
    ? (isMobileViewport ? { near: 22, far: 60 } : { near: 25, far: 80 })
    : (isMobileViewport ? { near: 7, far: 22 } : { near: 7, far: 38 });

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


  // Smooth rotation animation — for full monument, rotate around the orbit target's Z pivot
  // so the monument spins around its visual centre rather than world origin.
  useFrame((state) => {
    if (groupRef.current && currentRotation) {
      const diff = targetRotation - currentRotation.current;
      
      if (Math.abs(diff) > 0.001) {
        currentRotation.current += diff * 0.1;
        const angle = currentRotation.current;
        groupRef.current.rotation.y = angle;

        if (isFullMonument) {
          // Pivot at the same Z as orbitTarget so arrow rotation matches orbit behaviour.
          // To keep world point [0,0,p] stationary while rotating by angle:
          //   position.x = -p * sin(angle)
          //   position.z =  p * (1 - cos(angle))
          const pivotZ = -(ledgerDepthMm / 1000) * 0.55;
          groupRef.current.position.x = -pivotZ * Math.sin(angle);
          groupRef.current.position.z = pivotZ * (1 - Math.cos(angle));
        }

        // Continue a demand-rendered frame loop only while the rotation is
        // still converging. Once it settles, the canvas becomes idle again.
        state.gl.shadowMap.needsUpdate = true;
        state.invalidate();
      }
    }
  });

  const DRAG_DESELECT_THRESHOLD = 4;

  const handleSceneryClick = (e: ThreeEvent<MouseEvent>) => {
    // Ignore drag gestures (OrbitControls rotation/pan)
    if (e.delta > DRAG_DESELECT_THRESHOLD) {
      return;
    }

    e.stopPropagation();
    setSelected(null);
    setEditingObject('headstone');
    setSelectedInscriptionId(null);
    setSelectedAdditionId(null);
    setSelectedMotifId(null);
    setSelectedImageId(null);
    setSelectedEmblemId(null);
  };

  // SunRays look natural for day scenery; outback daylight is direct — no shafts needed
  const showSunRays =
    !isMobileViewport &&
    !is2DMode &&
    !noScenery &&
    !loading &&
    !baseSwapping &&
    sceneryVariant !== 'outback';

  return (
    <>
      {/* Background: screenshot uses pure white; normal scenery uses sky colour from config;
          hideScenery mode clears background (CSS on container div provides the colour) */}
      {screenshotMode && <color attach="background" args={['#ffffff']} />}
      {!is2DMode && !noScenery && <color attach="background" args={[cfg.bgSky]} />}
      
      {/* Fog: outback only — meadow has a clear open sky with no distance haze */}
      {!is2DMode && !noScenery && sceneryVariant === 'outback' && (
        <fog attach="fog" args={[cfg.fogColor2, fogSettings.near, fogSettings.far]} />
      )}
      
      <mesh
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={handleSceneryClick}
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

        {/* A discreet concrete pad anchors full monuments in the ground. */}
        {isFullMonument && (
          <>
            <FoundationContactShadow
              width={kerbWidthMm / 1000 + 0.16}
              depth={foundationDepth}
              centerZ={foundationCenterZ}
            />
            <MemorialFoundation
              width={kerbWidthMm / 1000 + 0.16}
              depth={foundationDepth}
              centerZ={foundationCenterZ}
            />
          </>
        )}

        {/* Use the same concrete pad and grounding shadow as Full Monuments. */}
        {hasStandaloneHeadstoneFoundation && (
          <>
            <FoundationContactShadow
              width={contactWidth + standaloneFoundationPadding}
              depth={contactDepth + standaloneFoundationPadding}
              centerZ={contactCenterZ}
            />
            <MemorialFoundation
              width={contactWidth + standaloneFoundationPadding}
              depth={contactDepth + standaloneFoundationPadding}
              centerZ={contactCenterZ}
            />
          </>
        )}

        {/* Products without a granite base still receive a compact contact shadow. */}
        {!isFullMonument && !hasStandaloneHeadstoneFoundation && contactWidth > 0 && contactDepth > 0 && (
          <FoundationContactShadow
            width={contactWidth}
            depth={contactDepth}
            centerZ={contactCenterZ}
            padding={0.12}
            opacity={0.5}
          />
        )}

        {/* Headstone content manages its own suspense boundaries internally */}
        <HeadstoneAssembly />
        
        {/* TEXTURED FLOOR — hidden in no-scenery modes via visible prop */}
        <group visible={!noScenery} onClick={handleSceneryClick}>
          {sceneryVariant === 'outback' ? (
            <Suspense fallback={<SimpleGroundFloor color={cfg.grassColor} />}>
              <OutbackFloor color={cfg.grassColor} />
            </Suspense>
          ) : (
            <Suspense fallback={<SimpleGroundFloor color={cfg.grassColor} />}>
              <GrassFloor color={cfg.grassColor} repeat={grassRepeat} />
            </Suspense>
          )}
          {/* A thin silhouette band keeps the horizon from reading as a hard line. */}
          {sceneryVariant === 'outback' && <OutbackTreeline />}
          {sceneryVariant === 'day' && <MeadowHorizon />}
        </group>
      </group>

      {/* Sparkles / clouds / sky gradient — toggle visibility directly on the group */}
      <group visible={!is2DMode && !noScenery} onClick={handleSceneryClick}>
        <Sparkles
          count={cfg.sparklesCount}
          scale={cfg.sparklesScale}
          size={cfg.sparklesSize}
          speed={cfg.sparklesSpeed}
          opacity={cfg.sparklesOpacity}
          color={cfg.sparklesColor}
          position={cfg.sparklesPosition}
        />
        {/* Outback has a clear open sky — no cartoon clouds */}
        {sceneryVariant !== 'outback' && (
          <Suspense fallback={null}>
            <AtmosphericSky
              showDome={false}
              cloudColor={cfg.cloudColor}
              compact={isMobileViewport}
            />
          </Suspense>
        )}
        <GradientBackground top={cfg.gradientTop} bottom={cfg.gradientBottom} />
      </group>
      
      {/* --- LIGHTING — tinted per scenery variant --- */}
      <ambientLight intensity={cfg.ambientIntensity} color={cfg.ambientColor} />
      <hemisphereLight args={[cfg.hemiSky, cfg.hemiGround]} intensity={cfg.hemiIntensity} />
      <spotLight 
        color={cfg.sunColor}
        intensity={cfg.sunIntensity}
        angle={0.6}
        penumbra={1}
        position={[-10, 12, 12]}
        castShadow
        shadow-bias={-0.0001}
        shadow-mapSize={isMobileViewport ? [512, 512] : [1024, 1024]}
      />
      {isMobileViewport && (
        <directionalLight
          color="#e8f1ff"
          intensity={0.7}
          position={[4, 5, 8]}
        />
      )}
      {/* Rim light (Back Right) - Separates stone from background */}
      {!isMobileViewport && (
        <spotLight
          color={cfg.rimColor}
          intensity={cfg.rimIntensity}
          position={[5, 5, -5]}
          distance={30}
        />
      )}

      <Environment
        files="/hdri/spring.hdr"
        background={false}
        resolution={isMobileViewport ? 128 : 512}
        environmentIntensity={0.5}
      />

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
        minPolarAngle={isFullMonument ? Math.PI / 6 : Math.PI / 3.5}
        maxPolarAngle={Math.PI / 2 - 0.05}
        // FullMonumentFit animates both camera position and target when an
        // upright/base is selected. A declarative fixed target here can win a
        // later React commit and produce a final-frame snap back to the plot.
        target={isFullMonument ? undefined : orbitTarget}
      />
    </>
  );
}
