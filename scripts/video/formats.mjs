export const VIDEO_FORMATS = Object.freeze({
  web: {
    width: 1280,
    height: 800,
    fps: 25,
    directory: '',
    suffix: '',
    webm: true,
  },
  landscape: {
    width: 1920,
    height: 1080,
    fps: 30,
    directory: 'social',
    suffix: '-landscape',
    webm: false,
  },
  vertical: {
    width: 1080,
    height: 1920,
    fps: 30,
    directory: 'social',
    suffix: '-vertical',
    webm: false,
  },
  square: {
    width: 1080,
    height: 1080,
    fps: 30,
    directory: 'social',
    suffix: '-square',
    webm: false,
  },
});

export function parseFormats(value, defaults = ['web']) {
  const requested = !value
    ? defaults
    : value === 'all'
      ? Object.keys(VIDEO_FORMATS)
      : value.split(',').map((format) => format.trim());
  const formats = [...new Set(requested.filter(Boolean))];
  const unknown = formats.filter((format) => !VIDEO_FORMATS[format]);
  if (unknown.length > 0) {
    throw new Error(
      `Unknown video format${unknown.length === 1 ? '' : 's'}: ${unknown.join(', ')}. ` +
        `Available formats: ${Object.keys(VIDEO_FORMATS).join(', ')}`,
    );
  }
  if (formats.length === 0) throw new Error('Select at least one video format');
  return formats;
}

export function createVideoFilter(formatName) {
  const format = VIDEO_FORMATS[formatName];
  if (!format) throw new Error(`Unknown video format: ${formatName}`);
  const { width, height, fps } = format;
  return (
    `fps=${fps},scale=${width}:${height}:force_original_aspect_ratio=decrease,` +
    `pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=17130f`
  );
}
