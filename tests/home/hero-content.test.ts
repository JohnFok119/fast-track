import { describe, expect, it } from 'vitest';
import { getFasterPaths, getTimeline, runCheck } from '../../src/contract/api';
import type { CityRun } from '../../src/contract/types';
import { HeroContent, shortExcerpt } from '../../src/home/hero/HeroContent';

const run = runCheck('dana-point');
const content = HeroContent.from(run);

describe('HeroContent', () => {
  it('counts lines, clashes and unchecked lines from the engine run', () => {
    const conflicts = run.flags.filter((f) => f.status === 'CONFLICTS').length;
    const unknown = run.flags.filter((f) => f.status === 'UNKNOWN').length;
    expect(content.linesRead).toBe(run.flags.length);
    expect(content.conflicts).toBe(conflicts);
    expect(content.unchecked).toBe(unknown);
    expect(content.summary).toBe(`Fast Track read ${run.flags.length} lines. ${conflicts} clash with state law. ${unknown} we haven't checked.`);
  });

  it('shows three clashes as checklist rows, each with the page HCD gives', () => {
    expect(content.rows).toHaveLength(3);
    const first = run.flags.filter((f) => f.status === 'CONFLICTS').at(0);
    expect(first?.itemText).toContain(content.rows[0]?.text.replace('...', '').slice(0, 20));
    expect(content.rows[0]?.tag).toBe(`HCD p. ${first?.citations[0]?.page}`);
    expect(content.rows.find((r) => r.tag === 'HCD pp. 3, 4')).toBeDefined();
  });

  it('titles the window with the city and the pathway', () => {
    expect(content.cityName).toBe('Dana Point');
    expect(content.windowTitle).toBe('Dana Point · Duplex (SB 9)');
  });

  it('builds the paper pile from sources: the ordinance, two HCD letters, a statute and the handbook', () => {
    expect(content.ordinance.heading).toBe('Dana Point ordinance');
    expect(content.ordinance.ref).toBe('Ord. 22-01 · § 9.72.004');
    expect(content.ordinance.badge).toBe(content.conflicts);
    expect(content.letters.map((l) => l.ref)).toEqual(['Letter to Dana Point · 2023-04-17', 'Letter to Dana Point · 2025-09-15']);
    expect(content.letters[0]?.line).toMatchObject({ quoted: true });
    expect(content.letters[0]?.line?.text).toMatch(/must remove/);
    expect(content.letters[1]?.line).toEqual({ text: 'City review: 60 days', quoted: false });
    expect(content.statute.heading).toBe('Gov. Code § 65852.21(h)(1)');
    expect(content.handbook).toEqual({ title: 'California ADU Handbook', date: 'March 2026' });
  });
});

/** Every text in the data that cites one source id. */
function textsCiting(run: CityRun, sourceId: string): string[] {
  const fromFlags = run.flags.filter((f) => f.citations.some((c) => c.sourceId === sourceId)).map((f) => f.why ?? '');
  const fromPhases = getTimeline(run.pathway)
    .filter((p) => p.citation?.sourceId === sourceId)
    .map((p) => `${p.label}: ${p.value}`);
  const fromFaster = getFasterPaths(run.pathway)
    .filter((p) => p.citations.some((c) => c.sourceId === sourceId))
    .map((p) => p.title);
  return [...fromFlags, ...fromPhases, ...fromFaster];
}

describe.each([['dana-point'], ['irvine']] as const)('HeroContent for %s: every card shows only text its source states', (city) => {
  const r = runCheck(city);
  const c = HeroContent.from(r);

  it('shows on each letter card only a line from data citing that letter, or no line', () => {
    expect(c.letters.length).toBeGreaterThan(0);
    for (const letter of c.letters) {
      if (!letter.line) continue;
      expect(textsCiting(r, letter.sourceId).some((t) => t.includes(letter.line?.text ?? '\0'))).toBe(true);
    }
  });

  it('takes the statute from a law phase of the run\'s own pathway', () => {
    const law = getTimeline(r.pathway).filter((p) => p.kind === 'LAW' && p.citation?.section);
    expect(c.statute.heading).toBe(`Gov. Code § ${law.at(-1)?.citation?.section}`);
  });
});

describe('statute by pathway', () => {
  it('is the SB 9 section for Dana Point and the ADU decision clock for Irvine', () => {
    expect(HeroContent.from(runCheck('dana-point')).statute.heading).toBe('Gov. Code § 65852.21(h)(1)');
    expect(HeroContent.from(runCheck('irvine')).statute.heading).toBe('Gov. Code § 66317(a)(3)');
  });
});

describe('shortExcerpt', () => {
  it('drops the opening quote and cuts at a word with an ellipsis', () => {
    const out = shortExcerpt('"The Single Family Residential Duplex shall be subject to a height limitation of twelve feet."', 40);
    expect(out).toBe('The Single Family Residential Duplex...');
  });
  it('keeps short text whole', () => {
    expect(shortExcerpt('"One bedroom."', 40)).toBe('One bedroom.');
  });
});
