// The functions the UI calls. Until the engine lands, runCheck returns the labelled SAMPLE runs in data/samples/,
// and scan finds the old section numbers that appear in them. getClocks reads data/rules/clocks.json. The
// signatures are fixed: the engine replaces the bodies, not the shapes.
import anaheimRaw from '../../data/samples/anaheim-run.json';
import clocksRaw from '../../data/rules/clocks.json';
import irvineRaw from '../../data/samples/irvine-run.json';
import { parseCityRun, parseClocks } from './parse';
import type { City, CityRun, Clock, Flag } from './types';

const SAMPLE_RUNS: Record<City, CityRun> = {
  irvine: parseCityRun(irvineRaw),
  anaheim: parseCityRun(anaheimRaw),
};
const SAMPLE_CLOCKS: Clock[] = parseClocks(clocksRaw);

export function runCheck(city: City): CityRun {
  return SAMPLE_RUNS[city];
}

export function getClocks(): Clock[] {
  return SAMPLE_CLOCKS;
}

/** Finds old ADU section numbers in pasted text. Text is never saved or sent. */
export function scan(text: string): Flag[] {
  const known = new Map<string, Flag>();
  for (const flag of Object.values(SAMPLE_RUNS).flatMap((run) => run.flags)) {
    if (flag.mapping && !known.has(flag.mapping.old)) known.set(flag.mapping.old, flag);
  }
  const found: Flag[] = [];
  for (const [old, template] of known) {
    // "65852.2" must not match inside "65852.22", so no digit may follow the number.
    const pattern = new RegExp(`(?<![\\d.])${old.replace(/\./g, '\\.')}(?!\\d)`, 'g');
    for (const match of text.matchAll(pattern)) {
      const start = Math.max(0, match.index - 60);
      const snippet = text.slice(start, match.index + old.length + 60).trim();
      found.push({ ...template, itemId: `scan-${found.length + 1}`, itemText: snippet, note: undefined });
    }
  }
  return found;
}
