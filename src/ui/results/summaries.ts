// The clash summaries Claude wrote ahead of time (scripts/write-clash-summaries.ts), checked before they were saved.
import type { ClashSummaries, ClashSummary } from '../../assist/clash-types';
import saved from '../../../data/summaries/clashes.json';
import type { City } from '../../contract/types';

export const SUMMARIES = saved as ClashSummaries;

/** The summary of one clash, or null when none was written for it. */
export function summaryOf(city: City, ruleId: string, list: ClashSummary[] = SUMMARIES.clashes): ClashSummary | null {
  return list.find((s) => s.city === city && s.ruleId === ruleId) ?? null;
}
