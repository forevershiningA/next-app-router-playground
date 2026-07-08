import { describe, expect, it } from 'vitest';
import { appendDesignName } from '#/lib/email/helpers';

describe('email helpers', () => {
  it('adds a space between a saved-design label and design name', () => {
    expect(appendDesignName('Your Design has been Saved -', 'test X')).toBe(
      'Your Design has been Saved - test X',
    );
  });

  it('normalizes existing trailing whitespace before the design name', () => {
    expect(appendDesignName('Your Design has been Saved - ', 'test X')).toBe(
      'Your Design has been Saved - test X',
    );
  });
});
