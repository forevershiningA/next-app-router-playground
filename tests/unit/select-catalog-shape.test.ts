import { describe, expect, it, vi } from 'vitest';
import type { ShapeData } from '#/lib/xml-parser';

const mock = vi.hoisted(() => {
  const state = {
    minWidthMm: 220,
    maxWidthMm: 220,
    minHeightMm: 100,
    maxHeightMm: 100,
    widthMm: 220,
    heightMm: 100,
    shapeUrl: '',
    setShapeUrl(url: string) {
      state.shapeUrl = url;
    },
    setWidthMm(value: number) {
      state.widthMm = Math.min(
        state.maxWidthMm,
        Math.max(state.minWidthMm, value),
      );
    },
    setHeightMm(value: number) {
      state.heightMm = Math.min(
        state.maxHeightMm,
        Math.max(state.minHeightMm, value),
      );
    },
  };
  return { state };
});
vi.mock('#/lib/headstone-store', () => ({
  useHeadstoneStore: {
    getState: () => mock.state,
    setState: (patch: object) => Object.assign(mock.state, patch),
  },
}));
import { selectCatalogShape } from '#/lib/select-catalog-shape';

describe('catalog shape selection', () => {
  it('applies the selected shape limits before setting its dimensions', () => {
    const shape = {
      table: {
        minWidth: 220,
        maxWidth: 220,
        initWidth: 220,
        minHeight: 220,
        maxHeight: 220,
        initHeight: 220,
      },
    } as ShapeData;
    selectCatalogShape(
      shape,
      '/shapes/headstones/pet_bowl_outline.svg?petRock=cat',
    );
    expect(mock.state).toMatchObject({
      widthMm: 220,
      heightMm: 220,
      minHeightMm: 220,
      maxHeightMm: 220,
    });
  });
});
