import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 1000 } });

test('shape panel recovers from repeated clicks and switches to other sections', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/traditional-engraved-headstone/select-size');
  await expect(page.getByTestId('designer-size-panel')).toBeVisible();

  const shape = page.getByRole('button', { name: 'Shape', exact: true });
  const categories = page.getByRole('button', {
    name: 'Traditional',
    exact: true,
  });

  await shape.click();
  await expect(categories).toBeVisible();
  // Opening an already active panel must still dismiss its transient loader.
  await shape.click();
  await expect(categories).toBeVisible();
  await expect(
    page.getByRole('status').filter({ hasText: 'Loading shapes' }),
  ).toHaveCount(0);

  await page
    .getByRole('button', { name: 'Material', exact: true })
    .click();
  await expect(page).toHaveURL(/\/select-material$/);
  await expect(
    page.getByRole('heading', { name: 'Select Material', exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/Showing \d+ options?/)).toBeVisible();

  await shape.click();
  await expect(categories).toBeVisible();
  await shape.click();
  await expect(categories).toBeVisible();

  await page.getByRole('button', { name: 'Size', exact: true }).click();
  await expect(page).toHaveURL(/\/select-size$/);
  await expect(page.getByTestId('designer-size-panel')).toBeVisible();
  expect(errors).toEqual([]);
});
