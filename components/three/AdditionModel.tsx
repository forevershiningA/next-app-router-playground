'use client';

import * as React from 'react';
import * as THREE from 'three';
import { useGLTF, useTexture } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useHeadstoneStore } from '#/lib/headstone-store';
import type { HeadstoneAPI } from '../SvgHeadstone';
import { data } from '#/app/_internal/_data';
import { useRouter, usePathname } from 'next/navigation';

// Addition positioning constants
const DEFAULT_POSITIONS = {
  statue: {
    xOffset: -80, // mm left of headstone
    yOffset: 0,   // Near top
  },
  vase: {
    xOffset: 30,  // mm right of headstone
    yOffset: 0,   // Near top
  },
  application: {
    xOffset: 0,   // Center
    yOffset: 0,   // Center
  },
};

const TARGET_HEIGHTS = {
  statue: 0.15,      // 150mm
  vase: 0.12,        // 120mm
  application: 0.10, // 100mm
};

const APPLICATION_Z_OFFSET = 1.5; // Offset to prevent deep embedding

type Props = {
  id: string; // e.g. "B1134S" or "K0320"
  headstone?: HeadstoneAPI; // passed from SvgHeadstone render-prop
  index?: number; // layering/z-fight avoidance
};

export default function AdditionModel({ id, headstone, index = 0 }: Props) {
  // Extract base ID (remove timestamp suffix if present)
  // e.g., "B1134S_1234567890" => "B1134S"
  const baseId = React.useMemo(() => {
    const parts = id.split('_');
    // If last part is a number (timestamp), remove it
    if (parts.length > 1 && !isNaN(Number(parts[parts.length - 1]))) {
      return parts.slice(0, -1).join('_');
    }
    return id;
  }, [id]);

  // Find the addition data using base ID
  const addition = React.useMemo(() => {
    return data.additions.find((a) => a.id === baseId);
  }, [baseId]);

  // Early return if no addition or no file - before any hooks
  if (!addition || !addition.file) {
    console.warn(`Addition ${id} (base: ${baseId}) has no file data`);
    return null;
  }

  // Now we can safely use hooks knowing we have valid data
  return <AdditionModelInner id={id} baseId={baseId} addition={addition} headstone={headstone} index={index} />;
}

