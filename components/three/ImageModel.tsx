'use client';

import * as React from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
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
  const updateImagePosition = useHeadstoneStore((s) => s.updateImagePosition);
  const updateImageSize = useHeadstoneStore((s) => s.updateImageSize);
  const updateImageRotation = useHeadstoneStore((s) => s.updateImageRotation);
  const removeImage = useHeadstoneStore((s) => s.removeImage);
  
  const ref = React.useRef<THREE.Group>(null!);
  const [dragging, setDragging] = React.useState(false);
  const selected = selectedImageId === id;
  const dragPositionRef = React.useRef<{ xPos: number; yPos: number } | null>(null);
  const animationFrameRef = React.useRef<number | null>(null);
  
  const dragPlane = React.useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), -2.0), []);
  const fallbackIntersection = React.useMemo(() => new THREE.Vector3(), []);
  const [textureInfo, setTextureInfo] = React.useState<{ texture: THREE.Texture; aspect: number } | null>(null);
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
        
        console.log('[ImageModel] Texture loaded:', {
          id,
          textureWidth: texture.image.width,
          textureHeight: texture.image.height,
          textureAspect: aspect,
          meshWidthMm: widthMm,
          meshHeightMm: heightMm,
          meshAspect: widthMm / heightMm,
        });

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

  // Click handler
  const handlePointerDown = React.useCallback(
    (e: any) => {
      console.log('[ImageModel] Pointer down on image:', id);
      e.stopPropagation();
      e.nativeEvent?.stopImmediatePropagation?.();
      
      if (!headstone?.mesh?.current || !gl?.domElement) return;
      
      // Select this image AND deselect headstone explicitly
      console.log('[ImageModel] Setting selectedImageId to:', id);
      setSelectedImageId(id);
      setSelected(null); // Explicitly deselect headstone
      
      console.log('[ImageModel] Starting drag');
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
        console.log('[ImageModel] Initial drag position:', dragPositionRef.current);
      }
    },
    [controls, camera, raycaster, mouse, gl, headstone, id, setSelectedImageId, setSelected]
  );

  const handlePointerUp = React.useCallback(() => {
    console.log('[ImageModel] Pointer up - stopping drag');
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

      console.log('[ImageModel] Pointer move while dragging');
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

        console.log('[ImageModel] Local point:', localPt.x, localPt.y);

        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
        }

        animationFrameRef.current = requestAnimationFrame(() => {
          console.log('[ImageModel] Updating position to:', localPt.x, localPt.y);
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
  
  console.log('[ImageModel] Rendering with dimensions:', { id, width, height, aspect: width/height });

  return (
    <group ref={ref} position={[xPos, yPos, 2.0]} rotation={[0, 0, rotationZ]}>
      <mesh
        onPointerDown={handlePointerDown}
        onClick={(e) => {
          console.log('[ImageModel] onClick handler');
          e.stopPropagation();
        }}
        geometry={planeGeometry}
        scale={[width, height, 1]}
        renderOrder={999}
      >
        <meshBasicMaterial 
          map={texture} 
          transparent={true}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {selected && (
        <SelectionBox
          objectId={id}
          position={new THREE.Vector3(0, 0, 0)}
          bounds={{ width, height }}
          rotation={rotationZ}
          unitsPerMeter={1}
          currentSizeMm={widthMm}
          objectType="motif"
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
