import { expect, test, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

type Theme = 'dark' | 'day';

async function openSizePanel(page: Page, theme: Theme) {
  await page.addInitScript((selectedTheme) => {
    window.localStorage.setItem('fs_ui_theme', selectedTheme);
  }, theme);
  await page.goto('/select-size');

  const panel = page.getByTestId('designer-size-panel');
  await expect(panel).toBeVisible({ timeout: 20_000 });
  await expect(
    page.getByRole('button', { name: 'Width', exact: true }),
  ).toHaveAttribute('aria-pressed', 'true');
  return panel;
}

async function setTheme(page: Page, theme: Theme) {
  await page.addInitScript((selectedTheme) => {
    window.localStorage.setItem('fs_ui_theme', selectedTheme);
  }, theme);
}

async function openPanel(
  page: Page,
  path: string,
  testId: string,
  theme: Theme,
) {
  await setTheme(page, theme);
  await page.goto(path);
  const panel = page.getByTestId(testId);
  await expect(panel).toBeVisible({ timeout: 20_000 });
  return panel;
}

async function openGuestCheckout(page: Page, theme: Theme) {
  await page.route('**/api/auth/session', (route) =>
    route.fulfill({ status: 401, json: { user: null } }),
  );
  await openPanel(page, '/check-price', 'designer-check-price-page', theme);
  const checkout = page.getByTestId('guest-checkout-modal');
  await expect(async () => {
    await page.evaluate(() =>
      window.dispatchEvent(new Event('proceedToPurchase')),
    );
    await expect(checkout).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 10_000 });
  return checkout;
}

async function expectNoSeriousAccessibilityViolations(
  page: Page,
  include: string,
) {
  const results = await new AxeBuilder({ page })
    .include(include)
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();
  const seriousViolations = results.violations.filter(({ impact }) =>
    ['serious', 'critical'].includes(impact ?? ''),
  );

  expect(seriousViolations).toEqual([]);
}

async function contrastRatio(locator: Locator) {
  return locator.evaluate((element) => {
    const parse = (value: string) =>
      value
        .match(/[\d.]+/g)!
        .slice(0, 3)
        .map(Number)
        .map((channel) => {
          const normalized = channel / 255;
          return normalized <= 0.03928
            ? normalized / 12.92
            : ((normalized + 0.055) / 1.055) ** 2.4;
        });
    const luminance = ([red, green, blue]: number[]) =>
      0.2126 * red + 0.7152 * green + 0.0722 * blue;

    const styles = getComputedStyle(element);
    const foreground = luminance(parse(styles.color));
    let backgroundElement: Element | null = element;
    let background = [0, 0, 0];
    while (backgroundElement) {
      const backgroundColor =
        getComputedStyle(backgroundElement).backgroundColor;
      const values = backgroundColor.match(/[\d.]+/g)?.map(Number) ?? [];
      if ((values[3] ?? 1) > 0) {
        background = parse(backgroundColor);
        break;
      }
      backgroundElement = backgroundElement.parentElement;
    }
    const backgroundLuminance = luminance(background);
    return (
      (Math.max(foreground, backgroundLuminance) + 0.05) /
      (Math.min(foreground, backgroundLuminance) + 0.05)
    );
  });
}

for (const theme of ['day', 'dark'] as const) {
  test(
    `active size tab remains legible in ${theme} mode`,
    { tag: '@smoke' },
    async ({ page }) => {
      await openSizePanel(page, theme);
      const activeTab = page.getByRole('button', {
        name: 'Width',
        exact: true,
      });

      expect(await contrastRatio(activeTab)).toBeGreaterThanOrEqual(4.5);
    },
  );

  test(
    `size panel visual baseline in ${theme} mode`,
    { tag: '@visual' },
    async ({ page }) => {
      const panel = await openSizePanel(page, theme);

      await expect(panel).toHaveScreenshot(`select-size-${theme}.png`, {
        animations: 'disabled',
        maxDiffPixelRatio: 0.01,
      });
    },
  );

  test(
    `guest checkout visual baseline in ${theme} mode`,
    { tag: '@visual' },
    async ({ page }) => {
      const checkout = await openGuestCheckout(page, theme);

      await expect(checkout).toHaveScreenshot(`guest-checkout-${theme}.png`, {
        animations: 'disabled',
        maxDiffPixelRatio: 0.01,
      });
    },
  );
}

const visualPanels = [
  {
    name: 'inscriptions',
    path: '/inscriptions',
    testId: 'designer-inscriptions-panel',
  },
  { name: 'images', path: '/select-images', testId: 'designer-images-panel' },
] as const;

for (const panelDefinition of visualPanels) {
  for (const theme of ['day', 'dark'] as const) {
    test(
      `${panelDefinition.name} panel visual baseline in ${theme} mode`,
      { tag: '@visual' },
      async ({ page }) => {
        const panel = await openPanel(
          page,
          panelDefinition.path,
          panelDefinition.testId,
          theme,
        );

        await expect(panel).toHaveScreenshot(
          `${panelDefinition.name}-${theme}.png`,
          { animations: 'disabled', maxDiffPixelRatio: 0.01 },
        );
      },
    );
  }

  test(
    `${panelDefinition.name} panel has no serious accessibility violations`,
    { tag: ['@smoke', '@a11y'] },
    async ({ page }) => {
      await openPanel(
        page,
        panelDefinition.path,
        panelDefinition.testId,
        'day',
      );
      await expectNoSeriousAccessibilityViolations(
        page,
        `[data-testid="${panelDefinition.testId}"]`,
      );
    },
  );
}

for (const theme of ['day', 'dark'] as const) {
  test(
    `check price visual baseline in ${theme} mode`,
    { tag: '@visual' },
    async ({ page }) => {
      const panel = await openPanel(
        page,
        '/check-price',
        'designer-check-price-page',
        theme,
      );

      await expect(panel).toHaveScreenshot(`check-price-${theme}.png`, {
        animations: 'disabled',
        maxDiffPixelRatio: 0.01,
      });
    },
  );
}

test(
  'check price and guest checkout are accessible',
  { tag: ['@smoke', '@a11y'] },
  async ({ page }) => {
    await openPanel(page, '/check-price', 'designer-check-price-page', 'day');
    await expectNoSeriousAccessibilityViolations(
      page,
      '[data-testid="designer-check-price-page"]',
    );

    const checkout = await openGuestCheckout(page, 'day');
    await expect(page.getByLabel('Email')).toBeFocused();
    await expectNoSeriousAccessibilityViolations(
      page,
      '[data-testid="guest-checkout-modal"]',
    );
  },
);
