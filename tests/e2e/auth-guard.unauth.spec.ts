/**
 * Unauthenticated API boundary tests.
 * Runs in the `api-unauth` project (no storageState) so requests have no session cookie.
 */
import { test, expect } from '@playwright/test';

test.describe('API auth guards', () => {
  test('POST /api/projects without auth returns 401', async ({ request }) => {
    const response = await request.post('/api/projects', {
      data: { designState: { metadata: { screenshot: null } } },
    });
    expect(response.status()).toBe(401);
  });

  test('GET /api/projects without auth returns 401', async ({ request }) => {
    const response = await request.get('/api/projects');
    expect(response.status()).toBe(401);
  });

  test('DELETE /api/projects without auth returns 401', async ({ request }) => {
    const response = await request.delete('/api/projects?id=non-existent-id');
    expect(response.status()).toBe(401);
  });
});
