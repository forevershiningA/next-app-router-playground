import { createHash } from 'node:crypto';
import { chromium } from 'playwright';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

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
const browser = await chromium.connectOverCDP(endpoint.href);
const server = new McpServer({
  name: 'forevershining-designer-local',
  version: '0.1.0',
});
const revision = (snapshot) =>
  createHash('sha256').update(JSON.stringify(snapshot)).digest('hex');
const response = (value) => ({
  content: [{ type: 'text', text: JSON.stringify(value) }],
  structuredContent: value,
});
const failure = (code, message) => ({
  content: [{ type: 'text', text: JSON.stringify({ code, message }) }],
  isError: true,
});

let pinnedLivePage;
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
async function pageForSession() {
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
  const candidates = [];
  for (const page of pages) {
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
const revisionSchema = z.string().regex(/^[a-f0-9]{64}$/);
async function withRevision(page, expectedRevision, action) {
  const before = await read(page);
  if (revision(before.snapshot) !== expectedRevision)
    return failure(
      'REVISION_CONFLICT',
      'The design has changed. Read it again.',
    );
  const outcome = await action(JSON.stringify(before.snapshot));
  if (outcome.error)
    return failure(
      outcome.error,
      outcome.error === 'NOT_FOUND'
        ? 'The requested item was not found.'
        : `Operation failed: ${outcome.error}`,
    );
  return response(
    outcome.data
      ? {
          ...result(outcome.data),
          ...(outcome.id ? { id: outcome.id } : {}),
          renderStatus: 'pending',
        }
      : { ...outcome, revision: expectedRevision },
  );
}

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
    withPage((page) =>
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
    withPage((page) =>
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
server.registerTool(
  'add_motif',
  {
    description:
      'Add a motif using a categoryId and svgPath returned by list_motifs. Default placement and color follow current editor state. Requires the current design revision.',
    inputSchema: {
      categoryId: z.string().min(1),
      svgPath: z.string().min(1),
      expectedRevision: revisionSchema,
    },
  },
  ({ categoryId, svgPath, expectedRevision }) =>
    withPage((page) =>
      withRevision(page, expectedRevision, (expected) =>
        page.evaluate(
          ({ categoryId, svgPath, expected }) =>
            window.__designerAgentBridge.addMotif(
              categoryId,
              svgPath,
              expected,
            ),
          { categoryId, svgPath, expected },
        ),
      ),
    ),
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
  'update_motif',
  {
    description:
      'Update a selected motif position, scale, height, rotation, flips or color where supported. Position uses its existing coordinate space; rotation is in degrees. Requires the current design revision.',
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
      'Select a listed material for a supported target surface. Rendering remains pending.',
    inputSchema: {
      materialId: z.string().min(1),
      target: z.enum(['headstone', 'base', 'ledger', 'kerbset']),
      expectedRevision: revisionSchema,
    },
  },
  ({ materialId, target, expectedRevision }) =>
    withPage((page) =>
      withRevision(page, expectedRevision, (expected) =>
        page.evaluate(
          ({ materialId, target, expected }) =>
            window.__designerAgentBridge.setMaterial(
              materialId,
              target,
              expected,
            ),
          { materialId, target, expected },
        ),
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
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, 'Provide an option');
server.registerTool(
  'set_assembly_options',
  {
    description:
      'Set available assembly options: base/ledger/kerbset visibility, base finish, flower pots and flower-pot lid finish. Read get_product_configuration first; unsupported product options are rejected.',
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
    withPage(async (page) =>
      withRevision(page, expectedRevision, (expected) =>
        page.evaluate(
          ({ productId, expected }) =>
            window.__designerAgentBridge.selectProduct(productId, expected),
          { productId, expected },
        ),
      ),
    ),
);
server.registerTool(
  'add_inscription',
  {
    description:
      'Add an inscription on the requested surface, or the selected surface if omitted, using editor defaults. Returns its new ID and design revision.',
    inputSchema: {
      text: z.string().min(1).max(5000),
      target: z.enum(['headstone', 'base', 'ledger']).optional(),
      expectedRevision: revisionSchema,
    },
  },
  ({ text, target, expectedRevision }) =>
    withPage(async (page) =>
      withRevision(page, expectedRevision, (expected) =>
        page.evaluate(
          ({ text, target, expected }) =>
            window.__designerAgentBridge.addInscription(text, target, expected),
          { text, target, expected },
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
      'Capture a current image for the requested revision. Visible inscriptions, images, motifs, additions and emblems are checked; readiness of other assets is not yet guaranteed.',
    inputSchema: { expectedRevision: z.string().regex(/^[a-f0-9]{64}$/) },
  },
  ({ expectedRevision }) =>
    withPage(async (page) => {
      const before = await read(page);
      if (revision(before.snapshot) !== expectedRevision)
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
        return {
          content: [{ type: 'image', data: imageData, mimeType: 'image/jpeg' }],
          structuredContent: {
            revision: expectedRevision,
            inscriptionGlyphsReady: true,
            imageTexturesReady: true,
            motifTexturesReady: true,
            additionModelsReady: true,
            emblemTexturesReady: true,
            otherAssetsReady: 'unverified',
          },
        };
      } catch (error) {
        return failure(
          'PREVIEW_NOT_READY',
          error instanceof Error ? error.message : String(error),
        );
      }
    }),
);

const patch = z
  .object({
    text: z.string().max(5000).optional(),
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
  })
  .strict()
  .refine(
    (value) => Object.keys(value).length > 0,
    'Provide at least one change',
  );
server.registerTool(
  'update_inscription',
  {
    description:
      'Update one inscription by ID. Requires its current design revision; returns applied values and a new revision. The 3D render may still be pending.',
    inputSchema: {
      id: z.string().min(1),
      expectedRevision: z.string().regex(/^[a-f0-9]{64}$/),
      patch,
    },
  },
  ({ id, expectedRevision, patch: changes }) =>
    withPage(async (page) => {
      const before = await read(page);
      if (revision(before.snapshot) !== expectedRevision)
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

await server.connect(new StdioServerTransport());
process.on('SIGTERM', () => {
  void server.close().then(() => browser.close());
});
