// Loads data/rules/paths.json: build choices, timelines, steps and the escalation contact, with sources resolved.
import { PATHWAYS } from '../contract/types';
import type { BuildPath, Contact, Pathway, Phase, Step } from '../contract/types';
import { parseBuildPath, parseContact, parsePhase, parseStep } from '../contract/parse';
import { citeSource, type SourceRef } from './cite';
import type { Source } from './types';

type Obj = Record<string, unknown>;

export interface PathsData {
  paths: BuildPath[];
  timeline: Record<Pathway, Phase[]>;
  /** The event brief's typical path without a fast track. Every phase is an ASSUMPTION. */
  baseline: Phase[];
  steps: Record<Pathway, Step[]>;
  escalation: Contact;
}

function asObj(value: unknown, where: string): Obj {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) throw new Error(`Invalid ${where}: expected an object`);
  return value as Obj;
}

function asList(value: unknown, where: string): Obj[] {
  if (!Array.isArray(value)) throw new Error(`Invalid ${where}: expected an array`);
  return value.map((v, i) => asObj(v, `${where} ${i}`));
}

/** Replaces sourceId/section/page with a resolved citation, when the entry has a sourceId. */
function withCitation(o: Obj, sources: Map<string, Source>): Obj {
  if (o.sourceId === undefined) return o;
  const { sourceId, section, page, ...rest } = o;
  const ref: SourceRef = { sourceId: String(sourceId), section: section as string | undefined, page: page as string | undefined };
  return { ...rest, citation: citeSource(sources, ref) };
}

function perPathway<T>(raw: unknown, where: string, read: (o: Obj, w: string) => T): Record<Pathway, T[]> {
  const o = asObj(raw, where);
  const out = {} as Record<Pathway, T[]>;
  for (const p of PATHWAYS) out[p] = asList(o[p], `${where} ${p}`).map((e, i) => read(e, `${where} ${p} ${i}`));
  return out;
}

export function loadPaths(raw: unknown, sources: Map<string, Source>): PathsData {
  const o = asObj(raw, 'paths file');
  return {
    paths: asList(o.paths, 'path').map((p, i) => parseBuildPath(withCitation(p, sources), `path ${i}`)),
    timeline: perPathway(o.timeline, 'timeline', (e, w) => parsePhase(withCitation(e, sources), w)),
    baseline: asList(o.baseline, 'baseline').map((e, i) => parsePhase(withCitation(e, sources), `baseline ${i}`)),
    steps: perPathway(o.steps, 'steps', (e, w) => parseStep(withCitation(e, sources), w)),
    escalation: parseContact(withCitation(asObj(o.escalation, 'escalation'), sources), 'escalation'),
  };
}
