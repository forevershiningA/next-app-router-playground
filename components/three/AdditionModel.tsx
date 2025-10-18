'use client';

import * as React from 'react';
import * as THREE from 'three';
import { useGLTF, useTexture } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useHeadstoneStore } from '#/lib/headstone-store';
import type { HeadstoneAPI } from '../SvgHeadstone';
import { data } from '#/app/_internal/_data';

type Props = {
  id: string; // e.g. "B1134S" or "K0320"
  headstone?: HeadstoneAPI; // passed from SvgHeadstone render-prop
  index?: number; // layering/z-fight avoidance
};

export default function AdditionModel({ id, headstone, index = 0 }: Props) {
  // Find the addition data first
  const addition = React.useMemo(() => {
    return data.additions.find((a) => a.id === id);
  }, [id]);

  console.log('AdditionModel rendering:', { id, hasAddition: !!addition, hasFile: !!addition?.file });

  // Early return if no addition or no file - before any hooks
  if (!addition || !addition.file) {
    console.warn(`Addition ${id} has no file data`);
    return null;
  }

  // Now we can safely use hooks knowing we have valid data
  return <AdditionModelInner id={id} addition={addition} headstone={headstone} index={index} />;
}

// Separate component where we can safely use hooks
function AdditionModelInner({ 
  id, 
  addition, 
  headstone, 
  index 
}: { 
  id: string; 
  addition: any; 
  headstone?: HeadstoneAPI; 
  index: number;
}) {
  // ALL hooks must be called unconditionally at the top - before any early returns
  const { gl, camera, controls } = useThree();
  const setAdditionRef = useHeadstoneStore((s) => s.setAdditionRef);
  const additionOffsets = useHeadstoneStore((s) => s.additionOffsets);
  const setSelectedAdditionId = useHeadstoneStore((s) => s.setSelectedAdditionId);
  const selectedAdditionId = useHeadstoneStore((s) => s.selectedAdditionId);
  const setAdditionOffset = useHeadstoneStore((s) => s.setAdditionOffset);
  const ref = React.useRef<THREE.Group>(null!);
  const [dragging, setDragging] = React.useState(false);
  
  // Load the GLB file path
  const glbPath = `/additions/${addition.file}`;
  const dirNum = addition.file.split('/')[0];
  
  // Load GLB and texture - these must be called unconditionally
  console.log('Loading GLB:', glbPath);
  const gltf = useGLTF(glbPath);
  const colorMap = useTexture(`/additions/${dirNum}/colorMap.png`);
  
  // These must come after other hooks but before conditional returns
  const raycaster = React.useMemo(() => new THREE.Raycaster(), []);
  const mouse = React.useMemo(() => new THREE.Vector2(), []);

  // Create scene
  const scene = React.useMemo(() => {
    if (!gltf?.scene) return null;
    console.log('GLTF scene loaded for', id);
    const cloned = gltf.scene.clone(true);
    
    // First, reset all child scales and calculate original bounding box
    cloned.traverse((child: any) => {
      child.frustumCulled = false;
      if (child instanceof THREE.Mesh) {
        // Reset scale to identity to get true model dimensions
        child.scale.set(1, 1, 1);
        child.visible = true;
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });
    
    // Get bounds at identity scale
    const tempBox = new THREE.Box3().setFromObject(cloned);
    const tempSize = new THREE.Vector3();
    tempBox.getSize(tempSize);
    
    console.log('Model dimensions at identity scale:', { id, size: tempSize });
    
    // Center the model at origin
    const tempCenter = new THREE.Vector3();
    tempBox.getCenter(tempCenter);
    cloned.position.sub(tempCenter);
    
    // Now rotate 180 degrees around Z to flip it right-side up
    cloned.rotation.z = Math.PI;
    
    console.log('Model setup complete:', { id });
    
    return cloned;
  }, [gltf?.scene, id]);

  const size = React.useMemo(() => {
    if (!scene) return new THREE.Vector3(1, 1, 1);
    
    // Calculate size after rotation  
    // Models are in mm at identity scale
    const box = new THREE.Box3().setFromObject(scene);
    const szMM = new THREE.Vector3();
    box.getSize(szMM);
    
    // Convert to headstone units (1 unit = 10mm)
    const sz = szMM.divideScalar(10);
    
    console.log('Model size:', { 
      id, 
      mm: szMM,
      headstonUnits: sz
    });
    return sz;
  }, [scene, id]);

  // Drag handler - must be defined before effects
  const placeFromClientXY = React.useCallback((clientX: number, clientY: number) => {
    if (!headstone?.mesh?.current || !gl?.domElement) return;
    
    const canvas = gl.domElement;
    const rect = canvas.getBoundingClientRect();
    mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    
    raycaster.setFromCamera(mouse, camera);
    const stone = headstone.mesh.current as THREE.Mesh;
    const intersects = raycaster.intersectObject(stone, false);
    
    if (intersects.length > 0) {
      const point = intersects[0].point;
      const localPt = stone.worldToLocal(point.clone());
      
      // Apply bounds checking
      if (!stone.geometry.boundingBox) stone.geometry.computeBoundingBox();
      const bbox = stone.geometry.boundingBox!;
      const inset = 0.01;
      const spanY = bbox.max.y - bbox.min.y;
      const minX = bbox.min.x + inset;
      const maxX = bbox.max.x - inset;
      const minY = bbox.min.y + inset + 0.04 * spanY;
      const maxY = bbox.max.y - inset;
      
      localPt.x = Math.max(minX, Math.min(maxX, localPt.x));
      localPt.y = Math.max(minY, Math.min(maxY, localPt.y));
      
      const offset = additionOffsets[id] ?? {};
      setAdditionOffset(id, {
        ...offset,
        xPos: localPt.x,
        yPos: localPt.y,
      });
    }
  }, [headstone, gl, camera, raycaster, mouse, id, additionOffsets, setAdditionOffset]);

  const handlePointerDown = React.useCallback((e: any) => {
    e.stopPropagation();
    setSelectedAdditionId(id);
    setDragging(true);
  }, [id, setSelectedAdditionId]);

  // Effects after all hooks
  React.useEffect(() => {
    setAdditionRef(id, ref);
  }, [id, setAdditionRef]);

  React.useEffect(() => {
    console.log('Texture state:', { id, hasColorMap: !!colorMap, hasScene: !!scene });
  }, [id, colorMap, scene]);

  React.useEffect(() => {
    if (!scene) return;
    
    console.log('Setting up materials for scene:', id);
    let meshCount = 0;
    scene.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        meshCount++;
        
        // Make sure mesh is visible
        child.visible = true;
        child.castShadow = true;
        child.receiveShadow = true;
        
        // Replace with a simple bright material
        child.material = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          map: colorMap || undefined,
          metalness: 0.3,
          roughness: 0.7,
          side: THREE.DoubleSide,
        });
        
        // Texture orientation
        if (colorMap) {
          colorMap.flipY = false;
          colorMap.needsUpdate = true;
        }
      }
    });
    console.log(`Configured ${meshCount} meshes in`, id);
  }, [scene, colorMap, id]);

  React.useEffect(() => {
    if (!dragging) return;
    const canvas = gl?.domElement;
    if (!canvas) return;

    const onMove = (e: PointerEvent) => {
      e.preventDefault();
      placeFromClientXY(e.clientX, e.clientY);
    };
    
    const onUp = (e: PointerEvent) => {
      e.preventDefault();
      setDragging(false);
      if (controls) (controls as any).enabled = true;
      document.body.style.cursor = 'auto';
    };

    if (controls) (controls as any).enabled = false;
    canvas.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });
    document.body.style.cursor = 'grabbing';

    return () => {
      canvas.removeEventListener('pointermove', onMove);
    };
  }, [dragging, gl, controls, placeFromClientXY]);

  // ✅ guard: if headstone API isn't ready yet, don't render anything
  // This must come AFTER all hooks
  const stone = headstone?.mesh?.current as THREE.Mesh | null;
  if (!headstone || !stone || !scene) {
    console.log('AdditionModelInner early return:', { 
      id, 
      hasHeadstone: !!headstone, 
      hasStone: !!stone, 
      hasScene: !!scene 
    });
    return null;
  }

  // bbox in HEADSTONE LOCAL SPACE
  if (!stone.geometry.boundingBox) stone.geometry.computeBoundingBox();
  const bbox = stone.geometry.boundingBox!.clone();

  const inset = 0.01;
  const spanY = bbox.max.y - bbox.min.y;
  const minX = bbox.min.x + inset;
  const maxX = bbox.max.x - inset;
  const minY = bbox.min.y + inset + 0.04 * spanY;
  const maxY = bbox.max.y - inset;

  // Different default positions based on type
  let defaultX = 0, defaultY = 0;
  if (addition.type === 'application') {
    defaultX = THREE.MathUtils.lerp(minX, maxX, 0.5);
    defaultY = THREE.MathUtils.lerp(minY, maxY, 0.6);
  } else if (addition.type === 'statue') {
    defaultX = minX - 0.3;
    defaultY = minY - 1.8;
  } else if (addition.type === 'vase') {
    defaultX = maxX + 0.3;
    defaultY = minY - 1.8;
  }

  const defaultOffset = {
    xPos: defaultX,
    yPos: defaultY,
    scale: 1,
    rotationZ: 0,
  };

  const offset = additionOffsets[id] ?? defaultOffset;

  // scale: target sizes in headstone units (1 unit = 10mm)
  let targetH = 10; // 10 units = 100mm for applications
  if (addition.type === 'statue') targetH = 15; // 150mm for statues
  else if (addition.type === 'vase') targetH = 12; // 120mm for vases

  // Size is in headstone units
  const maxDim = Math.max(size.x, size.y);
  const h = Math.max(1e-6, maxDim);
  const auto = targetH / h;
  const user = Math.max(0.05, Math.min(5, offset.scale ?? 1));
  const finalScale = auto * user;
  
  console.log('Scale calculation:', { 
    id, 
    sizeUnits: { x: size.x, y: size.y, z: size.z },
    maxDim,
    targetH, 
    auto, 
    user, 
    finalScale 
  });

  // Determine Z position based on type
  // Models are centered at origin after rotation
  // For applications: position so model sits on headstone surface
  // For statues/vases: on the base (z=0)
  const modelDepth = size.z * finalScale;
  let zPosition = 0;
  
  if (addition.type === 'statue' || addition.type === 'vase') {
    zPosition = 0; // On the base
  } else if (addition.type === 'application') {
    // Position so the front of the model is at headstone surface
    // Model is centered, so we need to offset by half depth + headstone surface
    zPosition = headstone.frontZ + modelDepth / 2 + 0.1; // half depth + small offset
  }

  console.log('Z Position calculation:', {
    id,
    type: addition.type,
    sizeZ: size.z,
    finalScale,
    modelDepth,
    headstoneFrontZ: headstone.frontZ,
    calculatedZ: zPosition
  });

  console.log('AdditionModelInner rendering:', { 
    id, 
    type: addition.type, 
    offset,
    finalScale,
    zPosition,
    finalPosition: [offset.xPos, offset.yPos, zPosition],
    bbox: { min: bbox.min, max: bbox.max },
    headstone: { frontZ: headstone.frontZ }
  });

  const isSelected = selectedAdditionId === id;

  return (
    <>      
      <group
        ref={ref}
        position={[offset.xPos, offset.yPos, zPosition]}
        rotation={[0, 0, offset.rotationZ || 0]}
        scale={[finalScale, finalScale, finalScale]}
        visible={true}
        name={`addition-${id}`}
        onPointerDown={handlePointerDown}
      >
        <primitive object={scene} />
      </group>
    </>
  );
}

// Preload common additions
useGLTF.preload('/additions/1134/Art1134.glb');
useGLTF.preload('/additions/2497/Art2497.glb');
useGLTF.preload('/additions/320/320.glb');
