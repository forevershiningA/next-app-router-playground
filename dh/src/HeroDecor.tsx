'use client';

import React, { useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';
import * as THREE from 'three';

const BASE = import.meta.env.BASE_URL || '/';

interface HeroDecorProps {
  photoUrl?: string | null;
  maskPath?: string;
}

export default function HeroDecor({ photoUrl = null, maskPath = '/shapes/masks/oval_vertical.svg' }: HeroDecorProps) {
  // If no photoUrl provided, do not render the ceramic/photo decoration
  if (!photoUrl) return null;

  const maskUrl = maskPath && maskPath.startsWith('/') ? `${BASE}${maskPath.replace(/^\//, '')}` : maskPath;
  const photoUrlResolved = photoUrl && photoUrl.startsWith('/') ? `${BASE}${photoUrl.replace(/^\//, '')}` : photoUrl;

  const svgData = useLoader(SVGLoader, maskUrl);
  const photoTexture = useTexture(photoUrlResolved);

  useMemo(() => {
    if (photoTexture) {
      try {
        photoTexture.colorSpace = THREE.SRGBColorSpace;
        photoTexture.wrapS = THREE.ClampToEdgeWrapping;
        photoTexture.wrapT = THREE.ClampToEdgeWrapping;
        photoTexture.anisotropy = 16;
        photoTexture.needsUpdate = true;
      } catch {}
    }
  }, [photoTexture]);

  const shapeData = useMemo(() => {
    const paths = svgData?.paths ?? [];
    if (!paths.length) return null;
    const shapes = paths.flatMap((path: any) => path.toShapes(true));
    if (!shapes.length) return null;

    const photoGeometry = new THREE.ShapeGeometry(shapes, 64);
    const ceramicGeometry = new THREE.ExtrudeGeometry(shapes, {
      depth: 0.0046,
      bevelEnabled: true,
      bevelThickness: 0.00115,
      bevelSize: 0.00115,
      bevelSegments: 4,
      curveSegments: 64,
    });

    photoGeometry.computeBoundingBox();
    const bounds = photoGeometry.boundingBox as THREE.Box3 | null;
    if (!bounds) {
      photoGeometry.dispose();
      ceramicGeometry.dispose();
      return null;
    }

    const shapeWidth = bounds.max.x - bounds.min.x;
    const shapeHeight = bounds.max.y - bounds.min.y;
    const centerX = (bounds.min.x + bounds.max.x) / 2;
    const centerY = (bounds.min.y + bounds.max.y) / 2;

    const positions = photoGeometry.getAttribute('position');
    const uvs = new Float32Array(positions.count * 2);
    for (let i = 0; i < positions.count; i += 1) {
      const x = positions.getX(i);
      const y = positions.getY(i);
      const u = (x - bounds.min.x) / shapeWidth;
      const v = (y - bounds.min.y) / shapeHeight;
      uvs[i * 2] = u;
      uvs[i * 2 + 1] = v;
    }
    photoGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

    photoGeometry.translate(-centerX, -centerY, 0);
    ceramicGeometry.translate(-centerX, -centerY, 0);

    return { photoGeometry, ceramicGeometry, shapeWidth, shapeHeight };
  }, [svgData]);

  React.useEffect(() => {
    return () => {
      try {
        shapeData?.photoGeometry.dispose();
        shapeData?.ceramicGeometry.dispose();
      } catch {}
    };
  }, [shapeData]);

  if (!shapeData) return null;

  const { photoGeometry, ceramicGeometry, shapeWidth, shapeHeight } = shapeData;
  const width = 0.42;
  const height = 0.56;
  const scaleX = width / shapeWidth;
  const scaleY = height / shapeHeight;
  const ceramicBorder = 1.05;

  return (
    <group position={[0, 1.78, 0.245]}> 
      <mesh geometry={ceramicGeometry} scale={[scaleX * ceramicBorder, scaleY * ceramicBorder, 1]} renderOrder={8} castShadow receiveShadow>
        <meshStandardMaterial color="#f3f3f3" roughness={0.2} metalness={0.05} />
      </mesh>
      <mesh geometry={photoGeometry} position={[0, 0, 0.0072]} scale={[scaleX, scaleY, 1]} renderOrder={9} castShadow receiveShadow>
        <meshBasicMaterial map={photoTexture} transparent side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}
