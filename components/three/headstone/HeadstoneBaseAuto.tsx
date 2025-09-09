"use client";
import * as THREE from "three";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Edges } from "@react-three/drei";

export default function HeadstoneBaseAuto({
  headstoneObject,
  wrapper,
  selected,
  onClick,
  height = 0.10,
}: {
  headstoneObject: React.RefObject<THREE.Object3D>;
  wrapper: React.RefObject<THREE.Object3D>;
  selected: boolean;
  onClick?: (e:any)=>void;
  height?: number;
}) {
  const baseRef = useRef<THREE.Mesh>(null);
  const hasTx = useRef(false);
  const targetPos = useRef(new THREE.Vector3());
  const targetScale = useRef(new THREE.Vector3(1, height, 1));
  const LERP = 0.25, EPS = 1e-3;

  useFrame(()=>{
    const t=headstoneObject.current, w=wrapper.current, b=baseRef.current;
    if(!t||!w||!b) return;
    t.updateWorldMatrix(true,true);
    const bb = new THREE.Box3().setFromObject(t);
    if(!bb.isEmpty()){
      const min=bb.min,max=bb.max;
      const hsW=Math.max(max.x-min.x,1e-6), hsD=Math.max(max.z-min.z,1e-6);
      const baseW=Math.max(hsW*1.4,0.05), baseD=Math.max(hsD*2.0,0.05);
      const centerW = new THREE.Vector3((min.x+max.x)/2, min.y - height*0.5 + EPS, min.z + baseD*0.5);
      w.updateWorldMatrix(true,false);
      const inv = new THREE.Matrix4().copy(w.matrixWorld).invert();
      const posLocal = centerW.applyMatrix4(inv);
      const s = new THREE.Vector3(); w.getWorldScale(s);
      targetPos.current.copy(posLocal);
      targetScale.current.set(baseW/s.x, height/s.y, baseD/s.z);
      if(!hasTx.current){ b.position.copy(targetPos.current); b.scale.copy(targetScale.current); b.visible=true; hasTx.current=true; }
    }
    if(!hasTx.current){ b!.visible=false; return; }
    b.position.lerp(targetPos.current, LERP);
    b.scale.lerp(targetScale.current, LERP);
    b.visible=true;
  });

  return (
    <mesh ref={baseRef} onClick={onClick} castShadow receiveShadow>
      <boxGeometry args={[1,1,1]} />
      <meshStandardMaterial color="#212529" metalness={0.1} roughness={0.55}/>
      {selected && <Edges threshold={15} scale={1.002} color="white" />}
    </mesh>
  );
}