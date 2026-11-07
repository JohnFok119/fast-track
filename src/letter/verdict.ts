// Plain-language wording for each flag status, shared by the screen and the letter drafts.
import type { Status } from '../contract/types';

export const VERDICT: Record<Status, { label: string; chip: string; explain: string; letter: string }> = {
  CONFLICTS: {
    label: 'State says no',
    chip: 'State says no',
    explain: 'State law, or HCD (the state housing agency) in its letter to this city, says a city cannot require this. Check the limits below, then ask the city to drop it, citing the sources.',
    letter: 'The sources below say a city cannot require this',
  },
  OUTDATED_CITATION: {
    label: 'Old law number',
    chip: 'Old law number',
    explain: 'The city cites a section that has since been renumbered. Ask the city to cite the current section.',
    letter: 'This cites a section that has since been renumbered',
  },
  UNKNOWN: {
    label: 'Not checked',
    chip: 'Not checked',
    explain: 'No rule covers this line yet. Fast Track does not guess: ask the city or a professional.',
    letter: 'Not checked',
  },
  OK: {
    label: 'Allowed by state law',
    chip: 'Allowed',
    explain: 'State law lets the city require this. The source is below.',
    letter: 'Allowed by state law',
  },
};
