// Step 3, what stands in the way: the checking reveal, then a compare table (city wording vs state law).
import { useEffect, useRef, useState } from 'react';
import type { CityRun, Flag, Status } from '../../contract/types';
import { VERDICT } from '../../letter/verdict';
import { citeMeta, countBy, day, type Item } from '../model';
import './results.css';

interface Props { run: CityRun; items: Item[]; onNext: () => void; onBack: () => void }

const LINE_MS = 650;
const PAUSE_MS = 900;
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

const ICON: Record<Status, string> = {
  CONFLICTS: 'M6 6l12 12M18 6L6 18',
  OUTDATED_CITATION: 'M20 12a8 8 0 1 1-2.6-5.9M20 4v4h-4',
  UNKNOWN: 'M9.5 9a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1 1-1.1 1.8M12 17v.01',
  OK: 'M5 12.5l4.5 4.5L19 7.5',
};

function StatusMark({ status }: { status: Status }) {
  return (
    <span className={`rs-mark rs-m-${status}`}>
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={ICON[status]} />
      </svg>
      {VERDICT[status].chip}
    </span>
  );
}

function Detail({ flags }: { flags: Flag[] }) {
  return (
    <div className="rs-detail">
      {flags.map((f, k) => (
        <div key={k} className="rs-why">
          {f.status === 'UNKNOWN' ? null : <p>{f.why}</p>}
          {f.citations.map((c, j) => (
            <p key={j} className="rs-cite">
              <a href={c.url} target="_blank" rel="noopener noreferrer" title={citeMeta(c)}>{c.label}</a>
              {' '}<span>checked {day(c.checked)}</span>
            </p>
          ))}
        </div>
      ))}
    </div>
  );
}

function Row({ item }: { item: Item }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <tr className={open ? 'rs-tr open' : 'rs-tr'} onClick={() => setOpen(!open)}>
        <td className="rs-city">
          <button type="button" className="rs-toggle" aria-expanded={open} onClick={(e) => { e.stopPropagation(); setOpen(!open); }}>
            <span className="rs-clamp" title={item.text}>{item.text}</span>
          </button>
        </td>
        <td className="rs-state">{item.statuses.map((s) => <StatusMark key={s} status={s} />)}</td>
      </tr>
      {open ? <tr className="rs-tr-detail"><td colSpan={2}><Detail flags={item.flags} /></td></tr> : null}
    </>
  );
}

function Summary({ items, n }: { items: Item[]; n: number }) {
  const conflicts = countBy(items, 'CONFLICTS');
  const shown = useCountUp(conflicts, 600);
  return (
    <div className="rs-sum">
      <h1 className="gd-q">
        {conflicts === 0 ? 'No line the state says no to' : <><span className="rs-num">{shown}</span> of {n} lines the state says no to</>}
      </h1>
      <table className="rs-table">
        <thead><tr><th scope="col">The city asks</th><th scope="col">State law</th></tr></thead>
        <tbody>{items.map((it) => <Row key={it.itemId} item={it} />)}</tbody>
      </table>
    </div>
  );
}

export function Results({ run, items, onNext, onBack }: Props) {
  const n = items.length;
  const [done, setDone] = useState(false);
  const [shown, setShown] = useState(() => (reduced() ? n : 0));

  useEffect(() => {
    if (done) return undefined;
    const t = window.setTimeout(() => (shown >= n ? setDone(true) : setShown(shown + 1)), shown >= n ? PAUSE_MS : LINE_MS);
    return () => window.clearTimeout(t);
  }, [done, shown, n]);

  return (
    <div className="rs">
      <div className="gd-kicker">Step 3 of 6 · {run.name}</div>
      {done ? <Summary items={items} n={n} /> : <h1 className="gd-q">Checking {n} lines against state law</h1>}
      {done ? null : <Checking items={items} shown={shown} onSkip={() => setShown(n)} />}
      <div className="gd-nav">
        <button type="button" className="btn" onClick={onBack}>Back</button>
        {done ? <button type="button" className="btn solid" onClick={onNext}>Next: time saved</button> : null}
      </div>
    </div>
  );
}
