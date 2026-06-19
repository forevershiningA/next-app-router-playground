import { type Page, expect } from '@playwright/test';

/**
 * Page Object Model for the headstone designer multi-step flow.
 * Focuses on the "Save Design" path that ends with POST /api/projects.
 */
export class DesignerPage {
  constructor(private readonly page: Page) {}

  /** Navigate to any designer step (the nav is global across all steps). */
  async goto(path: '/select-shape' | '/select-material' | '/check-price' | string = '/select-shape') {
    await this.page.goto(path);
  }

  /**
   * Wait for the page to become interactive (canvas and nav loaded).
   * The designer nav is always present on designer pages.
   */
  async waitForReady() {
    await expect(this.page.locator('[data-testid="save-design-nav-btn"]')).toBeVisible({
      timeout: 20_000,
    });
  }

  /** Click the "Save Design" nav button to open the save modal. */
  async openSaveModal() {
    const btn = this.page.locator('[data-testid="save-design-nav-btn"]');
    // Scroll the button into view — it sits at the bottom of the nav sidebar and
    // may be clipped below the 720 px viewport before scrolling.
    await btn.scrollIntoViewIfNeeded();
    await btn.click();
    // Wait for modal to appear (session check + React re-render)
    await expect(this.page.getByRole('heading', { name: 'Save Design' })).toBeVisible({
      timeout: 10_000,
    });
  }

  /**
   * Complete the save modal: enter a name and submit.
   * Returns after the modal closes (success) or rejects on timeout.
   */
  async saveDesign(designName: string) {
    await this.page.getByLabel('Design Name').fill(designName);
    // The submit button text is "Save Design" (same as heading — scope to the form)
    await this.page.locator('form').getByRole('button', { name: 'Save Design' }).click();
    // Wait for modal to disappear (save complete)
    await expect(this.page.getByRole('heading', { name: 'Save Design' })).toBeHidden({
      timeout: 15_000,
    });
  }

  /** Assert the 3D canvas is rendering (non-blank WebGL frame). */
  async waitForCanvasRender(timeout = 15_000) {
    await this.page.waitForFunction(
      () => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return false;
        const gl =
          (window as unknown as { __r3fGL?: { getContext?: () => WebGLRenderingContext | WebGL2RenderingContext } })
            .__r3fGL?.getContext?.() ?? canvas.getContext('webgl2');
        if (!gl) return false;
        const samplePoints = [
          [0.5, 0.5],
          [0.35, 0.45],
          [0.65, 0.45],
          [0.5, 0.3],
          [0.5, 0.7],
        ];
        const pixels = new Uint8Array(4);
        return samplePoints.some(([x, y]) => {
          gl.readPixels(
            Math.floor(canvas.width * x),
            Math.floor(canvas.height * y),
            1,
            1,
            gl.RGBA,
            gl.UNSIGNED_BYTE,
            pixels,
          );
          return pixels.some((p) => p > 0);
        });
      },
      undefined,
      { timeout },
    );
  }
}
