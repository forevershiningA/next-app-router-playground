import { afterEach, expect, it, vi } from 'vitest';
import { markReadyDesignStart, recordReadyDesignArrival } from '../../lib/ready-design-open';

const { count } = vi.hoisted(() => ({ count: vi.fn() }));
vi.mock('@sentry/nextjs', () => ({ metrics: { count } }));

const card = '/designs/traditional-plaque/memorial/rectangle-portrait-bird-flower';
const editor = '/traditional-engraved-plaque/select-size';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

it('counts a loaded design once on arrival, keeping only the gallery landing path', async () => {
  vi.stubGlobal('window', { location: { pathname: card } });
  vi.stubGlobal('document', { referrer: 'https://www.google.com/' });
  vi.stubGlobal('performance', { getEntriesByType: () => [
    { name: 'https://example.org/designs/traditional-plaque?campaign=test' },
  ] });
  markReadyDesignStart('1721089090837', editor);
  recordReadyDesignArrival(card);
  recordReadyDesignArrival(editor);
  recordReadyDesignArrival(editor);
  await vi.dynamicImportSettled();
  expect(count).toHaveBeenCalledTimes(1);
  expect(count).toHaveBeenCalledWith('ready_design.editor_open', 1, {
    attributes: { design_id: '1721089090837', landing_path: '/designs/traditional-plaque', google_referral: true },
  });
});

it('discards an interrupted transition and ignores later visits to the editor', async () => {
  vi.stubGlobal('window', { location: { pathname: card } });
  markReadyDesignStart('1721089090837', editor);
  recordReadyDesignArrival('/designs');
  recordReadyDesignArrival(editor);
  await vi.dynamicImportSettled();
  expect(count).not.toHaveBeenCalled();
});
