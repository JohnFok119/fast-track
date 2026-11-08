// The guided flow: one question or one result per card, in the locked order, ending with a summary.
// Same engine data as the full page; nothing is sent anywhere.
import { useMemo, useRef, useState } from 'react';
import { getBaseline, getTimeline } from '../../contract/api';
import type { City } from '../../contract/types';
import { ESCALATION, PATHS, RUNS } from '../data';
import { groupItems } from '../model';
import { AppBrand } from '../Brand';
import type { BuildChoice } from '../choice';
import { PickCity, PickPath, Welcome } from './Choose';
import { GuidedFlow } from './GuidedFlow';
import { ContactStep, TimelineStep } from './PlanSteps';
import { Results } from './Results';
import { STEP_LABELS, Stepper } from './Stepper';
import { Summary } from './Summary';
import '../ft.css';
import './guided.css';

const BASELINE = getBaseline();
/** How long a picked card stays highlighted before the next card slides in. */
const PICK_DELAY_MS = 380;
const NOTICE = 'Prototype. Not legal advice. Nothing is sent from this page. Talk to a professional before you act.';

/** The strip on top of the card: the lot and the build, where you are, and the prototype note. */
function CardBar({ step, lot }: { step: number; lot: string }) {
  return (
    <div className="gd-bar">
      <b>{lot}</b>
      <span>{step > 0 ? `Step ${step} of ${STEP_LABELS.length} \u00b7 ${STEP_LABELS[step - 1]}` : 'Welcome'}</span>
      <span className="pv">Prototype, not legal advice. Talk to a professional.</span>
    </div>
  );
}

interface Props {
  /** The build and city chosen in the one-page view, to pick up where it left off. */
  from?: BuildChoice;
  onSeeAll: (choice: BuildChoice) => void;
}

export function Guided({ from, onSeeAll }: Props) {
  const [flow, setFlow] = useState(() => (from ? GuidedFlow.resume({ paths: PATHS, runs: RUNS }, from) : GuidedFlow.start({ paths: PATHS, runs: RUNS })));
  const timer = useRef<number | undefined>(undefined);

  const { step, pathId, city, run } = flow;
  const path = PATHS.find((p) => p.id === pathId);
  const items = useMemo(() => (run ? groupItems(run) : []), [run]);

  const go = (n: number) => {
    window.clearTimeout(timer.current);
    setFlow((f) => f.go(n));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const later = (n: number) => { window.clearTimeout(timer.current); timer.current = window.setTimeout(() => go(n), PICK_DELAY_MS); };
  const pickPath = (id: string) => { setFlow((f) => f.pickPath(id)); later(2); };
  const pickCity = (c: City) => { setFlow((f) => f.pickCity(c)); later(3); };
  const restart = () => { window.clearTimeout(timer.current); setFlow((f) => f.restart()); window.scrollTo({ top: 0, behavior: 'smooth' }); };

  let body;
  if (step === 0) body = <Welcome onStart={() => go(1)} />;
  else if (step === 1) body = <PickPath paths={PATHS} pathId={pathId} onPick={pickPath} />;
  else if (step === 2 || !run || !path) body = <PickCity runs={RUNS} pathway={path?.pathway ?? 'ADU'} city={city} onPick={pickCity} />;
  else if (step === 3) body = <Results key={run.city} run={run} items={items} onNext={() => go(4)} onBack={() => go(2)} />;
  else if (step === 4) body = <TimelineStep pathway={path.pathway} phases={getTimeline(path.pathway)} baseline={BASELINE} onNext={() => go(5)} onBack={() => go(3)} />;
  else if (step === 5) body = <ContactStep run={run} escalation={ESCALATION} onNext={() => go(6)} onBack={() => go(4)} />;
  else {
    body = <Summary path={path} run={run} items={items} phases={getTimeline(path.pathway)} baseline={BASELINE} escalation={ESCALATION} onBack={() => go(5)} onRestart={restart} />;
  }

  const lot = [run?.name, path?.label].filter(Boolean).join(' \u00b7 ') || 'Fast Track';
  return (
    <div className="ft gd">
      <div className="ribbon"><i aria-hidden="true" /><span>{NOTICE}</span></div>
      <header className="gd-top">
        <AppBrand />
        <div className="gd-acts">
          <button type="button" className="gd-link" onClick={restart}>Start over</button>
          <button type="button" className="btn" onClick={() => onSeeAll({ pathId, city })}>See everything on one page</button>
        </div>
      </header>
      <div className="gd-wrap">
        {step > 0 ? <Stepper step={step} reachable={flow.reachable} answers={[path?.label ?? null, run?.name ?? null]} onGo={go} /> : null}
        <main className={`gd-card enter-${flow.dir}`} key={step}>
          <CardBar step={step} lot={lot} />
          <div className="gd-body">{body}</div>
        </main>
      </div>
    </div>
  );
}
