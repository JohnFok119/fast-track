import type { Citation, FasterPath } from '../../contract/types';

export interface SourceRow { label: string; url: string; detail: string[] }
export interface Warning { label: string; text: string; strong: boolean }
export interface FasterRow {
  id: string;
  title: string;
  text: string;
  warning: Warning | null;
  sources: SourceRow[];
}

/** Where a source says it, as short parts (section, page, date checked), each meant to stay on one line. */
export function citationDetail(c: Citation): string[] {
  return [c.section ? `§ ${c.section}` : '', c.page ? `p. ${c.page}` : '', `checked ${c.checked}`].filter(Boolean);
}

/** View model for the Faster paths panel: orders the paths and decides which warning each one shows. */
export class FasterPathList {
  readonly rows: FasterRow[];

  constructor(paths: FasterPath[]) {
    const rank = (p: FasterPath) => (p.status === 'CONFIRMED' ? 0 : 1);
    this.rows = paths
      .map((p, i) => ({ p, i }))
      .sort((a, b) => rank(a.p) - rank(b.p) || a.i - b.i)
      .map(({ p }) => FasterPathList.row(p));
  }

  private static row(p: FasterPath): FasterRow {
    const unconfirmed = p.status === 'UNCONFIRMED';
    const warning = p.caveat ? { label: unconfirmed ? 'Not confirmed yet' : 'Check', text: p.caveat, strong: unconfirmed } : null;
    const sources = p.citations.map((c) => ({ label: c.label, url: c.url, detail: citationDetail(c) }));
    return { id: p.id, title: p.title, text: p.text, warning, sources };
  }
}
