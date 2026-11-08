// The house's framing must stay hidden under the roof: no rafter or joist end may poke through or past it.
import { describe, expect, it } from 'vitest';
import {
  HOUSE,
  OPENINGS,
  ROOF,
  boxCorners,
  joistBox,
  plateBoxes,
  rafterBoxes,
  roofPanels,
  studLayout,
  type Point2,
} from '../../../src/home/story/house/geometry';

const pitch = Math.atan2(HOUSE.rise, HOUSE.width / 2);
const ridgeY = HOUSE.slab + HOUSE.height + HOUSE.rise;

/** How far a point sits above the roof's slope line, measured square to the slope (the higher of the two sides). */
function aboveSlope(p: Point2): number {
  const right = p.x * Math.sin(pitch) + (p.y - ridgeY) * Math.cos(pitch);
  const left = -p.x * Math.sin(pitch) + (p.y - ridgeY) * Math.cos(pitch);
  return Math.max(right, left);
}

const underside = ROOF.lift - ROOF.thickness / 2;
const topSurface = ROOF.lift + ROOF.thickness / 2;
const eaveReach = Math.max(...roofPanels().flatMap((b) => boxCorners(b).map((c) => Math.abs(c.x))));

describe('house geometry', () => {
  it('lays both roof panels on the slope, meeting at the ridge', () => {
    const [left, right] = roofPanels();
    expect(left?.rot).toBeCloseTo(pitch);
    expect(right?.rot).toBeCloseTo(-pitch);
    for (const panel of roofPanels()) expect(aboveSlope({ x: panel.cx, y: panel.cy })).toBeCloseTo(ROOF.lift);
  });

  it('keeps every rafter wholly under the roof panels', () => {
    for (const corner of rafterBoxes().flatMap(boxCorners)) expect(aboveSlope(corner)).toBeLessThanOrEqual(underside + 1e-9);
  });

  it('keeps the joists and top plates from poking out through the roof', () => {
    const framing = [joistBox(), ...plateBoxes()].flatMap(boxCorners);
    for (const corner of framing) expect(aboveSlope(corner)).toBeLessThan(topSurface);
  });

  it('ends all framing inside the eaves, so no tail sticks out past the roof edge', () => {
    const framing = [...rafterBoxes(), joistBox(), ...plateBoxes()].flatMap(boxCorners);
    for (const corner of framing) expect(Math.abs(corner.x)).toBeLessThan(eaveReach);
  });

  it('keeps the joists inside the walls', () => {
    const joist = joistBox();
    expect(joist.cx + joist.w / 2).toBeLessThan(HOUSE.width / 2);
  });

  it('leaves studs out of the door and window openings', () => {
    const { front, back, side } = studLayout();
    const inOpening = (v: number, list: readonly (readonly [number, number])[]) => list.some(([a, b]) => v > a && v < b);
    expect(front.some((x) => inOpening(x, OPENINGS.front))).toBe(false);
    expect(back.some((x) => inOpening(x, OPENINGS.back))).toBe(false);
    expect(side.some((z) => inOpening(z, OPENINGS.side))).toBe(false);
    expect([front.length, back.length, side.length]).toEqual([7, 10, 8]);
  });
});
