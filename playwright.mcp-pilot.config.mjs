import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'designer-mcp.unauth.spec.mjs',
  timeout: 120000,
  workers: 1,
  use: { baseURL: 'http://127.0.0.1:3104' },
  webServer: {
    command: 'pnpm exec next dev --hostname 127.0.0.1 --port 3104',
    url: 'http://127.0.0.1:3104',
    reuseExistingServer: false,
    timeout: 120000,
    env: { DESIGN_PREVIEW_CAPTURE: '1' },
  },
});
