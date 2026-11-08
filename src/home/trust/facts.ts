// The numbers and citations the homepage trust parts show, read from the rule set and the sources, never typed here.
import aduRules from '../../../data/rules/adu.json';
import sb9Rules from '../../../data/rules/sb9.json';
import sourcesRaw from '../../../data/sources/index.json';
import { getFasterPaths, runCheck } from '../../contract/api';
import { CITIES } from '../../contract/types';
import type { Citation, FasterPath } from '../../contract/types';

export interface TrustFacts {
  /** Three short citations that appear one by one, e.g. a section and a letter page. */
  chips: string[];
  /** The dated line, e.g. a letter, its date and its page. */
  dated: string;
  /** The date the sources were checked, YYYY-MM-DD. */
  checked: string;
}

interface SourceDate {
  id: string;
  published: string | null;
}

export class HomeFacts {
  constructor(
    readonly cityNames: string[],
    readonly ruleCount: number,
    readonly trust: TrustFacts,
    readonly fasterPaths: FasterPath[],
    readonly hasMirror: boolean,
  ) {}

  static fromData(): HomeFacts {
    const runs = CITIES.map((c) => runCheck(c));
    const trust = HomeFacts.trustFrom(runs.flatMap((r) => r.flags.map((f) => f.citations)));
    const faster = [...getFasterPaths('SB9'), ...getFasterPaths('ADU')];
    const unique = faster.filter((p, i) => faster.findIndex((q) => q.title === p.title) === i);
    const mirror = (sourcesRaw as { mirror?: boolean }[]).some((s) => s.mirror === true);
    const ruleCount = aduRules.rules.length + sb9Rules.rules.length;
    return new HomeFacts(runs.map((r) => r.name), ruleCount, trust, unique, mirror);
  }

  /** Uses the first flag that cites both a statute and an HCD letter, so the tiles show a real citation. */
  private static trustFrom(lists: Citation[][]): TrustFacts {
    const list = lists.find((l) => l.some((c) => c.sourceId.startsWith('gov-')) && l.some(isLetter));
    const letter = list?.find(isLetter);
    if (!list || !letter) throw new Error('[home] no rule cites both a statute and an HCD letter');
    const chips = list
      .filter((c) => c.sourceId.startsWith('gov-') || isLetter(c))
      .map((c) => (isLetter(c) ? `HCD letter p. ${c.page ?? ''}`.trim() : `§ ${(c.section ?? '').replace(/\(.*$/, '')}`))
      .slice(0, 3);
    const published = (sourcesRaw as SourceDate[]).find((s) => s.id === letter.sourceId)?.published;
    if (!published) throw new Error(`[home] source ${letter.sourceId} has no published date`);
    return { chips, dated: `HCD letter · ${published} · p. ${letter.page ?? ''}`, checked: letter.checked };
  }
}

function isLetter(c: Citation): boolean {
  return c.sourceId.startsWith('hcd-') && !c.sourceId.includes('handbook');
}
