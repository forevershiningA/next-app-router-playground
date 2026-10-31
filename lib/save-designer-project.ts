'use client';

import {
  BlankDesignerPreviewError,
  captureDesignerScreenshot,
} from './designer-screenshot';
import { calculateEstimatedDesignPricing } from './estimated-design-pricing';
import { useHeadstoneStore } from './headstone-store';
import { captureDesignSnapshot } from './project-serializer';
import type { ProjectSummary } from './project-schemas';
import {
  areDesignerAdditionsReady,
  areDesignerEmblemsReady,
  areDesignerImagesReady,
  areDesignerMotifsReady,
  areInscriptionGlyphsReady,
} from './designer-preview-ready';
import type { Object3D } from 'three';

async function waitForPreview() {
  const deadline = Date.now() + 15000;
  let previousSnapshot = '';
  let stableChecks = 0;
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    const snapshot = captureDesignSnapshot();
    const serialized = JSON.stringify(snapshot);
    const state = useHeadstoneStore.getState();
    const scene = (window as unknown as { __r3fScene?: Object3D }).__r3fScene;
    const ready =
      scene &&
      !state.loading &&
      !state.baseSwapping &&
      !state.fontLoading &&
      areDesignerAdditionsReady(
        scene,
        snapshot.selectedAdditions
          .map((id) => ({
            id,
            surface: snapshot.additionOffsets[id]?.targetSurface ?? 'headstone',
          }))
          .filter(
            ({ surface }) =>
              surface === 'headstone' ||
              (surface === 'base' && snapshot.showBase) ||
              (surface === 'ledger' && snapshot.showLedger),
          ),
      ) &&
      areDesignerEmblemsReady(
        scene,
        (snapshot.selectedEmblems ?? [])
          .map((emblem) => ({
            ...emblem,
            surface: snapshot.emblemOffsets?.[emblem.id]?.target ?? 'headstone',
          }))
          .filter(
            ({ surface }) =>
              surface === 'headstone' ||
              (surface === 'base' && snapshot.showBase) ||
              (surface === 'ledger' && snapshot.showLedger),
          ),
      ) &&
      areDesignerMotifsReady(
        scene,
        snapshot.selectedMotifs
          .map((motif) => ({
            ...motif,
            surface: snapshot.motifOffsets[motif.id]?.target ?? 'headstone',
          }))
          .filter(
            ({ surface }) =>
              surface === 'headstone' ||
              (surface === 'base' && snapshot.showBase) ||
              (surface === 'ledger' && snapshot.showLedger),
          ),
      ) &&
      areDesignerImagesReady(
        scene,
        snapshot.selectedImages.filter((image) => {
          const target = image.target ?? 'headstone';
          return (
            target === 'headstone' ||
            (target === 'base' && snapshot.showBase) ||
            (target === 'ledger' && snapshot.showLedger)
          );
        }),
      ) &&
      areInscriptionGlyphsReady(
        scene,
        snapshot.inscriptions,
        window.location.href,
      );
    stableChecks = ready
      ? serialized === previousSnapshot
        ? stableChecks + 1
        : 1
      : 0;
    previousSnapshot = serialized;
    if (stableChecks >= 2) {
      try {
        const screenshot = captureDesignerScreenshot(true);
        if (!screenshot)
          throw new Error(
            'Could not capture your preview. Please try saving again.',
          );
        return { snapshot, screenshot };
      } catch (error) {
        // A newly mounted scene can finish its glyphs before AutoFit frames
        // the product. Keep the scene mounted and wait for that first frame.
        if (!(error instanceof BlankDesignerPreviewError)) throw error;
      }
    }
  }
  throw new Error(
    'The preview is still updating. Wait for all design elements to appear, then try again.',
  );
}

export type SaveDesignerProjectResult = { project: ProjectSummary };

export class SaveDesignerProjectError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'SaveDesignerProjectError';
  }
}

function parseResponseBody(
  raw: string,
  status: number,
): Record<string, unknown> {
  try {
    return raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
  } catch {
    const compact = raw
      .replace(/<[^>]*>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 180);
    return {
      message: compact
        ? `Save API returned ${status}: ${compact}`
        : `Unexpected ${status} response from save API`,
    };
  }
}

export async function prepareDesignerPreview() {
  const initialState = useHeadstoneStore.getState();
  initialState.setScreenshotMode(true);

  let screenshot: string | null = null;
  let snapshot: ReturnType<typeof captureDesignSnapshot>;
  let estimatedPricing: ReturnType<typeof calculateEstimatedDesignPricing>;
  try {
    ({ snapshot, screenshot } = await waitForPreview());
    estimatedPricing = calculateEstimatedDesignPricing(
      useHeadstoneStore.getState(),
    );
    if (JSON.stringify(captureDesignSnapshot()) !== JSON.stringify(snapshot)) {
      throw new Error(
        'Your design or price changed while preparing the preview. Please save again.',
      );
    }
  } finally {
    useHeadstoneStore.getState().setScreenshotMode(false);
  }

  return { snapshot, screenshot, estimatedPricing };
}

export async function saveDesignerProject(
  title: string,
  expectedSnapshot?: string,
): Promise<SaveDesignerProjectResult> {
  const { snapshot, screenshot, estimatedPricing } =
    await prepareDesignerPreview();

  if (
    expectedSnapshot !== undefined &&
    JSON.stringify(snapshot) !== expectedSnapshot
  ) {
    throw new Error('REVISION_CONFLICT');
  }

  const designState = {
    ...snapshot,
    metadata: { ...snapshot.metadata, screenshot },
  };

  const response = await fetch('/api/projects', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title,
      designState,
      status: 'draft',
      totalPriceCents: estimatedPricing.totalCents,
      currency: estimatedPricing.currency,
      pricingBreakdown: estimatedPricing.breakdown,
    }),
  });
  const result = parseResponseBody(await response.text(), response.status);

  if (!response.ok) {
    throw new SaveDesignerProjectError(
      typeof result.message === 'string'
        ? result.message
        : 'Failed to save design',
      response.status,
    );
  }

  const project = result.project as ProjectSummary | undefined;
  if (!project?.id) {
    throw new SaveDesignerProjectError(
      'Save API returned an invalid project',
      response.status,
    );
  }
  return { project };
}
