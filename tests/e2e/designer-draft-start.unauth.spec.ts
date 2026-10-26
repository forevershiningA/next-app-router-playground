import { expect, test, type Page } from '@playwright/test';
import type { HeadstoneState } from '#/lib/headstone-store.types';

const route = '/traditional-engraved-headstone/inscriptions';
const dedication = 'A previous locally saved design';

test.beforeEach(async ({ page }) => {
  page.on('dialog', (dialog) => dialog.accept());
});

async function seedPreviousDraft(page: Page) {
  await page.goto(route);
  await page
    .getByRole('textbox', { name: 'Inscription text' })
    .fill(dedication);
  await page
    .getByRole('button', { name: 'Add Inscription', exact: true })
    .click();
  // Seed the historical record independently of autosave and scene updates.
  await page.evaluate(
    () =>
      new Promise<void>((resolve, reject) => {
        const state = (
          window as unknown as {
            __headstoneStore: { getState: () => HeadstoneState };
          }
        ).__headstoneStore.getState();
        const request = indexedDB.open('forever-shining-designer', 1);
        request.onupgradeneeded = () =>
          request.result.createObjectStore('drafts');
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const database = request.result;
          const transaction = database.transaction('drafts', 'readwrite');
          transaction
            .objectStore('drafts')
            .put(
              {
                version: 1,
                productId: state.productId,
                shapeUrl: state.shapeUrl,
                inscriptions: state.inscriptions.map(
                  ({ ref: _ref, ...line }) => line,
                ),
              },
              'active-design',
            );
          transaction.oncomplete = () => {
            database.close();
            resolve();
          };
          transaction.onerror = () => reject(transaction.error);
        };
      }),
  );
}

async function currentTexts(page: Page) {
  return page.evaluate(() =>
    (
      window as unknown as {
        __headstoneStore: { getState: () => HeadstoneState };
      }
    ).__headstoneStore
      .getState()
      .inscriptions.map((line) => line.text),
  );
}

test('normal reload never reads the previous IndexedDB draft', async ({
  page,
}) => {
  await seedPreviousDraft(page);
  await page.addInitScript(() => {
    const original = IDBObjectStore.prototype.get;
    (window as unknown as { draftReads: number }).draftReads = 0;
    IDBObjectStore.prototype.get = function (key) {
      if (key === 'active-design')
        (window as unknown as { draftReads: number }).draftReads++;
      return original.call(this, key);
    };
  });
  await page.reload();
  await expect(
    page.getByRole('textbox', { name: 'Inscription text' }),
  ).toBeVisible();
  expect(await currentTexts(page)).toEqual([]);
  expect(
    await page.evaluate(
      () => (window as unknown as { draftReads: number }).draftReads,
    ),
  ).toBe(0);
});

test('returning to save after login still restores the working design', async ({
  page,
}) => {
  await seedPreviousDraft(page);
  await page.route('**/api/auth/session', (route) =>
    route.fulfill({ status: 401, body: '{}' }),
  );
  await page.goto(`${route}?action=save-design`);
  await expect.poll(() => currentTexts(page)).toEqual([dedication]);
});
