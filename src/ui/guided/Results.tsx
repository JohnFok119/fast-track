// Step 3, what stands in the way: the checking reveal, then the checked lines with the source open beside each one.
import { useCallback, useState } from 'react';
import type { CityRun } from '../../contract/types';
import { prefersReducedMotion } from '../../theme';
import type { Item } from '../model';
import { Checking } from '../results/Checking';
import { Clash } from '../results/Clash';
import './results.css';

interface Props { run: CityRun; items: Item[]; onNext: () => void; onBack: () => void }

export function Results({ run, items, onNext, onBack }: Props) {
  // Less motion, or nothing to check: skip the reveal and show the end state.
  const [done, setDone] = useState(() => prefersReducedMotion() || items.length === 0);
  const finish = useCallback(() => setDone(true), []);

  return (
    <div className="rs">
      {done ? <Clash run={run} items={items} /> : <Checking items={items} onDone={finish} />}
      <div className="gd-nav">
        <button type="button" className="btn" onClick={onBack}>Back</button>
        {done ? <button type="button" className="btn solid" onClick={onNext}>Next: time saved</button> : null}
      </div>
    </div>
  );
}
