import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'designer-mcp-live.unauth.spec.mjs',
  timeout: 60000,
  workers: 1,
});
