import type { CSSProperties } from 'react';
import type { CityRun, Contact, Pathway, Phase } from '../../contract/types';
import { FasterPaths, ReviewDeadline } from '../faster/FasterPaths';
import { unknownPhrase } from '../faster/reviewWording';
import { BuildingIcon, StateIcon } from '../icons';
import { totalMonths } from '../model';
import './plan.css';

interface TimelineProps {
  /** The fast path for this pathway: LAW, ASSUMPTION, SKIPPED or UNKNOWN phases, with citations where LAW or SKIPPED. */
  phases: Phase[];
  /** The event brief's typical path without a fast track: every phase is an ASSUMPTION. */
  baseline: Phase[];
  /** Which pathway the phases are for: picks the faster paths shown under the graphs. */
  pathway: Pathway;
  onNext: () => void;
  onBack: () => void;
}

const UNIT = 130;

/** Animation delay in ms, passed to CSS as --d. */
function delay(ms: number): CSSProperties {
  return { '--d': `${ms}ms` } as CSSProperties;
}

function Segment({ phase, scale, d }: { phase: Phase; scale: number; d: number }) {
  const unknown = phase.drawMonths === null;
  const style: CSSProperties = unknown ? delay(d) : { ...delay(d), width: `${((phase.drawMonths ?? 0) / scale) * 100}%` };
  return (
    <span className={`tg-seg ${phase.kind.toLowerCase()}`} style={style}>
      {unknown ? '?' : null}
    </span>
  );
}

function PhaseList({ phases }: { phases: Phase[] }) {
  return (
    <ul className="tg-list">
      {phases.map((p) => (
        <li key={p.id} className={p.kind === 'SKIPPED' ? 'skipped' : undefined}>
          <span className={`tg-key ${p.kind.toLowerCase()}`} aria-hidden="true" />
          <span className="tg-name">{p.label}</span>
          <span className="tg-val">{p.kind === 'UNKNOWN' ? 'Unknown' : p.kind === 'SKIPPED' ? 'skipped' : p.value}</span>
          {p.kind === 'LAW' && p.citation ? (
            <a className="tg-law" href={p.citation.url} target="_blank" rel="noopener noreferrer" title={p.citation.label}>Law</a>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

interface GraphProps { title: string; phases: Phase[]; scale: number; start: number; saved?: string }

function Graph({ title, phases, scale, start, saved }: GraphProps) {
  const shown = phases.filter((p) => p.kind !== 'SKIPPED');
  const savedDelay = start + shown.length * UNIT + 150;
  return (
    <section className="tg-graph">
      <h2 className="tg-title">{title}</h2>
      <div className="tg-bar">
        {shown.map((p, i) => <Segment key={p.id} phase={p} scale={scale} d={start + i * UNIT} />)}
        {saved ? <span className="tg-saved-bar" style={delay(savedDelay)} /> : null}
      </div>
      {saved ? <p className="tg-saved" style={delay(savedDelay)}>{saved}</p> : null}
      <PhaseList phases={phases} />
    </section>
  );
}

export function TimelineStep({ phases, baseline, pathway, onNext, onBack }: TimelineProps) {
  const baseTotal = totalMonths(baseline);
  const scale = Math.max(baseTotal, totalMonths(phases)) || 1;
  const months = Math.round(baseTotal - totalMonths(phases));
  const unknown = unknownPhrase(phases);
  const saved = `About ${months} months shorter (estimate)${unknown ? ` plus ${unknown}` : ''}`;
  return (
    <div>
      <h1 className="gd-q">Time saved</h1>
      <Graph title="Typical path" phases={baseline} scale={scale} start={100} />
      <Graph title="Fast track" phases={phases} scale={scale} start={100 + baseline.length * UNIT + 200} saved={saved} />
      <ReviewDeadline phases={phases} />
      <FasterPaths pathway={pathway} />
      <p className="tg-note">Estimates are the event brief&apos;s typical times, not measured. Bars marked Law are legal deadlines.</p>
      <div className="gd-nav">
        <button type="button" className="btn" onClick={onBack}>Back</button>
        <button type="button" className="btn solid" onClick={onNext}>Next: who to contact</button>
      </div>
    </div>
  );
}

function ContactItem({ contact, escalation }: { contact: Contact; escalation?: boolean }) {
  const Icon = escalation ? StateIcon : BuildingIcon;
  return (
    <li className={`ct-item${escalation ? ' esc' : ''}`}>
      <span className="ct-icon" aria-hidden="true"><Icon /></span>
      <div className="ct-body">
        {escalation ? <div className="ct-tag">If the city won&apos;t fix it</div> : null}
        <div className="ct-office">{contact.office}</div>
        <div className="ct-handles">{contact.handles}</div>
        <a className="ct-link" href={contact.citation.url} target="_blank" rel="noopener noreferrer" title={contact.citation.label}>Open the source</a>
      </div>
    </li>
  );
}

interface ContactProps { run: CityRun; escalation: Contact; onLetter: () => void; onNext: () => void; onBack: () => void }

export function ContactStep({ run, escalation, onLetter, onNext, onBack }: ContactProps) {
  return (
    <div>
      <h1 className="gd-q">Who to contact</h1>
      <ul className="ct-list">
        {run.contacts.map((c) => <ContactItem key={c.office} contact={c} />)}
        <ContactItem contact={escalation} escalation />
      </ul>
      <div className="ct-letter">
        <p>A draft for each office, every line with its source. You send it yourself. Fast Track sends nothing.</p>
        <button type="button" className="btn" onClick={onLetter}>Write the letter</button>
      </div>
      <div className="gd-nav">
        <button type="button" className="btn" onClick={onBack}>Back</button>
        <button type="button" className="btn solid" onClick={onNext}>Next: summary</button>
      </div>
    </div>
  );
}
