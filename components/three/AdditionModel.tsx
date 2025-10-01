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
  // try /additions/1134/1134.gltf ; fallback /additions/1134/Art1134.gltf
  let gltf: any;
  try {
    gltf = useGLTF(`/additions/${id}/${id}.gltf`);
  } catch {
    gltf = useGLTF(`/additions/${id}/Art${id}.gltf`);
  }

  const scene = React.useMemo(() => gltf.scene.clone(true), [gltf.scene]);

  const size = React.useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const sz = new THREE.Vector3();
    const center = new THREE.Vector3();
    box.getSize(sz);
    box.getCenter(center);
    scene.position.sub(center); // center origin
    
    scene.traverse((o: any) => (o.frustumCulled = false));
    return sz;
  }, [scene]);

  return { scene, size };
}

export default function AdditionModel({ id, headstone, index = 0 }: Props) {
  console.log("Rendering AdditionModel");
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

  // load model
  const { scene, size } = useNormalizedGLTF(numericId);
  const colorMap = useTexture(`/additions/${numericId}/colorMap.png`);

  React.useEffect(() => {
    console.log("Applying texture");
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        console.log("Updating material for mesh:", child);
        child.material.map = colorMap;
        child.material.needsUpdate = true;
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
