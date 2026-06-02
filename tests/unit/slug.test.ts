import { describe, it, expect } from 'vitest';
import { toSlug } from '#/lib/slug';

describe('toSlug', () => {
  it('lowercases input', () => {
    expect(toSlug('Hello World')).toBe('hello-world');
  });

  it('replaces spaces with hyphens', () => {
    expect(toSlug('foo bar baz')).toBe('foo-bar-baz');
  });

  it('trims leading and trailing whitespace', () => {
    expect(toSlug('  hello  ')).toBe('hello');
  });

  it('removes punctuation', () => {
    expect(toSlug("It's a test!")).toBe('its-a-test');
  });

  it('preserves hyphens', () => {
    expect(toSlug('laser-etched headstone')).toBe('laser-etched-headstone');
  });

  it('preserves underscores', () => {
    expect(toSlug('my_slug')).toBe('my_slug');
  });

  it('collapses multiple spaces', () => {
    expect(toSlug('foo   bar')).toBe('foo-bar');
  });

  it('handles empty string', () => {
    expect(toSlug('')).toBe('');
  });

  it('handles product names with numbers', () => {
    expect(toSlug('Product 42')).toBe('product-42');
  });
});
