import type { Phase } from '../../contract/types';

const DAYS = /^(\d+)\s+((?:business\s+)?days?)$/i;
/** The phase ids that are the city's clock, in the order we prefer them. */
const CLOCK_IDS = ['review', 'decision'];

/** Turns a timeline phase into ring numbers, or says "no ring" when the value is not a number of days in law. */
export class DeadlineRing {
  readonly number: string | null;
  readonly unit: string | null;

  constructor(readonly phase: Phase) {
    const m = phase.kind === 'LAW' ? DAYS.exec(phase.value.trim()) : null;
    this.number = m?.[1] ?? null;
    this.unit = m?.[2]?.toLowerCase().replace(/^day$/, 'days') ?? null;
  }

  get hasRing(): boolean {
    return this.number !== null;
  }

  /** The value as the source states it, shown in place of the ring when there is none. */
  get text(): string {
    return this.phase.value;
  }

  static pick(phases: Phase[]): DeadlineRing | null {
    for (const id of CLOCK_IDS) {
      const found = phases.find((p) => p.id === id);
      if (found) return new DeadlineRing(found);
    }
    return null;
  }
}
