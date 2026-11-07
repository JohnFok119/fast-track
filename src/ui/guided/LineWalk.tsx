// Step 3, phase 3: one line at a time, with a row of cells to jump and arrow keys to move.
import { useEffect, useState } from 'react';
import { VERDICT } from '../../letter/verdict';
import type { Item } from '../model';
import { Detail } from '../Requirements';
import './results.css';

interface Props { items: Item[]; onLetter: () => void }

function typing(t: EventTarget | null): boolean {
  return t instanceof HTMLElement && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable);
}

export function LineWalk({ items, onLetter }: Props) {
  const [i, setI] = useState(0);
  const [dir, setDir] = useState<'fwd' | 'back'>('fwd');
  const n = items.length;
  const current = items[i];

  const goTo = (to: number) => {
    if (to < 0 || to >= n || to === i) return;
    setDir(to > i ? 'fwd' : 'back');
    setI(to);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (typing(e.target)) return;
      if (e.key === 'ArrowRight' && i < n - 1) { setDir('fwd'); setI(i + 1); }
      else if (e.key === 'ArrowLeft' && i > 0) { setDir('back'); setI(i - 1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [i, n]);

  return (
    <div className="rs-walk">
      <div className="rs-walk-head">Line {i + 1} of {n}</div>
      <div className="rs-cells">
        {items.map((it, k) => (
          <button
            key={it.itemId}
            type="button"
            className={`rs-cell bg-${it.worst}`}
            aria-pressed={k === i}
            aria-label={`${it.itemId}: ${VERDICT[it.worst].label}`}
            onClick={() => goTo(k)}
          />
        ))}
      </div>
      <div className={`rs-detail rs-slide-${dir}`} key={`${current?.itemId ?? ''}-${dir}`}>
        <Detail item={current} onLetter={onLetter} />
      </div>
      <div className="rs-walk-nav">
        <button type="button" className="btn" disabled={i === 0} onClick={() => goTo(i - 1)}>Previous line</button>
        <button type="button" className="btn" disabled={i >= n - 1} onClick={() => goTo(i + 1)}>Next line</button>
      </div>
    </div>
  );
}
