// Steps 1 and 2: what you are building, and where. Cities without saved requirements for that path are disabled.
import type { BuildPath, City, CityRun } from '../contract/types';
import { PATH_ICONS } from './icons';
import { groupItems } from './model';

interface Props {
  paths: BuildPath[];
  runs: CityRun[];
  pathId: string;
  city: City | null;
  onPath: (id: string) => void;
  onCity: (city: City) => void;
}

export function Side({ paths, runs, pathId, city, onPath, onCity }: Props) {
  const path = paths.find((p) => p.id === pathId);
  return (
    <aside className="side">
      <section className="card" aria-labelledby="s1">
        <h2 className="h" id="s1"><span className="stepno on">1</span>What are you building?</h2>
        <div className="tiles">
          {paths.map((p) => {
            const Icon = PATH_ICONS[p.id];
            return (
              <button key={p.id} type="button" className="tile" aria-pressed={p.id === pathId} onClick={() => onPath(p.id)}>
                {Icon ? <Icon /> : null}
                <span><span className="t">{p.label}</span><br /><span className="s">{p.pathway === 'SB9' ? 'SB 9' : 'ADU law'}</span></span>
              </button>
            );
          })}
        </div>
        {path ? (
          <p className="fact">
            {path.fact}{' '}
            <a href={path.citation.url} target="_blank" rel="noopener noreferrer" className="muted">Source</a>
          </p>
        ) : null}
      </section>
      <section className="card" aria-labelledby="s2">
        <h2 className="h" id="s2"><span className={`stepno ${city ? '' : 'on'}`}>2</span>Where?</h2>
        <div className="tiles">
          {runs.map((run) => {
            const fits = run.pathway === path?.pathway;
            const n = groupItems(run).filter((it) => it.needsAttention).length;
            return (
              <button key={run.city} type="button" className="tile" disabled={!fits} aria-pressed={run.city === city} onClick={() => onCity(run.city)}>
                <span><span className="t">{run.name}</span><br /><span className="s">{fits ? `${n} to push back on` : `No saved ${path?.pathway === 'SB9' ? 'SB 9' : 'ADU'} list yet`}</span></span>
                {fits ? <span className={`cnt ${n ? '' : 'zero'}`}>{n}</span> : null}
              </button>
            );
          })}
          <button type="button" className="tile" disabled>
            <span><span className="t">Unincorporated county</span><br /><span className="s">Not covered yet</span></span>
          </button>
        </div>
      </section>
    </aside>
  );
}
