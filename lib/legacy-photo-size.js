// Shared by the browser bundle and the plain Node asset generator.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const imageSizes = require('./image-size-options.json');

/**
 * Fixed photo types use the catalog's Width + Height pricing quantity.
 * Laser image 21 uses a physical height and saved bitmap aspect ratio instead.
 * Fixed sizes require a unique match; ambiguous quantities remain unknown.
 * @param {unknown} size
 * @param {unknown} productId
 * @param {unknown} displayWidth
 * @param {unknown} displayHeight
 * @returns {{ width: number, height: number } | null}
 */
function resolveLegacyPhotoSize(size, productId, displayWidth, displayHeight) {
  if (typeof size === 'string') {
    const pair = size.trim().match(/^([\d.]+)\s*[x×]\s*([\d.]+)\s*(?:mm)?$/i);
    if (pair) {
      const width = Number(pair[1]),
        height = Number(pair[2]);
      return Number.isFinite(width) &&
        Number.isFinite(height) &&
        width > 0 &&
        height > 0
        ? { width, height }
        : null;
    }
  }
  if (typeof size !== 'number' && typeof size !== 'string') return null;
  const quantity = Number(size);
  if (!Number.isFinite(quantity) || quantity <= 0) return null;
  // Laser image 21 is a flexible image: size is its physical height, while
  // the saved bitmap bounds preserve its aspect ratio (not a ceramic variant).
  if (String(productId) === '21') {
    const width = Number(displayWidth),
      height = Number(displayHeight);
    return Number.isFinite(width) &&
      Number.isFinite(height) &&
      width > 0 &&
      height > 0
      ? { width: (quantity * width) / height, height: quantity }
      : null;
  }
  const matches = (imageSizes[String(productId)] ?? []).filter(
    ([width, height]) => Math.abs(width + height - quantity) < 1e-6,
  );
  return matches.length === 1
    ? { width: matches[0][0], height: matches[0][1] }
    : null;
}

module.exports = { resolveLegacyPhotoSize };
