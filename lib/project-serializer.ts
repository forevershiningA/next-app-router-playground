'use client';

import { createRef } from 'react';
import type { Group } from 'three';
import { useHeadstoneStore, type Line } from '#/lib/headstone-store';
import type { DesignerSnapshot } from '#/lib/project-schemas';

export const SNAPSHOT_VERSION = 1;

const cloneRecord = <T extends object>(record: Record<string, T>) =>
  Object.fromEntries(Object.entries(record || {}).map(([key, value]) => [key, { ...value } as T]));

const cloneArray = <T extends object>(items: T[] = []) => items.map((item) => ({ ...item }));

const serializeInscriptions = (inscriptions: Line[]) =>
  inscriptions.map(({ ref, ...rest }) => ({ ...rest }));

const hydrateInscriptions = (inscriptions: DesignerSnapshot['inscriptions']): Line[] =>
  inscriptions.map((line) => ({
    ...line,
    ref: createRef<Group>(),
  }));

export function captureDesignSnapshot(): DesignerSnapshot {
  const state = useHeadstoneStore.getState();

  return {
    version: SNAPSHOT_VERSION,
    productId: state.productId ?? null,
    shapeUrl: state.shapeUrl ?? null,
    borderName: state.borderName ?? null,
    materialUrl: state.materialUrl ?? null,
    headstoneMaterialUrl: state.headstoneMaterialUrl ?? null,
    baseMaterialUrl: state.baseMaterialUrl ?? null,
    widthMm: state.widthMm,
    heightMm: state.heightMm,
    baseWidthMm: state.baseWidthMm,
    baseHeightMm: state.baseHeightMm,
    baseThickness: state.baseThickness,
    baseFinish: state.baseFinish,
    headstoneStyle: state.headstoneStyle,
    uprightThickness: state.uprightThickness,
    slantThickness: state.slantThickness,
    showBase: state.showBase,
    selectedAdditions: [...state.selectedAdditions],
    additionOffsets: cloneRecord(state.additionOffsets),
    selectedMotifs: cloneArray(state.selectedMotifs),
    motifOffsets: cloneRecord(state.motifOffsets),
    selectedImages: cloneArray(state.selectedImages),
    inscriptions: serializeInscriptions(state.inscriptions),
    metadata: {
      currentProjectId: state.currentProjectId ?? null,
      currentProjectTitle: state.currentProjectTitle ?? null,
    },
  };
}

export async function applyDesignSnapshot(snapshot: DesignerSnapshot) {
  const store = useHeadstoneStore.getState();

  if (snapshot.productId && store.productId !== snapshot.productId) {
    try {
      await store.setProductId(snapshot.productId);
    } catch (error) {
      console.warn('[project-serializer] Failed to load product catalog for project', error);
    }
  }

  const hydratedInscriptions = hydrateInscriptions(snapshot.inscriptions ?? []);

  useHeadstoneStore.setState({
    shapeUrl: snapshot.shapeUrl ?? null,
    borderName: snapshot.borderName ?? null,
    materialUrl: snapshot.materialUrl ?? store.materialUrl,
    headstoneMaterialUrl: snapshot.headstoneMaterialUrl ?? store.headstoneMaterialUrl,
    baseMaterialUrl: snapshot.baseMaterialUrl ?? store.baseMaterialUrl,
    widthMm: snapshot.widthMm ?? store.widthMm,
    heightMm: snapshot.heightMm ?? store.heightMm,
    baseWidthMm: snapshot.baseWidthMm ?? store.baseWidthMm,
    baseHeightMm: snapshot.baseHeightMm ?? store.baseHeightMm,
    baseThickness: snapshot.baseThickness ?? store.baseThickness,
    baseFinish: snapshot.baseFinish ?? store.baseFinish,
    headstoneStyle: snapshot.headstoneStyle ?? store.headstoneStyle,
    uprightThickness: snapshot.uprightThickness ?? store.uprightThickness,
    slantThickness: snapshot.slantThickness ?? store.slantThickness,
    showBase: snapshot.showBase ?? store.showBase,
    selectedAdditions: snapshot.selectedAdditions ?? [],
    additionOffsets: snapshot.additionOffsets ?? {},
    selectedMotifs: snapshot.selectedMotifs ?? [],
    motifOffsets: snapshot.motifOffsets ?? {},
    selectedImages: snapshot.selectedImages ?? [],
    inscriptions: hydratedInscriptions,
    currentProjectId: snapshot.metadata?.currentProjectId ?? null,
    currentProjectTitle: snapshot.metadata?.currentProjectTitle ?? null,
  });
}
