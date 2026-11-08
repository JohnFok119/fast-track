import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { LetterText } from '../../../src/ui/results/LetterText';

const SAMPLE = [
  '---',
  'id: x',
  '---',
  '',
  'Our intro, not the letter.',
  '',
  '## Excerpts',
  '',
  '### City requirement 1: two units (p. 2)',
  '',
  'City requirement, as quoted by HCD:',
  '',
  '> "No more than two units." (p. 2)',
  '',
  "HCD's finding:",
  '',
  '> This imposes a cap.',
  '> It would violate the law. (p. 2)',
  '',
  '> A second paragraph. (p. 3)',
  '',
  '- Used for: our note about the rule.',
  '',
  'NOT FOUND in this source: anything about a deadline, which is our long working note and not the letter.',
  '',
  '| table | row |',
  '',
  '### Every statute section cited in the letter',
  '',
  '> Gov 66300 (p. 1)',
  '',
  '### Conclusion (p. 5)',
  '',
  '> The City must respond. (p. 5)',
  '',
  '## Notes',
  '',
  '> Not part of the excerpts.',
].join('\n');

describe('LetterText', () => {
  const blocks = LetterText.parse(SAMPLE).blocks;

  it("keeps our section headings, the two short labels and the letter's own words, in order", () => {
    expect(blocks).toEqual([
      { kind: 'head', text: 'City requirement 1: two units (p. 2)' },
      { kind: 'label', text: 'City requirement, as quoted by HCD:' },
      { kind: 'quote', text: '"No more than two units." (p. 2)' },
      { kind: 'label', text: "HCD's finding:" },
      { kind: 'quote', text: 'This imposes a cap. It would violate the law. (p. 2)' },
      { kind: 'quote', text: 'A second paragraph. (p. 3)' },
      { kind: 'head', text: 'Conclusion (p. 5)' },
      { kind: 'quote', text: 'The City must respond. (p. 5)' },
    ]);
  });

  it('is empty for a file with no excerpts', () => {
    expect(LetterText.parse('# Title\n\n> A quote.').blocks).toEqual([]);
  });

  it("reads HCD's letter to Dana Point into its findings, without our notes", () => {
    const real = LetterText.parse(readFileSync('data/sources/hcd-dana-point-2023-04-17.md', 'utf8')).blocks;
    expect(real.filter((b) => b.kind === 'head').length).toBeGreaterThan(8);
    expect(real.some((b) => b.kind === 'quote' && b.text.includes('imposes a two-unit cap'))).toBe(true);
    expect(real.some((b) => /Used for|NOT FOUND/.test(b.text))).toBe(false);
    expect(real.some((b) => b.text.startsWith('Every statute section'))).toBe(false);
  });
});
