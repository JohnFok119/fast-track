// The guided flow: one question or one result per card, in the locked order. Same engine data as the full page.
import { useCallback, useMemo, useState } from 'react';
import { getSteps, getTimeline } from '../../contract/api';
import type { City } from '../../contract/types';
import { ESCALATION, PATHS, RUNS } from '../data';
import { LetterSheet } from '../LetterSheet';
import { groupItems } from '../model';
import { PickCity, PickPath, Welcome } from './Choose';
import { ContactStep, TimelineStep } from './PlanSteps';
import { Results } from './Results';
import { Stepper } from './Stepper';
import '../ft.css';
import './guided.css';

export function Guided({ onSeeAll }: { onSeeAll: () => void }) {
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState<'fwd' | 'back'>('fwd');
  const [pathId, setPathId] = useState<string | null>(null);
  const [city, setCity] = useState<City | null>(null);
  const [letterOpen, setLetterOpen] = useState(false);
  const closeLetter = useCallback(() => setLetterOpen(false), []);

  const path = PATHS.find((p) => p.id === pathId);
  const run = RUNS.find((r) => r.city === city && r.pathway === path?.pathway);
  const items = useMemo(() => (run ? groupItems(run) : []), [run]);
  const reachable = run ? 5 : path ? 2 : 1;

  const go = (n: number) => {
    setDir(n >= step ? 'fwd' : 'back');
    setStep(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const pickPath = (id: string) => {
    setPathId(id);
    const next = PATHS.find((p) => p.id === id)?.pathway;
    if (city && !RUNS.some((r) => r.city === city && r.pathway === next)) setCity(null);
  };
  const restart = () => { setPathId(null); setCity(null); go(0); };
  const openLetter = () => setLetterOpen(true);

  let body;
  if (step === 0) body = <Welcome onStart={() => go(1)} />;
  else if (step === 1) body = <PickPath paths={PATHS} pathId={pathId} onPick={pickPath} onNext={() => go(2)} />;
  else if (step === 2 || !run || !path) {
    body = <PickCity runs={RUNS} pathway={path?.pathway ?? 'ADU'} city={city} onPick={setCity} onNext={() => go(3)} onBack={() => go(1)} />;
  } else if (step === 3) body = <Results key={run.city} run={run} items={items} onLetter={openLetter} onNext={() => go(4)} onBack={() => go(2)} />;
  else if (step === 4) {
    body = <TimelineStep phases={getTimeline(path.pathway)} steps={getSteps(path.pathway)} pushBack={items.filter((it) => it.needsAttention).length} onNext={() => go(5)} onBack={() => go(3)} />;
  } else body = <ContactStep run={run} escalation={ESCALATION} onLetter={openLetter} onBack={() => go(4)} onRestart={restart} />;

  return (
    <div className="ft gd">
      <div className="ribbon"><i aria-hidden="true" /><span>Prototype. Not legal advice. Nothing is sent from this page. Talk to a professional before you act.</span></div>
      <header className="gd-top">
        <button type="button" className="mark" onClick={restart}>FAST TRACK</button>
        <button type="button" className="btn" onClick={onSeeAll}>See everything on one page</button>
      </header>
      <div className="gd-wrap">
        {step > 0 ? <Stepper step={step} reachable={reachable} answers={[path?.label ?? null, run?.name ?? null]} onGo={go} /> : null}
        <main className={`gd-card enter-${dir}`} key={`${step}-${city ?? ''}`}>{body}</main>
      </div>
      {letterOpen && run ? <LetterSheet run={run} escalation={ESCALATION} onClose={closeLetter} /> : null}
    </div>
  );
}
