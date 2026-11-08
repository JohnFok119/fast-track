// Finding HCD's own words again: the engine's reason quotes the letter, so its quoted pieces can be found in the
// saved letter and marked there. Nothing is guessed: a piece that is not found word for word is not marked.

/** Shorter pieces match too easily in the wrong place. */
const MIN_PIECE = 16;

/** The words the engine's reason quotes, split at an ellipsis, leaving out pieces too short to find again. */
export function quotedPieces(why: string): string[] {
  const quoted = [...why.matchAll(/"([^"]+)"/g)].map((m) => m[1] ?? '');
  return quoted
    .flatMap((q) => q.split(/\.{3,}|…/))
    .map((p) => p.trim().replace(/^[,;:\s]+|[,;:\s]+$/g, ''))
    .filter((p) => p.length >= MIN_PIECE);
}

const escape = (ch: string) => ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function charPattern(ch: string): string {
  if (/\s/.test(ch)) return '\\s+';
  if (/["“”]/.test(ch)) return '["“”]';
  if (/['‘’]/.test(ch)) return "['‘’]";
  return escape(ch);
}

/** Where `piece` sits in `text`, whatever its case, spacing or quote style. Null when it is not there. */
export function locate(text: string, piece: string): { start: number; end: number } | null {
  const chars = [...piece.trim().replace(/\s+/g, ' ')];
  const pattern = new RegExp(chars.map(charPattern).join(''), 'i');
  const hit = pattern.exec(text);
  return hit ? { start: hit.index, end: hit.index + hit[0].length } : null;
}
