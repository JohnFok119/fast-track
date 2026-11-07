// Shared shapes between the engine (Giuseppi's session) and the UI and letter (Johnny).
// Change this file only through Giuseppi's session, so both sides keep building against the same shapes.

export const STATUSES = ['OK', 'CONFLICTS', 'OUTDATED_CITATION', 'UNKNOWN'] as const;
export type Status = (typeof STATUSES)[number];

export const CITIES = ['irvine', 'anaheim', 'dana-point', 'orange'] as const;
export type City = (typeof CITIES)[number];

/** One source behind a flag. Every non-UNKNOWN flag carries at least one. */
export interface Citation {
  /** Id of the entry in data/sources/index.json. */
  sourceId: string;
  /** Human label, e.g. "Gov Code 66315" or "HCD letter to the City of Irvine, 2025-03-27". */
  label: string;
  url: string;
  section?: string;
  page?: string;
  /** Date the source was checked, YYYY-MM-DD. */
  checked: string;
}

/** Old to new section mapping, only on OUTDATED_CITATION flags. */
export interface CitationMapping {
  old: string;
  /** The new section or range, as the source states it. */
  now: string;
  /** The single exact replacement section, or null when the source gives none (show it as UNKNOWN). */
  exactSection: string | null;
}

/** One checked requirement. Invariants are enforced by parseFlag in ./parse.ts. */
export interface Flag {
  itemId: string;
  itemText: string;
  status: Status;
  /** Null exactly when no rule matched, which means status is UNKNOWN. */
  ruleId: string | null;
  why?: string;
  /** Empty exactly when status is UNKNOWN. */
  citations: Citation[];
  mapping?: CitationMapping;
  note?: string;
}

/** The result of checking one city's saved requirements. */
export interface CityRun {
  city: City;
  /** Display name for tabs and headings, e.g. "Dana Point". */
  name: string;
  sourceLabel: string;
  sourceUrl: string;
  /** Date the city's requirements were saved, YYYY-MM-DD. */
  saved: string;
  /** True for the labelled sample runs. The UI must show a SAMPLE label when true. */
  sample: boolean;
  flags: Flag[];
}

/** A legal review deadline shown in the clocks panel. */
export interface Clock {
  id: string;
  label: string;
  /** The value as the source states it, e.g. "15 business days", or "UNKNOWN". */
  value: string;
  section: string | null;
  sourceId: string | null;
  /** UNCONFIRMED until checked against the Handbook or leginfo. */
  status: 'CONFIRMED' | 'UNCONFIRMED';
  checked: string;
  note?: string;
}
