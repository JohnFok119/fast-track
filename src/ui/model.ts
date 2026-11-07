// View helpers over the contract. No law lives here: verdict words come from src/letter/verdict.ts, flags from the engine.
import type { Citation, CityRun, Flag, Status } from '../contract/types';

export interface Item {
  itemId: string;
  text: string;
  flags: Flag[];
  statuses: Status[];
  /** The most pressing status, for color: CONFLICTS, then OUTDATED_CITATION, then OK, then UNKNOWN. */
  worst: Status;
  needsAttention: boolean;
}

const RANK: Status[] = ['CONFLICTS', 'OUTDATED_CITATION', 'OK', 'UNKNOWN'];

export function groupItems(run: CityRun): Item[] {
  const byId = new Map<string, Flag[]>();
  for (const flag of run.flags) byId.set(flag.itemId, [...(byId.get(flag.itemId) ?? []), flag]);
  return [...byId.entries()].map(([itemId, flags]) => {
    const statuses = [...new Set(flags.map((f) => f.status))];
    const worst = RANK.find((s) => statuses.includes(s)) ?? 'UNKNOWN';
    return {
      itemId,
      text: flags[0]?.itemText ?? '',
      flags,
      statuses,
      worst,
      needsAttention: statuses.includes('CONFLICTS') || statuses.includes('OUTDATED_CITATION'),
    };
  });
}

export function countBy(items: Item[], status: Status): number {
  return items.filter((it) => it.statuses.includes(status)).length;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function day(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${MONTHS[(m ?? 1) - 1]} ${d}, ${y}`;
}

export function citeMeta(c: Citation): string {
  return [c.page ? `Page ${c.page}` : null, c.section ? `Section ${c.section}` : null, `Checked ${day(c.checked)}`]
    .filter(Boolean)
    .join(' · ');
}
