import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Load test-only env overrides (gitignored)
try {
  dotenv.config({ path: path.resolve(__dirname, '.env.test.local') });
} catch {
  // dotenv is optional — env vars can be set directly in CI
}

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:3000';
const AUTH_FILE = 'playwright/.auth/user.json';

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? '50%' : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 60_000,

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
  },

  projects: [
    // 1. Auth setup — runs first, saves storageState
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },

    // 2. Authenticated tests — depend on auth setup
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: AUTH_FILE,
      },
      testIgnore: ['**/*.unauth.spec.ts'],
      dependencies: ['setup'],
    },

    // 3. Unauthenticated tests (API boundary checks, no auth needed)
    {
      name: 'api-unauth',
      testMatch: /\.unauth\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  webServer: {
    command: 'pnpm dev',
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NODE_ENV: 'test',
    },
  },
});
