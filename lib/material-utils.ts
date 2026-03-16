const LEGACY_MATERIAL_FILENAME_MAP: Record<string, string> = {
  'Multicolour-Red.webp': 'Multicolour-red.webp',
  'Sapphire-Brown.webp': 'Saphire-Brown.webp',
  'Visage-Blue.webp': 'Vizage-Blue.webp',
};

const canonicalizeMaterialFilename = (filename: string) => {
  const normalizedExtension = filename.replace(/\.(jpe?g)$/i, '.webp');
  return LEGACY_MATERIAL_FILENAME_MAP[normalizedExtension] ?? normalizedExtension;
};

export const resolveMaterialAssetPath = (
  value: string | null | undefined,
  basePath: string,
) => {
  if (!value) return null;
  if (value.startsWith('http')) return value;

  const normalizedBase = basePath.endsWith('/') ? basePath : `${basePath}/`;
  const trimmedValue = value.trim();
  const filename = canonicalizeMaterialFilename(
    trimmedValue.split('/').pop() || trimmedValue,
  );

  if (
    trimmedValue.startsWith('/materials/') ||
    trimmedValue.startsWith('materials/')
  ) {
    return `${normalizedBase}${filename}`;
  }

  if (
    trimmedValue.startsWith('/textures/') ||
    trimmedValue.startsWith('textures/')
  ) {
    const segments = trimmedValue.replace(/^\/+/, '').split('/');
    segments[segments.length - 1] = filename;
    return `/${segments.join('/')}`;
  }

  if (trimmedValue.startsWith('/')) {
    return trimmedValue;
  }

  return `${normalizedBase}${filename}`;
};

export const getMaterialNameFromUrl = (url: string | null | undefined) => {
  if (!url) return 'Not selected';

  const filename = url.split('/').pop();
  if (!filename) return 'Not selected';

  return filename
    .replace(/\.(webp|png|jpe?g)$/i, '')
    .replace(/-/g, ' ');
};
