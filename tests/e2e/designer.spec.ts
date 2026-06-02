/**
 * E2E tests: authenticated design creation + save flow.
 * These tests use the storageState from auth.setup.ts (logged-in user).
 *
 * Run with:   pnpm test:e2e
 * Debug with: pnpm test:e2e:debug
 */
import { test, expect } from '@playwright/test';
import { DesignerPage } from './pages/DesignerPage';

test.describe('Save Design flow', () => {
  test('save design modal opens and submits successfully', async ({ page }) => {
    const designer = new DesignerPage(page);
    // /check-price is in the Design group → accordion auto-opens → Save Design button visible
    await designer.goto('/check-price');
    await designer.waitForReady();

    // Intercept the save API call to verify the request and mock a fast response
    await page.route('**/api/projects', async (route) => {
      if (route.request().method() === 'POST') {
        const body = await route.request().postDataJSON();
        // Verify required fields are sent
        expect(body).toHaveProperty('title');
        expect(body).toHaveProperty('designState');
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            project: {
              id: 'test-project-id',
              title: body.title,
              status: 'draft',
              totalPriceCents: null,
              currency: 'AUD',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          }),
        });
      } else {
        await route.continue();
      }
    });

    await designer.openSaveModal();
    await designer.saveDesign('E2E Test Design');

    // After save, the app should redirect to my-account
    await page.waitForURL('**/my-account', { timeout: 15_000 });
    await expect(page).toHaveURL(/my-account/);
  });

  test('save modal validates empty design name', async ({ page }) => {
    const designer = new DesignerPage(page);
    await designer.goto('/check-price');
    await designer.waitForReady();

    await designer.openSaveModal();

    // The submit button is disabled when the input is empty — trigger via Enter key
    await page.getByLabel('Design Name').press('Enter');

    // Validation error should appear
    await expect(page.getByText('Please enter a design name')).toBeVisible();

    // Modal stays open
    await expect(page.getByRole('heading', { name: 'Save Design' })).toBeVisible();
  });

  test('save modal can be closed with X button', async ({ page }) => {
    const designer = new DesignerPage(page);
    await designer.goto('/check-price');
    await designer.waitForReady();

    await designer.openSaveModal();
    await page.getByRole('button', { name: 'Close', exact: true }).click();

    await expect(page.getByRole('heading', { name: 'Save Design' })).toBeHidden();
  });
});

test.describe('Designer navigation', () => {
  test('can navigate through designer steps', async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto('/select-shape');
    await expect(page).toHaveURL(/select-shape/);

    // Navigate to material step
    await page.goto('/select-material');
    await expect(page).toHaveURL(/select-material/);
  });
});
