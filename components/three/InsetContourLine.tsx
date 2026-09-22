'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import type { HeadstoneAPI } from '#/components/three/headstone/SvgHeadstone';

/** Fixed inset distance from the headstone edge in mm */
const INSET_DISTANCE_MM = 15;

/** Line rendering z-offset to sit just above the front face */
const LINE_Z_OFFSET = 0.001;

/** Line width in pixels (fat-line rendering, works on all platforms) */
const LINE_WIDTH_PX = 6;

// Bump when changing contour construction so Fast Refresh cannot retain an
// already memoized Three.js object in an open designer canvas.
const CONTOUR_BUILD_VERSION = 2;

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
export function isContourSupported(
  shapeUrl: string | null | undefined,
): boolean {
  if (!shapeUrl) return false;
  const filename = shapeUrl.split('/').pop() ?? '';
  return CONTOUR_SHAPE_FILES.has(filename);
}

type InsetContourLineProps = { headstone: HeadstoneAPI };

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
      result.push(
        new THREE.Vector2(
          points[0].x + norm.x * distance,
          points[0].y + norm.y * distance,
        ),
      );
    } else if (i === n - 1) {
      const edge = new THREE.Vector2().subVectors(points[n - 1], points[n - 2]);
      if (edge.lengthSq() < 1e-10) continue;
      const norm = new THREE.Vector2(edge.y, -edge.x).normalize();
      result.push(
        new THREE.Vector2(
          points[n - 1].x + norm.x * distance,
          points[n - 1].y + norm.y * distance,
        ),
      );
    } else {
      const edge1 = new THREE.Vector2().subVectors(points[i], points[i - 1]);
      const edge2 = new THREE.Vector2().subVectors(points[i + 1], points[i]);
      if (edge1.lengthSq() < 1e-10 || edge2.lengthSq() < 1e-10) continue;

      const n1 = new THREE.Vector2(edge1.y, -edge1.x).normalize();
      const n2 = new THREE.Vector2(edge2.y, -edge2.x).normalize();

      const avg = new THREE.Vector2().addVectors(n1, n2);
      if (avg.lengthSq() < 1e-10) {
        result.push(
          new THREE.Vector2(
            points[i].x + n1.x * distance,
            points[i].y + n1.y * distance,
          ),
        );
        continue;
      }
      avg.normalize();
      const cosHalf = Math.max(0.5, n1.dot(avg));
      const miterDist = Math.min(distance / cosHalf, distance * 1.42);
      result.push(
        new THREE.Vector2(
          points[i].x + avg.x * miterDist,
          points[i].y + avg.y * miterDist,
        ),
      );
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
    let minX = Infinity,
      maxX = -Infinity,
      maxY = -Infinity;
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
      if (upperArc[i].x > minX + xThresh) {
        curveStart = i;
        break;
      }
    }

    let curveEnd = upperArc.length - 1;
    for (let i = upperArc.length - 1; i >= 0; i--) {
      if (upperArc[i].x < maxX - xThresh) {
        curveEnd = i;
        break;
      }
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
    // `Line2` normally renders a rounded cap beyond each endpoint. Treat the
    // contour as one very long, gap-free dash to discard those caps, so the
    // Serpentine curve ends flush with the inset side lines.
    mat.dashed = true;
    mat.dashSize = 1_000_000;
    mat.gapSize = 0;

    const createLine = (positions: number[]) => {
      const geometry = new LineGeometry();
      geometry.setPositions(positions);
      const line = new Line2(geometry, mat);
      line.computeLineDistances();
      line.renderOrder = 20;
      return line;
    };

    if (curveEnd <= curveStart + 1) {
      // No distinct curve (rectangular shape) — draw a simple inset rectangle
      const topY = maxY - insetLocal;
      const positions = [
        leftX,
        bottomY,
        0,
        leftX,
        topY,
        0,
        rightX,
        topY,
        0,
        rightX,
        bottomY,
        0,
        leftX,
        bottomY,
        0,
      ];
      return createLine(positions);
    }

    // Offset only the curved top portion inward
    const curvePts = upperArc.slice(curveStart, curveEnd + 1);
    const offsetCurve = offsetOpenPathInward(curvePts, insetLocal);
    if (offsetCurve.length < 2) return null;

    // Snap curve endpoints to the vertical side x-positions
    offsetCurve[0].x = leftX;
    offsetCurve[offsetCurve.length - 1].x = rightX;

    // Keep the top curve separate from the side/bottom frame. A single fat-line
    // path creates a large miter at each acute curve-to-vertical transition,
    // visibly extending the Serpentine arc beyond the vertical contour.
    const curvePositions: number[] = [];
    for (const p of offsetCurve) {
      curvePositions.push(p.x, p.y, 0);
    }

    const contour = new THREE.Group();
    contour.add(
      createLine([leftX, bottomY, 0, leftX, offsetCurve[0].y, 0]),
      createLine(curvePositions),
      createLine([
        rightX,
        offsetCurve[offsetCurve.length - 1].y,
        0,
        rightX,
        bottomY,
        0,
        leftX,
        bottomY,
        0,
      ]),
    );
    return contour;
    // `CONTOUR_BUILD_VERSION` intentionally invalidates this object after a
    // Fast Refresh that changes the contour-construction code.
  }, [outlinePoints, unitsPerMeter, CONTOUR_BUILD_VERSION]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!lineObject) return null;

  return <primitive object={lineObject} position-z={LINE_Z_OFFSET} />;
}
