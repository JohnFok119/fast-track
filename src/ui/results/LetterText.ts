// A saved state source as the reading view shows it: our section headings, the two short labels that say whose words
// follow, and the source's own words. Only the "## Excerpts" part, without our "Used for" notes, our working notes,
// tables, or our list of every statute a letter cites.

export type BlockKind = 'head' | 'label' | 'quote';

export interface Block {
  kind: BlockKind;
  text: string;
}

/** Our index of statutes at the end of a letter: a list, not the letter's words. */
const SKIP_SECTION = /^Every statute section/i;
/** A short line ending in a colon, such as "HCD's finding:". Longer plain lines are our own working notes. */
const LABEL = /^[^|]{1,60}:$/;

export class LetterText {
  private constructor(readonly blocks: Block[]) {}

  static parse(markdown: string): LetterText {
    const lines = markdown.split('\n');
    const start = lines.findIndex((l) => l.trim() === '## Excerpts');
    if (start < 0) return new LetterText([]);
    const blocks: Block[] = [];
    let quote: string[] = [];
    let skipping = false;
    const flush = () => {
      if (quote.length) blocks.push({ kind: 'quote', text: quote.join(' ') });
      quote = [];
    };
    for (const raw of lines.slice(start + 1)) {
      const line = raw.trim();
      if (line.startsWith('## ')) break;
      if (line.startsWith('### ')) {
        flush();
        const head = line.slice(4).trim();
        skipping = SKIP_SECTION.test(head);
        if (!skipping) blocks.push({ kind: 'head', text: head });
      } else if (skipping) {
        continue;
      } else if (line.startsWith('>') && line.length > 1) {
        quote.push(line.replace(/^>\s?/, ''));
      } else {
        flush();
        if (LABEL.test(line)) blocks.push({ kind: 'label', text: line });
      }
    }
    flush();
    return new LetterText(blocks);
  }
}
