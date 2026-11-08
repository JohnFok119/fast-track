import { describe, expect, it } from 'vitest';
import { PopTimeline } from '../../../src/home/street/PopTimeline';
import { StreetLayout } from '../../../src/home/street/StreetLayout';
import { shouldShowSticky } from '../../../src/home/street/stickyRule';
import { ViewFit } from '../../../src/home/street/ViewFit';

function at<V>(list: V[], i: number): V {
  const v = list[i];
  if (v === undefined) throw new Error(`no item at ${i}`);
  return v;
}

describe('StreetLayout', () => {
  it('is the same street for the same width and differs for another seed', () => {
    expect(new StreetLayout(60).plan()).toEqual(new StreetLayout(60).plan());
    expect(new StreetLayout(60, 5).plan()).not.toEqual(new StreetLayout(60).plan());
  });

  it('puts a duplex in the middle of the front row and a two-story in the back row', () => {
    const plan = new StreetLayout(60).plan();
    const middles = plan.filter((p) => p.type === 'house' && p.x === 0);
    expect(middles.map((p) => [p.kind, p.z])).toEqual([['duplex', 0], ['two', -4.2]]);
  });

  it('uses only the four kinds of home', () => {
    const kinds = new Set(new StreetLayout(60).plan().filter((p) => p.type === 'house').map((p) => p.kind));
    expect([...kinds].every((k) => ['one', 'two', 'adu', 'duplex'].includes(k as string))).toBe(true);
    expect(kinds.size).toBe(4);
  });

  it('pops pieces from the middle outward: farther from the middle means a later delay', () => {
    const front = new StreetLayout(60).plan().filter((p) => p.z > -2);
    const byDistance = [...front].sort((a, b) => Math.abs(a.x) - Math.abs(b.x));
    for (let i = 1; i < byDistance.length; i++) {
      expect(at(byDistance, i).delay).toBeGreaterThanOrEqual(at(byDistance, i - 1).delay - 0.1);
    }
    expect(at(byDistance, 0).delay).toBe(0);
    expect(Math.max(...front.map((p) => p.delay))).toBeGreaterThan(2);
  });

  it('fills both sides and reaches the requested width', () => {
    const houses = new StreetLayout(40).plan().filter((p) => p.type === 'house');
    expect(houses.some((p) => p.x < -30)).toBe(true);
    expect(houses.some((p) => p.x > 30)).toBe(true);
    expect(Math.max(...houses.map((p) => Math.abs(p.x)))).toBeLessThan(40 + 4);
  });

  it('does not overlap neighbors on one side of the front row', () => {
    const right = new StreetLayout(60).plan().filter((p) => p.type === 'house' && p.z > -2 && p.x > 0).sort((a, b) => a.x - b.x);
    for (let i = 1; i < right.length; i++) {
      const a = at(right, i - 1);
      const b = at(right, i);
      expect(b.x - b.width / 2).toBeGreaterThan(a.x + a.width / 2);
    }
  });
});

describe('ViewFit', () => {
  const fit = new ViewFit();

  it('keeps 11 units of height on a wide screen', () => {
    const box = fit.fit(1440, 300);
    expect(box.viewH).toBe(11);
    expect(box.viewW).toBeCloseTo(11 * 4.8);
    expect(box.top).toBe(5.5);
    expect(box.left).toBeCloseTo(-box.right);
  });

  it('shows more height on a phone so several houses fit across', () => {
    const box = fit.fit(390, 240);
    expect(box.viewH).toBeCloseTo(24 / (390 / 240));
    expect(box.viewH).toBeGreaterThan(11);
    expect(box.viewW).toBeCloseTo(24);
  });
});

describe('PopTimeline', () => {
  it('hides a piece until its delay and settles it at full size', () => {
    const t = new PopTimeline([0, 1], false);
    expect(t.visible(1, 0.5)).toBe(false);
    expect(t.visible(0, 0.01)).toBe(true);
    expect(t.scale(1, 0.5)).toBeLessThan(0.001);
    expect(t.scale(0, 0.6)).toBe(1);
    expect(t.busy(1.2)).toBe(true);
    expect(t.busy(1.7)).toBe(false);
  });

  it('overshoots a little on the way up', () => {
    const t = new PopTimeline([0], false);
    expect(Math.max(...[0.3, 0.4, 0.5].map((c) => t.scale(0, c)))).toBeGreaterThan(1);
  });

  it('has everything standing already for reduced motion', () => {
    const t = new PopTimeline([0, 3], true);
    expect(t.scale(1, 0)).toBe(1);
    expect(t.visible(1, 0)).toBe(true);
    expect(t.busy(0)).toBe(false);
  });
});

describe('shouldShowSticky', () => {
  const base = { innerHeight: 900, scrollHeight: 9000 };
  it('is hidden on the first screen', () => {
    expect(shouldShowSticky({ ...base, scrollY: 600 })).toBe(false);
  });
  it('shows once past 80% of the screen height', () => {
    expect(shouldShowSticky({ ...base, scrollY: 721 })).toBe(true);
    expect(shouldShowSticky({ ...base, scrollY: 720 })).toBe(false);
  });
  it('hides again near the bottom, where the closing section has its own button', () => {
    expect(shouldShowSticky({ ...base, scrollY: 9000 - 1440 - 1 })).toBe(true);
    expect(shouldShowSticky({ ...base, scrollY: 9000 - 1440 })).toBe(false);
  });
});
