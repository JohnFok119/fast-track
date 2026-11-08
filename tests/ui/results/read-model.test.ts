import { describe, expect, it } from 'vitest';
import type { ClashSummary } from '../../../src/assist/clash-types';
import type { City } from '../../../src/contract/types';
import { RUNS } from '../../../src/ui/data';
import { groupItems } from '../../../src/ui/model';
import { ReadModel } from '../../../src/ui/results/ReadModel';

const runOf = (city: City) => RUNS.find((r) => r.city === city)!;
const modelOf = (city: City, summaries: ClashSummary[] = []) => new ReadModel(runOf(city), groupItems(runOf(city)), summaries);
const marked = (m: ReadModel, n: number | 'old') => m.blocks.flatMap((b) => b.parts.filter((p) => p.mark === n).map((p) => p.text));

describe('ReadModel for Dana Point', () => {
  const m = modelOf('dana-point');

  it("reads the city's lines in the city's order against HCD's letter to that city", () => {
    expect(m.lines.map((l) => l.id)).toEqual(['dp-01', 'dp-02', 'dp-03', 'dp-04', 'dp-05', 'dp-06', 'dp-07', 'dp-08', 'dp-09']);
    expect(m.doc?.id).toBe('hcd-dana-point-2023-04-17');
    expect(m.doc?.dated).toBe('Apr 17, 2023');
    expect(m.readingHeading).toBe("Reading Dana Point's rules against HCD's letter");
    expect(m.heading).toBe('6 of 9 lines the state says no to.');
  });

  it('numbers each clash in the order its first line comes, and lines HCD answers the same way share a number', () => {
    expect(m.pairs.map((p) => [p.n, p.ruleId, p.itemIds])).toEqual([
      [1, 'sb9-dana-point-two-unit-cap', ['dp-01']],
      [2, 'sb9-dana-point-one-story', ['dp-04']],
      [3, 'sb9-dana-point-floor-area-cap', ['dp-05', 'dp-06']],
      [4, 'sb9-dana-point-one-bedroom', ['dp-07', 'dp-08']],
    ]);
    expect(m.lines.map((l) => l.pair)).toEqual([1, null, null, 2, 3, 3, 4, 4, null]);
  });

  it("marks HCD's own words for each clash in the letter, and looks them up from the clash's first line only", () => {
    for (const p of m.pairs) {
      expect(p.block).not.toBeNull();
      expect(m.blocks[p.block!]?.parts.some((part) => part.mark === p.n)).toBe(true);
    }
    expect(marked(m, 1).join(' ')).toContain('imposes a two-unit cap on all single-family residential duplexes');
    expect(m.lines.map((l) => l.look !== null)).toEqual([true, false, false, true, true, false, true, false, false]);
  });

  it('names each clash by its summary title, or by its rule when no summary was written', () => {
    const summary: ClashSummary = {
      city: 'dana-point', ruleId: 'sb9-dana-point-two-unit-cap', itemIds: ['dp-01'], title: 'Two unit cap',
      citySays: 'a', stateSays: 'b', clash: 'c', time: { low: 1, high: 2, unit: 'months', basis: 'd' },
    };
    const withOne = modelOf('dana-point', [summary]);
    expect(withOne.pairs[0]?.summary).toBe(summary);
    expect(withOne.pairs[1]?.summary).toBeNull();
    expect(withOne.pairs[1]?.title).toBe('One story');
  });
});

describe('ReadModel for Anaheim', () => {
  const m = modelOf('anaheim');

  it('finds no clash, reads the checklist against the ADU Handbook, and marks the old law numbers on both sides', () => {
    expect(m.pairs).toEqual([]);
    expect(m.doc?.id).toBe('adu-handbook-2026-03');
    expect(m.readingHeading).toBe("Reading Anaheim's rules against the ADU Handbook");
    const ana04 = m.lines.find((l) => l.id === 'ana-04')!;
    expect(ana04.segments.filter((s) => s.mark).map((s) => s.text)).toEqual(['65852.2', '65852.22']);
    expect(marked(m, 'old')).toEqual(expect.arrayContaining(['65852.2', '65852.22']));
    expect(ana04.look).not.toBeNull();
    expect(m.blocks[ana04.look!]?.parts.some((p) => p.mark === 'old')).toBe(true);
  });
});

describe('ReadModel for every city', () => {
  it.each<City>(['anaheim', 'dana-point', 'irvine', 'orange'])("finds every clash of %s in the state's own words", (city) => {
    const m = modelOf(city);
    expect(m.doc).not.toBeNull();
    for (const p of m.pairs) expect(p.block).not.toBeNull();
  });
});
