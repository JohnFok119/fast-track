// Step 3's lines by status: the counts, and the state's answer to each line, as the lines after the clashes show it.
// No law lives here: words come from src/letter/verdict.ts, answers and sources from the engine's run.
import type { Citation, Flag, Status } from '../../contract/types';
import { VERDICT } from '../../letter/verdict';
import { day, type Item } from '../model';
import { citySection } from './quote';
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
  answers: Answer[];
}

export function citeView(c: Citation): Cite {
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

  private indexOf(id: string): number {
    return this.lines.findIndex((l) => l.id === id);
  }

  /** The line and the state's answer for each of its flags, or null for a line not in the list. */
  pane(id: string): Pane | null {
    const line = this.lines[this.indexOf(id)];
    const item = this.byId.get(id);
    if (!line || !item) return null;
    return { line, answers: item.flags.map(answerView) };
  }
}
