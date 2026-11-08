// Step 3, what stands in the way. Fast Track reads the city's rules beside the state's own words, lights up each
// clash in both, then shows one card per clash: each side in plain words, how they clash, and the time at stake.
// Lines that do not clash are listed after. A city already read in this visit, or less motion, skips the reading.
import { useEffect, useMemo, useState } from 'react';
import type { CityRun } from '../../contract/types';
import { prefersReducedMotion } from '../../theme';
import type { Item } from '../model';
import { ClashCards } from '../results/ClashCards';
import { ClashList } from '../results/ClashList';
import { OtherLines } from '../results/OtherLines';
import { type Focus, ReadDocs } from '../results/ReadDocs';
import { ReadModel } from '../results/ReadModel';
import { ReadScan, type ScanFrame } from '../results/ReadScan';
import { useScanClock } from '../results/useScanClock';
import './results.css';

interface Props {
  run: CityRun;
  items: Item[];
  /** True when this city was already read in this visit. */
  read?: boolean;
  /** Called once the reading is over, so a return to this step skips it. */
  onRead?: () => void;
  onNext: () => void;
  onBack: () => void;
}

function Status({ frame, lines, onSkip }: { frame: ScanFrame; lines: number; onSkip: () => void }) {
  const found = frame.found.length;
  return (
    <div className="rd-status">
      <p>
        <span>{frame.line === null ? `All ${lines} lines read` : `Line ${frame.line + 1} of ${lines}`}</span>
        {found ? <span>{` · ${found} clash${found === 1 ? '' : 'es'} found`}</span> : null}
      </p>
      <button type="button" className="rs-skip" onClick={onSkip}>Skip to the results</button>
    </div>
  );
}

function Tally({ list }: { list: ClashList }) {
  return (
    <ul className="rs-tally" aria-label="Lines by status">
      {list.tally.map((t) => (
        <li key={t.status}><span className={`rs-chip rs-c-${t.status}`}>{t.label}</span><b className="mono">{t.n}</b></li>
      ))}
    </ul>
  );
}

export function Results({ run, items, read = false, onRead, onNext, onBack }: Props) {
  const model = useMemo(() => new ReadModel(run, items), [run, items]);
  const list = useMemo(() => new ClashList(items), [items]);
  const scan = useMemo(() => new ReadScan(model.lines), [model]);
  const [skipped, setSkipped] = useState(() => read || prefersReducedMotion());
  const ms = useScanClock(scan.total, !skipped);
  const frame = skipped ? scan.end : scan.at(ms);
  const settled = frame.done;
  const [focus, setFocus] = useState<Focus | null>(null);

  useEffect(() => {
    if (settled) onRead?.();
  }, [settled, onRead]);

  return (
    <div className={settled ? 'rs settled' : 'rs reading'}>
      <h1 className="gd-q rs-h">{settled ? model.heading : model.readingHeading}</h1>
      {settled ? <Tally list={list} /> : <Status frame={frame} lines={model.lines.length} onSkip={() => setSkipped(true)} />}
      <ReadDocs model={model} run={run} frame={frame} focus={focus} />
      {settled ? <ClashCards model={model} run={run} onFocus={(n) => setFocus((f) => ({ n, key: (f?.key ?? 0) + 1 }))} /> : null}
      {settled ? <OtherLines model={model} list={list} /> : null}
      <div className="gd-nav">
        <button type="button" className="btn" onClick={onBack}>Back</button>
        {settled ? <button type="button" className="btn solid" onClick={onNext}>Next: time saved</button> : null}
      </div>
    </div>
  );
}
