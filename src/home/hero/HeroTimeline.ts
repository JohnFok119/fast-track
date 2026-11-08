// The hero loop as a schedule: the documents land (p1), their clashes light up (p2), they fold into the Fast Track
// tile (p3), the app window grows out of the tile (p4) and its rows are ticked, then the window folds back into the
// tile (p5). 14600 ms after the start the loop begins again from the tile, so there is never an empty stage.
// The class only decides WHEN; a HeroSink (the DOM driver) decides what each event looks like.

export type HeroPhase = 'p1' | 'p2' | 'p3' | 'p4' | 'p5';

export interface HeroSink {
  /** Show one phase of the stage. The previous phase stays until the next one is set. */
  setPhase(phase: HeroPhase): void;
  /** Clear the ticks and hide the cursor, ready for the next round. Leaves the phase alone. */
  reset(): void;
  moveCursor(row: number): void;
  press(down: boolean): void;
  tick(row: number): void;
  hideCursor(): void;
}

export interface Scheduler {
  setTimeout(fn: () => void, ms: number): unknown;
  clearTimeout(handle: unknown): void;
}

export interface HeroTimelineOptions {
  reducedMotion?: boolean;
  scheduler?: Scheduler;
}

/** Milliseconds from the start of a cycle, copied from the approved prototype. */
export const SCHEDULE = {
  p1: 80,
  p2: 1800,
  p3: 3900,
  p4: 4900,
  firstMove: 6500,
  firstTick: 7350,
  rowGap: 1500,
  hideCursor: 11300,
  p5: 13300,
  restart: 14600,
  clickRelease: 160,
} as const;

const globalScheduler: Scheduler = {
  setTimeout: (fn, ms) => globalThis.setTimeout(fn, ms),
  clearTimeout: (handle) => globalThis.clearTimeout(handle as ReturnType<typeof setTimeout>),
};

export class HeroTimeline {
  private readonly scheduler: Scheduler;
  private readonly reducedMotion: boolean;
  private timers: unknown[] = [];
  private running = false;
  private visible = true;
  private waiting = false;

  constructor(
    private readonly sink: HeroSink,
    private readonly rows: number,
    options: HeroTimelineOptions = {},
  ) {
    this.scheduler = options.scheduler ?? globalScheduler;
    this.reducedMotion = options.reducedMotion ?? false;
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    if (this.reducedMotion) {
      this.showEndState();
      return;
    }
    this.cycle();
  }

  stop(): void {
    this.running = false;
    this.waiting = false;
    this.clearTimers();
  }

  /** Off screen, the loop finishes its round and waits; it picks up again as soon as it is seen. */
  setVisible(visible: boolean): void {
    this.visible = visible;
    if (visible && this.waiting && this.running) {
      this.waiting = false;
      this.cycle();
    }
  }

  private showEndState(): void {
    this.sink.setPhase('p4');
    for (let row = 0; row < this.rows; row++) this.sink.tick(row);
  }

  private at(ms: number, fn: () => void): void {
    this.timers.push(this.scheduler.setTimeout(fn, ms));
  }

  private clearTimers(): void {
    this.timers.forEach((handle) => this.scheduler.clearTimeout(handle));
    this.timers = [];
  }

  private cycle(): void {
    this.clearTimers();
    this.sink.reset();
    this.at(SCHEDULE.p1, () => this.sink.setPhase('p1'));
    this.at(SCHEDULE.p2, () => this.sink.setPhase('p2'));
    this.at(SCHEDULE.p3, () => this.sink.setPhase('p3'));
    this.at(SCHEDULE.p4, () => this.sink.setPhase('p4'));
    for (let row = 0; row < this.rows; row++) this.scheduleRow(row);
    this.at(SCHEDULE.hideCursor, () => this.sink.hideCursor());
    this.at(SCHEDULE.p5, () => this.sink.setPhase('p5'));
    this.at(SCHEDULE.restart, () => this.restart());
  }

  private scheduleRow(row: number): void {
    this.at(SCHEDULE.firstMove + row * SCHEDULE.rowGap, () => this.sink.moveCursor(row));
    this.at(SCHEDULE.firstTick + row * SCHEDULE.rowGap, () => {
      this.sink.press(true);
      this.sink.tick(row);
      this.at(SCHEDULE.clickRelease, () => this.sink.press(false));
    });
  }

  private restart(): void {
    if (this.visible) this.cycle();
    else this.waiting = true;
  }
}
