import { describe, expect, it } from 'vitest';
import { RUNS } from '../../../src/ui/data';
import { SUMMARIES } from '../../../src/ui/results/summaries';

/** Every clash the rule set finds now, as city and rule, with the lines it covers. */
const clashes = RUNS.flatMap((run) => {
  const byRule = new Map<string, string[]>();
  for (const f of run.flags) {
    if (f.status === 'CONFLICTS' && f.ruleId) byRule.set(f.ruleId, [...(byRule.get(f.ruleId) ?? []), f.itemId]);
  }
  return [...byRule].map(([ruleId, itemIds]) => ({ city: run.city, ruleId, itemIds }));
});

describe('saved clash summaries', () => {
  it('cover exactly the clashes the rule set finds today, line for line', () => {
    expect(SUMMARIES.clashes.map((s) => ({ city: s.city, ruleId: s.ruleId, itemIds: s.itemIds }))).toEqual(clashes);
  });

  it('say who wrote them and when', () => {
    expect(SUMMARIES.model).toMatch(/claude/i);
    expect(SUMMARIES.written).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('hold no em dash and no section sign, and give each time estimate as a range with its basis', () => {
    for (const s of SUMMARIES.clashes) {
      const words = [s.title, s.citySays, s.stateSays, s.clash, s.time.basis].join(' ');
      expect(words).not.toMatch(/[\u2014\u2013\u00a7]/);
      expect(s.time.low).toBeLessThanOrEqual(s.time.high);
      expect(s.time.basis.length).toBeGreaterThan(20);
    }
  });
});
