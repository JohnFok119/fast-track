import { describe, expect, it } from 'vitest';
import rulesRaw from '../../data/rules/adu.json';
import sourcesRaw from '../../data/sources/index.json';
import { parseCityRun } from '../../src/contract/parse';
import { runCheck, scan } from '../../src/engine/default';
import { loadRules, loadSources } from '../../src/engine/load';
import { checkItem } from '../../src/engine/run';

const sources = loadSources(sourcesRaw);
const rules = loadRules(rulesRaw, sources);
const flagsFor = (text: string) => checkItem({ itemId: 'x', text }, rules, sources);
const flagsOf = (city: 'irvine' | 'anaheim', id: string) => runCheck(city).flags.filter((f) => f.itemId === id);

describe('acceptance 1: Irvine deed restriction', () => {
  it('flags irv-01 as CONFLICTS with sourced citations', () => {
    const [flag] = flagsOf('irvine', 'irv-01');
    expect(flag?.status).toBe('CONFLICTS');
    expect(flag?.ruleId).toBe('adu-deed-restriction');
    const ids = flag?.citations.map((c) => c.sourceId);
    expect(ids).toContain('gov-66315');
    expect(ids).toContain('hcd-irvine-2025-03-27');
    for (const c of flag?.citations ?? []) {
      expect(c.url.startsWith('https://')).toBe(true);
      expect(c.checked).toBe('2026-11-07');
    }
  });
});

describe('acceptance 2: outdated citations', () => {
  it('maps ana-01 to 65852.22 with no exact section', () => {
    const [flag] = flagsOf('anaheim', 'ana-01').filter((f) => f.status === 'OUTDATED_CITATION');
    expect(flag?.mapping?.old).toBe('65852.22');
    expect(flag?.mapping?.exactSection).toBeNull();
  });
  it('maps ana-02 to 65852.2', () => {
    const [flag] = flagsOf('anaheim', 'ana-02');
    expect(flag?.status).toBe('OUTDATED_CITATION');
    expect(flag?.mapping?.old).toBe('65852.2');
  });
  it('does not fire the 65852.2 rule on 65852.22 alone', () => {
    const ids = flagsFor('See Gov Code 65852.22.').map((f) => f.ruleId);
    expect(ids).not.toContain('cite-65852-2');
    expect(ids).toContain('cite-65852-22');
  });
  it('flags irv-02 (65852.2(a)(10)) as outdated', () => {
    expect(flagsOf('irvine', 'irv-02')[0]?.status).toBe('OUTDATED_CITATION');
  });
});

describe('acceptance 3: sourcing and invariants', () => {
  const cite = { sourceId: 'gov-66315', label: 'L' };
  const rule = { id: 'r', status: 'OK', match: { allOf: ['x'] }, why: 'w', cites: [cite] };

  it('rejects a rule citing a missing source', () => {
    const bad = { rules: [{ ...rule, cites: [{ sourceId: 'nope', label: 'L' }] }] };
    expect(() => loadRules(bad, sources)).toThrow('no source, no rule');
  });
  it('rejects an invalid regex, a duplicate id and empty cites', () => {
    expect(() => loadRules({ rules: [{ ...rule, match: { allOf: ['('] } }] }, sources)).toThrow('invalid regex');
    expect(() => loadRules({ rules: [rule, rule] }, sources)).toThrow('duplicate rule id');
    expect(() => loadRules({ rules: [{ ...rule, cites: [] }] }, sources)).toThrow('must not be empty');
  });
  it('gives UNKNOWN with no citations when nothing matches', () => {
    const [flag, ...rest] = flagsFor('Sewer verification for the ADU.');
    expect(rest).toHaveLength(0);
    expect(flag?.status).toBe('UNKNOWN');
    expect(flag?.ruleId).toBeNull();
    expect(flag?.citations).toEqual([]);
  });
  it('produces runs that pass parseCityRun', () => {
    for (const city of ['irvine', 'anaheim'] as const) {
      const run = runCheck(city);
      expect(run.sample).toBe(false);
      expect(parseCityRun(run).flags.length).toBeGreaterThan(0);
    }
  });
});

describe('covenant guard', () => {
  it('does not call an affordability covenant a conflict', () => {
    const flags = flagsFor('Record an affordability covenant restricting resale of the ADU');
    expect(flags.some((f) => f.status === 'CONFLICTS')).toBe(false);
  });
  it('does not flag a JADU deed restriction', () => {
    const flags = flagsFor('Record a JADU deed restriction');
    expect(flags.map((f) => f.ruleId)).not.toContain('adu-deed-restriction');
  });
});

describe('townhouse rule', () => {
  it('flags irv-03', () => {
    const [flag] = flagsOf('irvine', 'irv-03');
    expect(flag?.status).toBe('CONFLICTS');
    expect(flag?.ruleId).toBe('jadu-detached-townhouse');
  });
  it('ignores a townhouse complex with an HOA', () => {
    const ids = flagsFor('JADU in a townhouse complex with an HOA').map((f) => f.ruleId);
    expect(ids).not.toContain('jadu-detached-townhouse');
  });
});

describe('unknowns and ordering', () => {
  it('leaves the 60-day clock claim (irv-04) UNKNOWN', () => {
    const flags = flagsOf('irvine', 'irv-04');
    expect(flags).toHaveLength(1);
    expect(flags[0]?.status).toBe('UNKNOWN');
  });
  it('orders CONFLICTS before OUTDATED_CITATION and keeps (item, rule) unique', () => {
    const flags = flagsFor('Record an ADU covenant as required by Section 65852.2');
    expect(flags.map((f) => f.status)).toEqual(['CONFLICTS', 'OUTDATED_CITATION']);
    expect(new Set(flags.map((f) => f.ruleId)).size).toBe(flags.length);
  });
  it('scans text into one flag per old number', () => {
    const flags = scan('Comply with Section 65852.2. JADUs follow 65852.22.');
    expect(flags.map((f) => f.status)).toEqual(['OUTDATED_CITATION', 'OUTDATED_CITATION']);
    expect(flags.map((f) => f.mapping?.old)).toEqual(['65852.2', '65852.22']);
  });
});
