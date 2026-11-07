// "Explain in plain words" for one flagged line. Shows Claude's points when the local route works, otherwise the
// engine's own "Why" text. Citations are never shown here: the detail panel already renders the engine's.
import { useState } from 'react';
import type { City, Flag } from '../contract/types';
import { explain } from './client';
import type { ExplainPoint } from './types';

type State =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'done'; points: ExplainPoint[] }
  | { kind: 'fallback' };

export function ExplainButton({ city, flags, itemId }: { city: City; flags: Flag[]; itemId: string }) {
  const [state, setState] = useState<State>({ kind: 'idle' });
  const item = flags.filter((f) => f.itemId === itemId && f.ruleId !== null);
  if (item.length === 0) return null;

  async function onClick() {
    setState({ kind: 'loading' });
    const res = await explain(city, itemId);
    setState(res.fallback ? { kind: 'fallback' } : { kind: 'done', points: res.points });
  }

  return (
    <div className="blk explain">
      {state.kind === 'idle' || state.kind === 'loading' ? (
        <button type="button" className="btn" onClick={onClick} disabled={state.kind === 'loading'}>
          {state.kind === 'loading' ? 'Explaining…' : 'Explain in plain words'}
        </button>
      ) : null}
      {state.kind === 'done' ? (
        <div>
          <div className="lbl">In plain words (written by Claude, checked against our rules)</div>
          <ul>
            {state.points.map((p, i) => (
              <li key={`${p.ruleId}-${i}`}>{p.text}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {state.kind === 'fallback' ? (
        <div>
          <div className="lbl">Why</div>
          {item.map((f) => (
            <p key={f.ruleId ?? ''}>{f.why}</p>
          ))}
        </div>
      ) : null}
    </div>
  );
}
