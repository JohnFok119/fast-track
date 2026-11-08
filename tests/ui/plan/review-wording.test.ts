import { describe, expect, it } from 'vitest';
import { getTimeline } from '../../../src/contract/api';
import type { Phase } from '../../../src/contract/types';
import { unknownPhrase } from '../../../src/ui/faster/reviewWording';

describe('unknownPhrase', () => {
  it('says nothing for SB 9 now that its review time is law', () => {
    expect(unknownPhrase(getTimeline('SB9'))).toBe('');
  });

  it('names whichever phase is unknown, by its own label', () => {
    const p: Phase = { id: 'review', label: 'City review', value: 'UNKNOWN', kind: 'UNKNOWN', drawMonths: null };
    expect(unknownPhrase([p])).toBe(' plus an unknown city review');
  });
});
