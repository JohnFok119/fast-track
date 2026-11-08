// Which story step is current. A step becomes current when it crosses a thin reading band on screen; every step
// reached so far stays solid, even when the reader scrolls back up.

export interface StepSighting {
  index: number;
  /** True when the step is inside the reading band. */
  visible: boolean;
}

export class StagePicker {
  current = 0;
  reached = 0;

  constructor(readonly count: number) {}

  /** The reading band as an IntersectionObserver rootMargin. On phones the house is pinned at the top, so the band
   *  sits lower, where the step's text is visible. */
  static rootMargin(phone: boolean): string {
    return phone ? '-70% 0px -29% 0px' : '-45% 0px -45% 0px';
  }

  /** Feeds the steps that entered or left the band. Returns true when the current step changed. */
  see(sightings: readonly StepSighting[]): boolean {
    const before = this.current;
    for (const s of sightings) {
      if (!s.visible || s.index < 0 || s.index >= this.count) continue;
      this.current = s.index;
      this.reached = Math.max(this.reached, s.index);
    }
    return this.current !== before;
  }

  isCurrent(index: number): boolean {
    return index === this.current;
  }

  /** Reached steps stay at full strength. */
  isOn(index: number): boolean {
    return index <= this.reached;
  }
}
