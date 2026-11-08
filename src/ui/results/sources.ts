// When each source was published, read from data/sources/index.json. A source with no date, or "UNKNOWN", gets none.
import sources from '../../../data/sources/index.json';
import { day, month } from '../model';

const PUBLISHED = new Map<string, string | null>(sources.map((s) => [s.id, s.published]));

/** "Apr 17, 2023" for a full date, "Mar 2026" for a month, null when the source gives no date. */
export function publishedOn(sourceId: string): string | null {
  const value = PUBLISHED.get(sourceId) ?? null;
  if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) return day(value);
  if (value && /^\d{4}-\d{2}$/.test(value)) return month(value);
  return null;
}
