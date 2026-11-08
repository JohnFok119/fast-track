// Every law name, number, quote, date and citation the story shows, read from the data. Quotes are cut word for word
// from the check run. When the data lacks a fact, the story says "unknown" instead of guessing.
import sourceIndex from '../../../data/sources/index.json';
import { getPaths, getTimeline, runCheck } from '../../contract/api';
import type { BuildPath, Citation, CityRun, Phase } from '../../contract/types';

export interface SourceEntry {
  id: string;
  title: string;
  url: string;
  published: string | null;
  checked: string;
}

export interface Quote {
  text: string;
  /** The words set in bold, inside text. */
  strong: string;
}

export interface Cite {
  /** Short line shown on the page, e.g. "HCD letter to Dana Point · 2023-04-17 · p. 4". */
  text: string;
  url: string;
  /** The full citation: label, section, page and the date it was checked. */
  title: string;
}

export interface Clock {
  amount: string;
  unit: string;
  cite: Cite;
}

const UNKNOWN = 'unknown';
const FLOOR_RULE = 'sb9-dana-point-floor-area-cap';
const STORY_RULE = 'sb9-dana-point-one-story';
const CLOCK_PHASE = 'review';

/** The first capture group of pattern in text, or "unknown" with a logged reason. */
function pick(text: string | undefined, pattern: RegExp, what: string): string {
  const found = text?.match(pattern)?.[1];
  if (found) return found;
  console.error(`[story] could not find ${what} in the data; showing "unknown"`);
  return UNKNOWN;
}

function quote(text: string | undefined, pattern: RegExp, strong: RegExp, what: string): Quote {
  const whole = pick(text, pattern, what);
  return { text: whole, strong: whole === UNKNOWN ? '' : (whole.match(strong)?.[0] ?? '') };
}

function cite(citation: Citation | undefined, sources: readonly SourceEntry[], withPage: boolean): Cite {
  const source = sources.find((s) => s.id === citation?.sourceId);
  if (!citation || !source) {
    console.error('[story] a citation or its source is missing from the data; showing "unknown"');
    return { text: UNKNOWN, url: '', title: UNKNOWN };
  }
  // "HCD letter to the City of Dana Point (SB 9 ordinance, ...)" reads "HCD letter to Dana Point".
  const name = source.title.replace(/\s*\(.*\)$/, '').replace('the City of ', '');
  const page = withPage && citation.page ? ` · p. ${citation.page}` : '';
  const detail = [citation.section && `section ${citation.section}`, citation.page && `p. ${citation.page}`, `checked ${citation.checked}`];
  return {
    text: `${name} · ${source.published ?? UNKNOWN}${page}`,
    url: citation.url,
    title: [citation.label, ...detail].filter(Boolean).join(', '),
  };
}

export class StoryFacts {
  private constructor(
    readonly city: string,
    /** The law behind the duplex path, e.g. "SB 9". */
    readonly lawName: string,
    readonly conflicts: number,
    readonly total: number,
    /** The city's floor area limit, word for word, and HCD's order to remove it. */
    readonly cityQuote: Quote,
    readonly hcdQuote: Quote,
    readonly floorCap: string,
    readonly oneStory: string,
    /** The usual height HCD compares against. */
    readonly usual: string,
    readonly floorCite: Cite,
    readonly clock: Clock,
  ) {}

  static load(): StoryFacts {
    return StoryFacts.from(runCheck('dana-point'), getPaths(), getTimeline('SB9'), sourceIndex);
  }

  static from(run: CityRun, paths: readonly BuildPath[], timeline: readonly Phase[], sources: readonly SourceEntry[]): StoryFacts {
    const floor = run.flags.find((f) => f.ruleId === FLOOR_RULE);
    const story = run.flags.find((f) => f.ruleId === STORY_RULE);
    const phase = timeline.find((p) => p.id === CLOCK_PHASE);
    const cityQuote = quote(floor?.itemText, /(shall not exceed [\d,]+ square feet)/, /[\d,]+ square feet/, 'the floor area limit');
    return new StoryFacts(
      run.name,
      pick(paths.find((p) => p.pathway === 'SB9')?.label, /\((SB \d+)\)/, 'the duplex law name'),
      run.flags.filter((f) => f.status === 'CONFLICTS').length,
      run.flags.length,
      cityQuote,
      quote(floor?.why, /(The City must remove [^."]*\.)/, /must remove/, "HCD's order to remove the limit"),
      pick(cityQuote.text, /([\d,]+) square feet/, 'the floor area number'),
      pick(story?.itemText, /limited to (one story)/, 'the one-story limit'),
      pick(story?.why, /\((\d+ feet and \w+ stories)\)/, 'the usual height'),
      cite(floor?.citations[0], sources, true),
      {
        amount: pick(phase?.kind === 'LAW' ? phase.value : undefined, /^(\d+) /, 'the review deadline'),
        unit: pick(phase?.value, /^\d+ (\w+)$/, 'the review deadline unit'),
        cite: cite(phase?.citation, sources, false),
      },
    );
  }
}
