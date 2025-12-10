'use client';

import * as React from 'react';
import * as THREE from 'three';
import { useLoader, useThree } from '@react-three/fiber';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { useHeadstoneStore } from '#/lib/headstone-store';
import type { HeadstoneAPI } from '../SvgHeadstone';
import SelectionBox from '../SelectionBox';
import { useRouter, usePathname } from 'next/navigation';
import { data } from '#/app/_internal/_data';

type Props = {
  id: string; // unique motif ID
  svgPath: string; // path to SVG file
  color: string; // motif color
  headstone?: HeadstoneAPI;
  index?: number;
};

export default function MotifModel({ id, svgPath, color, headstone, index = 0 }: Props) {
  const { gl, camera, controls } = useThree();
  const router = useRouter();
  const pathname = usePathname();
  
  // Check if this is a Traditional Engraved product (sandblasted effect)
  const productId = useHeadstoneStore((s) => s.productId);
  const product = React.useMemo(() => {
    if (!productId) return null;
    return data.products.find(p => p.id === productId);
  }, [productId]);
  const isTraditionalEngraved = product?.name.includes('Traditional Engraved') ?? false;
  
  const setMotifRef = useHeadstoneStore((s) => s.setMotifRef);
  const motifOffsets = useHeadstoneStore((s) => s.motifOffsets);
  const setSelectedMotifId = useHeadstoneStore((s) => s.setSelectedMotifId);
  const selectedMotifId = useHeadstoneStore((s) => s.selectedMotifId);
  const setMotifOffset = useHeadstoneStore((s) => s.setMotifOffset);
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);
  const ref = React.useRef<THREE.Group>(null!);
  const [dragging, setDragging] = React.useState(false);

  // Load SVG
  const svgData = useLoader(SVGLoader, svgPath);

  const raycaster = React.useMemo(() => new THREE.Raycaster(), []);
  const mouse = React.useMemo(() => new THREE.Vector2(), []);

  // Create mesh from SVG paths
  const mesh = React.useMemo(() => {
    if (!svgData) return null;

    const group = new THREE.Group();
    const paths = svgData.paths;

    // Parse the color to THREE.Color
    const motifColor = new THREE.Color(color);

    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      const shapes = SVGLoader.createShapes(path);

      for (const shape of shapes) {
        const geometry = new THREE.ShapeGeometry(shape);
        // Use the motif color with metallic properties for realistic rendering
        const isGoldColor = color.toLowerCase().includes('gold') || 
                           color.toLowerCase() === '#d4af37' || 
                           color.toLowerCase() === '#ffd700';
        
        const material = new THREE.MeshStandardMaterial({
          color: motifColor,
          side: THREE.DoubleSide,
          depthWrite: true,
          depthTest: true,
          metalness: isGoldColor ? 1.0 : 0.2,
          roughness: isGoldColor ? 0.3 : 0.4,
          envMapIntensity: isGoldColor ? 2.0 : 1.5,
        });

        const shapeMesh = new THREE.Mesh(geometry, material);
        group.add(shapeMesh);
      }
    }

    // Calculate bounding box to center and scale
    const box = new THREE.Box3().setFromObject(group);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    // Center the group
    group.position.sub(center);

    // Fix upside-down issue: scale Y by 1 instead of -1
    // SVG Y coordinates are top-down, but we want them right-side up
    group.scale.y = 1;

    return { group, size };
  }, [svgData, id, color]);

  // Cleanup effect: dispose of manually created resources
  React.useEffect(() => {
    return () => {
      if (mesh && mesh.group) {
        mesh.group.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((m) => m.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
      }
    };
  }, [mesh]);

  const placeFromClientXY = React.useCallback(
    (clientX: number, clientY: number) => {
      if (!headstone?.mesh?.current || !gl?.domElement) return;

      const canvas = gl.domElement;
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const targetMesh = headstone.mesh.current as THREE.Mesh;
      const intersects = raycaster.intersectObject(targetMesh, false);

      if (intersects.length > 0) {
        const point = intersects[0].point;
        const localPt = targetMesh.worldToLocal(point.clone());

        // Apply bounds checking
        if (!targetMesh.geometry.boundingBox)
          targetMesh.geometry.computeBoundingBox();
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
        setMotifOffset(id, {
          ...offset,
          xPos: localPt.x - centerX,
          yPos: -(localPt.y - centerY),  // Negate to convert Y-up to Y-down format
        });
      }
    },
    [headstone, gl, camera, raycaster, mouse, id, motifOffsets, setMotifOffset]
  );

  const handleClick = React.useCallback(
    (e: any) => {
      e.stopPropagation();

      setSelectedMotifId(id);
      setActivePanel('motif');
      
      // Don't navigate away - keep canvas visible and show motif panel
      window.dispatchEvent(new CustomEvent('nav-changed', { detail: { slug: 'motif' } }));
    },
    [id, setSelectedMotifId, setActivePanel]
  );

  const handlePointerDown = React.useCallback((e: any) => {
    e.stopPropagation();
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

  React.useEffect(() => {
    setMotifRef(id, ref);
  }, [id, setMotifRef]);

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

  const stone = headstone?.mesh?.current as THREE.Mesh | null;
  if (!headstone || !stone || !mesh) {
    return null;
  }

  // Get headstone bounds and calculate center (like inscriptions)
  if (!stone.geometry.boundingBox) stone.geometry.computeBoundingBox();
  const bbox = stone.geometry.boundingBox!.clone();
  
  const centerX = (bbox.min.x + bbox.max.x) / 2;
  const centerY = (bbox.min.y + bbox.max.y) / 2;
  const centerZ = headstone.frontZ + 0.5;

  const inset = 0.01;
  const spanY = bbox.max.y - bbox.min.y;
  const minX = bbox.min.x + inset;
  const maxX = bbox.max.x - inset;
  const minY = bbox.min.y + inset + 0.04 * spanY;
  const maxY = bbox.max.y - inset;

  // Default position at center (as OFFSET from center = 0, like inscriptions)
  const defaultX = 0;
  const defaultY = 0;

  const defaultOffset = {
    xPos: defaultX,
    yPos: defaultY,
    scale: 1,
    rotationZ: 0,
    heightMm: 100,
  };

  const offset = motifOffsets[id] ?? defaultOffset;

  // Scale based on heightMm to match the specified height
  // NOTE: In the headstone coordinate system, mm values are used directly as units
  // (same as inscriptions use sizeMm directly as fontSize)
  // So 100mm = 100 units in the coordinate system
  const targetHeightInUnits = offset.heightMm ?? 100;
  
  // Use the Y dimension (height) of the mesh for scaling
  const meshHeight = mesh.size.y;
  // Calculate scale to make the motif's height match the heightMm value
  const finalScale = meshHeight > 0 ? targetHeightInUnits / meshHeight : 1;

  const isSelected = selectedMotifId === id;

  // Calculate scaled bounds for SelectionBox (in world space)
  const scaledBounds = {
    width: mesh.size.x * finalScale,
    height: mesh.size.y * finalScale,
  };

  // Convert offset from old Y-down saved format to Y-up display format
  const displayY = centerY - (offset.yPos || 0);

  return (
    <>
      {/* Parent group for positioning - same coordinate system as inscriptions */}
      <group
        position={[centerX + offset.xPos, displayY, centerZ]}
        rotation={[0, 0, offset.rotationZ || 0]}
      >
        {/* Drop shadow for Traditional Engraved (sandblasted effect) */}
        {isTraditionalEngraved && (
          <>
            {/* Blur simulation - multiple layers at same position with increasing size */}
            <group
              scale={[finalScale * 1.08, -finalScale * 1.08, 1]}
              position={[0, 0, -0.05]}
            >
              <primitive object={mesh.group.clone()} />
              <meshBasicMaterial color="#000000" opacity={0.2} transparent depthTest={true} />
            </group>
            <group
              scale={[finalScale * 1.05, -finalScale * 1.05, 1]}
              position={[0, 0, -0.02]}
            >
              <primitive object={mesh.group.clone()} />
              <meshBasicMaterial color="#000000" opacity={0.3} transparent depthTest={true} />
            </group>
            <group
              scale={[finalScale, -finalScale, 1]}
              position={[0, 0, 0]}
            >
              <primitive object={mesh.group.clone()} />
              <meshBasicMaterial color="#000000" opacity={0.8} transparent depthTest={true} />
            </group>
          </>
        )}
        
        {/* Motif mesh with scale - Y-flipped because SVG shapes are stored Y-down */}
        <group
          ref={ref}
          scale={[finalScale, -finalScale, 1]}
          visible={true}
          name={`motif-${id}`}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <primitive object={mesh.group} />
        </group>
        
        {/* Selection box without scale - sibling to motif */}
        {isSelected && (
          <SelectionBox
            objectId={id}
            position={new THREE.Vector3(0, 0, 0.002)}
            bounds={scaledBounds}
            rotation={0}
            unitsPerMeter={headstone.unitsPerMeter}
            currentSizeMm={offset.heightMm ?? 100}
            objectType="motif"
            onUpdate={(data) => {
              if (data.scaleFactor !== undefined) {
                // Update heightMm based on scale factor
                const newHeightMm = (offset.heightMm ?? 100) * data.scaleFactor;
                // Round to integer and enforce minimum of 40mm for color motifs
                const roundedHeight = Math.round(newHeightMm);
                const clampedHeight = Math.max(40, Math.min(roundedHeight, 500));
                
                setMotifOffset(id, {
                  ...offset,
                  heightMm: clampedHeight,
                });
              }
              if (data.rotationDeg !== undefined) {
                // Add rotation delta to current rotation
                const newRotation = (offset.rotationZ || 0) + (data.rotationDeg * Math.PI) / 180;
                setMotifOffset(id, {
                  ...offset,
                  rotationZ: newRotation,
                });
              }
            }}
          />
        )}
      </group>
    </>
  );
}
