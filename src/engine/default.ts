// The real engine behind the src/contract/api.ts signatures. Data is loaded and validated once, at import time.
import anaheimRaw from '../../data/cities/anaheim.json';
import irvineRaw from '../../data/cities/irvine.json';
import rulesRaw from '../../data/rules/adu.json';
import sourcesRaw from '../../data/sources/index.json';
import type { City, CityRun, Flag } from '../contract/types';
import { loadCity, loadRules, loadSources } from './load';
import { runCity, scanText } from './run';

const SOURCES = loadSources(sourcesRaw);
const RULES = loadRules(rulesRaw, SOURCES);
const CITY_INPUTS = { irvine: loadCity(irvineRaw), anaheim: loadCity(anaheimRaw) };

export function runCheck(city: City): CityRun {
  return runCity(CITY_INPUTS[city], RULES, SOURCES);
}

export function scan(text: string): Flag[] {
  return scanText(text, RULES, SOURCES);
}
