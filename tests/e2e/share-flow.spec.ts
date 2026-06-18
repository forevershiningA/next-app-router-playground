/**
 * E2E smoke test for protected family review links.
 * Uses the authenticated storageState to create the design/share, then opens
 * the shared link in a fresh unauthenticated context like a family member.
 */
import { test, expect } from '@playwright/test';

const MINIMAL_DESIGN_STATE = {
  metadata: { productType: 'Headstone' },
  selectedShapeUrl: '/shapes/headstone/Curved-Gable.svg',
  headstoneMaterialUrl: '/textures/forever/l/African-Black.webp',
  headstoneWidthMm: 600,
  headstoneHeightMm: 600,
  headstoneDepthMm: 100,
};

test.describe('protected share review flow', () => {
  test('requires and accepts the generated access code', async ({ request, browser, baseURL }) => {
    const title = `Share Flow Test ${Date.now()}`;
    let projectId: string | undefined;

    try {
      const createProject = await request.post('/api/projects', {
        data: {
          title,
          designState: MINIMAL_DESIGN_STATE,
          totalPriceCents: 150000,
          currency: 'AUD',
        },
      });
      expect(createProject.status()).toBe(200);
      const { project } = await createProject.json();
      projectId = project.id;

      const createShare = await request.post('/api/share/create', {
        data: { projectId },
      });
      expect(createShare.status()).toBe(200);
      const share = await createShare.json();
      expect(share.accessCode).toMatch(/^\d{6}$/);
      expect(share.shareToken).toHaveLength(32);

      const familyContext = await browser.newContext({
        storageState: { cookies: [], origins: [] },
      });
      const familyPage = await familyContext.newPage();

      try {
        await familyPage.goto(new URL(`/shared/${share.shareToken}`, baseURL).toString());
        await expect(
          familyPage.getByRole('heading', { name: 'Enter review code' }),
        ).toBeVisible();

        await familyPage.getByLabel('Access code').fill('000000');
        const invalidResponse = familyPage.waitForResponse(
          (response) =>
            response.url().includes(`/api/share/${share.shareToken}/verify`) &&
            response.request().method() === 'POST',
        );
        await familyPage.getByRole('button', { name: 'View Design' }).click();
        expect((await invalidResponse).status()).toBe(401);
        await expect(familyPage.locator('form').getByText(/invalid access code/i)).toBeVisible();

        await familyPage.getByLabel('Access code').fill(share.accessCode);
        const validResponse = familyPage.waitForResponse(
          (response) =>
            response.url().includes(`/api/share/${share.shareToken}/verify`) &&
            response.request().method() === 'POST',
        );
        await familyPage.getByRole('button', { name: 'View Design' }).click();
        expect((await validResponse).status()).toBe(200);
        await expect(familyPage.getByText(title)).toBeVisible();
        await expect(familyPage.getByText('Shared Memorial Design')).toBeVisible();
      } finally {
        await familyContext.close();
      }
    } finally {
      if (projectId) {
        await request.delete(`/api/projects?id=${projectId}`);
      }
    }
  });
});
