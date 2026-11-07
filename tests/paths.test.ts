import { describe, expect, it } from 'vitest';
import { getEscalation, getPaths, getSteps, getTimeline, runCheck } from '../src/contract/api';
import { parsePhase } from '../src/contract/parse';
import { CITIES, PATHWAYS } from '../src/contract/types';

describe('build paths, timeline and steps', () => {
  it('offers three build choices, each with a dated https source', () => {
    const paths = getPaths();
    expect(paths.map((p) => p.id)).toEqual(['adu-rent', 'adu-sell', 'sb9']);
    for (const p of paths) {
      expect(p.citation.url.startsWith('https://')).toBe(true);
      expect(p.citation.checked).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it.each(PATHWAYS)('%s timeline: LAW and SKIPPED bars cite a source; ASSUMPTION bars say so', (pathway) => {
    for (const phase of getTimeline(pathway)) {
      if (phase.kind === 'LAW' || phase.kind === 'SKIPPED') expect(phase.citation?.url).toMatch(/^https:\/\//);
      if (phase.kind === 'ASSUMPTION') expect(phase.note).toMatch(/estimate, not measured/);
      if (phase.kind === 'UNKNOWN') expect(phase.value).toBe('UNKNOWN');
    }
  });

  it('keeps the SB 9 review deadline UNKNOWN (none sourced)', () => {
    expect(getTimeline('SB9').find((p) => p.id === 'review')?.kind).toBe('UNKNOWN');
  });

  it('rejects a LAW phase with no citation', () => {
    expect(() => parsePhase({ id: 'x', label: 'X', value: '1 day', kind: 'LAW', drawMonths: 1 }, 'phase')).toThrow('needs a citation');
  });

  it.each(PATHWAYS)('%s steps: every LAW step cites a source', (pathway) => {
    for (const step of getSteps(pathway)) if (step.kind === 'LAW') expect(step.citation).toBeDefined();
  });

  it('escalates to HCD, citing the Orange letter', () => {
    expect(getEscalation().citation.sourceId).toBe('hcd-orange-2026-05-05');
  });

  it.each(CITIES)('%s: has a pathway and at least one sourced contact, by role only', (city) => {
    const run = runCheck(city);
    expect(PATHWAYS).toContain(run.pathway);
    expect(run.contacts.length).toBeGreaterThan(0);
    for (const c of run.contacts) expect(c.citation.url.startsWith('https://')).toBe(true);
  });
});
