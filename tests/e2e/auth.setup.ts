/**
 * Auth setup — runs once before all authenticated tests.
 * Logs in via the UI and saves the session cookie to playwright/.auth/user.json.
 * Subsequent tests load that file instead of re-logging in every time.
 *
 * Required env vars (put in .env.test.local):
 *   TEST_USER_EMAIL=your-test-account@example.com
 *   TEST_USER_PASSWORD=your-test-password
 */
import { test as setup, expect } from '@playwright/test';
import path from 'path';

const AUTH_FILE = path.resolve('playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  const email = process.env.TEST_USER_EMAIL;
  const password = process.env.TEST_USER_PASSWORD;

  if (!email || !password) {
    throw new Error(
      'TEST_USER_EMAIL and TEST_USER_PASSWORD must be set.\n' +
        'Create .env.test.local with these values (gitignored).',
    );
  }

  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();

  await page.getByPlaceholder('you@example.com').fill(email);
  await page.getByPlaceholder('••••••••').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();

  // After successful login, the app redirects to /my-account
  await page.waitForURL('**/my-account', { timeout: 30_000 });
  await expect(page).toHaveURL(/my-account/);

  // Save session cookie so authenticated tests can reuse it
  await page.context().storageState({ path: AUTH_FILE });
});
