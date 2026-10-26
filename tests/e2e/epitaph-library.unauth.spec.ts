import { expect, test, type Page } from '@playwright/test';
import type { HeadstoneState } from '#/lib/headstone-store.types';

async function inscriptions(page: Page) {
  return page.evaluate(() => {
    const state = (
      window as unknown as {
        __headstoneStore: { getState: () => HeadstoneState };
      }
    ).__headstoneStore.getState();
    return state.inscriptions.map(({ id, text, font }) => ({ id, text, font }));
  });
}

test('epitaphs fill an editable draft and preserve an existing inscription', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.addInitScript(() => localStorage.setItem('fs_ui_theme', 'day'));
  await page.goto('/traditional-engraved-headstone/inscriptions');
  const panel = page.getByTestId('designer-inscriptions-panel');
  const field = panel.getByRole('textbox', { name: 'Inscription text' });
  const browse = panel.getByRole('button', {
    name: 'Browse epitaphs',
    exact: true,
  });
  await expect(field).toBeVisible();
  await panel
    .getByRole('combobox', { name: 'Inscription font' })
    .selectOption('Arial');
  await expect(browse).toHaveAttribute('aria-expanded', 'false');
  await expect(
    panel.getByRole('group', { name: 'Epitaph categories' }),
  ).toHaveCount(0);

  await browse.click();
  const categories = panel.getByRole('group', { name: 'Epitaph categories' });
  await expect(categories.getByRole('button')).toHaveCount(5);
  let list = panel.getByRole('list', { name: 'Short & Simple epitaphs' });
  await expect(list.getByRole('listitem')).toHaveCount(6);
  await list
    .getByRole('button', { name: 'Use text', exact: true })
    .first()
    .click();
  await expect(field).toHaveValue('Your love stays close, every day.');
  await page.screenshot({ path: 'output/inscriptions-layout-day.png' });
  expect(await inscriptions(page)).toEqual([]);

  const edited = 'Your love stays close, every day.\nA personal dedication';
  await field.fill(edited);
  await panel
    .getByRole('button', { name: 'Add Inscription', exact: true })
    .click();
  await expect(
    panel.getByRole('button', { name: 'New Inscription', exact: true }),
  ).toBeVisible();
  const original = await inscriptions(page);
  expect(original).toHaveLength(1);
  expect(original[0].text).toBe(edited);
  expect(original[0].font).toBe('Arial');

  await browse.click();
  await categories.getByRole('button', { name: 'Family', exact: true }).click();
  list = panel.getByRole('list', { name: 'Family epitaphs' });
  const firstChoice = list.getByRole('listitem').first();
  await firstChoice
    .getByRole('button', { name: 'Use text', exact: true })
    .click();
  await expect(field).toHaveValue(edited);
  await firstChoice
    .getByRole('button', { name: 'Cancel', exact: true })
    .click();
  await expect(field).toHaveValue(edited);
  await firstChoice
    .getByRole('button', { name: 'Use text', exact: true })
    .click();
  await firstChoice
    .getByRole('button', { name: 'Append', exact: true })
    .click();
  await expect(field).toHaveValue(
    `${edited}\n\nYou made a home wherever we were together.`,
  );
  expect(await inscriptions(page)).toEqual(original);
  await expect(
    panel.getByRole('button', { name: 'Add Inscription', exact: true }),
  ).toBeEnabled();

  await browse.click();
  await categories.getByRole('button', { name: 'Nature', exact: true }).click();
  const nature = panel
    .getByRole('list', { name: 'Nature epitaphs' })
    .getByRole('listitem')
    .first();
  await nature.getByRole('button', { name: 'Use text', exact: true }).click();
  await nature.getByRole('button', { name: 'Replace', exact: true }).click();
  await expect(field).toHaveValue(
    'We find your memory in the gardens you loved.',
  );
  expect(await inscriptions(page)).toEqual(original);
  await panel
    .getByRole('button', { name: 'Add Inscription', exact: true })
    .click();
  expect(await inscriptions(page)).toHaveLength(2);
});

test('epitaph library works in the mobile night theme', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => localStorage.setItem('fs_ui_theme', 'dark'));
  await page.goto('/traditional-engraved-headstone/inscriptions');
  const panel = page.getByTestId('designer-inscriptions-panel');
  const browse = panel.getByRole('button', {
    name: 'Browse epitaphs',
    exact: true,
  });
  await browse.click();
  await panel
    .getByRole('group', { name: 'Epitaph categories' })
    .getByRole('button', { name: 'Religious', exact: true })
    .click();
  const list = panel.getByRole('list', { name: 'Religious epitaphs' });
  await expect(list.getByRole('listitem')).toHaveCount(6);
  await list
    .getByRole('button', { name: 'Use text', exact: true })
    .first()
    .click();
  await expect(
    panel.getByRole('textbox', { name: 'Inscription text' }),
  ).toHaveValue('May God hold you in peace, as we hold you in love.');
  await expect(browse).toHaveAttribute('aria-expanded', 'false');
  expect(await inscriptions(page)).toEqual([]);
});
