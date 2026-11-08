// The real engine behind the src/contract/api.ts signatures. Data is loaded and validated once, at import time.
// Adding a city means adding its file in data/cities/ and its id to CITIES: no engine code changes.
import anaheimRaw from '../../data/cities/anaheim.json';
import danaPointRaw from '../../data/cities/dana-point.json';
import irvineRaw from '../../data/cities/irvine.json';
import orangeRaw from '../../data/cities/orange.json';
import aduRulesRaw from '../../data/rules/adu.json';
import fasterRaw from '../../data/rules/faster.json';
import pathsRaw from '../../data/rules/paths.json';
import sb9RulesRaw from '../../data/rules/sb9.json';
import sourcesRaw from '../../data/sources/index.json';
import type { BuildPath, City, CityRun, Contact, FasterPath, Flag, Pathway, Phase, Step } from '../contract/types';
import { loadFasterPaths } from './faster';
import { loadCity, loadRules, loadSources } from './load';
import { loadPaths } from './paths';
import { runCity, scanText } from './run';
import type { CityInput } from './types';

const SOURCES = loadSources(sourcesRaw);
// One combined list, so rule ids stay unique across files.
const RULES = loadRules({ rules: [...aduRulesRaw.rules, ...sb9RulesRaw.rules] }, SOURCES);
const PATHS = loadPaths(pathsRaw, SOURCES);
const FASTER = loadFasterPaths(fasterRaw, SOURCES);
const CITY_INPUTS: Record<City, CityInput> = {
  irvine: loadCity(irvineRaw),
  anaheim: loadCity(anaheimRaw),
  'dana-point': loadCity(danaPointRaw),
  orange: loadCity(orangeRaw),
};

export function runCheck(city: City): CityRun {
  return runCity(CITY_INPUTS[city], RULES, SOURCES);
}

export function scan(text: string): Flag[] {
  return scanText(text, RULES, SOURCES);
}

export function getPaths(): BuildPath[] {
  return PATHS.paths;
}

export function getTimeline(pathway: Pathway): Phase[] {
  return PATHS.timeline[pathway];
}

export function getBaseline(): Phase[] {
  return PATHS.baseline;
}

export function getSteps(pathway: Pathway): Step[] {
  return PATHS.steps[pathway];
}

export function getEscalation(): Contact {
  return PATHS.escalation;
}

export function getFasterPaths(pathway: Pathway): FasterPath[] {
  return FASTER[pathway];
}
