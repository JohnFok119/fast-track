// The pop-up motion: each piece grows from nothing with a small overshoot, starting at its own delay.
// With reduced motion every piece is already standing.

const POP_SECONDS = 0.6;

export class PopTimeline {
  constructor(private readonly delays: readonly number[], private readonly reduce: boolean) {}

  /** Progress 0..1 of piece i at this clock time. */
  progress(i: number, clock: number): number {
    if (this.reduce) return 1;
    return Math.min(1, Math.max(0, (clock - (this.delays[i] ?? 0)) / POP_SECONDS));
  }

  visible(i: number, clock: number): boolean {
    return this.progress(i, clock) > 0;
  }

  /** Scale of piece i: tiny before it starts, overshoots slightly, settles at 1. */
  scale(i: number, clock: number): number {
    const p = this.progress(i, clock);
    if (p >= 1) return 1;
    const c = 1.6;
    const eased = 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2);
    return Math.max(0.0001, eased);
  }

  /** True while any piece is still moving. */
  busy(clock: number): boolean {
    return this.delays.some((_, i) => this.progress(i, clock) < 1);
  }
}
