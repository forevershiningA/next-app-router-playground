export type FontLike = {
  image: string;
};

export function getBrowserFontUrl(font: FontLike) {
  return `/fonts/${font.image}`;
}

export function getThreeTextFontUrl(font: FontLike) {
  const image = font.image;
  if (image.startsWith('stencil/') && image.endsWith('.woff2')) {
    return `/fonts/${image.replace(/\.woff2$/i, '.ttf')}`;
  }

  return getBrowserFontUrl(font);
}
