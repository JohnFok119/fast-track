import { describe, expect, it } from 'vitest';
import { runCheck } from '../../../src/contract/api';
import type { City } from '../../../src/contract/types';
import { VERDICT } from '../../../src/letter/verdict';
import { groupItems } from '../../../src/ui/model';
import { ClashList } from '../../../src/ui/results/ClashList';

const listFor = (city: City) => {
  const run = runCheck(city);
  return { run, list: new ClashList(groupItems(run)) };
};

describe('ClashList order and counts', () => {
  it('puts the lines the state says no to first, then the rest, keeping the city order inside each group', () => {
    const { list } = listFor('dana-point');
    expect(list.lines.map((l) => l.id)).toEqual(['dp-01', 'dp-04', 'dp-05', 'dp-06', 'dp-07', 'dp-08', 'dp-02', 'dp-03', 'dp-09']);
    expect(list.lines.map((l) => l.chip)).toEqual([...Array(6).fill('State says no'), ...Array(3).fill('Not checked')]);
  });

  it('counts each line once, by its most pressing status, so the counts add up to the lines read', () => {
    const { run, list } = listFor('dana-point');
    expect(list.total).toBe(new Set(run.flags.map((f) => f.itemId)).size);
    expect(list.tally).toEqual([
      { status: 'CONFLICTS', label: VERDICT.CONFLICTS.chip, n: 6 },
      { status: 'UNKNOWN', label: VERDICT.UNKNOWN.chip, n: 3 },
    ]);
  });

  it('says in the heading how many lines the state says no to, out of how many were read', () => {
    expect(listFor('dana-point').list.heading).toBe('6 of 9 lines the state says no to.');
    const anaheim = listFor('anaheim');
    expect(anaheim.list.heading).toBe(`0 of ${anaheim.list.total} lines the state says no to.`);
  });

  it('shows the section a Dana Point line names, and none for a line that names no section', () => {
    const { list } = listFor('dana-point');
    expect(list.lines.find((l) => l.id === 'dp-01')?.section).toBe('Sec 9.72.004 (C) and (E)');
    expect(list.lines.find((l) => l.id === 'dp-09')?.section).toBeNull();
  });
});

describe('ClashList moving between lines', () => {
  const { list } = listFor('dana-point');

  it('starts on the first line and steps forward and back, stopping at the ends', () => {
    expect(list.first).toBe('dp-01');
    expect(list.next('dp-01')).toBe('dp-04');
    expect(list.prev('dp-04')).toBe('dp-01');
    expect(list.prev('dp-01')).toBeNull();
    expect(list.next('dp-09')).toBeNull();
  });

  it('moves with the arrow keys, Home and End, and ignores other keys', () => {
    expect(list.move('dp-01', 'ArrowDown')).toBe('dp-04');
    expect(list.move('dp-04', 'ArrowUp')).toBe('dp-01');
    expect(list.move('dp-01', 'ArrowUp')).toBe('dp-01');
    expect(list.move('dp-05', 'Home')).toBe('dp-01');
    expect(list.move('dp-05', 'End')).toBe('dp-09');
    expect(list.move('dp-05', 'Enter')).toBeNull();
    expect(list.move('no-such-line', 'ArrowDown')).toBeNull();
  });

  it('has no first line and no pane when there are no lines', () => {
    const empty = new ClashList([]);
    expect(empty.first).toBeNull();
    expect(empty.pane('dp-01')).toBeNull();
    expect(empty.heading).toBe('0 of 0 lines the state says no to.');
  });
});

describe('ClashList source pane', () => {
  it("shows the line's own quote and the state's answer, with each source's page, date and link", () => {
    const { run, list } = listFor('dana-point');
    const flag = run.flags.find((f) => f.itemId === 'dp-05');
    const pane = list.pane('dp-05');
    expect(pane?.quote.map((s) => s.text).join('')).toBe(flag?.itemText);
    expect(pane?.quote.some((s) => s.mark)).toBe(false);
    expect(pane?.answers).toHaveLength(1);
    expect(pane?.answers[0]?.verdict).toBe('State says no');
    expect(pane?.answers[0]?.text).toBe(flag?.why);
    expect(pane?.answers[0]?.note).toBe(flag?.note);
    expect(pane?.answers[0]?.cites[0]).toEqual({
      label: flag?.citations[0]?.label,
      url: 'https://www.hcd.ca.gov/sites/default/files/docs/planning-and-community/HAU/Dana-Point-TA-041723.pdf',
      meta: ['Dated Apr 17, 2023', 'Page 4', 'Checked Nov 7, 2026'],
    });
    expect(pane).toMatchObject({ index: 3, total: 9, prev: 'dp-04', next: 'dp-06' });
  });

  it('names several pages, a month-only date, and no date for a statute with none', () => {
    const { list } = listFor('irvine');
    const cites = list.pane('irv-01')?.answers[0]?.cites ?? [];
    expect(cites.map((c) => c.meta.join(' · '))).toEqual([
      'Section 66315 · Checked Nov 7, 2026',
      'Section 66317(c) · Checked Nov 7, 2026',
      'Dated Mar 27, 2025 · Pages 1, 3 · Checked Nov 7, 2026',
      'Dated Mar 2026 · Page 21 · Checked Nov 7, 2026',
    ]);
  });

  it('says plainly that no rule covers a line that was not checked, with no source', () => {
    const pane = listFor('dana-point').list.pane('dp-02');
    expect(pane?.answers).toEqual([
      { status: 'UNKNOWN', verdict: 'Not checked', text: VERDICT.UNKNOWN.explain, renumber: null, cites: [], note: null },
    ]);
  });

  it('marks the old law numbers in the city quote and shows each renumbering, UNKNOWN when there is no exact section', () => {
    const pane = listFor('anaheim').list.pane('ana-04');
    expect(pane?.quote.filter((s) => s.mark).map((s) => s.text)).toEqual(['65852.2', '65852.22']);
    expect(pane?.answers.map((a) => a.renumber)).toEqual([
      { old: '65852.2', now: '66310 to 66342', exact: 'UNKNOWN' },
      { old: '65852.22', now: '66333 to 66339', exact: 'UNKNOWN' },
    ]);
  });

  it('has no pane for a line that is not in the list', () => {
    expect(listFor('dana-point').list.pane('irv-01')).toBeNull();
  });
});
