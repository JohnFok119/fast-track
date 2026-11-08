// Loads data/rules/faster.json: sourced ways to save time on each pathway. "No source, no path": an entry without
// a source, with an unknown pathway, or UNCONFIRMED without a caveat fails loudly at load time.
import { PATHWAYS } from '../contract/types';
import type { FasterPath, Pathway } from '../contract/types';
import { citeSource, type SourceRef } from './cite';
import type { Source } from './types';

type Obj = Record<string, unknown>;
const STATUSES = ['CONFIRMED', 'UNCONFIRMED'] as const;

function fail(where: string, message: string): never {
  throw new Error(`Invalid ${where}: ${message}`);
}

function obj(value: unknown, where: string): Obj {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) fail(where, 'expected an object');
  return value as Obj;
}

function text(o: Obj, key: string, where: string): string {
  const v = o[key];
  if (typeof v !== 'string' || v.trim().length === 0) fail(where, `"${key}" must be a non-empty string`);
  return v;
}

function pathways(o: Obj, where: string): Pathway[] {
  const v = o.pathways;
  if (!Array.isArray(v) || v.length === 0) fail(where, '"pathways" must be a non-empty array');
  for (const p of v) if (!(PATHWAYS as readonly unknown[]).includes(p)) fail(where, `unknown pathway "${String(p)}"`);
  return v as Pathway[];
}

function sourceRef(raw: unknown, where: string): SourceRef {
  const o = obj(raw, where);
  const opt = (k: string) => (o[k] === undefined ? undefined : text(o, k, where));
  return { sourceId: text(o, 'sourceId', where), section: opt('section'), page: opt('page') };
}

function readPath(raw: unknown, i: number, sources: Map<string, Source>): FasterPath & { pathways: Pathway[] } {
  const where = `faster path ${i}`;
  const o = obj(raw, where);
  const status = text(o, 'status', where);
  if (!(STATUSES as readonly string[]).includes(status)) fail(where, `"status" must be one of ${STATUSES.join(', ')}`);
  const caveat = o.caveat === undefined ? undefined : text(o, 'caveat', where);
  if (status === 'UNCONFIRMED' && !caveat) fail(where, 'an UNCONFIRMED path must say what is not checked ("caveat")');
  const refs = o.sources;
  if (!Array.isArray(refs) || refs.length === 0) fail(where, 'no source, no path: "sources" must list at least one');
  return {
    id: text(o, 'id', where),
    pathways: pathways(o, where),
    title: text(o, 'title', where),
    text: text(o, 'text', where),
    status: status as FasterPath['status'],
    caveat,
    citations: refs.map((r, k) => citeSource(sources, sourceRef(r, `${where} source ${k}`))),
  };
}

export function loadFasterPaths(raw: unknown, sources: Map<string, Source>): Record<Pathway, FasterPath[]> {
  const list = obj(raw, 'faster paths file').paths;
  if (!Array.isArray(list)) fail('faster paths file', '"paths" must be an array');
  const all = list.map((p, i) => readPath(p, i, sources));
  const ids = new Set<string>();
  for (const p of all) {
    if (ids.has(p.id)) fail('faster paths file', `duplicate id "${p.id}"`);
    ids.add(p.id);
  }
  const out = {} as Record<Pathway, FasterPath[]>;
  const public_ = (p: (typeof all)[number]): FasterPath => ({ id: p.id, title: p.title, text: p.text, status: p.status, caveat: p.caveat, citations: p.citations });
  for (const pw of PATHWAYS) out[pw] = all.filter((p) => p.pathways.includes(pw)).map(public_);
  return out;
}
