/**
 * Auth setup — runs once before all authenticated tests.
 * Logs in via the API and saves the session cookie to playwright/.auth/user.json.
 * Subsequent tests load that file instead of re-logging in every time.
 *
 * Required env vars (put in .env.test.local):
 *   TEST_USER_EMAIL=your-test-account@example.com
 *   TEST_USER_PASSWORD=your-test-password
 */
import { test as setup, expect } from '@playwright/test';
import path from 'path';

const AUTH_FILE = path.resolve('playwright/.auth/user.json');

setup('authenticate', async ({ request }) => {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'TEST_USER_EMAIL and TEST_USER_PASSWORD must be set.\n' +
        'Create .env.test.local with these values (gitignored).',
    );
  }

  const login = await request.post('/api/auth/login', {
    data: { email, password },
  });

  if (!login.ok()) {
    throw new Error(`API login failed: ${login.status()} ${await login.text()}`);
  }

  const session = await request.get('/api/auth/session');
  await expect(session).toBeOK();

  await request.storageState({ path: AUTH_FILE });
});
