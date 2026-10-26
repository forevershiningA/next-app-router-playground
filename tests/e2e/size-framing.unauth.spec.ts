import { expect, test, type Page } from '@playwright/test';
import type * as THREE from 'three';

test.use({ viewport: { width: 1590, height: 862 } });

async function framing(page: Page) {
  return page.evaluate(() => {
    const view = window as unknown as {
      __r3fScene?: THREE.Scene;
      __r3fCamera?: THREE.PerspectiveCamera;
    };
    const camera = view.__r3fCamera;
    const mesh = view.__r3fScene?.getObjectByName('headstone') as
      | THREE.Mesh
      | undefined;
    if (!camera || !mesh?.geometry) return null;
    mesh.updateWorldMatrix(true, true);
    camera.updateMatrixWorld(true);
    mesh.geometry.computeBoundingBox();
    const box = mesh.geometry
      .boundingBox!.clone()
      .applyMatrix4(mesh.matrixWorld);
    const corners = [];
    for (const x of [box.min.x, box.max.x]) {
      for (const y of [box.min.y, box.max.y]) {
        for (const z of [box.min.z, box.max.z]) {
          corners.push(mesh.position.clone().set(x, y, z).project(camera));
        }
      }
    }
    const top = (1 - Math.max(...corners.map((point) => point.y))) / 2;
    const bottom = (1 - Math.min(...corners.map((point) => point.y))) / 2;
    return { top, bottom, center: (top + bottom) / 2, height: bottom - top };
  });
}

async function waitForFramingToSettle(page: Page) {
  await page.waitForFunction(
    () => {
      const view = window as unknown as {
        __r3fScene?: THREE.Scene;
        __r3fCamera?: THREE.PerspectiveCamera;
        __framingSample?: {
          values: number[];
          geometry: string;
          changedAt: number;
        };
      };
      const mesh = view.__r3fScene?.getObjectByName('headstone') as
        | THREE.Mesh
        | undefined;
      const camera = view.__r3fCamera;
      if (!mesh || !camera) return false;
      mesh.updateWorldMatrix(true, true);
      camera.updateMatrixWorld(true);
      const values = [
        ...mesh.matrixWorld.elements,
        ...camera.matrixWorld.elements,
      ];
      const previous = view.__framingSample;
      const now = performance.now();
      if (
        !previous ||
        previous.geometry !== mesh.geometry.uuid ||
        values.some(
          (value, index) => Math.abs(value - previous.values[index]) > 1e-7,
        )
      ) {
        view.__framingSample = {
          values,
          geometry: mesh.geometry.uuid,
          changedAt: now,
        };
        return false;
      }
      return now - previous.changedAt > 400;
    },
    undefined,
    { timeout: 15_000 },
  );
}

test('headstone presets keep the model centred and framed after resizing', async ({
  page,
}, testInfo) => {
  await page.addInitScript(() => {
    sessionStorage.setItem('display_currency', 'EUR');
    localStorage.setItem('fs_ui_theme', 'day');
  });
  await page.goto('/traditional-engraved-headstone/select-size');
  const panel = page.getByTestId('designer-size-panel');
  await expect(panel).toBeVisible();
  await page.getByRole('button', { name: 'Shape', exact: true }).click();
  await page.getByTitle('Half Round', { exact: true }).click();
  await page.getByRole('button', { name: 'Size', exact: true }).click();
  const presets = panel.getByRole('group', {
    name: 'Standard headstone sizes',
  });

  for (const label of [
    '500 × 800 mm',
    '800 × 900 mm',
    '1000 × 800 mm',
    '500 × 800 mm',
  ]) {
    await presets.getByRole('button', { name: label, exact: true }).click();
    await waitForFramingToSettle(page);
    await expect
      .poll(
        async () => {
          const bounds = await framing(page);
          return (
            bounds !== null &&
            bounds.center > 0.35 &&
            bounds.center < 0.57 &&
            bounds.height > 0.45 &&
            bounds.top > 0.08 &&
            bounds.bottom < 0.9
          );
        },
        {
          timeout: 10_000,
          message: `${label} should stay centred with space around the model`,
        },
      )
      .toBe(true);
    await testInfo.attach(label, {
      body: JSON.stringify(await framing(page)),
      contentType: 'application/json',
    });
  }
  await page.screenshot({ path: 'output/select-size-framing.png' });
});
