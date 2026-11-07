// Validates the JSON data files. Browser-safe: JSON arrives as `unknown`, nothing here reads the disk.
import { CITIES } from '../contract/types';
import type { CitationMapping, Status } from '../contract/types';
import type { Cite, CityInput, CityItem, Rule, Source } from './types';

type Obj = Record<string, unknown>;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const RULE_STATUSES: readonly string[] = ['OK', 'CONFLICTS', 'OUTDATED_CITATION'];

function fail(where: string, message: string): never {
  throw new Error(`Invalid ${where}: ${message}`);
}

function obj(value: unknown, where: string): Obj {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) fail(where, 'expected an object');
  return value as Obj;
}

function str(o: Obj, key: string, where: string): string {
  const v = o[key];
  if (typeof v !== 'string' || v.length === 0) fail(where, `"${key}" must be a non-empty string`);
  return v;
}

function optStr(o: Obj, key: string, where: string): string | undefined {
  return o[key] === undefined ? undefined : str(o, key, where);
}

function arr(o: Obj, key: string, where: string): unknown[] {
  const v = o[key];
  if (!Array.isArray(v)) fail(where, `"${key}" must be an array`);
  return v;
}

function dateStr(o: Obj, key: string, where: string): string {
  const v = str(o, key, where);
  if (!DATE.test(v)) fail(where, `"${key}" must be YYYY-MM-DD`);
  return v;
}

export function loadSources(raw: unknown): Map<string, Source> {
  if (!Array.isArray(raw)) fail('sources', 'expected an array');
  const sources = new Map<string, Source>();
  raw.forEach((entry: unknown, i) => {
    const where = `source ${i}`;
    const o = obj(entry, where);
    if (typeof o.mirror !== 'boolean') fail(where, '"mirror" must be true or false');
    const source: Source = {
      id: str(o, 'id', where),
      title: str(o, 'title', where),
      url: str(o, 'url', where),
      checked: dateStr(o, 'checked', where),
      mirror: o.mirror,
    };
    if (sources.has(source.id)) fail(where, `duplicate source id "${source.id}"`);
    sources.set(source.id, source);
  });
  return sources;
}

function regex(pattern: unknown, where: string): RegExp {
  if (typeof pattern !== 'string' || pattern.length === 0) fail(where, 'pattern must be a non-empty string');
  try {
    return new RegExp(pattern, 'i');
  } catch (error) {
    console.error(`Bad regex in ${where}: ${pattern}`, error);
    return fail(where, `invalid regex "${pattern}"`);
  }
}

function patterns(o: Obj, key: string, where: string, required: boolean): RegExp[] {
  if (o[key] === undefined && !required) return [];
  const list = arr(o, key, where);
  if (required && list.length === 0) fail(where, `"${key}" must not be empty`);
  return list.map((p, i) => regex(p, `${where} ${key}[${i}]`));
}

function loadCites(o: Obj, where: string, sources: Map<string, Source>): Cite[] {
  const list = arr(o, 'cites', where);
  if (list.length === 0) fail(where, '"cites" must not be empty');
  return list.map((entry, i) => {
    const cWhere = `${where} cite ${i}`;
    const c = obj(entry, cWhere);
    const sourceId = str(c, 'sourceId', cWhere);
    if (!sources.has(sourceId)) fail(cWhere, `no source, no rule: source "${sourceId}" is not in the sources file`);
    return { sourceId, label: str(c, 'label', cWhere), section: optStr(c, 'section', cWhere), page: optStr(c, 'page', cWhere) };
  });
}

function loadMapping(o: Obj, where: string): CitationMapping {
  const c = obj(o.citation, `${where} citation`);
  const exact = c.exactSection;
  if (exact !== null && typeof exact !== 'string') fail(where, '"exactSection" must be a string or null');
  return { old: str(c, 'old', where), now: str(c, 'now', where), exactSection: exact };
}

/** Optional city scope: a finding HCD made in a letter to one city applies only to that city. */
function loadCityScope(o: Obj, where: string): string[] | undefined {
  if (o.cities === undefined) return undefined;
  const list = arr(o, 'cities', where);
  if (list.length === 0) fail(where, '"cities" must not be empty when present');
  return list.map((c, i) => {
    if (typeof c !== 'string' || !(CITIES as readonly string[]).includes(c)) {
      fail(where, `"cities[${i}]" must be one of ${CITIES.join(', ')}`);
    }
    return c;
  });
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function loadRule(entry: unknown, i: number, sources: Map<string, Source>): Rule {
  const o = obj(entry, `rule ${i}`);
  const id = str(o, 'id', `rule ${i}`);
  const where = `rule "${id}"`;
  const status = str(o, 'status', where);
  if (!RULE_STATUSES.includes(status)) fail(where, `"status" must be one of ${RULE_STATUSES.join(', ')}`);
  const base = {
    id,
    status: status as Exclude<Status, 'UNKNOWN'>,
    why: str(o, 'why', where),
    note: optStr(o, 'note', where),
    cites: loadCites(o, where, sources),
    cities: loadCityScope(o, where),
  };
  if (o.citation !== undefined) {
    const mapping = loadMapping(o, where);
    const oldPattern = new RegExp(`(?<![\\d.])${escapeRegex(mapping.old)}(?!\\d)`);
    return { ...base, kind: 'citation', mapping, oldPattern };
  }
  const m = obj(o.match, `${where} match`);
  return {
    ...base,
    kind: 'match',
    allOf: patterns(m, 'allOf', `${where} match`, true),
    anyOf: patterns(m, 'anyOf', `${where} match`, false),
    noneOf: patterns(m, 'noneOf', `${where} match`, false),
  };
}

export function loadRules(raw: unknown, sources: Map<string, Source>): Rule[] {
  const rules = arr(obj(raw, 'rules file'), 'rules', 'rules file').map((e, i) => loadRule(e, i, sources));
  const seen = new Set<string>();
  for (const rule of rules) {
    if (seen.has(rule.id)) fail('rules file', `duplicate rule id "${rule.id}"`);
    seen.add(rule.id);
  }
  return rules;
}

export function loadCity(raw: unknown): CityInput {
  const o = obj(raw, 'city file');
  const items: CityItem[] = arr(o, 'items', 'city file').map((entry, i) => {
    const where = `city item ${i}`;
    const item = obj(entry, where);
    return { itemId: str(item, 'itemId', where), text: str(item, 'text', where), page: optStr(item, 'page', where) };
  });
  return {
    city: str(o, 'city', 'city file'),
    name: str(o, 'name', 'city file'),
    sourceLabel: str(o, 'sourceLabel', 'city file'),
    sourceUrl: str(o, 'sourceUrl', 'city file'),
    saved: dateStr(o, 'saved', 'city file'),
    items,
  };
}
