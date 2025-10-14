'use client';

import { useLoader } from '@react-three/fiber';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader';

export function useSvg(url: string, onLoad?: (data: any) => void) {
  return useLoader(SVGLoader, url, (loader) => {
    loader.setCrossOrigin('anonymous');
    if (onLoad) {
      loader.manager.onLoad = () => onLoad(loader);
    }
  });
}
