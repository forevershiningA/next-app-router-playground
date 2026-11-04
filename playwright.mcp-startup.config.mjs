import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: 'designer-mcp-startup.unauth.spec.mjs',
  workers: 1,
});