// Separate component where we can safely use hooks
function AdditionModelInner({ 
  id, 
  baseId,
  addition, 
  headstone, 
  index 
}: { 
  id: string;
  baseId: string;
  addition: any; 
  headstone?: HeadstoneAPI; 
  index: number;
}) {
  // ALL hooks must be called unconditionally at the top - before any early returns
  const { gl, camera, controls, scene: threeScene } = useThree();
  const router = useRouter();
  const pathname = usePathname();
  const setAdditionRef = useHeadstoneStore((s) => s.setAdditionRef);
  const additionOffsets = useHeadstoneStore((s) => s.additionOffsets);
  const setSelectedAdditionId = useHeadstoneStore((s) => s.setSelectedAdditionId);
  const selectedAdditionId = useHeadstoneStore((s) => s.selectedAdditionId);
  const setAdditionOffset = useHeadstoneStore((s) => s.setAdditionOffset);
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);
  const ref = React.useRef<THREE.Group>(null!);
  const [dragging, setDragging] = React.useState(false);
  
  // Load the GLB file path
  const glbPath = `/additions/${addition.file}`;
  const dirNum = addition.file.split('/')[0];
  
  // Load GLB and texture - these must be called unconditionally
  const gltf = useGLTF(glbPath);
  const colorMap = useTexture(`/additions/${dirNum}/colorMap.webp`);
  
  // These must come after other hooks but before conditional returns
  const raycaster = React.useMemo(() => new THREE.Raycaster(), []);
  const mouse = React.useMemo(() => new THREE.Vector2(), []);

  // Create scene
  const scene = React.useMemo(() => {
    if (!gltf?.scene) return null;
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
    
    // Center the model at origin
    const tempCenter = new THREE.Vector3();
    tempBox.getCenter(tempCenter);
    cloned.position.sub(tempCenter);
    
    // Now rotate 180 degrees around Z to flip it right-side up
    cloned.rotation.z = Math.PI;
    
    return cloned;
  }, [gltf?.scene, id]);

  const size = React.useMemo(() => {
    if (!scene) return new THREE.Vector3(1, 1, 1);
    
    // Calculate size after rotation  
    // Models are in mm at identity scale
    scene.updateMatrixWorld(true); // Ensure transforms are up to date
    const box = new THREE.Box3().setFromObject(scene);
    const szMM = new THREE.Vector3();
    box.getSize(szMM);
    
    // Use absolute values to ensure positive dimensions
    szMM.x = Math.abs(szMM.x);
    szMM.y = Math.abs(szMM.y);
    szMM.z = Math.abs(szMM.z);
    
    // Use raw bounds for ratio calculation
    const sz = szMM.divideScalar(1);
    
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
    
    // For statues, raycast against the base instead of the headstone
    let targetMesh: THREE.Mesh;
    if (addition.type === 'statue' || addition.type === 'vase') {
      // Find the base mesh in the scene
      const baseMesh = threeScene.getObjectByName('base') as THREE.Mesh;
      if (!baseMesh) return;
      targetMesh = baseMesh;
    } else {
      targetMesh = headstone.mesh.current as THREE.Mesh;
    }
    
    const intersects = raycaster.intersectObject(targetMesh, false);
    
    if (intersects.length > 0) {
      const point = intersects[0].point;
      const localPt = targetMesh.worldToLocal(point.clone());
      
      // Apply bounds checking
      if (!targetMesh.geometry.boundingBox) targetMesh.geometry.computeBoundingBox();
      const bbox = targetMesh.geometry.boundingBox!;
      const inset = 0.01;
      const spanY = bbox.max.y - bbox.min.y;
      const minX = bbox.min.x + inset;
      const maxX = bbox.max.x - inset;
      const minY = bbox.min.y + inset + 0.04 * spanY;
      const maxY = bbox.max.y - inset;
      
      localPt.x = Math.max(minX, Math.min(maxX, localPt.x));
      localPt.y = Math.max(minY, Math.min(maxY, localPt.y));
      
      // Calculate center position (like inscriptions)
      const centerX = (bbox.min.x + bbox.max.x) / 2;
      const centerY = (bbox.min.y + bbox.max.y) / 2;
      
      // Store as OFFSET from center, but NEGATE Y to match old Y-down saved format
      setAdditionOffset(id, {
        ...offset,
        xPos: localPt.x - centerX,
        yPos: -(localPt.y - centerY),  // Negate to convert Y-up to Y-down format
      });
    }
  }, [headstone, gl, camera, raycaster, mouse, id, additionOffsets, setAdditionOffset, addition.type, threeScene]);

  const handleClick = React.useCallback((e: any) => {
    e.stopPropagation();

    setSelectedAdditionId(id);
    setActivePanel('addition');
    
    // Navigate to select-additions if not already there
    if (pathname !== '/select-additions') {
      router.push('/select-additions');
    }
    
    // Dispatch event to hide nav when clicking on addition
    window.dispatchEvent(new CustomEvent('nav-changed', { detail: { slug: 'addition' } }));
  }, [id, setSelectedAdditionId, setActivePanel, pathname, router]);

  const handlePointerDown = React.useCallback((e: any) => {
    e.stopPropagation();
    // Note: Selection happens on click, this just prepares for drag
    setDragging(true);
  }, []);

  const handlePointerOver = React.useCallback(() => {
    if (document.body) {
      document.body.style.cursor = 'grab';
    }
  }, []);

  const handlePointerOut = React.useCallback(() => {
    if (document.body && !dragging) {
      document.body.style.cursor = 'auto';
    }
  }, [dragging]);

  // Effects after all hooks
  React.useEffect(() => {
    setAdditionRef(id, ref);
  }, [id, setAdditionRef]);

  React.useEffect(() => {
    if (!scene) return;
    
    const materials: THREE.Material[] = [];
    
    scene.traverse((child: THREE.Object3D) => {
      if (child instanceof THREE.Mesh) {
        // Make sure mesh is visible
        child.visible = true;
        child.castShadow = true;
        child.receiveShadow = true;
        
        // Replace with a simple bright material
        const material = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          map: colorMap || undefined,
          metalness: 0.3,
          roughness: 0.7,
          side: THREE.DoubleSide,
        });
        
        child.material = material;
        materials.push(material);
        
        // Texture orientation
        if (colorMap) {
          colorMap.flipY = false;
          colorMap.needsUpdate = true;
        }
      }
    });
    
    // Cleanup: dispose materials when component unmounts or scene changes
    return () => {
      materials.forEach(mat => mat.dispose());
    };
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
      window.removeEventListener('pointerup', onUp);
      if (controls) (controls as any).enabled = true;
      document.body.style.cursor = 'auto';
    };
  }, [dragging, gl, controls, placeFromClientXY]);

  // ✅ guard: if headstone API isn't ready yet, don't render anything
  // This must come AFTER all hooks
  const stone = headstone?.mesh?.current as THREE.Mesh | null;
  if (!headstone || !stone || !scene) {
    return null;
  }

  // bbox in HEADSTONE LOCAL SPACE
  if (!stone.geometry.boundingBox) stone.geometry.computeBoundingBox();
  const bbox = stone.geometry.boundingBox!.clone();
  
  // Calculate center (like inscriptions and motifs)
  const centerX = (bbox.min.x + bbox.max.x) / 2;
  const centerY = (bbox.min.y + bbox.max.y) / 2;

  const inset = 0.01;
  const spanY = bbox.max.y - bbox.min.y;
  const minX = bbox.min.x + inset;
  const maxX = bbox.max.x - inset;
  const minY = bbox.min.y + inset + 0.04 * spanY;
  const maxY = bbox.max.y - inset;

  // Different default positions based on type (as OFFSETS from center)
  let defaultX = 0, defaultY = 0;
  const posConfig = DEFAULT_POSITIONS[addition.type as keyof typeof DEFAULT_POSITIONS] || DEFAULT_POSITIONS.application;
  
  if (addition.type === 'statue') {
    defaultX = minX + posConfig.xOffset - centerX;
    defaultY = minY + posConfig.yOffset - centerY;
  } else if (addition.type === 'vase') {
    defaultX = maxX + posConfig.xOffset - centerX;
    defaultY = minY + posConfig.yOffset - centerY;
  } else {
    defaultX = posConfig.xOffset;
    defaultY = posConfig.yOffset;
  }

  const defaultOffset = {
    xPos: defaultX,
    yPos: defaultY,
    scale: 1,
    rotationZ: 0,
  };

  const offset = additionOffsets[id] ?? defaultOffset;

  // scale: target sizes in headstone units (1 unit = 10mm)
  const targetH = TARGET_HEIGHTS[addition.type as keyof typeof TARGET_HEIGHTS] || TARGET_HEIGHTS.application;

  // Size is in headstone units
  const maxDim = Math.max(size.x, size.y);
  const h = Math.max(1e-6, maxDim);
  const auto = targetH / h;
  const user = Math.max(0.05, Math.min(5, offset.scale ?? 1));
  const finalScale = auto * user;

  // Determine Z position based on type
  // Models are rotated 180° around Z (line 109), then Y-flipped via scale (line 367)
  // This combination ensures models display right-side-up in Y-up coordinate system
  // For applications: position so model sits on headstone surface
  // For statues/vases: on the base (z=0 or below)
  const modelDepth = size.z * finalScale;
  let zPosition = 0;
  
  if (addition.type === 'statue' || addition.type === 'vase') {
    // Statues and vases sit on the base at z=0
    // Move to the front by using positive Z (same as headstone front)
    zPosition = headstone.frontZ;
  } else if (addition.type === 'application') {
    // Position so the front of the model is at headstone surface
    // Model is centered, so we need to offset by half depth + headstone surface
    zPosition = headstone.frontZ + modelDepth / 2 + APPLICATION_Z_OFFSET;
  }

  const isSelected = selectedAdditionId === id;

  return (
    <>      
      {/* Parent group for positioning - convert Y-down saved coords to Y-up display */}
      <group
        position={[centerX + offset.xPos, centerY - offset.yPos, zPosition]}
        rotation={[0, 0, offset.rotationZ || 0]}
      >
        {/* Addition mesh with scale and Y-flip to display right-side-up */}
        <group
          ref={ref}
          scale={[finalScale, -finalScale, finalScale]}
          visible={true}
          name={`addition-${id}`}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <primitive object={scene} />
        </group>
        
        {/* SelectionBox removed for additions - use BoxOutline instead */}
      </group>
    </>
  );
}

// Preload common additions
useGLTF.preload('/additions/1134/Art1134.glb');
useGLTF.preload('/additions/2497/Art2497.glb');
useGLTF.preload('/additions/320/320.glb');
