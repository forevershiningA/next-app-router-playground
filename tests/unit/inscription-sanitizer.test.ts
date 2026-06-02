import { describe, it, expect } from 'vitest';
import {
  hashString,
  getGenderFromCategory,
  sanitizeInscription,
} from '#/lib/inscription-sanitizer';
import type { NameDatabase } from '#/lib/inscription-sanitizer';

// Minimal stub database for deterministic tests
function makeDb(overrides?: Partial<NameDatabase>): NameDatabase {
  return {
    firstNames: new Set(['JOHN', 'JANE', 'WILLIAM']),
    surnames: new Set(['SMITH', 'JONES', 'BROWN']),
    femaleNames: ['Jane', 'Mary'],
    maleNames: ['John', 'William'],
    firstNamesArray: ['Jane', 'John', 'William'],
    surnamesArray: ['Smith', 'Jones', 'Brown'],
    ...overrides,
  };
}

describe('hashString', () => {
  it('is deterministic for the same input', () => {
    expect(hashString('hello')).toBe(hashString('hello'));
  });

  it('returns different values for different inputs', () => {
    expect(hashString('hello')).not.toBe(hashString('world'));
  });

  it('returns a non-negative integer', () => {
    const h = hashString('test string');
    expect(h).toBeGreaterThanOrEqual(0);
    expect(Number.isInteger(h)).toBe(true);
  });

  it('handles empty string', () => {
    expect(hashString('')).toBe(0);
  });
});

describe('getGenderFromCategory', () => {
  it('detects female category', () => {
    expect(getGenderFromCategory('beloved-mother')).toBe('female');
    expect(getGenderFromCategory('grandmother')).toBe('female');
    expect(getGenderFromCategory('daughter')).toBe('female');
    expect(getGenderFromCategory('wife')).toBe('female');
    expect(getGenderFromCategory('sister')).toBe('female');
  });

  it('detects male category', () => {
    expect(getGenderFromCategory('loving-father')).toBe('male');
    expect(getGenderFromCategory('grandfather')).toBe('male');
    expect(getGenderFromCategory('son')).toBe('male');
    expect(getGenderFromCategory('husband')).toBe('male');
    expect(getGenderFromCategory('brother')).toBe('male');
  });

  it('returns neutral for unrecognised category', () => {
    expect(getGenderFromCategory('headstone')).toBe('neutral');
    expect(getGenderFromCategory('')).toBe('neutral');
    expect(getGenderFromCategory('memorial')).toBe('neutral');
  });

  it('is case-insensitive', () => {
    expect(getGenderFromCategory('MOTHER')).toBe('female');
    expect(getGenderFromCategory('FATHER')).toBe('male');
  });
});

describe('sanitizeInscription', () => {
  const db = makeDb();

  describe('preserved texts', () => {
    it('preserves common memorial phrases', () => {
      expect(sanitizeInscription('IN LOVING MEMORY', db, 'headstone')).toBe('IN LOVING MEMORY');
      expect(sanitizeInscription('REST IN PEACE', db, 'headstone')).toBe('REST IN PEACE');
      expect(sanitizeInscription('RIP', db, 'headstone')).toBe('RIP');
      expect(sanitizeInscription('BELOVED', db, 'headstone')).toBe('BELOVED');
    });

    it('preserves multi-word memorial phrases', () => {
      expect(
        sanitizeInscription('FOREVER IN OUR HEARTS', db, 'headstone'),
      ).toBe('FOREVER IN OUR HEARTS');
    });

    it('preserves quoted text', () => {
      const quoted = '"Forever in our hearts"';
      expect(sanitizeInscription(quoted, db, 'headstone')).toBe(quoted);
    });

    it('preserves date-only text', () => {
      expect(sanitizeInscription('1940 - 2020', db, 'headstone')).toBe('1940 - 2020');
      expect(sanitizeInscription('01/06/1990', db, 'headstone')).toBe('01/06/1990');
    });

    it('preserves sentences with common words', () => {
      const sentence = 'You are always in our hearts';
      expect(sanitizeInscription(sentence, db, 'headstone')).toBe(sentence);
    });
  });

  describe('name replacement', () => {
    it('replaces a known first name (single word, all caps)', () => {
      const result = sanitizeInscription('JOHN', db, 'headstone');
      // Should be replaced with a random all-caps first name from db
      expect(result).not.toBe('JOHN');
      expect(result).toMatch(/^[A-Z]+$/);
    });

    it('replaces a known surname (single word, all caps)', () => {
      const result = sanitizeInscription('SMITH', db, 'headstone');
      expect(result).not.toBe('SMITH');
    });

    it('replaces a full name (first + surname)', () => {
      const result = sanitizeInscription('JOHN SMITH', db, 'headstone');
      expect(result).not.toBe('JOHN SMITH');
    });

    it('replaces Title Case Name (pattern-only, no db)', () => {
      const result = sanitizeInscription('John Smith', null, 'headstone');
      expect(result).toBe('Name Surname');
    });

    it('replaces ALL CAPS two-word name (pattern-only)', () => {
      const result = sanitizeInscription('JOHN SMITH', null, 'headstone');
      expect(result).toBe('NAME SURNAME');
    });
  });

  describe('pattern-only mode (db = null)', () => {
    it('preserves short sentences', () => {
      const text = 'You are the sunshine';
      expect(sanitizeInscription(text, null, 'headstone')).toBe(text);
    });

    it('preserves memorial phrases', () => {
      expect(sanitizeInscription('BELOVED', null, 'headstone')).toBe('BELOVED');
    });
  });
});
