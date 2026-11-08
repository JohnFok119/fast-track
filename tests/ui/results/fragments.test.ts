import { describe, expect, it } from 'vitest';
import { locate, quotedPieces } from '../../../src/ui/results/fragments';

describe('quotedPieces', () => {
  it("takes the words the engine's reason quotes, split at an ellipsis, and drops pieces too short to find again", () => {
    const why = 'HCD found this "imposes a two-unit cap on all lots ... even when a lot split has not occurred" and "is short" here.';
    expect(quotedPieces(why)).toEqual(['imposes a two-unit cap on all lots', 'even when a lot split has not occurred']);
  });

  it('is empty when nothing is quoted', () => {
    expect(quotedPieces('No quotes at all.')).toEqual([]);
  });
});

describe('locate', () => {
  const text = 'The City  has misapplied State ADU Law by "requiring\ndeed restrictions" today.';

  it('finds a piece whatever its case, spacing or quote style', () => {
    const at = locate(text, 'misapplied state ADU law by “requiring deed restrictions”');
    expect(at).not.toBeNull();
    expect(text.slice(at!.start, at!.end)).toBe('misapplied State ADU Law by "requiring\ndeed restrictions"');
  });

  it('is null when the piece is not there', () => {
    expect(locate(text, 'approved ministerially')).toBeNull();
  });
});
