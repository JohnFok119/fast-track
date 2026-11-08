// The showcase window shows a real run. This turns a CityRun into the rows, counts and source notes it displays.
// Every word of law, every page and date comes from the run; nothing is typed in here.
import type { CityRun, Flag } from '../../contract/types';

export interface HcdParts {
  before: string;
  mark: string;
  after: string;
}

export interface ShowcaseRow {
  id: string;
  /** How many lines of the city's text share this finding (a duplex line and a lot-split line, for example). */
  lines: number;
  cityQuote: string;
  section: string;
  hcdQuote: string;
  hcdParts: HcdParts;
  /** "p. 4" or "pp. 3, 4"; empty when the source gives no page. */
  page: string;
  sourceName: string;
  sourceUrl: string;
  checked: string;
}

const SECTION_AT_END = /\s*\((Sec\.?\s.*)\)\.?\s*$/;
const MUST_SENTENCE = /(?:Therefore, )?[Tt]he City must [^."]+\.?/;

function pageLabel(page: string | undefined): string {
  if (!page) return '';
  return page.includes(',') || page.includes('-') ? `pp. ${page}` : `p. ${page}`;
}

function splitMark(text: string): HcdParts {
  const hit = MUST_SENTENCE.exec(text);
  if (!hit) return { before: text, mark: '', after: '' };
  return { before: text.slice(0, hit.index), mark: hit[0], after: text.slice(hit.index + hit[0].length) };
}

function rowOf(flag: Flag, lines: number): ShowcaseRow[] {
  const cite = flag.citations[0];
  if (!cite) return [];
  const sectionHit = SECTION_AT_END.exec(flag.itemText);
  const hcdQuote = flag.why ?? '';
  return [{
    id: flag.itemId,
    lines,
    cityQuote: sectionHit ? flag.itemText.slice(0, sectionHit.index) : flag.itemText,
    section: sectionHit?.[1] ?? '',
    hcdQuote,
    hcdParts: splitMark(hcdQuote),
    page: pageLabel(cite.page),
    sourceName: cite.label.split(' (')[0] ?? cite.label,
    sourceUrl: cite.url,
    checked: cite.checked,
  }];
}

export class ShowcaseModel {
  readonly rows: ShowcaseRow[];
  readonly conflictCount: number;
  readonly unknown: Flag[];
  readonly title: string;
  readonly sourceNote: string;
  readonly sidebarSource: string;
  readonly cityName: string;

  constructor(run: CityRun) {
    const conflicts = run.flags.filter((f) => f.status === 'CONFLICTS');
    const groups = new Map<string, Flag[]>();
    for (const flag of conflicts) {
      const key = flag.ruleId ?? flag.itemId;
      groups.set(key, [...(groups.get(key) ?? []), flag]);
    }
    this.rows = [...groups.values()].flatMap((flags) => (flags[0] ? rowOf(flags[0], flags.length) : []));
    this.conflictCount = conflicts.length;
    this.unknown = run.flags.filter((f) => f.status === 'UNKNOWN');
    this.cityName = run.name;
    this.title = `${conflicts.length} lines the state says ${run.name} can't require`;
    this.sourceNote = run.sourceLabel;
    this.sidebarSource = ShowcaseModel.sidebar(conflicts);
  }

  private static sidebar(conflicts: Flag[]): string {
    const first = conflicts[0]?.citations[0];
    if (!first) return '';
    const pages = new Set<number>();
    for (const flag of conflicts) {
      for (const c of flag.citations) {
        if (c.sourceId !== first.sourceId || !c.page) continue;
        for (const p of c.page.split(/\s*,\s*/)) if (/^\d+$/.test(p)) pages.add(Number(p));
      }
    }
    const sorted = [...pages].sort((a, b) => a - b);
    const where = sorted.length === 0 ? '' : `, ${sorted.length === 1 ? 'p.' : 'pp.'} ${sorted.join(', ')}`;
    return `${first.label.split(' (')[0]}${where}. Checked ${first.checked}.`;
  }
}
