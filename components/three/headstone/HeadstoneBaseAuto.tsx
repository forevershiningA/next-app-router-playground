'use client';
import * as THREE from 'three';
import React, {
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
  Suspense,
} from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { useHeadstoneStore } from '#/lib/headstone-store';
import {
  TEX_BASE,
  DEFAULT_TEX,
  BASE_WIDTH_MULTIPLIER,
  BASE_DEPTH_MULTIPLIER,
  BASE_MIN_WIDTH,
  BASE_MIN_DEPTH,
  LERP_FACTOR,
  EPSILON,
} from '#/lib/headstone-constants';

// Base statue width multiplier constant
const STATUE_BASE_WIDTH_MULTIPLIER = 1.25;

type HeadstoneBaseAutoProps = {
  headstoneObject: React.RefObject<THREE.Object3D>;
  wrapper: React.RefObject<THREE.Object3D>;
  onClick?: (e: any) => void;
  height?: number;
  name?: string;
};

function PreloadTexture({
  url,
  onReady,
}: {
  url: string;
  onReady?: () => void;
}) {
  useTexture(url);
  React.useEffect(() => {
    const id = requestAnimationFrame(() => onReady?.());
    return () => cancelAnimationFrame(id);
  }, [onReady]);
  return null;
}

function BaseMesh({
  baseRef,
  baseTexture,
  onClick,
  name,
  dimensions,
}: {
  baseRef: React.RefObject<THREE.Mesh | null>;
  baseTexture: THREE.Texture;
  onClick?: (e: any) => void;
  name?: string;
  dimensions: { width: number; height: number; depth: number };
}) {
  React.useEffect(() => {
    if (baseTexture) {
      baseTexture.wrapS = THREE.RepeatWrapping;
      baseTexture.wrapT = THREE.RepeatWrapping;
      
      // Calculate repeat based on dimensions to maintain consistent texture scale
      const textureScale = 0.15; // Size in meters that one texture tile should cover
      const repeatX = dimensions.width / textureScale;
      const repeatY = dimensions.height / textureScale;
      
      baseTexture.repeat.set(repeatX, repeatY);
      
      // Enable anisotropic filtering for better quality at angles
      baseTexture.anisotropy = 16; // Maximum quality
      
      baseTexture.needsUpdate = true;
    }
  }, [baseTexture, dimensions.width, dimensions.height, dimensions.depth]);

  return (
    <mesh
      ref={baseRef}
      name={name}
      onClick={onClick}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshPhysicalMaterial
        map={baseTexture}
        color={0x888888}
        metalness={0.0}
        roughness={0.15}
        envMapIntensity={1.5}
        clearcoat={1.0}
        clearcoatRoughness={0.1}
      />
    </mesh>
  );
}

