import { test, expect } from '@playwright/test';

test('reviewed holds are absent from public routes and listings without deleting source assets', async ({ request }) => {
  const hiddenPaths = [
    '/designs/laser-etched-headstone/memorial/headstone-19-memorial',
    '/designs/pets/pet-memorial/square-cat',
    '/designs/laser-monument/biblical-memorial/cropped-peak-much-loved',
  ];
  for (const path of hiddenPaths) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(404);
  }
  const category = await request.get('/designs/pets/pet-memorial');
  expect(category.status()).toBe(200);
  expect(await category.text()).not.toContain('/designs/pets/pet-memorial/square-cat"');
  const ordinary = await request.get('/designs/traditional-headstone/memorial/serpentine-duck-swan');
  expect(ordinary.status()).toBe(200);
  const originalAsset = await request.get('/screenshots/v2026-3d/1587099984019.png');
  expect(originalAsset.status()).toBe(200);
});
