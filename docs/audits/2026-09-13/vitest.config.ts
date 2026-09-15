import { defineConfig } from 'vitest/config';
import path from 'node:path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['docs/audits/2026-09-13/*.test.ts'],
  },
  resolve: { alias: { '#': path.resolve(process.cwd()) } },
});
