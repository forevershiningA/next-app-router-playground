'use client';
import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Generate a simple noise texture to replace iChannel0
function generateNoiseTexture() {
  const size = 64;
  const data = new Uint8Array(size * size * 4);
  
  for (let i = 0; i < size * size; i++) {
    const stride = i * 4;
    const value = Math.floor(Math.random() * 255);
    data[stride] = value;
    data[stride + 1] = value;
    data[stride + 2] = value;
    data[stride + 3] = 255;
  }
  
  const texture = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  texture.needsUpdate = true;
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  
  return texture;
}

const vertexShader = `
  varying vec3 vWorldPosition;
  
  void main() {
    vec4 worldPosition = vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    gl_Position.z = gl_Position.w; // Set z to w to ensure it's always at far plane
  }
`;

const fragmentShader = `
  uniform float iTime;
  uniform sampler2D iChannel0;
  
  varying vec3 vWorldPosition;
  
  float random(in vec2 uv) {
    return texture2D(iChannel0, uv / 64.0).r;
  }
  
  float noise(in vec2 uv) {
    vec2 i = floor(uv);
    vec2 f = fract(uv);
    f = f * f * (3.0 - 2.0 * f);
    
    float lb = random(i + vec2(0.0, 0.0));
    float rb = random(i + vec2(1.0, 0.0));
    float lt = random(i + vec2(0.0, 1.0));
    float rt = random(i + vec2(1.0, 1.0));
    
    return mix(mix(lb, rb, f.x), 
               mix(lt, rt, f.x), f.y);
  }
  
  #define OCTAVES 8
  float fbm(in vec2 uv) {
    float value = 0.0;
    float amplitude = 0.5;
    
    for (int i = 0; i < OCTAVES; i++) {
      value += noise(uv) * amplitude;
      amplitude *= 0.5;
      uv *= 2.0;
    }
    
    return value;
  }
  
  vec3 Sky(in vec3 rd) {
    vec3 lightDir = normalize(vec3(-0.8, 0.15, -0.3));
    float sundot = clamp(dot(rd, lightDir), 0.0, 1.0);
    
    vec3 cloudCol = vec3(1.0);
    vec3 skyCol = vec3(0.3, 0.5, 0.85) - rd.y * rd.y * 0.5;
    skyCol = mix(skyCol, 0.85 * vec3(0.7, 0.75, 0.85), pow(1.0 - max(rd.y, 0.0), 4.0));
    
    // sun
    vec3 sun = 0.25 * vec3(1.0, 0.7, 0.4) * pow(sundot, 5.0);
    sun += 0.25 * vec3(1.0, 0.8, 0.6) * pow(sundot, 64.0);
    sun += 0.2 * vec3(1.0, 0.8, 0.6) * pow(sundot, 512.0);
    skyCol += sun;
    
    // clouds - only render for upward directions
    if (rd.y > 0.0) {
      const float SC = 1e5;
      float dist = (SC) / rd.y; 
      vec2 p = (dist * rd).xz;
      p *= 1.2 / SC;
      
      float t = iTime * 0.1;
      float den = fbm(vec2(p.x - t, p.y - t));
      skyCol = mix(skyCol, cloudCol, smoothstep(0.4, 0.8, den));
    }
    
    // Green ground color for bottom (when looking down)
    vec3 groundCol = vec3(0.647, 0.788, 0.251); // #A5C940
    
    // horizon color - slightly darker version of the same green
    vec3 horizonCol = vec3(0.58, 0.71, 0.22); // Darker #A5C940
    
    // Adjust horizon to 55% sky / 45% ground
    // Shift horizon point to -0.1
    float horizonPoint = -0.1;
    float adjustedY = rd.y - horizonPoint;
    float horizonBlend = smoothstep(-0.1, 0.1, adjustedY);
    vec3 baseColor = mix(groundCol, skyCol, horizonBlend);
    
    // Add horizon color at the transition
    float horizonMask = 1.0 - abs(adjustedY);
    horizonMask = pow(horizonMask, 8.0);
    baseColor = mix(baseColor, horizonCol, horizonMask * 0.5);
    
    return baseColor;
  }
  
  void main() {
    // Use normalized world position as direction (skybox technique)
    vec3 rd = normalize(vWorldPosition);
    
    vec3 col = Sky(rd);
    
    gl_FragColor = vec4(col, 1.0);
  }
`;

export default function SkyShader() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  const uniforms = useMemo(
    () => ({
      iTime: { value: 0 },
      iChannel0: { value: generateNoiseTexture() },
    }),
    []
  );
  
  useFrame((state) => {
    uniforms.iTime.value = state.clock.elapsedTime;
  });
  
  return (
    <mesh ref={meshRef} scale={[450000, 450000, 450000]}>
      <boxGeometry args={[1, 1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  );
}
