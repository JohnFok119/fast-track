// STUB, replaced by a worker: step 4 (time saved: typical path vs fast path) and step 5 (who to contact, as links).
import type { CityRun, Contact, Phase } from '../../contract/types';
import { Timeline } from '../Plan';

interface TimelineProps {
  /** The fast path for this pathway: LAW, ASSUMPTION, SKIPPED or UNKNOWN phases, with citations where LAW or SKIPPED. */
  phases: Phase[];
  /** The event brief's typical path without a fast track: every phase is an ASSUMPTION. */
  baseline: Phase[];
  onNext: () => void;
  onBack: () => void;
}

export function TimelineStep({ phases, baseline, onNext, onBack }: TimelineProps) {
  return (
    <div>
      <div className="gd-kicker">Step 4 of 6</div>
      <h1 className="gd-q">Time saved</h1>
      <Timeline phases={baseline} />
      <Timeline phases={phases} />
      <div className="gd-nav">
        <button type="button" className="btn" onClick={onBack}>Back</button>
        <button type="button" className="btn solid" onClick={onNext}>Next: who to contact</button>
      </div>
    </div>
  );
}

interface ContactProps { run: CityRun; escalation: Contact; onNext: () => void; onBack: () => void }

export function ContactStep({ run, escalation, onNext, onBack }: ContactProps) {
  return (
    <div>
      <div className="gd-kicker">Step 5 of 6 · {run.name}</div>
      <h1 className="gd-q">Who to contact</h1>
      <ul>{[...run.contacts, escalation].map((c) => <li key={c.office}><a href={c.citation.url}>{c.office}</a></li>)}</ul>
      <div className="gd-nav">
        <button type="button" className="btn" onClick={onBack}>Back</button>
        <button type="button" className="btn solid" onClick={onNext}>Next: summary</button>
      </div>
    </div>
  );
}
