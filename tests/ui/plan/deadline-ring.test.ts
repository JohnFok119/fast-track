import { describe, expect, it } from 'vitest';
import { getTimeline } from '../../../src/contract/api';
import type { Phase } from '../../../src/contract/types';
import { DeadlineRing } from '../../../src/ui/faster/DeadlineRing';

const phase = (over: Partial<Phase>): Phase => ({ id: 'review', label: 'City review', value: '60 days', kind: 'LAW', drawMonths: 2, ...over });

describe('DeadlineRing', () => {
  it('reads the SB 9 review deadline from the timeline data', () => {
    const ring = DeadlineRing.pick(getTimeline('SB9'));
    expect(ring?.hasRing).toBe(true);
    expect(ring?.number).toBe('60');
    expect(ring?.unit).toBe('days');
    expect(ring?.phase.citation?.sourceId).toBe('hcd-dana-point-2025-09-15');
  });

  it('uses the decision phase for an ADU', () => {
    expect(DeadlineRing.pick(getTimeline('ADU'))?.phase.id).toBe('decision');
  });

  it('keeps business days as business days', () => {
    const ring = new DeadlineRing(phase({ value: '15 business days' }));
    expect(ring.number).toBe('15');
    expect(ring.unit).toBe('business days');
  });

  it('draws no ring when the value is not a number of days', () => {
    const ring = new DeadlineRing(phase({ value: 'UNKNOWN', kind: 'UNKNOWN' }));
    expect(ring.hasRing).toBe(false);
    expect(ring.text).toBe('UNKNOWN');
  });

  it('draws no ring for an assumption, only for law', () => {
    expect(new DeadlineRing(phase({ kind: 'ASSUMPTION' })).hasRing).toBe(false);
  });

  it('finds nothing when no phase is a review or decision', () => {
    expect(DeadlineRing.pick([phase({ id: 'build' })])).toBeNull();
  });
});
