import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

function start(origin: string, pageUrl: string) {
  return spawnSync(process.execPath, ['scripts/designer-mcp.mjs'], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      DESIGNER_MCP_LIVE_ORIGIN: origin,
      DESIGNER_MCP_PAGE_URL: pageUrl,
    },
    encoding: 'utf8',
    timeout: 5000,
  });
}

describe('live MCP origin configuration', () => {
  it('rejects non-HTTPS and non-origin values before connecting to a browser', () => {
    for (const origin of [
      'http://example.com',
      'https://example.com/path',
      'https://example.com/',
    ]) {
      const result = start(origin, 'https://example.com/designer');
      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain('exact HTTPS origin');
    }
  });
  it('rejects a page on a different origin or no exact page URL', () => {
    expect(
      start('https://example.com', 'https://other.example/designer').stderr,
    ).toContain('configured live origin');
    expect(start('https://example.com', '').stderr).toContain(
      'exact HTTPS origin',
    );
  });
});
