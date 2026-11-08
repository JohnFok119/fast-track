// The city's own words for one line: the section the quote names, and which words in it to mark.
// Nothing here is guessed: a section comes only from a "(Sec ...)" locator written in the quote, and a mark only
// from words the data names (an old section number on an OUTDATED_CITATION flag).

export interface Segment {
  text: string;
  mark: boolean;
}

/** Index of the parenthesis that closes the one at `open`, or -1 when it never closes. */
function closingParen(text: string, open: number): number {
  let depth = 0;
  for (let i = open; i < text.length; i += 1) {
    if (text[i] === '(') depth += 1;
    else if (text[i] === ')') depth -= 1;
    if (depth === 0) return i;
  }
  return -1;
}

/** The "(Sec ...)" locators in the quote, as written, joined by "; ". Null when the quote names none. */
export function citySection(text: string): string | null {
  const found: string[] = [];
  let from = 0;
  for (let start = text.indexOf('(Sec', from); start >= 0; start = text.indexOf('(Sec', from)) {
    const end = closingParen(text, start);
    if (end < 0) break;
    found.push(text.slice(start + 1, end));
    from = end + 1;
  }
  return found.length ? found.join('; ') : null;
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Splits the quote so each of `words` is its own marked part. A number is never marked inside a longer number. */
export function markWords(text: string, words: string[]): Segment[] {
  const unique = [...new Set(words.filter(Boolean))].sort((a, b) => b.length - a.length);
  if (!unique.length) return [{ text, mark: false }];
  const pattern = new RegExp(`(?<![\\d.])(?:${unique.map(escape).join('|')})(?!\\d)`, 'g');
  const parts: Segment[] = [];
  let at = 0;
  for (const m of text.matchAll(pattern)) {
    if (m.index > at) parts.push({ text: text.slice(at, m.index), mark: false });
    parts.push({ text: m[0], mark: true });
    at = m.index + m[0].length;
  }
  if (at < text.length) parts.push({ text: text.slice(at), mark: false });
  return parts;
}
