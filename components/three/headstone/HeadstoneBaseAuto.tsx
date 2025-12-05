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
}: {
  baseRef: React.RefObject<THREE.Mesh | null>;
  baseTexture: THREE.Texture;
  onClick?: (e: any) => void;
  name?: string;
}) {
  return (
    <mesh
      ref={baseRef}
      name={name}
      onClick={onClick}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial
        map={baseTexture}
        metalness={0.1}
        roughness={0.15}
        envMapIntensity={1.5}
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

    useFrame(() => {
      const t = headstoneObject.current;
      const w = wrapper.current;
      const b = baseRef.current;
      if (!t || !w || !b) return;

      // Use actual headstone dimensions from store (in meters)
      // With normalized geometry, the headstone always has width=widthMm/1000, height=heightMm/1000
      const hsW = widthMm / 1000;
      const hsH = heightMm / 1000;
      
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
      
      // Position base center at Y = height/2 (base spans from 0 to height in world space)
      const centerW = new THREE.Vector3(
        -xOffset, // Center X (shifted if statue)
        height * 0.5 + EPSILON, // Center at half height above Y=0
        baseD * 0.5 // Center Z at half depth
      );

      w.updateWorldMatrix(true, false);
      invMatrix.current.copy(w.matrixWorld).invert();
      const posLocal = centerW.applyMatrix4(invMatrix.current);

      // Base scale is absolute (not relative to wrapper scale)
      targetPos.current.copy(posLocal);
      targetScale.current.set(baseW, height, baseD);

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
