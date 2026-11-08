import { describe, expect, it } from 'vitest';
import { citySection, markWords } from '../../../src/ui/results/quote';

describe('citySection', () => {
  it('reads the "(Sec ...)" locator written into the quote, nested parentheses and all', () => {
    expect(citySection('"No more than two units per parcel." (Sec 9.72.004 (C) and (E))')).toBe('Sec 9.72.004 (C) and (E)');
    expect(citySection('applies to lot splits (Sec. 9.72.004 (G); Sec 7.37.004 (I)).')).toBe('Sec. 9.72.004 (G); Sec 7.37.004 (I)');
  });

  it('gives null when the quote names no section, rather than guessing one', () => {
    expect(citySection('JADUs are not allowed in townhomes (as described by HCD).')).toBeNull();
    expect(citySection('Pursuant to Section 65852.2(a)(10), the City has not adopted a separate ordinance.')).toBeNull();
  });

  it('gives null for an unclosed locator instead of running to the end of the text', () => {
    expect(citySection('a broken quote (Sec 9.72.004 (C')).toBeNull();
  });
});

describe('markWords', () => {
  it('keeps the quote whole and unmarked when there is nothing to mark', () => {
    expect(markWords('The city asks this.', [])).toEqual([{ text: 'The city asks this.', mark: false }]);
  });

  it('marks each old section number as a whole number, never part of a longer one', () => {
    const parts = markWords('authorized by Sections 65852.2 and 65852.22. Again 65852.2(a).', ['65852.2', '65852.22']);
    expect(parts.filter((p) => p.mark).map((p) => p.text)).toEqual(['65852.2', '65852.22', '65852.2']);
    expect(parts.map((p) => p.text).join('')).toBe('authorized by Sections 65852.2 and 65852.22. Again 65852.2(a).');
  });

  it('does not mark a number that only starts with the old one', () => {
    const parts = markWords('Section 65852.22 only', ['65852.2']);
    expect(parts).toEqual([{ text: 'Section 65852.22 only', mark: false }]);
  });
});
