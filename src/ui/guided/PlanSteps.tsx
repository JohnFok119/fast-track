// Steps 4 and 5 of the guided flow: the timeline that grows in, the next steps, who to contact, the letter.
// Everything shown comes from the props (the contract); no law is written here.
import { useState } from 'react';
import type { CityRun, Contact, Phase, Step } from '../../contract/types';
import { BuildingIcon, StateIcon } from '../icons';
import { PasteCheck } from '../PasteCheck';
import { Legend, PhaseNotes, Steps, Timeline } from '../Plan';
import './plan.css';

interface TimelineProps { phases: Phase[]; steps: Step[]; pushBack: number; onNext: () => void; onBack: () => void }

export function TimelineStep({ phases, steps, pushBack, onNext, onBack }: TimelineProps) {
  const [showSteps, setShowSteps] = useState(false);
  return (
    <div>
      <div className="gd-kicker">Step 4 of 5</div>
      <h1 className="gd-q">Your timeline, plans to move-in</h1>
      <p className="gd-sub">Starts once you own the lot. Finding land and funding are not included.</p>
      <div className="pl-time">
        <Timeline phases={phases} />
        <Legend />
        <PhaseNotes phases={phases} />
      </div>
      {showSteps ? (
        <section className="pl-next" aria-labelledby="pl-next-h">
          <h2 className="pl-h" id="pl-next-h">Next steps</h2>
          <Steps steps={steps} pushBack={pushBack} />
        </section>
      ) : (
        <button type="button" className="btn pl-more" onClick={() => setShowSteps(true)}>What to do next</button>
      )}
      <div className="gd-nav">
        <button type="button" className="btn" onClick={onBack}>Back</button>
        <button type="button" className="btn solid" onClick={onNext}>Next: who to contact</button>
      </div>
    </div>
  );
}

function ContactCard({ c, esc, i }: { c: Contact; esc: boolean; i: number }) {
  return (
    <li className={`pl-c rise ${esc ? 'esc' : ''}`} style={{ ['--i' as string]: i + 1 }}>
      <span className="ic" aria-hidden="true">{esc ? <StateIcon /> : <BuildingIcon />}</span>
      <div>
        {esc ? <span className="pl-tag">If the city won't fix it</span> : null}
        <b>{c.office}</b>
        <span className="pl-handles">{c.handles}</span>
        <a href={c.citation.url} target="_blank" rel="noopener noreferrer" title={c.citation.label}>Source: {c.citation.label}</a>
      </div>
    </li>
  );
}

interface ContactProps { run: CityRun; escalation: Contact; onLetter: () => void; onBack: () => void; onRestart: () => void }

export function ContactStep({ run, escalation, onLetter, onBack, onRestart }: ContactProps) {
  const n = run.contacts.length;
  return (
    <div>
      <div className="gd-kicker">Step 5 of 5 · {run.name}</div>
      <h1 className="gd-q">Who to contact, and what to say</h1>
      <ul className="pl-cards">
        {run.contacts.map((c, i) => <ContactCard key={c.office} c={c} esc={false} i={i} />)}
        <ContactCard c={escalation} esc i={n} />
      </ul>
      <section className="pl-letter rise" style={{ ['--i' as string]: n + 3 }} aria-labelledby="pl-letter-h">
        <h2 className="pl-h" id="pl-letter-h">Your draft letter is ready</h2>
        <p>You review it and send it yourself. Fast Track sends nothing.</p>
        <button type="button" className="btn solid" onClick={onLetter}>Write the letter</button>
      </section>
      <details className="pl-check">
        <summary>Check any city's text</summary>
        <PasteCheck />
      </details>
      <div className="gd-nav">
        <button type="button" className="btn" onClick={onBack}>Back</button>
        <button type="button" className="btn" onClick={onRestart}>Start over</button>
      </div>
    </div>
  );
}
