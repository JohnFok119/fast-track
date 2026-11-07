// STUB, replaced by a worker: step 4 (your timeline and next steps) and step 5 (who to contact, the letter).
import type { CityRun, Contact, Phase, Step } from '../../contract/types';
import { Legend, PhaseNotes, Steps, Timeline, Who } from '../Plan';

interface TimelineProps { phases: Phase[]; steps: Step[]; pushBack: number; onNext: () => void; onBack: () => void }

export function TimelineStep({ phases, steps, pushBack, onNext, onBack }: TimelineProps) {
  return (
    <div>
      <div className="gd-kicker">Step 4</div>
      <h1 className="gd-q">Your timeline, plans to move-in</h1>
      <Timeline phases={phases} />
      <Legend />
      <PhaseNotes phases={phases} />
      <Steps steps={steps} pushBack={pushBack} />
      <div className="gd-nav">
        <button type="button" className="btn" onClick={onBack}>Back</button>
        <button type="button" className="btn solid" onClick={onNext}>Continue</button>
      </div>
    </div>
  );
}

interface ContactProps { run: CityRun; escalation: Contact; onLetter: () => void; onBack: () => void; onRestart: () => void }

export function ContactStep({ run, escalation, onLetter, onBack, onRestart }: ContactProps) {
  return (
    <div>
      <div className="gd-kicker">Step 5 · {run.name}</div>
      <h1 className="gd-q">Who to contact</h1>
      <Who contacts={run.contacts} escalation={escalation} />
      <div className="gd-nav">
        <button type="button" className="btn" onClick={onBack}>Back</button>
        <span style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn" onClick={onRestart}>Start over</button>
          <button type="button" className="btn solid" onClick={onLetter}>Write the letter</button>
        </span>
      </div>
    </div>
  );
}
