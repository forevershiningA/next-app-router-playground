// components/three/RotatingBoxOutline.tsx
'use client';

import * as React from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';

type RotatingBoxOutlineProps<T extends THREE.Object3D = THREE.Object3D> = {
  /** Object whose bounds should be outlined */
  targetRef: React.RefObject<T> | React.MutableRefObject<T | null>;
  /** Toggle outline visibility */
  visible?: boolean;
  /** Outline color */
  color?: string | number;
  /** Expand the box slightly to avoid z-fighting (width/height planes) */
  pad?: number;
  /** Optional override specifically for depth padding */
  depthPad?: number;
  /** Push only the front corners outward along the local Z axis */
  frontExtension?: number;
  /** If true, draw through objects (no depth test) */
  through?: boolean;
  /** Render order for the helper */
  renderOrder?: number;
  /** If true, exclude addition models from bounding box calculation */
  excludeAdditions?: boolean;
  /** Length of corner arms relative to box size (0 to 0.5) */
  lineLength?: number;
  /** Only render corners facing the active camera */
  frontFacingOnly?: boolean;
  /** Raise bottom corners upward along the local Y axis (world units) */
  bottomLift?: number;
  /** Animate corner arms when the outline first becomes visible */
  animateOnShow?: boolean;
  /** Duration of the show animation in milliseconds */
  animationDuration?: number;
};

const OUTLINE_ARM_COUNT = 16;
const OUTLINE_THICKNESS_RATIO = 0.004;
const OUTLINE_MIN_THICKNESS = 0.001;
const DESKTOP_OUTLINE_THICKNESS_RATIO = 0.0012;
const DESKTOP_OUTLINE_MIN_THICKNESS = 0.00035;
const MOBILE_BREAKPOINT_PX = 768;

type OutlineGroup = THREE.Group & {
  userData: {
    outlineGeometry?: THREE.BoxGeometry;
    outlineMaterial?: THREE.MeshBasicMaterial;
    outlineMeshes?: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial>[];
  };
};

function createOutlineGroup(
  color: string | number,
  through: boolean,
  renderOrder: number,
  clippingPlane: THREE.Plane | null,
) {
  const group = new THREE.Group() as OutlineGroup;
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  const material = new THREE.MeshBasicMaterial({
    color: new THREE.Color(color).getHex(),
    depthTest: !through,
    depthWrite: false,
    transparent: true,
    opacity: 1,
    toneMapped: false,
    clippingPlanes: clippingPlane ? [clippingPlane] : null,
    clipIntersection: false,
  });
  const meshes: THREE.Mesh<THREE.BoxGeometry, THREE.MeshBasicMaterial>[] = [];

  for (let index = 0; index < OUTLINE_ARM_COUNT; index++) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.renderOrder = renderOrder;
    mesh.frustumCulled = false;
    mesh.raycast = () => null;
    mesh.visible = false;
    group.add(mesh);
    meshes.push(mesh);
  }

  group.renderOrder = renderOrder;
  group.userData.outlineGeometry = geometry;
  group.userData.outlineMaterial = material;
  group.userData.outlineMeshes = meshes;

  return group;
}

/**
 * Bounding-box outline with viewfinder corners that rotates with the target object.
 * Uses small mesh arms instead of WebGL line width so thickness is stable and centered.
 */
