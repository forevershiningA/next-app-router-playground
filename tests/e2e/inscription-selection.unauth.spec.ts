import { expect, test } from '@playwright/test';
import type { HeadstoneState } from '#/lib/headstone-store.types';
import { writeFile } from 'node:fs/promises';

for (const width of [1440, 390]) {
  test(`select and personalize each inscription from the panel (${width}px)`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/traditional-engraved-headstone/inscriptions');
    const panel = page.getByTestId('designer-inscriptions-panel');
    await expect(panel).toBeVisible({ timeout: 20000 });
    await page.evaluate(() => {
      const store = (
        window as unknown as {
          __headstoneStore: { getState: () => HeadstoneState };
        }
      ).__headstoneStore;
      store.getState().setInscriptions([]);
      for (const [text, yPos] of [
        ['KLEIN', 60],
        ['1940–2020', -60],
      ] as const) {
        store.getState().addInscriptionLine({ text, yPos, font: 'Arial' });
      }
    });
    const field = panel.getByRole('textbox', { name: 'Inscription text' });
    await panel
      .getByRole('button', { name: 'Edit inscription 1: KLEIN', exact: true })
      .click();
    await expect(field).toHaveValue('KLEIN');
    await field.fill('ALEX MORGAN');
    await expect(
      panel.getByRole('button', {
        name: 'Edit inscription 1: ALEX MORGAN',
        exact: true,
      }),
    ).toHaveAttribute('aria-pressed', 'true');
    await panel
      .getByRole('button', {
        name: 'Edit inscription 2: 1940–2020',
        exact: true,
      })
      .click();
    await expect(field).toHaveValue('1940–2020');
    await field.fill('1950–2025');
    await panel
      .getByRole('button', {
        name: 'Edit inscription 1: ALEX MORGAN',
        exact: true,
      })
      .click();
    await expect(field).toHaveValue('ALEX MORGAN');
    await expect(
      panel.getByRole('button', {
        name: 'Edit inscription 2: 1950–2025',
        exact: true,
      }),
    ).toHaveAttribute('aria-pressed', 'false');
    await page.screenshot({
      path: `output/inscription-selection-${width}.png`,
    });
  });
}

test('save captures updated lettering and sends matching project data', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.route('**/api/auth/session', (route) =>
    route.fulfill({ json: { user: { id: 'preview-test' } } }),
  );
  await page.route('**/api/projects', (route) =>
    route.fulfill({
      status: 400,
      json: { message: 'Test capture complete; nothing was saved.' },
    }),
  );
  await page.goto(
    '/traditional-engraved-headstone/check-price?action=save-design',
  );
  await expect(
    page.getByRole('heading', { name: 'Save Design', exact: true }),
  ).toBeVisible();
  await page.waitForFunction(() => {
    const view = window as unknown as {
      __headstoneStore?: { getState: () => HeadstoneState };
      __r3fScene?: unknown;
    };
    return Boolean(view.__headstoneStore);
  });
  await page.evaluate(async () => {
    const store = (
      window as unknown as {
        __headstoneStore: { getState: () => HeadstoneState };
      }
    ).__headstoneStore;
    await store.getState().setProductId('124');
    store.getState().setInscriptions([]);
    const id = store
      .getState()
      .addInscriptionLine({ text: 'KLEIN', font: 'Arial', sizeMm: 45 });
    store
      .getState()
      .updateInscription(id, {
        text: 'ALEX MORGAN',
        xPos: 0,
        yPos: 0,
        coordinateSpace: 'mm-center',
      });
  });
  await page
    .getByLabel('Design Name', { exact: true })
    .fill('Personalized preview test');
  const sent = page.waitForRequest(
    (request) =>
      request.url().endsWith('/api/projects') && request.method() === 'POST',
  );
  await page
    .locator('form')
    .getByRole('button', { name: 'Save Design', exact: true })
    .click();
  const payload = (await sent).postDataJSON();
  expect(
    payload.designState.inscriptions.map((line: { text: string }) => line.text),
  ).toEqual(['ALEX MORGAN']);
  expect(payload.designState.metadata.screenshot).toMatch(
    /^data:image\/jpeg;base64,/,
  );
  expect(payload.currency).toMatch(/^[A-Z]{3}$/);
  await writeFile(
    'output/personalized-saved-preview.jpg',
    Buffer.from(
      payload.designState.metadata.screenshot.split(',')[1],
      'base64',
    ),
  );
  await expect(page.locator('form').getByRole('alert')).toHaveText(
    'Test capture complete; nothing was saved.',
  );
});
