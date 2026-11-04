import { test, expect, chromium } from '@playwright/test';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { mkdtemp, rm } from 'node:fs/promises';
import http from 'node:http';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';

test('MCP lists tools before Chrome starts and recovers without restarting', async () => {
  test.setTimeout(60000);
  const reserve = net.createServer();
  await new Promise((resolve) => reserve.listen(0, '127.0.0.1', resolve));
  const port = reserve.address().port;
  await new Promise((resolve) => reserve.close(resolve));
  const profile = await mkdtemp(path.join(os.tmpdir(), 'designer-mcp-startup-'));
  const site = http.createServer((_, res) => {
    res.writeHead(200, { 'content-type': 'text/html' });
    res.end('<script>window.__designerAgentBridge={read:()=>({snapshot:{productId:"124"}})}</script>');
  });
  await new Promise((resolve) => site.listen(0, '127.0.0.1', resolve));
  const client = new Client({ name: 'mcp-startup-test', version: '1' });
  let context;
  try {
    await client.connect(new StdioClientTransport({
      command: process.execPath,
      args: ['scripts/designer-mcp.mjs'],
      env: { ...process.env, DESIGNER_MCP_CDP_URL: `http://127.0.0.1:${port}` },
      stderr: 'pipe',
    }));
    const { tools } = await client.listTools();
    expect(tools.some((tool) => tool.name === 'get_design')).toBe(true);
    const before = await client.callTool({ name: 'get_design', arguments: {} });
    expect(before.isError).toBe(true);
    expect(JSON.parse(before.content[0].text).code).toBe('SESSION_UNAVAILABLE');

    context = await chromium.launchPersistentContext(profile, {
      headless: true,
      args: [`--remote-debugging-port=${port}`],
    });
    const page = context.pages()[0] ?? await context.newPage();
    await page.goto(`http://127.0.0.1:${site.address().port}/`);
    const after = await client.callTool({ name: 'get_design', arguments: {} }, undefined, { timeout: 30000 });
    expect(after.isError).not.toBe(true);
    expect(after.structuredContent.snapshot.productId).toBe('124');
  } finally {
    await client.close();
    if (context) await context.close();
    await new Promise((resolve) => site.close(resolve));
    const resolved = path.resolve(profile);
    if (path.dirname(resolved) !== path.resolve(os.tmpdir()) || !path.basename(resolved).startsWith('designer-mcp-startup-')) throw new Error('Unexpected temporary directory');
    await rm(resolved, { recursive:true, force:true });
  }
});
