'use client';

import * as React from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { useHeadstoneStore } from '#/lib/headstone-store';
import type { HeadstoneAPI } from '../SvgHeadstone';
import SelectionBox from '../SelectionBox';
import { useRouter, usePathname } from 'next/navigation';

type Props = {
  id: string;
  imageUrl: string;
  widthMm: number;
  heightMm: number;
  xPos: number;
  yPos: number;
  rotationZ: number;
  typeId?: number;
  maskShape?: string;
  headstone?: HeadstoneAPI;
  index?: number;
  surface?: 'headstone' | 'base' | 'ledger';
  coordinateSpace?: 'mm-center';
};

export default function ImageModel({ 
  id, 
  imageUrl, 
  widthMm, 
  heightMm, 
  xPos, 
  yPos, 
  rotationZ,
  typeId,
  maskShape = 'oval_horizontal',
  headstone, 
  index = 0,
  surface = 'headstone',
  coordinateSpace,
}: Props) {
  const { gl, camera, controls } = useThree();
  const router = useRouter();
  const pathname = usePathname();
  
  const selectedImages = useHeadstoneStore((s) => s.selectedImages);
  const setSelectedImageId = useHeadstoneStore((s) => s.setSelectedImageId);
  const selectedImageId = useHeadstoneStore((s) => s.selectedImageId);
  const setSelected = useHeadstoneStore((s) => s.setSelected);
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);
  const updateImagePosition = useHeadstoneStore((s) => s.updateImagePosition);
  const updateImageSize = useHeadstoneStore((s) => s.updateImageSize);
  const updateImageRotation = useHeadstoneStore((s) => s.updateImageRotation);
  const removeImage = useHeadstoneStore((s) => s.removeImage);
  const ledgerWidthMm = useHeadstoneStore((s) => s.ledgerWidthMm);
  const ledgerDepthMm = useHeadstoneStore((s) => s.ledgerDepthMm);
  
  const ref = React.useRef<THREE.Group>(null!);
  const [dragging, setDragging] = React.useState(false);
  const selected = selectedImageId === id;
  const dragPositionRef = React.useRef<{ xPos: number; yPos: number } | null>(null);
  const animationFrameRef = React.useRef<number | null>(null);
  const pointerCaptureTargetRef = React.useRef<HTMLElement | null>(null);
  
  const dragPlane = React.useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const ledgerPlane = React.useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  const fallbackIntersection = React.useMemo(() => new THREE.Vector3(), []);
  const [textureInfo, setTextureInfo] = React.useState<{ texture: THREE.Texture; aspect: number } | null>(null);
  const [ceramicBaseData, setCeramicBaseData] = React.useState<{
    geometry: THREE.ExtrudeGeometry;
    svgWidth: number;
    svgHeight: number;
  } | null>(null);
  const planeGeometry = React.useMemo(() => new THREE.PlaneGeometry(1, 1), []);

  React.useEffect(() => () => planeGeometry.dispose(), [planeGeometry]);

  const raycaster = React.useMemo(() => new THREE.Raycaster(), []);
  const mouse = React.useMemo(() => new THREE.Vector2(), []);
  const isLedgerSurface = surface === 'ledger';

  // Load image texture
  React.useEffect(() => {
    let disposed = false;
    let activeTexture: THREE.Texture | null = null;

    async function loadTexture() {
      try {
        const loader = new THREE.TextureLoader();
        const candidates = Array.from(new Set([
          imageUrl,
          imageUrl.replace(/\/([^/]+)$/, '/$1'),
          imageUrl
            .replace(/\/saved-designs\/upload\/(\d{4})\/(\d{2})\/([^/]+)$/i, '/saved-designs/upload/$3')
            .replace(/\/saved-designs\/upload\/([^/]+)$/i, '/saved-designs/upload/$1'),
        ])).filter(Boolean);
        let loaded: THREE.Texture | null = null;
        for (const candidate of candidates) {
          try {
            const texture = await loader.loadAsync(candidate);
            loaded = texture;
            break;
          } catch {
            // try next candidate
          }
        }
        if (!loaded) throw new Error('No valid image URL candidate resolved');
        const texture = loaded;
        if (disposed) {
          texture.dispose();
          return;
        }

        activeTexture = texture;
        const aspect = texture.image.width / texture.image.height || 1;

        setTextureInfo({ texture, aspect });
      } catch (error) {
        console.error('[ImageModel] Failed to load image texture', imageUrl, error);
      }
    }

    loadTexture();

    return () => {
      disposed = true;
      if (activeTexture) {
        activeTexture.dispose();
      }
    };
  }, [imageUrl]);

  // Load SVG mask shape for ceramic base with high-quality extrusion
  React.useEffect(() => {
    const needsCeramicBase = typeId !== 21 && typeId !== 135;
    if (!needsCeramicBase || !maskShape) {
      setCeramicBaseData(null);
      return;
    }

    let disposed = false;
    let geometry: THREE.ExtrudeGeometry | null = null;

    async function loadMaskShape() {
      try {
        const svgPath = `/shapes/masks/${maskShape}.svg`;
        const response = await fetch(svgPath);
        const svgText = await response.text();
        
        if (disposed) return;

        const loader = new SVGLoader();
        const svgData = loader.parse(svgText);
        const paths = svgData.paths;

        if (paths.length === 0) return;

        // Get the first path (mask outline)
        const path = paths[0];
        const shapes = SVGLoader.createShapes(path);

        if (shapes.length === 0) return;

        // HIGH-QUALITY extrusion settings for smooth edges
        const extrudeSettings = {
          depth: 2,
          bevelEnabled: true,
          bevelThickness: 0.3,  // Increased for smoother bevels
          bevelSize: 0.3,       // Increased for smoother bevels
          bevelSegments: 8,     // Much higher for smooth curves (was 1)
          curveSegments: 64,    // Much higher for smooth SVG curves (default is 12)
        };

        geometry = new THREE.ExtrudeGeometry(shapes, extrudeSettings);
        
        // Get SVG dimensions BEFORE centering
        geometry.computeBoundingBox();
        const bbox = geometry.boundingBox!;
        const svgWidth = bbox.max.x - bbox.min.x;
        const svgHeight = bbox.max.y - bbox.min.y;
        
        // Center the geometry
        const centerX = (bbox.min.x + bbox.max.x) / 2;
        const centerY = (bbox.min.y + bbox.max.y) / 2;
        geometry.translate(-centerX, -centerY, 0);

        if (!disposed) {
          setCeramicBaseData({ geometry, svgWidth, svgHeight });
        }
      } catch (error) {
        console.error('[ImageModel] Failed to load mask shape:', error);
      }
    }

    loadMaskShape();

    return () => {
      disposed = true;
      if (geometry) {
        geometry.dispose();
      }
    };
  }, [typeId, maskShape]);

  const placeOnVerticalSurface = React.useCallback(
    (clientX: number, clientY: number) => {
      if (!headstone?.mesh?.current || !gl?.domElement) return;

      const canvas = gl.domElement;
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const targetMesh = headstone.mesh.current as THREE.Mesh;
      const intersects = raycaster.intersectObject(targetMesh, false);

      let worldPoint: THREE.Vector3 | null = null;

      if (intersects.length > 0) {
        worldPoint = intersects[0].point.clone();
      } else {
        dragPlane.normal.set(0, 0, 1);
        dragPlane.constant = -(headstone.frontZ ?? 0);
        if (raycaster.ray.intersectPlane(dragPlane, fallbackIntersection)) {
          worldPoint = fallbackIntersection.clone();
        }
      }

      if (!worldPoint) return;

      const localPt = targetMesh.worldToLocal(worldPoint);

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

      dragPositionRef.current = { xPos: localPt.x, yPos: localPt.y };

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        updateImagePosition(id, localPt.x, localPt.y);
        animationFrameRef.current = null;
      });
    },
    [
      camera,
      dragPlane,
      fallbackIntersection,
      gl,
      headstone,
      id,
      mouse,
      raycaster,
      updateImagePosition,
    ],
  );

  const placeOnLedgerSurface = React.useCallback(
    (clientX: number, clientY: number) => {
      if (!isLedgerSurface) return;
      if (!headstone?.mesh?.current || !gl?.domElement) return;

      const canvas = gl.domElement;
      const rect = canvas.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const targetMesh = headstone.mesh.current as THREE.Mesh;
      const hits = raycaster.intersectObject(targetMesh, true);
      let hit =
        hits.find((h) => h.face?.normal?.y && h.face.normal.y > 0.4) ?? hits[0];

      if (!hit) {
        // Use actual monument-local top Y, not geometry bbox (which gives 0.5 for unit-cube mesh)
        const topY = targetMesh.position.y + targetMesh.scale.y / 2;
        ledgerPlane.set(new THREE.Vector3(0, 1, 0), -topY);
        if (raycaster.ray.intersectPlane(ledgerPlane, fallbackIntersection)) {
          hit = { point: fallbackIntersection.clone() } as THREE.Intersection;
        }
      }

      if (!hit) return;

      const localPt = targetMesh.worldToLocal(hit.point.clone());
      if (!targetMesh.geometry.boundingBox) targetMesh.geometry.computeBoundingBox();
      const bbox = targetMesh.geometry.boundingBox!;
      const centerX = (bbox.min.x + bbox.max.x) / 2;
      const centerZ = (bbox.min.z + bbox.max.z) / 2;

      const widthUnits =
        (ledgerWidthMm ?? (bbox.max.x - bbox.min.x) * 1000) / 1000;
      const depthUnits =
        (ledgerDepthMm ?? (bbox.max.z - bbox.min.z) * 1000) / 1000;

      const halfWidth = Math.max(widthUnits / 2 - 0.005, 0.001);
      const halfDepth = Math.max(depthUnits / 2 - 0.005, 0.001);

      const minX = centerX - halfWidth;
      const maxX = centerX + halfWidth;
      const minZ = centerZ - halfDepth;
      const maxZ = centerZ + halfDepth;

      const clampedX = Math.max(minX, Math.min(maxX, localPt.x));
      const clampedZ = Math.max(minZ, Math.min(maxZ, localPt.z));

      const relativeX = clampedX - centerX;
      const relativeZ = clampedZ - centerZ;

      dragPositionRef.current = { xPos: relativeX, yPos: relativeZ };

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        updateImagePosition(id, relativeX, relativeZ);
        animationFrameRef.current = null;
      });
    },
    [
      camera,
      fallbackIntersection,
      gl,
      headstone,
      id,
      isLedgerSurface,
      ledgerDepthMm,
      ledgerPlane,
      ledgerWidthMm,
      mouse,
      raycaster,
      updateImagePosition,
    ],
  );

  const placeFromClientXY = React.useCallback(
    (clientX: number, clientY: number) => {
      if (isLedgerSurface) {
        placeOnLedgerSurface(clientX, clientY);
      } else {
        placeOnVerticalSurface(clientX, clientY);
      }
    },
    [isLedgerSurface, placeOnLedgerSurface, placeOnVerticalSurface],
  );

  // Click handler
  const handlePointerDown = React.useCallback(
    (e: any) => {
      e.stopPropagation();
      e.nativeEvent?.stopImmediatePropagation?.();

      if (!headstone?.mesh?.current || !gl?.domElement) return;

      setSelectedImageId(id);
      setSelected(null);
      setActivePanel('image');

      // Dispatch canvas-open event so DesignerNav sets panelSource='canvas',
      // which prevents the panel-closure guard from immediately closing the panel.
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('openFullscreenPanel', { detail: { panel: 'select-images' } }),
        );
      }

      setDragging(true);
      const targetElement = e.target as HTMLElement | null;
      if (targetElement?.setPointerCapture && e.pointerId !== undefined) {
        targetElement.setPointerCapture(e.pointerId);
        pointerCaptureTargetRef.current = targetElement;
      }

      const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
      placeFromClientXY(clientX, clientY);
      document.body.style.cursor = 'grabbing';
    },
    [
      gl,
      headstone,
      id,
      placeFromClientXY,
      setActivePanel,
      setSelected,
      setSelectedImageId,
    ],
  );

  React.useEffect(() => {
    if (!dragging) return;

    const onMove = (event: PointerEvent) => {
      event.preventDefault();
      placeFromClientXY(event.clientX, event.clientY);
    };

    const onUp = (event: PointerEvent) => {
      event.preventDefault();

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      dragPositionRef.current = null;
      setDragging(false);
      document.body.style.cursor = 'auto';
      if (controls) {
        (controls as any).enabled = true;
      }

      if (pointerCaptureTargetRef.current && event.pointerId !== undefined) {
        pointerCaptureTargetRef.current.releasePointerCapture?.(event.pointerId);
        pointerCaptureTargetRef.current = null;
      }
    };

    if (controls) {
      (controls as any).enabled = false;
    }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      if (controls) {
        (controls as any).enabled = true;
      }
      document.body.style.cursor = 'auto';
      pointerCaptureTargetRef.current = null;
    };
  }, [controls, dragging, placeFromClientXY]);

  if (!textureInfo) {
    return null;
  }

  const { texture, aspect } = textureInfo;
  const unitsPerMeter = headstone?.unitsPerMeter ?? 1000;
  const safeUnitsPerMeter =
    Math.abs(unitsPerMeter) > 1e-6 ? Math.abs(unitsPerMeter) : 1000;
  const mmToLocalUnits = safeUnitsPerMeter / 1000;
  const width = widthMm * mmToLocalUnits;
  const height = heightMm * mmToLocalUnits;
  
  // Get headstone frontZ position (same as motifs/inscriptions)
  const frontZ = headstone?.frontZ ?? 0;
  const stackOffset = (index ?? 0) * 0.2; // Slight Z lift per image to prevent z-fighting when overlapping
  const groupZ = frontZ + stackOffset * mmToLocalUnits;
  
  // Determine if this image needs a ceramic/enamel base (all except Granite Image ID 21)
  const needsCeramicBase = typeId !== 21 && typeId !== 135; // Granite Image (21) and YAG Laser (135) are flat
  
  // Ceramic base parameters
  const ceramicDepthMm = 1; // Very thin ceramic layer - just 1mm depth
  const borderPercentage = 0.05; // 5% border around photo
  const ceramicDepthUnits = ceramicDepthMm * mmToLocalUnits;
  
  // Calculate correct scale for ceramic base to match image dimensions
  let ceramicScaleX = 1;
  let ceramicScaleY = 1;
  let ceramicScaleZ = 1;
  let actualCeramicDepthInUnits = ceramicDepthUnits;
  
  if (ceramicBaseData) {
    // Scale ceramic to be LARGER than the photo to create visible border
    // Ceramic = photo size + border
    ceramicScaleX = (width * (1 + borderPercentage)) / ceramicBaseData.svgWidth;
    ceramicScaleY = (height * (1 + borderPercentage)) / ceramicBaseData.svgHeight;
    
    // Z scale to get actual 1mm depth
    const avgScale = (ceramicScaleX + ceramicScaleY) / 2;
    ceramicScaleZ = avgScale * (ceramicDepthUnits / 2);
    
    actualCeramicDepthInUnits = 2 * ceramicScaleZ;
  }

  const stone = headstone?.mesh?.current as THREE.Mesh | null;
  if (!headstone || !stone) {
    return null;
  }

  if (!stone.geometry.boundingBox) stone.geometry.computeBoundingBox();
  const bbox = stone.geometry.boundingBox!.clone();
  const centerX = (bbox.min.x + bbox.max.x) / 2;
  const centerY = (bbox.min.y + bbox.max.y) / 2;
  // For ledger: the mesh is a unit cube (geometry ±0.5) with position+scale applied.
  // Use stone.position/scale for real monument-local bounds.
  const ledgerCenterX = stone.position.x;
  const ledgerCenterZ = stone.position.z;
  const ledgerTopY = stone.position.y + stone.scale.y / 2;
  const safeX = xPos ?? 0;
  const safeY = yPos ?? 0;

  let groupPosition: [number, number, number];
  let groupRotation: [number, number, number];

  if (isLedgerSurface) {
    // xPos/yPos are fractional (from worldToLocal on unit-cube mesh); multiply by scale to get meters
    const displayX = ledgerCenterX + (xPos ?? 0) * stone.scale.x;
    const displayZ = ledgerCenterZ + (yPos ?? 0) * stone.scale.z;
    const ledgerLift = 0.001 + (index ?? 0) * 0.001;
    groupPosition = [displayX, ledgerTopY + ledgerLift, displayZ];
    groupRotation = [-Math.PI / 2, rotationZ || 0, 0];
  } else if (coordinateSpace === 'mm-center') {
    // Loaded design: mm offsets from center, positive Y = above center
    const displayX = centerX + safeX * mmToLocalUnits;
    const displayY = centerY + safeY * mmToLocalUnits;
    groupPosition = [displayX, displayY, groupZ];
    groupRotation = [0, 0, rotationZ];
  } else {
    groupPosition = [safeX, safeY, groupZ];
    groupRotation = [0, 0, rotationZ];
  }

  return (
    <group ref={ref} position={groupPosition} rotation={groupRotation}>
      
      {/* White ceramic/enamel base - 3D extruded SVG shape with smooth edges */}
      {needsCeramicBase && ceramicBaseData && (
        <mesh
          geometry={ceramicBaseData.geometry}
          position={[0, 0, 0]} // Back face at z=0 (parent is at frontZ)
          scale={[ceramicScaleX, -ceramicScaleY, ceramicScaleZ]} // Negative Y to flip SVG coordinate system
          rotation={[0, 0, 0]}
          renderOrder={997}
        >
          <meshStandardMaterial 
            color="#ffffff"
            roughness={0.2}
            metalness={0.05}
            flatShading={false}
          />
        </mesh>
      )}
      
      {/* Photo texture on top (ABOVE ceramic base, flush with ceramic surface) */}
      <mesh
        onPointerDown={handlePointerDown}
        onClick={(e) => {
          e.stopPropagation();
        }}
        position={[0, 0, actualCeramicDepthInUnits + 0.1 * mmToLocalUnits]} // Photo slightly above ceramic surface
        geometry={planeGeometry}
        scale={[width, height, 1]}
        renderOrder={999}
        visible={true}
      >
        <meshBasicMaterial 
          map={texture} 
          transparent={true}
          side={THREE.DoubleSide}
          opacity={1.0}
          depthTest={true}
          depthWrite={true}
        />
      </mesh>
      
      {selected && (
        <SelectionBox
          objectId={id}
          position={new THREE.Vector3(0, 0, actualCeramicDepthInUnits + 0.5 * mmToLocalUnits)}
          bounds={{ width, height }}
          rotation={isLedgerSurface ? 0 : rotationZ}
          unitsPerMeter={headstone?.unitsPerMeter ?? 1}
          currentSizeMm={widthMm}
          objectType="motif"
          animateOnShow={true}
          animationDuration={520}
          onUpdate={(data) => {
            if (data.xPos !== undefined && data.yPos !== undefined) {
              if (isLedgerSurface) {
                const relativeX = data.xPos - centerX;
                const relativeZ = data.yPos - ledgerCenterZ;
                updateImagePosition(id, relativeX, relativeZ);
              } else {
                updateImagePosition(id, data.xPos, data.yPos);
              }
            }
            if (data.rotationDeg !== undefined) {
              updateImageRotation(id, (data.rotationDeg * Math.PI) / 180);
            }
          }}
        />
      )}
    </group>
  );
}
