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
  surface?: 'headstone' | 'base' | 'ledger';
};

const MAX_TEXTURE_DIMENSION = 2048;
const STAINLESS_MOTIF_PRODUCT_IDS = new Set(['1', '23']);
const STAINLESS_MOTIF_COLOR = '#e4e8ea';
const SILHOUETTE_BACKGROUND_LUMINANCE = 245;
const SILHOUETTE_ALPHA_THRESHOLD = 12;

function applyLineArtAlphaMask(imageData: ImageData) {
  const pixels = imageData.data;
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];
    const luminance = (r + g + b) / 3;

    pixels[i] = 255;
    pixels[i + 1] = 255;
    pixels[i + 2] = 255;
    pixels[i + 3] = a > 0 ? 255 - luminance : 0;
  }
}

function applySolidSilhouetteMask(imageData: ImageData) {
  const { width, height, data: pixels } = imageData;
  const size = width * height;
  const outside = new Uint8Array(size);
  const queue = new Int32Array(size);
  let head = 0;
  let tail = 0;

  const isBackground = (pixelIndex: number) => {
    const offset = pixelIndex * 4;
    const alpha = pixels[offset + 3];
    if (alpha <= SILHOUETTE_ALPHA_THRESHOLD) return true;

    const luminance = (pixels[offset] + pixels[offset + 1] + pixels[offset + 2]) / 3;
    return luminance >= SILHOUETTE_BACKGROUND_LUMINANCE;
  };

  const enqueueIfOutside = (pixelIndex: number) => {
    if (outside[pixelIndex] || !isBackground(pixelIndex)) return;
    outside[pixelIndex] = 1;
    queue[tail] = pixelIndex;
    tail += 1;
  };

  for (let x = 0; x < width; x += 1) {
    enqueueIfOutside(x);
    enqueueIfOutside((height - 1) * width + x);
  }
  for (let y = 1; y < height - 1; y += 1) {
    enqueueIfOutside(y * width);
    enqueueIfOutside(y * width + width - 1);
  }

  while (head < tail) {
    const pixelIndex = queue[head];
    head += 1;
    const x = pixelIndex % width;
    const y = Math.floor(pixelIndex / width);

    if (x > 0) enqueueIfOutside(pixelIndex - 1);
    if (x < width - 1) enqueueIfOutside(pixelIndex + 1);
    if (y > 0) enqueueIfOutside(pixelIndex - width);
    if (y < height - 1) enqueueIfOutside(pixelIndex + width);
  }

  for (let pixelIndex = 0; pixelIndex < size; pixelIndex += 1) {
    const offset = pixelIndex * 4;
    const isSilhouette = outside[pixelIndex] === 0;
    pixels[offset] = 255;
    pixels[offset + 1] = 255;
    pixels[offset + 2] = 255;
    pixels[offset + 3] = isSilhouette ? 255 : 0;
  }
}

