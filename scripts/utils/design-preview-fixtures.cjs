// Controlled demonstration content. Preserve word lengths, line breaks and
// punctuation; glyph widths can still differ, so text layout needs review.
const PORTRAIT_PATH = '/__design-preview-fixtures/portrait.png';
const { resolveLegacyPhotoSize } = require('../../lib/legacy-photo-size.js');
const PORTRAIT_SVG =
  '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="640" viewBox="0 0 512 640"><rect width="512" height="640" fill="#e8e4da"/><circle cx="256" cy="224" r="94" fill="#7c847c"/><path d="M64 640v-80a192 192 0 01384 0v80" fill="#7c847c"/></svg>';
function demonstrationText(value) {
  return String(value)
    .replace(/\p{L}+/gu, (word) =>
      'EXAMPLE'.repeat(Math.ceil(word.length / 7)).slice(0, word.length),
    )
    .replace(/\d+/g, (digits) =>
      '19402020'.repeat(Math.ceil(digits.length / 8)).slice(0, digits.length),
    );
}
function preparePreviewContent(payload) {
  if (payload.elements?.logos?.length)
    throw new Error('A reviewed demonstration logo is required');
  for (const inscription of payload.elements?.inscriptions ?? [])
    inscription.text = demonstrationText(inscription.text ?? '');
  for (const photo of payload.elements?.photos ?? [])
    photo.source = {
      url: PORTRAIT_PATH,
      item: PORTRAIT_PATH,
      src: PORTRAIT_PATH,
    };
  // ImageModel deliberately replaces legacy upload URLs with an edit glyph.
  // Use the same legacy geometry mapping with a canonical demonstration URL.
  if (!payload.elements.photos?.length) {
    payload.elements.photos = (payload.legacy?.raw ?? [])
      .filter((item) => item.type === 'Photo' || item.type === 'Picture')
      .map((item) => {
        const size = resolveLegacyPhotoSize(item.size, item.productid, item.width, item.height);
        return {
          id: `photo-${item.itemID ?? item.id ?? 0}`,
          typeId: typeof item.productid === 'number' ? item.productid : 7,
          typeName: 'Demonstration portrait',
          surface: `${String(item.part ?? 'headstone').toLowerCase()}/${String(item.side ?? 'front').toLowerCase()}`,
          position: {
            x_px: typeof item.x === 'number' ? item.x : 0,
            y_px: typeof item.y === 'number' ? item.y : 0,
          },
          width_mm: size?.width,
          height_mm: size?.height,
          rotation: {
            z_deg: typeof item.rotation === 'number' ? item.rotation : 0,
          },
          source: { url: PORTRAIT_PATH },
          mask: { shape: item.shape_url },
        };
      });
  }
  for (const item of payload.legacy?.raw ?? []) {
    if (item.type === 'Logo')
      throw new Error('A reviewed demonstration logo is required');
    for (const key of ['label', 'text'])
      if (typeof item[key] === 'string')
        item[key] = demonstrationText(item[key]);
    if (item.type === 'Photo' || item.type === 'Picture') {
      item.src = PORTRAIT_PATH;
      item.item = PORTRAIT_PATH;
      item.path = '';
      item.name = 'Demonstration portrait';
    }
  }
  delete payload.legacyRaw;
  return payload;
}
module.exports = { PORTRAIT_PATH, PORTRAIT_SVG, preparePreviewContent };
