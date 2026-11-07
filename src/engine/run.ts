import { parseCityRun } from '../contract/parse';
import { CITIES } from '../contract/types';
import type { Citation, City, CityRun, Flag, Status } from '../contract/types';
import { citeSource } from './cite';
import { matchesRule } from './match';
import type { CityInput, CityItem, Rule, Source } from './types';

const ORDER: Status[] = ['CONFLICTS', 'OUTDATED_CITATION', 'OK'];

function buildCitations(rule: Rule, sources: Map<string, Source>): Citation[] {
  return rule.cites.map((cite) => {
    const source = sources.get(cite.sourceId);
    if (!source) throw new Error(`no source, no rule: rule "${rule.id}" cites missing source "${cite.sourceId}"`);
    // Honest labelling: statute text read only through a mirror or HCD's quotes says so until checked on leginfo.
    const label = source.mirror ? `${cite.label} (not yet checked on leginfo)` : cite.label;
    return { sourceId: cite.sourceId, label, url: source.url, section: cite.section, page: cite.page, checked: source.checked };
  });
}

function toFlag(item: CityItem, rule: Rule, sources: Map<string, Source>): Flag {
  return {
    itemId: item.itemId,
    itemText: item.text,
    status: rule.status,
    ruleId: rule.id,
    why: rule.why,
    citations: buildCitations(rule, sources),
    mapping: rule.kind === 'citation' ? { ...rule.mapping } : undefined,
    note: rule.note,
  };
}

/** A city-scoped rule applies only to its cities; with no city (pasted text), scoped rules never apply. */
function inScope(rule: Rule, city: string | undefined): boolean {
  return rule.cities === undefined || (city !== undefined && rule.cities.includes(city));
}

export function checkItem(item: CityItem, rules: Rule[], sources: Map<string, Source>, city?: string): Flag[] {
  const hits = rules.filter((rule) => inScope(rule, city) && matchesRule(item.text, rule));
  if (hits.length === 0) {
    return [{ itemId: item.itemId, itemText: item.text, status: 'UNKNOWN', ruleId: null, citations: [] }];
  }
  hits.sort((a, b) => ORDER.indexOf(a.status) - ORDER.indexOf(b.status));
  return hits.map((rule) => toFlag(item, rule, sources));
}

export function runCity(city: CityInput, rules: Rule[], sources: Map<string, Source>): CityRun {
  if (!(CITIES as readonly string[]).includes(city.city)) throw new Error(`Unknown city "${city.city}"`);
  const run = {
    city: city.city as City,
    name: city.name,
    pathway: city.pathway,
    contacts: city.contacts.map((c) => ({ office: c.office, handles: c.handles, citation: citeSource(sources, c.ref) })),
    sourceLabel: city.sourceLabel,
    sourceUrl: city.sourceUrl,
    saved: city.saved,
    sample: false,
    flags: city.items.flatMap((item) => checkItem(item, rules, sources, city.city)),
  };
  return parseCityRun(run);
}

export function scanText(text: string, rules: Rule[], sources: Map<string, Source>): Flag[] {
  const pieces = text
    .split(/\n|(?<=[.;])\s+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);
  return pieces
    .flatMap((piece, i) => checkItem({ itemId: `scan-${i + 1}`, text: piece }, rules, sources))
    .filter((flag) => flag.status !== 'UNKNOWN');
}
