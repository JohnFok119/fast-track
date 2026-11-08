// One clash, put in plain words by Claude ahead of time and saved in data/summaries/clashes.json.
// The rule set decides that a line clashes; Claude only says what each side says, how they clash, and estimates the
// time at stake. Every summary is checked before it is saved: no citation, and no number the sources do not give,
// except the time estimate, which is an ASSUMPTION and is shown as one.
import type { City } from '../contract/types.ts';

export interface TimeEstimate {
  /** ASSUMPTION: Claude's estimate of the time saved if the clash is cleared, never a measurement. */
  low: number;
  high: number;
  unit: 'weeks' | 'months';
  /** One sentence: which deadlines and typical times the estimate rests on. */
  basis: string;
}

export interface ClashSummary {
  city: City;
  /** The engine's rule that found the clash. One summary per rule per city. */
  ruleId: string;
  /** The city's lines this finding covers, in the city's order. */
  itemIds: string[];
  /** Two to four words, sentence case, e.g. "Two unit cap". */
  title: string;
  /** What the city requires, in plain words. */
  citySays: string;
  /** What the state says about it, in plain words. */
  stateSays: string;
  /** Why the two clash, and what it means for the owner. */
  clash: string;
  time: TimeEstimate;
}

export interface ClashSummaries {
  about: string;
  /** The model that wrote the summaries, e.g. "claude sonnet". Empty until they are written. */
  model: string;
  /** YYYY-MM-DD the summaries were written. Empty until they are written. */
  written: string;
  clashes: ClashSummary[];
}
