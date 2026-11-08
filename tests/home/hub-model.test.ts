import { describe, expect, it } from 'vitest';
import { runCheck } from '../../src/contract/api';
import { HubModel, labelSource, type SourceEntry } from '../../src/home/hub/HubModel';
import sourcesRaw from '../../data/sources/index.json';

const sources = sourcesRaw as SourceEntry[];
const run = runCheck('dana-point');
const hub = new HubModel(run, sources);

describe('HubModel', () => {
  it("names six one-line sources in the prototype order: the run's ordinance first, then five from the index", () => {
    expect(hub.feeds.map((f) => f.label)).toEqual([
      'Dana Point Ordinance 22-01',
      'HCD letter, Dana Point',
      'ADU Handbook, 2026',
      'Gov. Code § 66317',
      'HCD letter, Irvine',
      'Anaheim checklist',
    ]);
    const ids = new Set(sources.map((s) => s.id));
    for (const feed of hub.feeds.slice(1)) expect(ids.has(feed.id)).toBe(true);
  });

  it('picks an icon by kind of source', () => {
    expect(hub.feeds.map((f) => f.kind)).toEqual(['city', 'letter', 'book', 'law', 'letter', 'city']);
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
