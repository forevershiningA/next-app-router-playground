import { test, expect, chromium } from '@playwright/test';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import sharp from 'sharp';

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
  test.setTimeout(150000);
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
      const state = window.__headstoneStore.getState();
      state.setSelectedInscriptionId(null);
      state.setSelected('headstone');
    });
    const visibleOutlines = () => page.evaluate(() => {
      let count = 0;
      window.__r3fScene?.traverse((object) => {
        if (object.userData.outlineGeometry && object.visible) count++;
      });
      return count;
    });
    await expect.poll(visibleOutlines, { timeout: 15000 }).toBeGreaterThan(0);
    await page.evaluate(() => window.__headstoneStore.getState().setScreenshotMode(true));
    await expect.poll(visibleOutlines).toBe(0);
    await page.evaluate(() => window.__headstoneStore.getState().setScreenshotMode(false));
    await expect.poll(visibleOutlines).toBeGreaterThan(0);
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
          DESIGNER_MCP_DRAFT_DIR: path.join(profile, 'mcp-drafts'),
          DESIGNER_MCP_DISABLE_UPLOADS: '',
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
        'save_local_design',
      ]),
    );
    const blockedUpload = await client.callTool({
      name: 'add_image',
      arguments: {
        imageBase64: 'YQ==',
        mimeType: 'image/png',
        typeId: 1,
        expectedRevision: '0'.repeat(64),
      },
    });
    expect(blockedUpload.isError).toBe(true);
    expect(JSON.parse(blockedUpload.content[0].text).code).toBe(
      'UPLOAD_DISABLED',
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
    expect(JSON.parse(additionPreview.content[1].text).additionModelsReady).toBe(true);
    expect(JSON.parse(additionPreview.content[1].text)).toMatchObject({shapeReady:true,headstoneMaterialReady:true,baseReady:true,structuralReadinessScope:'traditional-engraved-headstone',otherAssetsReady:'unverified'});
    const baseLine = await client.callTool({name:'add_inscription',arguments:{target:'base',text:'NA ZAWSZE W PAMIĘCI',expectedRevision:'latest'}});
    expect(baseLine.isError, JSON.stringify(baseLine.content)).not.toBe(true);
    const baseLineId = baseLine.structuredContent.id;
    expect(baseLine.structuredContent.snapshot.inscriptions.find((line)=>line.id===baseLineId)).toMatchObject({target:'base',coordinateSpace:'mm-center',xPos:0,yPos:0});
    const baseLineChanged = await client.callTool({name:'update_inscription',arguments:{id:baseLineId,patch:{sizeMm:20},expectedRevision:'latest'}});
    expect(baseLineChanged.isError).not.toBe(true);
    const basePreview = await client.callTool({name:'get_preview',arguments:{expectedRevision:'latest'}},undefined,{timeout:30000});
    expect(basePreview.isError, JSON.stringify(basePreview.content.filter((item)=>item.type==='text'))).not.toBe(true);
    await expect.poll(() => page.evaluate((id) => {
      const scene=window.__r3fScene;scene?.updateMatrixWorld(true);let base,letter;
      scene?.traverse((object)=>{if(object.name==='base'&&object.isMesh)base=object;if(object.userData.inscriptionId===id)letter=object;});
      if(!base||!letter||!letter.visible)return false;
      const b=base.matrixWorld.elements,l=letter.matrixWorld.elements;
      const halfHeight=Math.abs(b[5])/2;
      return Math.abs(l[12]-b[12])<0.01 && Math.abs(l[13]-b[13])<halfHeight*0.4 && l[14]>b[14]+Math.abs(b[10])/2;
    },baseLineId),{timeout:15000}).toBe(true);
    const deletedBaseLine = await client.callTool({name:'delete_inscription',arguments:{id:baseLineId,expectedRevision:'latest'}});
    expect(deletedBaseLine.isError).not.toBe(true);
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
    const namedMaterial = configuration.materials.find((item) => item.name && item.id !== item.name && item.url);
    expect(namedMaterial).toBeTruthy();
    const invalidMaterialName = await client.callTool({
      name: 'set_material',
      arguments: { materialId: namedMaterial.name, target: 'headstone', expectedRevision: configuration.revision },
    });
    const invalidMaterialError = JSON.parse(invalidMaterialName.content[0].text);
    expect(invalidMaterialError.code).toBe('NOT_FOUND');
    expect(invalidMaterialError.message).toContain('get_product_configuration');
    expect((await client.callTool({ name: 'get_design', arguments: {} })).structuredContent.revision).toBe(configuration.revision);
    const recoveredMaterial = await client.callTool({
      name: 'set_material',
      arguments: { materialId: namedMaterial.id, target: 'headstone', expectedRevision: 'latest' },
    }, undefined, { timeout: 30000 });
    expect(recoveredMaterial.isError).not.toBe(true);
    configuration = (await client.callTool({ name: 'get_product_configuration', arguments: {} })).structuredContent;
    const invalidShape = await client.callTool({
      name: 'set_shape',
      arguments: {
        shapeId: 'nonexistent',
        expectedRevision: configuration.revision,
      },
    });
    expect(JSON.parse(invalidShape.content[0].text).code).toBe('NOT_FOUND');
    const initialShape = (await client.callTool({name:'get_design',arguments:{}})).structuredContent.snapshot.shapeUrl;
    const delayedShape = configuration.shapes.find((item) => item.url !== initialShape && item.url.endsWith('.svg'));
    expect(delayedShape).toBeTruthy();
    let releaseShape;
    let shapeRequested;
    const shapeGate = new Promise((resolve) => { releaseShape = resolve; });
    const requestedShape = new Promise((resolve) => { shapeRequested = resolve; });
    const delayedShapeUrl = (url) => url.pathname === new URL(delayedShape.url, baseURL).pathname;
    await page.route(delayedShapeUrl, async (route) => {
      shapeRequested();
      await shapeGate;
      await route.continue();
    });
    const pendingShape = await client.callTool({name:'set_shape',arguments:{shapeId:delayedShape.id,expectedRevision:'latest'}});
    expect(pendingShape.isError).not.toBe(true);
    await Promise.race([requestedShape, new Promise((_,reject)=>setTimeout(()=>reject(new Error('Shape request was not intercepted')),10000))]);
    let previewFinished = false;
    const delayedPreview = client.callTool({name:'get_preview',arguments:{expectedRevision:'latest'}},undefined,{timeout:30000}).then((value)=>{previewFinished=true;return value;});
    await page.waitForTimeout(500);
    expect(previewFinished).toBe(false);
    releaseShape();
    const afterShapeLoads = await delayedPreview;
    if (afterShapeLoads.isError) expect(JSON.parse(afterShapeLoads.content[0].text).code).toBe('REVISION_CONFLICT');
    else expect(JSON.parse(afterShapeLoads.content[1].text).shapeReady).toBe(true);
    await page.unroute(delayedShapeUrl);
    const shaped = await client.callTool({
      name: 'set_shape',
      arguments: {
        shapeId: configuration.shapes[0].id,
        expectedRevision: 'latest',
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
    const delayedMaterial = configuration.materials.find((item) => item.url && item.url !== current.structuredContent.snapshot.headstoneMaterialUrl);
    expect(delayedMaterial).toBeTruthy();
    let releaseMaterial;
    let materialRequested;
    const materialGate = new Promise((resolve) => { releaseMaterial = resolve; });
    const requestedMaterial = new Promise((resolve) => { materialRequested = resolve; });
    const delayedMaterialUrl = (url) => url.pathname === new URL(delayedMaterial.url, baseURL).pathname;
    await page.route(delayedMaterialUrl, async (route) => {
      materialRequested();
      await materialGate;
      await route.continue();
    });
    // UI changes can set the requested texture before the network finishes;
    // exercise that path as MCP's set_material itself preloads the texture.
    await page.evaluate((url) => window.__headstoneStore.getState().setHeadstoneMaterialUrl(url), delayedMaterial.url);
    await Promise.race([requestedMaterial, new Promise((_,reject)=>setTimeout(()=>reject(new Error('Material request was not intercepted')),10000))]);
    let materialPreviewFinished = false;
    const delayedMaterialPreview = client.callTool({name:'get_preview',arguments:{expectedRevision:'latest'}},undefined,{timeout:30000}).then((value)=>{materialPreviewFinished=true;return value;});
    await page.waitForTimeout(500);
    expect(materialPreviewFinished).toBe(false);
    releaseMaterial();
    const afterMaterialLoads = await delayedMaterialPreview;
    if (afterMaterialLoads.isError) expect(JSON.parse(afterMaterialLoads.content[0].text).code).toBe('REVISION_CONFLICT');
    else expect(JSON.parse(afterMaterialLoads.content[1].text).headstoneMaterialReady).toBe(true);
    await page.unroute(delayedMaterialUrl);
    const material = await client.callTool({name:'get_design',arguments:{}});
    expect(material.structuredContent.snapshot.headstoneMaterialUrl).toBe(delayedMaterial.url);
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
    const noPreview = await client.callTool({name:'save_local_design',arguments:{title:'No preview',expectedRevision:'latest',previewId:'00000000-0000-4000-8000-000000000000',visuallyReviewed:true}});
    expect(JSON.parse(noPreview.content[0].text).code).toBe('PREVIEW_REVIEW_REQUIRED');
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
    expect(JSON.parse(preview.content[1].text).revision).toBe(
      changed.structuredContent.revision,
    );
    const previewImage = sharp(Buffer.from(preview.content[0].data, 'base64'));
    expect(await previewImage.metadata()).toMatchObject({ width: 1200, height: 900 });
    const latestPreview = await client.callTool({ name: 'get_preview', arguments: { expectedRevision: 'latest' } }, undefined, { timeout: 30000 });
    expect(latestPreview.isError).not.toBe(true);
    expect(JSON.parse(latestPreview.content[1].text).revision).toBe(changed.structuredContent.revision);
    const localSave = await client.callTool(
      {
        name: 'save_local_design',
        arguments: {
          title: 'Local test',
          expectedRevision: 'latest',
          previewId: JSON.parse(latestPreview.content[1].text).previewId,
          visuallyReviewed: true,
        },
      },
      undefined,
      { timeout: 30000 },
    );
    expect(localSave.isError).not.toBe(true);
    expect(localSave.structuredContent).toMatchObject({
      title: 'Local test',
      storage: 'local-file',
      shareable: false,
    });
    const localFile = JSON.parse(
      await readFile(localSave.structuredContent.filePath, 'utf8'),
    );
    expect(localSave.structuredContent.motifLayout).toEqual(JSON.parse(latestPreview.content[1].text).motifLayout);
    expect(localFile.motifLayout).toEqual(localSave.structuredContent.motifLayout);
    expect(localFile.snapshot.inscriptions[0].text).toBe('ALEX MORGAN');
    expect(localFile.preview).toMatch(/^data:image\/jpeg;base64,/);
    const localPreview = await readFile(
      localSave.structuredContent.previewPath,
    );
    expect(localPreview.subarray(0, 3).toString('hex')).toBe('ffd8ff');
    expect(localPreview.equals(Buffer.from(latestPreview.content[0].data, 'base64'))).toBe(true);
    const invalidDraft = await client.callTool({name:'open_local_design', arguments:{id:'00000000-0000-4000-8000-000000000000'}});
    expect(JSON.parse(invalidDraft.content[0].text).code).toBe('DRAFT_NOT_FOUND');
    const reopened = await client.callTool({name:'open_local_design',arguments:{id:localSave.structuredContent.id}},undefined,{timeout:90000});
    expect(reopened.isError, JSON.stringify(reopened.content)).not.toBe(true);
    expect(reopened.structuredContent.restoredNormalized, JSON.stringify(reopened.structuredContent.warning)).toBe(true);
    expect(reopened.structuredContent.sourceRevision).toBe(localFile.revision);
    expect(reopened.structuredContent.snapshot.inscriptions[0].text).toBe('ALEX MORGAN');
    const reopenedPreview = await client.callTool({name:'get_preview',arguments:{expectedRevision:'latest'}},undefined,{timeout:30000});
    expect(reopenedPreview.isError, JSON.stringify(reopenedPreview.content.filter(x=>x.type==='text'))).not.toBe(true);
    const pixels = async (data) => sharp(data).resize(300,225).removeAlpha().raw().toBuffer();
    const originalPixels = await pixels(localPreview);
    const restoredPixels = await pixels(Buffer.from(reopenedPreview.content[0].data,'base64'));
    let pixelDifference = 0;
    for (let i = 0; i < originalPixels.length; i++) pixelDifference += Math.abs(originalPixels[i] - restoredPixels[i]);
    expect(pixelDifference / originalPixels.length).toBeLessThan(5);
    const sessionChange = await client.callTool({name:'update_inscription',arguments:{id,patch:{text:'SEPARATE SESSION'},expectedRevision:'latest'}});
    expect(sessionChange.isError).not.toBe(true);
    expect((await client.callTool({name:'select_local_session',arguments:{sessionId:'original'}})).isError).not.toBe(true);
    const unchangedOriginal = (await client.callTool({name:'get_design',arguments:{}})).structuredContent;
    expect(unchangedOriginal.revision).toBe(localFile.revision);
    const freshSession = await client.callTool({name:'create_local_session',arguments:{productId:localFile.snapshot.productId}},undefined,{timeout:90000});
    expect(freshSession.isError, JSON.stringify(freshSession.content)).not.toBe(true);
    expect(freshSession.structuredContent.sessionId).not.toBe(reopened.structuredContent.sessionId);
    const secondClient = new Client({name:'independent-connection',version:'1.0.0'});
    await secondClient.connect(new StdioClientTransport({command:process.execPath,args:['scripts/designer-mcp.mjs'],env:{...process.env,DESIGNER_MCP_CDP_URL:`http://127.0.0.1:${port}`,DESIGNER_MCP_DRAFT_DIR:path.join(profile,'mcp-drafts')},stderr:'inherit'}));
    try {
      const secondRead = await secondClient.callTool({name:'get_design',arguments:{}});
      expect(secondRead.isError, JSON.stringify(secondRead.content)).not.toBe(true);
      expect(secondRead.structuredContent.revision).toBe(localFile.revision);
    } finally { await secondClient.close(); }
    expect((await client.callTool({name:'select_local_session',arguments:{sessionId:'original'}})).isError).not.toBe(true);
    const corrupt = {...localFile, revision:'0'.repeat(64)};
    await writeFile(localSave.structuredContent.filePath, JSON.stringify(corrupt));
    const invalidChecksum = await client.callTool({name:'open_local_design',arguments:{id:localFile.id}});
    expect(JSON.parse(invalidChecksum.content[0].text).code).toBe('INVALID_DRAFT');
    await writeFile(localSave.structuredContent.filePath, JSON.stringify(localFile));
    expect((await client.callTool({name:'close_local_session',arguments:{sessionId:freshSession.structuredContent.sessionId,discardUnsavedChanges:true}})).isError).not.toBe(true);
    expect((await client.callTool({name:'close_local_session',arguments:{sessionId:reopened.structuredContent.sessionId,discardUnsavedChanges:true}})).isError).not.toBe(true);
    const staleLocalSave = await client.callTool({
      name: 'save_local_design',
      arguments: { title: 'Stale', expectedRevision: before.revision, previewId: JSON.parse(latestPreview.content[1].text).previewId, visuallyReviewed:true },
    });
    expect(staleLocalSave.isError).toBe(true);
    await page.evaluate(() =>
      window.__headstoneStore
        .getState()
        .addMotif('/svg/borders/double-line.svg'),
    );
    const withMotif = (
      await client.callTool({ name: 'get_design', arguments: {} })
    ).structuredContent;
    const stalePreviewSave = await client.callTool({name:'save_local_design',arguments:{title:'Changed',expectedRevision:'latest',previewId:JSON.parse(latestPreview.content[1].text).previewId,visuallyReviewed:true}});
    expect(JSON.parse(stalePreviewSave.content[0].text).code).toBe('PREVIEW_REVIEW_REQUIRED');
    const motifPreview = await client.callTool(
      {
        name: 'get_preview',
        arguments: { expectedRevision: withMotif.revision },
      },
      undefined,
      { timeout: 30000 },
    );
    expect(motifPreview.isError).not.toBe(true);
    expect(JSON.parse(motifPreview.content[1].text).motifTexturesReady).toBe(true);
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
    expect(JSON.parse(emblemPreview.content[1].text).emblemTexturesReady).toBe(true);
    expect(JSON.parse(emblemPreview.content[1].text)).toMatchObject({shapeReady:'unverified',headstoneMaterialReady:'unverified',baseReady:'unverified',structuralReadinessScope:'unsupported-product'});
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
    // A real regression: a cross's rectangle extended below the upright and
    // was mostly obscured by the base even though its texture was ready.
    const layoutSession = await client.callTool({name:'create_local_session',arguments:{productId:'124'}},undefined,{timeout:90000});
    expect(layoutSession.isError, JSON.stringify(layoutSession.content)).not.toBe(true);
    const layoutConfig = (await client.callTool({name:'get_product_configuration',arguments:{}})).structuredContent;
    const squareShape = layoutConfig.shapes.find((shape)=>shape.url.endsWith('/square.svg'));
    expect(squareShape).toBeTruthy();
    expect((await client.callTool({name:'set_shape',arguments:{shapeId:squareShape.id,expectedRevision:'latest'}})).isError).not.toBe(true);
    expect((await client.callTool({name:'set_dimensions',arguments:{widthMm:600,heightMm:900,expectedRevision:'latest'}})).isError).not.toBe(true);
    const cross = await client.callTool({name:'add_motif',arguments:{categoryId:'Religious',svgPath:'/shapes/motifs/cross_001.svg',expectedRevision:'latest'}});
    expect(cross.isError, JSON.stringify(cross.content)).not.toBe(true);
    const crossId = cross.structuredContent.id;
    expect((await client.callTool({name:'update_motif',arguments:{id:crossId,patch:{heightMm:45,yPos:300},expectedRevision:'latest'}})).isError).not.toBe(true);
    const obscured = await client.callTool({name:'get_preview',arguments:{expectedRevision:'latest'}},undefined,{timeout:30000});
    expect(obscured.isError, JSON.stringify(obscured.content.filter((x)=>x.type==='text'))).not.toBe(true);
    const obscuredLayout=JSON.parse(obscured.content[1].text).motifLayout;
    expect(obscuredLayout.checkedMotifIds).toContain(crossId);
    expect(obscuredLayout.warnings.map((item)=>item.code)).toEqual(expect.arrayContaining(['MOTIF_OUTSIDE_HEADSTONE_BOUNDS','MOTIF_POSSIBLY_OCCLUDED_BY_BASE']));
    expect((await client.callTool({name:'update_motif',arguments:{id:crossId,patch:{heightMm:100,yPos:100},expectedRevision:'latest'}})).isError).not.toBe(true);
    const corrected = await client.callTool({name:'get_preview',arguments:{expectedRevision:'latest'}},undefined,{timeout:30000});
    expect(corrected.isError, JSON.stringify(corrected.content.filter((x)=>x.type==='text'))).not.toBe(true);
    expect(JSON.parse(corrected.content[1].text).motifLayout.warnings).toEqual([]);
    await client.callTool({name:'close_local_session',arguments:{sessionId:layoutSession.structuredContent.sessionId,discardUnsavedChanges:true}});
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
