'use client';
import * as THREE from 'three';
import React, {
  useRef,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import { useHeadstoneStore } from '#/lib/headstone-store';
import {
  TEX_BASE,
  DEFAULT_TEX,
  BASE_WIDTH_MULTIPLIER,
  BASE_DEPTH_MULTIPLIER,
  BASE_MIN_WIDTH,
  BASE_MIN_DEPTH,
  LERP_FACTOR,
  EPSILON,
} from '#/lib/headstone-constants';

type HeadstoneBaseAutoProps = {
  headstoneObject: React.RefObject<THREE.Object3D>;
  wrapper: React.RefObject<THREE.Object3D>;
  onClick?: (e: any) => void;
  height?: number;
  name?: string;
};

function PreloadTexture({
  url,
  onReady,
}: {
  url: string;
  onReady?: () => void;
}) {
  useTexture(url);
  React.useEffect(() => {
    const id = requestAnimationFrame(() => onReady?.());
    return () => cancelAnimationFrame(id);
  }, [onReady]);
  return null;
}

const HeadstoneBaseAuto = forwardRef<THREE.Mesh, HeadstoneBaseAutoProps>(
  ({ headstoneObject, wrapper, onClick, height = 0.1, name }, ref) => {
    const baseRef = useRef<THREE.Mesh>(null);
    useImperativeHandle(ref, () => baseRef.current!);

    const baseMaterialUrl = useHeadstoneStore((s) => s.baseMaterialUrl);
    const setBaseSwapping = useHeadstoneStore((s) => s.setBaseSwapping);

    const requestedBaseTex = React.useMemo(() => {
      const file = baseMaterialUrl?.split('/').pop() ?? DEFAULT_TEX;
      const jpg = file.replace(/\.(png|webp|jpeg)$/i, '.jpg');
      return TEX_BASE + jpg;
    }, [baseMaterialUrl]);

    const [visibleBaseTex, setVisibleBaseTex] =
      React.useState(requestedBaseTex);

    const baseSwapping = requestedBaseTex !== visibleBaseTex;

    React.useEffect(() => {
      setBaseSwapping(baseSwapping);
    }, [baseSwapping, setBaseSwapping]);

    const baseTexture = useTexture(visibleBaseTex);

    const hasTx = useRef(false);
    const targetPos = useRef(new THREE.Vector3());
    const targetScale = useRef(new THREE.Vector3(1, height, 1));

    useFrame(() => {
      const t = headstoneObject.current;
      const w = wrapper.current;
      const b = baseRef.current;
      if (!t || !w || !b) return;

      // Update bounding box and target dimensions
      t.updateWorldMatrix(true, true);
      const bb = new THREE.Box3().setFromObject(t);

      if (!bb.isEmpty()) {
        const { min, max } = bb;
        const hsW = Math.max(max.x - min.x, 1e-6);
        const hsD = Math.max(max.z - min.z, 1e-6);
        const baseW = Math.max(hsW * BASE_WIDTH_MULTIPLIER, BASE_MIN_WIDTH);
        const baseD = Math.max(hsD * BASE_DEPTH_MULTIPLIER, BASE_MIN_DEPTH);

        const centerW = new THREE.Vector3(
          (min.x + max.x) / 2,
          min.y - height * 0.5 + EPSILON,
          min.z + baseD * 0.5
        );

        w.updateWorldMatrix(true, false);
        const inv = new THREE.Matrix4().copy(w.matrixWorld).invert();
        const posLocal = centerW.applyMatrix4(inv);

        const s = new THREE.Vector3();
        w.getWorldScale(s);

        targetPos.current.copy(posLocal);
        targetScale.current.set(baseW / s.x, height / s.y, baseD / s.z);

        if (!hasTx.current) {
          b.position.copy(targetPos.current);
          b.scale.copy(targetScale.current);
          b.visible = true;
          hasTx.current = true;
        }
      }

      if (!hasTx.current) {
        b.visible = false;
        return;
      }

      // Conditionally update position and scale
      if (!baseSwapping) {
        b.position.lerp(targetPos.current, LERP_FACTOR);
        b.scale.lerp(targetScale.current, LERP_FACTOR);
      }

      b.visible = !baseSwapping;
    });

    return (
      <React.Fragment>
        <mesh
          ref={baseRef}
          name={name}
          onClick={onClick}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            map={baseTexture}
            metalness={0.1}
            roughness={0.55}
          />
        </mesh>

        {requestedBaseTex !== visibleBaseTex && (
          <PreloadTexture
            url={requestedBaseTex}
            onReady={() => {
              setVisibleBaseTex(requestedBaseTex);
            }}
          />
        )}
      </React.Fragment>
    );
  },
);

HeadstoneBaseAuto.displayName = 'HeadstoneBaseAuto';
export default HeadstoneBaseAuto;
