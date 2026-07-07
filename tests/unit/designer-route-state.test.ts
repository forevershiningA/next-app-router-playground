import { describe, expect, it } from 'vitest';
import {
  getDesignerStepSlug,
  isDesignerRoutePath,
} from '#/lib/designer-route-state';

describe('designer route state', () => {
  it('detects legacy designer step routes', () => {
    expect(getDesignerStepSlug('/select-shape')).toBe('select-shape');
    expect(getDesignerStepSlug('/select-size')).toBe('select-size');
  });

  it('detects product-prefixed designer step routes', () => {
    expect(getDesignerStepSlug('/bronze-plaque/select-shape')).toBe(
      'select-shape',
    );
  });

  it('does not treat unrelated nested routes as designer steps', () => {
    expect(getDesignerStepSlug('/products/bronze-plaque')).toBeNull();
    expect(isDesignerRoutePath('/memorials/plaques')).toBe(false);
  });
});
