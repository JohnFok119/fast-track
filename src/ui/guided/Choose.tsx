// STUB, replaced by a worker: the welcome card, step 1 (what you build) and step 2 (where).
import type { BuildPath, City, CityRun, Pathway } from '../../contract/types';

export function Welcome({ onStart }: { onStart: () => void }) {
  return (
    <div>
      <h1 className="gd-q">You own the lot. Let's see what stands in the way.</h1>
      <div className="gd-nav"><span /><button type="button" className="btn solid" onClick={onStart}>Start</button></div>
    </div>
  );
}

interface PathProps { paths: BuildPath[]; pathId: string | null; onPick: (id: string) => void; onNext: () => void }

export function PickPath({ paths, pathId, onPick, onNext }: PathProps) {
  return (
    <div>
      <div className="gd-kicker">Step 1</div>
      <h1 className="gd-q">What do you want to build?</h1>
      {paths.map((p) => <button key={p.id} type="button" className="tile" aria-pressed={p.id === pathId} onClick={() => onPick(p.id)}>{p.label}</button>)}
      <div className="gd-nav"><span /><button type="button" className="btn solid" disabled={!pathId} onClick={onNext}>Continue</button></div>
    </div>
  );
}

interface CityProps { runs: CityRun[]; pathway: Pathway; city: City | null; onPick: (c: City) => void; onNext: () => void; onBack: () => void }

export function PickCity({ runs, pathway, city, onPick, onNext, onBack }: CityProps) {
  const fits = runs.filter((r) => r.pathway === pathway);
  return (
    <div>
      <div className="gd-kicker">Step 2</div>
      <h1 className="gd-q">Where is the lot?</h1>
      {fits.map((r) => <button key={r.city} type="button" className="tile" aria-pressed={r.city === city} onClick={() => onPick(r.city)}>{r.name}</button>)}
      <div className="gd-nav">
        <button type="button" className="btn" onClick={onBack}>Back</button>
        <button type="button" className="btn solid" disabled={!fits.some((r) => r.city === city)} onClick={onNext}>Continue</button>
      </div>
    </div>
  );
}
