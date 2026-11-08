import { describe, expect, it } from 'vitest';
import { getPaths, runCheck } from '../../../src/contract/api';
import { CITIES } from '../../../src/contract/types';
import { countBy } from '../../../src/ui/model';
import { PageState } from '../../../src/ui/page/PageState';

const RUNS = CITIES.map((c) => runCheck(c));
const PATHS = getPaths();
const fresh = () => PageState.initial(RUNS, PATHS);

describe('PageState', () => {
  it('starts on the first path with its first city, nothing filtered or picked, letter shut', () => {
    const s = fresh();
    expect(s.pathId).toBe(PATHS[0]?.id);
    expect(s.run?.pathway).toBe(PATHS[0]?.pathway);
    expect(s.filter).toBeNull();
    expect(s.letterOpen).toBe(false);
    expect(s.items.length).toBeGreaterThan(0);
  });

  it('switching city loads that city run and clears the filter and the pick', () => {
    const base = fresh();
    const other = RUNS.find((r) => r.pathway === base.pathway && r.city !== base.city);
    if (!other) throw new Error('test data needs two cities on one path');
    const s = base.setFilter('OK').select('x').chooseCity(other.city);
    expect(s.city).toBe(other.city);
    expect(s.run).toBe(other);
    expect(s.filter).toBeNull();
    expect(s.selected).toBeNull();
    expect(new Set(s.items.map((it) => it.itemId))).toEqual(new Set(other.flags.map((f) => f.itemId)));
  });

  it('filtering by status keeps only the lines with that status; the same status again clears it', () => {
    const s = fresh().setFilter('CONFLICTS');
    expect(s.shown.length).toBe(countBy(s.items, 'CONFLICTS'));
    expect(s.shown.every((it) => it.statuses.includes('CONFLICTS'))).toBe(true);
    expect(s.setFilter('CONFLICTS').filter).toBeNull();
    expect(s.setFilter('CONFLICTS').shown.length).toBe(s.items.length);
  });

  it('shows the picked line, else the first that needs attention, else the first shown', () => {
    const s = fresh();
    const attention = s.items.find((it) => it.needsAttention);
    expect(s.current?.itemId).toBe(attention?.itemId ?? s.items[0]?.itemId);
    const last = s.items[s.items.length - 1];
    if (!last) throw new Error('no items');
    expect(s.select(last.itemId).current?.itemId).toBe(last.itemId);
  });

  it('choosing a path whose list lacks the current city moves to a city that has one', () => {
    let s = fresh();
    for (const p of PATHS) {
      s = s.choosePath(p.id);
      expect(s.run?.pathway).toBe(p.pathway);
      expect(s.filter).toBeNull();
    }
  });

  it('opens and shuts the letter sheet', () => {
    const s = fresh().openLetter();
    expect(s.letterOpen).toBe(true);
    expect(s.closeLetter().letterOpen).toBe(false);
  });

  it('counts the lines to push back on', () => {
    const s = fresh();
    expect(s.attention).toBe(s.items.filter((it) => it.needsAttention).length);
  });

  it('never mutates the state it was called on', () => {
    const s = fresh();
    s.setFilter('OK').openLetter().select('zz');
    expect(s.filter).toBeNull();
    expect(s.letterOpen).toBe(false);
    expect(s.selected).toBeNull();
  });
});
