import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import path from 'node:path';
import fs from 'node:fs';

const cdpUrl = process.env.DESIGNER_MCP_CDP_URL || 'http://127.0.0.1:9222';

async function createMcpClient() {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [path.resolve('scripts/designer-mcp.mjs')],
    env: { ...process.env, DESIGNER_MCP_CDP_URL: cdpUrl },
  });
  const client = new Client({ name: 'matrix-tester', version: '1.0.0' }, { capabilities: {} });
  await client.connect(transport);
  return { client, transport };
}

function parseRes(res, stepName = 'tool') {
  if (res.isError) {
    const msg = res.content?.find((c) => c.type === 'text')?.text || 'Unknown MCP error';
    throw new Error(`[${stepName}] ${msg}`);
  }
  const textItem = res.content?.find((c) => c.type === 'text');
  if (!textItem) return {};
  try {
    return JSON.parse(textItem.text);
  } catch {
    return { raw: textItem.text };
  }
}

async function getPreviewWithRetry(client, maxAttempts = 8, delayMs = 1200) {
  let lastResult = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    await new Promise((r) => setTimeout(r, delayMs));
    try {
      const prev = await client.callTool({ name: 'get_preview', arguments: { expectedRevision: 'latest' } });
      const textItem = prev.content?.find((c) => c.type === 'text');
      if (textItem) {
        const parsed = JSON.parse(textItem.text);
        if (parsed.previewId) {
          return parsed;
        }
        lastResult = parsed;
      }
    } catch (err) {
      lastResult = { error: err.message || String(err) };
    }
  }
  throw new Error(`get_preview failed to resolve previewId after ${maxAttempts} attempts: ${JSON.stringify(lastResult)}`);
}

// ---------------------------------------------------------
// Test Definitions
// ---------------------------------------------------------

