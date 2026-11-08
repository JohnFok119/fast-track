// Step 3's reading view: the city's lines on one side, the state's own words on the other, each clash numbered and
// found in both. One city at a time: the state side is the source that city's results cite most, so a reader always
// sees Dana Point's rules against HCD's letter to Dana Point, never another city's. No law is typed here.
import type { ClashSummary } from '../../assist/clash-types';
import type { CityRun, Flag, Status } from '../../contract/types';
import { VERDICT } from '../../letter/verdict';
import type { Item } from '../model';
import { type BlockKind, LetterText } from './LetterText';
import { markdownOf, sourceEntry } from './letters';
import { clashRanges, type Mark, oldRanges, type Part, type Range, toParts } from './marks';
import { citySection, markWords, type Segment } from './quote';
import { publishedOn } from './sources';
import { summaryOf } from './summaries';

export interface CityLine {
  id: string;
  status: Status;
  chip: string;
  text: string;
  segments: Segment[];
  section: string | null;
  /** The clash this line belongs to, or null. */
  pair: number | null;
  /** The state block to look up while reading this line, or null when there is nothing new to find. */
  look: number | null;
}

export interface StateBlock {
  kind: BlockKind;
  parts: Part[];
}

export interface Pair {
  n: number;
  ruleId: string;
  itemIds: string[];
  /** Index of the clash's first line. */
  line: number;
  /** The block holding most of HCD's quoted words for it, or null when none are found. */
  block: number | null;
  title: string;
  summary: ClashSummary | null;
  flag: Flag;
}

export interface StateDoc {
  id: string;
  title: string;
  url: string;
  dated: string | null;
  /** How the reading heading names it: "HCD's letter", "the ADU Handbook". */
  short: string;
}

/** The source the city's results cite most, preferring HCD's letters to that city. Only sources saved as text count. */
function pickDoc(run: CityRun): StateDoc | null {
  const count = (flags: Flag[]) => {
    const n = new Map<string, number>();
    for (const c of flags.flatMap((f) => f.citations)) if (markdownOf(c.sourceId)) n.set(c.sourceId, (n.get(c.sourceId) ?? 0) + 1);
    return [...n].sort((a, b) => b[1] - a[1]).map(([id]) => id);
  };
  const conflicts = run.flags.filter((f) => f.status === 'CONFLICTS');
  const id = count(conflicts).find((i) => i.startsWith('hcd-')) ?? count(run.flags)[0];
  const entry = id ? sourceEntry(id) : null;
  if (!id || !entry) return null;
  const short = id.startsWith('hcd-') ? "HCD's letter" : id.startsWith('adu-handbook') ? 'the ADU Handbook' : 'state law';
  return { id, title: entry.title, url: entry.url, dated: publishedOn(id), short };
}

/** "sb9-dana-point-one-story" becomes "One story": a stand-in when no summary was written. */
function ruleTitle(ruleId: string, run: CityRun): string {
  const words = ruleId.replace(`${run.pathway.toLowerCase()}-`, '').replace(`${run.city}-`, '').replace(/-/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export class ReadModel {
  readonly cityName: string;
  readonly doc: StateDoc | null;
  readonly lines: CityLine[];
  readonly blocks: StateBlock[];
  readonly pairs: Pair[];

  constructor(run: CityRun, items: Item[], summaries?: ClashSummary[]) {
    this.cityName = run.name;
    this.doc = pickDoc(run);
    const letter = LetterText.parse((this.doc && markdownOf(this.doc.id)) ?? '').blocks;
    const pairs = ReadModel.pairsOf(run, items, summaries);
    const olds = [...new Set(items.flatMap((it) => it.flags.flatMap((f) => (f.mapping ? [f.mapping.old] : []))))];
    const ranges = letter.map((b) => (b.kind === 'quote' ? ReadModel.rangesOf(b.text, pairs, olds) : []));
    this.blocks = letter.map((b, k) => ({ kind: b.kind, parts: toParts(b.text, ranges[k] ?? []) }));
    this.pairs = pairs.map((p) => ({ ...p, block: ReadModel.best(ranges, p.n) }));
    this.lines = ReadModel.linesOf(items, this.pairs, ranges);
  }

  get readingHeading(): string {
    return `Reading ${this.cityName}'s rules against ${this.doc?.short ?? 'state law'}`;
  }

  get heading(): string {
    const no = this.lines.filter((l) => l.status === 'CONFLICTS').length;
    return `${no} of ${this.lines.length} line${this.lines.length === 1 ? '' : 's'} the state says no to.`;
  }

  private static pairsOf(run: CityRun, items: Item[], summaries?: ClashSummary[]): Pair[] {
    const pairs: Pair[] = [];
    items.forEach((it, line) => {
      const flag = it.flags.find((f) => f.status === 'CONFLICTS' && f.ruleId);
      if (!flag?.ruleId) return;
      const known = pairs.find((p) => p.ruleId === flag.ruleId);
      if (known) {
        known.itemIds.push(it.itemId);
        return;
      }
      const summary = summaryOf(run.city, flag.ruleId, summaries);
      const title = summary?.title ?? ruleTitle(flag.ruleId, run);
      pairs.push({ n: pairs.length + 1, ruleId: flag.ruleId, itemIds: [it.itemId], line, block: null, title, summary, flag });
    });
    return pairs;
  }

  private static rangesOf(text: string, pairs: Pair[], olds: string[]): Range[] {
    return [...pairs.flatMap((p) => clashRanges(text, p.flag.why ?? '', p.n)), ...olds.flatMap((o) => oldRanges(text, o))];
  }

  /** The block with the most ranges carrying `mark`; the first one on a tie. */
  private static best(ranges: Range[][], mark: Mark): number | null {
    let best: number | null = null;
    let most = 0;
    ranges.forEach((rs, k) => {
      const n = rs.filter((r) => r.mark === mark).length;
      if (n > most) [best, most] = [k, n];
    });
    return best;
  }

  private static linesOf(items: Item[], pairs: Pair[], ranges: Range[][]): CityLine[] {
    const looked = new Set<string>();
    const oldBlock = ReadModel.best(ranges, 'old');
    return items.map((it, k) => {
      const pair = pairs.find((p) => p.itemIds.includes(it.itemId)) ?? null;
      const olds = it.flags.flatMap((f) => (f.mapping ? [f.mapping.old] : []));
      let look: number | null = null;
      if (pair && pair.line === k) look = pair.block;
      else if (olds.length && oldBlock !== null && !looked.has('old')) look = oldBlock;
      if (olds.length) looked.add('old');
      return {
        id: it.itemId,
        status: it.worst,
        chip: VERDICT[it.worst].chip,
        text: it.text,
        segments: markWords(it.text, olds),
        section: citySection(it.text),
        pair: pair?.n ?? null,
        look,
      };
    });
  }
}
