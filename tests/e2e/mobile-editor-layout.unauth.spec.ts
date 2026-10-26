import { expect, test } from '@playwright/test';
import type * as THREE from 'three';

async function expectModelInPreview(
  page: import('@playwright/test').Page,
  bottom: number,
) {
  await page.waitForFunction(
    () => {
      const view = window as unknown as {
        __r3fCamera?: THREE.PerspectiveCamera;
        __mobilePose?: { values: string; since: number };
      };
      const camera = view.__r3fCamera;
      const canvas = document.querySelector('canvas');
      if (!camera || !canvas) return false;
      let element: HTMLElement | null = canvas;
      while (element) {
        if (Number(getComputedStyle(element).opacity) < 1) return false;
        element = element.parentElement;
      }
      const values = camera.matrixWorld.elements
        .map((v) => v.toFixed(6))
        .join(',');
      if (view.__mobilePose?.values !== values) {
        view.__mobilePose = { values, since: performance.now() };
        return false;
      }
      return performance.now() - view.__mobilePose.since > 500;
    },
    undefined,
    { timeout: 45000 },
  );
  await expect
    .poll(
      async () =>
        page.evaluate((bottom) => {
          const view = window as unknown as {
            __r3fScene?: THREE.Scene;
            __r3fCamera?: THREE.PerspectiveCamera;
          };
          const mesh = view.__r3fScene?.getObjectByName('headstone') as
            | THREE.Mesh
            | undefined;
          const camera = view.__r3fCamera;
          if (!mesh?.geometry || !camera) return false;
          mesh.updateWorldMatrix(true, true);
          camera.updateMatrixWorld(true);
          mesh.geometry.computeBoundingBox();
          const box = mesh.geometry
            .boundingBox!.clone()
            .applyMatrix4(mesh.matrixWorld);
          const points = [];
          for (const x of [box.min.x, box.max.x])
            for (const y of [box.min.y, box.max.y])
              for (const z of [box.min.z, box.max.z])
                points.push(mesh.position.clone().set(x, y, z).project(camera));
          return points.every(
            (p) =>
              ((1 - p.y) / 2) * innerHeight >= 110 &&
              ((1 - p.y) / 2) * innerHeight < bottom &&
              Math.abs(p.x) < 1,
          );
        }, bottom),
      { timeout: 45000 },
    )
    .toBe(true);
}

test('phone editor expands, collapses and keeps controls accessible', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => localStorage.setItem('fs_ui_theme', 'day'));
  await page.goto('/traditional-engraved-headstone/inscriptions');
  const sheet = page.getByTestId('designer-mobile-sheet');
  const handle = page.getByRole('button', {
    name: 'Collapse Add inscription panel',
  });
  await expect(handle).toBeVisible();
  await expect
    .poll(async () => (await sheet.boundingBox())?.height)
    .toBeCloseTo(633, 0);
  await expect(page.getByText(/Step 4 of/)).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: 'Rotate left', exact: true }),
  ).toBeHidden();
  const field = page.getByRole('textbox', { name: 'Inscription text' });
  await field.fill('Always in our hearts');
  const add = page.getByRole('button', {
    name: 'Add Inscription',
    exact: true,
  });
  await add.scrollIntoViewIfNeeded();
  await add.click();
  await expect(
    page.getByRole('button', { name: 'New Inscription', exact: true }),
  ).toBeVisible();
  await handle.click();
  const expand = page.getByRole('button', {
    name: 'Expand Add inscription panel',
  });
  await expect(expand).toHaveAttribute('aria-expanded', 'false');
  await expect
    .poll(async () => (await sheet.boundingBox())?.height)
    .toBeCloseTo(52, 0);
  await expectModelInPreview(page, 792);
  await page.screenshot({ path: 'output/mobile-editor-preview.png' });
  const bounds = (await expand.boundingBox())!;
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y + 24);
  await page.mouse.down();
  await page.mouse.move(bounds.x + bounds.width / 2, bounds.y - 70, {
    steps: 8,
  });
  await page.mouse.up();
  await expect(handle).toHaveAttribute('aria-expanded', 'true');
  await expect
    .poll(async () => (await sheet.boundingBox())?.height)
    .toBeCloseTo(633, 0);
  await expectModelInPreview(page, 211);
  await page.screenshot({ path: 'output/mobile-editor-expanded.png' });
  await page.getByRole('button', { name: 'Menu', exact: true }).click();
  await expect(
    page.getByText('Currency', { exact: true }).filter({ visible: true }),
  ).toBeVisible();
});
