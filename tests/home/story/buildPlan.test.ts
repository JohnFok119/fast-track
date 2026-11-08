import { describe, expect, it } from 'vitest';
import { BuildPlan, PART_NAMES, STAGE_NAMES } from '../../../src/home/story/buildPlan';

const plan = new BuildPlan();
const shownAt = (stage: number) => PART_NAMES.filter((p) => plan.shows(p, stage));

describe('BuildPlan', () => {
  it('names the six stages in story order', () => {
    expect(STAGE_NAMES).toEqual(['Lot', 'Build', 'Read', 'Clash', 'Fix', 'Keys']);
    expect(plan.last).toBe(5);
  });

  it('shows only the bare lot, its stakes and the house outline at the start', () => {
    expect(shownAt(0)).toEqual(['lot', 'stakes', 'outline']);
  });

  it('pours the slab, then the frame, then the walls with their clash marks', () => {
    expect(shownAt(1)).toEqual(['lot', 'stakes', 'outline', 'slab']);
    expect(shownAt(2)).toEqual(['lot', 'stakes', 'outline', 'slab', 'frame']);
    expect(shownAt(3)).toEqual(['lot', 'stakes', 'outline', 'slab', 'frame', 'walls', 'marks']);
  });

  it('drops the outline once the roof is on, and the stakes once the house is finished', () => {
    expect(shownAt(4)).toEqual(['lot', 'stakes', 'slab', 'frame', 'walls', 'marks', 'roof']);
    expect(shownAt(5)).toEqual(['lot', 'slab', 'frame', 'walls', 'marks', 'roof', 'finish', 'lights']);
  });

  it('turns the clash marks into checks from the Fix stage and lights the windows at Keys', () => {
    expect([3, 4, 5].map((s) => plan.fixed(s))).toEqual([false, true, true]);
    expect([4, 5].map((s) => plan.lit(s))).toEqual([false, true]);
  });

  it('fills the progress rail from 0 to 1 across the stages', () => {
    expect(plan.progress(0)).toBe(0);
    expect(plan.progress(5)).toBe(1);
    expect(plan.progress(2)).toBeCloseTo(0.4);
  });
});
