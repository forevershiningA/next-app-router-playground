
// components/three/SelectionBox.tsx

'use client';



import * as React from 'react';

import * as THREE from 'three';

import { useThree, useFrame } from '@react-three/fiber';



type SelectionBoxProps<T extends THREE.Object3D = THREE.Object3D> = {

  targetRef: React.RefObject<T> | React.MutableRefObject<T | null>;

  visible?: boolean;

  color?: string | number;

  pad?: number;

  through?: boolean;

  renderOrder?: number;

  lineLength?: number;

};



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



const tempBox = new THREE.Box3();

const tempExpandedBox = new THREE.Box3();

const tempCenter = new THREE.Vector3();

const tempSize = new THREE.Vector3();



function createCornerGeometry(lineLength: number) {

  const positions: number[] = [];

  const halfSize = 0.5;

  const arm = THREE.MathUtils.clamp(lineLength, 0, 0.5);



  const pushLine = (x1: number, y1: number, z1: number, x2: number, y2: number, z2: number) => {

    positions.push(x1, y1, z1, x2, y2, z2);

  };



  CORNER_SIGNS.forEach(({ sx, sy, sz }) => {

    const baseX = sx * halfSize;

    const baseY = sy * halfSize;

    const baseZ = sz * halfSize;



    if (arm > 0) {

      pushLine(baseX, baseY, baseZ, baseX - sx * arm, baseY, baseZ);

      pushLine(baseX, baseY, baseZ, baseX, baseY - sy * arm, baseZ);

      pushLine(baseX, baseY, baseZ, baseX, baseY, baseZ - sz * arm);

    }

  });



  const geometry = new THREE.BufferGeometry();

  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

  return geometry;

}



export default function SelectionBox<T extends THREE.Object3D = THREE.Object3D>({

  targetRef,

  visible = true,

  color = 'white',

  pad = 0.01,

  through = true,

  renderOrder = 1000,

  lineLength = 0.18,

}: SelectionBoxProps) {

  const { scene } = useThree();

  const outlineRef = React.useRef<THREE.LineSegments | null>(null);

  const boxRef = React.useRef(new THREE.Box3());

  const [targetReady, setTargetReady] = React.useState(false);



  React.useEffect(() => {

    if (targetRef.current && !targetReady) {

      setTargetReady(true);

    }

  }, [targetRef, targetReady]);



  React.useEffect(() => {

    if (!targetReady) return;



    const geometry = createCornerGeometry(lineLength);

    const material = new THREE.LineBasicMaterial({

      color: new THREE.Color(color as any),

      depthTest: !through,

      depthWrite: false,

      transparent: true,

      opacity: 0.85,

      blending: THREE.AdditiveBlending,

      toneMapped: false,

    });



    const outline = new THREE.LineSegments(geometry, material);

    outline.renderOrder = renderOrder;

    outlineRef.current = outline;

    scene.add(outline);



    return () => {

      outline.geometry.dispose();

      (outline.material as THREE.Material).dispose();

      scene.remove(outline);

      outlineRef.current = null;

    };

  }, [scene, targetReady, color, through, renderOrder, lineLength]);



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