export default function RotatingBoxOutline<T extends THREE.Object3D = THREE.Object3D>({
  targetRef,
  visible = true,
  color = 'white',
  pad = 0.004,
  depthPad,
  frontExtension = 0,
  through = true,
  renderOrder = 1000,
  excludeAdditions = false,
  lineLength = 0.15,
  frontFacingOnly = false,
  bottomLift = 0,
  animateOnShow = false,
  animationDuration = 420,
}: RotatingBoxOutlineProps) {
  const { gl, size } = useThree();
  const helperRef = React.useRef<OutlineGroup | null>(null);
  const depthPadding = depthPad ?? pad;
  const {
    localBox,
    childBox,
    inverseMatrix,
    relativeMatrix,
    localCenter,
    localSize,
    worldCenter,
    axisXVec,
    axisYVec,
    axisZVec,
    cameraDir,
    cornerTemp,
    endpointTemp,
  } = React.useMemo(() => ({
    localBox: new THREE.Box3(),
    childBox: new THREE.Box3(),
    inverseMatrix: new THREE.Matrix4(),
    relativeMatrix: new THREE.Matrix4(),
    localCenter: new THREE.Vector3(),
    localSize: new THREE.Vector3(),
    worldCenter: new THREE.Vector3(),
    axisXVec: new THREE.Vector3(),
    axisYVec: new THREE.Vector3(),
    axisZVec: new THREE.Vector3(),
    cameraDir: new THREE.Vector3(),
    cornerTemp: new THREE.Vector3(),
    endpointTemp: new THREE.Vector3(),
  }), []);
  const clippingPlaneRef = React.useRef(new THREE.Plane());
  const animationStartRef = React.useRef<number | null>(null);
  const animationProgressRef = React.useRef(animateOnShow ? 0 : 1);
  const prevVisibleRef = React.useRef(false);

  React.useEffect(() => {
    if (!frontFacingOnly) return;
    const prev = gl.localClippingEnabled;
    gl.localClippingEnabled = true;
    return () => {
      gl.localClippingEnabled = prev;
    };
  }, [gl, frontFacingOnly]);

  React.useEffect(() => {
    let rafId: number | null = null;

    const attachHelper = () => {
      const obj = targetRef.current;
      if (!obj) {
        rafId = requestAnimationFrame(attachHelper);
        return;
      }

      const helper = createOutlineGroup(
        color,
        through,
        renderOrder,
        frontFacingOnly ? clippingPlaneRef.current : null,
      );
      helperRef.current = helper;
      obj.add(helper);
    };

    attachHelper();

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      if (helperRef.current) {
        helperRef.current.parent?.remove(helperRef.current);
        helperRef.current.userData.outlineGeometry?.dispose();
        helperRef.current.userData.outlineMaterial?.dispose();
        helperRef.current = null;
      }
    };
  }, [targetRef, color, through, renderOrder, frontFacingOnly]);

  useFrame((state) => {
    const obj = targetRef.current;
    const helper = helperRef.current;
    const meshes = helper?.userData.outlineMeshes;

    if (!helper || !meshes || !obj || !visible) {
      if (helper) {
        helper.visible = false;
      }
      prevVisibleRef.current = false;
      animationStartRef.current = null;
      animationProgressRef.current = animateOnShow ? 0 : 1;
      return;
    }

    if (helper.parent !== obj) {
      obj.add(helper);
    }

    if (!prevVisibleRef.current) {
      animationStartRef.current = state.clock.elapsedTime;
    }

    if (animateOnShow) {
      const durationSec = Math.max(animationDuration / 1000, 1e-4);
      const startTime = animationStartRef.current ?? state.clock.elapsedTime;
      const elapsed = state.clock.elapsedTime - startTime;
      animationProgressRef.current = Math.min(1, elapsed / durationSec);
    } else {
      animationProgressRef.current = 1;
    }
    prevVisibleRef.current = true;

    const rawAnimProgress = animateOnShow ? animationProgressRef.current : 1;
    const easedProgress = rawAnimProgress >= 1 ? 1 : 1 - Math.pow(1 - rawAnimProgress, 3);
    const horizontalScale = animateOnShow
      ? Math.min(1, easedProgress * 1.35)
      : 1;
    const verticalScale = animateOnShow
      ? THREE.MathUtils.clamp((easedProgress - 0.2) / 0.8, 0, 1)
      : 1;

    const material = helper.userData.outlineMaterial;
    if (material) {
      const targetOpacity = animateOnShow ? 0.35 + 0.65 * easedProgress : 1;
      if (material.opacity !== targetOpacity) {
        material.opacity = targetOpacity;
      }
    }

    obj.updateWorldMatrix(true, true);
    helper.parent?.updateWorldMatrix(true, true);
    inverseMatrix.copy(obj.matrixWorld).invert();
    localBox.makeEmpty();

    obj.traverse((child) => {
      if (!(child instanceof THREE.Mesh) || !child.geometry || child.parent === helper) {
        return;
      }

      const parentName = child.parent?.name || '';
      const childName = child.name || '';
      const isAddition = parentName.startsWith('addition-') || childName.startsWith('addition-');
      const isText = child.geometry.type === 'TextGeometry' ||
        childName.includes('text') ||
        parentName.includes('text') ||
        child.userData?.isText;

      if (excludeAdditions && (isAddition || isText)) {
        return;
      }

      if (!child.geometry.boundingBox) {
        child.geometry.computeBoundingBox();
      }
      if (child.geometry.boundingBox) {
        relativeMatrix.multiplyMatrices(inverseMatrix, child.matrixWorld);
        childBox.copy(child.geometry.boundingBox);
        childBox.applyMatrix4(relativeMatrix);
        localBox.union(childBox);
      }
    });

    if (localBox.isEmpty()) {
      helper.visible = false;
      return;
    }

    localBox.getCenter(localCenter);
    localBox.getSize(localSize);

    if (localSize.lengthSq() === 0) {
      helper.visible = false;
      return;
    }

    helper.position.copy(localCenter);
    helper.rotation.set(0, 0, 0);
    helper.scale.set(1, 1, 1);
    helper.updateMatrixWorld();

    axisXVec.setFromMatrixColumn(obj.matrixWorld, 0);
    axisYVec.setFromMatrixColumn(obj.matrixWorld, 1);
    axisZVec.setFromMatrixColumn(obj.matrixWorld, 2);

    const axisXLength = axisXVec.length() || 1;
    const axisYLength = axisYVec.length() || 1;
    const axisZLength = axisZVec.length() || 1;

    const padXLocal = axisXLength !== 0 ? pad / axisXLength : pad;
    const padYLocal = axisYLength !== 0 ? pad / axisYLength : pad;
    const padZLocal = axisZLength !== 0 ? depthPadding / axisZLength : depthPadding;

    const halfWidthLocal = localSize.x / 2 + padXLocal;
    const halfHeightLocal = localSize.y / 2 + padYLocal;
    const halfDepthLocal = localSize.z / 2 + padZLocal;

    const lenXLocal = halfWidthLocal * 2 * lineLength;
    const lenYLocal = halfHeightLocal * 2 * lineLength;
    const isMobileViewport = size.width < MOBILE_BREAKPOINT_PX;
    const localThickness = Math.max(
      Math.min(halfWidthLocal, halfHeightLocal) * (
        isMobileViewport ? OUTLINE_THICKNESS_RATIO : DESKTOP_OUTLINE_THICKNESS_RATIO
      ),
      isMobileViewport ? OUTLINE_MIN_THICKNESS : DESKTOP_OUTLINE_MIN_THICKNESS,
    );

    const bottomLiftLocal = axisYLength !== 0 ? bottomLift / axisYLength : bottomLift;
    const frontExtensionLocal = axisZLength !== 0 ? frontExtension / axisZLength : frontExtension;

    worldCenter.copy(localCenter).applyMatrix4(obj.matrixWorld);

    cameraDir.copy(state.camera.position).sub(worldCenter);
    const cameraDistanceSq = cameraDir.lengthSq();
    if (cameraDistanceSq > 1e-9) {
      cameraDir.divideScalar(Math.sqrt(cameraDistanceSq));
    } else {
      cameraDir.set(0, 0, 1);
    }

    if (frontFacingOnly && material) {
      clippingPlaneRef.current.setFromNormalAndCoplanarPoint(cameraDir, worldCenter);
      clippingPlaneRef.current.constant += depthPadding;
      material.clippingPlanes = [clippingPlaneRef.current];
    }

    let meshIndex = 0;
    const setArm = (
      startLocal: THREE.Vector3,
      endLocal: THREE.Vector3,
      axis: 'x' | 'y',
    ) => {
      const mesh = meshes[meshIndex++];
      if (!mesh) return;

      endpointTemp.addVectors(startLocal, endLocal).multiplyScalar(0.5);
      mesh.position.copy(endpointTemp);
      if (axis === 'x') {
        mesh.scale.set(Math.abs(endLocal.x - startLocal.x), localThickness, localThickness);
      } else {
        mesh.scale.set(localThickness, Math.abs(endLocal.y - startLocal.y), localThickness);
      }
      mesh.visible = true;
    };

    const cornerSigns: [number, number, number][] = [
      [-1, -1, 1],
      [1, -1, 1],
      [-1, -1, -1],
      [1, -1, -1],
      [-1, 1, 1],
      [1, 1, 1],
      [-1, 1, -1],
      [1, 1, -1],
    ];

    cornerSigns.forEach(([sx, sy, sz]) => {
      cornerTemp.set(
        sx * halfWidthLocal,
        sy * halfHeightLocal,
        sz * halfDepthLocal,
      );

      if (sy < 0 && bottomLiftLocal !== 0) {
        cornerTemp.y += bottomLiftLocal;
      }

      if (frontExtensionLocal !== 0 && sz > 0) {
        cornerTemp.z += frontExtensionLocal;
      }

      if (horizontalScale > 0.0001) {
        endpointTemp.copy(cornerTemp);
        endpointTemp.x -= sx * lenXLocal * horizontalScale;
        setArm(cornerTemp, endpointTemp, 'x');
      }

      if (verticalScale > 0.0001) {
        endpointTemp.copy(cornerTemp);
        endpointTemp.y -= sy * lenYLocal * verticalScale;
        setArm(cornerTemp, endpointTemp, 'y');
      }
    });

    for (let index = meshIndex; index < meshes.length; index++) {
      meshes[index].visible = false;
    }

    helper.visible = meshIndex > 0;
  });

  return null;
}
