// The functions the UI calls. runCheck and scan run the deterministic engine over the rules in data/rules/ and the
// saved requirements in data/cities/. getClocks reads data/rules/clocks.json. The signatures are fixed.
import clocksRaw from '../../data/rules/clocks.json';
import * as engine from '../engine/default';
import { parseClocks } from './parse';
import type { BuildPath, City, CityRun, Clock, Contact, Flag, Pathway, Phase, Step } from './types';

const CLOCKS: Clock[] = parseClocks(clocksRaw);

export function runCheck(city: City): CityRun {
  return engine.runCheck(city);
}

export function getClocks(): Clock[] {
  return CLOCKS;
}

/** Checks pasted text against the rules. Text is never saved or sent. */
export function scan(text: string): Flag[] {
  return engine.scan(text);
}

/** What the applicant can choose to build, each with one sourced fact. */
export function getPaths(): BuildPath[] {
  return engine.getPaths();
}

/** The idea-to-move-in timeline for a pathway. Every bar says whether it is law, an ASSUMPTION, skipped or unknown. */
export function getTimeline(pathway: Pathway): Phase[] {
  return engine.getTimeline(pathway);
}

/** The event brief's typical path without a fast track (about four years). Every phase is an ASSUMPTION. */
export function getBaseline(): Phase[] {
  return engine.getBaseline();
}

export function getSteps(pathway: Pathway): Step[] {
  return engine.getSteps(pathway);
}

/** Where to ask for help when a city will not fix a requirement. */
export function getEscalation(): Contact {
  return engine.getEscalation();
}
