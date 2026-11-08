// Marking words in a block of the state's text: a clash's quoted words carry the clash's number, an old law number
// carries "old". Where two marks would overlap, the one that starts first wins.
import { locate, quotedPieces } from './fragments';

export type Mark = number | 'old';

export interface Part {
  text: string;
  mark: Mark | null;
}

export interface Range {
  start: number;
  end: number;
  mark: Mark;
}

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Where a clash's quoted words sit in a text, each range carrying the clash's number. */
export function clashRanges(text: string, why: string, n: number): Range[] {
  return quotedPieces(why).flatMap((piece) => {
    const at = locate(text, piece);
    return at ? [{ ...at, mark: n }] : [];
  });
}

/** Every place an old section number stands on its own in a text: 65852.2 is not found inside 65852.22. */
export function oldRanges(text: string, old: string): Range[] {
  const pattern = new RegExp(`(?<![\\d.])${escape(old)}(?![\\d])`, 'g');
  return [...text.matchAll(pattern)].map((m) => ({ start: m.index, end: m.index + m[0].length, mark: 'old' as const }));
}

/** The text cut into plain and marked parts, in order. */
export function toParts(text: string, ranges: Range[]): Part[] {
  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  const parts: Part[] = [];
  let at = 0;
  for (const r of sorted) {
    if (r.start < at) continue;
    if (r.start > at) parts.push({ text: text.slice(at, r.start), mark: null });
    parts.push({ text: text.slice(r.start, r.end), mark: r.mark });
    at = r.end;
  }
  if (at < text.length) parts.push({ text: text.slice(at), mark: null });
  return parts;
}
