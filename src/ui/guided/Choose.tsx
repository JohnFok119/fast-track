// The welcome card, step 1 (what you build) and step 2 (where). Every legal fact shown comes from props.
import type { CSSProperties } from 'react';
import type { BuildPath, City, CityRun, Pathway } from '../../contract/types';
import { BuildingIcon, PATH_ICONS } from '../icons';
import './choose.css';

const CHIPS = ['Every line checked against state law', 'Your legal clocks', 'A draft reply you send yourself'];
const at = (i: number) => ({ '--i': i }) as CSSProperties;

export function Welcome({ onStart }: { onStart: () => void }) {
  return (
    <div className="ch-welcome">
      <div className="gd-kicker ch-rise" style={at(0)}>Prototype</div>
      <h1 className="gd-q ch-hero ch-rise" style={at(1)}>You own the lot. Let's see what stands in the way.</h1>
      <p className="gd-sub ch-rise" style={at(2)}>
        Answer two questions. Fast Track checks the city's requirements against state law, line by line, then shows your legal clocks and who to contact.
      </p>
      <ul className="ch-chips">
        {CHIPS.map((c, i) => <li key={c} className="ch-chip ch-rise" style={at(3 + i)}>{c}</li>)}
      </ul>
      <div className="ch-start ch-rise" style={at(6)}>
        <button type="button" className="btn solid ch-big" onClick={onStart}>Start</button>
        <span className="muted ch-note">Nothing you type leaves this page.</span>
      </div>
    </div>
  );
}

function Check() {
  return (
    <span className="ch-check" aria-hidden="true">
      <svg viewBox="0 0 16 16" width="14" height="14"><path d="M3 8.5l3.2 3L13 4.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </span>
  );
}

interface PathProps { paths: BuildPath[]; pathId: string | null; onPick: (id: string) => void }

export function PickPath({ paths, pathId, onPick }: PathProps) {
  return (
    <div>
      <div className="gd-kicker">Step 1 of 6</div>
      <h1 className="gd-q">What do you want to build?</h1>
      <div className="ch-grid">
        {paths.map((p, i) => {
          const Icon = PATH_ICONS[p.id];
          const on = p.id === pathId;
          return (
            <button key={p.id} type="button" className="ch-card ch-rise" style={at(i)} aria-pressed={on} onClick={() => onPick(p.id)}>
              {on ? <Check /> : null}
              {Icon ? <span className="ch-icon"><Icon /></span> : null}
              <span className="ch-label">{p.label}</span>
              <span className="ch-sub">{p.pathway === 'SB9' ? 'SB 9' : 'ADU law'}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface CityProps { runs: CityRun[]; pathway: Pathway; city: City | null; onPick: (c: City) => void }

export function PickCity({ runs, pathway, city, onPick }: CityProps) {
  const missing = `No saved ${pathway === 'SB9' ? 'SB 9' : 'ADU'} list yet`;
  return (
    <div>
      <div className="gd-kicker">Step 2 of 6</div>
      <h1 className="gd-q">Where is the lot?</h1>
      <div className="ch-grid">
        {runs.map((r, i) => {
          const fits = r.pathway === pathway;
          return (
            <button key={`${r.city}-${r.pathway}`} type="button" className="ch-card ch-rise" style={at(i)} aria-pressed={fits && r.city === city} disabled={!fits} onClick={() => onPick(r.city)}>
              {fits && r.city === city ? <Check /> : null}
              <span className="ch-icon"><BuildingIcon /></span>
              <span className="ch-label">{r.name}</span>
              {fits ? null : <span className="ch-sub">{missing}</span>}
            </button>
          );
        })}
        <button type="button" className="ch-card ch-rise" style={at(runs.length)} disabled>
          <span className="ch-icon"><BuildingIcon /></span>
          <span className="ch-label">Unincorporated county</span>
          <span className="ch-sub">Not covered yet</span>
        </button>
      </div>
    </div>
  );
}
