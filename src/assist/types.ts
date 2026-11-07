// Shapes shared by the explain route (vite-plugins/claude-route.ts) and the browser client.
import type { Citation, City, Contact, Phase } from '../contract/types.ts';

export interface ExplainRequest {
  city: City;
  itemId: string;
}

export interface ExplainPoint {
  /** Always one of the engine's rule IDs for the item. */
  ruleId: string;
  /** Plain-words text from Claude, checked to hold no citation. */
  text: string;
}

/** fallback: true means show the engine's own "Why" text instead. */
export type ExplainResponse = { fallback: true } | { fallback: false; itemId: string; points: ExplainPoint[] };

export const EXPLAIN_PATH = '/api/explain';
export const PLAN_PATH = '/api/plan';

/** One step of the owner's ordered plan. ref is "rule:<ruleId>", "step:<n>", "contact:<n>" or "phase:<id>". */
export interface PlanAction {
  ref: string;
  /** Plain words from Claude, checked: no citation, no number that is not already in the data. */
  text: string;
  /** From the engine for that ref, never from Claude. May be empty for an ADVICE step. */
  citations: Citation[];
}

/** A requirement no rule covers, and who to ask about it. */
export interface PlanGap {
  itemId: string;
  text: string;
  contact: Contact;
}

/** How a timeline phase protects the owner's time. */
export interface PlanTime {
  phase: Phase;
  text: string;
}

export type PlanResponse =
  | { fallback: true }
  | { fallback: false; city: City; actions: PlanAction[]; gaps: PlanGap[]; time: PlanTime[] };
