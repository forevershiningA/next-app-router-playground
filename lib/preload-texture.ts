'use client';

import * as THREE from 'three';

const promiseCache = new Map<string, Promise<void>>();
let loader: THREE.TextureLoader | null = null;

function getLoader() {
  if (typeof window === 'undefined') return null;
  if (!loader) {
    loader = new THREE.TextureLoader();
    loader.setCrossOrigin('anonymous');
  }
  return loader;
}

export function preloadSceneTexture(inputUrl: string): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (!inputUrl) return Promise.resolve();
  let url = inputUrl;
  if (!url.startsWith('/') && !url.startsWith('http')) {
    url = `/${url}`;
  }
  if (promiseCache.has(url)) {
    return promiseCache.get(url)!;
  }
  const textureLoader = getLoader();
  if (!textureLoader) return Promise.resolve();
  const promise = new Promise<void>((resolve) => {
    textureLoader.load(
      url,
      () => resolve(),
      undefined,
      (error) => {
        console.warn('[preloadSceneTexture] failed for', url, error);
        resolve();
      },
    );
  });
  promiseCache.set(url, promise);
  return promise;
}
