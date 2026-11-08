// What the hub shows: the sources that flow in and the list that comes out. Names come from
// data/sources/index.json and from a real run, never from typed-in law.
import type { CityRun } from '../../contract/types';

export interface SourceEntry {
  id: string;
  title: string;
  url: string;
  checked: string;
  published: string | null;
}

export type FeedKind = 'city' | 'letter' | 'book' | 'law';

export interface Feed {
  id: string;
  label: string;
  kind: FeedKind;
}

export interface HubOutput {
  label: string;
  status: 'CONFLICTS' | 'UNKNOWN';
}

/** Which sources the hub draws after the run's own ordinance, by id in data/sources/index.json. */
export const HUB_SOURCE_IDS = [
  'hcd-dana-point-2023-04-17',
  'adu-handbook-2026-03',
  'gov-66317',
  'hcd-irvine-2025-03-27',
  'anaheim-adu-checklist-2025-11',
] as const;

const ORDINANCE_IN_LABEL = /((?:[A-Z][a-z]+ )+Ordinance [\d-]+)/;

function titleCase(slug: string): string {
  return slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

/** A short one-line name for a source, from its id and dates. Throws on a kind it cannot label. */
export function labelSource(source: SourceEntry): Feed {
  const { id } = source;
  const letter = /^hcd-(.+?)-\d{4}-\d{2}-\d{2}$/.exec(id);
  if (letter?.[1]) return { id, label: `HCD letter, ${titleCase(letter[1])}`, kind: 'letter' };
  const year = /^\d{4}/.exec(source.published ?? '');
  if (id.startsWith('adu-handbook') && year) return { id, label: `ADU Handbook, ${year[0]}`, kind: 'book' };
  const law = /^gov-(\d+)$/.exec(id);
  if (law?.[1]) return { id, label: `Gov. Code § ${law[1]}`, kind: 'law' };
  const checklist = /^(.+?)-adu-checklist/.exec(id);
  if (checklist?.[1]) return { id, label: `${titleCase(checklist[1])} checklist`, kind: 'city' };
  throw new Error(`[hub] no short label for source "${id}"`);
}

/** The city's own ordinance, named in the run's source label, e.g. "Dana Point Ordinance 22-01". */
function ordinanceFeed(run: CityRun): Feed {
  const hit = ORDINANCE_IN_LABEL.exec(run.sourceLabel);
  if (!hit?.[1]) throw new Error(`[hub] the run for ${run.city} names no ordinance in its source label`);
  return { id: `ordinance-${run.city}`, label: hit[1], kind: 'city' };
}

/** "sb9-dana-point-two-unit-cap" for dana-point becomes "Two unit cap". */
function ruleLabel(ruleId: string, city: string): string {
  const tail = ruleId.split(`${city}-`)[1] ?? ruleId;
  const words = tail.replace(/-/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export class HubModel {
  readonly feeds: Feed[];
  readonly outputs: HubOutput[];

  constructor(run: CityRun, sources: readonly SourceEntry[]) {
    const byId = new Map(sources.map((s) => [s.id, s]));
    const listed = HUB_SOURCE_IDS.map((id) => {
      const source = byId.get(id);
      if (!source) throw new Error(`[hub] source "${id}" is not in data/sources/index.json`);
      return labelSource(source);
    });
    this.feeds = [ordinanceFeed(run), ...listed];
    this.outputs = HubModel.outputsOf(run);
  }

  private static outputsOf(run: CityRun): HubOutput[] {
    const seen = new Set<string>();
    const out: HubOutput[] = [];
    for (const flag of run.flags) {
      if (flag.status !== 'CONFLICTS' || !flag.ruleId || seen.has(flag.ruleId)) continue;
      seen.add(flag.ruleId);
      out.push({ label: ruleLabel(flag.ruleId, run.city), status: 'CONFLICTS' });
    }
    const unknown = run.flags.filter((f) => f.status === 'UNKNOWN').length;
    if (unknown > 0) {
      out.push({ label: `${unknown} ${unknown === 1 ? 'line' : 'lines'} we haven't checked`, status: 'UNKNOWN' });
    }
    return out;
  }
}
