import { describe, expect, it } from 'vitest';
import { runCheck } from '../../src/contract/api';
import { HubModel, labelSource, type SourceEntry } from '../../src/home/hub/HubModel';
import sourcesRaw from '../../data/sources/index.json';

const sources = sourcesRaw as SourceEntry[];
const run = runCheck('dana-point');
const hub = new HubModel(run, sources);

describe('HubModel', () => {
  it("names only the documents behind this run: the city's ordinance, then each source its results cite", () => {
    expect(hub.feeds.map((f) => f.label)).toEqual(['Dana Point Ordinance 22-01', 'HCD letter, Dana Point', 'ADU Handbook, 2026']);
    const cited = new Set(run.flags.flatMap((f) => f.citations.map((c) => c.sourceId)));
    for (const feed of hub.feeds.slice(1)) expect(cited.has(feed.id)).toBe(true);
    expect(hub.feeds.map((f) => f.label).join(' ')).not.toMatch(/Irvine|Anaheim|Orange/);
  });

  it("splits the documents into the city's side and the state's side", () => {
    expect(hub.sides.city.map((f) => f.label)).toEqual(['Dana Point Ordinance 22-01']);
    expect(hub.sides.state.map((f) => f.label)).toEqual(['HCD letter, Dana Point', 'ADU Handbook, 2026']);
  });

  it('picks an icon by kind of source', () => {
    expect(hub.feeds.map((f) => f.kind)).toEqual(['city', 'letter', 'book']);
  });

  it('throws when the run cites a source the index does not list', () => {
    expect(() => new HubModel(run, sources.filter((s) => s.id !== 'adu-handbook-2026-03'))).toThrow(/adu-handbook-2026-03/);
  });

  it('throws on a source kind it cannot label, and on a run that names no ordinance', () => {
    const odd = { id: 'irvine-adu-current', title: 'x', url: '', checked: '', published: null };
    expect(() => labelSource(odd)).toThrow(/irvine-adu-current/);
    expect(() => new HubModel({ ...run, sourceLabel: 'no such thing named here' }, sources)).toThrow(/ordinance/i);
  });

  it('lists one output per finding, then the lines not checked', () => {
    const conflicts = hub.outputs.filter((o) => o.status === 'CONFLICTS');
    const rules = new Set(run.flags.filter((f) => f.status === 'CONFLICTS').map((f) => f.ruleId));
    expect(conflicts).toHaveLength(rules.size);
    expect(conflicts.map((o) => o.label)).toContain('One story');
    const last = hub.outputs[hub.outputs.length - 1];
    const unknown = run.flags.filter((f) => f.status === 'UNKNOWN').length;
    expect(last).toEqual({ label: `${unknown} lines we haven't checked`, status: 'UNKNOWN' });
  });

  it('uses the singular for one unchecked line', () => {
    const one = { ...run, flags: run.flags.filter((f) => f.status !== 'UNKNOWN').concat(run.flags.filter((f) => f.status === 'UNKNOWN').slice(0, 1)) };
    const model = new HubModel(one, sources);
    expect(model.outputs[model.outputs.length - 1]?.label).toBe("1 line we haven't checked");
  });
});
