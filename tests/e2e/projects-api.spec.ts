/**
 * API-level tests for /api/projects (save, list, delete designs).
 * These run against the real Next.js API routes.
 * Uses storageState from auth.setup.ts for authenticated requests.
 *
 * Run with: pnpm test:e2e
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

test.describe('POST /api/projects — save design', () => {
  test('saves a new design and returns project summary', async ({ request }) => {
    const res = await request.post('/api/projects', {
      data: {
        title: 'API Test Design',
        designState: MINIMAL_DESIGN_STATE,
        totalPriceCents: 150000,
        currency: 'AUD',
      },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.project).toMatchObject({
      title: 'API Test Design',
      status: 'draft',
      currency: 'AUD',
    });
    expect(body.project.id).toBeTruthy();

    // Clean up: delete the test project
    const projectId = body.project.id;
    const deleteRes = await request.delete(`/api/projects?id=${projectId}`);
    expect(deleteRes.status()).toBe(200);
  });

  test('returns 400 when designState is missing', async ({ request }) => {
    const res = await request.post('/api/projects', {
      data: { title: 'Bad Request Design' },
    });

    expect(res.status()).toBe(400);
    const body = await res.json();
    expect(body.message).toContain('designState');
  });

  test('uses "Untitled Design" as default title when title is omitted', async ({ request }) => {
    const res = await request.post('/api/projects', {
      data: { designState: MINIMAL_DESIGN_STATE },
    });

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.project.title).toBe('Untitled Design');

    // Clean up
    await request.delete(`/api/projects?id=${body.project.id}`);
  });
});

test.describe('GET /api/projects — list designs', () => {
  test('returns a list of saved designs', async ({ request }) => {
    const res = await request.get('/api/projects');

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(Array.isArray(body.projects)).toBe(true);
  });

  test('respects the limit query parameter', async ({ request }) => {
    const res = await request.get('/api/projects?limit=1');

    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.projects.length).toBeLessThanOrEqual(1);
  });
});

test.describe('DELETE /api/projects — delete design', () => {
  test('deletes a project that belongs to the current user', async ({ request }) => {
    // Create a project to delete
    const createRes = await request.post('/api/projects', {
      data: { title: 'To Be Deleted', designState: MINIMAL_DESIGN_STATE },
    });
    const { project } = await createRes.json();

    const deleteRes = await request.delete(`/api/projects?id=${project.id}`);
    expect(deleteRes.status()).toBe(200);

    // Verify it's gone from the list
    const listRes = await request.get('/api/projects');
    const { projects } = await listRes.json();
    expect(projects.find((p: { id: string }) => p.id === project.id)).toBeUndefined();
  });

  test('returns 400 when project ID is missing', async ({ request }) => {
    const res = await request.delete('/api/projects');
    expect(res.status()).toBe(400);
  });
});
