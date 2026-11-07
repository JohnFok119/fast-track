// Step 3, what stands in the way: the checking reveal, then the summary, then one line at a time.
import { useEffect, useRef, useState } from 'react';
import type { CityRun, Status } from '../../contract/types';
import { VERDICT } from '../../letter/verdict';
import { countBy, type Item } from '../model';
import { LineWalk } from './LineWalk';
import './results.css';

interface Props { run: CityRun; items: Item[]; onLetter: () => void; onNext: () => void; onBack: () => void }

const ORDER: Status[] = ['CONFLICTS', 'OUTDATED_CITATION', 'UNKNOWN', 'OK'];
const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function useCountUp(target: number, ms: number): number {
  const [v, setV] = useState(reduced() ? target : 0);
  useEffect(() => {
    if (reduced() || target === 0) return undefined;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - t0) / ms);
      setV(Math.round(target * (1 - (1 - p) ** 3)));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return v;
}

function Checking({ items, shown, onSkip }: { items: Item[]; shown: number; onSkip: () => void }) {
  const box = useRef<HTMLOListElement>(null);
  useEffect(() => { if (box.current) box.current.scrollTop = box.current.scrollHeight; }, [shown]);
  const pct = items.length ? (shown / items.length) * 100 : 100;
  return (
    <>
      <div className="rs-bar" aria-hidden="true"><i style={{ width: `${pct}%` }} /></div>
      <ol className="rs-list" ref={box} aria-live="polite">
        {items.slice(0, Math.min(items.length, shown + 3)).map((it, k) => (
          <li key={it.itemId} className={k < shown ? 'rs-row done' : 'rs-row'}>
            <span className="rs-text">{it.text}</span>
            <span className="mono rs-id">{it.itemId}</span>
            {k < shown
              ? <span className={`pill s-${it.worst} rs-pop`}>{VERDICT[it.worst].chip}</span>
              : <span className="rs-ph" aria-hidden="true" />}
          </li>
        ))}
      </ol>
      <button type="button" className="rs-skip" onClick={onSkip}>Show all now</button>
    </>
  );
}

function Summary({ run, items, onWalk, onLetter }: { run: CityRun; items: Item[]; onWalk: () => void; onLetter: () => void }) {
  const n = items.length;
  const conflicts = countBy(items, 'CONFLICTS');
  const outdated = countBy(items, 'OUTDATED_CITATION');
  const shown = useCountUp(conflicts, 600);
  return (
    <div className="rs-sum">
      <h1 className="gd-q">
        {conflicts === 0 ? 'No line the state says no to' : <><span className="rs-num">{shown}</span> of {n} lines the state says no to</>}
      </h1>
      {outdated > 0 ? <p className="gd-sub">Plus {outdated} with an old law number to update.</p> : null}
      <div className="rs-stack" role="img" aria-label={ORDER.map((s) => `${countBy(items, s)} ${VERDICT[s].chip}`).join(', ')}>
        {ORDER.map((s, k) => (
          <i key={s} className={`bg-${s}`} style={{ flexGrow: countBy(items, s), animationDelay: `${120 + k * 90}ms` }} />
        ))}
      </div>
      <ul className="rs-legend">
        {ORDER.map((s) => <li key={s}><span className={`pill s-${s}`}>{VERDICT[s].chip}</span> <b>{countBy(items, s)}</b></li>)}
      </ul>
      <p className="rs-src">
        From: {run.sourceLabel}{' '}
        <a href={run.sourceUrl} target="_blank" rel="noopener noreferrer">Open the source</a>
      </p>
      <div className="rs-actions">
        <button type="button" className="btn solid" onClick={onWalk}>Go through them one by one</button>
        {items.some((it) => it.needsAttention) ? <button type="button" className="btn" onClick={onLetter}>Write the letter</button> : null}
      </div>
    </div>
  );
}

export function Results({ run, items, onLetter, onNext, onBack }: Props) {
  const n = items.length;
  const [phase, setPhase] = useState<'check' | 'sum' | 'line'>('check');
  const [shown, setShown] = useState(() => (reduced() ? n : 0));

  useEffect(() => {
    if (phase !== 'check') return undefined;
    const t = window.setTimeout(() => (shown >= n ? setPhase('sum') : setShown(shown + 1)), shown >= n ? 450 : 260);
    return () => window.clearTimeout(t);
  }, [phase, shown, n]);

  return (
    <div className="rs">
      <div className="gd-kicker">Step 3 of 5 · {run.name}</div>
      {phase === 'check' ? <h1 className="gd-q">Checking {n} lines against state law</h1> : null}
      {phase === 'check' ? <Checking items={items} shown={shown} onSkip={() => setShown(n)} /> : null}
      {phase === 'sum' ? <Summary run={run} items={items} onWalk={() => setPhase('line')} onLetter={onLetter} /> : null}
      {phase === 'line' ? <LineWalk items={items} onLetter={onLetter} /> : null}
      <div className="gd-nav">
        <button type="button" className="btn" onClick={phase === 'line' ? () => setPhase('sum') : onBack}>Back</button>
        {phase === 'check' ? null : <button type="button" className="btn solid" onClick={onNext}>Next: your timeline</button>}
      </div>
    </div>
  );
}
