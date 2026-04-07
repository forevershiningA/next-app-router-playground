'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import type { HeadstoneAPI } from '#/components/SvgHeadstone';

/** Fixed inset distance from the headstone edge in mm */
const INSET_DISTANCE_MM = 15;

/** Line rendering z-offset to sit just above the front face */
const LINE_Z_OFFSET = 0.001;

/** Line width in pixels (fat-line rendering, works on all platforms) */
const LINE_WIDTH_PX = 6;

/** Shapes that support the inset contour border (simple traditional shapes). */
const CONTOUR_SHAPE_FILES = new Set([
  'cropped_peak.svg',
  'curved_gable.svg',
  'curved_peak.svg',
  'curved_top.svg',
  'half_round.svg',
  'gable.svg',
  'left_wave.svg',
  'peak.svg',
  'right_wave.svg',
  'serpentine.svg',
  'square.svg',
]);

/** Check whether the current shape supports inset contour. */
export function isContourSupported(shapeUrl: string | null | undefined): boolean {
  if (!shapeUrl) return false;
  const filename = shapeUrl.split('/').pop() ?? '';
  return CONTOUR_SHAPE_FILES.has(filename);
}

type InsetContourLineProps = {
  headstone: HeadstoneAPI;
};

/**
 * Extract the upper arc of the outline (excluding the flat bottom edge).
 */
function extractUpperArc(
  points: THREE.Vector2[],
  yFloor: number,
): THREE.Vector2[] {
  const n = points.length;
  if (n < 3) return points;

  let leavingIdx = -1;
  let enteringIdx = -1;
  for (let i = 0; i < n; i++) {
    const currY = points[i].y;
    const nextY = points[(i + 1) % n].y;
    if (currY < yFloor && nextY >= yFloor) leavingIdx = (i + 1) % n;
    if (currY >= yFloor && nextY < yFloor) enteringIdx = i;
  }
  if (leavingIdx === -1 || enteringIdx === -1) return points;

  const arc: THREE.Vector2[] = [];
  let idx = leavingIdx;
  while (true) {
    arc.push(points[idx]);
    if (idx === enteringIdx) break;
    idx = (idx + 1) % n;
    if (arc.length > n) break;
  }
  return arc;
}

/**
 * Offset an open path inward (assumes left-to-right traversal at the top).
 * Endpoints use single-edge normals, interior points use miter joins.
 */
function offsetOpenPathInward(
  points: THREE.Vector2[],
  distance: number,
): THREE.Vector2[] {
  const n = points.length;
  if (n < 2) return points;

  const result: THREE.Vector2[] = [];

  for (let i = 0; i < n; i++) {
    if (i === 0) {
      const edge = new THREE.Vector2().subVectors(points[1], points[0]);
      if (edge.lengthSq() < 1e-10) continue;
      const norm = new THREE.Vector2(edge.y, -edge.x).normalize();
      result.push(new THREE.Vector2(
        points[0].x + norm.x * distance,
        points[0].y + norm.y * distance,
      ));
    } else if (i === n - 1) {
      const edge = new THREE.Vector2().subVectors(points[n - 1], points[n - 2]);
      if (edge.lengthSq() < 1e-10) continue;
      const norm = new THREE.Vector2(edge.y, -edge.x).normalize();
      result.push(new THREE.Vector2(
        points[n - 1].x + norm.x * distance,
        points[n - 1].y + norm.y * distance,
      ));
    } else {
      const edge1 = new THREE.Vector2().subVectors(points[i], points[i - 1]);
      const edge2 = new THREE.Vector2().subVectors(points[i + 1], points[i]);
      if (edge1.lengthSq() < 1e-10 || edge2.lengthSq() < 1e-10) continue;

      const n1 = new THREE.Vector2(edge1.y, -edge1.x).normalize();
      const n2 = new THREE.Vector2(edge2.y, -edge2.x).normalize();

      const avg = new THREE.Vector2().addVectors(n1, n2);
      if (avg.lengthSq() < 1e-10) {
        result.push(new THREE.Vector2(
          points[i].x + n1.x * distance,
          points[i].y + n1.y * distance,
        ));
        continue;
      }
      avg.normalize();
      const cosHalf = Math.max(0.5, n1.dot(avg));
      const miterDist = Math.min(distance / cosHalf, distance * 1.42);
      result.push(new THREE.Vector2(
        points[i].x + avg.x * miterDist,
        points[i].y + avg.y * miterDist,
      ));
    }
  }

  return result;
}

