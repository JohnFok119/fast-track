// The results step's model: the lines in the order shown, the counts, moving between lines, and what the source pane
// shows for a line. No law lives here: words come from src/letter/verdict.ts, quotes and sources from the engine's run.
import type { Citation, Flag, Status } from '../../contract/types';
import { VERDICT } from '../../letter/verdict';
import { day, type Item } from '../model';
import { citySection, markWords, type Segment } from './quote';
import { publishedOn } from './sources';

/** What is most in the way comes first. A line not checked may still be in the way, so it sits above an allowed one. */
const ORDER: Status[] = ['CONFLICTS', 'OUTDATED_CITATION', 'UNKNOWN', 'OK'];

export interface Line {
  id: string;
  status: Status;
  chip: string;
  /** The city's words, as saved. */
  text: string;
  /** The "(Sec ...)" locator in the city's words, or null when they name none. */
  section: string | null;
}

export interface Cite {
  label: string;
  url: string;
  /** Date, page, section and the day it was checked, e.g. ["Dated Apr 17, 2023", "Page 4", "Checked Nov 7, 2026"]. */
  meta: string[];
}

export interface Renumber {
  old: string;
  now: string;
  /** The single replacement section, or "UNKNOWN" when the source gives none. */
  exact: string;
}

export interface Answer {
  status: Status;
  verdict: string;
  text: string;
  renumber: Renumber | null;
  cites: Cite[];
  note: string | null;
}

export interface Pane {
  line: Line;
  /** 1-based place of the line in the list. */
  index: number;
  total: number;
  prev: string | null;
  next: string | null;
  quote: Segment[];
  answers: Answer[];
}

function citeView(c: Citation): Cite {
  const dated = publishedOn(c.sourceId);
  const pages = c.page && /[,-]/.test(c.page) ? `Pages ${c.page}` : c.page ? `Page ${c.page}` : null;
  const meta = [dated ? `Dated ${dated}` : null, pages, c.section ? `Section ${c.section}` : null, `Checked ${day(c.checked)}`];
  return { label: c.label, url: c.url, meta: meta.filter((m): m is string => m !== null) };
}

function answerView(f: Flag): Answer {
  const unknown = f.status === 'UNKNOWN';
  return {
    status: f.status,
    verdict: VERDICT[f.status].chip,
    text: unknown ? VERDICT.UNKNOWN.explain : (f.why ?? ''),
    renumber: f.mapping ? { old: f.mapping.old, now: f.mapping.now, exact: f.mapping.exactSection ?? 'UNKNOWN' } : null,
    cites: f.citations.map(citeView),
    note: f.note ? f.note : null,
  };
}

export class ClashList {
  readonly lines: Line[];
  private readonly byId: Map<string, Item>;

  constructor(items: Item[]) {
    this.byId = new Map(items.map((it) => [it.itemId, it]));
    this.lines = ORDER.flatMap((status) => items.filter((it) => it.worst === status)).map((it) => ({
      id: it.itemId,
      status: it.worst,
      chip: VERDICT[it.worst].chip,
      text: it.text,
      section: citySection(it.text),
    }));
  }

  get total(): number {
    return this.lines.length;
  }

  /** Lines per status, most pressing first, leaving out statuses no line has. */
  get tally(): { status: Status; label: string; n: number }[] {
    return ORDER.map((status) => ({ status, label: VERDICT[status].chip, n: this.lines.filter((l) => l.status === status).length }))
      .filter((t) => t.n > 0);
  }

  get heading(): string {
    const no = this.lines.filter((l) => l.status === 'CONFLICTS').length;
    return `${no} of ${this.total} line${this.total === 1 ? '' : 's'} the state says no to.`;
  }

  get first(): string | null {
    return this.lines[0]?.id ?? null;
  }

  private at(index: number): string | null {
    return this.lines[index]?.id ?? null;
  }

  private indexOf(id: string): number {
    return this.lines.findIndex((l) => l.id === id);
  }

  next(id: string): string | null {
    const i = this.indexOf(id);
    return i < 0 ? null : this.at(i + 1);
  }

  prev(id: string): string | null {
    const i = this.indexOf(id);
    return i < 0 ? null : this.at(i - 1);
  }

  /** The line a key moves to from `id`: arrows step and stop at the ends, Home and End jump. Null for other keys. */
  move(id: string, key: string): string | null {
    const i = this.indexOf(id);
    if (i < 0) return null;
    const last = this.lines.length - 1;
    const to: Record<string, number> = { ArrowDown: Math.min(i + 1, last), ArrowUp: Math.max(i - 1, 0), Home: 0, End: last };
    return key in to ? this.at(to[key] ?? i) : null;
  }

  /** What the source pane shows for a line: the city's words, then the state's answer for each flag. */
  pane(id: string): Pane | null {
    const i = this.indexOf(id);
    const line = this.lines[i];
    const item = this.byId.get(id);
    if (!line || !item) return null;
    const old = item.flags.flatMap((f) => (f.mapping ? [f.mapping.old] : []));
    return {
      line,
      index: i + 1,
      total: this.total,
      prev: this.at(i - 1),
      next: this.at(i + 1),
      quote: markWords(item.text, old),
      answers: item.flags.map(answerView),
    };
  }
}
