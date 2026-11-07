// Shapes shared by the explain route (vite-plugins/claude-route.ts) and the browser client.
import type { City } from '../contract/types';

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
