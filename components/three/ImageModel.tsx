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
  const updateImagePosition = useHeadstoneStore((s) => s.updateImagePosition);
  const updateImageSize = useHeadstoneStore((s) => s.updateImageSize);
  const updateImageRotation = useHeadstoneStore((s) => s.updateImageRotation);
  const removeImage = useHeadstoneStore((s) => s.removeImage);
  
  const ref = React.useRef<THREE.Group>(null!);
  const [dragging, setDragging] = React.useState(false);
  const [selected, setSelected] = React.useState(false);
  const dragPositionRef = React.useRef<{ xPos: number; yPos: number } | null>(null);
  const animationFrameRef = React.useRef<number | null>(null);
  
  const dragPlane = React.useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
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
      e.stopPropagation();
      setDragging(true);
      setSelected(true);
      
      if (controls) {
        (controls as any).enabled = false;
      }

      raycaster.setFromCamera(mouse, camera);
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(dragPlane, intersection);
      dragPositionRef.current = { xPos: intersection.x, yPos: intersection.y };
    },
    [controls, camera, raycaster, mouse, dragPlane]
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
      if (!dragging || !dragPositionRef.current) return;

      e.stopPropagation();

      const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
      const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;

      mouse.x = (clientX / gl.domElement.clientWidth) * 2 - 1;
      mouse.y = -(clientY / gl.domElement.clientHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersection = new THREE.Vector3();
      const hit = raycaster.ray.intersectPlane(dragPlane, intersection);

      if (hit) {
        const deltaX = intersection.x - dragPositionRef.current.xPos;
        const deltaY = intersection.y - dragPositionRef.current.yPos;

        const newXPos = xPos + deltaX;
        const newYPos = yPos + deltaY;

        if (animationFrameRef.current !== null) {
          cancelAnimationFrame(animationFrameRef.current);
        }

        animationFrameRef.current = requestAnimationFrame(() => {
          updateImagePosition(id, newXPos, newYPos);
          dragPositionRef.current = { xPos: intersection.x, yPos: intersection.y };
          animationFrameRef.current = null;
        });
      }
    },
    [dragging, xPos, yPos, gl, camera, raycaster, mouse, dragPlane, id, updateImagePosition]
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

  return (
    <group ref={ref} position={[xPos, yPos, 0.5]} rotation={[0, 0, rotationZ]}>
      <mesh
        onPointerDown={handlePointerDown}
        geometry={planeGeometry}
        scale={[width, height, 1]}
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
