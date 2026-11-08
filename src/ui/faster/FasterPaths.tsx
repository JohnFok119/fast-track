import { Fragment, useMemo } from 'react';
import { getFasterPaths } from '../../contract/api';
import type { Pathway, Phase } from '../../contract/types';
import { citationDetail, FasterPathList, type SourceRow } from './FasterPathList';
import { DeadlineRing } from './DeadlineRing';
import './faster.css';

/** One source: its link, then where it says it. Each part stays on one line, so a date never splits at a hyphen. */
function SourceLine({ label, url, detail }: SourceRow) {
  return (
    <span className="fp-src">
      <a href={url} target="_blank" rel="noopener noreferrer">{label}</a>
      {detail.map((part) => <Fragment key={part}> · <span className="fp-nw">{part}</span></Fragment>)}
    </span>
  );
}

/** The big deadline: a ring with the number of days when the review phase is law, plain text otherwise. */
export function DeadlineRingView({ ring }: { ring: DeadlineRing }) {
  const { phase } = ring;
  const c = phase.citation;
  return (
    <div className="fp-ring" aria-label={`${phase.label}: ${phase.value}`}>
      {ring.hasRing ? (
        <svg width="72" height="72" viewBox="0 0 92 92" aria-hidden="true">
          <circle cx="46" cy="46" r="38" className="fp-ring-track" />
          <circle cx="46" cy="46" r="38" className="fp-ring-arc" transform="rotate(-90 46 46)" />
          <text x="46" y="52" textAnchor="middle" className="fp-ring-num">{ring.number}</text>
          <text x="46" y="67" textAnchor="middle" className="fp-ring-unit">{ring.unit}</text>
        </svg>
      ) : null}
      <div>
        <b>{ring.hasRing ? `${phase.label}: ${phase.value}` : `${phase.label}: ${ring.text}`}</b>
        {phase.note ? <span>{phase.note}</span> : null}
        {c ? <SourceLine label={c.label} url={c.url} detail={citationDetail(c)} /> : null}
      </div>
    </div>
  );
}

/** The deadline ring for the city's clock, drawn from the timeline data. Nothing when the timeline has no such phase. */
export function ReviewDeadline({ phases }: { phases: Phase[] }) {
  const ring = useMemo(() => DeadlineRing.pick(phases), [phases]);
  return ring ? <DeadlineRingView ring={ring} /> : null;
}

/** Sourced ways to save time on this pathway. UNCONFIRMED paths carry a visible warning. */
export function FasterPaths({ pathway }: { pathway: Pathway }) {
  const list = useMemo(() => new FasterPathList(getFasterPaths(pathway)), [pathway]);
  if (list.rows.length === 0) return null;
  return (
    <section className="fp" aria-labelledby="fp-h">
      <h2 id="fp-h" className="fp-h">Faster paths</h2>
      <p className="fp-lede">Ways to save time. Each one names its source.</p>
      <ol className="fp-list">
        {list.rows.map((r) => (
          <li key={r.id}>
            <strong>{r.title}</strong>
            <p>{r.text}</p>
            {r.warning ? (
              <span className={`fp-warn${r.warning.strong ? ' strong' : ''}`} role="note"><b>{r.warning.label}:</b> {r.warning.text}</span>
            ) : null}
            {r.sources.map((s) => (
              <SourceLine key={s.url} {...s} />
            ))}
          </li>
        ))}
      </ol>
    </section>
  );
}
