// The checking reveal: each line gets its verdict in turn, then the list and its sources open.
import { useEffect, useRef, useState } from 'react';
import { VERDICT } from '../../letter/verdict';
import type { Item } from '../model';

const LINE_MS = 650;
const PAUSE_MS = 900;

interface Props {
  items: Item[];
  onDone: () => void;
}

export function Checking({ items, onDone }: Props) {
  const n = items.length;
  const [shown, setShown] = useState(0);
  const box = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => (shown >= n ? onDone() : setShown(shown + 1)), shown >= n ? PAUSE_MS : LINE_MS);
    return () => window.clearTimeout(t);
  }, [shown, n, onDone]);
  useEffect(() => {
    if (box.current) box.current.scrollTop = box.current.scrollHeight;
  }, [shown]);

  const pct = n ? (Math.min(shown, n) / n) * 100 : 100;
  return (
    <div className="rs-check">
      <h1 className="gd-q rs-h">{`Checking ${n} lines against state law`}</h1>
      <div className="rs-bar" aria-hidden="true"><i style={{ width: `${pct}%` }} /></div>
      <ol className="rs-list" ref={box} aria-live="polite">
        {items.slice(0, Math.min(n, shown + 3)).map((it, k) => (
          <li key={it.itemId} className={k < shown ? 'rs-row done' : 'rs-row'}>
            <span className="rs-text">{it.text}</span>
            <span className="mono rs-id">{it.itemId}</span>
            {k < shown
              ? <span className={`rs-chip rs-c-${it.worst} rs-pop`}>{VERDICT[it.worst].chip}</span>
              : <span className="rs-ph" aria-hidden="true" />}
          </li>
        ))}
      </ol>
      <button type="button" className="rs-skip" onClick={() => setShown(n)}>Show all now</button>
    </div>
  );
}
