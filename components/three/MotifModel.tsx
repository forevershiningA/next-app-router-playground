'use client';

import * as React from 'react';
import * as THREE from 'three';
import { useLoader, useThree } from '@react-three/fiber';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';
import { useHeadstoneStore } from '#/lib/headstone-store';
import type { HeadstoneAPI } from '../SvgHeadstone';

type Props = {
  id: string; // unique motif ID
  svgPath: string; // path to SVG file
  color: string; // motif color
  headstone?: HeadstoneAPI;
  index?: number;
};

export default function MotifModel({ id, svgPath, color, headstone, index = 0 }: Props) {
  const { gl, camera, controls } = useThree();
  const setMotifRef = useHeadstoneStore((s) => s.setMotifRef);
  const motifOffsets = useHeadstoneStore((s) => s.motifOffsets);
  const setSelectedMotifId = useHeadstoneStore((s) => s.setSelectedMotifId);
  const selectedMotifId = useHeadstoneStore((s) => s.selectedMotifId);
  const setMotifOffset = useHeadstoneStore((s) => s.setMotifOffset);
  const ref = React.useRef<THREE.Group>(null!);
  const [dragging, setDragging] = React.useState(false);

  // Load SVG
  const svgData = useLoader(SVGLoader, svgPath);

  const raycaster = React.useMemo(() => new THREE.Raycaster(), []);
  const mouse = React.useMemo(() => new THREE.Vector2(), []);

  // Create mesh from SVG paths
  const mesh = React.useMemo(() => {
    if (!svgData) return null;

    const group = new THREE.Group();
    const paths = svgData.paths;

    // Parse the color to THREE.Color
    const motifColor = new THREE.Color(color);

    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      const shapes = SVGLoader.createShapes(path);

      for (const shape of shapes) {
        const geometry = new THREE.ShapeGeometry(shape);
        // Use the motif color instead of path color
        const material = new THREE.MeshBasicMaterial({
          color: motifColor,
          side: THREE.DoubleSide,
          depthWrite: true,
          depthTest: true,
        });

        const shapeMesh = new THREE.Mesh(geometry, material);
        group.add(shapeMesh);
      }
    }

    // Calculate bounding box to center and scale
    const box = new THREE.Box3().setFromObject(group);
    const size = new THREE.Vector3();
    box.getSize(size);
    const center = new THREE.Vector3();
    box.getCenter(center);

    // Center the group
    group.position.sub(center);

    // Fix upside-down issue: scale Y by 1 instead of -1
    // SVG Y coordinates are top-down, but we want them right-side up
    group.scale.y = 1;

    return { group, size };
  }, [svgData, id, color]);

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

      if (intersects.length > 0) {
        const point = intersects[0].point;
        const localPt = targetMesh.worldToLocal(point.clone());

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

        const offset = motifOffsets[id] ?? {};
        setMotifOffset(id, {
          ...offset,
          xPos: localPt.x,
          yPos: localPt.y,
        });
      }
    },
    [headstone, gl, camera, raycaster, mouse, id, motifOffsets, setMotifOffset]
  );

  const handleClick = React.useCallback(
    (e: any) => {
      e.stopPropagation();

      setSelectedMotifId(id);
    },
    [id, setSelectedMotifId]
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
    const canvas = gl?.domElement;
    if (!canvas) return;

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
    canvas.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp, { once: true });
    document.body.style.cursor = 'grabbing';

    return () => {
      canvas.removeEventListener('pointermove', onMove);
    };
  }, [dragging, gl, controls, placeFromClientXY]);

  const stone = headstone?.mesh?.current as THREE.Mesh | null;
  if (!headstone || !stone || !mesh) {
    return null;
  }

  // Get headstone bounds
  if (!stone.geometry.boundingBox) stone.geometry.computeBoundingBox();
  const bbox = stone.geometry.boundingBox!.clone();

  const inset = 0.01;
  const spanY = bbox.max.y - bbox.min.y;
  const minX = bbox.min.x + inset;
  const maxX = bbox.max.x - inset;
  const minY = bbox.min.y + inset + 0.04 * spanY;
  const maxY = bbox.max.y - inset;

  // Default position in center
  const defaultX = THREE.MathUtils.lerp(minX, maxX, 0.5);
  const defaultY = THREE.MathUtils.lerp(minY, maxY, 0.5);

  const defaultOffset = {
    xPos: defaultX,
    yPos: defaultY,
    scale: 1,
    rotationZ: 0,
    heightMm: 100, // Default height in mm (init_height from XML)
  };

  const offset = motifOffsets[id] ?? defaultOffset;

  // Scale based on heightMm to match the specified height
  // NOTE: In the headstone coordinate system, mm values are used directly as units
  // (same as inscriptions use sizeMm directly as fontSize)
  // So 100mm = 100 units in the coordinate system
  const targetHeightInUnits = offset.heightMm ?? 100;
  
  // Use the Y dimension (height) of the mesh for scaling
  const meshHeight = mesh.size.y;
  
  // Calculate scale to make the motif's height match the heightMm value
  const finalScale = meshHeight > 0 ? targetHeightInUnits / meshHeight : 1;

  // Position on headstone surface (front)
  const zPosition = headstone.frontZ + 0.01;

  const isSelected = selectedMotifId === id;

  return (
    <group
      ref={ref}
      position={[offset.xPos, offset.yPos, zPosition]}
      rotation={[0, 0, offset.rotationZ || 0]}
      scale={[finalScale, finalScale, 1]}
      visible={true}
      name={`motif-${id}`}
      onClick={handleClick}
      onPointerDown={handlePointerDown}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
    >
      <primitive object={mesh.group} />
    </group>
  );
}
