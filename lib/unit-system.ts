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
  return `${Math.ceil(inches - 1e-9)}"`;
}

/**
 * Converts a millimetre value to the whole-number value shown by designer
 * controls. Imperial controls intentionally use the same upward rounding as
 * the dimension labels, so the canvas never advertises a smaller size.
 */
export function displayLengthValueFromMm(mm: number, unitSystem: UnitSystem): number {
  if (unitSystem === 'imperial') {
    return Math.ceil(Math.max(0, mm) / 25.4 - 1e-9);
  }
  return Math.round(mm);
}

/** Converts a value entered in the active unit system back to millimetres. */
export function lengthValueToMm(value: number, unitSystem: UnitSystem): number {
  return unitSystem === 'imperial' ? value * 25.4 : value;
}

export function getLengthUnitLabel(unitSystem: UnitSystem): 'mm' | 'in' {
  return unitSystem === 'imperial' ? 'in' : 'mm';
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
