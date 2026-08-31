'use client';

import type { FixingType } from '#/lib/headstone-store';

type Props = {
  fixingType: FixingType;
  worldWidth: number;
  worldHeight: number;
  /** Plaque extrusion depth in the SvgHeadstone coordinate system. */
  depth: number;
  /** Number of local SvgHeadstone units in one world metre. */
  unitsPerMeter: number;
};

/**
 * Physical mounting hardware for bronze plaques.  This component is rendered
 * inside SvgHeadstone's scaled child wrapper, therefore the plaque dimensions
 * are converted back from world metres to the wrapper's local units.
 */
export function PlaqueFixings({
  fixingType,
  worldWidth,
  worldHeight,
  depth,
  unitsPerMeter,
}: Props) {
  if (fixingType === 'flat-back') return null;

  const units = Math.max(1e-6, unitsPerMeter);
  const width = worldWidth * units;
  const height = worldHeight * units;
  const minDimensionM = Math.min(worldWidth, worldHeight);
  const insetM = Math.min(0.028, Math.max(0.014, minDimensionM * 0.16));
  const inset = insetM * units;
  const points: Array<[number, number]> = [
    [-width / 2 + inset, inset],
    [width / 2 - inset, inset],
    [-width / 2 + inset, height - inset],
    [width / 2 - inset, height - inset],
  ];

  const screwRadius = 0.006 * units;
  const screwHeadDepth = 0.0015 * units;
  // `depth` is already expressed in SvgHeadstone's local coordinates. Only
  // physical hardware dimensions need converting through `unitsPerMeter`.
  const rearZ = -depth;
  const lugWidth = 0.024 * units;
  const lugHeight = 0.018 * units;
  const lugDepth = 0.005 * units;
  const studRadius = 0.0035 * units;
  const studLength = 0.012 * units;

  return (
    <group name="plaque-fixings">
      {fixingType === 'screws' &&
        points.map(([x, y], index) => (
          <group key={`screw-${index}`} position={[x, y, screwHeadDepth]}>
            {/* A screw fixing shows only its flush head on the plaque face. */}
            <mesh castShadow>
              <circleGeometry args={[screwRadius, 20]} />
              <meshStandardMaterial color="#b9b1a3" metalness={0.88} roughness={0.28} />
            </mesh>
            <mesh position={[0, 0, 0.0002 * units]} rotation={[0, 0, Math.PI / 4]}>
              <boxGeometry args={[screwRadius * 1.1, screwRadius * 0.16, 0.0008 * units]} />
              <meshStandardMaterial color="#4a4238" metalness={0.6} roughness={0.55} />
            </mesh>
          </group>
        ))}

      {fixingType === 'lugs-with-studs' &&
        points.map(([x, y], index) => (
          <group key={`lug-${index}`} position={[x, y, rearZ]}>
            <mesh position={[0, 0, -lugDepth / 2]} castShadow>
              <boxGeometry args={[lugWidth, lugHeight, lugDepth]} />
              <meshStandardMaterial color="#8b6131" metalness={0.78} roughness={0.32} />
            </mesh>
            <mesh position={[0, 0, -lugDepth - studLength / 2]} rotation={[Math.PI / 2, 0, 0]} castShadow>
              <cylinderGeometry args={[studRadius, studRadius, studLength, 16]} />
              <meshStandardMaterial color="#a8a39a" metalness={0.9} roughness={0.24} />
            </mesh>
          </group>
        ))}
    </group>
  );
}
