'use client';
import { OrbitControls, Environment, ContactShadows, useTexture, Sparkles } from '@react-three/drei';
// REMOVED: EffectComposer & DepthOfField (Causing artifacts)
import * as THREE from 'three';
import HeadstoneAssembly from './headstone/HeadstoneAssembly';
import SunRays from './SunRays';
import AtmosphericSky from './AtmosphericSky';
import { useHeadstoneStore } from '#/lib/headstone-store';

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
    grassColor:       '#4a6e28',
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
    cloudColor:       '#ffffff',
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

const GRASS_NORMAL_SCALE = new THREE.Vector2(1.2, 1.2);
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

  useEffect(() => {
    const anisotropy = Math.min(gl.capabilities.getMaxAnisotropy(), 16);

    [props.map, props.normalMap, props.aoMap].forEach((tex) => {
      if (tex) {
        // MirroredRepeatWrapping flips adjacent tiles — breaks the obvious grid pattern
        tex.wrapS = tex.wrapT = THREE.MirroredRepeatWrapping;
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
  }, [props, gl, repeat]);

  return (
    <group position={[0, -0.01, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[300, 300]} />
        <meshStandardMaterial 
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
      <ContactShadows position={[0, 0.02, 0]} scale={15} blur={2.5} opacity={0.6} far={1.5} color="#001100" resolution={256} frames={1} />
    </group>
  );
}

// Red sand outback ground — CC0 texture from Poly Haven (red_sand)
function OutbackFloor({ color }: { color: string }) {
  const gl = useThree((state) => state.gl);

  const props = useTexture({
    map: '/textures/three/outback/red_sand_diff_2k.jpg',
    normalMap: '/textures/three/outback/red_sand_nor_gl_2k.jpg',
  });

  const REPEAT_SCALE = 12; // bigger tiles = less visible tiling at close range

  useEffect(() => {
    const anisotropy = Math.min(gl.capabilities.getMaxAnisotropy(), 16);
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
  }, [props, gl]);

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
        position={[0, 0.02, 0]}
        scale={15}
        blur={2.5}
        opacity={0.5}
        far={1.5}
        color="#1a0800"
        resolution={256}
        frames={1}
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
  const productId = useHeadstoneStore((s) => s.productId);
  // SS plaque is tiny (300x200mm), so the camera auto-fits very close. Keep the
  // grass finer than default without oversampling into a noisy/pixelated pattern.
  const grassRepeat = productId === '52' ? 64 : 28;

  const cfg = SCENERY[sceneryVariant];

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
  const productType = useHeadstoneStore((s) => s.catalog?.product.type);
  const ledgerDepthMm = useHeadstoneStore((s) => s.ledgerDepthMm);
  const isFullMonument = productType === 'full-monument';
  const isPlaque = productType === 'plaque' || productType === 'bronze_plaque';

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
  useFrame(() => {
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

  // SunRays look natural for day scenery; outback daylight is direct — no shafts needed
  const showSunRays = !is2DMode && !noScenery && !loading && !baseSwapping && sceneryVariant !== 'outback';

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
        
        {/* TEXTURED FLOOR — hidden in no-scenery modes via visible prop */}
        <group visible={!noScenery}>
          {sceneryVariant === 'outback' ? (
            <Suspense fallback={<SimpleGroundFloor color={cfg.grassColor} />}>
              <OutbackFloor color={cfg.grassColor} />
            </Suspense>
          ) : (
            <Suspense fallback={<SimpleGroundFloor color={cfg.grassColor} />}>
              <GrassFloor color={cfg.grassColor} repeat={grassRepeat} />
            </Suspense>
          )}
          {/* Horizon treeline — outback only */}
          {sceneryVariant === 'outback' && <OutbackTreeline />}
        </group>
      </group>

      {/* Sparkles / clouds / sky gradient — toggle visibility directly on the group */}
      <group visible={!is2DMode && !noScenery}>
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
            <AtmosphericSky showDome={false} cloudColor={cfg.cloudColor} />
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
        shadow-mapSize={[1024, 1024]}
      />
      {/* Rim light (Back Right) - Separates stone from background */}
      <spotLight color={cfg.rimColor} intensity={cfg.rimIntensity} position={[5, 5, -5]} distance={30} />

      <Environment files="/hdri/spring.hdr" background={false} resolution={512} environmentIntensity={0.5} />

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
        target={orbitTarget}
      />
    </>
  );
}
