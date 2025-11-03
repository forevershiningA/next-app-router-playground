/**
 * Bronze Plaque Border Component
 * Renders decorative borders on bronze plaques using Adobe Animate encoded data
 */

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useLoader } from '@react-three/fiber';
import * as THREE from 'three';
import { loadBorder, type ProcessedBorder, createBorderSVG } from '#/lib/border-loader';

interface BronzeBorderProps {
  borderName: string | null;
  plaqueWidth: number;
  plaqueHeight: number;
  color: string;
  depth: number;
}

export function BronzeBorder({
  borderName,
  plaqueWidth,
  plaqueHeight,
  color,
  depth,
}: BronzeBorderProps) {
  const [borderData, setBorderData] = useState<ProcessedBorder | null>(null);
  const [loading, setLoading] = useState(false);

  // Load border data
  useEffect(() => {
    if (!borderName) {
      setBorderData(null);
      return;
    }

    setLoading(true);
    loadBorder(borderName)
      .then((data) => {
        console.log(`✅ Border loaded: ${borderName}`, data);
        setBorderData(data);
      })
      .catch((error) => {
        console.error(`❌ Failed to load border: ${borderName}`, error);
        setBorderData(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [borderName]);

  if (!borderData || loading) {
    return null;
  }

  // For simple borders (no detail sections), render the main border shape
  if (!borderData.details) {
    return (
      <SimpleBorder
        svgPath={borderData.main.svgPath}
        bounds={borderData.main.bounds}
        plaqueWidth={plaqueWidth}
        plaqueHeight={plaqueHeight}
        color={color}
        depth={depth}
      />
    );
  }

  // For complex borders with details (Border 8, 9, etc.), render repeating patterns
  return (
    <DetailedBorder
      borderData={borderData}
      plaqueWidth={plaqueWidth}
      plaqueHeight={plaqueHeight}
      color={color}
      depth={depth}
    />
  );
}

/**
 * Simple border using 9-slice scaling
 * Corners stay fixed, edges scale to fit plaque dimensions
 */
function SimpleBorder({
  svgPath,
  bounds,
  plaqueWidth,
  plaqueHeight,
  color,
  depth,
}: {
  svgPath: string;
  bounds: { left: number; top: number; right: number; bottom: number; width: number; height: number };
  plaqueWidth: number;
  plaqueHeight: number;
  color: string;
  depth: number;
}) {
  const texture = useMemo(() => {
    // Create canvas for the full plaque
    const canvas = document.createElement('canvas');
    const resolution = 4;
    canvas.width = plaqueWidth * resolution;
    canvas.height = plaqueHeight * resolution;
    const ctx = canvas.getContext('2d')!;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Create the border path
    const path = new Path2D(svgPath);
    
    // Border inset size (how much of the border is the decorative edge)
    // This is typically a percentage of the original border size
    const borderWidth = bounds.width * 0.1; // 10% of original width
    const borderHeight = bounds.height * 0.1; // 10% of original height
    
    // Scale factors
    const scaleX = canvas.width / bounds.width;
    const scaleY = canvas.height / bounds.height;
    
    // For now, just render the full border scaled
    // TODO: Implement proper 9-slice when we have corner detection
    ctx.save();
    ctx.scale(scaleX, scaleY);
    ctx.translate(-bounds.left, -bounds.top);
    ctx.fillStyle = color;
    ctx.fill(path);
    ctx.restore();
    
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    
    return tex;
  }, [svgPath, bounds, plaqueWidth, plaqueHeight, color]);

  return (
    <mesh position={[0, 0, depth / 2 + 0.001]}>
      <planeGeometry args={[plaqueWidth, plaqueHeight]} />
      <meshStandardMaterial
        map={texture}
        transparent
        alphaTest={0.1}
        depthWrite={false}
      />
    </mesh>
  );
}

/**
 * Detailed border - renders repeating decorative elements on each edge
 */
function DetailedBorder({
  borderData,
  plaqueWidth,
  plaqueHeight,
  color,
  depth,
}: {
  borderData: ProcessedBorder;
  plaqueWidth: number;
  plaqueHeight: number;
  color: string;
  depth: number;
}) {
  const { details } = borderData;
  
  if (!details) return null;

  // Create textures for each detail
  const topTexture = useMemo(() => {
    if (!details.top) return null;
    return createRepeatingTexture(details.top.svgPath, details.top.bounds, color, plaqueWidth, 30);
  }, [details.top, color, plaqueWidth]);

  const bottomTexture = useMemo(() => {
    if (!details.bottom) return null;
    return createRepeatingTexture(details.bottom.svgPath, details.bottom.bounds, color, plaqueWidth, 30);
  }, [details.bottom, color, plaqueWidth]);

  const leftTexture = useMemo(() => {
    if (!details.left) return null;
    return createRepeatingTexture(details.left.svgPath, details.left.bounds, color, 30, plaqueHeight);
  }, [details.left, color, plaqueHeight]);

  const rightTexture = useMemo(() => {
    if (!details.right) return null;
    return createRepeatingTexture(details.right.svgPath, details.right.bounds, color, 30, plaqueHeight);
  }, [details.right, color, plaqueHeight]);

  const zOffset = depth / 2 + 0.001;

  return (
    <group>
      {/* Top border */}
      {topTexture && (
        <mesh position={[0, plaqueHeight / 2 - 15, zOffset]}>
          <planeGeometry args={[plaqueWidth, 30]} />
          <meshStandardMaterial
            map={topTexture}
            transparent
            alphaTest={0.5}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Bottom border */}
      {bottomTexture && (
        <mesh position={[0, -plaqueHeight / 2 + 15, zOffset]}>
          <planeGeometry args={[plaqueWidth, 30]} />
          <meshStandardMaterial
            map={bottomTexture}
            transparent
            alphaTest={0.5}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Left border */}
      {leftTexture && (
        <mesh position={[-plaqueWidth / 2 + 15, 0, zOffset]}>
          <planeGeometry args={[30, plaqueHeight]} />
          <meshStandardMaterial
            map={leftTexture}
            transparent
            alphaTest={0.5}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Right border */}
      {rightTexture && (
        <mesh position={[plaqueWidth / 2 - 15, 0, zOffset]}>
          <planeGeometry args={[30, plaqueHeight]} />
          <meshStandardMaterial
            map={rightTexture}
            transparent
            alphaTest={0.5}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  );
}

/**
 * Create a repeating texture from SVG path
 */
function createRepeatingTexture(
  svgPath: string,
  bounds: { left: number; top: number; right: number; bottom: number; width: number; height: number },
  color: string,
  targetWidth: number,
  targetHeight: number
): THREE.Texture {
  // Create canvas for the pattern
  const canvas = document.createElement('canvas');
  canvas.width = targetWidth * 2; // Higher resolution
  canvas.height = targetHeight * 2;
  const ctx = canvas.getContext('2d')!;

  // Create SVG for the single element
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${bounds.left} ${bounds.top} ${bounds.width} ${bounds.height}" width="${bounds.width}" height="${bounds.height}">
    <path d="${svgPath}" fill="${color}" />
  </svg>`;
  
  const blob = new Blob([svg], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  
  const img = new Image();
  img.src = url;
  
  // For now, use a solid color fill as placeholder until image loads
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(targetWidth / bounds.width, targetHeight / bounds.height);
  texture.needsUpdate = true;
  
  // Update when image loads
  img.onload = () => {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Calculate how many times to repeat the pattern
    const repeatX = Math.ceil(targetWidth / bounds.width) + 1;
    const repeatY = Math.ceil(targetHeight / bounds.height) + 1;
    
    // Draw the pattern repeatedly
    for (let x = 0; x < repeatX; x++) {
      for (let y = 0; y < repeatY; y++) {
        ctx.drawImage(img, x * bounds.width * 2, y * bounds.height * 2, bounds.width * 2, bounds.height * 2);
      }
    }
    
    texture.needsUpdate = true;
    URL.revokeObjectURL(url);
  };
  
  return texture;
}
