/** Exercises the shared save snapshot and the real restore function.
 * This file is excluded from the regular test suite.
 */
import { beforeEach, expect, it, vi } from 'vitest';

const mock = vi.hoisted(() => ({ store: {} as Record<string, any> }));
vi.mock('#/lib/headstone-store', () => ({
  useHeadstoneStore: {
    getState: () => mock.store,
    setState: (partial: Record<string, any>) => { Object.assign(mock.store, partial); },
  },
}));
import { applyDesignSnapshot, captureDesignSnapshot } from '#/lib/project-serializer';

beforeEach(() => {
  mock.store = {
    productId: 'test-product', baseWidthMm: 600, baseHeightMm: 100, baseThickness: 80,
    fixingType: 'flat-back', showLedger: true, ledgerWidthMm: 900,
    showKerbset: true, kerbWidthMm: 900, borderName: null,
    inscriptions: [], selectedMotifs: [], selectedEmblems: [], selectedImages: [],
    selectedAdditions: [], motifOffsets: {}, emblemOffsets: {}, additionOffsets: {},
  };
});

it('A08: shared nav save snapshot preserves ledger and kerb settings', async () => {
  Object.assign(mock.store, {
    baseWidthMm: 1100, baseHeightMm: 190, baseThickness: 150,
    fixingType: 'screws', borderName: 'Selected border', showLedger: false,
    ledgerWidthMm: 1300, showKerbset: false, kerbWidthMm: 1300,
    inscriptions: [], selectedMotifs: [], selectedEmblems: [], selectedImages: [],
    selectedAdditions: [], motifOffsets: {}, emblemOffsets: {}, additionOffsets: {},
  });
  const payload = captureDesignSnapshot();
  Object.assign(mock.store, { showLedger: true, ledgerWidthMm: 900, showKerbset: true, kerbWidthMm: 900 });
  await applyDesignSnapshot(payload);
  expect(mock.store.baseWidthMm).toBe(1100);
  expect(mock.store.baseThickness).toBe(150);
  expect(mock.store.fixingType).toBe('screws');
  expect(mock.store.borderName).toBe('Selected border');
  expect(mock.store.showLedger).toBe(false);
  expect(mock.store.ledgerWidthMm).toBe(1300);
  expect(mock.store.showKerbset).toBe(false);
  expect(mock.store.kerbWidthMm).toBe(1300);
});

it('A08: shared nav save snapshot preserves inscription placement fields', () => {
  Object.assign(mock.store, {
    selectedMotifs: [], selectedEmblems: [],
    inscriptions: [{ id: 'audit-text', text: 'Example', xPos: 100, yPos: 100,
      coordinateSpace: 'mm-center', textAlign: 'left', layer: 9 }],
  });
  const payload = captureDesignSnapshot();
  expect(payload.inscriptions[0]).toMatchObject({ text: 'Example', xPos: 100 });
  expect(payload.inscriptions[0]).toMatchObject({
    coordinateSpace: 'mm-center', textAlign: 'left', layer: 9,
  });
});
