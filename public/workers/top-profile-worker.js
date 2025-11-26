/**
 * Web Worker for SVG top profile analysis
 * Moves expensive pixel scanning off the main thread
 */

self.onmessage = async function(e) {
  const { svgText, initW, initH } = e.data;

  try {
    // Parse viewBox
    const vbMatch = svgText.match(/viewBox\s*=\s*"([\d.\s-]+)"/i);
    const [, vbStr] = vbMatch || [, `0 0 ${initW} ${initH}`];
    const [, , vbWStr, vbHStr] = vbStr.split(/\s+/);
    const vbW = parseFloat(vbWStr) || initW;
    const vbH = parseFloat(vbHStr) || initH;

    // Calculate scaling (same as main thread)
    const scale = Math.min(initW / vbW, initH / vbH);
    const drawW = vbW * scale;
    const drawH = vbH * scale;
    const offX = (initW - drawW) / 2;
    const offY = (initH - drawH) / 2;

    // Create offscreen canvas
    const canvas = new OffscreenCanvas(initW, initH);
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Failed to get 2D context');
    }

    // Load and draw SVG
    const blob = new Blob([svgText], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const img = await createImageBitmap(blob);
    
    ctx.clearRect(0, 0, initW, initH);
    ctx.drawImage(img, offX, offY, drawW, drawH);
    URL.revokeObjectURL(url);

    // Scan for top edge
    const topY = new Array(initW).fill(initH);
    const imgData = ctx.getImageData(0, 0, initW, initH).data;
    
    for (let x = 0; x < initW; x++) {
      for (let y = 0; y < initH; y++) {
        const a = imgData[(y * initW + x) * 4 + 3];
        if (a > 8) {
          topY[x] = Math.max(0, y - 1);
          break;
        }
      }
    }

    // Smooth topY (5-tap box blur)
    for (let i = 0; i < 2; i++) {
      const b = topY.slice();
      for (let x = 2; x < topY.length - 2; x++) {
        topY[x] = Math.round((b[x - 2] + b[x - 1] + b[x] + b[x + 1] + b[x + 2]) / 5);
      }
    }

    // Send result back
    self.postMessage({
      success: true,
      topY,
      offX,
      offY,
      drawW,
      drawH,
      scale,
    });
  } catch (error) {
    self.postMessage({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
