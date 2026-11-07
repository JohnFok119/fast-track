// The guided flow: one question or one result per card, in the locked order, ending with a summary.
// Same engine data as the full page; nothing is sent anywhere.
import { useMemo, useRef, useState } from 'react';
import { getBaseline, getTimeline } from '../../contract/api';
import type { City } from '../../contract/types';
import { ESCALATION, PATHS, RUNS } from '../data';
import { groupItems } from '../model';
import { PickCity, PickPath, Welcome } from './Choose';
import { ContactStep, TimelineStep } from './PlanSteps';
import { Results } from './Results';
import { Stepper } from './Stepper';
import { Summary } from './Summary';
import '../ft.css';
import './guided.css';

const BASELINE = getBaseline();
/** How long a picked card stays highlighted before the next card slides in. */
const PICK_DELAY_MS = 380;

export function Guided({ onSeeAll }: { onSeeAll: () => void }) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<'fwd' | 'back'>('fwd');
  const [pathId, setPathId] = useState<string | null>(null);
  const [city, setCity] = useState<City | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const path = PATHS.find((p) => p.id === pathId);
  const run = RUNS.find((r) => r.city === city && r.pathway === path?.pathway);
  const items = useMemo(() => (run ? groupItems(run) : []), [run]);
  const reachable = run ? 6 : path ? 2 : 1;

  const go = (n: number) => {
    window.clearTimeout(timer.current);
    setDir(n >= step ? 'fwd' : 'back');
    setStep(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const later = (n: number) => { window.clearTimeout(timer.current); timer.current = window.setTimeout(() => go(n), PICK_DELAY_MS); };
  const pickPath = (id: string) => {
    setPathId(id);
    const next = PATHS.find((p) => p.id === id)?.pathway;
    if (city && !RUNS.some((r) => r.city === city && r.pathway === next)) setCity(null);
    later(2);
  };
  const pickCity = (c: City) => { setCity(c); later(3); };
  const restart = () => { setPathId(null); setCity(null); go(0); };

  let body;
  if (step === 0) body = <Welcome onStart={() => go(1)} />;
  else if (step === 1) body = <PickPath paths={PATHS} pathId={pathId} onPick={pickPath} />;
  else if (step === 2 || !run || !path) body = <PickCity runs={RUNS} pathway={path?.pathway ?? 'ADU'} city={city} onPick={pickCity} />;
  else if (step === 3) body = <Results key={run.city} run={run} items={items} onNext={() => go(4)} onBack={() => go(2)} />;
  else if (step === 4) body = <TimelineStep phases={getTimeline(path.pathway)} baseline={BASELINE} onNext={() => go(5)} onBack={() => go(3)} />;
  else if (step === 5) body = <ContactStep run={run} escalation={ESCALATION} onNext={() => go(6)} onBack={() => go(4)} />;
  else {
    body = <Summary path={path} run={run} items={items} phases={getTimeline(path.pathway)} baseline={BASELINE} escalation={ESCALATION} onBack={() => go(5)} onRestart={restart} />;
  }

  return (
    <div className="ft gd">
      <div className="ribbon"><i aria-hidden="true" /><span>Prototype. Not legal advice. Nothing is sent from this page. Talk to a professional before you act.</span></div>
      <header className="gd-top">
        <button type="button" className="mark" onClick={restart}>FAST TRACK</button>
        <button type="button" className="btn" onClick={onSeeAll}>See everything on one page</button>
      </header>
      <div className="gd-wrap">
        {step > 0 ? <Stepper step={step} reachable={reachable} answers={[path?.label ?? null, run?.name ?? null]} onGo={go} /> : null}
        <main className={`gd-card enter-${dir}`} key={step}>{body}</main>
      </div>
    </div>
  );
}
