'use client';

import * as React from 'react';
import * as THREE from 'three';
import { useGLTF, useTexture } from '@react-three/drei';
import { useHeadstoneStore } from '#/lib/headstone-store';
import type { HeadstoneAPI } from '../SvgHeadstone';

type Props = {
  id: string; // e.g. "1134" or "B1134S"
  headstone?: HeadstoneAPI; // passed from SvgHeadstone render-prop
  index?: number; // layering/z-fight avoidance
};

function useNormalizedGLTF(id: string) {
  const [error, setError] = React.useState<Error | null>(null);
  const [loading, setLoading] = React.useState(true);
  
  // Sanitize the ID to prevent path traversal
  const sanitizedId = React.useMemo(() => {
    try {
      // Basic sanitization - remove any non-alphanumeric characters except hyphen/underscore
      const cleaned = id.replace(/[^a-zA-Z0-9_-]/g, '');
      if (!cleaned) throw new Error('Invalid addition ID');
      return cleaned;
    } catch (err) {
      setError(err as Error);
      return '';
    }
  }, [id]);

  // Try primary path first, fallback to Art{id} path
  let gltf: any = null;
  
  try {
    if (sanitizedId) {
      try {
        gltf = useGLTF(`/additions/${sanitizedId}/${sanitizedId}.gltf`);
        setLoading(false);
      } catch (primaryError) {
        try {
          gltf = useGLTF(`/additions/${sanitizedId}/Art${sanitizedId}.gltf`);
          setLoading(false);
        } catch (fallbackError) {
          setError(new Error(`Failed to load model for ID: ${sanitizedId}`));
          setLoading(false);
        }
      }
    }
  } catch (err) {
    setError(err as Error);
    setLoading(false);
  }

  const scene = React.useMemo(() => {
    if (!gltf?.scene) return null;
    return gltf.scene.clone(true);
  }, [gltf?.scene]);

  const size = React.useMemo(() => {
    if (!scene) return new THREE.Vector3(1, 1, 1);
    
    const box = new THREE.Box3().setFromObject(scene);
    const sz = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(sz);
    box.getCenter(center);
    scene.position.sub(center); // center origin

    scene.traverse((o: any) => (o.frustumCulled = false));
    return sz;
  }, [scene]);

  return { scene, size, loading, error };
}

export default function AdditionModel({ id, headstone, index = 0 }: Props) {
  const numericId = id.replace(/[^\d]/g, '') || id;

  // store
  const setAdditionRef = useHeadstoneStore((s) => s.setAdditionRef);
  const additionOffsets = useHeadstoneStore((s) => s.additionOffsets);
  const setAdditionOffset = useHeadstoneStore((s) => s.setAdditionOffset);
  const ref = React.useRef<THREE.Group>(null!);

  React.useEffect(() => {
    setAdditionRef(id, ref);
  }, [id, setAdditionRef]);

  // ✅ guard: if headstone API isn’t ready yet, don’t render anything
  const stone = headstone?.mesh?.current as THREE.Mesh | null;
  if (!headstone || !stone) {
    return null;
  }

  // load model with error handling
  const { scene, size, loading, error } = useNormalizedGLTF(numericId);
  
  // Handle loading error - show placeholder
  if (error) {
    console.error('AdditionModel error:', error);
    return (
      <group ref={ref}>
        <mesh>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshStandardMaterial color="red" opacity={0.5} transparent />
        </mesh>
      </group>
    );
  }
  
  // Handle loading state
  if (loading || !scene) {
    return null;
  }

  // Load texture with error handling
  let colorMap: THREE.Texture | null = null;
  try {
    colorMap = useTexture(`/additions/${numericId}/colorMap.png`);
  } catch (texError) {
    console.warn(`Failed to load texture for addition ${numericId}:`, texError);
  }

  React.useEffect(() => {
    if (!scene || !colorMap) return;
    
    scene.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        if (colorMap) {
          child.material.map = colorMap;
          child.material.needsUpdate = true;
        }
      }
    });
  }, [scene, colorMap]);

  // bbox in HEADSTONE LOCAL SPACE
  if (!stone.geometry.boundingBox) stone.geometry.computeBoundingBox();
  const bbox = stone.geometry.boundingBox!.clone();

  const inset = 0.01;
  const spanY = bbox.max.y - bbox.min.y;
  const minX = bbox.min.x + inset;
  const maxX = bbox.max.x - inset;
  const minY = bbox.min.y + inset + 0.04 * spanY; // keep off bottom ledge
  const maxY = bbox.max.y - inset;

  const defaultOffset = React.useMemo(
    () => ({
      xPos: THREE.MathUtils.lerp(minX, maxX, 0.5),
      yPos: THREE.MathUtils.lerp(minY, maxY, 0.6),
      scale: 1,
      rotationZ: 0,
    }),
    [minX, maxX, minY, maxY],
  );

  const offset = additionOffsets[id] ?? defaultOffset;

  // scale: make model about 18 cm tall by default
  const targetH = 0.18;
  const h = Math.max(1e-6, size.z);
  const auto = targetH / h;
  const user = Math.max(0.05, Math.min(5, offset.scale ?? 1));
  const finalScale = auto * user;

  return (
    <group
      ref={ref}
      position={[0, 0, 0]}
      rotation={[0, 0, 0]}
      scale={[finalScale, finalScale, finalScale]}
    >
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload('/additions/1134/1134.gltf');
useGLTF.preload('/additions/1134/Art1134.gltf');
