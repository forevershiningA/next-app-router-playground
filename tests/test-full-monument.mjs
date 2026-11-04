import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import path from 'node:path';

async function main() {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [path.resolve('scripts/designer-mcp.mjs')],
    env: { ...process.env, DESIGNER_MCP_CDP_URL: 'http://127.0.0.1:9222' },
  });
  const client = new Client({ name: 'test-agent', version: '1.0.0' }, { capabilities: {} });
  await client.connect(transport);

  // 1. Ensure we are in a session for Product 101 (or select product 101)
  const currentSnap = await client.callTool({ name: 'get_design', arguments: {} });
  const currData = JSON.parse(currentSnap.content[0].text);
  console.log('Current productId:', currData.snapshot?.productId);

  if (currData.snapshot?.productId !== '101') {
    await client.callTool({
      name: 'select_product',
      arguments: { productId: '101', expectedRevision: 'latest' },
    });
    // Wait for catalog & navigation
    await new Promise((r) => setTimeout(r, 2000));
  }

  // 2. Set material to African Black for headstone, base, ledger
  // In Product 101, material 1 is African Black
  await client.callTool({
    name: 'set_material',
    arguments: { materialId: '1', target: 'headstone', expectedRevision: 'latest' },
  });
  await client.callTool({
    name: 'set_material',
    arguments: { materialId: '1', target: 'base', expectedRevision: 'latest' },
  });
  await client.callTool({
    name: 'set_material',
    arguments: { materialId: '1', target: 'ledger', expectedRevision: 'latest' },
  });

  // 3. Compose headstone inscriptions & cross
  const composeRes = await client.callTool({
    name: 'compose_memorial_layout',
    arguments: {
      preset: 'companion_both',
      headerText: 'Ś. P.',
      textColor: '#D4AF37',
      centerMotif: {
        categoryId: 'Religious',
        svgPath: '/shapes/motifs/cross_001.svg',
        color: '#D4AF37',
        heightMm: 70,
      },
      leftPerson: {
        name: 'STANISŁAW KOWALSKI',
        dates: '* 10.03.1934   † 14.05.2018',
        font: 'Garamond',
      },
      rightPerson: {
        name: 'STANISŁAWA KOWALSKA',
        dates: '* 12.04.1936   † 18.09.2023',
        font: 'Garamond',
      },
      bottomText: 'Spoczywajcie w pokoju',
      bottomFont: 'Great Vibes',
      clearExisting: true,
      expectedRevision: 'latest',
    },
  });
  console.log('Compose applied:', JSON.parse(composeRes.content[0].text).applied);

  // 4. Inscription on Base: RODZINA KOWALSKICH
  await client.callTool({
    name: 'add_inscription',
    arguments: {
      text: 'RODZINA KOWALSKICH',
      target: 'base',
      font: 'Garamond',
      sizeMm: 40,
      color: '#D4AF37',
      xPos: 0,
      yPos: 0,
      expectedRevision: 'latest',
    },
  });

  // 5. Inscription on Ledger (płyta pozioma): PAMIĘĆ O WAS NIGDY NIE ZGAŚNIE
  await client.callTool({
    name: 'add_inscription',
    arguments: {
      text: 'PAMIĘĆ O WAS NIGDY NIE ZGAŚNIE',
      target: 'ledger',
      font: 'Great Vibes',
      sizeMm: 36,
      color: '#D4AF37',
      xPos: 0,
      yPos: 0,
      expectedRevision: 'latest',
    },
  });

  // 6. Two granite vases on the base
  const v1 = await client.callTool({
    name: 'add_addition',
    arguments: { catalogId: 'K2213', expectedRevision: 'latest' },
  });
  const v1Data = JSON.parse(v1.content[0].text);
  if (v1Data.id) {
    await client.callTool({
      name: 'update_addition',
      arguments: {
        id: v1Data.id,
        patch: { targetSurface: 'base', xPos: -380, yPos: 0 },
        expectedRevision: 'latest',
      },
    });
  }

  const v2 = await client.callTool({
    name: 'add_addition',
    arguments: { catalogId: 'K2213', expectedRevision: 'latest' },
  });
  const v2Data = JSON.parse(v2.content[0].text);
  if (v2Data.id) {
    await client.callTool({
      name: 'update_addition',
      arguments: {
        id: v2Data.id,
        patch: { targetSurface: 'base', xPos: 380, yPos: 0 },
        expectedRevision: 'latest',
      },
    });
  }

  // 7. Preview
  const prev = await client.callTool({
    name: 'get_preview',
    arguments: { expectedRevision: 'latest' },
  });
  if (prev.isError) {
    console.error('get_preview error:', prev.content);
    await client.close();
    return;
  }
  const textItem = prev.content.find((c) => c.type === 'text');
  const previewData = JSON.parse(textItem.text);
  console.log('Preview id:', previewData.previewId);
  console.log('Motif warnings:', previewData.motifLayout?.warnings);
  console.log('Inscription warnings:', previewData.inscriptionLayout?.warnings);

  // 8. Save
  const save = await client.callTool({
    name: 'save_local_design',
    arguments: {
      title: 'Full Monument — Grobowiec Rodzinny Kowalskich',
      expectedRevision: previewData.revision,
      previewId: previewData.previewId,
      visuallyReviewed: true,
    },
  });
  console.log('Save result:', JSON.parse(save.content[0].text));

  await client.close();
}

main().catch(console.error);
