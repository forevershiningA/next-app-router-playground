'use client';
import * as THREE from 'three';
import React, { useMemo, forwardRef, useEffect } from 'react';
import { useHeadstoneStore } from '#/lib/headstone-store';

type UrnOvalBaseProps = {
  onClick?: (e: any) => void;
  height?: number;
  name?: string;
};

// Landscape oval (elliptical cylinder) base for the urn product.
// Width matches the urn body width; depth = 60% of width; height = baseHeightMm.
const UrnOvalBase = forwardRef<THREE.Mesh, UrnOvalBaseProps>(
  function UrnOvalBase({ onClick, height = 0.1, name = 'urn-base' }, ref) {
    const widthMm = useHeadstoneStore((s) => s.widthMm);

    // Oval base: slightly wider than the urn, landscape oval (depth = 60% of width)
    const halfW = ((widthMm + 40) / 1000) / 2;  // metres, +40mm padding
    const halfD = halfW * 0.6;

    const geometry = useMemo(() => {
      // Start with a unit cylinder, then scale to ellipse
      const geom = new THREE.CylinderGeometry(1, 1, 1, 64, 1);
      geom.scale(halfW, height, halfD);
      // Translate so bottom face sits at Y=0
      geom.translate(0, height / 2, 0);
      return geom;
    }, [halfW, halfD, height]);

    const material = useMemo(() => new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0xe8e8e8),
      roughness: 0.18,
      metalness: 0.98,
      clearcoat: 0.9,
      clearcoatRoughness: 0.1,
      envMapIntensity: 2.0,
    }), []);

    useEffect(() => {
      return () => {
        geometry.dispose();
        material.dispose();
      };
    }, [geometry, material]);

    return (
      <mesh
        ref={ref}
        geometry={geometry}
        material={material}
        name={name}
        onClick={onClick}
        castShadow
        receiveShadow
      />
    );
  },
);

export default UrnOvalBase;
