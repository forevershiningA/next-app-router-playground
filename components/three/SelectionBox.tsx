// components/three/SelectionBox.tsx
'use client';

import * as React from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

type SelectionBoxProps<T extends THREE.Object3D = THREE.Object3D> = {
  targetRef: React.RefObject<T> | React.MutableRefObject<T | null>;
  visible?: boolean;
  color?: string | number;
  pad?: number;
  through?: boolean;
  renderOrder?: number;
  lineLength?: number;
};

const SELECTION_THICKNESS_RATIO = 0.004;
const DESKTOP_SELECTION_THICKNESS_RATIO = 0.0012;
const MOBILE_BREAKPOINT_PX = 768;

const CORNER_SIGNS = [
  { sx: -1, sy: -1, sz: 1 },
  { sx: 1, sy: -1, sz: 1 },
  { sx: -1, sy: -1, sz: -1 },
  { sx: 1, sy: -1, sz: -1 },
  { sx: -1, sy: 1, sz: 1 },
  { sx: 1, sy: 1, sz: 1 },
  { sx: -1, sy: 1, sz: -1 },
  { sx: 1, sy: 1, sz: -1 },
];

const tempExpandedBox = new THREE.Box3();
const tempCenter = new THREE.Vector3();
const tempSize = new THREE.Vector3();

function createCornerGroup(
  lineLength: number,
  color: string | number,
  through: boolean,
  renderOrder: number,
  thicknessRatio: number,
) {
  const group = new THREE.Group();
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({
    color: new THREE.Color(color).getHex(),
    depthTest: !through,
    depthWrite: false,
    transparent: true,
    opacity: 0.62,
    blending: THREE.AdditiveBlending,
    toneMapped: false,
  });

  const halfSize = 0.5;
  const arm = THREE.MathUtils.clamp(lineLength, 0, 0.5);
  const thickness = thicknessRatio;

  const addArm = (position: THREE.Vector3, scale: THREE.Vector3) => {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.scale.copy(scale);
    mesh.renderOrder = renderOrder;
    mesh.frustumCulled = false;
    mesh.raycast = () => null;
    group.add(mesh);
  };

  CORNER_SIGNS.forEach(({ sx, sy, sz }) => {
    const baseX = sx * halfSize;
    const baseY = sy * halfSize;
    const baseZ = sz * halfSize;

    if (arm <= 0) return;

    addArm(
      new THREE.Vector3(baseX - (sx * arm) / 2, baseY, baseZ),
      new THREE.Vector3(arm, thickness, thickness),
    );
    addArm(
      new THREE.Vector3(baseX, baseY - (sy * arm) / 2, baseZ),
      new THREE.Vector3(thickness, arm, thickness),
    );
  });

  group.renderOrder = renderOrder;
  group.userData.selectionGeometry = geometry;
  group.userData.selectionMaterial = material;

  return group;
}

export default function SelectionBox<T extends THREE.Object3D = THREE.Object3D>({
  targetRef,
  visible = true,
  color = '#f3d48f',
  pad = 0.01,
  through = true,
  renderOrder = 1000,
  lineLength = 0.18,
}: SelectionBoxProps) {
  const { scene, size } = useThree();
  const outlineRef = React.useRef<THREE.Group | null>(null);
  const boxRef = React.useRef(new THREE.Box3());
  const [targetReady, setTargetReady] = React.useState(false);

  React.useEffect(() => {
    if (targetRef.current && !targetReady) {
      setTargetReady(true);
    }
  }, [targetRef, targetReady]);

  React.useEffect(() => {
    if (!targetReady) return;

    const thicknessRatio = size.width < MOBILE_BREAKPOINT_PX
      ? SELECTION_THICKNESS_RATIO
      : DESKTOP_SELECTION_THICKNESS_RATIO;
    const outline = createCornerGroup(lineLength, color, through, renderOrder, thicknessRatio);
    outlineRef.current = outline;
    scene.add(outline);

    return () => {
      const geometry = outline.userData.selectionGeometry as THREE.BufferGeometry | undefined;
      const material = outline.userData.selectionMaterial as THREE.Material | undefined;
      geometry?.dispose();
      material?.dispose();
      scene.remove(outline);
      outlineRef.current = null;
    };
  }, [scene, targetReady, color, through, renderOrder, lineLength, size.width]);

  useFrame(() => {
    const obj = targetRef.current;
    const outline = outlineRef.current;
    if (!obj || !outline) return;

    if (!visible) {
      outline.visible = false;
      return;
    }

    obj.updateWorldMatrix(true, true);
    boxRef.current.setFromObject(obj);

    if (boxRef.current.isEmpty()) {
      outline.visible = false;
      return;
    }

    tempExpandedBox.copy(boxRef.current).expandByScalar(pad);
    tempExpandedBox.getCenter(tempCenter);
    tempExpandedBox.getSize(tempSize);

    if (tempSize.lengthSq() === 0) {
      outline.visible = false;
      return;
    }

    outline.position.copy(tempCenter);
    outline.scale.copy(tempSize);
    outline.visible = true;
    outline.updateMatrixWorld(true);
  });

  return null;
}
