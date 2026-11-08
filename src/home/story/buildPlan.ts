// What the house shows at each stage of the story. Both the 3D house and the flat drawing follow this one plan.

export const STAGE_NAMES = ['Lot', 'Build', 'Read', 'Clash', 'Fix', 'Keys'] as const;

/** The parts of the house, in build order. */
export const PART_NAMES = ['lot', 'stakes', 'outline', 'slab', 'frame', 'walls', 'marks', 'roof', 'finish', 'lights'] as const;
export type PartName = (typeof PART_NAMES)[number];

export interface PartWindow {
  /** First stage the part shows at. */
  from: number;
  /** First stage it is gone again. */
  until: number;
}

const NEVER = Number.POSITIVE_INFINITY;

const WINDOWS: Record<PartName, PartWindow> = {
  lot: { from: 0, until: NEVER },
  // Survey stakes come out when the house is finished; the dashed outline goes once the roof is on.
  stakes: { from: 0, until: 5 },
  outline: { from: 0, until: 4 },
  slab: { from: 1, until: NEVER },
  frame: { from: 2, until: NEVER },
  walls: { from: 3, until: NEVER },
  // Red clash marks appear with the walls and turn into checks at the Fix stage.
  marks: { from: 3, until: NEVER },
  roof: { from: 4, until: NEVER },
  // Door, path, trees and shrubs; the windows light up.
  finish: { from: 5, until: NEVER },
  lights: { from: 5, until: NEVER },
};

const FIX = 4;
const KEYS = 5;

export class BuildPlan {
  readonly last = STAGE_NAMES.length - 1;

  window(part: PartName): PartWindow {
    return WINDOWS[part];
  }

  shows(part: PartName, stage: number): boolean {
    const w = WINDOWS[part];
    return stage >= w.from && stage < w.until;
  }

  /** The clash marks show as fixed once the draft asks for the fix. */
  fixed(stage: number): boolean {
    return stage >= FIX;
  }

  lit(stage: number): boolean {
    return stage >= KEYS;
  }

  /** How far along the rail is, from 0 to 1. */
  progress(stage: number): number {
    return Math.min(1, Math.max(0, stage / this.last));
  }
}
