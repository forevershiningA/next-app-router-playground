'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

function SimpleHeadstone() {
  const ref = useRef<any>(null);

  useFrame((state, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.3;
  });
  return (
    <group ref={ref} position={[0, -0.6, 0]}>
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.9, 1.2, 0.18]} />
        <meshStandardMaterial color="#2b2b2b" roughness={0.4} metalness={0.05} />
      </mesh>
      <mesh position={[0, -0.05, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.3, 0.18, 0.6]} />
        <meshStandardMaterial color="#414141" roughness={0.6} metalness={0.02} />
      </mesh>
    </group>
  );
}

export default function MobileHero() {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  // Keep a ref but allow default wheel scrolling so the page scrolls when wheel is used over canvas.
  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }}>
      <Canvas shadows dpr={[1, 1.25]} camera={{ position: [0, 0.6, 2.6], fov: 45 }}>
        <ambientLight intensity={0.6} />
        <directionalLight position={[2, 4, 2]} intensity={1} />
        <SimpleHeadstone />
        <OrbitControls enablePan={false} enableZoom={false} enableRotate={false} />
      </Canvas>
    </div>
  );
}
