// Plain-language wording for each flag status, shared by the screen and the letter drafts.
import type { Status } from '../contract/types';

export const VERDICT: Record<Status, { label: string; chip: string; explain: string }> = {
  CONFLICTS: {
    label: 'Not allowed by state law',
    chip: 'Not allowed',
    explain: 'The state says a city cannot require this. You can ask the city to drop it, citing the sources below.',
  },
  OUTDATED_CITATION: {
    label: 'Old law number',
    chip: 'Old law number',
    explain: 'The city cites a section that has since been renumbered. Ask the city to cite the current section.',
  },
  UNKNOWN: {
    label: 'Not checked',
    chip: 'Not checked',
    explain: 'No rule covers this line yet. Fast Track does not guess: ask the city or a professional.',
  },
  OK: {
    label: 'Allowed by state law',
    chip: 'Allowed',
    explain: 'State law lets the city require this. The source is below.',
  },
};
