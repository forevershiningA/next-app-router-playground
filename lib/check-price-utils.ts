import { getMaterialNameFromUrl } from '#/lib/material-utils';

export type ExpandableSection = 'inscriptions' | 'motifs' | 'images' | 'additions';

export const SECTION_DEFAULT_STATE: Record<ExpandableSection, boolean> = {
  inscriptions: true,
  motifs: true,
  images: true,
  additions: true,
};

const BRONZE_MATERIALS: Record<string, string> = {
  '01': 'Black',
  '02': 'Brown',
  '03': 'Casino Blue',
  '04': 'Dark Brown',
  '05': 'Dark Green',
  '06': 'Grey',
  '07': 'Holly Green',
  '08': 'Ice Blue',
  '09': 'Maroon',
  '10': 'Navy Blue',
  '11': 'Purple',
  '12': 'Red',
  '13': 'Sundance Pink',
  '14': 'Turquoise',
  '15': 'White',
};

export const getShapeNameFromUrl = (shapeUrl: string | null | undefined) => {
  if (!shapeUrl) return 'Unknown';
  const parts = shapeUrl.split('/');
  const filename = parts[parts.length - 1];
  return filename.replace('.svg', '').replace(/-/g, ' ');
};

export const getCheckPriceMaterialName = (url: string | null | undefined) => {
  if (!url) return 'Unknown';

  if (url.includes('phoenix')) {
    const match = url.match(/\/(\d+)\.(jpg|webp)$/);
    if (match) {
      const number = match[1];
      return BRONZE_MATERIALS[number] || `Bronze ${number}`;
    }
  }

  return getMaterialNameFromUrl(url);
};

export const formatMmAsImperial = (mm: number) => {
  const inches = mm / 25.4;
  const whole = Math.floor(inches);
  const fraction = inches - whole;
  const sixteenths = Math.round(fraction * 16);

  if (sixteenths === 0) return `${whole}"`;
  if (sixteenths === 16) return `${whole + 1}"`;

  let numerator = sixteenths;
  let denominator = 16;
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const divisor = gcd(numerator, denominator);
  numerator /= divisor;
  denominator /= divisor;

  return whole > 0 ? `${whole} ${numerator}/${denominator}"` : `${numerator}/${denominator}"`;
};
