// The functions the UI calls. runCheck and scan run the deterministic engine over the rules in data/rules/ and the
// saved requirements in data/cities/. getClocks reads data/rules/clocks.json. The signatures are fixed.
import clocksRaw from '../../data/rules/clocks.json';
import { runCheck as engineRunCheck, scan as engineScan } from '../engine/default';
import { parseClocks } from './parse';
import type { City, CityRun, Clock, Flag } from './types';

const CLOCKS: Clock[] = parseClocks(clocksRaw);

export function runCheck(city: City): CityRun {
  return engineRunCheck(city);
}

export function getClocks(): Clock[] {
  return CLOCKS;
}

/** Checks pasted text against the rules. Text is never saved or sent. */
export function scan(text: string): Flag[] {
  return engineScan(text);
}
