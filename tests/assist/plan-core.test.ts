import { describe, expect, it } from 'vitest';
import { getEscalation, getSteps, getTimeline, runCheck } from '../../src/contract/api';
import { buildPlanPrompt, contactsFor, knownNumbers, unknownItems, validatePlan, type PlanInput } from '../../src/assist/plan-core';

function input(city: Parameters<typeof runCheck>[0]): PlanInput {
  const run = runCheck(city);
  return { run, steps: getSteps(run.pathway), timeline: getTimeline(run.pathway), escalation: getEscalation(), excerpts: {} };
}

const irvine = input('irvine');
const rule = irvine.run.flags.find((f) => f.ruleId !== null);
const gap = unknownItems(irvine.run)[0];
const phase = irvine.timeline[0];
if (!rule || !gap || !phase) throw new Error('expected a matched flag, an UNKNOWN item and a phase for Irvine');

describe('buildPlanPrompt', () => {
  it('lists the rules, gaps, steps, contacts and phases Claude may point at', () => {
    const p = buildPlanPrompt(irvine);
    expect(p).toContain(`rule:${rule.ruleId}`);
    expect(p).toContain(gap);
    expect(p).toContain(`phase:${phase.id}`);
    expect(p).toContain(getEscalation().office);
  });
});

describe('validatePlan', () => {
  const good = {
    city: 'irvine',
    actions: [{ ref: `rule:${rule.ruleId}`, text: 'Ask the city to drop this.' }],
    gaps: [{ itemId: gap, contact: contactsFor(irvine).length - 1, text: 'Ask what this needs.' }],
    time: [{ phase: phase.id, text: 'This deadline keeps the city moving.' }],
  };

  it('keeps valid entries and attaches citations from the engine, not Claude', () => {
    const res = validatePlan(good, irvine);
    if (res.fallback) throw new Error('expected a plan');
    expect(res.actions[0]?.citations).toEqual(irvine.run.flags.filter((f) => f.ruleId === rule.ruleId).flatMap((f) => f.citations));
    expect(res.gaps[0]?.contact).toEqual(getEscalation());
    expect(res.time[0]?.phase).toEqual(phase);
  });

  it('drops invented refs, citations, invented numbers, non-gap items and bad contacts', () => {
    const res = validatePlan(
      {
        city: 'irvine',
        actions: [
          { ref: 'rule:made-up', text: 'x' },
          { ref: `rule:${rule.ruleId}`, text: 'Gov Code says so.' },
          { ref: `rule:${rule.ruleId}`, text: 'You will save 987654321 days.' },
          { ref: `rule:${rule.ruleId}`, text: 'Keep this one.' },
        ],
        gaps: [
          { itemId: rule.itemId === gap ? 'nope' : rule.itemId, contact: 0, text: 'not a gap' },
          { itemId: gap, contact: 999, text: 'bad contact' },
        ],
        time: [{ phase: 'no-such-phase', text: 'x' }],
      },
      irvine,
    );
    expect(res).toEqual({
      fallback: false,
      city: 'irvine',
      actions: [{ ref: `rule:${rule.ruleId}`, text: 'Keep this one.', citations: expect.any(Array) }],
      gaps: [],
      time: [],
    });
  });

  it('allows numbers that are already in the data', () => {
    const n = [...knownNumbers(irvine)].find((x) => /^\d{2,4}$/.test(x));
    if (!n) throw new Error('expected a number in the Irvine data');
    const res = validatePlan({ ...good, actions: [{ ref: `rule:${rule.ruleId}`, text: `About ${n} days.` }] }, irvine);
    expect(res.fallback).toBe(false);
  });

  it('falls back on the wrong city, a bad shape, or no valid actions', () => {
    expect(validatePlan({ ...good, city: 'anaheim' }, irvine)).toEqual({ fallback: true });
    expect(validatePlan('nope', irvine)).toEqual({ fallback: true });
    expect(validatePlan({ ...good, actions: [] }, irvine)).toEqual({ fallback: true });
  });
});
