// Turns a source reference from the data files into a contract Citation. "No source, no citation."
import type { Citation } from '../contract/types';
import type { Source } from './types';

export interface SourceRef {
  sourceId: string;
  section?: string;
  page?: string;
}

/** The label defaults to the source's title. Mirror-only statute text says so until checked on leginfo. */
export function citeSource(sources: Map<string, Source>, ref: SourceRef, label?: string): Citation {
  const source = sources.get(ref.sourceId);
  if (!source) throw new Error(`no source, no citation: "${ref.sourceId}" is not in data/sources/index.json`);
  const base = label ?? source.title;
  return {
    sourceId: ref.sourceId,
    label: source.mirror ? `${base} (not yet checked on leginfo)` : base,
    url: source.url,
    section: ref.section,
    page: ref.page,
    checked: source.checked,
  };
}