export default function MotifModel({
  id,
  svgPath,
  color,
  headstone,
  index = 0,
  surface = 'headstone',
}: Props) {
  const { gl, camera, controls } = useThree();
  const router = useRouter();
  const pathname = usePathname();
  
  // Check if this is a Traditional Engraved product (sandblasted effect)
  const productId = useHeadstoneStore((s) => s.productId);
  const catalog = useHeadstoneStore((s) => s.catalog);
  const product = React.useMemo(() => {
    if (!productId) return null;
    return data.products.find(p => p.id === productId);
  }, [productId]);
  const isTraditionalEngraved = product?.name.includes('Traditional Engraved') ?? false;
  const isStainlessSteelMotif =
    Boolean(productId && STAINLESS_MOTIF_PRODUCT_IDS.has(productId)) ||
    (catalog?.product.type === 'headstone' &&
      catalog.product.formula?.toLowerCase() === 'steel');
  
  const setMotifRef = useHeadstoneStore((s) => s.setMotifRef);
  const motifOffsets = useHeadstoneStore((s) => s.motifOffsets);
  const setSelectedMotifId = useHeadstoneStore((s) => s.setSelectedMotifId);
  const selectedMotifId = useHeadstoneStore((s) => s.selectedMotifId);
  const setMotifOffset = useHeadstoneStore((s) => s.setMotifOffset);
  const setActivePanel = useHeadstoneStore((s) => s.setActivePanel);
  const ledgerWidthMm = useHeadstoneStore((s) => s.ledgerWidthMm);
  const ledgerDepthMm = useHeadstoneStore((s) => s.ledgerDepthMm);
  const ref = React.useRef<THREE.Group>(null!);
  const [dragging, setDragging] = React.useState(false);
  const dragPositionRef = React.useRef<{ xPos: number; yPos: number } | null>(null);
  const animationFrameRef = React.useRef<number | null>(null);
  const transferringRef = React.useRef(false);
  const baseOffsetDefaults = React.useMemo(
    () => ({
      xPos: 0,
      yPos: 0,
      scale: 1,
      rotationZ: 0,
      heightMm: 100,
    }),
    [],
  );
  const dragPlane = React.useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const fallbackIntersection = React.useMemo(() => new THREE.Vector3(), []);
  const [textureInfo, setTextureInfo] = React.useState<{ texture: THREE.CanvasTexture; aspect: number } | null>(null);
  const planeGeometry = React.useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const pointerCaptureTargetRef = React.useRef<HTMLElement | null>(null);
  const isLedgerSurface = surface === 'ledger';
  const isBaseSurface = surface === 'base';

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
        const svgElement = doc.documentElement as unknown as SVGSVGElement;
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
          
          // Convert motif art into an alpha mask. Stainless motifs use a solid
          // outside-contour silhouette so fabrication does not imply tiny cuts.
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          if (isStainlessSteelMotif) {
            applySolidSilhouetteMask(imageData);
          } else {
            applyLineArtAlphaMask(imageData);
          }
          ctx.putImageData(imageData, 0, 0);
          
          activeTexture = new THREE.CanvasTexture(canvas);
          activeTexture.flipY = false;
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
  }, [svgPath, gl, isStainlessSteelMotif]);


  const placeOnVerticalSurface = React.useCallback(
    (clientX: number, clientY: number) => {
      if (isLedgerSurface) return;
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

      // Transfer headstone → base / ledger when motif dragged below stone
      if (!isBaseSurface && !isLedgerSurface && !transferringRef.current && localPt.y < minY) {
        transferringRef.current = true;
        const state = useHeadstoneStore.getState();
        const isFullMonument = state.catalog?.product.type === 'full-monument';
        if (isFullMonument && state.showLedger) {
          setMotifOffset(id, { ...(motifOffsets[id] ?? baseOffsetDefaults), target: 'ledger', xPos: 0, yPos: 0, coordinateSpace: 'offset' });
        } else if (!isFullMonument && state.showBase) {
          setMotifOffset(id, { ...(motifOffsets[id] ?? baseOffsetDefaults), target: 'base', xPos: 0, yPos: 0, coordinateSpace: 'mm-center' });
        }
        return;
      }

      // Transfer base → headstone when motif dragged above base top
      if (isBaseSurface && !transferringRef.current && localPt.y > maxY) {
        transferringRef.current = true;
        setMotifOffset(id, { ...(motifOffsets[id] ?? baseOffsetDefaults), target: 'headstone', xPos: 0, yPos: 0, coordinateSpace: 'offset' });
        return;
      }

      // Guard: stop position updates after a transfer is in flight to prevent
      // stale pointermove events from overwriting the store with wrong coordinates.
      if (transferringRef.current) return;

      localPt.x = Math.max(minX, Math.min(maxX, localPt.x));
      localPt.y = Math.max(minY, Math.min(maxY, localPt.y));

      const currentOffset = motifOffsets[id] ?? baseOffsetDefaults;
      const coordinateSpace = currentOffset.coordinateSpace ?? (currentOffset.target !== undefined ? 'absolute' : 'offset');
      const isCanonical = coordinateSpace === 'absolute' || coordinateSpace === 'mm-center';

      if (isBaseSurface && isCanonical) {
        // Base mesh is a unit cube: localPt is ±0.5. Convert to mm offsets
        // from the base center so the mm-center rendering path handles z correctly.
        dragPositionRef.current = {
          xPos: localPt.x * targetMesh.scale.x * 1000,
          yPos: localPt.y * targetMesh.scale.y * 1000,
        };
      } else if (isCanonical) {
        dragPositionRef.current = {
          xPos: localPt.x,
          yPos: localPt.y,
        };
      } else {
        const centerX = (bbox.min.x + bbox.max.x) / 2;
        const centerY = (bbox.min.y + bbox.max.y) / 2;
        dragPositionRef.current = {
          xPos: localPt.x - centerX,
          yPos: -(localPt.y - centerY),
        };
      }

      if (animationFrameRef.current === null) {
        animationFrameRef.current = requestAnimationFrame(() => {
          if (dragPositionRef.current) {
            setMotifOffset(id, {
              ...currentOffset,
              ...dragPositionRef.current,
              // Keep mm-center for base so z is computed from mesh position
              coordinateSpace: isBaseSurface ? 'mm-center' : (isCanonical ? 'absolute' : 'offset'),
              target: surface,
            });
          }
          animationFrameRef.current = null;
        });
      }
    },
    [
      baseOffsetDefaults,
      camera,
      dragPlane,
      fallbackIntersection,
      gl,
      headstone,
      id,
      isBaseSurface,
      isLedgerSurface,
      mouse,
      motifOffsets,
      raycaster,
      setMotifOffset,
      surface,
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
        // Use actual monument-local top Y (not geometry bbox which gives ±0.5 for unit-cube mesh)
        const topY = targetMesh.position.y + targetMesh.scale.y / 2;
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -topY);
        if (raycaster.ray.intersectPlane(plane, fallbackIntersection)) {
          hit = { point: fallbackIntersection.clone() } as THREE.Intersection;
        }
      }

      if (!hit) return;

      const localPt = targetMesh.worldToLocal(hit.point.clone());
      if (!targetMesh.geometry.boundingBox) targetMesh.geometry.computeBoundingBox();
      const bbox = targetMesh.geometry.boundingBox!;
      const spanX = bbox.max.x - bbox.min.x;
      const spanZ = bbox.max.z - bbox.min.z;
      const insetX = Math.min(spanX * 0.02, 0.01);
      const insetZ = Math.min(spanZ * 0.02, 0.01);
      const minX = bbox.min.x + insetX;
      const maxX = bbox.max.x - insetX;
      const minZ = bbox.min.z + insetZ;
      const maxZ = bbox.max.z - insetZ;

      // Transfer ledger → headstone when motif dragged past the back edge
      if (!transferringRef.current && localPt.z < minZ) {
        transferringRef.current = true;
        setMotifOffset(id, { ...(motifOffsets[id] ?? baseOffsetDefaults), target: 'headstone', xPos: 0, yPos: 0, coordinateSpace: 'offset' });
        return;
      }

      // Guard: stop position updates after a transfer is in flight
      if (transferringRef.current) return;

      localPt.x = Math.max(minX, Math.min(maxX, localPt.x));
      localPt.z = Math.max(minZ, Math.min(maxZ, localPt.z));

      const centerX = (bbox.min.x + bbox.max.x) / 2;
      const centerZ = (bbox.min.z + bbox.max.z) / 2;

      dragPositionRef.current = {
        xPos: localPt.x - centerX,
        yPos: localPt.z - centerZ,
      };

      if (animationFrameRef.current === null) {
        animationFrameRef.current = requestAnimationFrame(() => {
          if (dragPositionRef.current) {
            const currentOffset = motifOffsets[id] ?? baseOffsetDefaults;
            setMotifOffset(id, {
              ...currentOffset,
              ...dragPositionRef.current,
              target: 'ledger',
              coordinateSpace: 'offset',
              baseWidthMm: ledgerWidthMm,
              baseHeightMm: ledgerDepthMm,
            });
          }
          animationFrameRef.current = null;
        });
      }
    },
    [
      baseOffsetDefaults,
      camera,
      gl,
      headstone,
      id,
      isLedgerSurface,
      ledgerDepthMm,
      ledgerWidthMm,
      mouse,
      motifOffsets,
      raycaster,
      setMotifOffset,
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
    const targetElement = e.target as HTMLElement | null;
    if (targetElement && typeof targetElement.setPointerCapture === 'function' && e.pointerId !== undefined) {
      targetElement.setPointerCapture(e.pointerId);
      pointerCaptureTargetRef.current = targetElement;
    }
  }, []);

  const handlePointerOver = React.useCallback(() => {
    if (gl?.domElement) {
      gl.domElement.style.cursor = 'grab';
    }
  }, [gl]);

  const handlePointerOut = React.useCallback(() => {
    if (gl?.domElement && !dragging) {
      gl.domElement.style.cursor = 'auto';
    }
  }, [dragging, gl]);

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
      
      // Cancel any pending animation frame
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      // If a surface transfer was initiated, discard the stale drag position
      if (transferringRef.current) {
        transferringRef.current = false;
        dragPositionRef.current = null;
      }

      // Final update with drag position
      if (dragPositionRef.current) {
        const currentOffset = motifOffsets[id] ?? baseOffsetDefaults;
        if (isLedgerSurface) {
          setMotifOffset(id, {
            ...currentOffset,
            ...dragPositionRef.current,
            target: 'ledger',
            coordinateSpace: 'offset',
            baseWidthMm: ledgerWidthMm,
            baseHeightMm: ledgerDepthMm,
          });
        } else {
          const coordinateSpace =
            currentOffset.coordinateSpace ?? (currentOffset.target !== undefined ? 'absolute' : 'offset');
          const isCanonical = coordinateSpace === 'absolute' || coordinateSpace === 'mm-center';
          setMotifOffset(id, {
            ...currentOffset,
            ...dragPositionRef.current,
            coordinateSpace: isCanonical ? 'absolute' : 'offset',
            target: surface,
          });
        }
        dragPositionRef.current = null;
      }
      
      setDragging(false);
      if (controls) (controls as any).enabled = true;
      gl.domElement.style.cursor = 'auto';
      if (pointerCaptureTargetRef.current && e.pointerId !== undefined) {
        pointerCaptureTargetRef.current.releasePointerCapture?.(e.pointerId);
        pointerCaptureTargetRef.current = null;
      }
    };

    if (controls) (controls as any).enabled = false;
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });
    gl.domElement.style.cursor = 'grabbing';

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      // Cancel any pending animation frame on cleanup
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [
    baseOffsetDefaults,
    controls,
    dragging,
    gl,
    id,
    isLedgerSurface,
    ledgerDepthMm,
    ledgerWidthMm,
    motifOffsets,
    placeFromClientXY,
    setMotifOffset,
    surface,
  ]);

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
  // For ledger: the mesh is a unit cube (geometry ±0.5) with position+scale applied.
  // Use stone.position/scale to get the real monument-local bounds, not the geometry bbox.
  const ledgerCenterX = stone.position.x;
  const ledgerCenterZ = stone.position.z;
  const ledgerTopY = stone.position.y + stone.scale.y / 2;

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
  const scaledOffsetX = offset.xPos ?? 0;
  const scaledOffsetY = offset.yPos ?? 0;

  const unitsPerMeter = Math.abs(headstone.unitsPerMeter) > 1e-6 ? Math.abs(headstone.unitsPerMeter) : 1000;
  const mmToLocalUnits = unitsPerMeter / 1000;

  const targetHeightMm = offset.heightMm ?? 100;
  const planeHeightUnits = targetHeightMm * mmToLocalUnits;
  const aspectRatio = textureInfo.aspect || 1;
  const planeWidthUnits = planeHeightUnits * aspectRatio;

  const flipX = offset.flipX ?? false;
  const flipY = offset.flipY ?? false;
  
  const scaleX = planeWidthUnits * (flipX ? -1 : 1);
  // Canvas Y-down origin maps to GL V=0 (bottom of PlaneGeometry), rendering
  // the texture upside-down by default.  Negate scaleY so non-flipped motifs
  // appear right-side up; flipped motifs (flipY=true) keep the inversion.
  const scaleY = planeHeightUnits * (flipY ? 1 : -1);

  const isSelected = selectedMotifId === id;

  const scaledBounds = {
    width: Math.abs(planeWidthUnits),
    height: Math.abs(planeHeightUnits),
  };

  // Position the motif:
  // THREE FORMATS:
  // 1. Legacy: positions stored as offsets from centerY (Y-down format)
  //    - Uses: displayY = centerY - yPos
  // 2. Canonical: positions are absolute world coords (Y-up format) 
  //    - Uses: displayY = yPos
  // 3. mm-center: mm offsets from headstone center (Y-up, from canonical loader)
  //    - Uses: displayY = centerY + yPos * mmToLocalUnits
  //
  // Detection: explicit coordinateSpace flag (fallback to legacy heuristic)
  const coordinateSpace =
    offset.coordinateSpace ?? (offset.target !== undefined ? 'absolute' : 'offset');
  const isCanonical = coordinateSpace === 'absolute';
  const isMmCenter = coordinateSpace === 'mm-center';

  let groupPosition: [number, number, number];
  let groupRotation: [number, number, number];

  if (isLedgerSurface) {
    // xPos/yPos are in fractional mesh-local space (from worldToLocal on unit-cube mesh).
    // Multiply by stone.scale to convert to monument-local meters.
    const displayLedgerX = ledgerCenterX + scaledOffsetX * stone.scale.x;
    const displayLedgerZ = ledgerCenterZ + scaledOffsetY * stone.scale.z;
    const ledgerLift = 0.001;
    groupPosition = [displayLedgerX, ledgerTopY + ledgerLift, displayLedgerZ];
    groupRotation = [-Math.PI / 2, offset.rotationZ || 0, 0];
  } else if (isBaseSurface && isMmCenter) {
    // Base mesh is a unit cube at stone.position, scaled in meters (assembly space).
    // Anchor mm offsets to the base mesh's world position.
    const absX = stone.position.x + scaledOffsetX * mmToLocalUnits;
    const absY = stone.position.y + scaledOffsetY * mmToLocalUnits;
    const baseFrontZ = stone.position.z + stone.scale.z / 2 + 0.001;
    groupPosition = [absX, absY, baseFrontZ];
    groupRotation = [0, 0, offset.rotationZ || 0];
  } else if (isMmCenter) {
    // Loaded design: mm offsets from center, positive Y = above center
    const displayX = centerX + scaledOffsetX * mmToLocalUnits;
    const displayY = centerY + scaledOffsetY * mmToLocalUnits;
    groupPosition = [displayX, displayY, centerZ];
    groupRotation = [0, 0, offset.rotationZ || 0];
  } else {
    const displayX = isCanonical ? scaledOffsetX : centerX + scaledOffsetX;
    const displayY = isCanonical ? scaledOffsetY : centerY - scaledOffsetY;
    groupPosition = [displayX, displayY, centerZ];
    groupRotation = [0, 0, offset.rotationZ || 0];
  }

  return (
    <>
      {/* Parent group for positioning - same coordinate system as inscriptions */}
      <group position={groupPosition} rotation={groupRotation}>
        {isStainlessSteelMotif && (
          <mesh
            geometry={planeGeometry}
            scale={[scaleX * 1.035, scaleY * 1.035, 1]}
            position={[0.004, -0.004, -0.001]}
            name={`motif-${id}-contact-shadow`}
          >
            <meshBasicMaterial
              color="#050505"
              toneMapped={false}
              transparent
              opacity={0.28}
              depthWrite={false}
              depthTest={true}
              side={THREE.DoubleSide}
              map={textureInfo.texture}
              alphaTest={0.01}
            />
          </mesh>
        )}

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
          {isStainlessSteelMotif ? (
            <meshPhysicalMaterial
              color={STAINLESS_MOTIF_COLOR}
              map={textureInfo.texture}
              metalness={0.86}
              roughness={0.2}
              clearcoat={1}
              clearcoatRoughness={0.08}
              envMapIntensity={2.6}
              transparent
              depthWrite={false}
              depthTest={true}
              side={THREE.DoubleSide}
              alphaTest={0.01}
              polygonOffset
              polygonOffsetFactor={-1}
              polygonOffsetUnits={-1}
            />
          ) : (
            <meshBasicMaterial
              color={color}
              toneMapped={false}
              transparent
              depthWrite={false}
              depthTest={true}
              side={THREE.DoubleSide}
              map={textureInfo.texture}
              alphaTest={0.01}
            />
          )}
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
            animateOnShow
            animationDuration={520}
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
                  target: surface,
                });
              }
              if (data.rotationDeg !== undefined) {
                // Add rotation delta to current rotation
                const newRotation = (offset.rotationZ || 0) + (data.rotationDeg * Math.PI) / 180;
                setMotifOffset(id, {
                  ...offset,
                  rotationZ: newRotation,
                  target: surface,
                });
              }
            }}
          />
        )}
      </group>
    </>
  );
}
