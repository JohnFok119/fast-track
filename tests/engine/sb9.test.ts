import { describe, expect, it } from 'vitest';
import aduRulesRaw from '../../data/rules/adu.json';
import sb9RulesRaw from '../../data/rules/sb9.json';
import sourcesRaw from '../../data/sources/index.json';
import { runCheck, scan } from '../../src/contract/api';
import { loadRules, loadSources } from '../../src/engine/load';
import { checkItem } from '../../src/engine/run';

const sources = loadSources(sourcesRaw);
const rules = loadRules(sb9RulesRaw, sources);
const ruleIds = (text: string, city?: string) => checkItem({ itemId: 'x', text }, rules, sources, city).map((f) => f.ruleId);

describe('city scope', () => {
  const text = 'Each duplex unit shall not exceed 800 square feet.';

  it('applies a scoped rule in its own city', () => {
    expect(ruleIds(text, 'dana-point')).toContain('sb9-dana-point-floor-area-cap');
  });

  it.each(['irvine', 'orange'])('does not apply it in %s', (city) => {
    expect(ruleIds(text, city)).toEqual([null]);
  });

  it('does not apply scoped rules to pasted text, which has no city', () => {
    expect(scan(`${text} No more than two units per parcel with a duplex.`)).toEqual([]);
  });

  it('rejects a rule scoped to a city that does not exist', () => {
    const bad = { rules: [{ ...sb9RulesRaw.rules[0], cities: ['danapoint'] }] };
    expect(() => loadRules(bad, sources)).toThrow(/cities\[0\]/);
  });

  it('keeps rule ids unique across the ADU and SB 9 files', () => {
    expect(() => loadRules({ rules: [...aduRulesRaw.rules, ...sb9RulesRaw.rules] }, sources)).not.toThrow();
  });
});

describe('Dana Point (HCD letter, 2023-04-17)', () => {
  const flags = runCheck('dana-point').flags;
  const ruleFor = (itemId: string) => flags.filter((f) => f.itemId === itemId).map((f) => f.ruleId);

  it.each([
    ['dp-01', 'sb9-dana-point-two-unit-cap'],
    ['dp-04', 'sb9-dana-point-one-story'],
    ['dp-05', 'sb9-dana-point-floor-area-cap'],
    ['dp-06', 'sb9-dana-point-floor-area-cap'],
    ['dp-07', 'sb9-dana-point-one-bedroom'],
    ['dp-08', 'sb9-dana-point-one-bedroom'],
  ])('%s is flagged by %s', (itemId, ruleId) => {
    expect(ruleFor(itemId)).toEqual([ruleId]);
  });

  // HCD only says "should" or "raises concerns" for these, or cites no statute: they stay UNKNOWN.
  it.each(['dp-02', 'dp-03', 'dp-09'])('%s stays UNKNOWN', (itemId) => {
    expect(ruleFor(itemId)).toEqual([null]);
  });

  it('cites the HCD letter with its page', () => {
    const flag = flags.find((f) => f.itemId === 'dp-05');
    expect(flag?.citations[0]).toMatchObject({ sourceId: 'hcd-dana-point-2023-04-17', page: '4' });
  });

  it('allows a two-unit cap that applies only to split lots', () => {
    expect(ruleIds('No more than two units on each split lot with a duplex.', 'dana-point')).toEqual([null]);
  });

  it('leaves an 800 square foot figure alone outside an SB 9 context', () => {
    expect(ruleIds('ADU of 800 square feet allowed.', 'dana-point')).toEqual([null]);
  });
});

describe('Orange (HCD letter, 2026-05-05)', () => {
  const flags = runCheck('orange').flags;

  it('flags the missing pathway to convert an ADU to a primary dwelling', () => {
    expect(flags.find((f) => f.itemId === 'or-02')?.ruleId).toBe('sb9-orange-conversion-pathway');
  });

  // HCD itself calls a parcel with only an ADU "not permissible under ADU law"; the conflict is the missing pathway.
  it('leaves the refusal of the original split UNKNOWN', () => {
    expect(flags.find((f) => f.itemId === 'or-01')?.status).toBe('UNKNOWN');
  });

  it('does not flag a city that offers a conversion process', () => {
    expect(ruleIds('The City provides a process to convert an ADU into a primary dwelling.', 'orange')).toEqual([null]);
  });
});
