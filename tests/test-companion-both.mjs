import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import path from 'node:path';

async function main() {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [path.resolve('scripts/designer-mcp.mjs')],
    env: {
      ...process.env,
      DESIGNER_MCP_CDP_URL: 'http://127.0.0.1:9222',
    },
  });

  const client = new Client({ name: 'test-agent', version: '1.0.0' }, { capabilities: {} });
  await client.connect(transport);

  // Set wide dimensions if needed (e.g. 900x700 or 900x900)
  const composeRes = await client.callTool({
    name: 'compose_memorial_layout',
    arguments: {
      preset: 'companion_both',
      headerText: 'Ś. P.',
      headerFont: 'Garamond',
      textColor: '#D4AF37',
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
      centerMotif: {
        categoryId: 'Religious',
        svgPath: '/shapes/motifs/cross_001.svg',
        color: '#D4AF37',
        heightMm: 75,
      },
      bottomText: 'Spoczywajcie w pokoju',
      bottomFont: 'Great Vibes',
      clearExisting: true,
      expectedRevision: 'latest',
    },
  });

  const composeData = JSON.parse(composeRes.content[0].text);
  console.log('compose_memorial_layout result revision:', composeData.revision);
  console.log('Inscriptions count:', composeData.snapshot?.inscriptions?.length);
  console.log('Motifs count:', composeData.snapshot?.selectedMotifs?.length);
  console.log('Applied:', JSON.stringify(composeData.applied, null, 2));

  // Preview
  const previewRes = await client.callTool({
    name: 'get_preview',
    arguments: { expectedRevision: 'latest' },
  });
  const textItem = previewRes.content.find((c) => c.type === 'text');
  const previewData = JSON.parse(textItem.text);
  console.log('previewId:', previewData.previewId);
  console.log('motifLayout warnings:', previewData.motifLayout?.warnings);
  console.log('inscriptionLayout warnings:', previewData.inscriptionLayout?.warnings);

  // Save
  const saveRes = await client.callTool({
    name: 'save_local_design',
    arguments: {
      title: 'Stanisław i Stanisława Kowalscy — Podwójny Nagrobek',
      expectedRevision: previewData.revision,
      previewId: previewData.previewId,
      visuallyReviewed: true,
    },
  });
  console.log('Save result:', JSON.parse(saveRes.content[0].text));

  await client.close();
}

main().catch(console.error);
