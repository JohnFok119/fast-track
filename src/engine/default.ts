// The real engine behind the src/contract/api.ts signatures. Data is loaded and validated once, at import time.
// Adding a city means adding its file in data/cities/ and its id to CITIES: no engine code changes.
import anaheimRaw from '../../data/cities/anaheim.json';
import danaPointRaw from '../../data/cities/dana-point.json';
import irvineRaw from '../../data/cities/irvine.json';
import orangeRaw from '../../data/cities/orange.json';
import aduRulesRaw from '../../data/rules/adu.json';
import sb9RulesRaw from '../../data/rules/sb9.json';
import sourcesRaw from '../../data/sources/index.json';
import type { City, CityRun, Flag } from '../contract/types';
import { loadCity, loadRules, loadSources } from './load';
import { runCity, scanText } from './run';
import type { CityInput } from './types';

const SOURCES = loadSources(sourcesRaw);
// One combined list, so rule ids stay unique across files.
const RULES = loadRules({ rules: [...aduRulesRaw.rules, ...sb9RulesRaw.rules] }, SOURCES);
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
