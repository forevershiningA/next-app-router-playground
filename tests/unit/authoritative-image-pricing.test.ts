import { describe, expect, it } from 'vitest';
import { calculateAuthoritativeImagePrice } from '#/lib/authoritative-image-pricing';
import type { ImagePricingMap } from '#/lib/image-pricing';
import type { SavedImage } from '#/lib/project-schemas';

const pricing: ImagePricingMap = {
  '7': {
    id: '7',
    code: 'Ceramic-Photo',
    name: 'Ceramic Image',
    type: 'image',
    priceModel: {
      code: 'Ceramic-Photo',
      name: 'Ceramic Image',
      quantityType: 'Width + Height',
      currency: 'AUD',
      prices: [
        {
          id: '1',
          nr: '1',
          name: 'Oval',
          code: 'Ceramic-Photo',
          model: '100+0($q-100)',
          startQuantity: 100,
          endQuantity: 100,
          retailMultiplier: 1,
          note: 'color',
        },
        {
          id: '2',
          nr: '2',
          name: 'Oval',
          code: 'Ceramic-Photo',
          model: '180+0($q-140)',
          startQuantity: 140,
          endQuantity: 140,
          retailMultiplier: 1,
          note: 'color',
        },
      ],
    },
  },
  '21': {
    id: '21',
    code: 'Granite-Image',
    name: 'Laser-etched Image',
    type: 'image',
    priceModel: {
      code: 'Granite Image',
      name: 'Granite Image',
      quantityType: 'Units',
      currency: 'AUD',
      prices: [],
    },
  },
};

function image(overrides: Partial<SavedImage> = {}): SavedImage {
  return {
    id: 'image-1',
    typeId: 7,
    typeName: 'Ceramic Image',
    imageUrl: 'https://example.test/image.jpg',
    widthMm: 9999,
    heightMm: 9999,
    xPos: 0,
    yPos: 0,
    rotationZ: 0,
    sizeVariant: 2,
    colorMode: 'full',
    ...overrides,
  };
}

describe('calculateAuthoritativeImagePrice', () => {
  it('uses the canonical server size instead of client dimensions', () => {
    expect(calculateAuthoritativeImagePrice([image()], pricing)).toBe(180);
  });

  it('adds multiple images and permits catalogued free image types', () => {
    expect(
      calculateAuthoritativeImagePrice(
        [
          image({ sizeVariant: 1 }),
          image({ typeId: 21, widthMm: 50, heightMm: 50 }),
        ],
        pricing,
      ),
    ).toBe(100);
  });

  it('rejects image types that are absent from trusted pricing data', () => {
    expect(() =>
      calculateAuthoritativeImagePrice([image({ typeId: 999 })], pricing),
    ).toThrow('Image type 999 is unavailable');
  });

  it('rejects out-of-range dimensions for flexible image types', () => {
    expect(() =>
      calculateAuthoritativeImagePrice(
        [image({ typeId: 21, widthMm: 10, heightMm: 50 })],
        pricing,
      ),
    ).toThrow('Invalid size for image type 21');
  });
});
