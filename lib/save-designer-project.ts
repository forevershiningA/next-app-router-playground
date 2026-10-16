'use client';

import { captureDesignerScreenshot } from './designer-screenshot';
import { calculateEstimatedDesignPricing } from './estimated-design-pricing';
import { useHeadstoneStore } from './headstone-store';
import { captureDesignSnapshot } from './project-serializer';
import type { ProjectSummary } from './project-schemas';

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

export async function saveDesignerProject(
  title: string,
): Promise<SaveDesignerProjectResult> {
  const initialState = useHeadstoneStore.getState();
  initialState.setScreenshotMode(true);

  await new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );

  let screenshot: string | null = null;
  try {
    screenshot = captureDesignerScreenshot();
  } catch (error) {
    console.warn('Failed to capture canvas screenshot:', error);
  } finally {
    useHeadstoneStore.getState().setScreenshotMode(false);
  }

  const state = useHeadstoneStore.getState();
  const estimatedPricing = calculateEstimatedDesignPricing(state);
  const snapshot = captureDesignSnapshot();
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
