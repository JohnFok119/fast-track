import { describe, expect, it } from 'vitest';
import { CurvePlanner, type Box } from '../../src/home/hub/CurvePlanner';

const box = (left: number, top: number, right: number, bottom: number): Box => ({ left, top, right, bottom });
const origin = box(0, 0, 400, 300);

describe('CurvePlanner', () => {
  const planner = new CurvePlanner();

  it('goes side to side: from the right edge middle of a to the left edge middle of b', () => {
    const curve = planner.plan(box(0, 0, 100, 40), box(200, 100, 300, 140), origin, 'h');
    expect(curve.ends).toEqual([[100, 20], [200, 120]]);
    expect(curve.d).toBe('M100 20 C 150 20, 150 120, 200 120');
  });

  it('goes top to bottom: from the bottom edge center of a to the top edge center of b', () => {
    const curve = planner.plan(box(0, 0, 100, 40), box(200, 100, 300, 140), origin, 'v');
    expect(curve.ends).toEqual([[50, 40], [250, 100]]);
    expect(curve.d).toBe('M50 40 C 50 70, 250 70, 250 100');
  });

  it('measures from the container, not from the page', () => {
    const shifted = box(1000, 500, 1400, 800);
    const curve = planner.plan(box(1000, 500, 1100, 540), box(1200, 600, 1300, 640), shifted, 'h');
    expect(curve.ends).toEqual([[100, 20], [200, 120]]);
  });
});
