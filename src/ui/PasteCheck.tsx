// Paste any city's text and check it against the statewide rules. City-scoped findings never apply here.
import { useState } from 'react';
import { scan } from '../contract/api';
import { VERDICT } from '../letter/verdict';
import { citeMeta } from './model';

const EXAMPLE = 'Owner occupancy covenant for all JADUs, authorized by the California Government Code Sections 65852.2 and 65852.22.';

export function PasteCheck() {
  const [text, setText] = useState(EXAMPLE);
  const flags = scan(text);
  return (
    <section className="card" aria-labelledby="paste-h">
      <h2 className="h" id="paste-h">Check any city's text</h2>
      <label className="lbl" htmlFor="paste">Paste a requirement. Nothing leaves this page.</label>
      <textarea id="paste" className="paste" style={{ marginTop: 6 }} value={text} onChange={(e) => setText(e.target.value)} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
        {flags.length === 0 ? <span className="muted">No rule matched. That is UNKNOWN, not "allowed".</span> : null}
        {flags.map((f) => (
          <div key={`${f.itemId}-${f.ruleId ?? ''}`} className={`verdict v-${f.status}`} style={{ marginTop: 0 }}>
            <div className="t">{VERDICT[f.status].label}{f.mapping ? `: ${f.mapping.old} → ${f.mapping.now}` : ''}</div>
            <p>{f.citations.map((c) => `${c.label} (${citeMeta(c)})`).join(' · ')}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