const HeadstoneBaseAuto = forwardRef<THREE.Mesh, HeadstoneBaseAutoProps>(
  ({ headstoneObject, wrapper, onClick, height = 0.1, name }, ref) => {
    const baseRef = useRef<THREE.Mesh>(null);
    useImperativeHandle(ref, () => baseRef.current!);

    const baseMaterialUrl = useHeadstoneStore((s) => s.baseMaterialUrl);
    const setBaseSwapping = useHeadstoneStore((s) => s.setBaseSwapping);
    const hasStatue = useHeadstoneStore((s) => s.hasStatue);
    const widthMm = useHeadstoneStore((s) => s.widthMm);
    const heightMm = useHeadstoneStore((s) => s.heightMm);

    const requestedBaseTex = React.useMemo(() => {
      const file = baseMaterialUrl?.split('/').pop() ?? DEFAULT_TEX;
      // Keep the original extension or convert .jpg to .webp
      const webp = file.replace(/\.jpg$/i, '.webp');
      return TEX_BASE + webp;
    }, [baseMaterialUrl]);

    const [visibleBaseTex, setVisibleBaseTex] =
      React.useState(requestedBaseTex);

    const baseSwapping = requestedBaseTex !== visibleBaseTex;

    React.useEffect(() => {
      setBaseSwapping(baseSwapping);
    }, [baseSwapping, setBaseSwapping]);

    const baseTexture = useTexture(visibleBaseTex);

    const hasTx = useRef(false);
    const targetPos = useRef(new THREE.Vector3());
    const targetScale = useRef(new THREE.Vector3(1, height, 1));
    const invMatrix = useRef(new THREE.Matrix4());
    const [baseDimensions, setBaseDimensions] = React.useState({ 
      width: 1, 
      height: height, 
      depth: 1 
    });

    useFrame(() => {
      const t = headstoneObject.current;
      const w = wrapper.current;
      const b = baseRef.current;
      if (!t || !w || !b) return;

      // Use actual headstone dimensions from store (in meters)
      // With normalized geometry, the headstone always has width=widthMm/1000, height=heightMm/1000
      const hsW = widthMm / 1000;
      const hsH = heightMm / 1000;
      
      // Get headstone depth from mesh geometry
      // Headstone depth is 15 for regular, 5 for plaques (in SvgHeadstone units before 0.01 scale)
      // After 0.01 scale: depth = 0.15 for regular, 0.05 for plaques
      const headstoneDepth = 0.15; // Default for regular headstone
      
      // Extend base width by 200mm (0.2 units) if a statue is present
      const statueExtension = hasStatue() ? 0.2 : 0;
      let baseW = Math.max(hsW * BASE_WIDTH_MULTIPLIER + statueExtension, BASE_MIN_WIDTH);
      
      // Make the base wider when statue is added
      if (hasStatue()) {
        baseW = baseW * STATUE_BASE_WIDTH_MULTIPLIER;
      }
      
      const baseD = Math.max(0.2 * BASE_DEPTH_MULTIPLIER, BASE_MIN_DEPTH); // Default depth

      // Shift base center to the left when statue is present
      const xOffset = statueExtension / 2;
      
      // Align base back face with headstone back face
      // Headstone back face is at Z = -headstoneDepth/2
      // Base center should be at: backFace + baseD/2
      const baseZCenter = -(headstoneDepth / 2) + (baseD / 2);
      
      // Position base center at Y = height/2 (base spans from 0 to height in world space)
      const centerW = new THREE.Vector3(
        -xOffset, // Center X (shifted if statue)
        height * 0.5 + EPSILON, // Center at half height above Y=0
        baseZCenter // Align back face with headstone back face
      );

      w.updateWorldMatrix(true, false);
      invMatrix.current.copy(w.matrixWorld).invert();
      const posLocal = centerW.applyMatrix4(invMatrix.current);

      // Base scale is absolute (not relative to wrapper scale)
      targetPos.current.copy(posLocal);
      targetScale.current.set(baseW, height, baseD);

      // Update dimensions if changed
      if (baseDimensions.width !== baseW || 
          baseDimensions.height !== height || 
          baseDimensions.depth !== baseD) {
        setBaseDimensions({ width: baseW, height: height, depth: baseD });
      }

      if (!hasTx.current) {
        b.position.copy(targetPos.current);
        b.scale.copy(targetScale.current);
        hasTx.current = true;
      }
      
      // Always keep base visible once store says to show it
      b.visible = true;

      if (!hasTx.current) {
        return;
      }

      // Conditionally update position and scale
      if (!baseSwapping) {
        b.position.lerp(targetPos.current, LERP_FACTOR);
        b.scale.lerp(targetScale.current, LERP_FACTOR);
      }

      // Keep base visible even during swapping to avoid black flash
      b.visible = true;
    });

    return (
      <React.Fragment>
        <Suspense fallback={null}>
          <BaseMesh
            baseRef={baseRef}
            baseTexture={baseTexture}
            onClick={onClick}
            name={name}
            dimensions={baseDimensions}
          />
        </Suspense>

        {requestedBaseTex !== visibleBaseTex && (
          <Suspense fallback={null}>
            <PreloadTexture
              url={requestedBaseTex}
              onReady={() => {
                setVisibleBaseTex(requestedBaseTex);
              }}
            />
          </Suspense>
        )}
      </React.Fragment>
    );
  },
);

HeadstoneBaseAuto.displayName = 'HeadstoneBaseAuto';
export default HeadstoneBaseAuto;
