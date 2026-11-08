// The saved state sources the reading view can open, by id: the index entry and the excerpt file it names.
import index from '../../../data/sources/index.json';

export interface SourceEntry {
  id: string;
  title: string;
  url: string;
  file?: string;
}

const FILES = import.meta.glob<string>('../../../data/sources/*.md', { query: '?raw', import: 'default', eager: true });
const ENTRIES = new Map((index as SourceEntry[]).map((s) => [s.id, s]));

export function sourceEntry(id: string): SourceEntry | null {
  return ENTRIES.get(id) ?? null;
}

/** The saved excerpt file for a source, or null when the index names no file for it. */
export function markdownOf(id: string): string | null {
  const file = ENTRIES.get(id)?.file;
  if (!file) return null;
  return FILES[`../../../${file}`] ?? null;
}
