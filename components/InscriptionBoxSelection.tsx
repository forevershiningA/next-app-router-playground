'use client';

import * as React from 'react';
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { Html, Line } from '@react-three/drei';

type Props = {
  inscriptionId: string;
  position: THREE.Vector3;
  bounds: { width: number; height: number };
  rotation: number; // in radians
  unitsPerMeter: number; // Scale factor from headstone
  currentSizeMm: number; // Current text size in mm
  onUpdate?: (data: {
    xPos?: number;
    yPos?: number;
    sizeMm?: number;
    rotationDeg?: number;
  }) => void;
};

type HandleType = 
  | 'topLeft' 
  | 'topRight' 
  | 'bottomLeft' 
  | 'bottomRight' 
  | 'rotate';

export default function InscriptionBoxSelection({
  inscriptionId,
  position,
  bounds,
  rotation,
  unitsPerMeter,
  currentSizeMm,
  onUpdate,
}: Props) {
  const threeContext = useThree();
  const { camera, gl, controls } = threeContext;
  
  const [hoveredHandle, setHoveredHandle] = React.useState<HandleType | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragHandle, setDragHandle] = React.useState<HandleType | null>(null);
  const [keepVisible, setKeepVisible] = React.useState(true); // Always keep selection visible
  const wasDraggingRef = React.useRef(false); // Track if we just finished dragging
  const preventClickTimeoutRef = React.useRef<NodeJS.Timeout | null>(null); // Prevent clicks after drag
  const dragStartRef = React.useRef({
    x: 0, 
    y: 0, 
    width: 0, 
    height: 0,
    centerX: 0,
    centerY: 0,
    rotation: 0,
    initialSizeMm: 0, // Store initial size in mm
    target: null as any, // Store the target element for pointer capture
    pointerId: 0, // Store pointer ID
  });

  // Visual constants - scaled to SVG/headstone units
  // FIXED SIZES - don't scale with text height
  const fixedHandleSize = 750 / unitsPerMeter; // 750mm fixed size in local units (10x bigger, then 75%)
  const handleThickness = 10 / unitsPerMeter; // 10mm fixed thickness
  const handleZOffset = 0.01; // Move handles forward in Z to be visible
  const rotateHandleSize = bounds.height * 0.15 * 0.8; // 15% of text height (can scale) * 80%
  const rotateHandleOffset = bounds.height * 1.2; // 120% above text
  const lineThickness = bounds.height * 0.01; // Thin line
  
  const outlineColor = 0x00ffff; // Cyan - no hover effect
  const handleColor = 0xffffff; // Always white - no hover effect
  const rotateColor = 0x404040; // Dark grey - no hover effect

  // Create box outline points
  const outlinePoints = React.useMemo(() => {
    const w = bounds.width / 2;
    const h = bounds.height / 2;
    const points = [
      new THREE.Vector3(-w, -h, 0),
      new THREE.Vector3(w, -h, 0),
      new THREE.Vector3(w, h, 0),
      new THREE.Vector3(-w, h, 0),
      new THREE.Vector3(-w, -h, 0),
    ];
    return points;
  }, [bounds.width, bounds.height]);

  // Handle pointer down on handles
  const handlePointerDown = React.useCallback(
    (e: any, handleType: HandleType) => {
      e.stopPropagation();
      
      // Capture pointer to this element to prevent events going to headstone
      if (e.target && e.target.setPointerCapture) {
        e.target.setPointerCapture(e.pointerId);
      }
      
      setIsDragging(true);
      setDragHandle(handleType);
      wasDraggingRef.current = true; // Mark that we started dragging
      
      const rect = gl.domElement.getBoundingClientRect();
      
      // Store initial values INCLUDING current size and target for pointer release
      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        width: bounds.width,
        height: bounds.height,
        centerX: rect.left + rect.width / 2,
        centerY: rect.top + rect.height / 2,
        rotation: 0,
        initialSizeMm: currentSizeMm, // Store starting size
        target: e.target,
        pointerId: e.pointerId,
      };

      // BLOCK orbit controls - try multiple methods
      if (controls) {
        (controls as any).enabled = false;
      }
      if ((gl.domElement as any).orbitControls) {
        (gl.domElement as any).orbitControls.enabled = false;
      }
      
      const cursorMap: Record<HandleType, string> = {
        topLeft: 'nwse-resize',
        topRight: 'nesw-resize',
        bottomLeft: 'nesw-resize',
        bottomRight: 'nwse-resize',
        rotate: 'grabbing',
      };
      
      document.body.style.cursor = cursorMap[handleType] || 'grab';
    },
    [bounds, gl, currentSizeMm, controls]
  );

  const handlePointerEnter = React.useCallback((handle: HandleType) => {
    setHoveredHandle(handle);
    const cursorMap: Record<HandleType, string> = {
      topLeft: 'nwse-resize',
      topRight: 'nesw-resize',
      bottomLeft: 'nesw-resize',
      bottomRight: 'nwse-resize',
      rotate: 'grab',
    };
    document.body.style.cursor = cursorMap[handle] || 'auto';
  }, []);

  const handlePointerLeave = React.useCallback(() => {
    if (!isDragging) {
      setHoveredHandle(null);
      document.body.style.cursor = 'auto';
    }
  }, [isDragging]);

  // Handle pointer move
  React.useEffect(() => {
    if (!isDragging || !dragHandle) return;

    // Use requestAnimationFrame for smoother updates
    let animationFrameId: number | null = null;
    let lastUpdateTime = 0;
    const updateInterval = 16; // ~60fps for smoother updates (was throttled more)

    const handleMove = (e: PointerEvent) => {
      e.preventDefault();
      e.stopPropagation(); // Stop event propagation
      
      // Cancel any pending animation frame
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }

      // Schedule update with requestAnimationFrame for smoother performance
      animationFrameId = requestAnimationFrame((timestamp) => {
        // Throttle updates to maintain performance while being responsive
        if (timestamp - lastUpdateTime < updateInterval) {
          return;
        }
        lastUpdateTime = timestamp;

        const deltaX = e.clientX - dragStartRef.current.x;
        const deltaY = e.clientY - dragStartRef.current.y;

        // MUCH HIGHER sensitivity - 150 pixels = 100% scale change (was 300, now 2x faster!)
        const sensitivity = 150;

        switch (dragHandle) {
          case 'topLeft':
          case 'topRight':
          case 'bottomLeft':
          case 'bottomRight': {
            // Corner resize - proportional scaling using average of both deltas
            const factorX = (dragHandle === 'topLeft' || dragHandle === 'bottomLeft') ? -1 : 1;
            const factorY = (dragHandle === 'topLeft' || dragHandle === 'topRight') ? -1 : 1;
            
            const scaleX = 1 + (deltaX * factorX) / sensitivity;
            const scaleY = 1 + (deltaY * factorY) / sensitivity;
            // Use average of both scales for proportional resize
            const scale = (scaleX + scaleY) / 2;
            
            // Calculate NEW absolute size from INITIAL size
            const newSizeMm = dragStartRef.current.initialSizeMm * scale;
            const clampedSize = Math.max(10, Math.min(newSizeMm, dragStartRef.current.initialSizeMm * 5)); // Cap at 5x initial
            
            onUpdate?.({ sizeMm: clampedSize });
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
      
      // Cancel any pending animation frame
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      
      // Release pointer capture
      if (dragStartRef.current.target && dragStartRef.current.target.releasePointerCapture) {
        try {
          dragStartRef.current.target.releasePointerCapture(dragStartRef.current.pointerId);
        } catch (err) {
          // Ignore release errors
        }
      }
      
      setIsDragging(false);
      setDragHandle(null);
      // KEEP selection visible - don't reset any visibility state
      setKeepVisible(true); // Ensure it stays visible
      document.body.style.cursor = 'auto';
      
      // RE-ENABLE orbit controls - try multiple methods
      if (controls) {
        (controls as any).enabled = true;
      }
      if ((gl.domElement as any).orbitControls) {
        (gl.domElement as any).orbitControls.enabled = true;
      }
      
      // Prevent any clicks on the scene for 200ms to avoid selecting headstone
      wasDraggingRef.current = true;
      if (preventClickTimeoutRef.current) {
        clearTimeout(preventClickTimeoutRef.current);
      }
      preventClickTimeoutRef.current = setTimeout(() => {
        wasDraggingRef.current = false;
        preventClickTimeoutRef.current = null;
      }, 200);
      
      // Add a temporary click blocker to the canvas
      const canvas = gl.domElement;
      const blockClick = (clickEvent: Event) => {
        clickEvent.stopPropagation();
        clickEvent.preventDefault();
        canvas.removeEventListener('click', blockClick, true);
      };
      canvas.addEventListener('click', blockClick, true);
      
      // Remove blocker after a short delay
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
  }, [isDragging, dragHandle, gl, onUpdate, controls]);

  // Refs for non-interactive elements
  const outlineRef = React.useRef<any>(null);
  const lineRef = React.useRef<any>(null);

  // Cleanup timeout on unmount
  React.useEffect(() => {
    return () => {
      if (preventClickTimeoutRef.current) {
        clearTimeout(preventClickTimeoutRef.current);
      }
    };
  }, []);

  // Disable raycasting on outline and connecting line
  React.useEffect(() => {
    if (outlineRef.current) {
      outlineRef.current.raycast = () => {}; // Disable raycasting
    }
    if (lineRef.current) {
      lineRef.current.raycast = () => {}; // Disable raycasting
    }
  }, []);

  return (
    <group position={position} rotation={[0, 0, rotation]}>
      {/* Box outline - ALWAYS VISIBLE */}
      <Line
        ref={outlineRef}
        points={outlinePoints}
        color={outlineColor}
        lineWidth={2}
        renderOrder={1000}
        depthWrite={false}
        visible={true}
      />

      {/* Line connecting to rotation handle - ALWAYS VISIBLE */}
      <Line
        ref={lineRef}
        points={[
          [0, bounds.height / 2, 0],
          [0, bounds.height / 2 + rotateHandleOffset, 0],
        ]}
        color={outlineColor}
        lineWidth={1}
        renderOrder={1000}
        depthWrite={false}
        visible={true}
      />

      {/* Corner Handles - FIXED SIZE SQUARES at each corner - ALWAYS VISIBLE */}
      {/* Top-Left corner */}
      <mesh
        position={[-bounds.width / 2, bounds.height / 2, handleZOffset]}
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
          transparent={true}
          opacity={0.9}
          depthWrite={false}
        />
      </mesh>

      {/* Top-Right corner */}
      <mesh
        position={[bounds.width / 2, bounds.height / 2, handleZOffset]}
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
          transparent={true}
          opacity={0.9}
          depthWrite={false}
        />
      </mesh>

      {/* Bottom-Left corner */}
      <mesh
        position={[-bounds.width / 2, -bounds.height / 2, handleZOffset]}
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
          transparent={true}
          opacity={0.9}
          depthWrite={false}
        />
      </mesh>

      {/* Bottom-Right corner */}
      <mesh
        position={[bounds.width / 2, -bounds.height / 2, handleZOffset]}
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
          transparent={true}
          opacity={0.9}
          depthWrite={false}
        />
      </mesh>

      {/* Rotation handle - LARGE circle - ALWAYS VISIBLE */}
      <mesh
        position={[0, bounds.height / 2 + rotateHandleOffset, handleZOffset]}
        renderOrder={1003}
        visible={true}
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => handlePointerDown(e, 'rotate')}
        onPointerEnter={() => handlePointerEnter('rotate')}
        onPointerLeave={handlePointerLeave}
      >
        <circleGeometry args={[rotateHandleSize, 32]} />
        <meshBasicMaterial 
          color={rotateColor} 
          transparent={true}
          opacity={0.9}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* HTML overlay for rotation icon - ALWAYS VISIBLE */}
      <Html
        position={[0, bounds.height / 2 + rotateHandleOffset, lineThickness * 3]}
        center
        distanceFactor={10}
        zIndexRange={[1000, 0]}
        style={{ 
          pointerEvents: 'none',
          userSelect: 'none',
          display: 'block',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#404040',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 4px 12px rgba(0,0,0,0.8)',
            border: '2px solid white',
          }}
        >
          ⟲
        </div>
      </Html>
    </group>
  );
}