/**
 * Renders a white inset contour border on the headstone front face.
 * Strategy: offset only the curved top portion, then connect with
 * clean vertical sides and a horizontal bottom line — no miter artifacts.
 */
export default function InsetContourLine({ headstone }: InsetContourLineProps) {
  const { outlinePoints, unitsPerMeter } = headstone;

  const lineObject = useMemo(() => {
    if (!outlinePoints || outlinePoints.length < 3) return null;

    const insetLocal = (INSET_DISTANCE_MM / 1000) * unitsPerMeter;

    const upperArc = extractUpperArc(outlinePoints, 2);
    if (upperArc.length < 3) return null;

    // Normalize arc direction: always left-to-right so normal (dy, -dx) points inward
    if (upperArc[0].x > upperArc[upperArc.length - 1].x) {
      upperArc.reverse();
    }
    if (upperArc.length < 3) return null;

    // Bounding box of the upper arc
    let minX = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const p of upperArc) {
      minX = Math.min(minX, p.x);
      maxX = Math.max(maxX, p.x);
      maxY = Math.max(maxY, p.y);
    }

    const leftX = minX + insetLocal;
    const rightX = maxX - insetLocal;
    const bottomY = insetLocal;
    if (leftX >= rightX || bottomY >= maxY - insetLocal) return null;

    // Detect where the curved top begins/ends on the original outline.
    // The upper arc traces: left side (x ≈ minX) → top curve → right side (x ≈ maxX).
    const xThresh = Math.min((maxX - minX) * 0.01, insetLocal * 0.2);

    let curveStart = 0;
    for (let i = 0; i < upperArc.length; i++) {
      if (upperArc[i].x > minX + xThresh) { curveStart = i; break; }
    }

    let curveEnd = upperArc.length - 1;
    for (let i = upperArc.length - 1; i >= 0; i--) {
      if (upperArc[i].x < maxX - xThresh) { curveEnd = i; break; }
    }

    const mat = new LineMaterial({
      color: 0xffffff,
      linewidth: LINE_WIDTH_PX,
      depthTest: true,
      depthWrite: false,
      transparent: true,
      opacity: 0.85,
      resolution: new THREE.Vector2(1920, 1080),
    });

    if (curveEnd <= curveStart + 1) {
      // No distinct curve (rectangular shape) — draw a simple inset rectangle
      const topY = maxY - insetLocal;
      const positions = [
        leftX, bottomY, 0,
        leftX, topY, 0,
        rightX, topY, 0,
        rightX, bottomY, 0,
        leftX, bottomY, 0,
      ];
      const geom = new LineGeometry();
      geom.setPositions(positions);
      const line = new Line2(geom, mat);
      line.computeLineDistances();
      line.renderOrder = 20;
      return line;
    }

    // Offset only the curved top portion inward
    const curvePts = upperArc.slice(curveStart, curveEnd + 1);
    const offsetCurve = offsetOpenPathInward(curvePts, insetLocal);
    if (offsetCurve.length < 2) return null;

    // Snap curve endpoints to the vertical side x-positions
    offsetCurve[0].x = leftX;
    offsetCurve[offsetCurve.length - 1].x = rightX;

    // Build path: bottom-left → left vertical → curve → right vertical → bottom → close
    const positions: number[] = [];

    // Bottom-left corner
    positions.push(leftX, bottomY, 0);

    // Curve (first point at leftX connects from left vertical,
    //        last point at rightX connects to right vertical)
    for (const p of offsetCurve) {
      positions.push(p.x, p.y, 0);
    }

    // Bottom-right corner
    positions.push(rightX, bottomY, 0);

    // Close: bottom line back to start
    positions.push(leftX, bottomY, 0);

    const geom = new LineGeometry();
    geom.setPositions(positions);
    const line = new Line2(geom, mat);
    line.computeLineDistances();
    line.renderOrder = 20;
    return line;
  }, [outlinePoints, unitsPerMeter]);

  if (!lineObject) return null;

  return (
    <primitive object={lineObject} position-z={LINE_Z_OFFSET} />
  );
}
