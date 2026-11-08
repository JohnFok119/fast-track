// "Every clash, side by side.": a look at the app with a real run (Dana Point), rows that open to the exact wording.
import { useMemo, useState } from 'react';
import { SproutLogo } from '../../brand/Logo';
import { HOME_PATHS, HOME_RUN } from '../hub/homeData';
import { APP_URL } from '../links';
import { OpenRows } from '../showcase/OpenRows';
import { ShowcaseModel } from '../showcase/ShowcaseModel';
import { ShowcaseRow } from '../showcase/ShowcaseRow';
import './showcase.css';

const PATH_STEPS = ['Lot', 'What you\'re building', 'Read both sides', 'Clashes', 'Draft a response', 'Deadlines'];
const CURRENT_STEP = 3;
const NOTE_MAX = 34;

function clip(text: string): string {
  const plain = text.replace(/^"/, '');
  return plain.length > NOTE_MAX ? `${plain.slice(0, NOTE_MAX).trimEnd()}...` : plain;
}

export function Showcase() {
  const model = useMemo(() => new ShowcaseModel(HOME_RUN), []);
  const pathLabel = HOME_PATHS.find((p) => p.pathway === HOME_RUN.pathway)?.label ?? HOME_RUN.pathway;
  const [open, setOpen] = useState(() => new OpenRows(model.rows.slice(0, 1).map((r) => r.id)));
  const repeated = model.rows.length < model.conflictCount;

  return (
    <section className="showcase-sec pad" id="app" aria-label="The app, with a real check">
      <div className="wrap center">
        <h2 className="disp show-h" data-rv>Every clash,<br />side by side.</h2>
        <p className="lede" data-rv>
          No account. No forms. The answer, <strong>with its source</strong>, in plain words. Tap a row to see the exact wording.
        </p>
        <div className="app" data-rv>
          <div className="app-top">
            <SproutLogo size={22} />
            <span className="crumbs">{model.cityName}<span>/</span>{pathLabel}</span>
            <span className="tag">Prototype · not legal advice</span>
          </div>
          <div className="app-body">
            <aside className="side" aria-label="Steps">
              <div className="lot"><b>{model.cityName}</b><span>{pathLabel}</span></div>
              <div className="h">Your path</div>
              {PATH_STEPS.map((label, i) => (
                <div key={label} className={i < CURRENT_STEP ? 'nv done' : i === CURRENT_STEP ? 'nv cur' : 'nv'}>
                  <i>{i < CURRENT_STEP ? '✓' : i + 1}</i>{label}
                </div>
              ))}
              <div className="h push">Source</div>
              <div className="src side-src">{model.sidebarSource}</div>
            </aside>
            <div className="main">
              <h3 className="disp">{model.title}</h3>
              <div className="meta">
                <span className="chip conf">✕ {model.conflictCount} conflict</span>
                <span className="chip unk">? {model.unknown.length} unknown</span>
                <span className="src">{model.sourceNote}</span>
              </div>
              <div className="thead"><span>{model.cityName} says</span><span></span><span>HCD says</span></div>
              {model.rows.map((row) => (
                <ShowcaseRow key={row.id} row={row} open={open.isOpen(row.id)} onToggle={(id) => setOpen((o) => o.toggle(id))} />
              ))}
              {model.unknown.length > 0 && (
                <div className="unk-row">
                  <strong>{model.unknown.length} lines not checked yet:</strong>
                  {model.unknown.map((f) => <span key={f.itemId} title={f.itemText}>{clip(f.itemText)}</span>)}
                </div>
              )}
              <div className="foot">
                <span className="src">
                  {model.conflictCount} conflict lines in all.{repeated && ' Lines HCD answers the same way are shown as one row.'}
                </span>
                <a className="btn btn-esp" href={APP_URL}>Draft a response →</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
