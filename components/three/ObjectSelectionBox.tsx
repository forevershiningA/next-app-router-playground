'use client';

import * as React from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';

const DEFAULT_ANIMATION_DURATION_MS = 520;

type Props = {
  /** Unique ID for the selected object */
  objectId: string;
  /** Position offset from parent group */
  position: THREE.Vector3;
  initialPosition?: { x: number; y: number };
  /** Bounding box dimensions */
  bounds: { width: number; height: number };
  /** Rotation in radians (applied to parent group, not this component) */
  rotation: number;
  /** Scale factor from headstone units to meters */
  unitsPerMeter: number;
  /** Current size in mm (for inscriptions) or scale (for motifs/additions) */
  currentSizeMm: number;
  /** Optional absolute resize limits for flat objects. */
  minSizeMm?: number;
  maxSizeMm?: number;
  /** Show interactive resize handles for otherwise outline-only selections. */
  enableResizeHandles?: boolean;
  /** Update callback */
  onUpdate?: (data: {
    xPos?: number;
    yPos?: number;
    sizeMm?: number;
    rotationDeg?: number;
    scaleFactor?: number;
  }) => void;
  /** Type of object being selected (for specific behaviors) */
  objectType?: 'inscription' | 'motif' | 'addition';
  /** Addition type (for additions only) - used to determine if it's 2D or 3D */
  additionType?: 'application' | 'statue' | 'vase';
  /** Enable the cinematic intro animation */
  animateOnShow?: boolean;
  /** Duration of the intro animation (ms) */
  animationDuration?: number;
};

type HandleType =
  | 'topLeft'
  | 'topRight'
  | 'bottomLeft'
  | 'bottomRight'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'rotate';

