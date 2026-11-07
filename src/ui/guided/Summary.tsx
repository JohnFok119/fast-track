// STUB, replaced by a worker: step 6, a one-card summary of what the owner now knows.
import type { BuildPath, CityRun, Contact, Phase } from '../../contract/types';
import type { Item } from '../model';

interface Props {
  path: BuildPath;
  run: CityRun;
  items: Item[];
  /** The fast path for this pathway. */
  phases: Phase[];
  /** The event brief's typical path without a fast track (all ASSUMPTION). */
  baseline: Phase[];
  escalation: Contact;
  onBack: () => void;
  onRestart: () => void;
}

export function Summary({ path, run, items, onBack, onRestart }: Props) {
  return (
    <div>
      <div className="gd-kicker">Summary</div>
      <h1 className="gd-q">{path.label} in {run.name}</h1>
      <p className="gd-sub">{items.length} lines checked.</p>
      <div className="gd-nav">
        <button type="button" className="btn" onClick={onBack}>Back</button>
        <button type="button" className="btn solid" onClick={onRestart}>Start over</button>
      </div>
    </div>
  );
}
