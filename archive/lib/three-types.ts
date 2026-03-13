// lib/three-types.ts
// Proper TypeScript types for Three.js integration with React Three Fiber

import type { Camera, WebGLRenderer, Scene } from 'three';

export interface ThreeContextValue {
  camera: Camera;
  gl: WebGLRenderer;
  scene: Scene;
  controls?: any; // OrbitControls from drei
  raycaster?: any;
  pointer?: any;
  mouse?: any;
  clock?: any;
  size?: { width: number; height: number };
}

export type ThreeHookResult = Partial<ThreeContextValue>;
