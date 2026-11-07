import { describe, expect, it } from 'vitest';
import anaheimSample from '../data/samples/anaheim-run.json';
import danaPointSample from '../data/samples/dana-point-run.json';
import irvineSample from '../data/samples/irvine-run.json';
import orangeSample from '../data/samples/orange-run.json';
import { getClocks, runCheck, scan } from '../src/contract/api';
import { parseCityRun, parseFlag } from '../src/contract/parse';
import { CITIES } from '../src/contract/types';

describe('sample files', () => {
  it('all parse and are labelled as samples', () => {
    for (const raw of [irvineSample, anaheimSample, danaPointSample, orangeSample]) {
      const run = parseCityRun(raw);
      expect(run.sample).toBe(true);
      expect(run.sourceLabel.startsWith('SAMPLE.')).toBe(true);
    }
  });
});

describe('city runs from the engine', () => {
  it.each(CITIES)('%s: flagged items cite a dated https source, UNKNOWN items cite nothing', (city) => {
    const run = runCheck(city);
    expect(run.sample).toBe(false);
    expect(run.flags.length).toBeGreaterThan(0);
    for (const flag of run.flags) {
      if (flag.status === 'UNKNOWN') {
        expect(flag.ruleId).toBeNull();
        expect(flag.citations).toHaveLength(0);
        continue;
      }
      expect(flag.ruleId).not.toBeNull();
      expect(flag.citations.length).toBeGreaterThan(0);
      for (const citation of flag.citations) {
        expect(citation.url).toMatch(/^https:\/\//);
        expect(citation.checked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it('irvine: the deed restriction is CONFLICTS, citing Gov 66315 and the HCD letter (acceptance test 1 shape)', () => {
    const flag = runCheck('irvine').flags.find((f) => f.ruleId === 'adu-deed-restriction');
    expect(flag?.status).toBe('CONFLICTS');
    expect(flag?.citations.map((c) => c.sourceId)).toEqual(
      expect.arrayContaining(['gov-66315', 'hcd-irvine-2025-03-27']),
    );
  });
});

describe('parseFlag guards the sourcing rules', () => {
  const base = { itemId: 'x', itemText: 'Some requirement' };

  it('rejects a CONFLICTS flag with no citation', () => {
    expect(() => parseFlag({ ...base, status: 'CONFLICTS', ruleId: 'r', citations: [] }, 'test')).toThrow(
      /at least one citation/,
    );
  });

  it('rejects an UNKNOWN flag that claims a rule', () => {
    expect(() => parseFlag({ ...base, status: 'UNKNOWN', ruleId: 'r', citations: [] }, 'test')).toThrow(
      /no rule and no citations/,
    );
  });

  it('rejects a status outside the four allowed', () => {
    expect(() => parseFlag({ ...base, status: 'ILLEGAL', ruleId: null, citations: [] }, 'test')).toThrow(
      /must be one of/,
    );
  });
});

describe('scan', () => {
  it('finds 65852.2 and 65852.22 as two separate citations', () => {
    const flags = scan('Units comply with Section 65852.2. Junior units follow Section 65852.22.');
    expect(flags).toHaveLength(2);
    expect(flags.map((f) => f.mapping?.old).sort()).toEqual(['65852.2', '65852.22']);
    expect(flags.every((f) => f.status === 'OUTDATED_CITATION')).toBe(true);
  });

  it('returns nothing for text with only current section numbers', () => {
    expect(scan('Gov Code 66314 applies to this application.')).toEqual([]);
  });
});

describe('clocks', () => {
  it('keeps "deemed approved" UNCONFIRMED with an UNKNOWN value', () => {
    const clock = getClocks().find((c) => c.id === 'adu-deemed-approved');
    expect(clock?.status).toBe('UNCONFIRMED');
    expect(clock?.value).toBe('UNKNOWN');
  });
});
