import { createHash, randomUUID } from 'node:crypto';
import {
  mkdir,
  writeFile,
  readFile,
  realpath,
  stat,
  readdir,
  rm,
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { localDraftSchema } from './designer-mcp-draft-schema.mjs';

const endpoint = new URL(
  process.env.DESIGNER_MCP_CDP_URL || 'http://127.0.0.1:9222',
);
if (
  endpoint.protocol !== 'http:' ||
  !['127.0.0.1', 'localhost', '[::1]'].includes(endpoint.hostname) ||
  endpoint.username ||
  endpoint.password
) {
  throw new Error(
    'DESIGNER_MCP_CDP_URL must be an HTTP localhost debugging endpoint.',
  );
}
const liveOriginInput = process.env.DESIGNER_MCP_LIVE_ORIGIN;
let liveOrigin;
if (liveOriginInput) {
  const parsed = new URL(liveOriginInput);
  if (
    parsed.protocol !== 'https:' ||
    parsed.username ||
    parsed.password ||
    parsed.origin !== liveOriginInput ||
    !process.env.DESIGNER_MCP_PAGE_URL
  )
    throw new Error(
      'Live testing requires DESIGNER_MCP_LIVE_ORIGIN as an exact HTTPS origin and DESIGNER_MCP_PAGE_URL as an exact page URL.',
    );
  const selectedPage = new URL(process.env.DESIGNER_MCP_PAGE_URL);
  if (
    selectedPage.origin !== parsed.origin ||
    selectedPage.username ||
    selectedPage.password
  )
    throw new Error(
      'DESIGNER_MCP_PAGE_URL must belong to the configured live origin.',
    );
  liveOrigin = parsed.origin;
}
// Advertise the tool catalog without waiting for Playwright and Chrome.
// A failed connection is discarded so a later call can retry after Chrome starts.
let browserPromise;
async function getBrowser() {
  if (!browserPromise) {
    browserPromise = import('playwright')
      .then(async ({ chromium }) => {
        try {
          return await chromium.connectOverCDP(endpoint.href, { timeout: 1500 });
        } catch {
          // Fallback: Launch Chromium so MCP works without requiring manual Chrome CDP startup
          return await chromium.launch({
            headless: true,
            args: [
              '--use-gl=angle',
              '--use-angle=swiftshader',
              '--no-sandbox',
              '--disable-setuid-sandbox',
            ],
          });
        }
      })
      .catch((error) => {
        browserPromise = undefined;
        throw error;
      });
  }
  const browser = await browserPromise;
  if (!browser.isConnected()) {
    browserPromise = undefined;
    throw new Error(
      'The designer browser disconnected. Reconnect it and retry.',
    );
  }
  return browser;
}
const server = new McpServer({
  name: 'forevershining-designer-local',
  version: '0.5.0',
});
const revision = (snapshot) =>
  createHash('sha256').update(JSON.stringify(snapshot)).digest('hex');
// Uploads are opt-in, including when the MCP client supplies malformed or
// missing environment variables. Reference images can still be interpreted by
// the agent without uploading them to the site's image storage.
const uploadsDisabled = process.env.DESIGNER_MCP_DISABLE_UPLOADS !== '0';
const response = (value) => ({
  content: [{ type: 'text', text: JSON.stringify(value) }],
  structuredContent: value,
});
const failure = (code, message) => ({
  content: [{ type: 'text', text: JSON.stringify({ code, message }) }],
  isError: true,
});
const localDraftDirectory = process.env.DESIGNER_MCP_DRAFT_DIR
  ? path.resolve(process.env.DESIGNER_MCP_DRAFT_DIR)
  : path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      '../output/mcp-local-drafts',
    );

const pilotStateDirectory = path.join(
  process.env.TEMP || os.tmpdir(),
  'forevershining-openbot-pilot',
);
const activeSessionFilePath = path.join(
  pilotStateDirectory,
  'active-session.txt',
);
const previewCacheDir = path.join(pilotStateDirectory, 'mcp-previews');

async function getPersistedSessionId() {
  try {
    const val = (await readFile(activeSessionFilePath, 'utf8')).trim();
    return val || null;
  } catch {
    return null;
  }
}

async function persistSelectedSession(id) {
  try {
    await mkdir(pilotStateDirectory, { recursive: true });
    await writeFile(activeSessionFilePath, id ?? 'original', 'utf8');
  } catch {}
}

async function currentSessionId(page) {
  if (!page || page.isClosed()) return 'original';
  const name = await page.evaluate(() => window.name).catch(() => '');
  if (name.startsWith('forever-mcp-local-session:')) {
    return name.replace('forever-mcp-local-session:', '');
  }
  return 'original';
}

let pinnedLivePage;
let selectedLocalSessionId = null;
const localSessions = new Map();
// Preview evidence is scoped to this machine session and cached with TTL; a
// reconnect or multi-agent call can reuse a preview if revision and session match.
const localPreviews = new Map();
const previewLifetimeMs = 15 * 60 * 1000;
async function isLiveBridgeAuthorized(page) {
  return page
    .evaluate(async () => {
      const response = await fetch('/api/admin/designer-mcp', {
        cache: 'no-store',
      });
      return response.ok && Boolean(window.__designerAgentBridge);
    })
    .catch(() => false);
}
async function syncLocalSessions(browser) {
  for (const [id, session] of localSessions) {
    if (session.page.isClosed()) {
      localSessions.delete(id);
      if (selectedLocalSessionId === id) {
        selectedLocalSessionId = 'original';
        void persistSelectedSession('original');
      }
    }
  }
  const pages = browser.contexts().flatMap((context) => context.pages());
  for (const page of pages) {
    if (page.isClosed()) continue;
    const name = await page.evaluate(() => window.name).catch(() => '');
    if (name.startsWith('forever-mcp-local-session:')) {
      const sessionId = name.replace('forever-mcp-local-session:', '');
      if (!localSessions.has(sessionId)) {
        localSessions.set(sessionId, { context: page.context(), page });
      }
    }
  }
  if (selectedLocalSessionId === null) {
    const persisted = await getPersistedSessionId();
    if (persisted && persisted !== 'original' && localSessions.has(persisted)) {
      selectedLocalSessionId = persisted;
    } else {
      selectedLocalSessionId = 'original';
    }
  }
}

