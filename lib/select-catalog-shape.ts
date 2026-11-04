'use client';

import { useHeadstoneStore } from './headstone-store';
import type { ShapeData } from './xml-parser';

/** Select an urn or pet-rock shape using that shape's own size constraints. */
export function selectCatalogShape(shape: ShapeData, url: string) {
  const { table } = shape;
  const state = useHeadstoneStore.getState();
  state.setShapeUrl(url);
  useHeadstoneStore.setState({
    minWidthMm: table.minWidth,
    maxWidthMm: Math.max(table.minWidth, table.maxWidth),
    minHeightMm: table.minHeight,
    maxHeightMm: Math.max(table.minHeight, table.maxHeight),
  });
  state.setWidthMm(table.initWidth);
  state.setHeightMm(table.initHeight);
}
