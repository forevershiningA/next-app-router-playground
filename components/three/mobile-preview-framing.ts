import * as THREE from 'three';

// Match the phone navigation header and the two bottom-sheet positions.
// Desktop cameras do not use this calculation.
export function fitMobilePreview(
  sphere: THREE.Sphere,
  direction: THREE.Vector3,
  fov: number,
  width: number,
  height: number,
  collapsed: boolean,
  compact: boolean,
  expandedSheetFraction = 0.75,
) {
  const top = 72;
  const bottom = collapsed
    ? 52
    : compact
      ? 160
      : height * expandedSheetFraction;
  const availableHeight = Math.max(40, height - top - bottom - 16);
  const tanHalfFov = Math.tan(THREE.MathUtils.degToRad(fov) / 2);
  const halfAngle = Math.atan(
    tanHalfFov * Math.min(availableHeight / height, (width - 32) / height),
  );
  const distance = (sphere.radius / Math.sin(halfAngle)) * 1.08;
  const centerNdc = 1 - (top + height - bottom) / height;
  const right = new THREE.Vector3()
    .crossVectors(new THREE.Vector3(0, 1, 0), direction)
    .normalize();
  const up = new THREE.Vector3().crossVectors(direction, right).normalize();
  const target = sphere.center
    .clone()
    .addScaledVector(up, -centerNdc * distance * tanHalfFov);
  if (collapsed) {
    // Keep the monument visually centred in the exposed canvas area. The
    // assembly's bounding sphere places the broad base below the visual
    // centre, so lower the camera target slightly while the sheet is tucked
    // away.
    target.addScaledVector(up, -sphere.radius * 0.12);
  }
  return { distance, target };
}
