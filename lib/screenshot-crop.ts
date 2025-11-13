/**
 * Auto-crop screenshot utility
 * Analyzes screenshots for excessive white space and calculates optimal crop bounds
 */

export interface CropBounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
  croppedWidth: number;
  croppedHeight: number;
  whiteSpacePercentage: number;
  shouldCrop: boolean;
}

/**
 * Analyze image for white space and calculate crop bounds
 * @param imageUrl URL of the image to analyze
 * @param threshold Percentage of white space to trigger cropping (default: 30)
 * @returns Promise with crop bounds information
 */
export async function analyzeImageForCrop(
  imageUrl: string,
  threshold: number = 30
): Promise<CropBounds> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      
      // Define "white" as PURE white only (255, 255, 255)
      const isWhitePixel = (r: number, g: number, b: number) => {
        return r === 255 && g === 255 && b === 255;
      };
      
      // Check for white space specifically on LEFT and RIGHT edges
      // This prevents false positives from light backgrounds
      const edgeWidth = Math.floor(canvas.width * 0.15); // Check outer 15% on each side
      
      let leftEdgeWhitePixels = 0;
      let rightEdgeWhitePixels = 0;
      const edgePixelsPerSide = edgeWidth * canvas.height;
      
      // Check left edge
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < edgeWidth; x++) {
          const index = (y * canvas.width + x) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          
          if (isWhitePixel(r, g, b)) {
            leftEdgeWhitePixels++;
          }
        }
      }
      
      // Check right edge
      for (let y = 0; y < canvas.height; y++) {
        for (let x = canvas.width - edgeWidth; x < canvas.width; x++) {
          const index = (y * canvas.width + x) * 4;
          const r = data[index];
          const g = data[index + 1];
          const b = data[index + 2];
          
          if (isWhitePixel(r, g, b)) {
            rightEdgeWhitePixels++;
          }
        }
      }
      
      // Calculate white space percentage on edges
      const leftEdgeWhitePercentage = (leftEdgeWhitePixels / edgePixelsPerSide) * 100;
      const rightEdgeWhitePercentage = (rightEdgeWhitePixels / edgePixelsPerSide) * 100;
      const averageEdgeWhite = (leftEdgeWhitePercentage + rightEdgeWhitePercentage) / 2;
      
      // Only crop if BOTH edges have significant white space (> threshold)
      const shouldCrop = leftEdgeWhitePercentage > threshold && rightEdgeWhitePercentage > threshold;
      
      // Find bounds of non-white content (only if we're cropping)
      let minX = 0;
      let minY = 0;
      let maxX = canvas.width;
      let maxY = canvas.height;
      
      if (shouldCrop) {
        minX = canvas.width;
        minY = canvas.height;
        maxX = 0;
        maxY = 0;
        
        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const index = (y * canvas.width + x) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            
            if (!isWhitePixel(r, g, b)) {
              // Non-white pixel found
              if (x < minX) minX = x;
              if (x > maxX) maxX = x;
              if (y < minY) minY = y;
              if (y > maxY) maxY = y;
            }
          }
        }
      }
      
      // Calculate crop bounds with small padding (2% of image dimensions)
      const paddingX = Math.floor(canvas.width * 0.02);
      const paddingY = Math.floor(canvas.height * 0.02);
      
      const left = Math.max(0, minX - paddingX);
      const top = Math.max(0, minY - paddingY);
      const right = Math.min(canvas.width, maxX + paddingX);
      const bottom = Math.min(canvas.height, maxY + paddingY);
      
      const croppedWidth = right - left;
      const croppedHeight = bottom - top;
      
      console.log('Screenshot analysis (edge-based):', {
        original: { width: canvas.width, height: canvas.height },
        edgeAnalysis: {
          leftEdgeWhite: leftEdgeWhitePercentage.toFixed(2) + '%',
          rightEdgeWhite: rightEdgeWhitePercentage.toFixed(2) + '%',
          average: averageEdgeWhite.toFixed(2) + '%'
        },
        shouldCrop,
        threshold: threshold + '%',
        cropBounds: shouldCrop ? { left, top, right, bottom } : 'none',
        cropped: { width: croppedWidth, height: croppedHeight }
      });
      
      resolve({
        left,
        top,
        right,
        bottom,
        width: canvas.width,
        height: canvas.height,
        croppedWidth,
        croppedHeight,
        whiteSpacePercentage: averageEdgeWhite,
        shouldCrop
      });
    };
    
    img.onerror = () => {
      reject(new Error(`Failed to load image: ${imageUrl}`));
    };
    
    img.src = imageUrl;
  });
}

/**
 * Apply crop bounds to dimensions
 * Adjusts coordinates from original image space to cropped space
 */
export function applyCropToCoordinates(
  x: number,
  y: number,
  cropBounds: CropBounds
): { x: number; y: number } {
  if (!cropBounds.shouldCrop) {
    return { x, y };
  }
  
  return {
    x: x - cropBounds.left,
    y: y - cropBounds.top
  };
}

/**
 * Calculate scaling factors accounting for crop
 */
export function calculateCroppedScalingFactors(
  canvasWidth: number,
  canvasHeight: number,
  cropBounds: CropBounds,
  upscaleFactor: number = 1
) {
  const displayWidth = cropBounds.shouldCrop 
    ? cropBounds.croppedWidth * upscaleFactor 
    : cropBounds.width * upscaleFactor;
    
  const displayHeight = cropBounds.shouldCrop 
    ? cropBounds.croppedHeight * upscaleFactor 
    : cropBounds.height * upscaleFactor;
  
  const screenshotWidth = cropBounds.shouldCrop ? cropBounds.croppedWidth : cropBounds.width;
  const screenshotHeight = cropBounds.shouldCrop ? cropBounds.croppedHeight : cropBounds.height;
  
  const scaleX = (screenshotWidth / canvasWidth) * upscaleFactor;
  const scaleY = (screenshotHeight / canvasHeight) * upscaleFactor;
  
  return {
    scaleX,
    scaleY,
    displayWidth,
    displayHeight,
    upscaleFactor,
    offsetX: cropBounds.shouldCrop ? cropBounds.left : 0,
    offsetY: cropBounds.shouldCrop ? cropBounds.top : 0
  };
}
