'use client';

import * as React from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
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

const MAX_TEXTURE_DIMENSION = 2048;

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
  const baseOffsetDefaults = React.useMemo(() => ({
    xPos: 0,
    yPos: 0,
    scale: 1,
    rotationZ: 0,
    heightMm: 100,
  }), []);
  const dragPlane = React.useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const fallbackIntersection = React.useMemo(() => new THREE.Vector3(), []);
  const [textureInfo, setTextureInfo] = React.useState<{ texture: THREE.CanvasTexture; aspect: number } | null>(null);
  const planeGeometry = React.useMemo(() => new THREE.PlaneGeometry(1, 1), []);

  React.useEffect(() => () => planeGeometry.dispose(), [planeGeometry]);

  const raycaster = React.useMemo(() => new THREE.Raycaster(), []);
  const mouse = React.useMemo(() => new THREE.Vector2(), []);

  React.useEffect(() => {
    let disposed = false;
    let activeTexture: THREE.CanvasTexture | null = null;

    async function loadTexture() {
      try {
        const response = await fetch(svgPath);
        if (!response.ok) {
          throw new Error(`Failed to fetch SVG: ${response.status}`);
        }
        const svgText = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(svgText, 'image/svg+xml');
        const svgElement = doc.documentElement as SVGSVGElement;
        const viewBoxAttr = svgElement.getAttribute('viewBox');
        let width = parseFloat(svgElement.getAttribute('width') || '');
        let height = parseFloat(svgElement.getAttribute('height') || '');
        if ((!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) && viewBoxAttr) {
          const vb = viewBoxAttr.split(/[\s,]+/).map(parseFloat);
          if (vb.length === 4) {
            width = vb[2];
            height = vb[3];
          }
        }
        if (!Number.isFinite(width) || width <= 0) width = 1024;
        if (!Number.isFinite(height) || height <= 0) height = 1024;
        const aspect = width / height || 1;
        let targetHeight = MAX_TEXTURE_DIMENSION;
        let targetWidth = Math.round(targetHeight * aspect);
        if (targetWidth > MAX_TEXTURE_DIMENSION) {
          const scale = MAX_TEXTURE_DIMENSION / targetWidth;
          targetWidth = MAX_TEXTURE_DIMENSION;
          targetHeight = Math.round(targetHeight * scale);
        }
        svgElement.setAttribute('width', `${targetWidth}`);
        svgElement.setAttribute('height', `${targetHeight}`);
        svgElement.setAttribute('preserveAspectRatio', svgElement.getAttribute('preserveAspectRatio') || 'xMidYMid meet');
        const serializer = new XMLSerializer();
        const serialized = serializer.serializeToString(svgElement);
        const blob = new Blob([serialized], { type: 'image/svg+xml' });
        const blobUrl = URL.createObjectURL(blob);
        try {
          const image = new Image();
          image.crossOrigin = 'anonymous';
          await new Promise((resolve, reject) => {
            image.onload = () => resolve(null);
            image.onerror = (err) => reject(err);
            image.src = blobUrl;
          });
          const canvas = document.createElement('canvas');
          canvas.width = image.width;
          canvas.height = image.height;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Failed to create canvas context');
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
          activeTexture = new THREE.CanvasTexture(canvas);
          if (typeof gl.capabilities.getMaxAnisotropy === 'function') {
            activeTexture.anisotropy = gl.capabilities.getMaxAnisotropy();
          }
          activeTexture.generateMipmaps = true;
          activeTexture.minFilter = THREE.LinearMipmapLinearFilter;
          activeTexture.magFilter = THREE.LinearFilter;
          if ('colorSpace' in activeTexture) {
            (activeTexture as any).colorSpace = THREE.SRGBColorSpace;
          }
          activeTexture.needsUpdate = true;
          if (!disposed) {
            setTextureInfo({ texture: activeTexture, aspect: canvas.width / canvas.height || 1 });
          }
        } finally {
          URL.revokeObjectURL(blobUrl);
        }
      } catch (error) {
        console.error('[MotifModel] Failed to rasterize SVG motif', svgPath, error);
        if (!disposed) setTextureInfo(null);
      }
    }

    loadTexture();

    return () => {
      disposed = true;
      if (activeTexture) {
        activeTexture.dispose();
      }
    };
  }, [svgPath, gl]);


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

        // Get current offset to check if it's canonical format
        const currentOffset = motifOffsets[id] ?? baseOffsetDefaults;
        const coordinateSpace = currentOffset.coordinateSpace
          ?? (currentOffset.target !== undefined ? 'absolute' : 'offset');
        const isCanonical = coordinateSpace === 'absolute';
        
        if (isCanonical) {
          // Canonical format: store absolute world coordinates
          setMotifOffset(id, {
            ...currentOffset,
            xPos: localPt.x,
            yPos: localPt.y,
            coordinateSpace: 'absolute',
          });
        } else {
          // Legacy format: store as offset from center (Y-down)
          const centerX = (bbox.min.x + bbox.max.x) / 2;
          const centerY = (bbox.min.y + bbox.max.y) / 2;
          setMotifOffset(id, {
            ...currentOffset,
            xPos: localPt.x - centerX,
            yPos: -(localPt.y - centerY),
            coordinateSpace: 'offset',
          });
        }
      }
    },
    [headstone, gl, camera, raycaster, mouse, id, motifOffsets, setMotifOffset, baseOffsetDefaults, dragPlane, fallbackIntersection]
  );

  const handleClick = React.useCallback(
    (e: any) => {
      e.stopPropagation();

      setSelectedMotifId(id);
      setActivePanel('motif');
      
      // Open motifs fullscreen panel
      window.dispatchEvent(new CustomEvent('openFullscreenPanel', { detail: { panel: 'select-motifs' } }));
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
    if (!gl?.domElement) return;

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
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });
    document.body.style.cursor = 'grabbing';

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
    };
  }, [dragging, gl, controls, placeFromClientXY]);

  const stone = headstone?.mesh?.current as THREE.Mesh | null;
  if (!headstone || !stone || !textureInfo) {
    return null;
  }

  // Get headstone bounds and calculate center (like inscriptions)
  if (!stone.geometry.boundingBox) stone.geometry.computeBoundingBox();
  const bbox = stone.geometry.boundingBox!.clone();
  
  const centerX = (bbox.min.x + bbox.max.x) / 2;
  const centerY = (bbox.min.y + bbox.max.y) / 2;
  const centerZ = headstone.frontZ + 0.02;

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

  const unitsPerMeter = Math.abs(headstone.unitsPerMeter) > 1e-6 ? Math.abs(headstone.unitsPerMeter) : 1000;
  const mmToLocalUnits = unitsPerMeter / 1000;

  const targetHeightMm = offset.heightMm ?? 100;
  const planeHeightUnits = targetHeightMm * mmToLocalUnits;
  const aspectRatio = textureInfo.aspect || 1;
  const planeWidthUnits = planeHeightUnits * aspectRatio;

  const flipX = offset.flipX ?? false;
  const flipY = offset.flipY ?? false;
  
  const scaleX = planeWidthUnits * (flipX ? -1 : 1);
  const scaleY = -planeHeightUnits * (flipY ? -1 : 1);

  const isSelected = selectedMotifId === id;

  const scaledBounds = {
    width: Math.abs(planeWidthUnits),
    height: Math.abs(planeHeightUnits),
  };

  // Position the motif:
  // TWO FORMATS:
  // 1. Legacy: positions stored as offsets from centerY (Y-down format)
  //    - Uses: displayY = centerY - yPos
  // 2. Canonical: positions are absolute world coords (Y-up format) 
  //    - Uses: displayY = yPos
  //
  // Detection: explicit coordinateSpace flag (fallback to legacy heuristic)
  const coordinateSpace = offset.coordinateSpace
    ?? (offset.target !== undefined ? 'absolute' : 'offset');
  const isCanonical = coordinateSpace === 'absolute';
  
  const displayX = isCanonical ? offset.xPos : centerX + offset.xPos;
  const displayY = isCanonical ? offset.yPos : centerY - (offset.yPos || 0);

  console.log('[MotifModel] Positioning:', {
    id,
    isCanonical,
    hasTarget: offset.target !== undefined,
    offset: { x: offset.xPos, y: offset.yPos },
    center: { x: centerX.toFixed(1), y: centerY.toFixed(1) },
    display: { x: displayX.toFixed(1), y: displayY.toFixed(1) },
    flip: { x: flipX, y: flipY },
    scale: { x: scaleX.toFixed(2), y: scaleY.toFixed(2) }
  });

  return (
    <>
      {/* Parent group for positioning - same coordinate system as inscriptions */}
      <group
        position={[displayX, displayY, centerZ]}
        rotation={[0, 0, offset.rotationZ || 0]}
      >
        {/* Motif mesh rendered as textured plane */}
        <mesh
          ref={ref}
          geometry={planeGeometry}
          scale={[scaleX, scaleY, 1]}
          name={`motif-${id}`}
          onClick={handleClick}
          onPointerDown={handlePointerDown}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <meshBasicMaterial
            color={'#ffffff'}
            toneMapped={false}
            transparent
            depthWrite={false}
            depthTest={true}
            side={THREE.DoubleSide}
            map={textureInfo.texture}
            alphaTest={0.01}
          />
        </mesh>
        
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
