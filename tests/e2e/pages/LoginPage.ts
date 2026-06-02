import { type Page, expect } from '@playwright/test';

/**
 * Page Object Model for the /login page.
 * Login labels don't have htmlFor — use placeholder/role locators.
 */
export class LoginPage {
  constructor(private readonly page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.page.getByPlaceholder('you@example.com').fill(email);
    await this.page.getByPlaceholder('••••••••').fill(password);
    await this.page.getByRole('button', { name: 'Sign in' }).click();
  }

  async expectError(text: string) {
    await expect(this.page.getByText(text)).toBeVisible();
  }

  async expectRedirectTo(urlPattern: string | RegExp) {
    await this.page.waitForURL(urlPattern, { timeout: 15_000 });
  }
}
