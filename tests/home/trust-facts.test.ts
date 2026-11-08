import { describe, expect, it } from 'vitest';
import { HomeFacts } from '../../src/home/trust/facts';

const facts = HomeFacts.fromData();

describe('HomeFacts', () => {
  it('counts cities and rules from the data', () => {
    expect(facts.cityNames).toEqual(['Irvine', 'Anaheim', 'Dana Point', 'Orange']);
    expect(facts.ruleCount).toBe(13);
  });

  it('builds the three trust chips from a real rule citation', () => {
    expect(facts.trust.chips).toEqual(['§ 66315', '§ 66317', 'HCD letter p. 1, 3']);
  });

  it('builds the dated line from the cited letter source', () => {
    expect(facts.trust.dated).toBe('HCD letter · 2025-03-27 · p. 1, 3');
    expect(facts.trust.checked).toBe('2026-11-07');
  });
});
