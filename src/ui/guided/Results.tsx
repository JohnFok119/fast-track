// STUB, replaced by a worker: step 3, what stands in the way (the checking reveal, the summary, one line at a time).
import type { CityRun } from '../../contract/types';
import { Detail } from '../Requirements';
import type { Item } from '../model';

interface Props { run: CityRun; items: Item[]; onLetter: () => void; onNext: () => void; onBack: () => void }

export function Results({ run, items, onLetter, onNext, onBack }: Props) {
  return (
    <div>
      <div className="gd-kicker">Step 3 · {run.name}</div>
      <h1 className="gd-q">{items.length} lines checked</h1>
      <Detail item={items[0]} onLetter={onLetter} />
      <div className="gd-nav">
        <button type="button" className="btn" onClick={onBack}>Back</button>
        <button type="button" className="btn solid" onClick={onNext}>Continue</button>
      </div>
    </div>
  );
}
