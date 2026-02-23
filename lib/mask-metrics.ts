'use client';

export type MaskMetrics = {
  naturalWidth: number;
  naturalHeight: number;
  bounds: { left: number; top: number; width: number; height: number };
  normalizedBounds: { left: number; top: number; width: number; height: number };
  aspect: number;
};

const maskMetricsCache = new Map<string, Promise<MaskMetrics>>();

export function fetchMaskMetrics(maskUrl: string): Promise<MaskMetrics> {
  if (!maskUrl) {
    return Promise.reject(new Error('Mask URL is required'));
  }

  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Mask metrics can only be measured in the browser.'));
  }

  if (maskMetricsCache.has(maskUrl)) {
    return maskMetricsCache.get(maskUrl)!;
  }

  const promise = new Promise<MaskMetrics>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = maskUrl;

    img.onload = () => {
      const width = img.naturalWidth || img.width || 500;
      const height = img.naturalHeight || img.height || 500;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Failed to acquire canvas context for mask metrics.'));
        return;
      }

      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      const { data } = ctx.getImageData(0, 0, width, height);
      let minX = width;
      let minY = height;
      let maxX = -1;
      let maxY = -1;

      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          const alpha = data[(y * width + x) * 4 + 3];
          if (alpha > 5) {
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
          }
        }
      }

      if (maxX < minX || maxY < minY) {
        minX = 0;
        minY = 0;
        maxX = width - 1;
        maxY = height - 1;
      }

      const bounds = {
        left: minX,
        top: minY,
        width: maxX - minX + 1,
        height: maxY - minY + 1,
      };

      const normalizedBounds = {
        left: bounds.left / width,
        top: bounds.top / height,
        width: bounds.width / width,
        height: bounds.height / height,
      };

      resolve({
        naturalWidth: width,
        naturalHeight: height,
        bounds,
        normalizedBounds,
        aspect: bounds.width / bounds.height,
      });
    };

    img.onerror = (error) => {
      maskMetricsCache.delete(maskUrl);
      reject(error);
    };
  });

  maskMetricsCache.set(maskUrl, promise);
  return promise;
}