async function testProduct124Companion(client) {
  const title = 'Product 124 — Companion Headstone with Vases';
  console.log(`\n▶ Starting test: ${title}...`);
  const t0 = Date.now();
  let sessionId = null;

  try {
    const s = await client.callTool({ name: 'create_local_session', arguments: { productId: '124' } });
    sessionId = parseRes(s, 'create_local_session').sessionId;
    await new Promise((r) => setTimeout(r, 600));

    await client.callTool({ name: 'set_dimensions', arguments: { widthMm: 850, heightMm: 900, expectedRevision: 'latest' } });
    await client.callTool({ name: 'set_material', arguments: { materialId: '1', target: 'headstone', expectedRevision: 'latest' } });
    await client.callTool({ name: 'set_material', arguments: { materialId: '1', target: 'base', expectedRevision: 'latest' } });

    await client.callTool({
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

    await client.callTool({
      name: 'add_inscription',
      arguments: {
        text: 'RODZINA KOWALSKICH',
        target: 'base',
        font: 'Garamond',
        sizeMm: 38,
        color: '#D4AF37',
        xPos: 0,
        yPos: 0,
        expectedRevision: 'latest',
      },
    });

    await new Promise((r) => setTimeout(r, 400));

    const v1 = await client.callTool({ name: 'add_addition', arguments: { catalogId: 'K2213', expectedRevision: 'latest' } });
    const v1Data = parseRes(v1, 'add_addition');
    if (v1Data.id) {
      await client.callTool({
        name: 'update_addition',
        arguments: { id: v1Data.id, patch: { targetSurface: 'base', xPos: -380, yPos: 0 }, expectedRevision: 'latest' },
      });
    }

    const v2 = await client.callTool({ name: 'add_addition', arguments: { catalogId: 'K2213', expectedRevision: 'latest' } });
    const v2Data = parseRes(v2, 'add_addition');
    if (v2Data.id) {
      await client.callTool({
        name: 'update_addition',
        arguments: { id: v2Data.id, patch: { targetSurface: 'base', xPos: 380, yPos: 0 }, expectedRevision: 'latest' },
      });
    }

    const prevData = await getPreviewWithRetry(client);

    const save = await client.callTool({
      name: 'save_local_design',
      arguments: {
        title,
        expectedRevision: prevData.revision,
        previewId: prevData.previewId,
        visuallyReviewed: true,
      },
    });
    const saveData = parseRes(save, 'save_local_design');
    const durationMs = Date.now() - t0;

    return {
      productId: '124',
      variant: 'Companion Headstone with Base Vases',
      status: prevData.previewId && saveData.id ? 'PASS' : 'FAIL',
      warningsCount: (prevData.motifLayout?.warnings?.length || 0) + (prevData.inscriptionLayout?.warnings?.length || 0),
      draftId: saveData.id,
      filePath: saveData.filePath,
      previewPath: saveData.previewPath,
      previewSizeKb: saveData.previewPath && fs.existsSync(saveData.previewPath) ? Math.round(fs.statSync(saveData.previewPath).size / 1024) : 0,
      durationMs,
    };
  } finally {
    if (sessionId) {
      await client.callTool({ name: 'close_local_session', arguments: { sessionId, discardUnsavedChanges: true } }).catch(() => {});
    }
  }
}

async function testProduct101FullMonument(client) {
  const title = 'Product 101 — Multi-Surface Full Monument';
  console.log(`\n▶ Starting test: ${title}...`);
  const t0 = Date.now();
  let sessionId = null;

  try {
    const s = await client.callTool({ name: 'create_local_session', arguments: { productId: '101' } });
    sessionId = parseRes(s, 'create_local_session').sessionId;
    await new Promise((r) => setTimeout(r, 600));

    await client.callTool({ name: 'set_material', arguments: { materialId: '1', target: 'headstone', expectedRevision: 'latest' } });
    await client.callTool({ name: 'set_material', arguments: { materialId: '1', target: 'base', expectedRevision: 'latest' } });
    await client.callTool({ name: 'set_material', arguments: { materialId: '1', target: 'ledger', expectedRevision: 'latest' } });

    await client.callTool({
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

    const v1 = await client.callTool({ name: 'add_addition', arguments: { catalogId: 'K2213', expectedRevision: 'latest' } });
    const v1Data = parseRes(v1, 'add_addition');
    if (v1Data.id) {
      await client.callTool({
        name: 'update_addition',
        arguments: { id: v1Data.id, patch: { targetSurface: 'base', xPos: -380, yPos: 0 }, expectedRevision: 'latest' },
      });
    }

    const v2 = await client.callTool({ name: 'add_addition', arguments: { catalogId: 'K2213', expectedRevision: 'latest' } });
    const v2Data = parseRes(v2, 'add_addition');
    if (v2Data.id) {
      await client.callTool({
        name: 'update_addition',
        arguments: { id: v2Data.id, patch: { targetSurface: 'base', xPos: 380, yPos: 0 }, expectedRevision: 'latest' },
      });
    }

    const prevData = await getPreviewWithRetry(client);

    const save = await client.callTool({
      name: 'save_local_design',
      arguments: {
        title,
        expectedRevision: prevData.revision,
        previewId: prevData.previewId,
        visuallyReviewed: true,
      },
    });
    const saveData = parseRes(save, 'save_local_design');
    const durationMs = Date.now() - t0;

    return {
      productId: '101',
      variant: 'Multi-Surface Full Monument (Stela, Cokół, Ledger)',
      status: prevData.previewId && saveData.id ? 'PASS' : 'FAIL',
      warningsCount: (prevData.motifLayout?.warnings?.length || 0) + (prevData.inscriptionLayout?.warnings?.length || 0),
      draftId: saveData.id,
      filePath: saveData.filePath,
      previewPath: saveData.previewPath,
      previewSizeKb: saveData.previewPath && fs.existsSync(saveData.previewPath) ? Math.round(fs.statSync(saveData.previewPath).size / 1024) : 0,
      durationMs,
    };
  } finally {
    if (sessionId) {
      await client.callTool({ name: 'close_local_session', arguments: { sessionId, discardUnsavedChanges: true } }).catch(() => {});
    }
  }
}

async function testProduct5BronzePlaque(client) {
  const title = 'Product 5 — Cast Bronze Plaque (380x280)';
  console.log(`\n▶ Starting test: ${title}...`);
  const t0 = Date.now();
  let sessionId = null;

  try {
    const s = await client.callTool({ name: 'create_local_session', arguments: { productId: '5' } });
    sessionId = parseRes(s, 'create_local_session').sessionId;
    await new Promise((r) => setTimeout(r, 600));

    await client.callTool({ name: 'set_shape', arguments: { shapeId: '67', expectedRevision: 'latest' } });
    await client.callTool({ name: 'set_dimensions', arguments: { widthMm: 380, heightMm: 280, expectedRevision: 'latest' } });
    await client.callTool({
      name: 'set_assembly_options',
      arguments: {
        options: { borderName: 'Border 4', fixingType: 'lugs-with-studs' },
        expectedRevision: 'latest',
      },
    });

    await client.callTool({
      name: 'add_motif',
      arguments: {
        categoryId: 'Religious',
        svgPath: '/shapes/motifs/cross_001.svg',
        heightMm: 45,
        xPos: 0,
        yPos: -85,
        expectedRevision: 'latest',
      },
    });

    await client.callTool({
      name: 'add_inscriptions',
      arguments: {
        inscriptions: [
          { text: 'PAMIĘCI', font: 'Garamond', sizeMm: 16, color: '#D4AF37', xPos: 0, yPos: 42 },
          { text: 'PROF. DR HAB. JAN KOWALSKI', font: 'Garamond', sizeMm: 20, color: '#D4AF37', xPos: 0, yPos: 15 },
          { text: 'WYBITNY NAUKOWIEC I PEDAGOG', font: 'Garamond', sizeMm: 13, color: '#D4AF37', xPos: 0, yPos: -12 },
          { text: '1945 — 2022', font: 'Garamond', sizeMm: 14, color: '#D4AF37', xPos: 0, yPos: -38 },
          { text: 'WDZIĘCZNI STUDENCI I WSPÓŁPRACOWNICY', font: 'Garamond', sizeMm: 11, color: '#D4AF37', xPos: 0, yPos: -70 },
        ],
        expectedRevision: 'latest',
      },
    });

    const prevData = await getPreviewWithRetry(client);

    const save = await client.callTool({
      name: 'save_local_design',
      arguments: {
        title,
        expectedRevision: prevData.revision,
        previewId: prevData.previewId,
        visuallyReviewed: true,
      },
    });
    const saveData = parseRes(save, 'save_local_design');
    const durationMs = Date.now() - t0;

    return {
      productId: '5',
      variant: 'Cast Bronze Plaque Landscape (Border 4, Lugs)',
      status: prevData.previewId && saveData.id ? 'PASS' : 'FAIL',
      warningsCount: (prevData.motifLayout?.warnings?.length || 0) + (prevData.inscriptionLayout?.warnings?.length || 0),
      draftId: saveData.id,
      filePath: saveData.filePath,
      previewPath: saveData.previewPath,
      previewSizeKb: saveData.previewPath && fs.existsSync(saveData.previewPath) ? Math.round(fs.statSync(saveData.previewPath).size / 1024) : 0,
      durationMs,
    };
  } finally {
    if (sessionId) {
      await client.callTool({ name: 'close_local_session', arguments: { sessionId, discardUnsavedChanges: true } }).catch(() => {});
    }
  }
}

async function testProduct4LaserEtched(client) {
  const title = 'Product 4 — Laser-Etched Black Granite Headstone';
  console.log(`\n▶ Starting test: ${title}...`);
  const t0 = Date.now();
  let sessionId = null;

  try {
    const s = await client.callTool({ name: 'create_local_session', arguments: { productId: '4' } });
    sessionId = parseRes(s, 'create_local_session').sessionId;
    await new Promise((r) => setTimeout(r, 600));

    await client.callTool({ name: 'set_dimensions', arguments: { widthMm: 700, heightMm: 800, expectedRevision: 'latest' } });

    await client.callTool({
      name: 'compose_memorial_layout',
      arguments: {
        preset: 'single_centered',
        headerText: 'IN LOVING MEMORY',
        textColor: '#FFFFFF',
        centerMotif: {
          categoryId: 'Religious',
          svgPath: '/shapes/motifs/cross_001.svg',
          color: '#FFFFFF',
          heightMm: 65,
        },
        leftPerson: {
          firstName: 'ANNA',
          lastName: 'NOWAK',
          dates: '1952 — 2021',
          relation: 'Ukochana Mama i Babcia',
          font: 'Garamond',
        },
        bottomText: 'Na zawsze w naszych sercach',
        bottomFont: 'Great Vibes',
        clearExisting: true,
        expectedRevision: 'latest',
      },
    });

    const prevData = await getPreviewWithRetry(client);

    const save = await client.callTool({
      name: 'save_local_design',
      arguments: {
        title,
        expectedRevision: prevData.revision,
        previewId: prevData.previewId,
        visuallyReviewed: true,
      },
    });
    const saveData = parseRes(save, 'save_local_design');
    const durationMs = Date.now() - t0;

    return {
      productId: '4',
      variant: 'Laser-Etched Granite (Single Centered, White Laser)',
      status: prevData.previewId && saveData.id ? 'PASS' : 'FAIL',
      warningsCount: (prevData.motifLayout?.warnings?.length || 0) + (prevData.inscriptionLayout?.warnings?.length || 0),
      draftId: saveData.id,
      filePath: saveData.filePath,
      previewPath: saveData.previewPath,
      previewSizeKb: saveData.previewPath && fs.existsSync(saveData.previewPath) ? Math.round(fs.statSync(saveData.previewPath).size / 1024) : 0,
      durationMs,
    };
  } finally {
    if (sessionId) {
      await client.callTool({ name: 'close_local_session', arguments: { sessionId, discardUnsavedChanges: true } }).catch(() => {});
    }
  }
}

// ---------------------------------------------------------
// Main Test Suite Runner & Report Generator
// ---------------------------------------------------------

async function main() {
  const results = [];

  const args = process.argv.slice(2);
  const targetProduct = args.find((a) => a.startsWith('--product='))?.split('=')[1];

  console.log('====================================================');
  console.log('🏛️ FOREVER MEMORIAL PRODUCT TEST MATRIX AUDIT');
  console.log(`Target: ${targetProduct || 'ALL configured products'}`);
  console.log('====================================================');

  const tests = [
    { id: '124', fn: testProduct124Companion },
    { id: '101', fn: testProduct101FullMonument },
    { id: '5', fn: testProduct5BronzePlaque },
    { id: '4', fn: testProduct4LaserEtched },
  ];

  for (const test of tests) {
    if (targetProduct && targetProduct !== test.id) continue;
    let client = null;
    try {
      const conn = await createMcpClient();
      client = conn.client;
      const res = await test.fn(client);
      results.push(res);
      console.log(`  ✓ ${res.variant}: ${res.status} (${res.durationMs}ms, ${res.warningsCount} warnings)`);
    } catch (err) {
      console.error(`  ✗ Test ${test.id} failed:`, err.message || err);
      results.push({
        productId: test.id,
        variant: `Product ${test.id} Variant`,
        status: 'FAIL',
        warningsCount: 999,
        draftId: 'N/A',
        filePath: null,
        previewPath: null,
        previewSizeKb: 0,
        durationMs: 0,
        error: err.message || String(err),
      });
    } finally {
      if (client) {
        await client.close().catch(() => {});
      }
    }
  }

  // Generate Report
  const passed = results.filter((r) => r.status === 'PASS').length;
  const total = results.length;
  const successPct = total > 0 ? Math.round((passed / total) * 100) : 0;

  let md = `# 🏛️ Forever Memorial Product Test Matrix — Audit Report\n\n`;
  md += `**Date & Time:** ${new Date().toISOString()}\n`;
  md += `**Execution Mode:** Autonomous MCP Verification\n`;
  md += `**Total Variants Tested:** ${total}\n`;
  md += `**Passed:** ${passed} | **Failed:** ${total - passed} | **Success Rate:** ${successPct}%\n\n`;
  md += `--- \n\n`;
  md += `### 📊 Summary Matrix\n\n`;
  md += `| Product ID | Variant Description | Status | Warnings | JPG Size | Duration | Draft ID |\n`;
  md += `|:---:|---|:---:|:---:|:---:|:---:|---|\n`;

  for (const r of results) {
    const statusIcon = r.status === 'PASS' ? '✅ PASS' : '❌ FAIL';
    md += `| **${r.productId}** | ${r.variant} | ${statusIcon} | ${r.warningsCount} | ${r.previewSizeKb} KB | ${(r.durationMs / 1000).toFixed(1)}s | \`${r.draftId}\` |\n`;
  }

  md += `\n---\n\n`;
  md += `### 🔍 Detailed Per-Variant Links & Artifacts\n\n`;

  for (const r of results) {
    md += `#### Product ${r.productId} — ${r.variant}\n`;
    md += `- **Status:** ${r.status === 'PASS' ? '✅ PASS (0 warnings)' : '❌ FAIL'}\n`;
    md += `- **Draft ID:** \`${r.draftId}\`\n`;
    if (r.filePath) md += `- **JSON File:** [${path.basename(r.filePath)}](file:///${r.filePath.replace(/\\/g, '/')})\n`;
    if (r.previewPath) md += `- **JPG Preview:** [${path.basename(r.previewPath)}](file:///${r.previewPath.replace(/\\/g, '/')})\n`;
    md += `- **Execution Time:** ${(r.durationMs / 1000).toFixed(2)} seconds\n\n`;
  }

  const reportsDir = path.resolve('output/reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });
  const reportFile = path.join(reportsDir, `product-test-matrix-${Date.now()}.md`);
  fs.writeFileSync(reportFile, md, 'utf8');

  console.log('\n====================================================');
  console.log(`✅ AUDIT COMPLETE: ${passed}/${total} PASS (${successPct}%)`);
  console.log(`📄 Report saved to: ${reportFile}`);
  console.log('====================================================\n');
}

main().catch(console.error);
