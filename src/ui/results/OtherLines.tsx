// The city's lines that do not clash: an old law number, or a line no rule covers yet. Each opens the state's answer.
import { useState } from 'react';
import { AnswerDoc } from './AnswerDoc';
import type { ClashList } from './ClashList';
import type { ReadModel } from './ReadModel';

export function OtherLines({ model, list }: { model: ReadModel; list: ClashList }) {
  const [open, setOpen] = useState<string | null>(null);
  const others = model.lines.filter((l) => l.status !== 'CONFLICTS');
  if (!others.length) return null;
  const label = `Also on ${model.cityName}'s list`;
  return (
    <section className="ol" aria-label={label}>
      <h2 className="ol-h">{label}</h2>
      <ul className="ol-rows">
        {others.map((l) => {
          const on = open === l.id;
          return (
            <li key={l.id} className={on ? 'ol-r open' : 'ol-r'}>
              <button type="button" aria-expanded={on} onClick={() => setOpen(on ? null : l.id)}>
                <span className={`rs-chip rs-c-${l.status}`}>{l.chip}</span>
                <span className="ol-tx">{l.text}</span>
                <small className="mono">{l.id}</small>
              </button>
              {on ? <div className="ol-d">{list.pane(l.id)?.answers.map((a, k) => <AnswerDoc key={k} answer={a} />)}</div> : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
