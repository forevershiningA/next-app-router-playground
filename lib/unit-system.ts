export type UnitSystem = 'metric' | 'imperial';

const US_STYLE_COUNTRIES = new Set(['US', 'LR', 'MM']);

export function resolveUnitSystemFromCountry(countryCode: string | null | undefined): UnitSystem {
  if (!countryCode) return 'metric';
  const normalized = countryCode.trim().toUpperCase();
  return US_STYLE_COUNTRIES.has(normalized) ? 'imperial' : 'metric';
}

export function parseUnitSystemCookie(cookieHeader: string | null | undefined): UnitSystem | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)unit_system=(metric|imperial)(?:;|$)/i);
  if (!match) return null;
  return match[1].toLowerCase() === 'imperial' ? 'imperial' : 'metric';
}

export function formatImperialFromMm(mm: number): string {
  const inches = Math.max(0, mm) / 25.4;
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

  return whole > 0
    ? `${whole} ${numerator}/${denominator}"`
    : `${numerator}/${denominator}"`;
}

export function formatLengthFromMm(mm: number, unitSystem: UnitSystem): string {
  if (unitSystem === 'imperial') {
    return formatImperialFromMm(mm);
  }
  return `${Math.round(mm)} mm`;
}

export function formatDimensionPair(
  widthMm: number,
  heightMm: number,
  unitSystem: UnitSystem,
): string {
  if (unitSystem === 'imperial') {
    return `${formatImperialFromMm(widthMm)} × ${formatImperialFromMm(heightMm)}`;
  }
  return `${Math.round(widthMm)} × ${Math.round(heightMm)} mm`;
}

export function formatDimensionTriplet(
  widthMm: number,
  heightMm: number,
  depthMm: number,
  unitSystem: UnitSystem,
): string {
  if (unitSystem === 'imperial') {
    return `${formatImperialFromMm(widthMm)} × ${formatImperialFromMm(heightMm)} × ${formatImperialFromMm(depthMm)}`;
  }
  return `${Math.round(widthMm)} × ${Math.round(heightMm)} × ${Math.round(depthMm)} mm`;
}
