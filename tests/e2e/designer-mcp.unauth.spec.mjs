import { test, expect, chromium } from '@playwright/test';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';

async function freePort() {
  const server = net.createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  return port;
}

test('local MCP reads, edits and detects conflicting inscription changes', async ({
  baseURL,
}) => {
  test.setTimeout(90000);
  const profile = await mkdtemp(path.join(os.tmpdir(), 'designer-mcp-test-'));
  const port = await freePort();
  const context = await chromium.launchPersistentContext(profile, {
    headless: true,
    args: [`--remote-debugging-port=${port}`],
  });
  let client;
  try {
    const page = context.pages()[0] ?? (await context.newPage());
    await page.route('**/api/catalog/backgrounds', (route) =>
      route.fulfill({
        json: [
          {
            id: 'test-background',
            name: 'Test background',
            category: 'background',
            textureUrl: '/textures/forever/l/Blue-Pearl.webp',
          },
        ],
      }),
    );
    await page.route('**/api/catalog/sizes?*', (route) =>
      route.fulfill({
        json: [
          { id: 1, width: 150, height: 200, price: 100 },
          { id: 2, width: 200, height: 250, price: 150 },
        ],
      }),
    );
    await page.goto(`${baseURL}/traditional-engraved-headstone/inscriptions`);
    await expect(page.getByTestId('designer-inscriptions-panel')).toBeVisible({
      timeout: 30000,
    });
    await page.waitForFunction(
      () =>
        window.__designerAgentBridge &&
        window.__headstoneStore?.getState().catalog,
    );
    await page.evaluate(() => {
      const store = window.__headstoneStore;
      store.getState().setInscriptions([]);
      store.getState().addInscriptionLine({ text: 'KLEIN', font: 'Arial' });
      store.getState().addInscriptionLine({ text: '1940–2020', font: 'Arial' });
    });
    client = new Client({
      name: 'designer-integration-test',
      version: '1.0.0',
    });
    await client.connect(
      new StdioClientTransport({
        command: process.execPath,
        args: ['scripts/designer-mcp.mjs'],
        env: {
          ...process.env,
          DESIGNER_MCP_CDP_URL: `http://127.0.0.1:${port}`,
        },
        stderr: 'inherit',
      }),
    );
    expect((await client.listTools()).tools.map((tool) => tool.name)).toEqual(
      expect.arrayContaining([
        'list_products',
        'select_product',
        'add_inscription',
        'delete_inscription',
        'save_design',
        'get_design',
        'list_inscriptions',
        'get_preview',
        'update_inscription',
        'duplicate_motif',
        'move_image_to_surface',
      ]),
    );
    await page.evaluate(() => {
      const state = window.__headstoneStore.getState();
      state.setShowBase(true);
      state.addImage({
        id: 'transfer-test',
        typeId: 1,
        typeName: 'Test',
        imageUrl: '/test.png',
        widthMm: 100,
        heightMm: 100,
        xPos: 20,
        yPos: 30,
        rotationZ: 0,
        target: 'headstone',
        coordinateSpace: 'mm-center',
      });
    });
    const imageRevision = (
      await client.callTool({ name: 'get_design', arguments: {} })
    ).structuredContent.revision;
    const movedImage = await client.callTool({
      name: 'move_image_to_surface',
      arguments: {
        id: 'transfer-test',
        target: 'base',
        expectedRevision: imageRevision,
      },
    });
    expect(
      movedImage.structuredContent.snapshot.selectedImages.find(
        (image) => image.id === 'transfer-test',
      ),
    ).toMatchObject({ target: 'base', xPos: 0, yPos: 0 });
    const staleMove = await client.callTool({
      name: 'move_image_to_surface',
      arguments: {
        id: 'transfer-test',
        target: 'headstone',
        expectedRevision: imageRevision,
      },
    });
    expect(staleMove.isError).toBe(true);
    const unavailableMove = await client.callTool({
      name: 'move_image_to_surface',
      arguments: {
        id: 'transfer-test',
        target: 'ledger',
        expectedRevision: movedImage.structuredContent.revision,
      },
    });
    expect(unavailableMove.isError).toBe(true);
    const restoredImage = await client.callTool({
      name: 'move_image_to_surface',
      arguments: {
        id: 'transfer-test',
        target: 'headstone',
        expectedRevision: movedImage.structuredContent.revision,
      },
    });
    expect(
      restoredImage.structuredContent.snapshot.selectedImages.find(
        (image) => image.id === 'transfer-test',
      ),
    ).toMatchObject({
      target: 'headstone',
      coordinateSpace: 'mm-center',
      xPos: 0,
      yPos: 0,
    });
    await page.evaluate(() =>
      window.__headstoneStore.getState().removeImage('transfer-test'),
    );
    const motifId = await page.evaluate(() => {
      const store = window.__headstoneStore;
      store.getState().addMotif('/motifs/Flowers/test.svg');
      return store.getState().selectedMotifId;
    });
    const motifRevision = (
      await client.callTool({ name: 'get_design', arguments: {} })
    ).structuredContent.revision;
    const duplicatedMotif = await client.callTool({
      name: 'duplicate_motif',
      arguments: { id: motifId, expectedRevision: motifRevision },
    });
    expect(duplicatedMotif.structuredContent.id).toBeTruthy();
    expect(duplicatedMotif.structuredContent.id).not.toBe(motifId);
    const staleMotif = await client.callTool({
      name: 'duplicate_motif',
      arguments: { id: motifId, expectedRevision: motifRevision },
    });
    expect(staleMotif.isError).toBeTruthy();
    await page.evaluate(() => {
      const state = window.__headstoneStore.getState();
      state.selectedMotifs.forEach((motif) => state.removeMotif(motif.id));
    });
    await page.evaluate(() =>
      window.__headstoneStore.getState().addAddition('K0096'),
    );
    await page.waitForFunction(
      () => {
        let found = false;
        window.__r3fScene?.traverse((object) => {
          if (object.userData.previewAdditionId) found = true;
        });
        return found;
      },
      null,
      { timeout: 30000 },
    );
    const withAddition = (
      await client.callTool({ name: 'get_design', arguments: {} })
    ).structuredContent;
    const additionPreview = await client.callTool(
      {
        name: 'get_preview',
        arguments: { expectedRevision: withAddition.revision },
      },
      undefined,
      { timeout: 30000 },
    );
    expect(additionPreview.isError).not.toBe(true);
    expect(additionPreview.structuredContent.additionModelsReady).toBe(true);
    await page.evaluate(() => {
      const state = window.__headstoneStore.getState();
      state.selectedAdditions.forEach((id) => state.removeAddition(id));
    });
    let configuration;
    await expect
      .poll(
        async () => {
          const answer = await client.callTool({
            name: 'get_product_configuration',
            arguments: {},
          });
          if (!answer.isError) configuration = answer.structuredContent;
          return !answer.isError;
        },
        { timeout: 30000 },
      )
      .toBe(true);
    expect(configuration.productId).toBe('124');
    expect(configuration.shapes.length).toBeGreaterThan(0);
    expect(configuration.materials.length).toBeGreaterThan(0);
    const invalidShape = await client.callTool({
      name: 'set_shape',
      arguments: {
        shapeId: 'nonexistent',
        expectedRevision: configuration.revision,
      },
    });
    expect(JSON.parse(invalidShape.content[0].text).code).toBe('NOT_FOUND');
    const shaped = await client.callTool({
      name: 'set_shape',
      arguments: {
        shapeId: configuration.shapes[0].id,
        expectedRevision: configuration.revision,
      },
    });
    expect(shaped.isError).not.toBe(true);
    expect(shaped.structuredContent.snapshot.shapeUrl).toBe(
      configuration.shapes[0].url,
    );
    const current = await client.callTool({
      name: 'get_design',
      arguments: {},
    });
    const material = await client.callTool({
      name: 'set_material',
      arguments: {
        materialId: configuration.materials[0].id,
        target: 'headstone',
        expectedRevision: current.structuredContent.revision,
      },
    });
    expect(material.isError).not.toBe(true);
    expect(material.structuredContent.snapshot.headstoneMaterialUrl).toBe(
      configuration.materials[0].url,
    );
    const limits = configuration.dimensions;
    const dimensions = await client.callTool({
      name: 'set_dimensions',
      arguments: {
        widthMm: limits.widthMm.min,
        heightMm: limits.heightMm.min,
        expectedRevision: material.structuredContent.revision,
      },
    });
    expect(dimensions.isError).not.toBe(true);
    expect(dimensions.structuredContent.snapshot).toMatchObject({
      widthMm: limits.widthMm.min,
      heightMm: limits.heightMm.min,
    });
    const invalidSize = await client.callTool({
      name: 'set_dimensions',
      arguments: {
        widthMm: limits.widthMm.max + 1,
        expectedRevision: dimensions.structuredContent.revision,
      },
    });
    expect(JSON.parse(invalidSize.content[0].text).code).toBe(
      'DIMENSION_OUT_OF_RANGE',
    );
    const before = (
      await client.callTool({ name: 'list_inscriptions', arguments: {} })
    ).structuredContent;
    expect(before.inscriptions.map((line) => line.text)).toEqual([
      'KLEIN',
      '1940–2020',
    ]);
    const id = before.inscriptions[0].id;
    const changed = await client.callTool({
      name: 'update_inscription',
      arguments: {
        id,
        expectedRevision: before.revision,
        patch: { text: 'ALEX MORGAN', sizeMm: 50 },
      },
    });
    expect(changed.isError).not.toBe(true);
    expect(changed.structuredContent.inscription).toMatchObject({
      id,
      text: 'ALEX MORGAN',
      sizeMm: 50,
    });
    expect(changed.structuredContent.revision).not.toBe(before.revision);
    await expect(
      page.getByRole('button', { name: 'Edit inscription 1: ALEX MORGAN' }),
    ).toBeVisible();
    const stale = await client.callTool({
      name: 'update_inscription',
      arguments: {
        id,
        expectedRevision: before.revision,
        patch: { text: 'WRONG' },
      },
    });
    expect(stale.isError).toBe(true);
    expect(JSON.parse(stale.content[0].text).code).toBe('REVISION_CONFLICT');
    const unknown = await client.callTool({
      name: 'update_inscription',
      arguments: {
        id: 'unknown',
        expectedRevision: changed.structuredContent.revision,
        patch: { text: 'WRONG' },
      },
    });
    expect(JSON.parse(unknown.content[0].text).code).toBe('NOT_FOUND');
    expect(
      (await client.callTool({ name: 'get_design', arguments: {} }))
        .structuredContent.quote,
    ).toMatchObject({ currency: 'AUD', authority: 'estimate' });
    const preview = await client.callTool(
      {
        name: 'get_preview',
        arguments: { expectedRevision: changed.structuredContent.revision },
      },
      undefined,
      { timeout: 30000 },
    );
    expect(preview.isError).not.toBe(true);
    expect(preview.content[0]).toMatchObject({
      type: 'image',
      mimeType: 'image/jpeg',
    });
    expect(preview.structuredContent.revision).toBe(
      changed.structuredContent.revision,
    );
    await page.evaluate(() =>
      window.__headstoneStore
        .getState()
        .addMotif('/svg/borders/double-line.svg'),
    );
    const withMotif = (
      await client.callTool({ name: 'get_design', arguments: {} })
    ).structuredContent;
    const motifPreview = await client.callTool(
      {
        name: 'get_preview',
        arguments: { expectedRevision: withMotif.revision },
      },
      undefined,
      { timeout: 30000 },
    );
    expect(motifPreview.isError).not.toBe(true);
    expect(motifPreview.structuredContent.motifTexturesReady).toBe(true);
    await page.evaluate(() => {
      const state = window.__headstoneStore.getState();
      state.selectedMotifs.forEach((motif) => state.removeMotif(motif.id));
    });
    const products = await client.callTool({
      name: 'list_products',
      arguments: {},
    });
    expect(products.structuredContent.products).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: '5' }),
        expect.objectContaining({ id: '124' }),
      ]),
    );
    const capabilities = await client.callTool({
      name: 'get_inscription_capabilities',
      arguments: {},
    });
    expect(capabilities.structuredContent.fonts).toContain('Arial');
    const invalidFont = await client.callTool({
      name: 'update_inscription',
      arguments: {
        id,
        expectedRevision: changed.structuredContent.revision,
        patch: { font: 'nonexistent font' },
      },
    });
    expect(JSON.parse(invalidFont.content[0].text).code).toBe('INVALID_FONT');
    const added = await client.callTool({
      name: 'add_inscription',
      arguments: {
        text: 'IN LOVING MEMORY',
        target: 'headstone',
        expectedRevision: changed.structuredContent.revision,
      },
    });
    expect(added.isError).not.toBe(true);
    expect(
      added.structuredContent.snapshot.inscriptions.find(
        (line) => line.id === added.structuredContent.id,
      ).target,
    ).toBe('headstone');
    expect(
      added.structuredContent.snapshot.inscriptions.map((line) => line.text),
    ).toContain('IN LOVING MEMORY');
    const deleted = await client.callTool({
      name: 'delete_inscription',
      arguments: {
        id: added.structuredContent.id,
        expectedRevision: added.structuredContent.revision,
      },
    });
    expect(deleted.isError).not.toBe(true);
    expect(deleted.structuredContent.snapshot.inscriptions).toHaveLength(2);

    let requests = 0;
    let savedBody;
    await page.route('**/api/projects', async (route) => {
      requests += 1;
      savedBody = route.request().postDataJSON();
      await route.fulfill({
        status: 200,
        json: { project: { id: 'mock-project-id' } },
      });
    });
    const saveArguments = {
      title: 'MCP test',
      expectedRevision: deleted.structuredContent.revision,
      idempotencyKey: 'test-save-1',
    };
    const saved = await client.callTool(
      { name: 'save_design', arguments: saveArguments },
      undefined,
      { timeout: 30000 },
    );
    expect(saved.isError).not.toBe(true);
    expect(saved.structuredContent.project.id).toBe('mock-project-id');
    expect(savedBody.designState.inscriptions.map((line) => line.text)).toEqual(
      ['ALEX MORGAN', '1940–2020'],
    );
    expect(savedBody.designState.metadata.screenshot).toMatch(
      /^data:image\/jpeg;base64,/,
    );
    const retry = await client.callTool({
      name: 'save_design',
      arguments: saveArguments,
    });
    expect(retry.structuredContent.project.id).toBe('mock-project-id');
    expect(requests).toBe(1);
    const reused = await client.callTool({
      name: 'save_design',
      arguments: { ...saveArguments, title: 'Different' },
    });
    expect(JSON.parse(reused.content[0].text).code).toBe(
      'IDEMPOTENCY_CONFLICT',
    );
    const selected = await client.callTool({
      name: 'select_product',
      arguments: {
        productId: '5',
        expectedRevision: deleted.structuredContent.revision,
      },
    });
    expect(selected.structuredContent.status).toBe('pending');
    await expect
      .poll(
        async () =>
          (await client.callTool({ name: 'get_design', arguments: {} }))
            .structuredContent.snapshot.productId,
        { timeout: 30000 },
      )
      .toBe('5');
    await expect
      .poll(
        async () =>
          (await client.callTool({ name: 'get_design', arguments: {} }))
            .structuredContent.catalogLoaded,
        { timeout: 30000 },
      )
      .toBe(true);
    await expect
      .poll(
        async () =>
          (await client.callTool({ name: 'get_design', arguments: {} }))
            .structuredContent.productConfigurationReady,
        { timeout: 30000 },
      )
      .toBe(true);
    const bronze = (
      await client.callTool({
        name: 'get_product_configuration',
        arguments: {},
      })
    ).structuredContent;
    expect(bronze.productId).toBe('5');
    expect(bronze.availableTargets).toEqual(['headstone']);
    await page.evaluate(() => {
      const state = window.__headstoneStore.getState();
      state.setSelected(null);
      state.addEmblem('test-emblem', '/textures/forever/l/Imperial-Red.webp');
      state.setScreenshotMode(true);
    });
    await page.waitForFunction(
      () => {
        let found = false;
        window.__r3fScene?.traverse((object) => {
          if (object.userData.previewEmblemId) found = true;
        });
        return found;
      },
      null,
      { timeout: 30000 },
    );
    const withEmblem = (
      await client.callTool({ name: 'get_design', arguments: {} })
    ).structuredContent;
    const emblemPreview = await client.callTool(
      {
        name: 'get_preview',
        arguments: { expectedRevision: withEmblem.revision },
      },
      undefined,
      { timeout: 30000 },
    );
    expect(emblemPreview.isError).not.toBe(true);
    expect(emblemPreview.structuredContent.emblemTexturesReady).toBe(true);
    await page.evaluate(() => {
      const state = window.__headstoneStore.getState();
      state.selectedEmblems.forEach((emblem) => state.removeEmblem(emblem.id));
    });
    const oval = bronze.shapes.find((shape) => shape.url.includes('oval_'));
    expect(oval).toBeDefined();
    const bronzeShape = await client.callTool({
      name: 'set_shape',
      arguments: { shapeId: oval.id, expectedRevision: bronze.revision },
    });
    expect(bronzeShape.isError).not.toBe(true);
    expect(bronzeShape.structuredContent.snapshot).toMatchObject({
      shapeUrl: oval.url,
      borderName: 'Border 4',
    });
    const bronzeState = await client.callTool({
      name: 'get_design',
      arguments: {},
    });
    const bronzeMaterial = await client.callTool({
      name: 'set_material',
      arguments: {
        materialId: bronze.materials[0].id,
        target: 'headstone',
        expectedRevision: bronzeState.structuredContent.revision,
      },
    });
    expect(bronzeMaterial.isError).not.toBe(true);
    expect(bronzeMaterial.structuredContent.snapshot.headstoneMaterialUrl).toBe(
      bronze.materials[0].url,
    );
    for (const productId of ['8', '101']) {
      const previous = (
        await client.callTool({ name: 'get_design', arguments: {} })
      ).structuredContent;
      const switched = await client.callTool({
        name: 'select_product',
        arguments: { productId, expectedRevision: previous.revision },
      });
      expect(switched.isError).not.toBe(true);
      await expect
        .poll(
          async () => {
            const state = (
              await client.callTool({ name: 'get_design', arguments: {} })
            ).structuredContent;
            return (
              state.snapshot.productId === productId &&
              state.productConfigurationReady
            );
          },
          { timeout: 30000 },
        )
        .toBe(true);
      const config = (
        await client.callTool({
          name: 'get_product_configuration',
          arguments: {},
        })
      ).structuredContent;
      expect(config.productId).toBe(productId);
      if (productId === '8')
        expect(
          config.shapes.every((shape) => shape.category === 'traditional'),
        ).toBe(true);
      if (productId === '101') {
        expect(config.availableTargets).toEqual(
          expect.arrayContaining(['headstone', 'base', 'ledger', 'kerbset']),
        );
        await page.evaluate(() =>
          window.__headstoneStore
            .getState()
            .addImage({
              id: 'ledger-test',
              typeId: 1,
              typeName: 'Test',
              imageUrl: '/test.png',
              widthMm: 100,
              heightMm: 100,
              xPos: 10,
              yPos: 20,
              rotationZ: 0,
              target: 'headstone',
            }),
        );
        const beforeLedger = (
          await client.callTool({ name: 'get_design', arguments: {} })
        ).structuredContent;
        const moved = await client.callTool({
          name: 'move_image_to_surface',
          arguments: {
            id: 'ledger-test',
            target: 'ledger',
            expectedRevision: beforeLedger.revision,
          },
        });
        expect(
          moved.structuredContent.snapshot.selectedImages.find(
            (image) => image.id === 'ledger-test',
          ),
        ).toMatchObject({ target: 'ledger', xPos: 0, yPos: 0 });
        await page.evaluate(() =>
          window.__headstoneStore.getState().removeImage('ledger-test'),
        );
      }
    }
    const latest = (
      await client.callTool({ name: 'get_design', arguments: {} })
    ).structuredContent;
    const next = await client.callTool({
      name: 'select_product',
      arguments: { productId: '32', expectedRevision: latest.revision },
    });
    expect(next.isError).not.toBe(true);
    await expect
      .poll(
        async () =>
          (await client.callTool({ name: 'get_design', arguments: {} }))
            .structuredContent.snapshot.productId,
        { timeout: 30000 },
      )
      .toBe('32');
    await expect
      .poll(
        async () => {
          const state = (
            await client.callTool({ name: 'get_design', arguments: {} })
          ).structuredContent;
          return (
            state.snapshot.productId === '32' && state.productConfigurationReady
          );
        },
        { timeout: 30000 },
      )
      .toBe(true);
    const fullColour = (
      await client.callTool({
        name: 'get_product_configuration',
        arguments: {},
      })
    ).structuredContent;
    expect(
      fullColour.shapes.every((shape) =>
        /(?:landscape|portrait)\.svg$/.test(shape.url),
      ),
    ).toBe(true);
    expect(fullColour.dimensions.mode).toBe('fixed');
    expect(fullColour.dimensions.fixedSizes).toHaveLength(2);
    const invalidDimensions = await client.callTool({
      name: 'set_dimensions',
      arguments: { widthMm: 200, expectedRevision: fullColour.revision },
    });
    expect(JSON.parse(invalidDimensions.content[0].text).code).toBe(
      'FIXED_SIZE_REQUIRED',
    );
    const fixed = await client.callTool({
      name: 'set_fixed_size',
      arguments: {
        sizeId: 1,
        orientation: 'landscape',
        expectedRevision: fullColour.revision,
      },
    });
    expect(fixed.isError).not.toBe(true);
    expect(fixed.structuredContent.snapshot).toMatchObject({
      widthMm: 200,
      heightMm: 150,
    });
    const background = await client.callTool({
      name: 'set_material',
      arguments: {
        materialId: 'test-background',
        target: 'headstone',
        expectedRevision: fixed.structuredContent.revision,
      },
    });
    expect(background.isError).not.toBe(true);
    for (const productId of ['135', '2350', '52']) {
      const state = (
        await client.callTool({ name: 'get_design', arguments: {} })
      ).structuredContent;
      const switched = await client.callTool({
        name: 'select_product',
        arguments: { productId, expectedRevision: state.revision },
      });
      expect(switched.isError).not.toBe(true);
      await expect
        .poll(
          async () => {
            const current = (
              await client.callTool({ name: 'get_design', arguments: {} })
            ).structuredContent;
            return (
              current.snapshot.productId === productId &&
              current.productConfigurationReady
            );
          },
          { timeout: 30000 },
        )
        .toBe(true);
      const config = (
        await client.callTool({
          name: 'get_product_configuration',
          arguments: {},
        })
      ).structuredContent;
      expect(config.productId).toBe(productId);
      if (productId === '135') {
        const cat = config.shapes.find((shape) => shape.id === 'Bowl-Cat');
        expect(cat.url).toContain('petRock=cat');
        const changedShape = await client.callTool({
          name: 'set_shape',
          arguments: { shapeId: cat.id, expectedRevision: config.revision },
        });
        expect(changedShape.structuredContent.snapshot.shapeUrl).toBe(cat.url);
        expect(changedShape.structuredContent.snapshot).toMatchObject({
          widthMm: cat.initialSize.widthMm,
          heightMm: cat.initialSize.heightMm,
        });
      }
      if (productId === '2350') {
        expect(
          config.shapes.every((shape) => shape.url.startsWith('/shapes/urns/')),
        ).toBe(true);
        const urnShape = config.shapes[1] ?? config.shapes[0];
        const selectedUrn = await client.callTool({
          name: 'set_shape',
          arguments: {
            shapeId: urnShape.id,
            expectedRevision: config.revision,
          },
        });
        expect(selectedUrn.isError).not.toBe(true);
        expect(selectedUrn.structuredContent.snapshot).toMatchObject({
          shapeUrl: urnShape.url,
          widthMm: urnShape.initialSize.widthMm,
          heightMm: urnShape.initialSize.heightMm,
        });
      }
      if (productId === '52') {
        expect(config.materials.map((item) => item.id)).toEqual([
          'brushed',
          'polished',
        ]);
        const polished = await client.callTool({
          name: 'set_material',
          arguments: {
            materialId: 'polished',
            target: 'headstone',
            expectedRevision: config.revision,
          },
        });
        expect(polished.isError).not.toBe(true);
        expect(
          polished.structuredContent.snapshot.headstoneMaterialUrl,
        ).toContain('high-polished-ss-swatch');
      }
    }
    for (const productId of ['1', '23']) {
      const previous = (
        await client.callTool({ name: 'get_design', arguments: {} })
      ).structuredContent;
      const switched = await client.callTool({
        name: 'select_product',
        arguments: { productId, expectedRevision: previous.revision },
      });
      expect(switched.isError).not.toBe(true);
      await expect
        .poll(
          async () => {
            const current = (
              await client.callTool({ name: 'get_design', arguments: {} })
            ).structuredContent;
            return (
              current.snapshot.productId === productId &&
              current.productConfigurationReady
            );
          },
          { timeout: 30000 },
        )
        .toBe(true);
      const config = (
        await client.callTool({
          name: 'get_product_configuration',
          arguments: {},
        })
      ).structuredContent;
      expect(config.shapes.length).toBeGreaterThan(0);
      expect(
        config.shapes.every((shape) => shape.category === 'traditional'),
      ).toBe(true);
      const shape = await client.callTool({
        name: 'set_shape',
        arguments: {
          shapeId: config.shapes[0].id,
          expectedRevision: config.revision,
        },
      });
      expect(shape.isError).not.toBe(true);
      const base = await client.callTool({
        name: 'set_assembly_options',
        arguments: {
          options: { stainlessBaseStyle: 'stainless' },
          expectedRevision: shape.structuredContent.revision,
        },
      });
      expect(base.structuredContent.snapshot.baseMaterialUrl).toContain(
        'brushed-ss-swatch',
      );
      expect(base.structuredContent.snapshot.showBase).toBe(true);
      const granite = await client.callTool({
        name: 'set_assembly_options',
        arguments: {
          options: { stainlessBaseStyle: 'granite' },
          expectedRevision: base.structuredContent.revision,
        },
      });
      expect(granite.structuredContent.snapshot.baseMaterialUrl).toContain(
        'Imperial-Red',
      );
      const invalid = await client.callTool({
        name: 'set_material',
        arguments: {
          materialId: config.materials[0]?.id ?? 'unavailable',
          target: 'headstone',
          expectedRevision: granite.structuredContent.revision,
        },
      });
      expect(invalid.isError).toBe(true);
    }
  } finally {
    await client?.close();
    await context.close();
    if (
      path.dirname(path.resolve(profile)) === path.resolve(os.tmpdir()) &&
      path.basename(profile).startsWith('designer-mcp-test-')
    ) {
      await rm(profile, {
        recursive: true,
        force: true,
        maxRetries: 10,
        retryDelay: 500,
      });
    }
  }
});
