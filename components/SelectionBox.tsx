'use client';

import * as React from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';

type Props = {
  /** Unique ID for the selected object */
  objectId: string;
  /** Position offset from parent group */
  position: THREE.Vector3;
  /** Bounding box dimensions */
  bounds: { width: number; height: number };
  /** Rotation in radians (applied to parent group, not this component) */
  rotation: number;
  /** Scale factor from headstone units to meters */
  unitsPerMeter: number;
  /** Current size in mm (for inscriptions) or scale (for motifs/additions) */
  currentSizeMm: number;
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
};

type HandleType = 
  | 'topLeft' 
  | 'topRight' 
  | 'bottomLeft' 
  | 'bottomRight' 
  | 'rotate';

export default function SelectionBox({
  objectId,
  position,
  bounds,
  rotation,
  unitsPerMeter,
  currentSizeMm,
  onUpdate,
  objectType = 'inscription',
  additionType,
}: Props) {
  const threeContext = useThree();
  const { camera, gl, controls } = threeContext;
  
  // Determine if this is a 2D object (flat on headstone surface)
  const is2DObject = objectType === 'inscription' || 
                     objectType === 'motif' || 
                     (objectType === 'addition' && additionType === 'application');

  // Visual constants
  // Fixed handle sizes - don't scale with object, act as separate overlay layer
  const fixedHandleSize = 5.0;  // Fixed 5.0 units for ALL types - constant size like overlay
    
  // Thickness - proportional to handle size
  const handleThickness = fixedHandleSize * 0.15;  // 15% of handle size for depth
  const handleZOffset = 0.02; // Move handles further forward in Z
  
  const outlineColor = 0x2196F3; // Blue (Material Design Blue 500)
  const handleColor = 0x2196F3; // Blue - same as outline

  // Calculate handle positions - ensure minimum spacing (MUST be before useEffect)
  const minHalfWidth = Math.max(bounds.width / 2, fixedHandleSize * 1.5);
  const minHalfHeight = Math.max(bounds.height / 2, fixedHandleSize * 1.5);

  const [hoveredHandle, setHoveredHandle] = React.useState<HandleType | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragHandle, setDragHandle] = React.useState<HandleType | null>(null);
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
    target: null as any,
    pointerId: 0,
  });

  // Create box outline points
  const outlinePoints = React.useMemo(() => {
    const w = minHalfWidth;
    const h = minHalfHeight;
    const points = [
      new THREE.Vector3(-w, -h, 0),
      new THREE.Vector3(w, -h, 0),
      new THREE.Vector3(w, h, 0),
      new THREE.Vector3(-w, h, 0),
      new THREE.Vector3(-w, -h, 0),
    ];
    return points;
  }, [minHalfWidth, minHalfHeight]);

  // Handle pointer down on handles
  const handlePointerDown = React.useCallback(
    (e: any, handleType: HandleType) => {
      e.stopPropagation();
      
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
      
      // For motifs, Y-axis appears to be inverted, so cursors need to be flipped
      const cursorMap: Record<HandleType, string> = objectType === 'motif' 
        ? {
            topLeft: 'nesw-resize',      // Flipped for motifs
            topRight: 'nwse-resize',     // Flipped for motifs
            bottomLeft: 'nwse-resize',   // Flipped for motifs
            bottomRight: 'nesw-resize',  // Flipped for motifs
            rotate: 'grabbing',
          }
        : {
            topLeft: 'nwse-resize',
            topRight: 'nesw-resize',
            bottomLeft: 'nesw-resize',
            bottomRight: 'nwse-resize',
            rotate: 'grabbing',
          };
      
      document.body.style.cursor = cursorMap[handleType] || 'grab';
    },
    [bounds, gl, currentSizeMm, controls, objectType]
  );

  const handlePointerEnter = React.useCallback((handle: HandleType) => {
    setHoveredHandle(handle);
    // Same cursor mapping for hover
    const cursorMap: Record<HandleType, string> = objectType === 'motif'
      ? {
          topLeft: 'nesw-resize',
          topRight: 'nwse-resize',
          bottomLeft: 'nwse-resize',
          bottomRight: 'nesw-resize',
          rotate: 'grab',
        }
      : {
          topLeft: 'nwse-resize',
          topRight: 'nesw-resize',
          bottomLeft: 'nesw-resize',
          bottomRight: 'nwse-resize',
          rotate: 'grab',
        };
    document.body.style.cursor = cursorMap[handle] || 'auto';
  }, [objectType]);

  const handlePointerLeave = React.useCallback(() => {
    if (!isDragging) {
      setHoveredHandle(null);
      document.body.style.cursor = 'auto';
    }
  }, [isDragging]);

  // Handle pointer move
  React.useEffect(() => {
    if (!isDragging || !dragHandle) return;

    let animationFrameId: number | null = null;
    let lastUpdateTime = 0;
    const updateInterval = 16; // ~60fps

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
        const sensitivity = objectType === 'motif' ? 200 : 150;

        switch (dragHandle) {
          case 'topLeft':
          case 'topRight':
          case 'bottomLeft':
          case 'bottomRight': {
            // Corner resize - proportional scaling
            // For motifs, Y-axis is inverted, so we need to flip the Y direction
            const factorX = (dragHandle === 'topLeft' || dragHandle === 'bottomLeft') ? -1 : 1;
            let factorY = (dragHandle === 'topLeft' || dragHandle === 'topRight') ? -1 : 1;
            
            // Flip Y direction for motifs due to inverted coordinate system
            if (objectType === 'motif') {
              factorY = -factorY;
            }
            
            const scaleX = 1 + (deltaX * factorX) / sensitivity;
            const scaleY = 1 + (deltaY * factorY) / sensitivity;
            const scale = (scaleX + scaleY) / 2;
            
            const newSizeMm = dragStartRef.current.initialSizeMm * scale;
            const clampedSize = Math.max(10, Math.min(newSizeMm, dragStartRef.current.initialSizeMm * 5));
            
            if (objectType === 'inscription') {
              onUpdate?.({ sizeMm: clampedSize });
            } else {
              // For motifs and additions, use scale factor
              onUpdate?.({ scaleFactor: scale });
            }
            break;
          }
          
          case 'rotate': {
            // Calculate rotation angle relative to center
            const startAngle = Math.atan2(
              dragStartRef.current.y - dragStartRef.current.centerY,
              dragStartRef.current.x - dragStartRef.current.centerX
            );
            const currentAngle = Math.atan2(
              e.clientY - dragStartRef.current.centerY,
              e.clientX - dragStartRef.current.centerX
            );
            
            const deltaAngle = currentAngle - startAngle;
            const rotationDeg = (deltaAngle * 180) / Math.PI;
            
            onUpdate?.({ rotationDeg });
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
      if (dragStartRef.current.target && dragStartRef.current.target.releasePointerCapture) {
        try {
          dragStartRef.current.target.releasePointerCapture(dragStartRef.current.pointerId);
        } catch (err) {

        }
      }
      
      setIsDragging(false);
      setDragHandle(null);
      document.body.style.cursor = 'auto';
      
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
  }, [isDragging, dragHandle, gl, onUpdate, controls, objectType]);

  // Refs for non-interactive elements
  const outlineRef = React.useRef<any>(null);
  const groupRef = React.useRef<THREE.Group>(null);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (preventClickTimeoutRef.current) {
        clearTimeout(preventClickTimeoutRef.current);
      }
    };
  }, []);

  // Disable raycasting on outline
  React.useEffect(() => {
    if (outlineRef.current) {
      outlineRef.current.raycast = () => {};
    }
  }, []);

  const [isVisible, setIsVisible] = React.useState(true);
  
  // Use useFrame to check visibility on every frame
  useFrame(() => {
    if (groupRef.current) {
      const worldPos = new THREE.Vector3();
      groupRef.current.getWorldPosition(worldPos);
      
      const worldNormal = new THREE.Vector3();
      groupRef.current.getWorldDirection(worldNormal);
      
      const cameraDir = new THREE.Vector3();
      cameraDir.subVectors(camera.position, worldPos).normalize();
      
      const dotProduct = cameraDir.dot(worldNormal);
      
      // Update visibility based on dot product
      // Positive = front view (visible), Negative = back view (hidden)
      setIsVisible(dotProduct >= 0);
    }
  });
  
  // Don't render if not visible
  if (!isVisible) {
    return null;
  }

  return (
    <group ref={groupRef} position={position} rotation={[0, 0, rotation]}>
      {/* Box outline */}
      <Line
        ref={outlineRef}
        points={outlinePoints}
        color={outlineColor}
        lineWidth={3}
        renderOrder={1001}
        depthWrite={false}
        depthTest={false}
        visible={true}
      />
      
      {/* Backup outline using thin boxes */}
      {outlinePoints.map((point, i) => {
        if (i === outlinePoints.length - 1) return null;
        const nextPoint = outlinePoints[i + 1];
        const midX = (point.x + nextPoint.x) / 2;
        const midY = (point.y + nextPoint.y) / 2;
        const length = point.distanceTo(nextPoint);
        const angle = Math.atan2(nextPoint.y - point.y, nextPoint.x - point.x);
        
        return (
          <mesh
            key={`outline-${i}`}
            position={[midX, midY, handleZOffset + 0.001]}
            rotation={[0, 0, angle]}
            renderOrder={1002}
          >
            <boxGeometry args={[length, handleThickness, handleThickness]} />
            <meshBasicMaterial color={outlineColor} depthWrite={false} depthTest={false} />
          </mesh>
        );
      })}

      {/* Corner Handles - Top-Left */}
      <mesh
        position={[-minHalfWidth, minHalfHeight, handleZOffset]}
        renderOrder={1002}
        visible={true}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => handlePointerDown(e, 'topLeft')}
        onPointerEnter={() => handlePointerEnter('topLeft')}
        onPointerLeave={handlePointerLeave}
      >
        <boxGeometry args={[fixedHandleSize, fixedHandleSize, handleThickness]} />
        <meshBasicMaterial 
          color={handleColor} 
          transparent={false}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>

      {/* Top-Right */}
      <mesh
        position={[minHalfWidth, minHalfHeight, handleZOffset]}
        renderOrder={1002}
        visible={true}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => handlePointerDown(e, 'topRight')}
        onPointerEnter={() => handlePointerEnter('topRight')}
        onPointerLeave={handlePointerLeave}
      >
        <boxGeometry args={[fixedHandleSize, fixedHandleSize, handleThickness]} />
        <meshBasicMaterial 
          color={handleColor} 
          transparent={false}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>

      {/* Bottom-Left */}
      <mesh
        position={[-minHalfWidth, -minHalfHeight, handleZOffset]}
        renderOrder={1002}
        visible={true}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => handlePointerDown(e, 'bottomLeft')}
        onPointerEnter={() => handlePointerEnter('bottomLeft')}
        onPointerLeave={handlePointerLeave}
      >
        <boxGeometry args={[fixedHandleSize, fixedHandleSize, handleThickness]} />
        <meshBasicMaterial 
          color={handleColor} 
          transparent={false}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>

      {/* Bottom-Right */}
      <mesh
        position={[minHalfWidth, -minHalfHeight, handleZOffset]}
        renderOrder={1002}
        visible={true}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => handlePointerDown(e, 'bottomRight')}
        onPointerEnter={() => handlePointerEnter('bottomRight')}
        onPointerLeave={handlePointerLeave}
      >
        <boxGeometry args={[fixedHandleSize, fixedHandleSize, handleThickness]} />
        <meshBasicMaterial 
          color={handleColor} 
          transparent={false}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>

      {/* Edge Handles - Top Center */}
      <mesh
        position={[0, minHalfHeight, handleZOffset]}
        renderOrder={1002}
        visible={true}
        onClick={(e) => e.stopPropagation()}
      >
        <boxGeometry args={[fixedHandleSize, fixedHandleSize, handleThickness]} />
        <meshBasicMaterial 
          color={handleColor} 
          transparent={false}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>

      {/* Edge Handles - Bottom Center */}
      <mesh
        position={[0, -minHalfHeight, handleZOffset]}
        renderOrder={1002}
        visible={true}
        onClick={(e) => e.stopPropagation()}
      >
        <boxGeometry args={[fixedHandleSize, fixedHandleSize, handleThickness]} />
        <meshBasicMaterial 
          color={handleColor} 
          transparent={false}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>

      {/* Edge Handles - Left Center */}
      <mesh
        position={[-minHalfWidth, 0, handleZOffset]}
        renderOrder={1002}
        visible={true}
        onClick={(e) => e.stopPropagation()}
      >
        <boxGeometry args={[fixedHandleSize, fixedHandleSize, handleThickness]} />
        <meshBasicMaterial 
          color={handleColor} 
          transparent={false}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>

      {/* Edge Handles - Right Center */}
      <mesh
        position={[minHalfWidth, 0, handleZOffset]}
        renderOrder={1002}
        visible={true}
        onClick={(e) => e.stopPropagation()}
      >
        <boxGeometry args={[fixedHandleSize, fixedHandleSize, handleThickness]} />
        <meshBasicMaterial 
          color={handleColor} 
          transparent={false}
          depthWrite={false}
          depthTest={false}
        />
      </mesh>
    </group>
  );
}
