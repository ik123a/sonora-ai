import { describe, expect, it } from 'vitest';
import { EQ_PRESETS } from '../audio/engine';

describe('eq presets', () => {
  it('has 9 bands each', () => {
    for (const g of Object.values(EQ_PRESETS)) expect(g).toHaveLength(9);
  });
});