export default function SelectionBox({
  objectId,
  position,
  initialPosition = { x: 0, y: 0 },
  bounds,
  rotation,
  unitsPerMeter,
  currentSizeMm,
  minSizeMm,
  maxSizeMm,
  enableResizeHandles = false,
  onUpdate,
  objectType = 'inscription',
  additionType,
  animateOnShow = false,
  animationDuration = DEFAULT_ANIMATION_DURATION_MS,
}: Props) {
  const threeContext = useThree();
  const { camera, gl, controls, invalidate } = threeContext;

  // Determine if this is a 2D object (flat on headstone surface)
  const is2DObject =
    objectType === 'inscription' ||
    objectType === 'motif' ||
    (objectType === 'addition' && additionType === 'application');

  // Visual constants (scale handle size to local units so ledger surfaces stay reasonable)
  const safeUnitsPerMeter = Math.max(1e-6, Math.abs(unitsPerMeter) || 1);
  const mmToUnits = safeUnitsPerMeter / 1000;
  // Inscriptions need precise, unobtrusive controls; larger objects retain 5cm handles.
  const baseHandleSizeMm =
    objectType === 'inscription' || enableResizeHandles ? 11.9 : 50;
  const fixedHandleSize = Math.max(baseHandleSizeMm * mmToUnits, 0.002);

  // Thickness - proportional to handle size
  const handleThickness = fixedHandleSize * 0.15; // 15% of handle size for depth
  const handleZOffset = 0.02; // Move handles further forward in Z

  const usesSubtleOutline =
    objectType === 'inscription' ||
    objectType === 'motif' ||
    (objectType === 'addition' && additionType === 'application');
  const usesInscriptionSelectionStyle =
    objectType === 'inscription' || enableResizeHandles;
  const usesSubtleOutlineRef = React.useRef(usesSubtleOutline);
  React.useEffect(() => {
    usesSubtleOutlineRef.current = usesSubtleOutline;
  }, [usesSubtleOutline]);
  // A resizable motif uses the same continuous rectangular outline as an
  // inscription. Keep the older viewfinder outline for passive selections.
  const usesTransformOutline = !usesInscriptionSelectionStyle && usesSubtleOutline;
  const shouldShowHandles =
    objectType === 'inscription' || enableResizeHandles || !usesSubtleOutline;
  const shouldShowOutline = true;
  // Motif selection sits almost coplanar with the memorial surface. Rendering
  // its outline above the surface prevents the depth buffer from hiding it
  // immediately after a new motif is added.
  const renderMotifOutlineAboveSurface = objectType === 'motif';
  // A gold outline remains legible on both the light canvas and dark granite.
  const outlineColor = usesInscriptionSelectionStyle
    ? 0x5c9dff
    : objectType === 'motif'
      ? 0xd7b356
      : usesTransformOutline
        ? 0xf8f5ee
        : 0x5c9dff;
  const outlineLineWidth =
    !usesInscriptionSelectionStyle && objectType === 'motif'
      ? 2.5
      : 1.5;
  const baseOutlineOpacity =
    !usesInscriptionSelectionStyle && objectType === 'motif'
      ? 1
      : usesTransformOutline
        ? 0.9
        : 1;
  const handleColor = usesInscriptionSelectionStyle
    ? 0xffffff
    : shouldShowHandles
      ? 0x2196f3
      : outlineColor;

  // Calculate handle positions - ensure minimum spacing (MUST be before useEffect)
  const minHalfWidth = Math.max(bounds.width / 2, fixedHandleSize * 1.5);
  const minHalfHeight = Math.max(bounds.height / 2, fixedHandleSize * 1.5);

  const [hoveredHandle, setHoveredHandle] = React.useState<HandleType | null>(
    null,
  );
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragHandle, setDragHandle] = React.useState<HandleType | null>(null);
  const onUpdateRef = React.useRef(onUpdate);
  const wasDraggingRef = React.useRef(false);
  const preventClickTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const dragStartRef = React.useRef({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    centerX: 0,
    centerY: 0,
    rotation: 0,
    initialSizeMm: 0,
    initialX: 0,
    initialY: 0,
    selectionGroup: null as THREE.Group | null,
    dragPlane: null as THREE.Plane | null,
    pointerStartLocal: null as THREE.Vector3 | null,
    target: null as any,
    pointerId: 0,
  });

  const [isVisible, setIsVisible] = React.useState(true);
  const visibilityRef = React.useRef(isVisible);
  const [animationProgress, setAnimationProgress] = React.useState(
    animateOnShow ? 0 : 1,
  );

  React.useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);
  const animationProgressRef = React.useRef(animationProgress);
  const animationDurationSec = React.useMemo(
    () =>
      Math.max(
        (animationDuration ?? DEFAULT_ANIMATION_DURATION_MS) / 1000,
        0.001,
      ),
    [animationDuration],
  );

  React.useEffect(() => {
    if (animateOnShow) {
      animationProgressRef.current = 0;
      setAnimationProgress(0);
    } else {
      animationProgressRef.current = 1;
      setAnimationProgress(1);
    }
  }, [objectId, animateOnShow]);

  // The designer canvas renders on demand. Selecting a motif changes Zustand
  // state but does not necessarily cause a WebGL frame, so explicitly paint
  // the newly mounted outline immediately.
  React.useEffect(() => {
    invalidate();
  }, [invalidate, objectId]);

  const worldPos = React.useMemo(() => new THREE.Vector3(), []);
  const worldNormal = React.useMemo(() => new THREE.Vector3(), []);
  const cameraDir = React.useMemo(() => new THREE.Vector3(), []);

  // Create outline segments (viewfinder-style for flat selections)
  const outlineSegments = React.useMemo(() => {
    // For subtle outlines (images/motifs on ledger), use exact bounds — not the padded minHalf values
    // which are inflated to ensure handle spacing and would make the outline 2–3× too large.
    const w = usesTransformOutline ? bounds.width / 2 : minHalfWidth;
    const h = usesTransformOutline ? bounds.height / 2 : minHalfHeight;

    if (w === 0 || h === 0) return [];

    if (usesTransformOutline) {
      const arm = Math.min(Math.min(w, h) * 0.4, Math.min(w, h));
      return [
        [new THREE.Vector3(-w, -h, 0), new THREE.Vector3(-w + arm, -h, 0)],
        [new THREE.Vector3(-w, -h, 0), new THREE.Vector3(-w, -h + arm, 0)],
        [new THREE.Vector3(w, -h, 0), new THREE.Vector3(w - arm, -h, 0)],
        [new THREE.Vector3(w, -h, 0), new THREE.Vector3(w, -h + arm, 0)],
        [new THREE.Vector3(w, h, 0), new THREE.Vector3(w - arm, h, 0)],
        [new THREE.Vector3(w, h, 0), new THREE.Vector3(w, h - arm, 0)],
        [new THREE.Vector3(-w, h, 0), new THREE.Vector3(-w + arm, h, 0)],
        [new THREE.Vector3(-w, h, 0), new THREE.Vector3(-w, h - arm, 0)],
      ];
    }

    return [
      [new THREE.Vector3(-w, -h, 0), new THREE.Vector3(w, -h, 0)],
      [new THREE.Vector3(w, -h, 0), new THREE.Vector3(w, h, 0)],
      [new THREE.Vector3(w, h, 0), new THREE.Vector3(-w, h, 0)],
      [new THREE.Vector3(-w, h, 0), new THREE.Vector3(-w, -h, 0)],
    ];
  }, [
    minHalfWidth,
    minHalfHeight,
    usesTransformOutline,
    bounds.width,
    bounds.height,
  ]);

  const easedProgress = animateOnShow
    ? animationProgress >= 1
      ? 1
      : 1 - Math.pow(1 - animationProgress, 3)
    : 1;
  const horizontalScale = animateOnShow ? Math.min(1, easedProgress * 1.35) : 1;
  const verticalScale = animateOnShow
    ? THREE.MathUtils.clamp((easedProgress - 0.25) / 0.75, 0, 1)
    : 1;
  const outlineOpacity = animateOnShow
    ? THREE.MathUtils.lerp(0.15, baseOutlineOpacity, easedProgress)
    : baseOutlineOpacity;
  const handleScale = shouldShowHandles
    ? animateOnShow
      ? THREE.MathUtils.clamp((easedProgress - 0.45) / 0.55, 0, 1)
      : 1
    : 1;
  const handleOpacity = shouldShowHandles ? handleScale : 1;
  const handlesVisible = shouldShowHandles && handleScale > 0.001;

  const animatedSegments = React.useMemo(
    () =>
      outlineSegments.map(([start, end]) => {
        const startPoint = start.clone();
        const delta = end.clone().sub(start);
        const isHorizontal = Math.abs(delta.x) >= Math.abs(delta.y);
        const scale = isHorizontal ? horizontalScale : verticalScale;
        const endPoint = startPoint.clone().add(delta.multiplyScalar(scale));
        return [startPoint, endPoint] as [THREE.Vector3, THREE.Vector3];
      }),
    [outlineSegments, horizontalScale, verticalScale],
  );

  // Handle pointer down on handles
  const handlePointerDown = React.useCallback(
    (e: any, handleType: HandleType) => {
      e.stopPropagation();

      if (animateOnShow && animationProgressRef.current < 0.35) {
        return;
      }

      // Capture pointer to prevent events going to headstone
      if (e.target && e.target.setPointerCapture) {
        e.target.setPointerCapture(e.pointerId);
      }

      setIsDragging(true);
      setDragHandle(handleType);
      wasDraggingRef.current = true;

      const rect = gl.domElement.getBoundingClientRect();

      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        width: bounds.width,
        height: bounds.height,
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2,
        rotation: 0,
        initialSizeMm: currentSizeMm,
        initialX: initialPosition.x,
        initialY: initialPosition.y,
        selectionGroup: e.object?.parent instanceof THREE.Group ? e.object.parent : null,
        dragPlane: (() => {
          const selectionGroup = e.object?.parent;
          if (!(selectionGroup instanceof THREE.Group)) return null;
          const worldPosition = selectionGroup.getWorldPosition(new THREE.Vector3());
          const worldNormal = new THREE.Vector3(0, 0, 1)
            .applyQuaternion(selectionGroup.getWorldQuaternion(new THREE.Quaternion()))
            .normalize();
          return new THREE.Plane().setFromNormalAndCoplanarPoint(worldNormal, worldPosition);
        })(),
        pointerStartLocal: (() => {
          const selectionGroup = e.object?.parent;
          if (!(selectionGroup instanceof THREE.Group)) return null;
          return selectionGroup.worldToLocal(e.point.clone());
        })(),
        target: e.target,
        pointerId: e.pointerId,
      };

      // Block orbit controls
      if (controls) {
        (controls as any).enabled = false;
      }
      if ((gl.domElement as any).orbitControls) {
        (gl.domElement as any).orbitControls.enabled = false;
      }

      // Legacy motif controls use a flipped Y-axis. Resizable motifs share the
      // inscription interaction model, including cursor orientation.
      const cursorMap: Record<HandleType, string> =
        objectType === 'motif' && !usesInscriptionSelectionStyle
          ? {
              topLeft: 'nesw-resize', // Flipped for motifs
              topRight: 'nwse-resize', // Flipped for motifs
              bottomLeft: 'nwse-resize', // Flipped for motifs
              bottomRight: 'nesw-resize', // Flipped for motifs
              top: 'ns-resize',
              bottom: 'ns-resize',
              left: 'ew-resize',
              right: 'ew-resize',
              rotate: 'grabbing',
            }
          : {
              topLeft: 'nwse-resize',
              topRight: 'nesw-resize',
              bottomLeft: 'nesw-resize',
              bottomRight: 'nwse-resize',
              top: 'ns-resize',
              bottom: 'ns-resize',
              left: 'ew-resize',
              right: 'ew-resize',
              rotate: 'grabbing',
            };

      gl.domElement.style.cursor = cursorMap[handleType] || 'grab';
    },
    [
      bounds,
      gl,
      currentSizeMm,
      controls,
      objectType,
      initialPosition,
      usesInscriptionSelectionStyle,
    ],
  );

  const handlePointerEnter = React.useCallback(
    (handle: HandleType) => {
      setHoveredHandle(handle);
      // Same cursor mapping for hover
      const cursorMap: Record<HandleType, string> =
        objectType === 'motif' && !usesInscriptionSelectionStyle
          ? {
              topLeft: 'nesw-resize',
              topRight: 'nwse-resize',
              bottomLeft: 'nwse-resize',
              bottomRight: 'nesw-resize',
              top: 'ns-resize',
              bottom: 'ns-resize',
              left: 'ew-resize',
              right: 'ew-resize',
              rotate: 'grab',
            }
          : {
              topLeft: 'nwse-resize',
              topRight: 'nesw-resize',
              bottomLeft: 'nesw-resize',
              bottomRight: 'nwse-resize',
              top: 'ns-resize',
              bottom: 'ns-resize',
              left: 'ew-resize',
              right: 'ew-resize',
              rotate: 'grab',
            };
      gl.domElement.style.cursor = cursorMap[handle] || 'auto';
    },
    [objectType, gl, usesInscriptionSelectionStyle],
  );

  const handlePointerLeave = React.useCallback(() => {
    if (!isDragging) {
      setHoveredHandle(null);
      gl.domElement.style.cursor = 'auto';
    }
  }, [isDragging, gl]);

  // Handle pointer move
  React.useEffect(() => {
    if (!isDragging || !dragHandle) return;

    let animationFrameId: number | null = null;
    let lastUpdateTime = 0;
    const updateInterval = 16; // ~60fps
    const resizeRaycaster = new THREE.Raycaster();
    const pointerNdc = new THREE.Vector2();
    const intersection = new THREE.Vector3();

    const getCornerScaleAtPointer = (event: PointerEvent) => {
      if (
        !usesInscriptionSelectionStyle ||
        !['topLeft', 'topRight', 'bottomLeft', 'bottomRight'].includes(dragHandle) ||
        !dragStartRef.current.selectionGroup ||
        !dragStartRef.current.dragPlane ||
        !dragStartRef.current.pointerStartLocal
      ) {
        return null;
      }

      const rect = gl.domElement.getBoundingClientRect();
      pointerNdc.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      resizeRaycaster.setFromCamera(pointerNdc, camera);
      if (!resizeRaycaster.ray.intersectPlane(dragStartRef.current.dragPlane, intersection)) {
        return null;
      }

      const localPoint = dragStartRef.current.selectionGroup.worldToLocal(intersection);
      // Same center-based projection used by the legacy 2D DYO editor.
      // It remains continuous at min/max sizes because the calculation is
      // relative to the exact point where this handle was grabbed.
      const startPoint = dragStartRef.current.pointerStartLocal;
      const startMagnitude = startPoint.x ** 2 + startPoint.y ** 2;
      if (startMagnitude <= Number.EPSILON) return null;
      return (
        (localPoint.x * startPoint.x + localPoint.y * startPoint.y) /
        startMagnitude
      );
    };

    const handleMove = (e: PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }

      animationFrameId = requestAnimationFrame((timestamp) => {
        if (timestamp - lastUpdateTime < updateInterval) {
          return;
        }
        lastUpdateTime = timestamp;

        const deltaX = e.clientX - dragStartRef.current.x;
        const deltaY = e.clientY - dragStartRef.current.y;

        // Lower sensitivity value = faster/more sensitive resizing
        const sensitivity =
          objectType === 'motif' && !usesInscriptionSelectionStyle ? 200 : 150;

        switch (dragHandle) {
          case 'topLeft':
          case 'topRight':
          case 'bottomLeft':
          case 'bottomRight':
          case 'top':
          case 'bottom':
          case 'left':
          case 'right': {
            // Corner resize - proportional scaling
            // For motifs, Y-axis is inverted, so we need to flip the Y direction
            const factorX =
              dragHandle === 'topLeft' ||
              dragHandle === 'bottomLeft' ||
              dragHandle === 'left'
                ? -1
                : 1;
            let factorY =
              dragHandle === 'topLeft' ||
              dragHandle === 'topRight' ||
              dragHandle === 'top'
                ? -1
                : 1;

            // Only the legacy motif controls retain their inverted Y-axis.
            if (objectType === 'motif' && !usesInscriptionSelectionStyle) {
              factorY = -factorY;
            }

            const horizontal = !['top', 'bottom'].includes(dragHandle);
            const vertical = !['left', 'right'].includes(dragHandle);
            const scaleX = horizontal ? 1 + (deltaX * factorX) / sensitivity : 1;
            const scaleY = vertical ? 1 + (deltaY * factorY) / sensitivity : 1;
            const pointerScale = getCornerScaleAtPointer(e);
            const scale = pointerScale ?? (horizontal && vertical ? (scaleX + scaleY) / 2 : horizontal ? scaleX : scaleY);
            const newSizeMm = dragStartRef.current.initialSizeMm * scale;
            const clampedSize = Math.max(
              minSizeMm ?? 10,
              Math.min(
                newSizeMm,
                maxSizeMm ?? dragStartRef.current.initialSizeMm * 5,
              ),
            );

            if (objectType === 'inscription' || enableResizeHandles) {
              // Resizable flat objects use an absolute size captured from the
              // drag start. This avoids compounding a relative scale each frame.
              onUpdateRef.current?.({ sizeMm: clampedSize });
            } else {
              // For motifs and additions, use scale factor
              onUpdateRef.current?.({ scaleFactor: scale });
            }
            break;
          }

          case 'rotate': {
            // Calculate rotation angle relative to center
            const startAngle = Math.atan2(
              dragStartRef.current.y - dragStartRef.current.centerY,
              dragStartRef.current.x - dragStartRef.current.centerX,
            );
            const currentAngle = Math.atan2(
              e.clientY - dragStartRef.current.centerY,
              e.clientX - dragStartRef.current.centerX,
            );

            const deltaAngle = currentAngle - startAngle;
            const rotationDeg = (deltaAngle * 180) / Math.PI;

            onUpdateRef.current?.({ rotationDeg });
            break;
          }
        }
      });
    };

    const handleUp = (e: PointerEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }

      // Release pointer capture
      if (
        dragStartRef.current.target &&
        dragStartRef.current.target.releasePointerCapture
      ) {
        try {
          dragStartRef.current.target.releasePointerCapture(
            dragStartRef.current.pointerId,
          );
        } catch (err) {}
      }

      setIsDragging(false);
      setDragHandle(null);
      gl.domElement.style.cursor = 'auto';

      // Re-enable orbit controls
      if (controls) {
        (controls as any).enabled = true;
      }
      if ((gl.domElement as any).orbitControls) {
        (gl.domElement as any).orbitControls.enabled = true;
      }

      // Prevent clicks on the scene
      wasDraggingRef.current = true;
      if (preventClickTimeoutRef.current) {
        clearTimeout(preventClickTimeoutRef.current);
      }
      preventClickTimeoutRef.current = setTimeout(() => {
        wasDraggingRef.current = false;
        preventClickTimeoutRef.current = null;
      }, 200);

      // Add click blocker to canvas
      const canvas = gl.domElement;
      const blockClick = (clickEvent: Event) => {
        clickEvent.stopPropagation();
        clickEvent.preventDefault();
        canvas.removeEventListener('click', blockClick, true);
      };
      canvas.addEventListener('click', blockClick, true);

      setTimeout(() => {
        canvas.removeEventListener('click', blockClick, true);
      }, 250);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleUp);

    return () => {
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleUp);
    };
  }, [
    isDragging,
    dragHandle,
    gl,
    controls,
    objectType,
    enableResizeHandles,
    minSizeMm,
    maxSizeMm,
    usesInscriptionSelectionStyle,
  ]);

  // Refs for non-interactive elements
  const groupRef = React.useRef<THREE.Group>(null);
  const disableRaycast = React.useCallback((..._args: any[]) => {}, []);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (preventClickTimeoutRef.current) {
        clearTimeout(preventClickTimeoutRef.current);
      }
    };
  }, []);

  useFrame((state, delta) => {
    if (groupRef.current) {
      if (usesSubtleOutlineRef.current) {
        if (!visibilityRef.current) {
          visibilityRef.current = true;
          setIsVisible(true);
        }
      } else {
        groupRef.current.getWorldPosition(worldPos);
        groupRef.current.getWorldDirection(worldNormal);
        cameraDir.subVectors(camera.position, worldPos).normalize();
        const dotProduct = cameraDir.dot(worldNormal);
        const nextVisible = dotProduct >= 0;
        if (nextVisible !== visibilityRef.current) {
          visibilityRef.current = nextVisible;
          setIsVisible(nextVisible);
        }
      }
    }

    if (animateOnShow && animationProgressRef.current < 1) {
      const increment = delta / animationDurationSec;
      if (increment > 0) {
        const next = Math.min(1, animationProgressRef.current + increment);
        if (Math.abs(next - animationProgressRef.current) > 1e-3) {
          animationProgressRef.current = next;
          setAnimationProgress(next);
          // Keep a demand-rendered canvas alive until the reveal finishes.
          state.invalidate();
        }
      }
    }
  });

  if (!isVisible) {
    return null;
  }

  return (
    <group ref={groupRef} position={position} rotation={[0, 0, rotation]}>
      {/* Box outline */}
      {shouldShowOutline &&
        animatedSegments.map((segment, index) => (
          <Line
            key={`outline-segment-${index}`}
            points={segment}
            color={outlineColor}
            lineWidth={outlineLineWidth}
            renderOrder={1001}
            depthWrite={false}
            depthTest={!renderMotifOutlineAboveSurface}
            transparent
            opacity={outlineOpacity}
            raycast={disableRaycast}
          />
        ))}

      {shouldShowHandles && (
        <>
          {/* Corner Handles - Top-Left */}
          <mesh
            position={[-minHalfWidth, minHalfHeight, handleZOffset]}
            renderOrder={1002}
            visible={handlesVisible}
            scale={[handleScale, handleScale, handleScale]}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => handlePointerDown(e, 'topLeft')}
            onPointerEnter={() => handlePointerEnter('topLeft')}
            onPointerLeave={handlePointerLeave}
          >
            {objectType === 'inscription' || enableResizeHandles ? (
              <planeGeometry args={[fixedHandleSize, fixedHandleSize]} />
            ) : (
              <boxGeometry
                args={[fixedHandleSize, fixedHandleSize, handleThickness]}
              />
            )}
            <meshBasicMaterial
              color={handleColor}
              transparent
              opacity={handleOpacity}
              depthWrite={false}
              depthTest={true}
            />
          </mesh>

          {/* Top-Right */}
          <mesh
            position={[minHalfWidth, minHalfHeight, handleZOffset]}
            renderOrder={1002}
            visible={handlesVisible}
            scale={[handleScale, handleScale, handleScale]}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => handlePointerDown(e, 'topRight')}
            onPointerEnter={() => handlePointerEnter('topRight')}
            onPointerLeave={handlePointerLeave}
          >
            {objectType === 'inscription' || enableResizeHandles ? (
              <planeGeometry args={[fixedHandleSize, fixedHandleSize]} />
            ) : (
              <boxGeometry
                args={[fixedHandleSize, fixedHandleSize, handleThickness]}
              />
            )}
            <meshBasicMaterial
              color={handleColor}
              transparent
              opacity={handleOpacity}
              depthWrite={false}
              depthTest={true}
            />
          </mesh>

          {/* Bottom-Left */}
          <mesh
            position={[-minHalfWidth, -minHalfHeight, handleZOffset]}
            renderOrder={1002}
            visible={handlesVisible}
            scale={[handleScale, handleScale, handleScale]}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => handlePointerDown(e, 'bottomLeft')}
            onPointerEnter={() => handlePointerEnter('bottomLeft')}
            onPointerLeave={handlePointerLeave}
          >
            {objectType === 'inscription' || enableResizeHandles ? (
              <planeGeometry args={[fixedHandleSize, fixedHandleSize]} />
            ) : (
              <boxGeometry
                args={[fixedHandleSize, fixedHandleSize, handleThickness]}
              />
            )}
            <meshBasicMaterial
              color={handleColor}
              transparent
              opacity={handleOpacity}
              depthWrite={false}
              depthTest={true}
            />
          </mesh>

          {/* Bottom-Right */}
          <mesh
            position={[minHalfWidth, -minHalfHeight, handleZOffset]}
            renderOrder={1002}
            visible={handlesVisible}
            scale={[handleScale, handleScale, handleScale]}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => handlePointerDown(e, 'bottomRight')}
            onPointerEnter={() => handlePointerEnter('bottomRight')}
            onPointerLeave={handlePointerLeave}
          >
            {objectType === 'inscription' || enableResizeHandles ? (
              <planeGeometry args={[fixedHandleSize, fixedHandleSize]} />
            ) : (
              <boxGeometry
                args={[fixedHandleSize, fixedHandleSize, handleThickness]}
              />
            )}
            <meshBasicMaterial
              color={handleColor}
              transparent
              opacity={handleOpacity}
              depthWrite={false}
              depthTest={true}
            />
          </mesh>

          {!usesSubtleOutline && <>
          {/* Edge Handles - Top Center */}
          <mesh
            position={[0, minHalfHeight, handleZOffset]}
            renderOrder={1002}
            visible={handlesVisible}
            scale={[handleScale, handleScale, handleScale]}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => handlePointerDown(e, 'top')}
            onPointerEnter={() => handlePointerEnter('top')}
            onPointerLeave={handlePointerLeave}
          >
            <boxGeometry
              args={[fixedHandleSize, fixedHandleSize, handleThickness]}
            />
            <meshBasicMaterial
              color={handleColor}
              transparent
              opacity={handleOpacity}
              depthWrite={false}
              depthTest={true}
            />
          </mesh>

          {/* Edge Handles - Bottom Center */}
          <mesh
            position={[0, -minHalfHeight, handleZOffset]}
            renderOrder={1002}
            visible={handlesVisible}
            scale={[handleScale, handleScale, handleScale]}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => handlePointerDown(e, 'bottom')}
            onPointerEnter={() => handlePointerEnter('bottom')}
            onPointerLeave={handlePointerLeave}
          >
            <boxGeometry
              args={[fixedHandleSize, fixedHandleSize, handleThickness]}
            />
            <meshBasicMaterial
              color={handleColor}
              transparent
              opacity={handleOpacity}
              depthWrite={false}
              depthTest={true}
            />
          </mesh>

          {/* Edge Handles - Left Center */}
          <mesh
            position={[-minHalfWidth, 0, handleZOffset]}
            renderOrder={1002}
            visible={handlesVisible}
            scale={[handleScale, handleScale, handleScale]}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => handlePointerDown(e, 'left')}
            onPointerEnter={() => handlePointerEnter('left')}
            onPointerLeave={handlePointerLeave}
          >
            <boxGeometry
              args={[fixedHandleSize, fixedHandleSize, handleThickness]}
            />
            <meshBasicMaterial
              color={handleColor}
              transparent
              opacity={handleOpacity}
              depthWrite={false}
              depthTest={true}
            />
          </mesh>

          {/* Edge Handles - Right Center */}
          <mesh
            position={[minHalfWidth, 0, handleZOffset]}
            renderOrder={1002}
            visible={handlesVisible}
            scale={[handleScale, handleScale, handleScale]}
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => handlePointerDown(e, 'right')}
            onPointerEnter={() => handlePointerEnter('right')}
            onPointerLeave={handlePointerLeave}
          >
            <boxGeometry
              args={[fixedHandleSize, fixedHandleSize, handleThickness]}
            />
            <meshBasicMaterial
              color={handleColor}
              transparent
              opacity={handleOpacity}
              depthWrite={false}
              depthTest={true}
            />
          </mesh>
          </>}
        </>
      )}
    </group>
  );
}
