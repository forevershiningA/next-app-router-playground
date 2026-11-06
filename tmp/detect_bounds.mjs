import sharp from 'sharp';

async function analyze(file) {
  const image = sharp(file);
  const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
  const { width, height } = info;
  
  // Background in the 4 corners:
  // Sky at top: hue around purple/blue/pink
  // Lavender at bottom: dark purple/green
  console.log(`\n=== ${file} (${width}x${height}) ===`);
  
  function getPixel(x, y) {
    const idx = (y * width + x) * 3;
    return [data[idx], data[idx+1], data[idx+2]];
  }

  // Find approximate bounding box where pixel differs from background
  // Let's sample along horizontal lines from top to bottom
  let minY = height, maxY = 0, minX = width, maxX = 0;
  
  // Let's check rows at y = 100, 200, ..., 1100
  for (let y = 10; y < height - 10; y += 5) {
    let rowMinX = -1, rowMaxX = -1;
    for (let x = 10; x < width - 10; x += 5) {
      const [r, g, b] = getPixel(x, y);
      // In the background, green is relatively low compared to red/blue or it's sky/lavender
      // Let's check for APP_ID_5 bronze border or dark plaque surface:
      // Let's check gradient with neighboring pixels
      const [pr, pg, pb] = getPixel(x - 5, y);
      const diff = Math.abs(r - pr) + Math.abs(g - pg) + Math.abs(b - pb);
      if (diff > 50) {
        if (rowMinX === -1) rowMinX = x;
        rowMaxX = x;
      }
    }
    if (rowMinX !== -1) {
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      if (rowMinX < minX) minX = rowMinX;
      if (rowMaxX > maxX) maxX = rowMaxX;
    }
  }
  console.log(`Detected span: X: [${minX}, ${maxX}] (w=${maxX - minX}), Y: [${minY}, ${maxY}] (h=${maxY - minY})`);
}

async function main() {
  for (const f of ['APP_ID_5', 'APP_ID_30', 'APP_ID_32', 'APP_ID_34']) {
    await analyze(`public/webp/products/${f}-big.webp`);
  }
}
main();
