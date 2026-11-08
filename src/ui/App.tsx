// Fast Track, everything on one page: what you are building, where, what stands in the way, your timeline, and who to contact.
// What the page remembers lives in PageState; this file only draws it and passes clicks back.
import { useCallback, useState } from 'react';
import { getSteps, getTimeline } from '../contract/api';
import { AppBrand } from './Brand';
import { ESCALATION, PATHS, RUNS } from './data';
import { LetterSheet } from './LetterSheet';
import { Overview } from './Overview';
import { PageState } from './page/PageState';
import { PasteCheck } from './PasteCheck';
import { Plan } from './Plan';
import { Detail, RequirementList } from './Requirements';
import { Side } from './Side';
import './ft.css';
import './page.css';

export function App({ onGuided }: { onGuided?: () => void }) {
  const [state, setState] = useState(() => PageState.initial(RUNS, PATHS));
  const closeLetter = useCallback(() => setState((s) => s.closeLetter()), []);
  const { run, items, shown, current } = state;
  const openLetter = () => setState((s) => s.openLetter());
  const currentId = current?.itemId ?? null;

  return (
    <div className="ft ft-page">
      <div className="ribbon"><i aria-hidden="true" /><span>Prototype. Not legal advice. Nothing is sent from this page. Talk to a professional before you act.</span></div>
      <header className="top">
        <div className="top-id">
          <AppBrand />
          <span className="muted top-line">You own the lot. See what to submit, what to push back on, and your legal clocks.</span>
        </div>
        {onGuided ? <button type="button" className="btn" onClick={onGuided}>Guided view</button> : null}
      </header>
      <div className="shell">
        <Side paths={PATHS} runs={RUNS} pathId={state.pathId} city={run ? run.city : null}
          onPath={(id) => setState((s) => s.choosePath(id))} onCity={(c) => setState((s) => s.chooseCity(c))} />
        <main className="main">
          {run ? (
            <>
              <Overview run={run} items={items} filter={state.filter} selected={currentId}
                onFilter={(f) => setState((s) => s.setFilter(f))} onSelect={(id) => setState((s) => s.select(id))} onLetter={openLetter} />
              <section className="card paper" aria-label="Requirements and their sources">
                <RequirementList items={shown} selected={currentId} onSelect={(id) => setState((s) => s.select(id))} />
                <Detail item={current} onLetter={openLetter} />
              </section>
              <Plan pathway={state.pathway} phases={getTimeline(state.pathway)} steps={getSteps(state.pathway)} pushBack={state.attention} contacts={run.contacts} escalation={ESCALATION} />
            </>
          ) : (
            <section className="card">No saved requirements for this choice yet. Pick another city.</section>
          )}
          <PasteCheck />
        </main>
      </div>
      {state.letterOpen && run ? <LetterSheet run={run} escalation={ESCALATION} onClose={closeLetter} /> : null}
    </div>
  );
}
