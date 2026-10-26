import { expect, test } from '@playwright/test';

test.use({ viewport: { width: 1440, height: 1000 } });

test('market presets update headstone and base dimensions without resizing on currency changes', async ({
  page,
}) => {
  test.setTimeout(90_000);
  await page.addInitScript(() => {
    sessionStorage.setItem('display_currency', 'AUD');
    localStorage.setItem('fs_ui_theme', 'day');
  });
  await page.goto('/traditional-engraved-headstone/select-size');
  const panel = page.getByTestId('designer-size-panel');
  await expect(panel).toBeVisible();
  const headstones = panel.getByRole('group', {
    name: 'Standard headstone sizes',
    exact: true,
  });
  const bases = panel.getByRole('group', {
    name: 'Standard base sizes',
    exact: true,
  });
  const width = panel.getByRole('spinbutton', { name: 'Width', exact: true });
  const height = panel.getByRole('spinbutton', { name: 'Height', exact: true });

  for (const market of [
    {
      currency: 'AUD',
      name: 'Australia',
      head: '650 × 700 mm',
      base: '950 × 100 mm',
      width: '650',
      height: '700',
      baseWidth: '950',
      baseHeight: '100',
    },
    {
      currency: 'GBP',
      name: 'UK',
      head: '432 × 610 mm',
      base: '600 × 100 mm',
      width: '432',
      height: '610',
      baseWidth: '600',
      baseHeight: '100',
    },
    {
      currency: 'EUR',
      name: 'Europe',
      head: '500 × 800 mm',
      base: '600 × 150 mm',
      width: '500',
      height: '800',
      baseWidth: '600',
      baseHeight: '150',
    },
    {
      currency: 'CAD',
      name: 'Canada',
      head: '762 × 610 mm',
      base: '813 × 152 mm',
      width: '762',
      height: '610',
      baseWidth: '813',
      baseHeight: '152',
    },
    {
      currency: 'USD',
      name: 'US',
      head: '18" × 24"',
      base: '30" × 6"',
      width: '18',
      height: '24',
      baseWidth: '30',
      baseHeight: '6',
    },
  ]) {
    await panel.getByRole('button', { name: 'Headstone', exact: true }).click();
    await page
      .getByRole('combobox', { name: 'Display currency', exact: true })
      .selectOption(market.currency);
    await expect(headstones).toContainText(`Standard sizes · ${market.name}`);
    await headstones
      .getByRole('button', { name: market.head, exact: true })
      .click();
    await expect(width).toHaveValue(market.width);
    await expect(height).toHaveValue(market.height);
    await expect(
      headstones.getByRole('button', { name: market.head, exact: true }),
    ).toHaveAttribute('aria-pressed', 'true');

    await panel.getByRole('button', { name: 'Base', exact: true }).click();
    await expect(width).toHaveValue(
      market.currency === 'CAD' ? '914' : market.baseWidth,
    );
    await expect(height).toHaveValue(market.baseHeight);
    await bases.getByRole('button', { name: market.base, exact: true }).click();
    await expect(width).toHaveValue(market.baseWidth);
    await expect(height).toHaveValue(market.baseHeight);
  }

  await panel.getByRole('button', { name: 'Headstone', exact: true }).click();
  await page
    .getByRole('combobox', { name: 'Display currency', exact: true })
    .selectOption('AUD');
  // 18 × 24 inches remains 457 × 610 mm when only the currency changes.
  await expect(width).toHaveValue('457');
  await expect(height).toHaveValue('610');
  await width.fill('601');
  await width.blur();
  await expect(headstones.getByRole('button', { pressed: true })).toHaveCount(
    0,
  );

  await headstones
    .getByRole('button', { name: '950 × 500 mm', exact: true })
    .click();
  await panel.getByRole('button', { name: 'Base', exact: true }).click();
  await page
    .getByRole('combobox', { name: 'Display currency', exact: true })
    .selectOption('GBP');
  await expect(
    bases.getByRole('button', { name: '600 × 100 mm', exact: true }),
  ).toBeDisabled();

  await page
    .getByRole('combobox', { name: 'Display currency', exact: true })
    .selectOption('EUR');
  for (const size of [
    { head: '1000 × 800 mm', width: '1200', height: '190', depth: '360' },
    { head: '800 × 900 mm', width: '1000', height: '150', depth: '300' },
    { head: '500 × 800 mm', width: '600', height: '150', depth: '250' },
  ]) {
    await panel.getByRole('button', { name: 'Headstone', exact: true }).click();
    await headstones
      .getByRole('button', { name: size.head, exact: true })
      .click();
    await panel.getByRole('button', { name: 'Base', exact: true }).click();
    await expect(width).toHaveValue(size.width);
    await expect(height).toHaveValue(size.height);
    await expect(
      panel.getByRole('spinbutton', { name: 'Thickness', exact: true }),
    ).toHaveValue(size.depth);
  }
});
