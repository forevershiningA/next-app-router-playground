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

    const TEX_BASE = '/textures/forever/l/';
    const DEFAULT_TEX = 'Imperial-Red.jpg';

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
    const LERP = 0.25;
    const EPS = 1e-3;

    useFrame(() => {
      const t = headstoneObject.current;
      const w = wrapper.current;
      const b = baseRef.current;
      if (!t || !w || !b) return;

      t.updateWorldMatrix(true, true);
      const bb = new THREE.Box3().setFromObject(t);

      if (!bb.isEmpty()) {
        const { min, max } = bb;
        const hsW = Math.max(max.x - min.x, 1e-6);
        const hsD = Math.max(max.z - min.z, 1e-6);
        const baseW = Math.max(hsW * 1.4, 0.05);
        const baseD = Math.max(hsD * 2.0, 0.05);

        const centerW = new THREE.Vector3(
          (min.x + max.x) / 2,
          min.y - height * 0.5 + EPS,
          min.z + baseD * 0.5,
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

      b.position.lerp(targetPos.current, LERP);
      b.scale.lerp(targetScale.current, LERP);
      b.visible = true;
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
