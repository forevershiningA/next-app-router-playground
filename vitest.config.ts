import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/unit/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['lib/**/*.ts'],
      exclude: [
        'lib/db/**',
        'lib/auth/**',
        'lib/email/**',
        'lib/headstone-store.ts',
        'lib/scene-overlay-store.ts',
        'lib/counter-store.ts',
      ],
    },
  },
  resolve: {
    alias: {
      '#': path.resolve(__dirname, '.'),
    },
  },
});
