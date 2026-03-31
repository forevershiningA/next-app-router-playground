'use client';

import * as React from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useHeadstoneStore } from '#/lib/headstone-store';
import { EMBLEM_SIZES } from '#/app/_internal/_emblems-loader';
import type { HeadstoneAPI } from '../SvgHeadstone';
import SelectionBox from '../SelectionBox';
import { usePathname } from 'next/navigation';

type Props = {
  id: string;
  emblemId: string;
  imageUrl: string;
  headstone?: HeadstoneAPI;
  index?: number;
  surface?: 'headstone' | 'base';
};

export default function EmblemModel({
  id,
  emblemId,
  imageUrl,
  headstone,
  index = 0,
  surface = 'headstone',
}: Props) {
  const { gl, camera, controls } = useThree();
  const pathname = usePathname();

  const selectedEmblemId = useHeadstoneStore((s) => s.selectedEmblemId);
  const setSelectedEmblemId = useHeadstoneStore((s) => s.setSelectedEmblemId);
  const setSelected = useHeadstoneStore((s) => s.setSelected);
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);
  const emblemOffsets = useHeadstoneStore((s) => s.emblemOffsets);
  const setEmblemOffset = useHeadstoneStore((s) => s.setEmblemOffset);
  const removeEmblem = useHeadstoneStore((s) => s.removeEmblem);

  const ref = React.useRef<THREE.Group>(null!);
  const [dragging, setDragging] = React.useState(false);
  const selected = selectedEmblemId === id;
  const dragPositionRef = React.useRef<{ xPos: number; yPos: number } | null>(null);
  const animationFrameRef = React.useRef<number | null>(null);
  const pointerCaptureTargetRef = React.useRef<HTMLElement | null>(null);

  const dragPlane = React.useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const fallbackIntersection = React.useMemo(() => new THREE.Vector3(), []);
  const [texture, setTexture] = React.useState<THREE.Texture | null>(null);
  const planeGeometry = React.useMemo(() => new THREE.PlaneGeometry(1, 1), []);

  React.useEffect(() => () => planeGeometry.dispose(), [planeGeometry]);

  const raycaster = React.useMemo(() => new THREE.Raycaster(), []);
  const mouse = React.useMemo(() => new THREE.Vector2(), []);

  const offset = emblemOffsets[id];

  // Load emblem PNG texture
  React.useEffect(() => {
    let disposed = false;
    let activeTexture: THREE.Texture | null = null;

    async function loadTexture() {
      try {
        const loader = new THREE.TextureLoader();
        // Try medium size first, then small
        const candidates = [
          imageUrl,
          imageUrl.replace('/m/', '/s/'),
          imageUrl.replace('/s/', '/xs/'),
        ].filter(Boolean);

        for (const url of candidates) {
          try {
            const tex = await loader.loadAsync(url);
            if (disposed) {
              tex.dispose();
              return;
            }
            activeTexture = tex;
            tex.colorSpace = THREE.SRGBColorSpace;
            setTexture(tex);
            return;
          } catch {
            // try next
          }
        }
        console.error('[EmblemModel] Failed to load emblem texture', imageUrl);
      } catch (error) {
        console.error('[EmblemModel] Texture load error', error);
      }
    }

    loadTexture();

    return () => {
      disposed = true;
      if (activeTexture) activeTexture.dispose();
    };
  }, [imageUrl, id, setEmblemOffset]);

  // Keep widthMm/heightMm in sync based on texture aspect ratio.
  // Landscape (wider): sizeVariant controls widthMm, heightMm is derived.
  // Portrait (taller): sizeVariant controls heightMm, widthMm is derived.
  React.useEffect(() => {
    if (!texture?.image || !offset) return;
    const imgW = texture.image.width || 1;
    const imgH = texture.image.height || 1;
    const aspect = imgW / imgH;
    const sizeEntry = EMBLEM_SIZES.find((s) => s.variant === offset.sizeVariant);
    const sizeMm = sizeEntry?.heightMm ?? 100;

    let targetW: number;
    let targetH: number;
    if (aspect >= 1) {
      // Landscape: size controls width
      targetW = sizeMm;
      targetH = Math.round(sizeMm / aspect);
    } else {
      // Portrait: size controls height
      targetH = sizeMm;
      targetW = Math.round(sizeMm * aspect);
    }
    if (targetW !== offset.widthMm || targetH !== offset.heightMm) {
      setEmblemOffset(id, { widthMm: targetW, heightMm: targetH });
    }
  }, [texture, offset?.sizeVariant, id, setEmblemOffset]);

  // Drag: place on vertical surface via raycast
  const placeOnSurface = React.useCallback(
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
      localPt.x = Math.max(bbox.min.x + inset, Math.min(bbox.max.x - inset, localPt.x));
      localPt.y = Math.max(bbox.min.y + inset + 0.04 * spanY, Math.min(bbox.max.y - inset, localPt.y));

      dragPositionRef.current = { xPos: localPt.x, yPos: localPt.y };

      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        if (dragPositionRef.current) {
          setEmblemOffset(id, {
            xPos: dragPositionRef.current.xPos,
            yPos: dragPositionRef.current.yPos,
            coordinateSpace: 'absolute',
            target: surface,
          });
        }
        animationFrameRef.current = null;
      });
    },
    [camera, dragPlane, fallbackIntersection, gl, headstone, id, mouse, raycaster, setEmblemOffset, surface],
  );

  // Pointer down: select + start drag
  const handlePointerDown = React.useCallback(
    (e: any) => {
      e.stopPropagation();
      e.nativeEvent?.stopImmediatePropagation?.();

      if (!headstone?.mesh?.current || !gl?.domElement) return;

      setSelectedEmblemId(id);
      setSelected(null);
      setActivePanel('emblem');

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('openFullscreenPanel', { detail: { panel: 'select-emblems' } }),
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
      placeOnSurface(clientX, clientY);
      document.body.style.cursor = 'grabbing';
    },
    [gl, headstone, id, placeOnSurface, setActivePanel, setSelected, setSelectedEmblemId],
  );

  // Drag move/up listeners
  React.useEffect(() => {
    if (!dragging) return;

    const onMove = (event: PointerEvent) => {
      event.preventDefault();
      placeOnSurface(event.clientX, event.clientY);
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
      if (controls) (controls as any).enabled = true;

      if (pointerCaptureTargetRef.current && event.pointerId !== undefined) {
        pointerCaptureTargetRef.current.releasePointerCapture?.(event.pointerId);
        pointerCaptureTargetRef.current = null;
      }
    };

    if (controls) (controls as any).enabled = false;
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      if (controls) (controls as any).enabled = true;
      document.body.style.cursor = 'auto';
      pointerCaptureTargetRef.current = null;
    };
  }, [controls, dragging, placeOnSurface]);

  // Nothing to render without texture or offset
  if (!texture || !offset) return null;

  const stone = headstone?.mesh?.current as THREE.Mesh | null;
  if (!headstone || !stone) return null;

  const unitsPerMeter = headstone.unitsPerMeter ?? 1000;
  const safeUnitsPerMeter = Math.abs(unitsPerMeter) > 1e-6 ? Math.abs(unitsPerMeter) : 1000;
  const mmToLocalUnits = safeUnitsPerMeter / 1000;

  // Derive aspect ratio from loaded texture (width / height)
  const aspect = texture.image
    ? (texture.image.width || 1) / (texture.image.height || 1)
    : 1;

  const widthUnits = (offset.widthMm ?? 100) * mmToLocalUnits;
  const heightUnits = (offset.heightMm ?? 100) * mmToLocalUnits;

  const frontZ = headstone.frontZ ?? 0;
  const stackOffset = index * 0.2;
  const groupZ = frontZ + stackOffset * mmToLocalUnits;

  if (!stone.geometry.boundingBox) stone.geometry.computeBoundingBox();
  const bbox = stone.geometry.boundingBox!;
  const centerX = (bbox.min.x + bbox.max.x) / 2;
  const centerY = (bbox.min.y + bbox.max.y) / 2;

  const coordSpace = offset.coordinateSpace ?? 'offset';
  let displayX: number;
  let displayY: number;

  if (coordSpace === 'absolute') {
    // Absolute local-space coordinates (from drag)
    displayX = offset.xPos;
    displayY = offset.yPos;
  } else if (coordSpace === 'mm-center') {
    // mm offsets from center (from saved designs)
    displayX = centerX + offset.xPos * mmToLocalUnits;
    displayY = centerY + offset.yPos * mmToLocalUnits;
  } else {
    // Default 'offset': offset from center in local units
    displayX = centerX + offset.xPos;
    displayY = centerY - offset.yPos;
  }

  const rotZ = offset.rotationZ ?? 0;
  const flipScaleX = offset.flipX ? -1 : 1;
  const flipScaleY = offset.flipY ? -1 : 1;

  return (
    <group
      ref={ref}
      position={[displayX, displayY, groupZ]}
      rotation={[0, 0, rotZ]}
    >
      {/* Emblem texture plane */}
      <mesh
        onPointerDown={handlePointerDown}
        onClick={(e) => e.stopPropagation()}
        geometry={planeGeometry}
        scale={[widthUnits * flipScaleX, heightUnits * flipScaleY, 1]}
        renderOrder={998}
      >
        <meshBasicMaterial
          map={texture}
          transparent
          side={THREE.DoubleSide}
          depthTest
          depthWrite
        />
      </mesh>

      {/* Selection box when active */}
      {selected && (
        <SelectionBox
          objectId={id}
          position={new THREE.Vector3(0, 0, 0.5 * mmToLocalUnits)}
          bounds={{ width: widthUnits, height: heightUnits }}
          rotation={rotZ}
          unitsPerMeter={headstone.unitsPerMeter ?? 1}
          currentSizeMm={offset.heightMm}
          objectType="motif"
          animateOnShow
          animationDuration={520}
          onUpdate={(data) => {
            if (data.xPos !== undefined && data.yPos !== undefined) {
              setEmblemOffset(id, {
                xPos: data.xPos,
                yPos: data.yPos,
                coordinateSpace: 'absolute',
              });
            }
            if (data.rotationDeg !== undefined) {
              setEmblemOffset(id, {
                rotationZ: (data.rotationDeg * Math.PI) / 180,
              });
            }
          }}
        />
      )}
    </group>
  );
}
