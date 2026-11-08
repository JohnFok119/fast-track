import { describe, expect, it } from 'vitest';
import { PILL_AFTER_PX, isPill } from '../../src/home/hero/navPill';

describe('nav pill rule', () => {
  it('stays full width at the top and up to 40px', () => {
    expect(PILL_AFTER_PX).toBe(40);
    expect(isPill(0)).toBe(false);
    expect(isPill(40)).toBe(false);
  });
  it('becomes a floating pill past 40px', () => {
    expect(isPill(41)).toBe(true);
    expect(isPill(2000)).toBe(true);
  });
});
