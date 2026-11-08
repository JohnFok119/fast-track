import type { Phase } from '../../contract/types';

/** Names the phases whose length is unknown, from their own labels, or '' when every length is known. */
export function unknownPhrase(phases: Phase[]): string {
  const labels = phases.filter((p) => p.kind === 'UNKNOWN').map((p) => p.label.toLowerCase());
  return labels.length ? `an unknown ${labels.join(' and ')}` : '';
}