async function pageForSession() {
  const browser = await getBrowser();
  await syncLocalSessions(browser);
  if (selectedLocalSessionId && selectedLocalSessionId !== 'original') {
    const session = localSessions.get(selectedLocalSessionId);
    if (!session || session.page.isClosed()) {
      selectedLocalSessionId = 'original';
      void persistSelectedSession('original');
    } else {
      return session.page;
    }
  }
  if (pinnedLivePage) {
    if (
      pinnedLivePage.isClosed() ||
      new URL(pinnedLivePage.url()).origin !== liveOrigin ||
      !(await isLiveBridgeAuthorized(pinnedLivePage))
    )
      throw new Error(
        'The selected live designer tab is unavailable or left the configured origin.',
      );
    return pinnedLivePage;
  }
  const pages = browser.contexts().flatMap((context) => context.pages());
  const managedPages = new Set(
    Array.from(localSessions.values(), (session) => session.page),
  );
  const candidates = [];
  for (const page of pages) {
    if (managedPages.has(page)) continue;
    const url = new URL(page.url());
    if (
      !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) ||
      !['http:', 'https:'].includes(url.protocol)
    ) {
      if (!liveOrigin || url.origin !== liveOrigin) continue;
    }
    if (
      process.env.DESIGNER_MCP_PAGE_URL &&
      page.url() !== process.env.DESIGNER_MCP_PAGE_URL
    )
      continue;
    const isManagedByAnotherConnection = await page
      .evaluate(() => window.name.startsWith('forever-mcp-local-session:'))
      .catch(() => false);
    if (isManagedByAnotherConnection) continue;
    const available = await page
      .evaluate(() => Boolean(window.__designerAgentBridge))
      .catch(() => false);
    if (
      available &&
      (!liveOrigin ||
        url.origin !== liveOrigin ||
        (await isLiveBridgeAuthorized(page)))
    )
      candidates.push(page);
  }
  if (candidates.length === 0) {
    for (const page of pages) {
      try {
        const url = new URL(page.url());
        if (['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
          const available = await page
            .evaluate(() => Boolean(window.__designerAgentBridge))
            .catch(() => false);
          if (available) {
            candidates.push(page);
            break;
          }
        }
      } catch {}
    }
  }
  if (candidates.length === 0) {
    // When starting without an open browser tab, launch the default designer tab
    const context = browser.contexts()[0] ?? (await browser.newContext());
    const origin = liveOrigin || 'http://127.0.0.1:3104';
    const initialUrl = `${origin}/traditional-engraved-headstone/inscriptions`;
    const initialPage = await context.newPage();
    await initialPage.goto(initialUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await initialPage.waitForFunction(
      () => Boolean(window.__designerAgentBridge?.read()?.productConfigurationReady),
      null,
      { timeout: 60000 },
    );
    candidates.push(initialPage);
  }
  if (candidates.length !== 1)
    throw new Error(
      `Expected exactly one matching local designer tab; found ${candidates.length}. Set DESIGNER_MCP_PAGE_URL to select a tab.`,
    );
  if (liveOrigin && new URL(candidates[0].url()).origin === liveOrigin)
    pinnedLivePage = candidates[0];
  return candidates[0];
}

async function read(page) {
  return page.evaluate(() => window.__designerAgentBridge.read());
}
async function withPage(fn) {
  try {
    return await fn(await pageForSession());
  } catch (error) {
    return failure(
      'SESSION_UNAVAILABLE',
      error instanceof Error ? error.message : String(error),
    );
  }
}
function result(data) {
  return { revision: revision(data.snapshot), ...data };
}
const revisionSchema = z
  .union([z.string().regex(/^[a-f0-9]{64}$/), z.literal('latest')])
  .describe(
    'Use the exact revision returned by get_design, or "latest" to apply to the current local design. The operation still checks for concurrent changes.',
  );
function revisionMatches(page, expected, actual) {
  return (
    expected === actual ||
    (expected === 'latest' &&
      ['localhost', '127.0.0.1', '[::1]'].includes(
        new URL(page.url()).hostname,
      ))
  );
}
async function withRevision(
  page,
  expectedRevision,
  action,
  notFoundMessage = 'The requested item was not found.',
) {
  const before = await read(page);
  const currentRevision = revision(before.snapshot);
  if (!revisionMatches(page, expectedRevision, currentRevision))
    return failure(
      'REVISION_CONFLICT',
      'The design has changed. Read it again.',
    );
  const outcome = await action(JSON.stringify(before.snapshot));
  if (outcome.error)
    return failure(
      outcome.error,
      outcome.error === 'NOT_FOUND'
        ? notFoundMessage
        : `Operation failed: ${outcome.error}`,
    );
  return response(
    outcome.data
      ? {
          ...result(outcome.data),
          ...(outcome.id ? { id: outcome.id } : {}),
          ...(outcome.applied ? { applied: outcome.applied } : {}),
          renderStatus: 'pending',
        }
      : { ...outcome, revision: currentRevision },
  );
}

function requireLocal(page) {
  const url = new URL(page.url());
  if (
    !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname) ||
    !['http:', 'https:'].includes(url.protocol)
  )
    throw new Error(
      'Local sessions are only available from a local development designer.',
    );
}
async function createLocalSession(sourcePage, productId) {
  requireLocal(sourcePage);
  const href = await sourcePage.evaluate(
    (id) => window.__designerAgentBridge.productHref(id),
    productId,
  );
  if (!href) throw new Error('Product is not available in the local designer.');
  const target = new URL(href, sourcePage.url());
  if (target.origin !== new URL(sourcePage.url()).origin)
    throw new Error('Invalid product URL.');
  const browser = await getBrowser();
  const context = browser.contexts()[0] ?? (await browser.newContext());
  const sessionId = randomUUID();
  let page;
  try {
    page = await context.newPage();
    await page.goto(target.href, {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await page.evaluate((name) => {
      window.name = name;
    }, `forever-mcp-local-session:${sessionId}`);
    await page.waitForFunction(
      () =>
        Boolean(window.__designerAgentBridge?.read().productConfigurationReady),
      null,
      { timeout: 60000 },
    );
    return { context, page, sessionId };
  } catch (error) {
    if (page) await page.close().catch(() => {});
    throw error;
  }
}
async function previewDifference(first, second) {
  const { default: sharp } = await import('sharp');
  const decode = (value) =>
    sharp(Buffer.from(value.split(',').pop(), 'base64'))
      .resize(300, 225)
      .removeAlpha()
      .raw()
      .toBuffer();
  const [a, b] = await Promise.all([decode(first), decode(second)]);
  if (a.length !== b.length)
    throw new Error('Preview dimensions do not match.');
  let error = 0;
  for (let i = 0; i < a.length; i++) error += Math.abs(a[i] - b[i]);
  return error / a.length;
}
function registerLocalSession(session, id = session.sessionId ?? randomUUID()) {
  localSessions.set(id, session);
  selectedLocalSessionId = id;
  void persistSelectedSession(id);
  return id;
}

server.registerTool(
  'list_local_sessions',
  {
    description:
      'List independent local sessions created by this MCP connection. The original designer tab is called original. Sessions are temporary and are not account projects.',
  },
  async () => {
    const browser = await getBrowser().catch(() => null);
    if (browser) await syncLocalSessions(browser);
    return response({
      selectedSessionId: selectedLocalSessionId ?? 'original',
      sessions: [
        { id: 'original' },
        ...Array.from(localSessions, ([id, session]) => ({
          id,
          available: !session.page.isClosed(),
        })),
      ],
    });
  },
);

server.registerTool(
  'select_local_session',
  {
    description:
      'Select an existing session for subsequent Forever tools. Use original to return to the original tab. Sessions belong to this MCP connection.',
    inputSchema: {
      sessionId: z.union([z.literal('original'), z.string().uuid()]),
    },
  },
  async ({ sessionId }) => {
    const browser = await getBrowser().catch(() => null);
    if (browser) await syncLocalSessions(browser);
    if (sessionId === 'original') {
      selectedLocalSessionId = 'original';
      await persistSelectedSession('original');
      return response({ selectedSessionId: 'original' });
    }
    const session = localSessions.get(sessionId);
    if (!session || session.page.isClosed())
      return failure(
        'SESSION_NOT_FOUND',
        'The local session does not exist or is closed.',
      );
    selectedLocalSessionId = sessionId;
    await persistSelectedSession(sessionId);
    return response({ selectedSessionId: sessionId });
  },
);

server.registerTool(
  'close_local_session',
  {
    description:
      'Close a temporary session created by this MCP connection. Unsaved changes in it will be lost. The original designer tab cannot be closed with this tool.',
    inputSchema: {
      sessionId: z.string().uuid(),
      discardUnsavedChanges: z.literal(true),
    },
  },
  async ({ sessionId }) => {
    const browser = await getBrowser().catch(() => null);
    if (browser) await syncLocalSessions(browser);
    const session = localSessions.get(sessionId);
    if (!session)
      return failure('SESSION_NOT_FOUND', 'The local session does not exist.');
    if (session.page && !session.page.isClosed()) {
      await session.page.close().catch(() => {});
    }
    if (
      browser &&
      session.context &&
      session.context !== browser.contexts()[0] &&
      session.context.pages().length === 0
    ) {
      await session.context.close().catch(() => {});
    }
    localSessions.delete(sessionId);
    if (selectedLocalSessionId === sessionId) {
      selectedLocalSessionId = 'original';
      await persistSelectedSession('original');
    }
    return response({
      closedSessionId: sessionId,
      selectedSessionId: selectedLocalSessionId,
    });
  },
);

server.registerTool(
  'create_local_session',
  {
    description:
      'Create and select an independent empty local designer session for the requested product. Does not modify the currently selected design. Temporary: save exports before disconnecting.',
    inputSchema: { productId: z.string().min(1).max(100) },
  },
  ({ productId }) =>
    withPage(async (page) => {
      if (liveOrigin)
        return failure(
          'LOCAL_ONLY',
          'Independent local sessions are unavailable for live testing.',
        );
      const session = await createLocalSession(page, productId);
      const data = await read(session.page);
      const sessionId = registerLocalSession(session);
      return response({ sessionId, ...result(data) });
    }),
);

server.registerTool(
  'list_local_designs',
  {
    description:
      'List saved local draft designs in reverse chronological order (newest first). Returns id, title, savedAt, productId, shapeUrl, and count of inscriptions and motifs.',
    inputSchema: { limit: z.number().int().min(1).max(50).optional() },
  },
  async ({ limit = 20 }) => {
    if (liveOrigin)
      return failure(
        'LOCAL_ONLY',
        'Local drafts are unavailable for live testing.',
      );
    try {
      const root = await realpath(localDraftDirectory);
      const files = await readdir(root);
      const jsonFiles = files.filter((f) => f.endsWith('.json'));
      const drafts = [];
      for (const file of jsonFiles) {
        try {
          const fullPath = path.join(root, file);
          const stats = await stat(fullPath);
          if (stats.size > 20 * 1024 * 1024) continue;
          const content = JSON.parse(await readFile(fullPath, 'utf8'));
          if (content && content.id && content.snapshot) {
            drafts.push({
              id: content.id,
              title: content.title || 'Untitled',
              savedAt: content.savedAt || stats.mtime.toISOString(),
              productId: content.snapshot.productId,
              shapeUrl: content.snapshot.shapeUrl,
              inscriptionsCount: Array.isArray(content.snapshot.inscriptions)
                ? content.snapshot.inscriptions.length
                : 0,
              motifsCount: Array.isArray(content.snapshot.selectedMotifs)
                ? content.snapshot.selectedMotifs.length
                : 0,
              mtimeMs: stats.mtimeMs,
            });
          }
        } catch {
          // Skip unparseable files
        }
      }
      drafts.sort((a, b) => b.mtimeMs - a.mtimeMs);
      const resultList = drafts
        .slice(0, limit)
        .map(({ mtimeMs, ...rest }) => rest);
      return response({ drafts: resultList, totalCount: drafts.length });
    } catch (error) {
      return failure('READ_FAILED', 'Could not read local drafts directory.');
    }
  },
);

server.registerTool(
  'open_local_design',
  {
    description:
      'Open a previously saved local export by its UUID in a new independent local session, leaving the current session untouched. Returns the restored snapshot and whether it matches the export exactly. Only local files saved in the configured draft directory are accepted.',
    inputSchema: { id: z.string().uuid() },
  },
  ({ id }) =>
    withPage(async (page) => {
      if (liveOrigin)
        return failure(
          'LOCAL_ONLY',
          'Local drafts cannot be opened in a live designer.',
        );
      requireLocal(page);
      let draft;
      try {
        const root = await realpath(localDraftDirectory);
        const file = await realpath(path.join(root, `${id}.json`));
        if (path.dirname(file) !== root)
          return failure(
            'INVALID_DRAFT',
            'The draft is outside the local draft directory.',
          );
        if ((await stat(file)).size > 20 * 1024 * 1024)
          return failure('INVALID_DRAFT', 'The draft file is too large.');
        draft = JSON.parse(await readFile(file, 'utf8'));
        if (
          !localDraftSchema.safeParse(draft).success ||
          draft.id !== id ||
          revision(draft.snapshot) !== draft.revision ||
          !draft.snapshot.productId
        )
          return failure(
            'INVALID_DRAFT',
            'The draft format or revision is invalid.',
          );
      } catch (error) {
        return failure(
          error?.code === 'ENOENT' ? 'DRAFT_NOT_FOUND' : 'INVALID_DRAFT',
          'The local draft could not be read or validated.',
        );
      }
      const renderedPositions = draft.renderedInscriptionPositions;
      const expectedIds = draft.snapshot.inscriptions
        .filter(
          (line) =>
            (!line.target || line.target === 'headstone') &&
            !line.coordinateSpace,
        )
        .map((line) => line.id);
      const positionsValid =
        renderedPositions &&
        expectedIds.every(
          (id) =>
            Number.isFinite(renderedPositions[id]?.xPos) &&
            Number.isFinite(renderedPositions[id]?.yPos),
        );
      if (
        expectedIds.length &&
        !positionsValid &&
        !/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(draft.preview ?? '')
      )
        return failure(
          'LEGACY_LAYOUT_UNAVAILABLE',
          'This older draft lacks both inscription layout information and a valid reference preview.',
        );
      const restoredSnapshot = structuredClone(draft.snapshot);
      for (const line of restoredSnapshot.inscriptions) {
        if (positionsValid && expectedIds.includes(line.id))
          Object.assign(line, renderedPositions[line.id]);
      }
      const session = await createLocalSession(page, draft.snapshot.productId);
      try {
        const before = await read(session.page);
        const outcome = await session.page.evaluate(
          ({ snapshot, expected }) =>
            window.__designerAgentBridge.restoreLocalSnapshot(
              snapshot,
              expected,
            ),
          {
            snapshot: restoredSnapshot,
            expected: JSON.stringify(before.snapshot),
          },
        );
        if (outcome.error) {
          await session.context.close();
          return failure(
            outcome.error,
            'The new session could not restore the draft.',
          );
        }
        await session.page.waitForTimeout(500);
        let data = await read(session.page);
        let legacyLayoutCompared = false;
        if (expectedIds.length && !positionsValid) {
          const first = await session.page.evaluate(
            (expected) => window.__designerAgentBridge.preview(expected),
            JSON.stringify(data.snapshot),
          );
          if (first.error || !first.screenshot)
            throw new Error(
              'Could not evaluate the original inscription layout.',
            );
          const centered = await session.page.evaluate(() =>
            window.__designerAgentBridge.legacyCenteredInscriptionPositions(),
          );
          if (
            !centered ||
            !expectedIds.every(
              (id) =>
                Number.isFinite(centered[id]?.xPos) &&
                Number.isFinite(centered[id]?.yPos),
            )
          )
            throw new Error(
              'Could not determine the legacy inscription coordinates.',
            );
          const candidate = structuredClone(draft.snapshot);
          for (const line of candidate.inscriptions)
            if (expectedIds.includes(line.id))
              Object.assign(line, centered[line.id]);
          const changed = await session.page.evaluate(
            ({ snapshot, expected }) =>
              window.__designerAgentBridge.restoreLocalSnapshot(
                snapshot,
                expected,
              ),
            { snapshot: candidate, expected: JSON.stringify(data.snapshot) },
          );
          if (changed.error)
            throw new Error(
              'The design changed while comparing legacy layouts.',
            );
          await session.page.waitForTimeout(500);
          const candidateState = await read(session.page);
          const second = await session.page.evaluate(
            (expected) => window.__designerAgentBridge.preview(expected),
            JSON.stringify(candidateState.snapshot),
          );
          if (second.error || !second.screenshot)
            throw new Error(
              'Could not evaluate the centered inscription layout.',
            );
          const [firstError, secondError] = await Promise.all([
            previewDifference(first.screenshot, draft.preview),
            previewDifference(second.screenshot, draft.preview),
          ]);
          if (firstError <= secondError) {
            const reset = await session.page.evaluate(
              ({ snapshot, expected }) =>
                window.__designerAgentBridge.restoreLocalSnapshot(
                  snapshot,
                  expected,
                ),
              {
                snapshot: draft.snapshot,
                expected: JSON.stringify(candidateState.snapshot),
              },
            );
            if (reset.error)
              throw new Error('The design changed while restoring its layout.');
          } else {
            Object.assign(restoredSnapshot, candidate);
          }
          await session.page.waitForTimeout(500);
          data = await read(session.page);
          legacyLayoutCompared = true;
        }
        const sessionId = registerLocalSession(session);
        const actualRevision = revision(data.snapshot);
        const normalizedRevision = revision(restoredSnapshot);
        return response({
          sessionId,
          ...result(data),
          sourceRevision: draft.revision,
          restoredExactly: actualRevision === draft.revision,
          restoredNormalized: actualRevision === normalizedRevision,
          legacyLayoutCompared,
          ...(actualRevision === draft.revision
            ? {}
            : {
                warning:
                  'Inscription coordinates were normalized to preserve the rendered layout. The restored revision differs; inspect the preview and state before saving.',
              }),
          ...(legacyLayoutCompared
            ? {
                legacyLayoutWarning:
                  'The original coordinates were ambiguous; two interpretations were compared against the saved image. Visually verify the result.',
              }
            : {}),
        });
      } catch (error) {
        await session.context.close();
        throw error;
      }
    }),
);

server.registerTool(
  'list_products',
  { description: 'List available product IDs, names and categories.' },
  () =>
    withPage(async (page) =>
      response({
        products: await page.evaluate(() =>
          window.__designerAgentBridge.listProducts(),
        ),
      }),
    ),
);
server.registerTool(
  'list_additions',
  {
    description:
      'List addition catalog IDs, names, types and size variants, plus currently selected addition instances. Position offsets use target-surface-native units.',
  },
  () =>
    withPage(async (page) => {
      const data = await page.evaluate(() =>
        window.__designerAgentBridge.listAdditions(),
      );
      return response({
        revision: revision(data.snapshot),
        catalog: data.catalog,
        selected: data.selected,
      });
    }),
);
server.registerTool(
  'list_motif_categories',
  { description: 'List motif categories available to the current editor.' },
  () =>
    withPage(async (page) => {
      const data = await page.evaluate(() =>
        window.__designerAgentBridge.listMotifCategories(),
      );
      return response({
        revision: revision(data.snapshot),
        categories: data.categories,
        selected: data.selected,
      });
    }),
);
server.registerTool(
  'list_emblems',
  {
    description:
      'List the bronze plaque emblem catalog and fixed size variants. Also returns selected emblem instances and their current offsets.',
  },
  () =>
    withPage(async (page) => {
      const data = await page.evaluate(() =>
        window.__designerAgentBridge.listEmblems(),
      );
      return response({
        revision: revision(data.snapshot),
        available: data.available,
        catalog: data.catalog,
        sizes: data.sizes,
        selected: data.selected,
      });
    }),
);
server.registerTool(
  'list_images',
  {
    description:
      'List supported image types, fixed/flexible size limits, crop masks and current image instances. Image positions retain their stored coordinate space.',
  },
  () =>
    withPage(async (page) => {
      const data = await page.evaluate(() =>
        window.__designerAgentBridge.listImages(),
      );
      return response({
        revision: revision(data.snapshot),
        productId: data.productId,
        available: data.available,
        types: data.types,
        masks: data.masks,
        selected: data.selected,
      });
    }),
);
const imageCropArea = z
  .object({
    x: z.number().finite().min(0).max(100),
    y: z.number().finite().min(0).max(100),
    width: z.number().finite().positive().max(100),
    height: z.number().finite().positive().max(100),
  })
  .strict()
  .refine(
    (value) => value.x + value.width <= 100 && value.y + value.height <= 100,
  );
const imageUploadInput = {
  imageBase64: z
    .string()
    .min(1)
    .max(7_000_000)
    .regex(/^[A-Za-z0-9+/]+={0,2}$/),
  mimeType: z.enum(['image/jpeg', 'image/png', 'image/webp']),
  typeId: z.number().int().positive(),
  cropArea: imageCropArea.optional(),
  cropScalePercent: z.number().finite().min(10).max(400).optional(),
  cropRotationDeg: z.number().finite().min(-180).max(180).optional(),
  flipX: z.boolean().optional(),
  flipY: z.boolean().optional(),
  maskShape: z
    .enum([
      'oval',
      'horizontal-oval',
      'square',
      'rectangle',
      'heart',
      'teardrop',
      'triangle',
    ])
    .optional(),
  colorMode: z.enum(['full', 'bw', 'sepia']).optional(),
  sizeVariant: z.number().int().positive().optional(),
  heightMm: z.number().finite().positive().optional(),
};
server.registerTool(
  'add_image',
  {
    description:
      'Upload and add an image. Provide raw base64 without a data-URL prefix; MCP applies the crop rectangle, rotation, flips, mask and color mode, then uploads the processed PNG through the current app endpoint. Requires the current design revision. A timeout after upload can leave an unreferenced uploaded asset.',
    inputSchema: {
      ...imageUploadInput,
      target: z.enum(['headstone', 'base', 'ledger']).optional(),
      expectedRevision: revisionSchema,
    },
  },
  ({ expectedRevision, ...input }) =>
    uploadsDisabled
      ? failure(
          'UPLOAD_DISABLED',
          'Image uploads are disabled for this local pilot.',
        )
      : withPage((page) =>
          withRevision(page, expectedRevision, (expected) =>
            page.evaluate(
              ({ input, expected }) =>
                window.__designerAgentBridge.addImage(input, expected),
              { input, expected },
            ),
          ),
        ),
);
server.registerTool(
  'replace_image',
  {
    description:
      'Replace the uploaded source for an existing image instance using the same browser-side crop, mask and color processing as add_image. It preserves the existing placement and size controls. Requires the current revision; a timeout after upload can leave an unreferenced asset.',
    inputSchema: {
      id: z.string().min(1),
      ...imageUploadInput,
      expectedRevision: revisionSchema,
    },
  },
  ({ id, expectedRevision, ...input }) =>
    uploadsDisabled
      ? failure(
          'UPLOAD_DISABLED',
          'Image uploads are disabled for this local pilot.',
        )
      : withPage((page) =>
          withRevision(page, expectedRevision, (expected) =>
            page.evaluate(
              ({ id, input, expected }) =>
                window.__designerAgentBridge.replaceImage(id, input, expected),
              { id, input, expected },
            ),
          ),
        ),
);
const imagePatch = z
  .object({
    xPos: z.number().finite().min(-10000).max(10000).optional(),
    yPos: z.number().finite().min(-10000).max(10000).optional(),
    heightMm: z.number().finite().positive().optional(),
    sizeVariant: z.number().int().positive().optional(),
    rotationDeg: z.number().finite().min(-180).max(180).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'Provide a change');
server.registerTool(
  'update_image',
  {
    description:
      'Update one image position, rotation, fixed size variant or flexible height. Coordinates retain the image’s existing coordinate space. File replacement uses replace_image.',
    inputSchema: {
      id: z.string().min(1),
      patch: imagePatch,
      expectedRevision: revisionSchema,
    },
  },
  ({ id, patch, expectedRevision }) =>
    withPage((page) =>
      withRevision(page, expectedRevision, (expected) =>
        page.evaluate(
          ({ id, patch, expected }) =>
            window.__designerAgentBridge.updateImage(id, patch, expected),
          { id, patch, expected },
        ),
      ),
    ),
);
server.registerTool(
  'move_image_to_surface',
  {
    description:
      'Move an image to an available surface, placing it at the centre. Moving to its current surface preserves its position.',
    inputSchema: {
      id: z.string().min(1),
      target: z.enum(['headstone', 'base', 'ledger']),
      expectedRevision: revisionSchema,
    },
  },
  ({ id, target, expectedRevision }) =>
    withPage((page) =>
      withRevision(page, expectedRevision, (expected) =>
        page.evaluate(
          ({ id, target, expected }) =>
            window.__designerAgentBridge.moveImageToSurface(
              id,
              target,
              expected,
            ),
          { id, target, expected },
        ),
      ),
    ),
);
server.registerTool(
  'duplicate_image',
  {
    description: 'Duplicate a selected image instance by its exact ID.',
    inputSchema: { id: z.string().min(1), expectedRevision: revisionSchema },
  },
  ({ id, expectedRevision }) =>
    withPage((page) =>
      withRevision(page, expectedRevision, (expected) =>
        page.evaluate(
          ({ id, expected }) =>
            window.__designerAgentBridge.duplicateImage(id, expected),
          { id, expected },
        ),
      ),
    ),
);
server.registerTool(
  'delete_image',
  {
    description: 'Delete an image instance by its exact ID.',
    inputSchema: { id: z.string().min(1), expectedRevision: revisionSchema },
  },
  ({ id, expectedRevision }) =>
    withPage((page) =>
      withRevision(page, expectedRevision, (expected) =>
        page.evaluate(
          ({ id, expected }) =>
            window.__designerAgentBridge.deleteImage(id, expected),
          { id, expected },
        ),
      ),
    ),
);
server.registerTool(
  'add_emblem',
  {
    description:
      'Add a listed emblem to bronze plaque product 5 using the editor default placement and size. Requires the current design revision.',
    inputSchema: {
      emblemId: z.string().min(1),
      expectedRevision: revisionSchema,
    },
  },
  ({ emblemId, expectedRevision }) =>
    withPage((page) =>
      withRevision(page, expectedRevision, (expected) =>
        page.evaluate(
          ({ emblemId, expected }) =>
            window.__designerAgentBridge.addEmblem(emblemId, expected),
          { emblemId, expected },
        ),
      ),
    ),
);
const emblemPatch = z
  .object({
    xPos: z.number().finite().min(-10000).max(10000).optional(),
    yPos: z.number().finite().min(-10000).max(10000).optional(),
    sizeVariant: z.number().int().min(1).max(7).optional(),
    rotationDeg: z.number().finite().min(-180).max(180).optional(),
    flipX: z.boolean().optional(),
    flipY: z.boolean().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'Provide a change');
server.registerTool(
  'update_emblem',
  {
    description:
      'Update a selected emblem position, fixed size variant, rotation or flip. Position uses the instance coordinate space; rotation is in degrees. Requires the current design revision.',
    inputSchema: {
      id: z.string().min(1),
      patch: emblemPatch,
      expectedRevision: revisionSchema,
    },
  },
  ({ id, patch, expectedRevision }) =>
    withPage((page) =>
      withRevision(page, expectedRevision, (expected) =>
        page.evaluate(
          ({ id, patch, expected }) =>
            window.__designerAgentBridge.updateEmblem(id, patch, expected),
          { id, patch, expected },
        ),
      ),
    ),
);
server.registerTool(
  'duplicate_emblem',
  {
    description: 'Duplicate a selected emblem instance by its exact ID.',
    inputSchema: { id: z.string().min(1), expectedRevision: revisionSchema },
  },
  ({ id, expectedRevision }) =>
    withPage((page) =>
      withRevision(page, expectedRevision, (expected) =>
        page.evaluate(
          ({ id, expected }) =>
            window.__designerAgentBridge.duplicateEmblem(id, expected),
          { id, expected },
        ),
      ),
    ),
);
server.registerTool(
  'delete_emblem',
  {
    description: 'Delete a selected emblem instance by its exact ID.',
    inputSchema: { id: z.string().min(1), expectedRevision: revisionSchema },
  },
  ({ id, expectedRevision }) =>
    withPage((page) =>
      withRevision(page, expectedRevision, (expected) =>
        page.evaluate(
          ({ id, expected }) =>
            window.__designerAgentBridge.deleteEmblem(id, expected),
          { id, expected },
        ),
      ),
    ),
);
server.registerTool(
  'list_motifs',
  {
    description:
      'List motif files for one category. Use a category ID returned by list_motif_categories; only returned svgPath values can be added.',
    inputSchema: { categoryId: z.string().min(1) },
  },
  ({ categoryId }) =>
    withPage(async (page) => {
      const outcome = await page.evaluate(
        (id) => window.__designerAgentBridge.listMotifs(id),
        categoryId,
      );
      if (outcome.error)
        return failure(
          outcome.error,
          outcome.error === 'NOT_FOUND'
            ? 'Motif category not found.'
            : `Motif lookup failed: ${outcome.error}`,
        );
      return response(outcome);
    }),
);
const motifPatch = z
  .object({
    xPos: z.number().finite().min(-10000).max(10000).optional(),
    yPos: z.number().finite().min(-10000).max(10000).optional(),
    scale: z.number().finite().min(0.1).max(3).optional(),
    heightMm: z.number().finite().positive().optional(),
    rotationDeg: z.number().finite().min(-180).max(180).optional(),
    color: z
      .string()
      .regex(/^#[0-9a-fA-F]{6}$/)
      .optional(),
    flipX: z.boolean().optional(),
    flipY: z.boolean().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'Provide a change');
server.registerTool(
  'add_motif',
  {
    description:
      'Add a motif using a categoryId and svgPath returned by list_motifs. Supports optional initial positioning/styling (xPos, yPos, scale, heightMm, rotationDeg, color, flipX, flipY). Requires the current design revision.',
    inputSchema: {
      categoryId: z.string().min(1),
      svgPath: z.string().min(1),
      xPos: z.number().finite().min(-10000).max(10000).optional(),
      yPos: z.number().finite().min(-10000).max(10000).optional(),
      scale: z.number().finite().min(0.1).max(3).optional(),
      heightMm: z.number().finite().positive().optional(),
      rotationDeg: z.number().finite().min(-180).max(180).optional(),
      color: z
        .string()
        .regex(/^#[0-9a-fA-F]{6}$/)
        .optional(),
      flipX: z.boolean().optional(),
      flipY: z.boolean().optional(),
      patch: motifPatch.optional(),
      expectedRevision: revisionSchema,
    },
  },
  ({
    categoryId,
    svgPath,
    xPos,
    yPos,
    scale,
    heightMm,
    rotationDeg,
    color,
    flipX,
    flipY,
    patch,
    expectedRevision,
  }) => {
    const combinedPatch = {
      ...(patch ?? {}),
      ...(xPos !== undefined ? { xPos } : {}),
      ...(yPos !== undefined ? { yPos } : {}),
      ...(scale !== undefined ? { scale } : {}),
      ...(heightMm !== undefined ? { heightMm } : {}),
      ...(rotationDeg !== undefined ? { rotationDeg } : {}),
      ...(color !== undefined ? { color } : {}),
      ...(flipX !== undefined ? { flipX } : {}),
      ...(flipY !== undefined ? { flipY } : {}),
    };
    return withPage((page) =>
      withRevision(page, expectedRevision, (expected) =>
        page.evaluate(
          ({ categoryId, svgPath, patch, expected }) =>
            window.__designerAgentBridge.addMotif(
              categoryId,
              svgPath,
              expected,
              patch,
            ),
          { categoryId, svgPath, patch: combinedPatch, expected },
        ),
      ),
    );
  },
);
server.registerTool(
  'update_motif',
  {
    description:
      'Update a selected motif position, scale, height, rotation, flips or color where supported. First read the motif coordinateSpace using list_motifs. For headstone offset coordinates, xPos increases right and yPos increases DOWN from center, in surface-local units (not necessarily mm). For absolute and mm-center, yPos increases UP. Position is not automatically clamped to the stone: inspect get_preview and adjust if outside or obscured. Rotation is in degrees.',
    inputSchema: {
      id: z.string().min(1),
      patch: motifPatch,
      expectedRevision: revisionSchema,
    },
  },
  ({ id, patch, expectedRevision }) =>
    withPage((page) =>
      withRevision(page, expectedRevision, (expected) =>
        page.evaluate(
          ({ id, patch, expected }) =>
            window.__designerAgentBridge.updateMotif(id, patch, expected),
          { id, patch, expected },
        ),
      ),
    ),
);
server.registerTool(
  'duplicate_motif',
  {
    description:
      'Duplicate a motif by its exact ID using the editor placement rules.',
    inputSchema: { id: z.string().min(1), expectedRevision: revisionSchema },
  },
  ({ id, expectedRevision }) =>
    withPage((page) =>
      withRevision(page, expectedRevision, (expected) =>
        page.evaluate(
          ({ id, expected }) =>
            window.__designerAgentBridge.duplicateMotif(id, expected),
          { id, expected },
        ),
      ),
    ),
);
server.registerTool(
  'delete_motif',
  {
    description: 'Delete a selected motif instance by its exact ID.',
    inputSchema: { id: z.string().min(1), expectedRevision: revisionSchema },
  },
  ({ id, expectedRevision }) =>
    withPage((page) =>
      withRevision(page, expectedRevision, (expected) =>
        page.evaluate(
          ({ id, expected }) =>
            window.__designerAgentBridge.deleteMotif(id, expected),
          { id, expected },
        ),
      ),
    ),
);
server.registerTool(
  'add_addition',
  {
    description:
      'Add a catalog addition by ID using the editor default surface and placement. Returns the instance ID; use it for later updates or deletion.',
    inputSchema: {
      catalogId: z.string().min(1),
      expectedRevision: revisionSchema,
    },
  },
  ({ catalogId, expectedRevision }) =>
    withPage((page) =>
      withRevision(page, expectedRevision, (expected) =>
        page.evaluate(
          ({ catalogId, expected }) =>
            window.__designerAgentBridge.addAddition(catalogId, expected),
          { catalogId, expected },
        ),
      ),
    ),
);
const additionPatch = z
  .object({
    xPos: z.number().finite().min(-10000).max(10000).optional(),
    yPos: z.number().finite().min(-10000).max(10000).optional(),
    zPos: z.number().finite().min(-10000).max(10000).optional(),
    scale: z.number().finite().min(0.1).max(3).optional(),
    rotationDeg: z.number().finite().min(-180).max(180).optional(),
    sizeVariant: z.number().int().positive().optional(),
    targetSurface: z.enum(['headstone', 'base', 'ledger']).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'Provide a change');
server.registerTool(
  'update_addition',
  {
    description:
      'Update one addition instance position, size variant, scale or rotation. Position uses target-surface-native units (not universally millimetres); this operation does not move an addition to a different surface. Requires the current design revision.',
    inputSchema: {
      id: z.string().min(1),
      patch: additionPatch,
      expectedRevision: revisionSchema,
    },
  },
  ({ id, patch, expectedRevision }) =>
    withPage((page) =>
      withRevision(page, expectedRevision, (expected) =>
        page.evaluate(
          ({ id, patch, expected }) =>
            window.__designerAgentBridge.updateAddition(id, patch, expected),
          { id, patch, expected },
        ),
      ),
    ),
);
server.registerTool(
  'delete_addition',
  {
    description: 'Delete one selected addition instance by its exact ID.',
    inputSchema: { id: z.string().min(1), expectedRevision: revisionSchema },
  },
  ({ id, expectedRevision }) =>
    withPage((page) =>
      withRevision(page, expectedRevision, (expected) =>
        page.evaluate(
          ({ id, expected }) =>
            window.__designerAgentBridge.deleteAddition(id, expected),
          { id, expected },
        ),
      ),
    ),
);
server.registerTool(
  'get_product_configuration',
  {
    description:
      'List supported shapes, materials, target surfaces and dimension limits for the current product. Some product types are not supported yet.',
  },
  () =>
    withPage(async (page) => {
      const outcome = await page.evaluate(() =>
        window.__designerAgentBridge.getProductConfiguration(),
      );
      if (outcome.error)
        return failure(
          outcome.error,
          `Configuration unavailable: ${outcome.error}`,
        );
      return response({
        revision: revision(outcome.data.snapshot),
        ...outcome.configuration,
      });
    }),
);
server.registerTool(
  'set_shape',
  {
    description:
      'Select a listed shape for the current supported product. Shape selection may change dimensions or border. Rendering remains pending.',
    inputSchema: {
      shapeId: z.string().min(1),
      expectedRevision: revisionSchema,
    },
  },
  ({ shapeId, expectedRevision }) =>
    withPage((page) =>
      withRevision(page, expectedRevision, (expected) =>
        page.evaluate(
          ({ shapeId, expected }) =>
            window.__designerAgentBridge.setShape(shapeId, expected),
          { shapeId, expected },
        ),
      ),
    ),
);
server.registerTool(
  'set_material',
  {
    description:
      'Select a material by its exact ID from get_product_configuration for a supported target surface. Material names are not IDs; read the current product configuration before selecting. Rendering remains pending.',
    inputSchema: {
      materialId: z.string().min(1),
      target: z.enum(['headstone', 'base', 'ledger', 'kerbset']),
      expectedRevision: revisionSchema,
    },
  },
  ({ materialId, target, expectedRevision }) =>
    withPage((page) =>
      withRevision(
        page,
        expectedRevision,
        (expected) =>
          page.evaluate(
            ({ materialId, target, expected }) =>
              window.__designerAgentBridge.setMaterial(
                materialId,
                target,
                expected,
              ),
            { materialId, target, expected },
          ),
        'Material ID not found for the current product. Call get_product_configuration, find the desired material by name, then retry with its exact id and the current revision.',
      ),
    ),
);
server.registerTool(
  'set_dimensions',
  {
    description:
      'Set width, height and/or thickness in millimetres for a supported product; values outside the reported limits are rejected. Thickness applies to the current headstone style. Changing width may also resize the base.',
    inputSchema: {
      widthMm: z.number().finite().positive().optional(),
      heightMm: z.number().finite().positive().optional(),
      thicknessMm: z.number().finite().positive().optional(),
      expectedRevision: revisionSchema,
    },
  },
  ({ widthMm, heightMm, thicknessMm, expectedRevision }) =>
    withPage((page) => {
      if (
        widthMm === undefined &&
        heightMm === undefined &&
        thicknessMm === undefined
      )
        return failure(
          'INVALID_ARGUMENT',
          'Provide widthMm, heightMm or thicknessMm.',
        );
      return withRevision(page, expectedRevision, (expected) =>
        page.evaluate(
          ({ widthMm, heightMm, thicknessMm, expected }) =>
            window.__designerAgentBridge.setDimensions(
              widthMm,
              heightMm,
              thicknessMm,
              expected,
            ),
          { widthMm, heightMm, thicknessMm, expected },
        ),
      );
    }),
);
const componentDimensions = z
  .object({
    widthMm: z.number().finite().positive().optional(),
    heightMm: z.number().finite().positive().optional(),
    depthMm: z.number().finite().positive().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'Provide a dimension');
server.registerTool(
  'set_component_dimensions',
  {
    description:
      'Set width, height and/or depth in millimetres for the visible base, ledger or kerbset. Read get_product_configuration for supported components and limits; synchronized assembly dimensions may also change.',
    inputSchema: {
      component: z.enum(['base', 'ledger', 'kerbset']),
      dimensions: componentDimensions,
      expectedRevision: revisionSchema,
    },
  },
  ({ component, dimensions, expectedRevision }) =>
    withPage((page) =>
      withRevision(page, expectedRevision, (expected) =>
        page.evaluate(
          ({ component, dimensions, expected }) =>
            window.__designerAgentBridge.setComponentDimensions(
              component,
              dimensions,
              expected,
            ),
          { component, dimensions, expected },
        ),
      ),
    ),
);
server.registerTool(
  'set_fixed_size',
  {
    description:
      'Choose a listed fixed size for a full-colour plaque (product 32), with portrait or landscape orientation.',
    inputSchema: {
      sizeId: z.number().int(),
      orientation: z.enum(['portrait', 'landscape']),
      expectedRevision: revisionSchema,
    },
  },
  ({ sizeId, orientation, expectedRevision }) =>
    withPage((page) =>
      withRevision(page, expectedRevision, (expected) =>
        page.evaluate(
          ({ sizeId, orientation, expected }) =>
            window.__designerAgentBridge.setFixedSize(
              sizeId,
              orientation,
              expected,
            ),
          { sizeId, orientation, expected },
        ),
      ),
    ),
);
const assemblyOptions = z
  .object({
    showBase: z.boolean().optional(),
    showLedger: z.boolean().optional(),
    showKerbset: z.boolean().optional(),
    baseFinish: z.enum(['default', 'rock-pitch']).optional(),
    baseOption: z.enum(['none', 'flower-pots']).optional(),
    baseLidFinish: z.enum(['black', 'silver', 'gold']).optional(),
    stainlessBaseStyle: z.enum(['none', 'stainless', 'granite']).optional(),
    borderName: z.string().min(1).optional(),
    fixingType: z.enum(['flat-back', 'lugs-with-studs', 'screws']).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'Provide an option');
server.registerTool(
  'set_assembly_options',
  {
    description:
      'Set available assembly options: base/ledger/kerbset visibility, base finish, flower pots, border style (e.g. Border 4) and fixing type (e.g. lugs-with-studs). Read get_product_configuration first; unsupported product options are rejected.',
    inputSchema: { options: assemblyOptions, expectedRevision: revisionSchema },
  },
  ({ options, expectedRevision }) =>
    withPage((page) =>
      withRevision(page, expectedRevision, (expected) =>
        page.evaluate(
          ({ options, expected }) =>
            window.__designerAgentBridge.setAssemblyOptions(options, expected),
          { options, expected },
        ),
      ),
    ),
);
server.registerTool(
  'get_inscription_capabilities',
  {
    description:
      'Read supported fonts, color availability, size/rotation limits and the current surface for new inscriptions.',
  },
  () =>
    withPage(async (page) =>
      response(
        await page.evaluate(() =>
          window.__designerAgentBridge.getInscriptionCapabilities(),
        ),
      ),
    ),
);
server.registerTool(
  'select_product',
  {
    description:
      'Navigate the current designer session to a product. Product and catalog loading are asynchronous; poll get_design before further edits.',
    inputSchema: {
      productId: z.string().min(1),
      expectedRevision: revisionSchema,
    },
  },
  ({ productId, expectedRevision }) =>
    withPage(async (page) => {
      const outcome = await withRevision(page, expectedRevision, (expected) =>
        page.evaluate(
          ({ productId, expected }) =>
            window.__designerAgentBridge.selectProduct(productId, expected),
          { productId, expected },
        ),
      );
      if (outcome && typeof outcome === 'object' && outcome.href) {
        const targetUrl = new URL(outcome.href, page.url()).toString();
        if (page.url() !== targetUrl) {
          await page.goto(targetUrl, { waitUntil: 'load' });
          await page.waitForFunction(
            () =>
              Boolean(
                window.__designerAgentBridge?.read()?.snapshot?.productId,
              ),
            { timeout: 15000 },
          );
        }
      }
      return outcome;
    }),
);
const inscriptionProperties = {
  font: z.string().min(1).max(200).optional(),
  sizeMm: z.number().finite().min(5).max(1200).optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .optional(),
  xPos: z.number().finite().optional(),
  yPos: z.number().finite().optional(),
  rotationDeg: z.number().finite().min(-45).max(45).optional(),
  textAlign: z.enum(['left', 'center', 'right']).optional(),
};
const patch = z
  .object({ text: z.string().max(5000).optional(), ...inscriptionProperties })
  .strict()
  .refine(
    (value) => Object.keys(value).length > 0,
    'Provide at least one change',
  );
server.registerTool(
  'add_inscription',
  {
    description:
      'Add an inscription on the requested surface, or the selected surface if omitted. Supports optional font, sizeMm, color (#rrggbb), xPos, yPos, rotationDeg (-45 to 45), and textAlign. New base inscriptions start at the centre of the front face with millimetre-based coordinates. Returns its ID and revision.',
    inputSchema: {
      text: z.string().min(1).max(5000),
      target: z.enum(['headstone', 'base', 'ledger']).optional(),
      font: z.string().min(1).max(200).optional(),
      sizeMm: z.number().finite().min(5).max(1200).optional(),
      color: z
        .string()
        .regex(/^#[0-9a-fA-F]{6}$/)
        .optional(),
      xPos: z.number().finite().optional(),
      yPos: z.number().finite().optional(),
      rotationDeg: z.number().finite().min(-45).max(45).optional(),
      textAlign: z.enum(['left', 'center', 'right']).optional(),
      patch: z.object(inscriptionProperties).optional(),
      expectedRevision: revisionSchema,
    },
  },
  ({
    text,
    target,
    font,
    sizeMm,
    color,
    xPos,
    yPos,
    rotationDeg,
    textAlign,
    patch,
    expectedRevision,
  }) => {
    const combinedPatch = {
      ...(patch ?? {}),
      ...(font !== undefined ? { font } : {}),
      ...(sizeMm !== undefined ? { sizeMm } : {}),
      ...(color !== undefined ? { color } : {}),
      ...(xPos !== undefined ? { xPos } : {}),
      ...(yPos !== undefined ? { yPos } : {}),
      ...(rotationDeg !== undefined ? { rotationDeg } : {}),
      ...(textAlign !== undefined ? { textAlign } : {}),
    };
    return withPage(async (page) =>
      withRevision(page, expectedRevision, (expected) =>
        page.evaluate(
          ({ text, target, patch, expected }) =>
            window.__designerAgentBridge.addInscription(
              text,
              target,
              expected,
              patch,
            ),
          { text, target, patch: combinedPatch, expected },
        ),
      ),
    );
  },
);
server.registerTool(
  'add_inscriptions',
  {
    description:
      'Add multiple inscriptions in a single operation. Each item can specify text, target, font, sizeMm, color (#rrggbb), xPos, yPos, rotationDeg, and textAlign. Returns array of created IDs and the new revision.',
    inputSchema: {
      inscriptions: z
        .array(
          z.object({
            text: z.string().min(1).max(5000),
            target: z.enum(['headstone', 'base', 'ledger']).optional(),
            font: z.string().min(1).max(200).optional(),
            sizeMm: z.number().finite().min(5).max(1200).optional(),
            color: z
              .string()
              .regex(/^#[0-9a-fA-F]{6}$/)
              .optional(),
            xPos: z.number().finite().optional(),
            yPos: z.number().finite().optional(),
            rotationDeg: z.number().finite().min(-45).max(45).optional(),
            textAlign: z.enum(['left', 'center', 'right']).optional(),
          }),
        )
        .min(1)
        .max(50),
      expectedRevision: revisionSchema,
    },
  },
  ({ inscriptions, expectedRevision }) =>
    withPage(async (page) =>
      withRevision(page, expectedRevision, (expected) =>
        page.evaluate(
          ({ inscriptions, expected }) =>
            window.__designerAgentBridge.addInscriptions(
              inscriptions,
              expected,
            ),
          { inscriptions, expected },
        ),
      ),
    ),
);
server.registerTool(
  'delete_inscription',
  {
    description: 'Delete an inscription by ID from the current revision.',
    inputSchema: { id: z.string().min(1), expectedRevision: revisionSchema },
  },
  ({ id, expectedRevision }) =>
    withPage(async (page) =>
      withRevision(page, expectedRevision, (expected) =>
        page.evaluate(
          ({ id, expected }) =>
            window.__designerAgentBridge.deleteInscription(id, expected),
          { id, expected },
        ),
      ),
    ),
);

server.registerTool(
  'compose_memorial_layout',
  {
    description:
      'Professionally layout, size, and position inscriptions and motifs on the headstone without manual coordinate guessing. Eliminates collisions, ensures proper typographic scale (primary name 44-52 mm), supports splitting names across two lines (firstName + lastName), and respects traditional stonemason memorial composition (header/Ś.P. under arch, centered large names, paired dates, valediction at bottom). Supports presets: "single_centered" (1 person), "companion_left" (2-person stone, left person occupied, right reserved), "companion_both" (2 persons side by side in symmetric columns with cross in crown arch), and "companion_shared_surname" (large shared family surname centered, with 2 columns below for first names and dates).',
    inputSchema: {
      preset: z.enum([
        'single_centered',
        'companion_left',
        'companion_both',
        'companion_shared_surname',
        'bronze_plaque',
      ]),
      titleRole: z.string().optional(),
      titleRoleFont: z.string().optional(),
      titleRoleSizeMm: z.number().optional(),
      subtitleText: z.string().optional(),
      subtitleFont: z.string().optional(),
      subtitleSizeMm: z.number().optional(),
      sharedSurname: z.string().optional(),
      sharedSurnameFont: z.string().optional(),
      sharedSurnameSizeMm: z.number().optional(),
      headerText: z.string().optional(),
      headerFont: z.string().optional(),
      headerSizeMm: z.number().optional(),
      bottomText: z.string().optional(),
      bottomFont: z.string().optional(),
      bottomSizeMm: z.number().optional(),
      textColor: z
        .string()
        .regex(/^#[0-9a-fA-F]{6}$/)
        .optional(),
      leftPerson: z
        .object({
          name: z.string().optional(),
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          splitName: z.boolean().optional(),
          dates: z.string().optional(),
          relation: z.string().optional(),
          font: z.string().optional(),
          nameFont: z.string().optional(),
          firstNameSizeMm: z.number().optional(),
          lastNameSizeMm: z.number().optional(),
          datesSizeMm: z.number().optional(),
          motifCategoryId: z.string().optional(),
          motifSvgPath: z.string().optional(),
          motifColor: z.string().optional(),
          motifHeightMm: z.number().optional(),
        })
        .optional(),
      rightPerson: z
        .object({
          name: z.string().optional(),
          firstName: z.string().optional(),
          lastName: z.string().optional(),
          splitName: z.boolean().optional(),
          dates: z.string().optional(),
          relation: z.string().optional(),
          font: z.string().optional(),
          nameFont: z.string().optional(),
          firstNameSizeMm: z.number().optional(),
          lastNameSizeMm: z.number().optional(),
          datesSizeMm: z.number().optional(),
          motifCategoryId: z.string().optional(),
          motifSvgPath: z.string().optional(),
          motifColor: z.string().optional(),
          motifHeightMm: z.number().optional(),
        })
        .optional(),
      centerMotif: z
        .object({
          categoryId: z.string().optional(),
          svgPath: z.string().min(1),
          color: z.string().optional(),
          heightMm: z.number().optional(),
          position: z.enum(['crown', 'divider']).optional(),
        })
        .optional(),
      clearExisting: z.boolean().optional(),
      expectedRevision: revisionSchema.optional(),
    },
  },
  ({
    preset,
    titleRole,
    titleRoleFont,
    titleRoleSizeMm,
    subtitleText,
    subtitleFont,
    subtitleSizeMm,
    sharedSurname,
    sharedSurnameFont,
    sharedSurnameSizeMm,
    headerText,
    headerFont,
    headerSizeMm,
    bottomText,
    bottomFont,
    bottomSizeMm,
    textColor = '#D4AF37',
    leftPerson,
    rightPerson,
    centerMotif,
    clearExisting = true,
    expectedRevision,
  }) =>
    withPage(async (page) =>
      withRevision(page, expectedRevision, async () => {
        const res = await page.evaluate(
          async ({
            preset,
            titleRole,
            titleRoleFont,
            titleRoleSizeMm,
            subtitleText,
            subtitleFont,
            subtitleSizeMm,
            sharedSurname,
            sharedSurnameFont,
            sharedSurnameSizeMm,
            headerText,
            headerFont,
            headerSizeMm,
            bottomText,
            bottomFont,
            bottomSizeMm,
            textColor,
            leftPerson,
            rightPerson,
            centerMotif,
            clearExisting,
          }) => {
            const bridge = window.__designerAgentBridge;
            const exp = () => JSON.stringify(bridge.read().snapshot);
            const currentSnapshot = bridge.read().snapshot;

            if (clearExisting) {
              const linesToDelete = (currentSnapshot.inscriptions || []).filter(
                (l) => !l.target || l.target === 'headstone',
              );
              for (const line of linesToDelete) {
                bridge.deleteInscription(line.id, exp());
              }
              const motifsToDelete = (
                currentSnapshot.selectedMotifs || []
              ).filter((m) => {
                const off = currentSnapshot.motifOffsets?.[m.id];
                return !off || !off.target || off.target === 'headstone';
              });
              for (const m of motifsToDelete) {
                bridge.deleteMotif(m.id, exp());
              }
            }

            const inscriptionsToAdd = [];
            const motifsToAdd = [];

            const h = Number(currentSnapshot.heightMm) || 900;
            const isPlaque =
              preset === 'bronze_plaque' ||
              (h <= 450 && String(currentSnapshot.productId) === '5');
            const hasCenterMotif = Boolean(centerMotif?.svgPath);

            // Center motif: in companion_both with position 'divider' it acts as the central vertical divider; default 'crown' places it in the apex under the arch.
            const isDivider =
              preset === 'companion_both' &&
              centerMotif?.position === 'divider';

            if (hasCenterMotif) {
              motifsToAdd.push({
                categoryId: centerMotif.categoryId || 'misc',
                svgPath: centerMotif.svgPath,
                color: centerMotif.color || textColor,
                heightMm:
                  centerMotif.heightMm ||
                  (isPlaque
                    ? Math.round(h * 0.12)
                    : isDivider
                    ? 90
                    : Math.min(80, Math.round(h * 0.09))),
                xPos: 0,
                yPos: isPlaque
                  ? -Math.round(h * 0.33)
                  : isDivider
                  ? -Math.round(h * 0.02)
                  : -Math.min(Math.round(h * 0.23), 195),
              });
            }

            // Header text (e.g. "Ś. P." or "IN LOVING MEMORY") on headstone
            if (headerText && !isPlaque) {
              inscriptionsToAdd.push({
                text: headerText,
                font: headerFont || 'Garamond',
                sizeMm:
                  headerSizeMm ||
                  (hasCenterMotif && !isDivider ? 28 : 32),
                color: textColor,
                xPos: 0,
                yPos:
                  hasCenterMotif && !isDivider
                    ? Math.round(h * 0.125)
                    : Math.round(h * 0.22),
                textAlign: 'center',
                target: 'headstone',
                coordinateSpace: 'mm-center',
              });
            }

            const resolvePersonNames = (p) => {
              if (!p) return null;
              if (p.firstName || p.lastName) {
                return { firstName: p.firstName, lastName: p.lastName };
              }
              if (
                p.splitName !== false &&
                p.name &&
                p.name.includes(' ') &&
                !p.name.includes('\n')
              ) {
                const parts = p.name.trim().split(/\s+/);
                return {
                  firstName: parts.slice(0, -1).join(' '),
                  lastName: parts[parts.length - 1],
                };
              }
              return { singleName: p.name };
            };

            if (isPlaque) {
              const person = leftPerson || rightPerson;
              if (person || headerText) {
                const names = resolvePersonNames(person);
                const personName =
                  names?.singleName ||
                  [names?.firstName, names?.lastName].filter(Boolean).join(' ') ||
                  person?.name ||
                  '';
                const role = titleRole || person?.relation;
                const sub = subtitleText;
                const dates = person?.dates?.trim();
                const formattedDates = dates
                  ? /^\d{4}$/.test(dates)
                    ? `— ${dates} —`
                    : dates
                  : undefined;
                const bottom = bottomText;

                const plaqueItems = [];
                if (headerText) {
                  plaqueItems.push({
                    type: 'header',
                    text: headerText,
                    font: headerFont || 'Garamond',
                    sizeMm:
                      headerSizeMm ||
                      Math.max(13, Math.min(16, Math.round(h * 0.05))),
                  });
                }
                if (personName) {
                  const baseNameSize = Math.max(
                    22,
                    Math.min(30, Math.round(h * 0.088)),
                  );
                  plaqueItems.push({
                    type: 'person',
                    text: personName,
                    font: person?.nameFont || person?.font || 'Garamond',
                    sizeMm:
                      person?.lastNameSizeMm ||
                      person?.firstNameSizeMm ||
                      baseNameSize,
                  });
                }
                if (role) {
                  plaqueItems.push({
                    type: 'role',
                    text: role,
                    font: titleRoleFont || person?.font || 'Garamond',
                    sizeMm:
                      titleRoleSizeMm ||
                      Math.max(11.5, Math.min(14, Math.round(h * 0.043))),
                  });
                }
                if (sub) {
                  plaqueItems.push({
                    type: 'sub',
                    text: sub,
                    font: subtitleFont || person?.font || 'Garamond',
                    sizeMm:
                      subtitleSizeMm ||
                      Math.max(11, Math.min(13, Math.round(h * 0.04))),
                  });
                }
                if (formattedDates) {
                  plaqueItems.push({
                    type: 'dates',
                    text: formattedDates,
                    font: person?.font || 'Garamond',
                    sizeMm:
                      person?.datesSizeMm ||
                      Math.max(12.5, Math.min(15, Math.round(h * 0.046))),
                  });
                }
                if (bottom) {
                  plaqueItems.push({
                    type: 'bottom',
                    text: bottom,
                    font: bottomFont || 'Garamond',
                    sizeMm:
                      bottomSizeMm ||
                      Math.max(10.5, Math.min(12, Math.round(h * 0.038))),
                  });
                }

                const count = plaqueItems.length;
                let yPositions = [];
                if (count <= 2) {
                  yPositions = [Math.round(h * 0.12), -Math.round(h * 0.06)];
                } else if (count === 3) {
                  yPositions = [
                    Math.round(h * 0.18),
                    Math.round(h * 0.04),
                    -Math.round(h * 0.16),
                  ];
                } else if (count === 4) {
                  yPositions = [
                    Math.round(h * 0.2),
                    Math.round(h * 0.07),
                    -Math.round(h * 0.08),
                    -Math.round(h * 0.22),
                  ];
                } else if (count === 5) {
                  yPositions = [
                    Math.round(h * 0.21),
                    Math.round(h * 0.09),
                    -Math.round(h * 0.02),
                    -Math.round(h * 0.14),
                    -Math.round(h * 0.25),
                  ];
                } else {
                  yPositions = [
                    Math.round(h * 0.22),
                    Math.round(h * 0.11),
                    Math.round(h * 0.02),
                    -Math.round(h * 0.08),
                    -Math.round(h * 0.17),
                    -Math.round(h * 0.25),
                  ];
                }

                plaqueItems.forEach((item, idx) => {
                  inscriptionsToAdd.push({
                    text: item.text,
                    font: item.font,
                    sizeMm: item.sizeMm,
                    color: textColor,
                    xPos: 0,
                    yPos: yPositions[idx] ?? 0,
                    textAlign: 'center',
                    target: 'headstone',
                    coordinateSpace: 'mm-center',
                  });
                });
              }
            }
            } else if (preset === 'single_centered') {
              const person = leftPerson || rightPerson;
              if (person) {
                const names = resolvePersonNames(person);
                const hasSplit = Boolean(names?.firstName && names?.lastName);

                if (hasSplit) {
                  inscriptionsToAdd.push({
                    text: names.firstName,
                    font: person.nameFont || person.font || 'Garamond',
                    sizeMm: person.firstNameSizeMm || 44,
                    color: textColor,
                    xPos: 0,
                    yPos: Math.round(h * 0.092),
                    textAlign: 'center',
                    target: 'headstone',
                    coordinateSpace: 'mm-center',
                  });
                  inscriptionsToAdd.push({
                    text: names.lastName,
                    font: person.nameFont || person.font || 'Garamond',
                    sizeMm: person.lastNameSizeMm || 50,
                    color: textColor,
                    xPos: 0,
                    yPos: 0,
                    textAlign: 'center',
                    target: 'headstone',
                    coordinateSpace: 'mm-center',
                  });
                } else if (
                  names?.singleName ||
                  names?.firstName ||
                  names?.lastName
                ) {
                  inscriptionsToAdd.push({
                    text:
                      names.singleName || names.firstName || names.lastName,
                    font: person.nameFont || person.font || 'Garamond',
                    sizeMm:
                      person.lastNameSizeMm ||
                      person.firstNameSizeMm ||
                      46,
                    color: textColor,
                    xPos: 0,
                    yPos: Math.round(h * 0.06),
                    textAlign: 'center',
                    target: 'headstone',
                    coordinateSpace: 'mm-center',
                  });
                }

                if (person.dates) {
                  inscriptionsToAdd.push({
                    text: person.dates,
                    font: person.font || 'Garamond',
                    sizeMm: person.datesSizeMm || 22,
                    color: textColor,
                    xPos: 0,
                    yPos: hasSplit
                      ? -Math.round(h * 0.086)
                      : -Math.round(h * 0.04),
                    textAlign: 'center',
                    target: 'headstone',
                    coordinateSpace: 'mm-center',
                  });
                }

                if (person.relation) {
                  inscriptionsToAdd.push({
                    text: person.relation,
                    font: person.font || 'Garamond',
                    sizeMm: 20,
                    color: textColor,
                    xPos: 0,
                    yPos: -Math.round(h * 0.13),
                    textAlign: 'center',
                    target: 'headstone',
                    coordinateSpace: 'mm-center',
                  });
                }
              }
            } else if (
              preset === 'companion_left' ||
              preset === 'companion_both'
            ) {
              const colX = Math.max(135, Math.round(Number(currentSnapshot.widthMm || 700) * 0.20));

              const addPersonColumn = (person, sign) => {
                const posX = sign * colX;
                if (person.motifSvgPath) {
                  motifsToAdd.push({
                    categoryId: person.motifCategoryId || 'misc',
                    svgPath: person.motifSvgPath,
                    color: person.motifColor || textColor,
                    heightMm: person.motifHeightMm || Math.min(50, Math.round(h * 0.08)),
                    xPos: posX,
                    yPos: -Math.round(h * 0.22),
                  });
                }

                const names = resolvePersonNames(person);
                const hasSplit = Boolean(names?.firstName && names?.lastName);

                const nameY =
                  hasCenterMotif && !isDivider
                    ? Math.round(h * 0.065)
                    : Math.round(h * 0.09);
                const surnameY =
                  hasCenterMotif && !isDivider
                    ? -Math.round(h * 0.005)
                    : Math.round(h * 0.01);
                const singleNameY =
                  hasCenterMotif && !isDivider
                    ? Math.round(h * 0.035)
                    : Math.round(h * 0.05);
                const date1Y =
                  hasCenterMotif && !isDivider
                    ? -Math.round(h * 0.065)
                    : -Math.round(h * 0.06);
                const date2Y = -Math.round(h * 0.105);

                if (hasSplit) {
                  inscriptionsToAdd.push({
                    text: names.firstName,
                    font: person.nameFont || person.font || 'Garamond',
                    sizeMm: person.firstNameSizeMm || 36,
                    color: textColor,
                    xPos: posX,
                    yPos: nameY,
                    textAlign: 'center',
                    target: 'headstone',
                    coordinateSpace: 'mm-center',
                  });
                  inscriptionsToAdd.push({
                    text: names.lastName,
                    font: person.nameFont || person.font || 'Garamond',
                    sizeMm: person.lastNameSizeMm || 42,
                    color: textColor,
                    xPos: posX,
                    yPos: surnameY,
                    textAlign: 'center',
                    target: 'headstone',
                    coordinateSpace: 'mm-center',
                  });
                } else if (names?.singleName || names?.firstName || names?.lastName) {
                  inscriptionsToAdd.push({
                    text: names.singleName || names.firstName || names.lastName,
                    font: person.nameFont || person.font || 'Garamond',
                    sizeMm: person.lastNameSizeMm || person.firstNameSizeMm || 40,
                    color: textColor,
                    xPos: posX,
                    yPos: singleNameY,
                    textAlign: 'center',
                    target: 'headstone',
                    coordinateSpace: 'mm-center',
                  });
                }

                if (person.dates) {
                  const rawDates = person.dates.trim();
                  if (rawDates.includes('\n')) {
                    const lines = rawDates.split('\n');
                    inscriptionsToAdd.push({
                      text: lines[0].trim(),
                      font: person.font || 'Garamond',
                      sizeMm: person.datesSizeMm || 20,
                      color: textColor,
                      xPos: posX,
                      yPos: date1Y,
                      textAlign: 'center',
                      target: 'headstone',
                      coordinateSpace: 'mm-center',
                    });
                    if (lines[1]) {
                      inscriptionsToAdd.push({
                        text: lines[1].trim(),
                        font: person.font || 'Garamond',
                        sizeMm: person.datesSizeMm || 20,
                        color: textColor,
                        xPos: posX,
                        yPos: date2Y,
                        textAlign: 'center',
                        target: 'headstone',
                        coordinateSpace: 'mm-center',
                      });
                    }
                  } else if (rawDates.includes('†') || rawDates.includes('zm.')) {
                    const sep = rawDates.includes('†') ? '†' : 'zm.';
                    const parts = rawDates.split(sep);
                    inscriptionsToAdd.push({
                      text: parts[0].trim(),
                      font: person.font || 'Garamond',
                      sizeMm: person.datesSizeMm || 20,
                      color: textColor,
                      xPos: posX,
                      yPos: date1Y,
                      textAlign: 'center',
                      target: 'headstone',
                      coordinateSpace: 'mm-center',
                    });
                    inscriptionsToAdd.push({
                      text: `${sep} ${parts[1].trim()}`,
                      font: person.font || 'Garamond',
                      sizeMm: person.datesSizeMm || 20,
                      color: textColor,
                      xPos: posX,
                      yPos: date2Y,
                      textAlign: 'center',
                      target: 'headstone',
                      coordinateSpace: 'mm-center',
                    });
                  } else {
                    inscriptionsToAdd.push({
                      text: rawDates,
                      font: person.font || 'Garamond',
                      sizeMm: person.datesSizeMm || 20,
                      color: textColor,
                      xPos: posX,
                      yPos: date1Y,
                      textAlign: 'center',
                      target: 'headstone',
                      coordinateSpace: 'mm-center',
                    });
                  }
                }

                if (person.relation) {
                  inscriptionsToAdd.push({
                    text: person.relation,
                    font: person.font || 'Garamond',
                    sizeMm: 18,
                    color: textColor,
                    xPos: posX,
                    yPos: -Math.round(h * 0.145),
                    textAlign: 'center',
                    target: 'headstone',
                    coordinateSpace: 'mm-center',
                  });
                }
              };

              if (leftPerson) addPersonColumn(leftPerson, -1);
              if (preset === 'companion_both' && rightPerson) addPersonColumn(rightPerson, 1);
            } else if (preset === 'companion_shared_surname') {
              const surnameText =
                sharedSurname ||
                leftPerson?.lastName ||
                rightPerson?.lastName ||
                'KOWALSCY';
              const surnameY = Math.round(h * 0.08);
              inscriptionsToAdd.push({
                text: surnameText,
                font: sharedSurnameFont || leftPerson?.nameFont || 'Garamond',
                sizeMm: sharedSurnameSizeMm || 50,
                color: textColor,
                xPos: 0,
                yPos: surnameY,
                textAlign: 'center',
                target: 'headstone',
                coordinateSpace: 'mm-center',
              });

              const colX = Math.max(130, Math.round(Number(currentSnapshot.widthMm || 800) * 0.20));

              const addPersonColumnShared = (person, sign) => {
                const posX = sign * colX;
                const names = resolvePersonNames(person);
                const firstName = names?.firstName || names?.singleName || person.name;

                if (firstName) {
                  inscriptionsToAdd.push({
                    text: firstName,
                    font: person.nameFont || person.font || 'Garamond',
                    sizeMm: person.firstNameSizeMm || 36,
                    color: textColor,
                    xPos: posX,
                    yPos: Math.round(h * 0.005),
                    textAlign: 'center',
                    target: 'headstone',
                    coordinateSpace: 'mm-center',
                  });
                }

                if (person.dates) {
                  const rawDates = person.dates.trim();
                  if (rawDates.includes('\n')) {
                    const lines = rawDates.split('\n');
                    inscriptionsToAdd.push({
                      text: lines[0].trim(),
                      font: person.font || 'Garamond',
                      sizeMm: person.datesSizeMm || 20,
                      color: textColor,
                      xPos: posX,
                      yPos: -Math.round(h * 0.055),
                      textAlign: 'center',
                      target: 'headstone',
                      coordinateSpace: 'mm-center',
                    });
                    if (lines[1]) {
                      inscriptionsToAdd.push({
                        text: lines[1].trim(),
                        font: person.font || 'Garamond',
                        sizeMm: person.datesSizeMm || 20,
                        color: textColor,
                        xPos: posX,
                        yPos: -Math.round(h * 0.095),
                        textAlign: 'center',
                        target: 'headstone',
                        coordinateSpace: 'mm-center',
                      });
                    }
                  } else if (rawDates.includes('†') || rawDates.includes('zm.')) {
                    const sep = rawDates.includes('†') ? '†' : 'zm.';
                    const parts = rawDates.split(sep);
                    inscriptionsToAdd.push({
                      text: parts[0].trim(),
                      font: person.font || 'Garamond',
                      sizeMm: person.datesSizeMm || 20,
                      color: textColor,
                      xPos: posX,
                      yPos: -Math.round(h * 0.055),
                      textAlign: 'center',
                      target: 'headstone',
                      coordinateSpace: 'mm-center',
                    });
                    inscriptionsToAdd.push({
                      text: `${sep} ${parts[1].trim()}`,
                      font: person.font || 'Garamond',
                      sizeMm: person.datesSizeMm || 20,
                      color: textColor,
                      xPos: posX,
                      yPos: -Math.round(h * 0.095),
                      textAlign: 'center',
                      target: 'headstone',
                      coordinateSpace: 'mm-center',
                    });
                  } else {
                    inscriptionsToAdd.push({
                      text: rawDates,
                      font: person.font || 'Garamond',
                      sizeMm: person.datesSizeMm || 20,
                      color: textColor,
                      xPos: posX,
                      yPos: -Math.round(h * 0.065),
                      textAlign: 'center',
                      target: 'headstone',
                      coordinateSpace: 'mm-center',
                    });
                  }
                }
              };

              if (leftPerson) addPersonColumnShared(leftPerson, -1);
              if (rightPerson) addPersonColumnShared(rightPerson, 1);
            }

            // Bottom text / concluding sentiment / valediction (e.g. "Spoczywaj w pokoju")
            if (bottomText) {
              inscriptionsToAdd.push({
                text: bottomText,
                font: bottomFont || 'Great Vibes',
                sizeMm: bottomSizeMm || 26,
                color: textColor,
                xPos: 0,
                yPos: -Math.round(h * 0.165),
                textAlign: 'center',
                target: 'headstone',
                coordinateSpace: 'mm-center',
              });
            }

            const motifResults = [];
            for (const m of motifsToAdd) {
              const res = await bridge.addMotif(
                m.categoryId,
                m.svgPath,
                exp(),
                {
                  xPos: m.xPos,
                  yPos: m.yPos,
                  heightMm: m.heightMm,
                  color: m.color,
                },
              );
              motifResults.push({ m, res });
            }

            if (inscriptionsToAdd.length > 0) {
              bridge.addInscriptions(inscriptionsToAdd, exp());
            }

            return {
              data: bridge.read(),
              applied: {
                preset,
                inscriptionsCount: inscriptionsToAdd.length,
                motifsCount: motifsToAdd.length,
                motifResults,
              },
            };
          },
          {
            preset,
            sharedSurname,
            sharedSurnameFont,
            sharedSurnameSizeMm,
            headerText,
            headerFont,
            headerSizeMm,
            bottomText,
            bottomFont,
            bottomSizeMm,
            textColor,
            leftPerson,
            rightPerson,
            centerMotif,
            clearExisting,
          },
        );
        await page.waitForTimeout(300);
        return res;
      }),
    ),
);

// Deduplication is deliberately limited to this process. Keep failures cached,
// since a lost HTTP response can mean the project was saved on the server.
const saves = new Map();
server.registerTool(
  'save_design',
  {
    description:
      'Save the requested revision to the signed-in account. Provide a unique idempotencyKey and reuse it for retries in this MCP process. A failed save may have succeeded; verify the account before retrying with a new key.',
    inputSchema: {
      title: z.string().trim().min(1).max(200),
      expectedRevision: revisionSchema,
      idempotencyKey: z.string().min(1).max(200),
    },
  },
  ({ title, expectedRevision, idempotencyKey }) => {
    const intent = JSON.stringify({ title, expectedRevision });
    const existing = saves.get(idempotencyKey);
    if (existing)
      return existing.intent === intent
        ? existing.promise
        : failure(
            'IDEMPOTENCY_CONFLICT',
            'This key was already used for a different save.',
          );
    const promise = withPage(async (page) => {
      try {
        return await withRevision(page, expectedRevision, (expected) =>
          page.evaluate(
            ({ title, expected }) =>
              window.__designerAgentBridge.save(title, expected),
            { title, expected },
          ),
        );
      } catch (error) {
        return failure(
          'SAVE_OUTCOME_UNKNOWN',
          `Save may have completed. Check the account before retrying: ${error instanceof Error ? error.message : String(error)}`,
        );
      }
    });
    saves.set(idempotencyKey, { intent, promise });
    return promise;
  },
);

server.registerTool(
  'save_local_design',
  {
    description:
      'Save locally only after visually inspecting the image from get_preview and confirming it is acceptable. Review motifLayout warnings and unchecked items; they do not guarantee visual correctness. Pass that previewId and visuallyReviewed=true. The image and revision must match the current design. No account or shareable link is created.',
    inputSchema: {
      title: z.string().trim().min(1).max(200),
      expectedRevision: revisionSchema,
      previewId: z
        .string()
        .uuid()
        .describe(
          'The previewId returned with the image from get_preview for this exact design.',
        ),
      visuallyReviewed: z
        .literal(true)
        .describe(
          'Set true only after actually viewing the image and confirming it meets the requested visual requirements.',
        ),
    },
  },
  ({ title, expectedRevision, previewId }) =>
    withPage(async (page) => {
      const url = new URL(page.url());
      if (!['localhost', '127.0.0.1', '[::1]'].includes(url.hostname))
        return failure(
          'LOCAL_ONLY',
          'Local exports require a local development designer tab.',
        );
      const before = await read(page);
      const currentRevision = revision(before.snapshot);
      if (!revisionMatches(page, expectedRevision, currentRevision))
        return failure(
          'REVISION_CONFLICT',
          'The design has changed. Read it again before saving.',
        );
      let preview = localPreviews.get(previewId);
      if (!preview) {
        try {
          const cachedFile = path.join(previewCacheDir, `${previewId}.json`);
          const content = await readFile(cachedFile, 'utf8');
          preview = JSON.parse(content);
          if (preview) localPreviews.set(previewId, preview);
        } catch {}
      }
      const activeSession = await currentSessionId(page);
      if (
        !preview ||
        (preview.sessionId && preview.sessionId !== activeSession) ||
        Date.now() - preview.createdAt > previewLifetimeMs ||
        preview.revision !== currentRevision
      ) {
        return failure(
          'PREVIEW_REVIEW_REQUIRED',
          'Get and visually review a new preview of the current revision before saving.',
        );
      }
      const id = randomUUID();
      const filePath = path.join(localDraftDirectory, `${id}.json`);
      const previewPath = path.join(localDraftDirectory, `${id}.jpg`);
      try {
        await mkdir(localDraftDirectory, { recursive: true });
        await writeFile(previewPath, Buffer.from(preview.imageData, 'base64'), {
          flag: 'wx',
        });
        await writeFile(
          filePath,
          JSON.stringify(
            {
              version: 1,
              id,
              title,
              revision: currentRevision,
              savedAt: new Date().toISOString(),
              snapshot: before.snapshot,
              quote: before.quote,
              renderedInscriptionPositions:
                preview.renderedInscriptionPositions,
              motifLayout: preview.motifLayout,
              preview: `data:image/jpeg;base64,${preview.imageData}`,
            },
            null,
            2,
          ),
          { encoding: 'utf8', flag: 'wx' },
        );
      } catch (error) {
        return failure(
          'LOCAL_SAVE_FAILED',
          `Local export failed; a partial file may remain. ${error instanceof Error ? error.message : String(error)}`,
        );
      }
      return response({
        id,
        title,
        revision: currentRevision,
        filePath,
        previewPath,
        storage: 'local-file',
        shareable: false,
        motifLayout: preview.motifLayout,
      });
    }),
);
server.registerTool(
  'get_design',
  {
    description:
      'Read the current local designer project and estimate. The revision changes when serialized design data changes.',
  },
  () => withPage(async (page) => response(result(await read(page)))),
);
server.registerTool(
  'list_inscriptions',
  {
    description:
      'List all inscriptions and their exact IDs, target surfaces and coordinate spaces.',
  },
  () =>
    withPage(async (page) => {
      const data = await read(page);
      return response({
        revision: revision(data.snapshot),
        selectedInscriptionId: data.selectedInscriptionId,
        inscriptions: data.snapshot.inscriptions,
      });
    }),
);
server.registerTool(
  'get_preview',
  {
    description:
      'Capture a current image for the requested revision. The text includes previewId for save_local_design after visual review. motifLayout reports conservative bounding-box warnings for headstone motifs on product 124 and identifies unchecked motifs. These checks do not cover exact shape silhouette, transparency, lettering, contrast or legibility. Inspect the image. Other product types and remaining assets may be unverified.',
    inputSchema: { expectedRevision: revisionSchema },
  },
  ({ expectedRevision }) =>
    withPage(async (page) => {
      const before = await read(page);
      const currentRevision = revision(before.snapshot);
      if (!revisionMatches(page, expectedRevision, currentRevision))
        return failure(
          'REVISION_CONFLICT',
          'The design has changed. Read it again before requesting a preview.',
        );
      try {
        const outcome = await page.evaluate(
          (expected) => window.__designerAgentBridge.preview(expected),
          JSON.stringify(before.snapshot),
        );
        if (outcome.error)
          return failure(
            'REVISION_CONFLICT',
            'The design changed during preview capture.',
          );
        const imageData = outcome.screenshot?.match(
          /^data:image\/jpeg;base64,(.+)$/,
        )?.[1];
        if (!imageData)
          return failure('PREVIEW_NOT_READY', 'No preview is available.');
        for (const [id, item] of localPreviews) {
          if (Date.now() - item.createdAt > previewLifetimeMs)
            localPreviews.delete(id);
        }
        while (localPreviews.size >= 20)
          localPreviews.delete(localPreviews.keys().next().value);
        const previewId = randomUUID();
        const renderedInscriptionPositions = await page.evaluate(() =>
          window.__designerAgentBridge.renderedInscriptionPositions(),
        );
        const stoneMetrics = await page.evaluate(() => {
          let stone;
          window.__r3fScene?.traverse((o) => {
            if (!stone && o.name === 'headstone' && o.geometry) stone = o;
          });
          stone?.geometry?.computeBoundingBox();
          const bb = stone?.geometry?.boundingBox;
          if (!bb) return { scale: 1, centerY: 0 };
          const meshH = bb.max.y - bb.min.y;
          const storeH =
            Number(
              window.__designerAgentBridge?.read()?.snapshot?.heightMm,
            ) || meshH;
          const scale = storeH > 0 ? meshH / storeH : 1;
          const centerY = (bb.min.y + bb.max.y) / 2;
          return { scale, centerY };
        });
        if (revision((await read(page)).snapshot) !== currentRevision)
          return failure(
            'REVISION_CONFLICT',
            'The design changed during preview capture.',
          );
        const activeSession = await currentSessionId(page);
        const previewRecord = {
          previewId,
          sessionId: activeSession,
          page,
          revision: currentRevision,
          imageData,
          renderedInscriptionPositions,
          motifLayout: outcome.motifLayout,
          createdAt: Date.now(),
        };
        localPreviews.set(previewId, previewRecord);
        try {
          await mkdir(previewCacheDir, { recursive: true });
          await writeFile(
            path.join(previewCacheDir, `${previewId}.json`),
            JSON.stringify({
              previewId,
              sessionId: activeSession,
              revision: currentRevision,
              imageData,
              renderedInscriptionPositions,
              motifLayout: outcome.motifLayout,
              createdAt: Date.now(),
            }),
            'utf8',
          );
          const files = await readdir(previewCacheDir);
          const now = Date.now();
          for (const file of files) {
            if (!file.endsWith('.json')) continue;
            const fp = path.join(previewCacheDir, file);
            const s = await stat(fp).catch(() => null);
            if (s && now - s.mtimeMs > previewLifetimeMs) {
              void rm(fp, { force: true }).catch(() => {});
            }
          }
        } catch {}
        const inscriptions = before.snapshot.inscriptions || [];
        const widthMm = Number(before.snapshot.widthMm) || 0;
        const inscriptionWarnings = [];
        const scale = stoneMetrics?.scale || 1;
        const centerY = stoneMetrics?.centerY || 0;

        const toMmCoords = (line) => {
          const rawX = Number(line.xPos) || 0;
          const rawY = Number(line.yPos) || 0;
          if (line.coordinateSpace === 'mm-center') {
            return { xMm: rawX, yMm: rawY };
          }
          return {
            xMm: scale > 0 ? rawX / scale : rawX,
            yMm: scale > 0 ? (rawY - centerY) / scale : rawY,
          };
        };

        for (let i = 0; i < inscriptions.length; i++) {
          const line = inscriptions[i];
          if (!line.target || line.target === 'headstone') {
            const sizeMm = Number(line.sizeMm) || 0;
            const { xMm, yMm } = toMmCoords(line);

            if (widthMm >= 700 && sizeMm < 20) {
              inscriptionWarnings.push(
                `Line '${line.text}' has sizeMm ${line.sizeMm} < 20 mm; text may be too small to be legible in preview on a ${widthMm} mm headstone.`,
              );
            }
            if (widthMm > 0 && Math.abs(xMm) > (widthMm / 2) * 0.8) {
              inscriptionWarnings.push(
                `Line '${line.text}' at xPos ${Math.round(xMm)} mm is near the outer edge of the stone (width: ${widthMm} mm). On curved stones, margin collisions may occur.`,
              );
            }

            // Check collision with preceding lines on headstone
            for (let j = 0; j < i; j++) {
              const other = inscriptions[j];
              if (!other.target || other.target === 'headstone') {
                const otherSize = Number(other.sizeMm) || 0;
                const { xMm: otherXMm, yMm: otherYMm } = toMmCoords(other);

                const textLen = (line.text || '').length;
                const otherLen = (other.text || '').length;
                const halfW = (textLen * sizeMm * 0.52) / 2;
                const otherHalfW = (otherLen * otherSize * 0.52) / 2;

                const xOverlap =
                  Math.abs(xMm - otherXMm) < halfW + otherHalfW - 10;
                const minRequiredYGap = (sizeMm + otherSize) * 0.55;
                const yDeltaMm = Math.abs(yMm - otherYMm);

                if (xOverlap && yDeltaMm < minRequiredYGap) {
                  inscriptionWarnings.push(
                    `TEXT_COLLISION: Line '${line.text}' at (x: ${Math.round(xMm)}, y: ${Math.round(yMm)}) overlaps or collides vertically with line '${other.text}' at (x: ${Math.round(otherXMm)}, y: ${Math.round(otherYMm)}) (vertical gap: ${Math.round(yDeltaMm)} mm < minimum required ${Math.round(minRequiredYGap)} mm). Shift lines further apart in Y or move to separate columns.`,
                  );
                }
              }
            }
          }
        }

        // Check collision between motifs and inscriptions on headstone
        const selectedMotifs = before.snapshot.selectedMotifs || [];
        const motifOffsets = before.snapshot.motifOffsets || {};
        for (const m of selectedMotifs) {
          const off = motifOffsets[m.id];
          if (!off || !off.target || off.target === 'headstone') {
            const mX = Number(off?.xPos) || 0;
            const rawY = Number(off?.yPos) || 0;
            const isOffset =
              off?.coordinateSpace === 'offset' || !off?.coordinateSpace;
            const mY = isOffset ? -rawY : rawY;
            const mHeight = Number(off?.heightMm) || 100;
            const isCross =
              (m.svgPath || '').toLowerCase().includes('cross') ||
              (m.name || '').toLowerCase().includes('cross');
            const mWidth = isCross ? mHeight * 0.45 : mHeight;

            for (const line of inscriptions) {
              if (!line.target || line.target === 'headstone') {
                const { xMm: lineX, yMm: lineY } = toMmCoords(line);
                const lineSize = Number(line.sizeMm) || 20;
                const lineLen = (line.text || '').length;
                const lineHalfW = (lineLen * lineSize * 0.52) / 2;
                const lineHalfH = lineSize / 2;

                const mHalfW = mWidth / 2;
                const mHalfH = mHeight / 2;

                const xOverlap = Math.abs(mX - lineX) < mHalfW + lineHalfW;
                const yOverlap = Math.abs(mY - lineY) < mHalfH + lineHalfH + 8;

                if (xOverlap && yOverlap) {
                  inscriptionWarnings.push(
                    `MOTIF_COLLISION: Motif '${m.svgPath || m.id}' at (x: ${mX}, y: ${off?.yPos}) collides/overlaps with inscription '${line.text}' at (x: ${Math.round(lineX)}, y: ${Math.round(lineY)}). Move the motif away from the text.`,
                  );
                }
              }
            }
          }
        }
        // Check if upper crown/arch is left empty on tall arched headstones
        let highestPointOnStone = -9999;
        for (const line of inscriptions) {
          if (!line.target || line.target === 'headstone') {
            const { yMm } = toMmCoords(line);
            const lineSize = Number(line.sizeMm) || 20;
            const top = yMm + lineSize / 2;
            if (top > highestPointOnStone) highestPointOnStone = top;
          }
        }
        for (const m of selectedMotifs) {
          const off = motifOffsets[m.id];
          if (!off || !off.target || off.target === 'headstone') {
            const rawY = Number(off?.yPos) || 0;
            const isOffset =
              off?.coordinateSpace === 'offset' || !off?.coordinateSpace;
            const mY = isOffset ? -rawY : rawY;
            const top = mY + (Number(off?.heightMm) || 100) / 2;
            if (top > highestPointOnStone) highestPointOnStone = top;
          }
        }

        const heightMm = Number(before.snapshot.heightMm) || 0;
        if (heightMm >= 750 && highestPointOnStone < heightMm * 0.16) {
          inscriptionWarnings.push(
            `EMPTY_TOP_CROWN: The top crown/arch of the headstone is empty (highest element reaches only yPos: ${Math.round(highestPointOnStone)} mm, while the stone arch reaches up to +${Math.round(heightMm / 2)} mm). Move the top motif or header higher into the crown (yPos: +${Math.round(heightMm * 0.2)} mm) to fill the monument gracefully.`,
          );
        }

        const inscriptionLayout = {
          linesCount: inscriptions.length,
          warnings: inscriptionWarnings,
        };
        return {
          // Some MCP hosts prefer structuredContent over content and thereby
          // discard the image. Keep the image and metadata in the same content
          // list so hosts cannot replace the image with a metadata-only result.
          content: [
            { type: 'image', data: imageData, mimeType: 'image/jpeg' },
            {
              type: 'text',
              text: JSON.stringify({
                revision: currentRevision,
                previewId,
                inscriptionGlyphsReady: true,
                imageTexturesReady: true,
                motifTexturesReady: true,
                additionModelsReady: true,
                emblemTexturesReady: true,
                shapeReady: outcome.structuralReadiness?.supported
                  ? true
                  : 'unverified',
                headstoneMaterialReady: outcome.structuralReadiness?.supported
                  ? true
                  : 'unverified',
                baseReady: outcome.structuralReadiness?.supported
                  ? before.snapshot.showBase
                    ? true
                    : 'not_applicable'
                  : 'unverified',
                structuralReadinessScope: outcome.structuralReadiness?.supported
                  ? 'traditional-engraved-headstone'
                  : 'unsupported-product',
                motifLayout: outcome.motifLayout,
                inscriptionLayout,
                otherAssetsReady: 'unverified',
              }),
            },
          ],
        };
      } catch (error) {
        return failure(
          'PREVIEW_NOT_READY',
          error instanceof Error ? error.message : String(error),
        );
      }
    }),
);

server.registerTool(
  'update_inscription',
  {
    description:
      'Update one inscription by ID. New base inscriptions use mm-center coordinates: xPos and yPos are millimetres from the front-face centre, positive yPos is upwards. Read list_inscriptions for the existing coordinateSpace before moving an inscription. Returns the applied values and a new revision; rendering may still be pending.',
    inputSchema: {
      id: z.string().min(1),
      expectedRevision: revisionSchema,
      patch,
    },
  },
  ({ id, expectedRevision, patch: changes }) =>
    withPage(async (page) => {
      const before = await read(page);
      if (!revisionMatches(page, expectedRevision, revision(before.snapshot)))
        return failure(
          'REVISION_CONFLICT',
          'The design has changed. Read it again before updating.',
        );
      const outcome = await page.evaluate(
        ({ id, changes, expected }) =>
          window.__designerAgentBridge.updateInscription(id, changes, expected),
        { id, changes, expected: JSON.stringify(before.snapshot) },
      );
      if (outcome.error)
        return failure(
          outcome.error,
          outcome.error === 'NOT_FOUND'
            ? 'Inscription not found.'
            : outcome.error === 'REVISION_CONFLICT'
              ? 'The design has changed. Read it again before updating.'
              : `Operation failed: ${outcome.error}`,
        );
      return response({
        ...result(outcome.data),
        inscription: outcome.data.snapshot.inscriptions.find(
          (line) => line.id === id,
        ),
        renderStatus: 'pending',
      });
    }),
);

server.server.onclose = () => {
  localSessions.clear();
};
await server.connect(new StdioServerTransport());
process.on('SIGTERM', () => {
  void server.close().then(async () => {
    const browser = await browserPromise?.catch(() => undefined);
    await browser?.close();
  });
});
