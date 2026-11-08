// What the three steps illustrate. The pills, the city and the clash example all come from a real run.
import type { BuildPath, CityRun } from '../../contract/types';

export interface Pill {
  label: string;
  selected: boolean;
}

export interface ClashExample {
  /** The city's own words that clash, as they appear in its text. */
  cityPhrase: string;
  /** The sentence in which HCD says the city must change it. */
  hcdSentence: string;
}

const CITY_PHRASE = /shall not exceed \d[\d,]* square feet/;
const HCD_SENTENCE = /The City must remove [^."]+\./;

export class StepsModel {
  readonly pills: Pill[];
  readonly cityName: string;
  readonly clash: ClashExample | null;

  constructor(run: CityRun, paths: readonly BuildPath[]) {
    const chosen = paths.findIndex((p) => p.pathway === run.pathway);
    this.pills = paths.map((p, i) => ({ label: p.label, selected: i === chosen }));
    this.cityName = run.name;
    this.clash = StepsModel.findClash(run);
  }

  private static findClash(run: CityRun): ClashExample | null {
    for (const flag of run.flags) {
      if (flag.status !== 'CONFLICTS') continue;
      const city = CITY_PHRASE.exec(flag.itemText);
      const hcd = HCD_SENTENCE.exec(flag.why ?? '');
      if (city && hcd) return { cityPhrase: city[0], hcdSentence: hcd[0] };
    }
    return null;
  }
}
