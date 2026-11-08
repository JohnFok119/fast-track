import { describe, expect, it } from 'vitest';
import { runCheck } from '../../src/contract/api';
import { OpenRows } from '../../src/home/showcase/OpenRows';
import { ShowcaseModel } from '../../src/home/showcase/ShowcaseModel';

const run = runCheck('dana-point');
const model = new ShowcaseModel(run);

describe('ShowcaseModel', () => {
  it('counts conflicts and unknowns from the run', () => {
    expect(model.conflictCount).toBe(run.flags.filter((f) => f.status === 'CONFLICTS').length);
    expect(model.unknown).toHaveLength(run.flags.filter((f) => f.status === 'UNKNOWN').length);
  });

  it('shows one row per finding, so a duplex line and a lot-split line with the same finding become one row', () => {
    const rules = new Set(run.flags.filter((f) => f.status === 'CONFLICTS').map((f) => f.ruleId));
    expect(model.rows).toHaveLength(rules.size);
    expect(model.rows.length).toBeLessThan(model.conflictCount);
    expect(model.rows.find((r) => r.id === 'dp-05')?.lines).toBe(2);
  });

  it('splits the section off the city quote and keeps the page and date of the source', () => {
    const row = model.rows.find((r) => r.id === 'dp-05');
    expect(row?.cityQuote).toMatch(/^"For all Single Family Residential Duplexes/);
    expect(row?.cityQuote).not.toMatch(/Sec\./);
    expect(row?.section).toBe('Sec. 9.72.004 (I); Sec 7.37.004 (K)');
    expect(row?.page).toBe('p. 4');
    expect(row?.sourceName).toBe('HCD letter to the City of Dana Point, 2023-04-17');
    expect(row?.checked).toBe('2026-11-07');
    expect(row?.sourceUrl).toMatch(/^https:\/\/www\.hcd\.ca\.gov\//);
  });

  it('marks the sentence where HCD says what the city must do', () => {
    const row = model.rows.find((r) => r.id === 'dp-05');
    expect(row?.hcdParts.mark).toBe('The City must remove these requirements.');
    const { before, mark, after } = row!.hcdParts;
    expect(before + mark + after).toBe(row!.hcdQuote);
  });

  it('writes pages as p. or pp.', () => {
    expect(model.rows.find((r) => r.id === 'dp-04')?.page).toBe('pp. 3, 4');
  });

  it('describes the source of the whole list from the run', () => {
    expect(model.title).toBe(`${model.conflictCount} lines the state says Dana Point can't require`);
    expect(model.sourceNote).toBe(run.sourceLabel);
    expect(model.sidebarSource).toBe(
      'HCD letter to the City of Dana Point, 2023-04-17, pp. 2, 3, 4. Checked 2026-11-07.',
    );
  });
});

describe('OpenRows', () => {
  it('starts with the chosen rows open and toggles one without touching the others', () => {
    const open = new OpenRows(['a']);
    const next = open.toggle('b');
    expect(next.isOpen('a')).toBe(true);
    expect(next.isOpen('b')).toBe(true);
    const closed = next.toggle('a');
    expect(closed.isOpen('a')).toBe(false);
    expect(closed.isOpen('b')).toBe(true);
  });

  it('never changes the object it was called on', () => {
    const open = new OpenRows([]);
    open.toggle('a');
    expect(open.isOpen('a')).toBe(false);
  });
});
