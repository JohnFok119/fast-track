// Engine-internal shapes. The shared contract lives in src/contract/types.ts.
import type { CitationMapping, Status } from '../contract/types';

export interface Source {
  id: string;
  title: string;
  url: string;
  /** Date the source was checked, YYYY-MM-DD. */
  checked: string;
  mirror: boolean;
}

export interface Cite {
  sourceId: string;
  label: string;
  section?: string;
  page?: string;
}

interface RuleBase {
  id: string;
  status: Exclude<Status, 'UNKNOWN'>;
  why: string;
  note?: string;
  cites: Cite[];
  /** When set, the rule applies only to these city ids (a finding from HCD's letter to that city). */
  cities?: string[];
}

export interface MatchRule extends RuleBase {
  kind: 'match';
  allOf: RegExp[];
  anyOf: RegExp[];
  noneOf: RegExp[];
}

export interface CitationRule extends RuleBase {
  kind: 'citation';
  mapping: CitationMapping;
  /** Matches the old number only when no digit or dot comes before and no digit follows. */
  oldPattern: RegExp;
}

export type Rule = MatchRule | CitationRule;

export interface CityItem {
  itemId: string;
  text: string;
  page?: string;
}

export interface CityInput {
  city: string;
  /** Display name, e.g. "Dana Point". */
  name: string;
  sourceLabel: string;
  sourceUrl: string;
  saved: string;
  items: CityItem[];
}
