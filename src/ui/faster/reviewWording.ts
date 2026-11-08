import type { Phase } from '../../contract/types';

/** Wording for phases whose length is unknown, built from the phase labels so it follows the data. */
export function unknownPhrase(phases: Phase[]): string {
  const labels = phases.filter((p) => p.kind === 'UNKNOWN').map((p) => p.label.toLowerCase());
  return labels.length ? ` plus an unknown ${labels.join(' and ')}` : '';
}
