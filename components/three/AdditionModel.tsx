'use client';

import * as React from 'react';
import * as THREE from 'three';
import { useGLTF, useTexture } from '@react-three/drei';
import { useThree } from '@react-three/fiber';
import { useHeadstoneStore } from '#/lib/headstone-store';
import type { HeadstoneAPI } from '../SvgHeadstone';
import { data } from '#/app/_internal/_data';
import { useRouter, usePathname } from 'next/navigation';
import SelectionBox from '../SelectionBox';

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
  statue: 150,      // 150mm
  vase: 120,        // 120mm
  application: 100, // 100mm
};

const APPLICATION_Z_OFFSET = 0.05; // 0.05mm offset keeps applications flush without z-fighting

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
  
  // Check if this is a Traditional Engraved product (sandblasted effect)
  const productId = useHeadstoneStore((s) => s.productId);
  const product = React.useMemo(() => {
    if (!productId) return null;
    return data.products.find(p => p.id === productId);
  }, [productId]);
  const isTraditionalEngraved = product?.name.includes('Traditional Engraved') ?? false;
  
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
  const dragDeltaRef = React.useRef<{ x: number; y: number } | null>(null);
  const applicationDragPlane = React.useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const fallbackIntersection = React.useMemo(() => new THREE.Vector3(), []);

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

  // Compute headstone bounds and default offsets early so helper hooks can use them
  const stone = headstone?.mesh?.current as THREE.Mesh | null;
  const bbox = React.useMemo(() => {
    if (!stone) return null;
    if (!stone.geometry.boundingBox) stone.geometry.computeBoundingBox();
    return stone.geometry.boundingBox?.clone() ?? null;
  }, [stone]);

  const defaultOffset = React.useMemo(() => {
    if (!bbox) return { xPos: 0, yPos: 0, scale: 1, rotationZ: 0 };
    const centerX = (bbox.min.x + bbox.max.x) / 2;
    const centerY = (bbox.min.y + bbox.max.y) / 2;
    const inset = 0.01;
    const spanY = bbox.max.y - bbox.min.y;
    const minX = bbox.min.x + inset;
    const maxX = bbox.max.x - inset;
    const minY = bbox.min.y + inset + 0.04 * spanY;
    const maxY = bbox.max.y - inset;

    let defaultX = 0;
    let defaultY = 0;
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

    return {
      xPos: defaultX,
      yPos: defaultY,
      scale: 1,
      rotationZ: 0,
    };
  }, [bbox, addition.type]);

  const offset = additionOffsets[id] ?? defaultOffset;

  const computeInteractionPoint = React.useCallback(
    (clientX: number, clientY: number) => {
      const headstoneMesh = headstone?.mesh?.current as THREE.Mesh | null;
      if (!headstoneMesh || !gl?.domElement) return null;

      const canvas = gl.domElement;
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      let targetMesh: THREE.Mesh | null = headstoneMesh;
      if (addition.type === 'statue' || addition.type === 'vase') {
        const baseMesh = threeScene.getObjectByName('base') as THREE.Mesh | null;
        if (baseMesh) {
          targetMesh = baseMesh;
        }
      }
      if (!targetMesh) return null;

      const intersects = raycaster.intersectObject(targetMesh, false);
      let localPt: THREE.Vector3 | null = null;

      if (intersects.length > 0) {
        localPt = targetMesh.worldToLocal(intersects[0].point.clone());
      } else if (addition.type === 'application') {
        applicationDragPlane.normal.set(0, 0, 1);
        applicationDragPlane.constant = -(headstone.frontZ ?? 0);
        if (raycaster.ray.intersectPlane(applicationDragPlane, fallbackIntersection)) {
          localPt = targetMesh.worldToLocal(fallbackIntersection.clone());
        }
      }

      if (!localPt) return null;

      if (!targetMesh.geometry.boundingBox) targetMesh.geometry.computeBoundingBox();
      const targetBBox = targetMesh.geometry.boundingBox!;
      const inset = 0.01;
      const spanY = targetBBox.max.y - targetBBox.min.y;
      const minX = targetBBox.min.x + inset;
      const maxX = targetBBox.max.x - inset;
      const minY = targetBBox.min.y + inset + 0.04 * spanY;
      const maxY = targetBBox.max.y - inset;

      const clamped = new THREE.Vector3(
        Math.max(minX, Math.min(maxX, localPt.x)),
        Math.max(minY, Math.min(maxY, localPt.y)),
        localPt.z
      );

      const centerX = (targetBBox.min.x + targetBBox.max.x) / 2;
      const centerY = (targetBBox.min.y + targetBBox.max.y) / 2;

      return { clamped, centerX, centerY, minX, maxX, minY, maxY, targetMesh };
    },
    [headstone, gl, mouse, raycaster, camera, addition.type, threeScene, applicationDragPlane, fallbackIntersection]
  );

  // Drag handler - must be defined before effects
  const placeFromClientXY = React.useCallback(
    (clientX: number, clientY: number) => {
      const data = computeInteractionPoint(clientX, clientY);
      if (!data) return;

      let { clamped, centerX, centerY, minX, maxX, minY, maxY, targetMesh } = data;

      if (dragDeltaRef.current) {
        clamped = clamped.clone();
        clamped.x -= dragDeltaRef.current.x;
        clamped.y -= dragDeltaRef.current.y;
        clamped.x = Math.max(minX, Math.min(maxX, clamped.x));
        clamped.y = Math.max(minY, Math.min(maxY, clamped.y));
      }

      const headstoneMesh = headstone?.mesh?.current as THREE.Mesh | null;
      if (!headstoneMesh) return;

      const convertToHeadstone = (vec: THREE.Vector3) => {
        const worldPoint = targetMesh.localToWorld(vec.clone());
        return headstoneMesh.worldToLocal(worldPoint.clone());
      };

      const headstonePoint = convertToHeadstone(clamped);
      const headstoneCenterPoint = convertToHeadstone(
        new THREE.Vector3(centerX, centerY, clamped.z)
      );

      setAdditionOffset(id, {
        ...offset,
        xPos: headstonePoint.x - headstoneCenterPoint.x,
        yPos: -(headstonePoint.y - headstoneCenterPoint.y),
      });
    },
    [computeInteractionPoint, headstone, id, offset, setAdditionOffset]
  );

  const handleClick = React.useCallback((e: any) => {
    e.stopPropagation();

    setSelectedAdditionId(id);
    setActivePanel('addition');
    
    // Open additions fullscreen panel
    window.dispatchEvent(new CustomEvent('openFullscreenPanel', { detail: { panel: 'select-additions' } }));
  }, [id, setSelectedAdditionId, setActivePanel]);

  const handlePointerDown = React.useCallback(
    (e: any) => {
      e.stopPropagation();
      setDragging(true);

      const clientX = e.clientX ?? e?.nativeEvent?.clientX;
      const clientY = e.clientY ?? e?.nativeEvent?.clientY;
      if (typeof clientX === 'number' && typeof clientY === 'number') {
        const data = computeInteractionPoint(clientX, clientY);
        if (data && bbox) {
          const { clamped, targetMesh } = data;
          const headstoneMesh = headstone?.mesh?.current as THREE.Mesh | null;
          if (headstoneMesh) {
            const headCenterX = (bbox.min.x + bbox.max.x) / 2;
            const headCenterY = (bbox.min.y + bbox.max.y) / 2;
            const currentHeadstonePoint = new THREE.Vector3(
              headCenterX + offset.xPos,
              headCenterY - offset.yPos,
              clamped.z
            );
            const worldPoint = headstoneMesh.localToWorld(currentHeadstonePoint.clone());
            const currentTargetPoint = targetMesh.worldToLocal(worldPoint.clone());
            dragDeltaRef.current = {
              x: clamped.x - currentTargetPoint.x,
              y: clamped.y - currentTargetPoint.y,
            };
          } else {
            dragDeltaRef.current = null;
          }
        } else {
          dragDeltaRef.current = null;
        }
      }
    },
    [computeInteractionPoint, headstone, offset, bbox]
  );

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
    if (!dragging || !gl?.domElement) return;

    const onMove = (e: PointerEvent) => {
      e.preventDefault();
      placeFromClientXY(e.clientX, e.clientY);
    };
    
    const onUp = (e: PointerEvent) => {
      e.preventDefault();
      setDragging(false);
      dragDeltaRef.current = null;
      if (controls) (controls as any).enabled = true;
      document.body.style.cursor = 'auto';
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };

    if (controls) (controls as any).enabled = false;
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    document.body.style.cursor = 'grabbing';

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      dragDeltaRef.current = null;
      if (controls) (controls as any).enabled = true;
      document.body.style.cursor = 'auto';
    };
  }, [dragging, gl, controls, placeFromClientXY]);

  // ✅ guard: if headstone API isn't ready yet, don't render anything
  // This must come AFTER all hooks
  if (!headstone || !stone || !scene || !bbox) {
    return null;
  }

  const centerX = (bbox.min.x + bbox.max.x) / 2;
  const centerY = (bbox.min.y + bbox.max.y) / 2;


  // scale: target sizes in headstone units (1 unit = 10mm)
  const targetH = TARGET_HEIGHTS[addition.type as keyof typeof TARGET_HEIGHTS] || TARGET_HEIGHTS.application;

  // Size is in headstone units
  const maxDim = Math.max(size.x, size.y);
  const h = Math.max(1e-6, maxDim);
  const auto = targetH / h;
  const user = Math.max(0.05, Math.min(5, offset.scale ?? 1));
  const finalScale = auto * user;

  // Determine Z position based on type
  // Coordinate system: 1 unit = 1mm
  const zScaleFactor = 0.1; // Reduced Z-scale to make additions flatter (10% depth)
  const modelDepth = size.z * finalScale * zScaleFactor;
  let zPosition = 0;
  
  if (addition.type === 'statue' || addition.type === 'vase') {
    // Statues and vases sit on the base
    zPosition = headstone.frontZ;
  } else if (addition.type === 'application') {
    // Position application on headstone surface with minimal offset to avoid z-fighting
    zPosition = headstone.frontZ + APPLICATION_Z_OFFSET;
  }

  const isSelected = selectedAdditionId === id;

  // Calculate scaled bounds for SelectionBox (in world space)
  const scaledBounds = {
    width: size.x * finalScale,
    height: size.y * finalScale,
  };

  return (
    <>      
      {/* Parent group for positioning - convert Y-down saved coords to Y-up display */}
      <group
        position={[centerX + offset.xPos, centerY - offset.yPos, zPosition]}
        rotation={[0, 0, offset.rotationZ || 0]}
      >
        {/* Addition mesh with scale and Y-flip, with reduced Z-scale for flatter appearance */}
        <group
          ref={ref}
          scale={[finalScale, -finalScale, finalScale * zScaleFactor]}
          visible={true}
          name={`addition-${id}`}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <primitive object={scene} />
        </group>
        
        {/* Selection box with resize and rotation handles */}
        {isSelected && scaledBounds.width > 0 && scaledBounds.height > 0 && (
          <SelectionBox
            objectId={id}
            position={new THREE.Vector3(0, 0, 0.002)}
            bounds={scaledBounds}
            rotation={0}
            unitsPerMeter={headstone.unitsPerMeter}
            currentSizeMm={targetH * (offset.scale ?? 1)}
            objectType="addition"
            additionType={addition.type as 'application' | 'statue' | 'vase'}
            onUpdate={(data) => {
              if (data.scaleFactor !== undefined) {
                // Update scale based on scale factor
                const newScale = (offset.scale ?? 1) * data.scaleFactor;
                const clampedScale = Math.max(0.05, Math.min(5, newScale));
                setAdditionOffset(id, { ...offset, scale: clampedScale });
              }
              if (data.rotationDeg !== undefined) {
                // Add the rotation delta to current rotation
                const newRotation = (offset.rotationZ || 0) + (data.rotationDeg * Math.PI / 180);
                setAdditionOffset(id, { ...offset, rotationZ: newRotation });
              }
            }}
          />
        )}
      </group>
    </>
  );
}

// Preload common additions
useGLTF.preload('/additions/1134/Art1134.glb');
useGLTF.preload('/additions/2497/Art2497.glb');
useGLTF.preload('/additions/320/320.glb');
