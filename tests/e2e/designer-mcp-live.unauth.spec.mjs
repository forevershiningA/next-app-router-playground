import { test, expect, chromium } from '@playwright/test';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';

test('live adapter pins the HTTPS tab and rechecks admin access', async () => {
  const server = net.createServer();
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const port = server.address().port;
  await new Promise((resolve) => server.close(resolve));
  const profile = await mkdtemp(path.join(os.tmpdir(), 'designer-mcp-live-'));
  const context = await chromium.launchPersistentContext(profile, {
    headless: true,
    args: [`--remote-debugging-port=${port}`],
  });
  let client;
  let authorized = true;
  try {
    const page = context.pages()[0] ?? (await context.newPage());
    await page.route('https://mcp-test.example/**', async (route) => {
      if (
        new URL(route.request().url()).pathname === '/api/admin/designer-mcp'
      ) {
        await route.fulfill({
          status: authorized ? 200 : 403,
          json: { enabled: authorized },
        });
      } else {
        await route.fulfill({
          contentType: 'text/html',
          body: '<script>window.__designerAgentBridge={read:()=>({snapshot:{productId:"test"}})}</script>',
        });
      }
    });
    await page.goto('https://mcp-test.example/one');
    client = new Client({ name: 'live-test', version: '1.0.0' });
    await client.connect(
      new StdioClientTransport({
        command: process.execPath,
        args: ['scripts/designer-mcp.mjs'],
        env: {
          ...process.env,
          DESIGNER_MCP_CDP_URL: `http://127.0.0.1:${port}`,
          DESIGNER_MCP_LIVE_ORIGIN: 'https://mcp-test.example',
          DESIGNER_MCP_PAGE_URL: 'https://mcp-test.example/one',
        },
        stderr: 'inherit',
      }),
    );
    expect(
      (await client.callTool({ name: 'get_design', arguments: {} }))
        .structuredContent.snapshot.productId,
    ).toBe('test');
    await page.goto('https://mcp-test.example/two');
    expect(
      (await client.callTool({ name: 'get_design', arguments: {} })).isError,
    ).not.toBe(true);
    authorized = false;
    const rejected = await client.callTool({
      name: 'get_design',
      arguments: {},
    });
    expect(rejected.isError).toBe(true);
    expect(JSON.parse(rejected.content[0].text).code).toBe(
      'SESSION_UNAVAILABLE',
    );
    authorized = true;
    await page.route('https://other.example/**', (route) =>
      route.fulfill({ contentType: 'text/html', body: '<p>Other origin</p>' }),
    );
    await page.goto('https://other.example/');
    const outsideOrigin = await client.callTool({
      name: 'get_design',
      arguments: {},
    });
    expect(outsideOrigin.isError).toBe(true);
    expect(JSON.parse(outsideOrigin.content[0].text).code).toBe(
      'SESSION_UNAVAILABLE',
    );
  } finally {
    await client?.close();
    await context.close();
    if (
      path.dirname(path.resolve(profile)) === path.resolve(os.tmpdir()) &&
      path.basename(profile).startsWith('designer-mcp-live-')
    )
      await rm(profile, {
        recursive: true,
        force: true,
        maxRetries: 10,
        retryDelay: 500,
      });
  }
});
