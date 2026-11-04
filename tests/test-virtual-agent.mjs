import { parseVirtualDesignerCommand, executeVirtualDesignerIntent } from '../lib/virtual-designer-assistant.ts';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import path from 'node:path';
import assert from 'node:assert';
import fs from 'node:fs';

console.log('====================================================');
console.log('🤖 TEST: Forever Deterministic Virtual Agent (Zero-Token)');
console.log('====================================================\n');

// ------------------------------------------------------------------
// Part 1: Test Natural Language Parsing (100% offline, 0ms)
// ------------------------------------------------------------------
console.log('▶ Part 1: Testing Natural Language Parsing & Slot Extraction...');

const testCases = [
  {
    input: 'Zaprojektuj tablicę pamiątkową z brązu dla prof. Jerzego Nowickiego 1938 - 2019',
    expectedIntent: 'create_bronze_plaque',
    expectedProductId: '5',
    check: (p) => {
      assert(p.names?.singleName?.includes('NOWICKI'), 'Expected person name to contain NOWICKI');
      assert.strictEqual(p.dates, '1938 - 2019');
    },
  },
  {
    input: 'Nagrobek podwójny dla Stanisława i Marii Kowalskich z wazonami',
    expectedIntent: 'create_companion_headstone',
    expectedProductId: '124',
    check: (p) => {
      assert(p.hasVases, 'Expected hasVases=true');
      assert(p.names?.leftPersonName?.includes('STANISŁAW'), 'Expected left person Stanisław');
      assert(p.names?.rightPersonName?.includes('MARIA'), 'Expected right person Maria');
    },
  },
  {
    input: 'Zaprojektuj grobowiec rodzinny dla rodziny Wiśniewskich z African Black',
    expectedIntent: 'create_full_monument',
    expectedProductId: '101',
    check: (p) => {
      assert(p.names?.sharedSurname?.includes('WIŚNIEW'), 'Expected surname Wiśniewscy');
      assert.strictEqual(p.materialName, 'African Black');
    },
  },
  {
    input: 'Pojedynczy nagrobek laserowy dla Heleny Zielińskiej 1948 - 2020',
    expectedIntent: 'create_laser_etched',
    expectedProductId: '4',
    check: (p) => {
      assert(p.names?.singleName?.includes('ZIELIŃSK'), 'Expected person Zielińska');
      assert.strictEqual(p.dates, '1948 - 2020');
    },
  },
];

let parsedCount = 0;
for (const tc of testCases) {
  const parsed = parseVirtualDesignerCommand(tc.input);
  assert.strictEqual(parsed.intent, tc.expectedIntent, `Intent mismatch for: "${tc.input}"`);
  assert.strictEqual(parsed.productId, tc.expectedProductId, `Product mismatch for: "${tc.input}"`);
  tc.check(parsed);
  parsedCount++;
  console.log(`  ✓ Parsed: "${tc.input.slice(0, 45)}..." -> [Intent: ${parsed.intent}, Product: ${parsed.productId}]`);
}
console.log(`  ✅ Passed all ${parsedCount} parsing test cases.\n`);

// ------------------------------------------------------------------
// Part 2: Test API Route (Dry-run mode via HTTP)
// ------------------------------------------------------------------
console.log('▶ Part 2: Testing Next.js API Route (/api/virtual-assistant)...');

async function testApiRoute() {
  const url = 'http://127.0.0.1:3104/api/virtual-assistant?command=' + encodeURIComponent('Tablica z brązu dla Jana Kowalskiego 1950 - 2021');
  const res = await fetch(url);
  assert.strictEqual(res.status, 200, 'Expected status 200 from GET /api/virtual-assistant');
  const data = await res.json();
  assert.strictEqual(data.parsed?.intent, 'create_bronze_plaque', 'Expected bronze plaque intent');
  console.log('  ✓ GET dry-run endpoint returned successfully:', data.parsed.title);

  const postRes = await fetch('http://127.0.0.1:3104/api/virtual-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      command: 'Nagrobek laserowy dla Anny Nowak 1960 - 2022',
      dryRun: true,
    }),
  });
  assert.strictEqual(postRes.status, 200, 'Expected status 200 from POST /api/virtual-assistant');
  const postData = await postRes.json();
  assert.strictEqual(postData.parsed?.intent, 'create_laser_etched', 'Expected laser etched intent');
  console.log('  ✓ POST dry-run endpoint returned successfully:', postData.parsed.title);
  console.log('  ✅ API dry-run tests passed.\n');
}

// ------------------------------------------------------------------
// Part 3: Test End-to-End Autonomous Execution (Bronze Plaque)
// ------------------------------------------------------------------
console.log('▶ Part 3: Executing End-to-End Virtual Agent Command in 3D...');

async function testEndToEnd() {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [path.resolve('scripts/designer-mcp.mjs')],
    env: { ...process.env, DESIGNER_MCP_CDP_URL: 'http://127.0.0.1:9222' },
  });
  const client = new Client({ name: 'test-virtual-agent', version: '1.0.0' }, { capabilities: {} });
  await client.connect(transport);

  const command = 'Zaprojektuj tablicę pamiątkową z brązu dla prof. Jerzego Nowickiego 1938 — 2019';
  console.log(`  Executing command: "${command}"`);

  const parsed = parseVirtualDesignerCommand(command);
  const result = await executeVirtualDesignerIntent(parsed, client);

  console.log('\n  Execution Result:');
  console.log(`  - Status: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
  console.log(`  - Title: ${result.title}`);
  console.log(`  - Draft ID: ${result.draftId}`);
  console.log(`  - Warnings: ${result.warnings.length}`);
  console.log(`  - Time: ${(result.executionTimeMs / 1000).toFixed(1)}s`);
  console.log(`  - Message: ${result.message}`);

  assert(result.success, 'Expected execution to succeed');
  assert(result.draftId, 'Expected valid draft ID');
  assert.strictEqual(result.warnings.length, 0, 'Expected 0 layout warnings');
  assert(fs.existsSync(result.previewPath), 'Expected JPG preview file to exist');

  await client.close();
  console.log('\n  ✅ End-to-End Autonomous Virtual Agent execution PASSED (100% offline, 0 external tokens).');
}

async function run() {
  await testApiRoute();
  await testEndToEnd();
  console.log('\n====================================================');
  console.log('🎉 ALL VIRTUAL AGENT TESTS COMPLETED SUCCESSFULLY!');
  console.log('====================================================');
}

run().catch((err) => {
  console.error('\n❌ Test failed:', err);
  process.exit(1);
});
