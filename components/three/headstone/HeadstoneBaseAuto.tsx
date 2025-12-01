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
        metalness={0}
        roughness={0.55}
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

    useFrame(() => {
      const t = headstoneObject.current;
      const w = wrapper.current;
      const b = baseRef.current;
      if (!t || !w || !b) return;

      // Update bounding box and target dimensions
      // Calculate bbox ONLY from headstone geometry, excluding additions and text
      t.updateWorldMatrix(true, true);
      const bb = new THREE.Box3();
      
      // Only include objects that are NOT additions or text in the bounding box
      t.traverse((child) => {
        if (child instanceof THREE.Mesh && child.geometry) {
          // Get all identifying info
          const parentName = child.parent?.name || '';
          const childName = child.name || '';
          const grandparentName = child.parent?.parent?.name || '';
          const geometryType = child.geometry.type || '';
          
          // Check for additions
          const isAddition = parentName.startsWith('addition-') || 
                            childName.startsWith('addition-') ||
                            grandparentName.startsWith('addition-');
          
          // Check for text/inscriptions - Text meshes from @react-three/drei
          const isText = geometryType === 'TextGeometry' || 
                        geometryType === 'ShapeGeometry' || // Text often uses ShapeGeometry
                        childName.toLowerCase().includes('text') || 
                        parentName.toLowerCase().includes('text') ||
                        grandparentName.toLowerCase().includes('text') ||
                        child.userData?.isText ||
                        // Check if it's a Text component by checking material
                        (child.material as any)?.uniforms?.map; // drei Text uses special shader
          
          // Only include headstone mesh (usually has ExtrudeGeometry)
          const isHeadstoneMesh = geometryType === 'ExtrudeGeometry';
          
          if (!isAddition && !isText && isHeadstoneMesh) {
            const childBox = new THREE.Box3().setFromObject(child);
            bb.union(childBox);
          }
        }
      });

      if (!bb.isEmpty()) {
        const { min, max } = bb;
        const hsW = Math.max(max.x - min.x, 1e-6);
        const hsD = Math.max(max.z - min.z, 1e-6);
        
        // Extend base width by 200mm (0.2 units) if a statue is present
        const statueExtension = hasStatue() ? 0.2 : 0;
        let baseW = Math.max(hsW * BASE_WIDTH_MULTIPLIER + statueExtension, BASE_MIN_WIDTH);
        
        // Make the base 25% wider when statue is added
        if (hasStatue()) {
          baseW = baseW * 1.25;
        }
        
        const baseD = Math.max(hsD * BASE_DEPTH_MULTIPLIER, BASE_MIN_DEPTH);

        // Shift base center to the left when statue is present
        // The extension is only on the left side, so move center by half the extension
        const xOffset = statueExtension / 2;
        
        const centerW = new THREE.Vector3(
          (min.x + max.x) / 2 - xOffset,
          min.y - height * 0.5 + EPSILON,
          min.z + baseD * 0.5
        );

        w.updateWorldMatrix(true, false);
        const inv = new THREE.Matrix4().copy(w.matrixWorld).invert();
        const posLocal = centerW.applyMatrix4(inv);

        const s = new THREE.Vector3();
        w.getWorldScale(s);

        targetPos.current.copy(posLocal);
        targetScale.current.set(baseW / s.x, height / s.y, baseD / s.z);

        if (!hasTx.current) {
          b.position.copy(targetPos.current);
          b.scale.copy(targetScale.current);
          b.visible = true;
          hasTx.current = true;
        }
      }

      if (!hasTx.current) {
        b.visible = false;
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
