import { describe, expect, it } from 'vitest';
import { getPaths, runCheck } from '../../src/contract/api';
import { StepsModel } from '../../src/home/hub/StepsModel';

const run = runCheck('dana-point');
const model = new StepsModel(run, getPaths());

describe('StepsModel', () => {
  it('offers every path from the data and selects the one the run is about', () => {
    expect(model.pills.map((p) => p.label)).toEqual(getPaths().map((p) => p.label));
    expect(model.pills.filter((p) => p.selected).map((p) => p.label)).toEqual(['Duplex or lot split (SB 9)']);
  });

  it('names the city from the run', () => {
    expect(model.cityName).toBe('Dana Point');
  });

  it('pulls the clash example from the run: the city words and the sentence where HCD says remove it', () => {
    expect(model.clash).toEqual({
      cityPhrase: 'shall not exceed 800 square feet',
      hcdSentence: 'The City must remove these requirements.',
    });
  });

  it('has no clash example when the run has none', () => {
    const empty = new StepsModel({ ...run, flags: [] }, getPaths());
    expect(empty.clash).toBeNull();
  });
});
