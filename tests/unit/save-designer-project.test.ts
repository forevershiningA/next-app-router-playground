import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  ready: false,
  snapshot: {
    inscriptions: [] as { id: string; text: string }[],
    selectedImages: [] as {
      id: string;
      imageUrl: string;
      target?: 'headstone' | 'base' | 'ledger';
    }[],
    selectedMotifs: [] as { id: string; svgPath: string }[],
    selectedAdditions: [] as string[],
    additionOffsets: {} as Record<
      string,
      { targetSurface?: 'headstone' | 'base' | 'ledger' }
    >,
    selectedEmblems: [] as { id: string; imageUrl: string }[],
    emblemOffsets: {} as Record<
      string,
      { target?: 'headstone' | 'base' | 'ledger' }
    >,
    motifOffsets: {} as Record<
      string,
      { target?: 'headstone' | 'base' | 'ledger' }
    >,
    showBase: false,
    showLedger: false,
    metadata: {},
  },
  setScreenshotMode: vi.fn(),
  capture: vi.fn(() => 'data:image/jpeg;base64,preview'),
}));
vi.mock('#/lib/headstone-store', () => ({
  useHeadstoneStore: {
    getState: () => ({ setScreenshotMode: mocks.setScreenshotMode }),
  },
}));
vi.mock('#/lib/project-serializer', () => ({
  captureDesignSnapshot: () => structuredClone(mocks.snapshot),
}));
vi.mock('#/lib/designer-preview-ready', () => ({
  areInscriptionGlyphsReady: () => mocks.ready,
  areDesignerImagesReady: () => mocks.ready,
  areDesignerMotifsReady: () => mocks.ready,
  areDesignerAdditionsReady: () => mocks.ready,
  areDesignerEmblemsReady: () => mocks.ready,
}));
vi.mock('#/lib/designer-screenshot', () => ({
  captureDesignerScreenshot: mocks.capture,
  BlankDesignerPreviewError: class extends Error {},
}));
vi.mock('#/lib/estimated-design-pricing', () => ({
  calculateEstimatedDesignPricing: () => ({
    totalCents: 12345,
    currency: 'USD',
    breakdown: [],
  }),
}));
import { saveDesignerProject } from '#/lib/save-designer-project';

describe('save preview consistency', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mocks.ready = false;
    mocks.snapshot = {
      inscriptions: [],
      selectedImages: [],
      selectedMotifs: [],
      selectedAdditions: [],
      additionOffsets: {},
      selectedEmblems: [],
      emblemOffsets: {},
      motifOffsets: {},
      showBase: false,
      showLedger: false,
      metadata: {},
    };
    vi.stubGlobal('window', {
      __r3fScene: {},
      location: { href: 'https://example.com/' },
    });
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue({
          ok: true,
          status: 200,
          text: async () => JSON.stringify({ project: { id: 'test-project' } }),
        }),
    );
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('does not capture or POST until the renderer is ready', async () => {
    const saved = saveDesignerProject('Example');
    await vi.advanceTimersByTimeAsync(200);
    expect(mocks.capture).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
    mocks.ready = true;
    await vi.advanceTimersByTimeAsync(100);
    await expect(saved).resolves.toEqual({ project: { id: 'test-project' } });
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string);
    expect(body).toMatchObject({
      currency: 'USD',
      totalPriceCents: 12345,
      designState: {
        metadata: { screenshot: 'data:image/jpeg;base64,preview' },
      },
    });
    expect(mocks.capture).toHaveBeenCalledWith(true);
    expect(mocks.setScreenshotMode).toHaveBeenLastCalledWith(false);
  });
  it('waits for the latest stable project when it changes during preparation', async () => {
    mocks.ready = true;
    const saved = saveDesignerProject('Example');
    await vi.advanceTimersByTimeAsync(50);
    mocks.snapshot.inscriptions.push({ id: 'name', text: 'Changed' });
    await vi.advanceTimersByTimeAsync(50);
    expect(fetch).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(50);
    await saved;
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string);
    expect(body.designState.inscriptions).toEqual([
      { id: 'name', text: 'Changed' },
    ]);
    expect(mocks.setScreenshotMode).toHaveBeenLastCalledWith(false);
  });
  it('does not send an MCP save if the design changes during preview preparation', async () => {
    mocks.ready = true;
    const expectedSnapshot = JSON.stringify(mocks.snapshot);
    const saved = expect(
      saveDesignerProject('Example', expectedSnapshot),
    ).rejects.toThrow('REVISION_CONFLICT');
    await vi.advanceTimersByTimeAsync(50);
    mocks.snapshot.inscriptions.push({ id: 'name', text: 'Changed' });
    await vi.advanceTimersByTimeAsync(100);
    await saved;
    expect(fetch).not.toHaveBeenCalled();
    expect(mocks.setScreenshotMode).toHaveBeenLastCalledWith(false);
  });
  it('times out without saving a stale preview and restores the scene', async () => {
    const saved = expect(saveDesignerProject('Example')).rejects.toThrow(
      'preview is still updating',
    );
    await vi.advanceTimersByTimeAsync(15000);
    await saved;
    expect(fetch).not.toHaveBeenCalled();
    expect(mocks.capture).not.toHaveBeenCalled();
    expect(mocks.setScreenshotMode).toHaveBeenLastCalledWith(false);
  });
});
