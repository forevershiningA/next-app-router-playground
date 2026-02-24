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
  index = 0 
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
  
  const ref = React.useRef<THREE.Group>(null!);
  const [dragging, setDragging] = React.useState(false);
  const selected = selectedImageId === id;
  const dragPositionRef = React.useRef<{ xPos: number; yPos: number } | null>(null);
  const animationFrameRef = React.useRef<number | null>(null);
  
  const dragPlane = React.useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
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

  // Load image texture
  React.useEffect(() => {
    let disposed = false;
    let activeTexture: THREE.Texture | null = null;

    async function loadTexture() {
      try {
        const loader = new THREE.TextureLoader();
        const texture = await loader.loadAsync(imageUrl);
        
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

  // Click handler
  const handlePointerDown = React.useCallback(
    (e: any) => {
      e.stopPropagation();
      e.nativeEvent?.stopImmediatePropagation?.();
      
      if (!headstone?.mesh?.current || !gl?.domElement) return;
      
      // Select this image AND deselect headstone explicitly
      setSelectedImageId(id);
      setSelected(null); // Explicitly deselect headstone
      setActivePanel('image'); // Set active panel to 'image'
      
      setDragging(true);
      
      if (controls) {
        (controls as any).enabled = false;
      }

      // Get initial mouse position on headstone surface
      const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;

      const rect = gl.domElement.getBoundingClientRect();
      mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const targetMesh = headstone.mesh.current as THREE.Mesh;
      const intersects = raycaster.intersectObject(targetMesh, false);

      if (intersects.length > 0) {
        const worldPoint = intersects[0].point.clone();
        const localPt = targetMesh.worldToLocal(worldPoint);
        dragPositionRef.current = { xPos: localPt.x, yPos: localPt.y };
      }
    },
    [controls, camera, raycaster, mouse, gl, headstone, id, setSelectedImageId, setSelected, setActivePanel]
  );

  const handlePointerUp = React.useCallback(() => {
    setDragging(false);
    dragPositionRef.current = null;
    
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (controls) {
      (controls as any).enabled = true;
    }
  }, [controls]);

  const handlePointerMove = React.useCallback(
    (e: any) => {
      if (!dragging || !dragPositionRef.current || !headstone?.mesh?.current || !gl?.domElement) return;

      e.stopPropagation();

      const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;

      const rect = gl.domElement.getBoundingClientRect();
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

      if (worldPoint) {
        const localPt = targetMesh.worldToLocal(worldPoint);

        // Constrain to headstone bounds (same as motifs)
        const geometry = targetMesh.geometry;
        geometry.computeBoundingBox();
        const bbox = geometry.boundingBox!;

        const inset = 0.01; // 1cm inset from edges
        const spanY = bbox.max.y - bbox.min.y;
        
        const minX = bbox.min.x + inset;
        const maxX = bbox.max.x - inset;
        const minY = bbox.min.y + inset + 0.04 * spanY;
        const maxY = bbox.max.y - inset;

        localPt.x = Math.max(minX, Math.min(maxX, localPt.x));
        localPt.y = Math.max(minY, Math.min(maxY, localPt.y));

        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
        }

        animationFrameRef.current = requestAnimationFrame(() => {
          updateImagePosition(id, localPt.x, localPt.y);
          animationFrameRef.current = null;
        });
      }
    },
    [dragging, gl, camera, raycaster, mouse, dragPlane, fallbackIntersection, headstone, id, updateImagePosition]
  );

  React.useEffect(() => {
    const canvas = gl.domElement;
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('touchmove', handlePointerMove);
    canvas.addEventListener('touchend', handlePointerUp);

    return () => {
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('touchmove', handlePointerMove);
      canvas.removeEventListener('touchend', handlePointerUp);
    };
  }, [gl, handlePointerMove, handlePointerUp]);

  if (!textureInfo) {
    return null;
  }

  const { texture, aspect } = textureInfo;
  const width = widthMm;
  const height = heightMm;
  
  // Get headstone frontZ position (same as motifs/inscriptions)
  const frontZ = headstone?.frontZ ?? 0;
  const stackOffset = (index ?? 0) * 0.2; // Slight Z lift per image to prevent z-fighting when overlapping
  const groupZ = frontZ + stackOffset;
  
  // Determine if this image needs a ceramic/enamel base (all except Granite Image ID 21)
  const needsCeramicBase = typeId !== 21 && typeId !== 135; // Granite Image (21) and YAG Laser (135) are flat
  
  // Ceramic base parameters
  const ceramicDepthMm = 1; // Very thin ceramic layer - just 1mm depth
  const borderPercentage = 0.05; // 5% border around photo
  
  // Calculate correct scale for ceramic base to match image dimensions
  let ceramicScaleX = 1;
  let ceramicScaleY = 1;
  let ceramicScaleZ = 1;
  let actualCeramicDepthInUnits = ceramicDepthMm;
  
  if (ceramicBaseData) {
    // Scale ceramic to be LARGER than the photo to create visible border
    // Ceramic = photo size + border
    ceramicScaleX = (width * (1 + borderPercentage)) / ceramicBaseData.svgWidth;
    ceramicScaleY = (height * (1 + borderPercentage)) / ceramicBaseData.svgHeight;
    
    // Z scale to get actual 1mm depth
    const avgScale = (ceramicScaleX + ceramicScaleY) / 2;
    ceramicScaleZ = avgScale * (ceramicDepthMm / 2);
    
    actualCeramicDepthInUnits = 2 * ceramicScaleZ;
  }

  return (
    <group ref={ref} position={[xPos, yPos, groupZ]} rotation={[0, 0, rotationZ]}>
      
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
        position={[0, 0, actualCeramicDepthInUnits + 0.1]} // Photo slightly above ceramic surface
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
          position={new THREE.Vector3(0, 0, actualCeramicDepthInUnits + 0.5)}
          bounds={{ width, height }}
          rotation={rotationZ}
          unitsPerMeter={1}
          currentSizeMm={widthMm}
          objectType="motif"
          animateOnShow={true}
          animationDuration={520}
          onUpdate={(data) => {
            if (data.xPos !== undefined && data.yPos !== undefined) {
              updateImagePosition(id, data.xPos, data.yPos);
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
