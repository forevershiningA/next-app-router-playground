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
    captureWidth: 432,
    captureHeight: 768,
    mobile: true,
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

export function createVideoFilter(formatName, options = {}) {
  const format = VIDEO_FORMATS[formatName];
  if (!format) throw new Error(`Unknown video format: ${formatName}`);
  const { width, height, fps } = format;
  const fitFilter =
    `fps=${fps},scale=${width}:${height}:force_original_aspect_ratio=decrease,` +
    `pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=17130f`;
  if (!options.zoomPhases?.length) return fitFilter;

  const escapeExpression = (expression) => expression.replaceAll(',', '\\,');
  const phaseExpressions = options.zoomPhases.map(
    ({ start, inEnd, outStart, end }) => {
      const progress = `((on-${start})/(${inEnd}-${start}))`;
      const retreat = `((${end}-on)/(${end}-${outStart}))`;
      const easeIn = `(${progress}*${progress}*(3-2*${progress}))`;
      const easeOut = `(${retreat}*${retreat}*(3-2*${retreat}))`;
      return `if(lt(on,${start}),0,if(lt(on,${inEnd}),${easeIn},if(lt(on,${outStart}),1,if(lt(on,${end}),${easeOut},0))))`;
    },
  );
  const zoom = `1+0.42*(${phaseExpressions.join('+')})`;
  const previewPhase = phaseExpressions[1] ?? '0';
  const panX = `(iw-iw/zoom)*0.94*${previewPhase}`;
  return `${fitFilter},zoompan=z='${escapeExpression(zoom)}':x='${escapeExpression(panX)}':y='(ih-ih/zoom)/2':d=1:s=${width}x${height}:fps=${fps},setsar=1`;
}
