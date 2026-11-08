// What the hero shows, worked out from the engine's check of one city and from the source index. Nothing about the
// law is typed here: counts, section numbers, pages and dates all come from the data. Only layout words are ours.
import sourcesRaw from '../../../data/sources/index.json';
import { getFasterPaths, getTimeline } from '../../contract/api';
import type { CityRun, Flag, Pathway } from '../../contract/types';
import { RUNS } from '../../ui/data';

interface SourceRow {
  id: string;
  title: string;
  published: string | null;
}
const SOURCES: readonly SourceRow[] = sourcesRaw;

const PATHWAY_NAME: Record<Pathway, string> = { ADU: 'ADU', SB9: 'Duplex (SB 9)' };

export interface HeroRow {
  text: string;
  tag: string;
}
/** A line on a letter card. `quoted` is true only for the letter's own words; data summaries are shown plain. */
export interface HeroLine {
  text: string;
  quoted: boolean;
}
export interface HeroLetter {
  sourceId: string;
  ref: string;
  line: HeroLine | null;
}

/** Cuts a quoted requirement down to a short line: no opening quote, ends at a whole word with "...". */
export function shortExcerpt(text: string, max: number): string {
  const plain = text.replace(/^"/, '').replace(/"?\s*\(.*$/s, '').trim();
  if (plain.length <= max) return plain.replace(/"$/, '');
  const cut = plain.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,;:.\s]+$/, '')}...`;
}

function pageTag(flag: Flag): string {
  const cite = flag.citations[0];
  if (!cite) return 'Source';
  const pages = cite.page ?? '';
  const who = cite.sourceId.startsWith('hcd-') ? 'HCD' : cite.label;
  return pages ? `${who} ${pages.includes(',') ? 'pp.' : 'p.'} ${pages}` : who;
}

function findSource(prefix: string): SourceRow[] {
  return SOURCES.filter((s) => s.id.startsWith(prefix)).sort((a, b) => (a.published ?? '').localeCompare(b.published ?? ''));
}

export class HeroContent {
  readonly linesRead: number;
  readonly conflicts: number;
  readonly unchecked: number;
  readonly rows: HeroRow[];
  readonly windowTitle: string;
  readonly windowHeading: string;
  readonly cityName: string;
  readonly summary: string;
  readonly ordinance: { heading: string; ref: string; quotes: string[]; badge: number };
  readonly letters: HeroLetter[];
  readonly statute: { heading: string };
  readonly handbook: { title: string; date: string };

  private constructor(run: CityRun) {
    const clashes = run.flags.filter((f) => f.status === 'CONFLICTS');
    this.cityName = run.name;
    this.linesRead = run.flags.length;
    this.conflicts = clashes.length;
    this.unchecked = run.flags.filter((f) => f.status === 'UNKNOWN').length;
    this.summary = `Fast Track read ${this.linesRead} lines. ${this.conflicts} clash with state law. ${this.unchecked} we haven't checked.`;
    this.windowHeading = `${run.name} ${run.pathway === 'SB9' ? 'duplex' : 'ADU'}.`;
    this.windowTitle =`${run.name} · ${PATHWAY_NAME[run.pathway]}`;
    this.rows = clashes.slice(0, 3).map((f) => ({ text: shortExcerpt(f.itemText, 58), tag: pageTag(f) }));
    this.ordinance = {
      heading: `${run.name} ordinance`,
      ref: ordinanceRef(run),
      quotes: clashes.slice(0, 2).map((f) => shortExcerpt(f.itemText, 46)),
      badge: this.conflicts,
    };
    this.letters = letterDocs(run);
    this.statute = statuteCard(run);
    this.handbook = handbookDoc();
  }

  static from(run: CityRun): HeroContent {
    return new HeroContent(run);
  }
}

function ordinanceRef(run: CityRun): string {
  const ord = /Ordinance ([\d-]+)/.exec(run.sourceLabel)?.[1];
  const sec = /Sec\.? ([\d.]*\d)/.exec(run.flags[0]?.itemText ?? '')?.[1];
  return [ord && `Ord. ${ord}`, sec && `§ ${sec}`].filter(Boolean).join(' · ');
}

/** The statute card: the section of the last law phase on the run's own pathway (SB 9 or ADU timeline). */
function statuteCard(run: CityRun): { heading: string } {
  const section = getTimeline(run.pathway)
    .filter((p) => p.kind === 'LAW' && p.citation?.section)
    .at(-1)?.citation?.section;
  return { heading: section ? `Gov. Code § ${section}` : 'Gov. Code' };
}

/** What one letter card may say: a quote from a flag that cites this letter, else a timeline phase or faster path that
 *  cites it, else nothing. */
function letterLine(run: CityRun, sourceId: string): HeroLine | null {
  const cites = (c: { sourceId: string }) => c.sourceId === sourceId;
  for (const flag of run.flags.filter((f) => f.citations.some(cites))) {
    const quotes = [...(flag.why ?? '').matchAll(/"([^"]+)"/g)].map((m) => m[1] ?? '');
    const quote = quotes.find((q) => /must remove/.test(q));
    if (quote) return { text: quote, quoted: true };
  }
  const phase = getTimeline(run.pathway).find((p) => p.citation && cites(p.citation));
  if (phase) return { text: `${phase.label}: ${phase.value}`, quoted: false };
  const faster = getFasterPaths(run.pathway).find((p) => p.citations.some(cites));
  return faster ? { text: faster.title, quoted: false } : null;
}

function letterDocs(run: CityRun): HeroLetter[] {
  return findSource(`hcd-${run.city}-`).map((s) => ({
    sourceId: s.id,
    ref: `Letter to ${run.name} · ${s.published}`,
    line: letterLine(run, s.id),
  }));
}

function handbookDoc(): { title: string; date: string } {
  const title = SOURCES.find((s) => s.id.includes('handbook'))?.title ?? '';
  const m = /^(?:California )?(.*?), (\w+ \d{4})/.exec(title);
  return { title: m ? `California ${m[1]}` : title, date: m?.[2] ?? '' };
}

/** The words that slide past in the ticker: the cities checked, then the kinds of source behind them. */
export function tickerItems(): string[] {
  const cities = RUNS.map((r) => r.name).sort();
  const letters = SOURCES.some((s) => s.id.startsWith('hcd-') && /letter/i.test(s.title)) ? ['HCD letters'] : [];
  const statutes = SOURCES.flatMap((s) => {
    const m = /^gov-(\d+)$/.exec(s.id);
    return m ? [`Gov. Code § ${m[1]}`] : [];
  });
  const handbooks = SOURCES.filter((s) => s.id.includes('handbook')).map((s) => s.title.replace(/^California /, '').replace(/ \(HCD\)$/, ''));
  return [...cities, ...letters, ...statutes, ...handbooks];
}
