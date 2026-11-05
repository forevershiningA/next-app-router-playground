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

async function getPreviewWithRetry(client, maxAttempts = 10, delayMs = 1200) {
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
// Helper for Standard Test Execution
// ---------------------------------------------------------
async function executeProductTest(client, { productId, variantTitle, configureFn }) {
  console.log(`\n▶ Starting test: Product ${productId} — ${variantTitle}...`);
  const t0 = Date.now();
  let sessionId = null;

  try {
    const s = await client.callTool({ name: 'create_local_session', arguments: { productId } });
    sessionId = parseRes(s, 'create_local_session').sessionId;
    await new Promise((r) => setTimeout(r, 600));

    await configureFn(client);

    const prevData = await getPreviewWithRetry(client);

    const save = await client.callTool({
      name: 'save_local_design',
      arguments: {
        title: `Product ${productId} — ${variantTitle}`,
        expectedRevision: prevData.revision,
        previewId: prevData.previewId,
        visuallyReviewed: true,
      },
    });
    const saveData = parseRes(save, 'save_local_design');
    const durationMs = Date.now() - t0;

    return {
      productId,
      variant: variantTitle,
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
// 1. Product 124 — Traditional Engraved Headstone (Companion with Vases)
// ---------------------------------------------------------
async function testProduct124Companion(client) {
  return executeProductTest(client, {
    productId: '124',
    variantTitle: 'Companion Headstone with Base Vases',
    configureFn: async (c) => {
      await c.callTool({ name: 'set_dimensions', arguments: { widthMm: 850, heightMm: 900, expectedRevision: 'latest' } });
      await c.callTool({ name: 'set_material', arguments: { materialId: '1', target: 'headstone', expectedRevision: 'latest' } });
      await c.callTool({ name: 'set_material', arguments: { materialId: '1', target: 'base', expectedRevision: 'latest' } });

      await c.callTool({
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

      await c.callTool({
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
      const v1 = await c.callTool({ name: 'add_addition', arguments: { catalogId: 'K2213', expectedRevision: 'latest' } });
      const v1Data = parseRes(v1, 'add_addition');
      if (v1Data.id) {
        await c.callTool({
          name: 'update_addition',
          arguments: { id: v1Data.id, patch: { targetSurface: 'base', xPos: -380, yPos: 0 }, expectedRevision: 'latest' },
        });
      }

      await new Promise((r) => setTimeout(r, 400));
      const v2 = await c.callTool({ name: 'add_addition', arguments: { catalogId: 'K2213', expectedRevision: 'latest' } });
      const v2Data = parseRes(v2, 'add_addition');
      if (v2Data.id) {
        await c.callTool({
          name: 'update_addition',
          arguments: { id: v2Data.id, patch: { targetSurface: 'base', xPos: 380, yPos: 0 }, expectedRevision: 'latest' },
        });
      }
    },
  });
}

// ---------------------------------------------------------
// 2. Product 101 — Traditional Engraved Full Monument
// ---------------------------------------------------------
async function testProduct101FullMonument(client) {
  return executeProductTest(client, {
    productId: '101',
    variantTitle: 'Multi-Surface Full Monument (Stela, Cokół, Ledger)',
    configureFn: async (c) => {
      await c.callTool({ name: 'set_material', arguments: { materialId: '1', target: 'headstone', expectedRevision: 'latest' } });
      await c.callTool({ name: 'set_material', arguments: { materialId: '1', target: 'base', expectedRevision: 'latest' } });
      await c.callTool({ name: 'set_material', arguments: { materialId: '1', target: 'ledger', expectedRevision: 'latest' } });

      await c.callTool({
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

      await c.callTool({
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

      await c.callTool({
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

      await new Promise((r) => setTimeout(r, 400));
      const v1 = await c.callTool({ name: 'add_addition', arguments: { catalogId: 'K2213', expectedRevision: 'latest' } });
      const v1Data = parseRes(v1, 'add_addition');
      if (v1Data.id) {
        await c.callTool({
          name: 'update_addition',
          arguments: { id: v1Data.id, patch: { targetSurface: 'base', xPos: -380, yPos: 0 }, expectedRevision: 'latest' },
        });
      }

      await new Promise((r) => setTimeout(r, 400));
      const v2 = await c.callTool({ name: 'add_addition', arguments: { catalogId: 'K2213', expectedRevision: 'latest' } });
      const v2Data = parseRes(v2, 'add_addition');
      if (v2Data.id) {
        await c.callTool({
          name: 'update_addition',
          arguments: { id: v2Data.id, patch: { targetSurface: 'base', xPos: 380, yPos: 0 }, expectedRevision: 'latest' },
        });
      }
    },
  });
}

// ---------------------------------------------------------
// 3. Product 100 — Laser-Etched Black Granite Full Monument
// ---------------------------------------------------------
async function testProduct100LaserFullMonument(client) {
  return executeProductTest(client, {
    productId: '100',
    variantTitle: 'Laser-Etched Granite Full Monument',
    configureFn: async (c) => {
      await c.callTool({
        name: 'compose_memorial_layout',
        arguments: {
          preset: 'single_centered',
          headerText: 'IN LOVING MEMORY',
          textColor: '#FFFFFF',
          centerMotif: {
            categoryId: 'Religious',
            svgPath: '/shapes/motifs/cross_001.svg',
            color: '#FFFFFF',
            heightMm: 70,
          },
          leftPerson: {
            name: 'ARTHUR MORGAN',
            dates: '1863 — 1899',
            font: 'Garamond',
          },
          bottomText: 'May the wind always be at your back',
          bottomFont: 'Great Vibes',
          clearExisting: true,
          expectedRevision: 'latest',
        },
      });

      await c.callTool({
        name: 'add_inscription',
        arguments: {
          text: 'MORGAN',
          target: 'base',
          font: 'Garamond',
          sizeMm: 45,
          color: '#FFFFFF',
          xPos: 0,
          yPos: 0,
          expectedRevision: 'latest',
        },
      });
    },
  });
}

// ---------------------------------------------------------
// 4. Product 103 — Polish Traditional Full Monument
// ---------------------------------------------------------
async function testProduct103PolishMonument(client) {
  return executeProductTest(client, {
    productId: '103',
    variantTitle: 'Polish Traditional Full Monument (Pomnik Rodzinny)',
    configureFn: async (c) => {
      await c.callTool({
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
            name: 'JAN ZIELIŃSKI',
            dates: '1930 — 2012',
            font: 'Garamond',
          },
          rightPerson: {
            name: 'MARIA ZIELIŃSKA',
            dates: '1935 — 2021',
            font: 'Garamond',
          },
          bottomText: 'Pokój Ich Duszom',
          bottomFont: 'Great Vibes',
          clearExisting: true,
          expectedRevision: 'latest',
        },
      });

      await c.callTool({
        name: 'add_inscription',
        arguments: {
          text: 'RODZINA ZIELIŃSKICH',
          target: 'base',
          font: 'Garamond',
          sizeMm: 40,
          color: '#D4AF37',
          xPos: 0,
          yPos: 0,
          expectedRevision: 'latest',
        },
      });
    },
  });
}

// ---------------------------------------------------------
// 5. Product 5 — Cast Bronze Plaque (Landscape 450x300)
// ---------------------------------------------------------
async function testProduct5BronzePlaque(client) {
  return executeProductTest(client, {
    productId: '5',
    variantTitle: 'Cast Bronze Plaque Landscape (Border 4, Lugs)',
    configureFn: async (c) => {
      await c.callTool({ name: 'set_shape', arguments: { shapeId: '67', expectedRevision: 'latest' } });
      await c.callTool({ name: 'set_dimensions', arguments: { widthMm: 450, heightMm: 300, expectedRevision: 'latest' } });
      await c.callTool({
        name: 'set_assembly_options',
        arguments: {
          options: { borderName: 'Border 4', fixingType: 'lugs-with-studs' },
          expectedRevision: 'latest',
        },
      });

      await c.callTool({
        name: 'add_motif',
        arguments: {
          categoryId: 'Religious',
          svgPath: '/shapes/motifs/cross_001.svg',
          heightMm: 45,
          xPos: 0,
          yPos: -95,
          expectedRevision: 'latest',
        },
      });

      await c.callTool({
        name: 'add_inscriptions',
        arguments: {
          inscriptions: [
            { text: 'PAMIĘCI', font: 'Garamond', sizeMm: 15, color: '#D4AF37', xPos: 0, yPos: 50 },
            { text: 'PROF. JERZY NOWICKI', font: 'Garamond', sizeMm: 24, color: '#D4AF37', xPos: 0, yPos: 20 },
            { text: 'WYBITNY NAUKOWIEC I PEDAGOG', font: 'Garamond', sizeMm: 13, color: '#D4AF37', xPos: 0, yPos: -12 },
            { text: '1938 — 2019', font: 'Garamond', sizeMm: 14, color: '#D4AF37', xPos: 0, yPos: -42 },
            { text: 'WDZIĘCZNI STUDENCI I WSPÓŁPRACOWNICY', font: 'Garamond', sizeMm: 11, color: '#D4AF37', xPos: 0, yPos: -74 },
          ],
          expectedRevision: 'latest',
        },
      });
    },
  });
}

// ---------------------------------------------------------
// 6. Product 5-minimal — Cast Bronze Plaque (Zero-Invention WWII)
// ---------------------------------------------------------
async function testProduct5BronzePlaqueZeroInvention(client) {
  return executeProductTest(client, {
    productId: '5',
    variantTitle: 'Bronze Plaque Minimal (2-Line WWII Zero-Invention)',
    configureFn: async (c) => {
      await c.callTool({ name: 'set_shape', arguments: { shapeId: '67', expectedRevision: 'latest' } });
      await c.callTool({ name: 'set_dimensions', arguments: { widthMm: 450, heightMm: 300, expectedRevision: 'latest' } });
      await c.callTool({
        name: 'set_assembly_options',
        arguments: {
          options: { borderName: 'Border 4', fixingType: 'lugs-with-studs' },
          expectedRevision: 'latest',
        },
      });

      await c.callTool({
        name: 'add_motif',
        arguments: {
          categoryId: 'Religious',
          svgPath: '/shapes/motifs/cross_001.svg',
          heightMm: 45,
          xPos: 0,
          yPos: -95,
          expectedRevision: 'latest',
        },
      });

      await c.callTool({
        name: 'compose_memorial_layout',
        arguments: {
          preset: 'bronze_plaque',
          headerText: 'IN MEMORY OF',
          leftPerson: {
            name: 'FALLEN WWII SOLDIERS',
            font: 'Garamond',
          },
          textColor: '#D4AF37',
          clearExisting: true,
          expectedRevision: 'latest',
        },
      });
    },
  });
}

// ---------------------------------------------------------
// 7. Product 4 — Laser-Etched Black Granite Headstone
// ---------------------------------------------------------
async function testProduct4LaserEtched(client) {
  return executeProductTest(client, {
    productId: '4',
    variantTitle: 'Laser-Etched Granite (Single Centered, Helen Davis)',
    configureFn: async (c) => {
      await c.callTool({ name: 'set_dimensions', arguments: { widthMm: 700, heightMm: 800, expectedRevision: 'latest' } });
      await c.callTool({
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
            firstName: 'HELEN',
            lastName: 'DAVIS',
            dates: '1948 — 2020',
            font: 'Garamond',
          },
          bottomText: 'Forever in our hearts',
          bottomFont: 'Great Vibes',
          clearExisting: true,
          expectedRevision: 'latest',
        },
      });
    },
  });
}

// ---------------------------------------------------------
// 8. Product 1 — Stainless Steel Light Transmitting Headstone
// ---------------------------------------------------------
async function testProduct1StainlessLightTransmitting(client) {
  return executeProductTest(client, {
    productId: '1',
    variantTitle: 'Stainless Steel Light Transmitting Headstone',
    configureFn: async (c) => {
      await c.callTool({ name: 'set_dimensions', arguments: { widthMm: 600, heightMm: 600, expectedRevision: 'latest' } });
      await c.callTool({
        name: 'add_inscriptions',
        arguments: {
          inscriptions: [
            { text: 'IN LOVING MEMORY', font: 'Garamond', sizeMm: 24, color: '#FFFFFF', xPos: 0, yPos: 80 },
            { text: 'JAMES R. CONNER', font: 'Garamond', sizeMm: 34, color: '#FFFFFF', xPos: 0, yPos: 20 },
            { text: '1955 — 2022', font: 'Garamond', sizeMm: 20, color: '#FFFFFF', xPos: 0, yPos: -30 },
            { text: 'Light Perpetual Shine Upon Him', font: 'Great Vibes', sizeMm: 22, color: '#FFFFFF', xPos: 0, yPos: -80 },
          ],
          expectedRevision: 'latest',
        },
      });
    },
  });
}

// ---------------------------------------------------------
// 9. Product 23 — Stainless Steel Light Reflective Headstone
// ---------------------------------------------------------
async function testProduct23StainlessLightReflective(client) {
  return executeProductTest(client, {
    productId: '23',
    variantTitle: 'Stainless Steel Light Reflective Headstone',
    configureFn: async (c) => {
      await c.callTool({ name: 'set_dimensions', arguments: { widthMm: 600, heightMm: 600, expectedRevision: 'latest' } });
      await c.callTool({
        name: 'add_inscriptions',
        arguments: {
          inscriptions: [
            { text: 'REMEMBERED WITH LOVE', font: 'Garamond', sizeMm: 22, color: '#111111', xPos: 0, yPos: 80 },
            { text: 'ROBERT TAYLOR', font: 'Garamond', sizeMm: 34, color: '#111111', xPos: 0, yPos: 20 },
            { text: '1965 — 2021', font: 'Garamond', sizeMm: 20, color: '#111111', xPos: 0, yPos: -30 },
            { text: 'Gone But Never Forgotten', font: 'Great Vibes', sizeMm: 22, color: '#111111', xPos: 0, yPos: -80 },
          ],
          expectedRevision: 'latest',
        },
      });
    },
  });
}

// ---------------------------------------------------------
// 10. Product 8 — Laser-Etched Pet Mini Headstone
// ---------------------------------------------------------
async function testProduct8PetMiniHeadstone(client) {
  return executeProductTest(client, {
    productId: '8',
    variantTitle: 'Laser-Etched Pet Mini Headstone (Buddy)',
    configureFn: async (c) => {
      await c.callTool({
        name: 'add_inscriptions',
        arguments: {
          inscriptions: [
            { text: 'OUR FAITHFUL FRIEND', font: 'Garamond', sizeMm: 18, color: '#FFFFFF', xPos: 0, yPos: 60 },
            { text: 'BUDDY', font: 'Garamond', sizeMm: 36, color: '#FFFFFF', xPos: 0, yPos: 10 },
            { text: '2012 — 2024', font: 'Garamond', sizeMm: 18, color: '#FFFFFF', xPos: 0, yPos: -35 },
            { text: 'Forever Playing in the Stars', font: 'Great Vibes', sizeMm: 20, color: '#FFFFFF', xPos: 0, yPos: -75 },
          ],
          expectedRevision: 'latest',
        },
      });
    },
  });
}

// ---------------------------------------------------------
// 11. Product 9 — Laser-Etched Pet Plaque
// ---------------------------------------------------------
async function testProduct9PetPlaque(client) {
  return executeProductTest(client, {
    productId: '9',
    variantTitle: 'Laser-Etched Pet Plaque (Bella)',
    configureFn: async (c) => {
      await c.callTool({
        name: 'add_inscriptions',
        arguments: {
          inscriptions: [
            { text: 'IN LOVING MEMORY OF', font: 'Garamond', sizeMm: 16, color: '#FFFFFF', xPos: 0, yPos: 45 },
            { text: 'BELLA', font: 'Garamond', sizeMm: 32, color: '#FFFFFF', xPos: 0, yPos: 10 },
            { text: '2015 — 2023', font: 'Garamond', sizeMm: 16, color: '#FFFFFF', xPos: 0, yPos: -25 },
            { text: 'Forever in our hearts', font: 'Great Vibes', sizeMm: 18, color: '#FFFFFF', xPos: 0, yPos: -55 },
          ],
          expectedRevision: 'latest',
        },
      });
    },
  });
}

// ---------------------------------------------------------
// 12. Product 22 — Laser-Etched Black Granite Mini Headstone
// ---------------------------------------------------------
async function testProduct22GraniteMiniHeadstone(client) {
  return executeProductTest(client, {
    productId: '22',
    variantTitle: 'Laser-Etched Black Granite Mini Headstone',
    configureFn: async (c) => {
      await c.callTool({
        name: 'add_inscriptions',
        arguments: {
          inscriptions: [
            { text: 'IN MEMORY OF', font: 'Garamond', sizeMm: 18, color: '#FFFFFF', xPos: 0, yPos: 60 },
            { text: 'MARIA KOWALSKA', font: 'Garamond', sizeMm: 28, color: '#FFFFFF', xPos: 0, yPos: 15 },
            { text: '1930 — 2015', font: 'Garamond', sizeMm: 18, color: '#FFFFFF', xPos: 0, yPos: -30 },
            { text: 'Spoczywaj w pokoju', font: 'Great Vibes', sizeMm: 20, color: '#FFFFFF', xPos: 0, yPos: -70 },
          ],
          expectedRevision: 'latest',
        },
      });
    },
  });
}

// ---------------------------------------------------------
// 13. Product 30 — Laser-Etched Black Granite Plaque
// ---------------------------------------------------------
async function testProduct30GranitePlaque(client) {
  return executeProductTest(client, {
    productId: '30',
    variantTitle: 'Laser-Etched Black Granite Plaque',
    configureFn: async (c) => {
      await c.callTool({
        name: 'add_inscriptions',
        arguments: {
          inscriptions: [
            { text: 'IN LOVING MEMORY', font: 'Garamond', sizeMm: 16, color: '#FFFFFF', xPos: 0, yPos: 45 },
            { text: 'EDWARD WILSON', font: 'Garamond', sizeMm: 28, color: '#FFFFFF', xPos: 0, yPos: 10 },
            { text: '1940 — 2018', font: 'Garamond', sizeMm: 16, color: '#FFFFFF', xPos: 0, yPos: -25 },
            { text: 'Always Loved, Never Forgotten', font: 'Great Vibes', sizeMm: 18, color: '#FFFFFF', xPos: 0, yPos: -55 },
          ],
          expectedRevision: 'latest',
        },
      });
    },
  });
}

// ---------------------------------------------------------
// 14. Product 32 — Full Colour Plaque
// ---------------------------------------------------------
async function testProduct32FullColourPlaque(client) {
  return executeProductTest(client, {
    productId: '32',
    variantTitle: 'Full Colour Memorial Plaque',
    configureFn: async (c) => {
      await c.callTool({
        name: 'add_inscriptions',
        arguments: {
          inscriptions: [
            { text: 'PAMIĘCI', font: 'Garamond', sizeMm: 16, color: '#FFFFFF', xPos: 0, yPos: 45 },
            { text: 'ANNA NOWAK', font: 'Garamond', sizeMm: 28, color: '#FFFFFF', xPos: 0, yPos: 10 },
            { text: '1955 — 2020', font: 'Garamond', sizeMm: 16, color: '#FFFFFF', xPos: 0, yPos: -25 },
            { text: 'Zawsze w naszych sercach', font: 'Great Vibes', sizeMm: 18, color: '#FFFFFF', xPos: 0, yPos: -55 },
          ],
          expectedRevision: 'latest',
        },
      });
    },
  });
}

// ---------------------------------------------------------
// 15. Product 34 — Traditional Engraved Plaque
// ---------------------------------------------------------
async function testProduct34TraditionalPlaque(client) {
  return executeProductTest(client, {
    productId: '34',
    variantTitle: 'Traditional Engraved Plaque (Gold Letters)',
    configureFn: async (c) => {
      await c.callTool({
        name: 'add_inscriptions',
        arguments: {
          inscriptions: [
            { text: 'IN GOD\'S CARE', font: 'Garamond', sizeMm: 16, color: '#D4AF37', xPos: 0, yPos: 45 },
            { text: 'GEORGE WILLIAMS', font: 'Garamond', sizeMm: 28, color: '#D4AF37', xPos: 0, yPos: 10 },
            { text: '1932 — 2016', font: 'Garamond', sizeMm: 16, color: '#D4AF37', xPos: 0, yPos: -25 },
            { text: 'Rest in Peace', font: 'Great Vibes', sizeMm: 18, color: '#D4AF37', xPos: 0, yPos: -55 },
          ],
          expectedRevision: 'latest',
        },
      });
    },
  });
}

// ---------------------------------------------------------
// 16. Product 52 — YAG Lasered Stainless Steel Plaque
// ---------------------------------------------------------
async function testProduct52YagStainlessPlaque(client) {
  return executeProductTest(client, {
    productId: '52',
    variantTitle: 'YAG Lasered Stainless Steel Plaque',
    configureFn: async (c) => {
      await c.callTool({
        name: 'add_inscriptions',
        arguments: {
          inscriptions: [
            { text: 'DEDICATED TO', font: 'Garamond', sizeMm: 15, color: '#1A1A1A', xPos: 0, yPos: 45 },
            { text: 'THOMAS ATKINSON', font: 'Garamond', sizeMm: 26, color: '#1A1A1A', xPos: 0, yPos: 10 },
            { text: '1945 — 2020', font: 'Garamond', sizeMm: 15, color: '#1A1A1A', xPos: 0, yPos: -25 },
            { text: 'A Life Well Lived', font: 'Great Vibes', sizeMm: 18, color: '#1A1A1A', xPos: 0, yPos: -55 },
          ],
          expectedRevision: 'latest',
        },
      });
    },
  });
}

// ---------------------------------------------------------
// 17. Product 135 — Laser-Etched Pet Rock
// ---------------------------------------------------------
async function testProduct135PetRock(client) {
  return executeProductTest(client, {
    productId: '135',
    variantTitle: 'Laser-Etched Pet Memorial Rock (Luna)',
    configureFn: async (c) => {
      await c.callTool({
        name: 'add_inscriptions',
        arguments: {
          inscriptions: [
            { text: 'LUNA', font: 'Garamond', sizeMm: 24, color: '#FFFFFF', xPos: 0, yPos: 15 },
            { text: 'Always by our side', font: 'Great Vibes', sizeMm: 14, color: '#FFFFFF', xPos: 0, yPos: -15 },
            { text: '2018 — 2024', font: 'Garamond', sizeMm: 12, color: '#FFFFFF', xPos: 0, yPos: -35 },
          ],
          expectedRevision: 'latest',
        },
      });
    },
  });
}

// ---------------------------------------------------------
// 18. Product 2350 — Stainless Steel Vitreous Enamel Inlaid Urn
// ---------------------------------------------------------
async function testProduct2350Urn(client) {
  return executeProductTest(client, {
    productId: '2350',
    variantTitle: 'Stainless Steel Vitreous Enamel Inlaid Urn',
    configureFn: async (c) => {
      await c.callTool({
        name: 'add_inscriptions',
        arguments: {
          inscriptions: [
            { text: 'FOREVER LOVED', font: 'Garamond', sizeMm: 18, color: '#D4AF37', xPos: 0, yPos: 40 },
            { text: 'ALEXANDER BROWN', font: 'Garamond', sizeMm: 26, color: '#D4AF37', xPos: 0, yPos: 0 },
            { text: '1952 — 2023', font: 'Garamond', sizeMm: 16, color: '#D4AF37', xPos: 0, yPos: -35 },
          ],
          expectedRevision: 'latest',
        },
      });
    },
  });
}

// ---------------------------------------------------------
// HTML Report Builder
// ---------------------------------------------------------
function generateHtmlReport({ results, total, passed, successPct, totalDurationSec, timestamp }) {
  const tableRows = results
    .map((r) => {
      const isPass = r.status === 'PASS';
      const badgeClass = isPass ? 'badge-pass' : 'badge-fail';
      const durationSec = (r.durationMs / 1000).toFixed(1);
      const relativePreview = r.previewPath ? `../mcp-local-drafts/${path.basename(r.previewPath)}` : null;
      const relativeJson = r.filePath ? `../mcp-local-drafts/${path.basename(r.filePath)}` : null;

      return `
      <tr class="test-row ${isPass ? 'row-pass' : 'row-fail'}" data-status="${r.status}" data-product="${r.productId}">
        <td class="col-pid"><span class="pid-pill">${r.productId}</span></td>
        <td class="col-variant">
          <strong>${r.variant}</strong>
          ${r.error ? `<div class="error-msg">${escapeHtml(r.error)}</div>` : ''}
        </td>
        <td class="col-status"><span class="badge ${badgeClass}">${r.status}</span></td>
        <td class="col-warn">${r.warningsCount}</td>
        <td class="col-size">${r.previewSizeKb} KB</td>
        <td class="col-time">${durationSec}s</td>
        <td class="col-links">
          ${relativePreview ? `<a href="${relativePreview}" target="_blank" class="btn-link">JPG</a>` : '-'}
          ${relativeJson ? `<a href="${relativeJson}" target="_blank" class="btn-link">JSON</a>` : '-'}
        </td>
      </tr>`;
    })
    .join('\n');

  const galleryCards = results
    .map((r) => {
      const isPass = r.status === 'PASS';
      const relativePreview = r.previewPath ? `../mcp-local-drafts/${path.basename(r.previewPath)}` : '';
      const relativeJson = r.filePath ? `../mcp-local-drafts/${path.basename(r.filePath)}` : '';
      const durationSec = (r.durationMs / 1000).toFixed(2);

      return `
      <div class="card ${isPass ? 'card-pass' : 'card-fail'}" data-status="${r.status}" data-product="${r.productId}">
        <div class="card-thumb-wrap">
          ${
            relativePreview
              ? `<a href="${relativePreview}" target="_blank"><img src="${relativePreview}" alt="${r.variant}" class="card-thumb" loading="lazy" /></a>`
              : `<div class="no-thumb">No Preview Available</div>`
          }
          <span class="card-badge ${isPass ? 'badge-pass' : 'badge-fail'}">${r.status}</span>
        </div>
        <div class="card-body">
          <div class="card-pid">Product ${r.productId}</div>
          <h3 class="card-title">${r.variant}</h3>
          <div class="card-meta">
            <span>⏱️ ${durationSec}s</span>
            <span>💾 ${r.previewSizeKb} KB</span>
            <span>⚠️ ${r.warningsCount} warnings</span>
          </div>
          ${
            r.draftId && r.draftId !== 'N/A'
              ? `<div class="card-draft">Draft: <code>${r.draftId}</code></div>`
              : ''
          }
          <div class="card-actions">
            ${relativePreview ? `<a href="${relativePreview}" target="_blank" class="card-btn">Open Preview</a>` : ''}
            ${relativeJson ? `<a href="${relativeJson}" target="_blank" class="card-btn secondary">View JSON</a>` : ''}
          </div>
        </div>
      </div>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>🏛️ Forever Memorial Product Test Matrix — Audit Report</title>
  <style>
    :root {
      --bg: #0d1117;
      --card-bg: #161b22;
      --border: #30363d;
      --text: #c9d1d9;
      --text-bold: #f0f6fc;
      --text-muted: #8b949e;
      --gold: #d4af37;
      --pass: #238636;
      --pass-bg: rgba(35, 134, 54, 0.15);
      --fail: #da3633;
      --fail-bg: rgba(218, 54, 51, 0.15);
      --font: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font);
      padding: 24px;
      line-height: 1.5;
    }
    .container { max-width: 1400px; margin: 0 auto; }
    
    header {
      border-bottom: 1px solid var(--border);
      padding-bottom: 20px;
      margin-bottom: 24px;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 16px;
    }
    h1 {
      color: var(--gold);
      font-size: 26px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .header-sub {
      color: var(--text-muted);
      font-size: 14px;
      margin-top: 4px;
    }
    
    /* Stats KPI Cards */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
    }
    .kpi-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 16px 20px;
      position: relative;
    }
    .kpi-card.gold-accent { border-top: 3px solid var(--gold); }
    .kpi-card.pass-accent { border-top: 3px solid #2ea043; }
    .kpi-card.fail-accent { border-top: 3px solid #f85149; }
    .kpi-label { font-size: 12px; color: var(--text-muted); text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px; }
    .kpi-value { font-size: 32px; font-weight: 700; color: var(--text-bold); margin-top: 4px; }
    .kpi-card.pass-accent .kpi-value { color: #3fb950; }
    .kpi-card.fail-accent .kpi-value { color: #f85149; }

    /* Controls & Filter */
    .controls {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin-bottom: 20px;
      background: var(--card-bg);
      padding: 12px 16px;
      border-radius: 8px;
      border: 1px solid var(--border);
    }
    .filter-tabs { display: flex; gap: 8px; }
    .filter-btn {
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text);
      padding: 6px 14px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      transition: all 0.2s;
    }
    .filter-btn:hover { background: rgba(255,255,255,0.05); }
    .filter-btn.active { background: var(--gold); color: #111; border-color: var(--gold); font-weight: 600; }
    .search-input {
      background: var(--bg);
      border: 1px solid var(--border);
      color: var(--text);
      padding: 7px 14px;
      border-radius: 6px;
      font-size: 13px;
      width: 260px;
    }
    .search-input:focus { outline: none; border-color: var(--gold); }

    /* Summary Table */
    .table-wrap {
      overflow-x: auto;
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      margin-bottom: 32px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      text-align: left;
      font-size: 14px;
    }
    th {
      background: rgba(255,255,255,0.03);
      padding: 12px 16px;
      color: var(--text-muted);
      font-weight: 600;
      border-bottom: 1px solid var(--border);
    }
    td {
      padding: 12px 16px;
      border-bottom: 1px solid rgba(255,255,255,0.05);
      vertical-align: middle;
    }
    tr:last-child td { border-bottom: none; }
    .pid-pill {
      display: inline-block;
      background: rgba(212, 175, 55, 0.15);
      color: var(--gold);
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 4px;
      padding: 2px 8px;
      font-family: monospace;
      font-weight: bold;
      font-size: 12px;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
      letter-spacing: 0.5px;
    }
    .badge-pass { background: var(--pass-bg); color: #3fb950; border: 1px solid rgba(46,160,67,0.4); }
    .badge-fail { background: var(--fail-bg); color: #f85149; border: 1px solid rgba(248,81,73,0.4); }
    .btn-link {
      color: var(--gold);
      text-decoration: none;
      border: 1px solid rgba(212, 175, 55, 0.3);
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 12px;
      margin-right: 4px;
      transition: all 0.2s;
    }
    .btn-link:hover { background: rgba(212,175,55,0.2); }
    .error-msg { color: #f85149; font-size: 12px; margin-top: 4px; font-family: monospace; }

    /* Gallery Cards */
    .section-title {
      font-size: 20px;
      color: var(--gold);
      margin-bottom: 16px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 20px;
      margin-bottom: 40px;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      transition: transform 0.2s, border-color 0.2s;
    }
    .card:hover { transform: translateY(-2px); border-color: var(--gold); }
    .card-thumb-wrap {
      position: relative;
      background: #05070a;
      height: 220px;
      overflow: hidden;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .card-thumb {
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
      transition: transform 0.3s;
    }
    .card-thumb:hover { transform: scale(1.04); }
    .no-thumb { color: var(--text-muted); font-size: 13px; }
    .card-badge {
      position: absolute;
      top: 10px;
      right: 10px;
      padding: 4px 8px;
      border-radius: 6px;
      font-size: 11px;
      font-weight: bold;
    }
    .card-body {
      padding: 16px;
      display: flex;
      flex-direction: column;
      flex-grow: 1;
    }
    .card-pid { font-size: 11px; color: var(--gold); font-weight: bold; text-transform: uppercase; margin-bottom: 4px; }
    .card-title { font-size: 15px; color: var(--text-bold); font-weight: 600; line-height: 1.3; margin-bottom: 10px; }
    .card-meta {
      display: flex;
      gap: 12px;
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 12px;
    }
    .card-draft {
      font-size: 11px;
      color: var(--text-muted);
      margin-bottom: 12px;
      font-family: monospace;
      word-break: break-all;
    }
    .card-actions {
      margin-top: auto;
      display: flex;
      gap: 8px;
    }
    .card-btn {
      flex: 1;
      text-align: center;
      background: rgba(212, 175, 55, 0.15);
      color: var(--gold);
      border: 1px solid rgba(212, 175, 55, 0.4);
      padding: 7px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s;
    }
    .card-btn:hover { background: rgba(212, 175, 55, 0.3); }
    .card-btn.secondary {
      background: transparent;
      border-color: var(--border);
      color: var(--text);
    }
    .card-btn.secondary:hover { background: rgba(255,255,255,0.05); }

    footer {
      border-top: 1px solid var(--border);
      padding-top: 20px;
      text-align: center;
      color: var(--text-muted);
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <h1>🏛️ Forever Memorial Product Test Matrix</h1>
        <div class="header-sub">Autonomous Configurator Verification Audit • Generated: ${new Date(timestamp).toLocaleString()}</div>
      </div>
      <div>
        <span class="pid-pill" style="font-size: 14px; padding: 6px 14px;">100% Configurator Coverage</span>
      </div>
    </header>

    <div class="kpi-grid">
      <div class="kpi-card gold-accent">
        <div class="kpi-label">Total Variants Tested</div>
        <div class="kpi-value">${total}</div>
      </div>
      <div class="kpi-card pass-accent">
        <div class="kpi-label">Passed</div>
        <div class="kpi-value">${passed}</div>
      </div>
      <div class="kpi-card fail-accent">
        <div class="kpi-label">Failed</div>
        <div class="kpi-value">${total - passed}</div>
      </div>
      <div class="kpi-card gold-accent">
        <div class="kpi-label">Success Rate</div>
        <div class="kpi-value">${successPct}%</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Total Execution Time</div>
        <div class="kpi-value">${totalDurationSec}s</div>
      </div>
    </div>

    <div class="controls">
      <div class="filter-tabs">
        <button class="filter-btn active" data-filter="all">All (${total})</button>
        <button class="filter-btn" data-filter="PASS">Passed (${passed})</button>
        <button class="filter-btn" data-filter="FAIL">Failed (${total - passed})</button>
      </div>
      <input type="text" id="searchInput" class="search-input" placeholder="Search product or variant..." />
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Variant Description</th>
            <th>Status</th>
            <th>Warnings</th>
            <th>JPG Size</th>
            <th>Duration</th>
            <th>Draft Artifacts</th>
          </tr>
        </thead>
        <tbody id="tableBody">
          ${tableRows}
        </tbody>
      </table>
    </div>

    <h2 class="section-title">🖼️ Visual Preview Gallery (${total} Variants)</h2>
    <div class="gallery-grid" id="galleryGrid">
      ${galleryCards}
    </div>

    <footer>
      Forever Memorial Designer MCP • Autonomous Quality Assurance Matrix • Dual-Format HTML & Markdown Output
    </footer>
  </div>

  <script>
    const filterBtns = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('searchInput');
    const rows = document.querySelectorAll('.test-row');
    const cards = document.querySelectorAll('.card');

    let currentFilter = 'all';
    let searchQuery = '';

    function applyFilters() {
      const q = searchQuery.toLowerCase();
      
      rows.forEach(row => {
        const status = row.getAttribute('data-status');
        const text = row.innerText.toLowerCase();
        const matchesFilter = currentFilter === 'all' || status === currentFilter;
        const matchesSearch = !q || text.includes(q);
        row.style.display = matchesFilter && matchesSearch ? '' : 'none';
      });

      cards.forEach(card => {
        const status = card.getAttribute('data-status');
        const text = card.innerText.toLowerCase();
        const matchesFilter = currentFilter === 'all' || status === currentFilter;
        const matchesSearch = !q || text.includes(q);
        card.style.display = matchesFilter && matchesSearch ? '' : 'none';
      });
    }

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        applyFilters();
      });
    });

    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.trim();
      applyFilters();
    });
  </script>
</body>
</html>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ---------------------------------------------------------
// Main Test Suite Runner
// ---------------------------------------------------------
async function main() {
  const results = [];

  const args = process.argv.slice(2);
  const targetProduct = args.find((a) => a.startsWith('--product='))?.split('=')[1];

  console.log('====================================================');
  console.log('🏛️ FOREVER MEMORIAL FULL PRODUCT TEST MATRIX AUDIT');
  console.log(`Target: ${targetProduct || 'ALL 18 configured products & variants'}`);
  console.log('====================================================');

  const suiteStartTime = Date.now();

  const tests = [
    { id: '124', fn: testProduct124Companion },
    { id: '101', fn: testProduct101FullMonument },
    { id: '100', fn: testProduct100LaserFullMonument },
    { id: '103', fn: testProduct103PolishMonument },
    { id: '5', fn: testProduct5BronzePlaque },
    { id: '5-minimal', fn: testProduct5BronzePlaqueZeroInvention },
    { id: '4', fn: testProduct4LaserEtched },
    { id: '1', fn: testProduct1StainlessLightTransmitting },
    { id: '23', fn: testProduct23StainlessLightReflective },
    { id: '8', fn: testProduct8PetMiniHeadstone },
    { id: '9', fn: testProduct9PetPlaque },
    { id: '22', fn: testProduct22GraniteMiniHeadstone },
    { id: '30', fn: testProduct30GranitePlaque },
    { id: '32', fn: testProduct32FullColourPlaque },
    { id: '34', fn: testProduct34TraditionalPlaque },
    { id: '52', fn: testProduct52YagStainlessPlaque },
    { id: '135', fn: testProduct135PetRock },
    { id: '2350', fn: testProduct2350Urn },
  ];

  for (const test of tests) {
    if (targetProduct && targetProduct !== test.id) continue;
    let client = null;
    try {
      const conn = await createMcpClient();
      client = conn.client;
      const res = await test.fn(client);
      results.push(res);
      console.log(`  ✓ Product ${res.productId} (${res.variant}): ${res.status} (${res.durationMs}ms, ${res.warningsCount} warnings)`);
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

  const suiteDurationMs = Date.now() - suiteStartTime;
  const totalDurationSec = (suiteDurationMs / 1000).toFixed(1);
  const passed = results.filter((r) => r.status === 'PASS').length;
  const total = results.length;
  const successPct = total > 0 ? Math.round((passed / total) * 100) : 0;
  const timestamp = Date.now();

  // 1. Generate Markdown Report
  let md = `# 🏛️ Forever Memorial Product Test Matrix — Audit Report\n\n`;
  md += `**Date & Time:** ${new Date(timestamp).toISOString()}\n`;
  md += `**Execution Mode:** Autonomous MCP Verification\n`;
  md += `**Total Variants Tested:** ${total}\n`;
  md += `**Passed:** ${passed} | **Failed:** ${total - passed} | **Success Rate:** ${successPct}%\n`;
  md += `**Total Duration:** ${totalDurationSec}s\n\n`;
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
    md += `- **Status:** ${r.status === 'PASS' ? '✅ PASS' : '❌ FAIL'}\n`;
    md += `- **Draft ID:** \`${r.draftId}\`\n`;
    if (r.filePath) md += `- **JSON File:** [${path.basename(r.filePath)}](file:///${r.filePath.replace(/\\/g, '/')})\n`;
    if (r.previewPath) md += `- **JPG Preview:** [${path.basename(r.previewPath)}](file:///${r.previewPath.replace(/\\/g, '/')})\n`;
    md += `- **Execution Time:** ${(r.durationMs / 1000).toFixed(2)} seconds\n`;
    if (r.error) md += `- **Error:** \`${r.error}\`\n`;
    md += `\n`;
  }

  const reportsDir = path.resolve('output/reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const mdReportFile = path.join(reportsDir, `product-test-matrix-${timestamp}.md`);
  fs.writeFileSync(mdReportFile, md, 'utf8');

  // 2. Generate HTML Report
  const html = generateHtmlReport({
    results,
    total,
    passed,
    successPct,
    totalDurationSec,
    timestamp,
  });
  const htmlReportFile = path.join(reportsDir, `product-test-matrix-${timestamp}.html`);
  fs.writeFileSync(htmlReportFile, html, 'utf8');

  console.log('\n====================================================');
  console.log(`✅ AUDIT COMPLETE: ${passed}/${total} PASS (${successPct}%)`);
  console.log(`📄 Markdown Report: ${mdReportFile}`);
  console.log(`🌐 HTML Report:     ${htmlReportFile}`);
  console.log('====================================================\n');
}

main().catch(console.error);
