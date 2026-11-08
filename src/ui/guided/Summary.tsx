// Step 6: a one-card summary of what the owner now knows. Every number comes from props; the months saved is an estimate.
import { useEffect, useState, type JSX, type ReactNode } from 'react';
import type { BuildPath, CityRun, Contact, Phase } from '../../contract/types';
import { FasterPaths, ReviewDeadline } from '../faster/FasterPaths';
import { unknownPhrase } from '../faster/reviewWording';
import { countBy, totalMonths, type Item } from '../model';
import './summary.css';

interface Props {
  path: BuildPath;
  run: CityRun;
  items: Item[];
  /** The fast path for this pathway. */
  phases: Phase[];
  /** The event brief's typical path without a fast track (all ASSUMPTION). */
  baseline: Phase[];
  escalation: Contact;
  onBack: () => void;
  onRestart: () => void;
}

const svg = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true };
const ListIcon = () => <svg {...svg}><path d="M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2" /></svg>;
const StopIcon = () => <svg {...svg}><circle cx="12" cy="12" r="9" /><path d="M5.6 5.6l12.8 12.8" /></svg>;
const OldIcon = () => <svg {...svg}><path d="M12 8v5l3 2" /><circle cx="12" cy="12" r="9" /></svg>;
const ClockIcon = () => <svg {...svg}><path d="M5 3h14M5 21h14M7 3v4l5 5-5 5v4M17 3v4l-5 5 5 5v4" /></svg>;
const OfficeIcon = () => <svg {...svg}><path d="M4 21V5l8-3 8 3v16M9 21v-4h6v4M8 9h.01M12 9h.01M16 9h.01M8 13h.01M12 13h.01M16 13h.01" /></svg>;
const CheckIcon = () => <svg width={34} height={34} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>;

const REDUCED = '(prefers-reduced-motion: reduce)';

function useCountUp(target: number, ms = 700): number {
  const [n, setN] = useState(() => (window.matchMedia(REDUCED).matches ? target : 0));
  useEffect(() => {
    if (window.matchMedia(REDUCED).matches) return;
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - t0) / ms);
      setN(Math.round(target * (1 - (1 - k) ** 3)));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return n;
}

interface TileProps { icon: JSX.Element; value: number; label: string; sub?: string; tone: string; index: number }

function Tile({ icon, value, label, sub, tone, index }: TileProps) {
  const n = useCountUp(value);
  return (
    <li className={`sm-tile ${tone}`} style={{ animationDelay: `${index * 90 + 150}ms` }}>
      <span className="sm-ico">{icon}</span>
      <span className="sm-num" aria-label={String(value)}>{n}</span>
      <span className="sm-lab">{label}</span>
      {sub ? <span className="sm-subl">{sub}</span> : null}
    </li>
  );
}

function Law({ url, children }: { url: string; children: ReactNode }) {
  return <a className="sm-law" href={url} target="_blank" rel="noopener noreferrer">{children}</a>;
}

export function Summary({ path, run, items, phases, baseline, escalation, onBack, onRestart }: Props) {
  const conflicts = countBy(items, 'CONFLICTS');
  const outdated = countBy(items, 'OUTDATED_CITATION');
  const saved = Math.round(totalMonths(baseline) - totalMonths(phases));
  const clocks = phases.filter((p) => p.kind === 'LAW');
  const first = run.contacts[0];

  const tiles: Omit<TileProps, 'index'>[] = [
    { icon: <ListIcon />, value: items.length, label: 'Lines checked against state law', tone: 'sm-brand' },
    { icon: <StopIcon />, value: conflicts, label: 'The state says no to', sub: 'you can push back', tone: 'sm-conf' },
    ...(outdated > 0 ? [{ icon: <OldIcon />, value: outdated, label: 'Old law numbers', tone: 'sm-out' }] : []),
    { icon: <ClockIcon />, value: saved, label: 'Months saved', sub: `estimate, vs the typical path${unknownPhrase(phases).replace(' plus', ', plus')}`, tone: 'sm-ok' },
    { icon: <OfficeIcon />, value: run.contacts.length + 1, label: 'Offices to contact', sub: 'the city, plus HCD if the city will not fix it', tone: 'sm-brand' },
  ];

  return (
    <div className="sm">
      <span className="sm-done"><CheckIcon /></span>
      <h1 className="gd-q">{path.label} in {run.name}</h1>
      <ul className="sm-tiles">
        {tiles.map((t, i) => <Tile key={t.label} {...t} index={i} />)}
      </ul>
      {clocks.length > 0 ? (
        <section className="sm-block gd-reveal">
          <h2 className="sm-h">Your legal clocks</h2>
          <ul className="sm-list">
            {clocks.map((p) => (
              <li key={p.id}>
                <span>{p.label}</span>
                <strong>{p.value}</strong>
                {p.citation ? <Law url={p.citation.url}>Law</Law> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      <ReviewDeadline phases={phases} />
      <FasterPaths pathway={path.pathway} />
      <p className="sm-who gd-reveal">
        <span className="sm-h">Who to contact</span>
        {first ? <Law url={first.citation.url}>{first.office}</Law> : null}
        {first ? ' first, then ' : ''}
        <Law url={escalation.citation.url}>{escalation.office}</Law>
        {first ? ' if the city will not fix it.' : '.'}
      </p>
      <p className="sm-fine">Prototype. Estimates are the event brief's typical times, not measured. Not legal advice.</p>
      <div className="gd-nav">
        <button type="button" className="btn" onClick={onBack}>Back</button>
        <button type="button" className="btn solid" onClick={onRestart}>Start over</button>
      </div>
    </div>
  );
}
