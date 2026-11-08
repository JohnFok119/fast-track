import { describe, expect, it } from 'vitest';
import { curve, type RectLike } from '../../../src/home/story/curve';

const rect = (left: number, top: number, width: number, height: number): RectLike => ({
  left, top, width, height, right: left + width, bottom: top + height,
});

describe('curve', () => {
  const box = rect(100, 50, 400, 300);

  it('joins the right edge of one quote to the left edge of the other, side to side', () => {
    const c = curve(box, rect(100, 50, 100, 40), rect(300, 150, 100, 40), 'h');
    expect(c.ends).toEqual([[100, 20], [200, 120]]);
    expect(c.d).toBe('M100 20 C 150 20, 150 120, 200 120');
  });

  it('joins the bottom of the ask to the top of its citation, top to bottom', () => {
    const c = curve(box, rect(100, 50, 100, 40), rect(300, 200, 100, 20), 'v');
    expect(c.ends).toEqual([[50, 40], [250, 150]]);
    expect(c.d).toBe('M50 40 C 50 95, 250 95, 250 150');
  });
});
