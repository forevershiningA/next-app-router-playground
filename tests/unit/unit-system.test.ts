import { describe, it, expect } from 'vitest';
import {
  resolveUnitSystemFromCountry,
  parseUnitSystemCookie,
  formatImperialFromMm,
  formatLengthFromMm,
  formatDimensionPair,
  formatDimensionTriplet,
} from '#/lib/unit-system';

describe('resolveUnitSystemFromCountry', () => {
  it('returns imperial for US', () => {
    expect(resolveUnitSystemFromCountry('US')).toBe('imperial');
  });

  it('returns imperial for LR (Liberia)', () => {
    expect(resolveUnitSystemFromCountry('LR')).toBe('imperial');
  });

  it('returns imperial for MM (Myanmar)', () => {
    expect(resolveUnitSystemFromCountry('MM')).toBe('imperial');
  });

  it('returns metric for AU', () => {
    expect(resolveUnitSystemFromCountry('AU')).toBe('metric');
  });

  it('returns metric for DE', () => {
    expect(resolveUnitSystemFromCountry('DE')).toBe('metric');
  });

  it('returns metric for null', () => {
    expect(resolveUnitSystemFromCountry(null)).toBe('metric');
  });

  it('returns metric for undefined', () => {
    expect(resolveUnitSystemFromCountry(undefined)).toBe('metric');
  });

  it('is case-insensitive', () => {
    expect(resolveUnitSystemFromCountry('us')).toBe('imperial');
    expect(resolveUnitSystemFromCountry('Us')).toBe('imperial');
  });

  it('handles leading/trailing whitespace', () => {
    expect(resolveUnitSystemFromCountry(' US ')).toBe('imperial');
  });
});

describe('parseUnitSystemCookie', () => {
  it('parses imperial cookie', () => {
    expect(parseUnitSystemCookie('unit_system=imperial')).toBe('imperial');
  });

  it('parses metric cookie', () => {
    expect(parseUnitSystemCookie('unit_system=metric')).toBe('metric');
  });

  it('parses cookie among multiple cookies', () => {
    expect(parseUnitSystemCookie('session=abc; unit_system=imperial; lang=en')).toBe('imperial');
  });

  it('returns null for missing cookie', () => {
    expect(parseUnitSystemCookie('session=abc; lang=en')).toBeNull();
  });

  it('returns null for null input', () => {
    expect(parseUnitSystemCookie(null)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(parseUnitSystemCookie('')).toBeNull();
  });

  it('is case-insensitive', () => {
    expect(parseUnitSystemCookie('unit_system=IMPERIAL')).toBe('imperial');
  });
});

describe('formatImperialFromMm', () => {
  it('formats whole inches', () => {
    expect(formatImperialFromMm(25.4)).toBe('1"');
    expect(formatImperialFromMm(50.8)).toBe('2"');
    expect(formatImperialFromMm(304.8)).toBe('12"');
  });

  it('formats fractional inches as reduced fractions', () => {
    // 25.4 / 2 = 12.7 mm = 0.5" = 1/2"
    expect(formatImperialFromMm(12.7)).toBe('1/2"');
    // 25.4 * 0.25 = 6.35 mm = 1/4"
    expect(formatImperialFromMm(6.35)).toBe('1/4"');
    // 25.4 * 0.75 = 19.05 mm = 3/4"
    expect(formatImperialFromMm(19.05)).toBe('3/4"');
  });

  it('formats mixed inches and fractions', () => {
    // 1.5" = 38.1 mm
    expect(formatImperialFromMm(38.1)).toBe('1 1/2"');
    // 2.25" = 57.15 mm
    expect(formatImperialFromMm(57.15)).toBe('2 1/4"');
  });

  it('handles zero and negative values as zero', () => {
    expect(formatImperialFromMm(0)).toBe('0"');
    expect(formatImperialFromMm(-10)).toBe('0"');
  });
});

describe('formatLengthFromMm', () => {
  it('formats as mm for metric', () => {
    expect(formatLengthFromMm(300, 'metric')).toBe('300 mm');
    expect(formatLengthFromMm(152.6, 'metric')).toBe('153 mm'); // rounds
  });

  it('formats as imperial for imperial', () => {
    expect(formatLengthFromMm(25.4, 'imperial')).toBe('1"');
    expect(formatLengthFromMm(304.8, 'imperial')).toBe('12"');
  });
});

describe('formatDimensionPair', () => {
  it('formats metric pair', () => {
    expect(formatDimensionPair(600, 900, 'metric')).toBe('600 × 900 mm');
  });

  it('formats imperial pair', () => {
    // 304.8 mm = 12", 457.2 mm = 18"
    expect(formatDimensionPair(304.8, 457.2, 'imperial')).toBe('12" × 18"');
  });
});

describe('formatDimensionTriplet', () => {
  it('formats metric triplet', () => {
    expect(formatDimensionTriplet(600, 900, 150, 'metric')).toBe('600 × 900 × 150 mm');
  });

  it('formats imperial triplet', () => {
    // 304.8 = 12", 457.2 = 18", 152.4 = 6"
    expect(formatDimensionTriplet(304.8, 457.2, 152.4, 'imperial')).toBe('12" × 18" × 6"');
  });
});
