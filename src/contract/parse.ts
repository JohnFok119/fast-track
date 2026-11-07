// Runtime checks for data crossing the contract. Every JSON file (samples, rules output) passes through here,
// so a flag without a source, or an UNKNOWN that claims a rule, fails loudly instead of reaching the screen.
import { CITIES, STATUSES } from './types';
import type { Citation, CitationMapping, CityRun, Clock, Flag } from './types';

type Obj = Record<string, unknown>;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

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
  const v = o[key];
  if (v === undefined) return undefined;
  if (typeof v !== 'string') fail(where, `"${key}" must be a string`);
  return v;
}

function nullableStr(o: Obj, key: string, where: string): string | null {
  const v = o[key];
  if (v !== null && typeof v !== 'string') fail(where, `"${key}" must be a string or null`);
  return v;
}

function date(o: Obj, key: string, where: string): string {
  const v = str(o, key, where);
  if (!DATE.test(v)) fail(where, `"${key}" must be YYYY-MM-DD`);
  return v;
}

function oneOf<T extends string>(o: Obj, key: string, allowed: readonly T[], where: string): T {
  const v = str(o, key, where);
  if (!(allowed as readonly string[]).includes(v)) fail(where, `"${key}" must be one of ${allowed.join(', ')}`);
  return v as T;
}

function list(o: Obj, key: string, where: string): unknown[] {
  const v = o[key];
  if (!Array.isArray(v)) fail(where, `"${key}" must be an array`);
  return v;
}

export function parseCitation(raw: unknown, where: string): Citation {
  const o = obj(raw, where);
  return {
    sourceId: str(o, 'sourceId', where),
    label: str(o, 'label', where),
    url: str(o, 'url', where),
    section: optStr(o, 'section', where),
    page: optStr(o, 'page', where),
    checked: date(o, 'checked', where),
  };
}

function parseMapping(raw: unknown, where: string): CitationMapping {
  const o = obj(raw, where);
  return { old: str(o, 'old', where), now: str(o, 'now', where), exactSection: nullableStr(o, 'exactSection', where) };
}

export function parseFlag(raw: unknown, where: string): Flag {
  const o = obj(raw, where);
  const status = oneOf(o, 'status', STATUSES, where);
  const ruleId = nullableStr(o, 'ruleId', where);
  const citations = list(o, 'citations', where).map((c, i) => parseCitation(c, `${where} citation ${i}`));
  const mapping = o.mapping === undefined ? undefined : parseMapping(o.mapping, `${where} mapping`);
  if (status === 'UNKNOWN' && (ruleId !== null || citations.length > 0)) {
    fail(where, 'an UNKNOWN flag has no rule and no citations');
  }
  if (status !== 'UNKNOWN' && (ruleId === null || citations.length === 0)) {
    fail(where, `a ${status} flag needs a rule and at least one citation`);
  }
  if (status === 'OUTDATED_CITATION' && mapping === undefined) fail(where, 'an OUTDATED_CITATION flag needs a mapping');
  return {
    itemId: str(o, 'itemId', where),
    itemText: str(o, 'itemText', where),
    status,
    ruleId,
    why: optStr(o, 'why', where),
    citations,
    mapping,
    note: optStr(o, 'note', where),
  };
}

export function parseCityRun(raw: unknown): CityRun {
  const o = obj(raw, 'city run');
  const city = oneOf(o, 'city', CITIES, 'city run');
  const where = `${city} run`;
  if (typeof o.sample !== 'boolean') fail(where, '"sample" must be true or false');
  return {
    city,
    sourceLabel: str(o, 'sourceLabel', where),
    sourceUrl: str(o, 'sourceUrl', where),
    saved: date(o, 'saved', where),
    sample: o.sample,
    flags: list(o, 'flags', where).map((f, i) => parseFlag(f, `${where} flag ${i}`)),
  };
}

export function parseClocks(raw: unknown): Clock[] {
  const o = obj(raw, 'clocks file');
  return list(o, 'clocks', 'clocks file').map((c, i) => {
    const where = `clock ${i}`;
    const co = obj(c, where);
    return {
      id: str(co, 'id', where),
      label: str(co, 'label', where),
      value: str(co, 'value', where),
      section: nullableStr(co, 'section', where),
      sourceId: nullableStr(co, 'sourceId', where),
      status: oneOf(co, 'status', ['CONFIRMED', 'UNCONFIRMED'] as const, where),
      checked: date(co, 'checked', where),
      note: optStr(co, 'note', where),
    };
  });
}
