// Fast Track dashboard: what you are building, where, what stands in the way, your timeline, and who to contact.
import { useCallback, useMemo, useState } from 'react';
import { getSteps, getTimeline } from '../contract/api';
import type { City, Status } from '../contract/types';
import { ESCALATION, PATHS, RUNS } from './data';
import { LetterSheet } from './LetterSheet';
import { groupItems } from './model';
import { Overview } from './Overview';
import { PasteCheck } from './PasteCheck';
import { Plan } from './Plan';
import { Detail, RequirementList } from './Requirements';
import { Side } from './Side';
import './ft.css';

export function App({ onGuided }: { onGuided?: () => void }) {
  const [pathId, setPathId] = useState(PATHS[0]?.id ?? '');
  const [city, setCity] = useState<City | null>('irvine');
  const [filter, setFilter] = useState<Status | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [letterOpen, setLetterOpen] = useState(false);
  const closeLetter = useCallback(() => setLetterOpen(false), []);

  const pathway = PATHS.find((p) => p.id === pathId)?.pathway ?? 'ADU';
  const run = RUNS.find((r) => r.city === city && r.pathway === pathway);
  const items = useMemo(() => (run ? groupItems(run) : []), [run]);
  const shown = filter ? items.filter((it) => it.statuses.includes(filter)) : items;
  const current = items.find((it) => it.itemId === selected) ?? shown.find((it) => it.needsAttention) ?? shown[0];

  const choosePath = (id: string) => {
    setPathId(id);
    const next = PATHS.find((p) => p.id === id)?.pathway;
    if (!RUNS.some((r) => r.city === city && r.pathway === next)) setCity(RUNS.find((r) => r.pathway === next)?.city ?? null);
    setFilter(null);
    setSelected(null);
  };
  const chooseCity = (c: City) => { setCity(c); setFilter(null); setSelected(null); };

  return (
    <div className="ft">
      <div className="ribbon"><i aria-hidden="true" /><span>Prototype. Not legal advice. Nothing is sent from this page. Talk to a professional before you act.</span></div>
      <header className="top">
        <div style={{ display: 'flex', gap: 12, alignItems: 'baseline', flexWrap: 'wrap' }}>
          <span className="mark">FAST TRACK</span>
          <span className="muted" style={{ fontSize: '0.92rem' }}>You own the lot. See what to submit, what to push back on, and your legal clocks.</span>
        </div>
        {onGuided ? <button type="button" className="btn" onClick={onGuided}>Guided view</button> : null}
      </header>
      <div className="shell">
        <Side paths={PATHS} runs={RUNS} pathId={pathId} city={run ? run.city : null} onPath={choosePath} onCity={chooseCity} />
        <main className="main">
          {run ? (
            <>
              <Overview run={run} items={items} filter={filter} selected={current?.itemId ?? null} onFilter={setFilter} onSelect={setSelected} onLetter={() => setLetterOpen(true)} />
              <div className="grid2">
                <RequirementList items={shown} selected={current?.itemId ?? null} onSelect={setSelected} />
                <Detail item={current} onLetter={() => setLetterOpen(true)} />
              </div>
              <Plan phases={getTimeline(pathway)} steps={getSteps(pathway)} pushBack={items.filter((it) => it.needsAttention).length} contacts={run.contacts} escalation={ESCALATION} />
            </>
          ) : (
            <section className="card">No saved requirements for this choice yet. Pick another city.</section>
          )}
          <PasteCheck />
        </main>
      </div>
      {letterOpen && run ? <LetterSheet run={run} escalation={ESCALATION} onClose={closeLetter} /> : null}
    </div>
  );
}
