// The reading animation as a schedule. The city's lines are read one by one; on a line with a clash, the state side
// turns to HCD's words for it and the clash lights up a moment later. The class only says what shows at a given
// time; the view asks it with the time elapsed, so the same frames come back in a test.

/** Milliseconds: a plain line, a line that looks something up, when a lookup finds it, when a plain line gets its
 * verdict, and the pause after the last line. */
export const SCAN_MS = { line: 700, look: 1500, find: 1000, verdict: 420, end: 700 } as const;

export interface ScanLine {
  look: number | null;
  pair: number | null;
}

export interface ScanFrame {
  /** The line being read, or null once all are read. */
  line: number | null;
  /** The state block in view, or null before the first lookup. */
  block: number | null;
  /** How many lines have their verdict. */
  read: number;
  /** The clashes found so far, by number. */
  found: number[];
  done: boolean;
}

interface Slot {
  start: number;
  end: number;
  verdict: number;
  look: number | null;
  pair: number | null;
}

export class ReadScan {
  readonly total: number;
  private readonly slots: Slot[];

  constructor(lines: ScanLine[]) {
    let at = 0;
    this.slots = lines.map((l) => {
      const looks = l.look !== null;
      const slot = { start: at, end: at + (looks ? SCAN_MS.look : SCAN_MS.line), verdict: at + (looks ? SCAN_MS.find : SCAN_MS.verdict), look: l.look, pair: l.pair };
      at = slot.end;
      return slot;
    });
    this.total = at + SCAN_MS.end;
  }

  at(ms: number): ScanFrame {
    const done = ms >= this.total;
    const current = this.slots.findIndex((s) => ms >= s.start && ms < s.end);
    const looked = this.slots.filter((s) => s.look !== null && s.start <= ms);
    const read = this.slots.filter((s) => s.verdict <= ms);
    const found = [...new Set(read.flatMap((s) => (s.pair === null ? [] : [s.pair])))];
    return { line: current < 0 ? null : current, block: looked.at(-1)?.look ?? null, read: read.length, found, done };
  }

  /** The last frame, for a visitor who skips the reading or asked for less motion. */
  get end(): ScanFrame {
    return this.at(this.total);
  }
}
