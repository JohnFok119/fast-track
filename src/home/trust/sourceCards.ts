// Builds the four "Every answer has a source" cards. Titles, cities, statute numbers and dates come from
// data/sources/index.json by source id; an unknown id throws, so a card can never show a source that does not exist.
import sourcesRaw from '../../../data/sources/index.json';

export interface SourceEntry {
  id: string;
  title: string;
  publisher: string;
  published: string | null;
  checked: string;
}

export type DocKind = 'hcd' | 'law' | 'web';

/** One mini document in a card's fan. */
export interface MiniDoc {
  kind: DocKind;
  tag: string;
  label: string;
  date?: string;
  /** Position in the fan: -1 left, 0 middle, 1 right (web cards use -.62 and .62). */
  offset: number;
}

export interface SourceCard {
  id: 'letters' | 'handbook' | 'statutes' | 'city';
  title: string;
  docs: MiniDoc[];
  /** Set when the card is a book cover instead of a fan. */
  book?: { name: string; date?: string };
  sourceIds: string[];
  /** The latest checked date among the card's sources. */
  checked: string;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** "2026-03" becomes "March 2026" (long) or "Mar 2026" (short). A full date stays as it is. UNKNOWN gives nothing. */
export function formatDate(raw: string | null | undefined, style: 'long' | 'short'): string | undefined {
  if (!raw) return undefined;
  const m = /^(\d{4})-(\d{2})$/.exec(raw);
  if (m) {
    const name = MONTHS[Number(m[2]) - 1];
    if (!name) return undefined;
    return `${style === 'long' ? name : name.slice(0, 3)} ${m[1]}`;
  }
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : undefined;
}

export class SourceCards {
  private readonly byId: Map<string, SourceEntry>;

  constructor(sources: SourceEntry[]) {
    this.byId = new Map(sources.map((s) => [s.id, s]));
  }

  static fromData(): SourceCards {
    return new SourceCards(sourcesRaw as SourceEntry[]);
  }

  source(id: string): SourceEntry {
    const found = this.byId.get(id);
    if (!found) throw new Error(`[home] unknown source id: ${id}`);
    return found;
  }

  build(): SourceCard[] {
    return [this.letters(), this.handbook(), this.statutes(), this.cityPages()];
  }

  /** The latest checked date over every source the cards use. */
  checkedOverall(): string {
    return this.build().map((c) => c.checked).sort().at(-1) ?? '';
  }

  private letters(): SourceCard {
    const ids = ['hcd-irvine-2025-03-27', 'hcd-dana-point-2023-04-17', 'hcd-orange-2026-05-05'];
    const docs = ids.map((id, i) => {
      const s = this.source(id);
      return { kind: 'hcd' as const, tag: 'HCD', label: this.cityOf(s), date: formatDate(s.published, 'short'), offset: i - 1 };
    });
    return this.card('letters', 'HCD letters', ids, docs);
  }

  private handbook(): SourceCard {
    const s = this.source('adu-handbook-2026-03');
    const book = { name: s.title.split(',')[0] ?? s.title, date: formatDate(s.published, 'long') };
    return { ...this.card('handbook', 'ADU Handbook', [s.id], []), book };
  }

  private statutes(): SourceCard {
    const ids = ['gov-66315', 'gov-66317', 'gov-66333'];
    const docs = ids.map((id, i) => {
      this.source(id);
      return { kind: 'law' as const, tag: '§', label: id.replace(/^gov-/, ''), offset: i - 1 };
    });
    return this.card('statutes', 'Gov. Code', ids, docs);
  }

  private cityPages(): SourceCard {
    const ids = ['anaheim-adu-checklist-2025-11', 'irvine-adu-current'];
    const short = ['ADU checklist', 'ADU page'];
    const docs = ids.map((id, i) => {
      const s = this.source(id);
      return {
        kind: 'web' as const,
        tag: s.publisher.replace(/^City of /, '').toUpperCase(),
        label: short[i] ?? '',
        date: formatDate(s.published, 'short'),
        offset: i === 0 ? -0.62 : 0.62,
      };
    });
    return this.card('city', 'City pages', ids, docs);
  }

  private card(id: SourceCard['id'], title: string, sourceIds: string[], docs: MiniDoc[]): SourceCard {
    const checked = sourceIds.map((s) => this.source(s).checked).sort().at(-1) ?? '';
    return { id, title, docs, sourceIds, checked };
  }

  private cityOf(s: SourceEntry): string {
    const m = /the City of ([^(]+?)(?: \(|$)/.exec(s.title);
    if (!m?.[1]) throw new Error(`[home] cannot read a city from the title of ${s.id}`);
    return m[1];
  }
}
