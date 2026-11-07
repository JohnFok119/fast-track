// Step 3 at a glance: one number, four filters, and a strip with one cell per requirement.
import type { CityRun, Status } from '../contract/types';
import { VERDICT } from '../letter/verdict';
import { countBy, day, type Item } from './model';

const KPIS: { status: Status; sub: string }[] = [
  { status: 'CONFLICTS', sub: 'push back' },
  { status: 'OUTDATED_CITATION', sub: 'ask to update' },
  { status: 'UNKNOWN', sub: 'prepare or ask' },
  { status: 'OK', sub: 'allowed' },
];

interface Props {
  run: CityRun;
  items: Item[];
  filter: Status | null;
  selected: string | null;
  onFilter: (s: Status | null) => void;
  onSelect: (itemId: string) => void;
  onLetter: () => void;
}

export function Overview({ run, items, filter, selected, onFilter, onSelect, onLetter }: Props) {
  const attention = items.filter((it) => it.needsAttention).length;
  return (
    <section className="card" aria-labelledby="s3">
      <div className="hero">
        <div>
          <div className="lbl"><span className="stepno on">3</span>What stands in the way · {run.name}</div>
          <h1 className="disp rise" key={run.city} id="s3">
            {attention} of {items.length} lines to push back on
          </h1>
          <div className="muted" style={{ fontSize: '0.85rem', marginTop: 6 }}>
            From: {run.sourceLabel} Saved {day(run.saved)}.{' '}
            <a href={run.sourceUrl} target="_blank" rel="noopener noreferrer">Open the source</a>
          </div>
        </div>
        <button type="button" className="btn solid" onClick={onLetter} disabled={attention === 0}>Write the letter</button>
      </div>
      <div className="kpis" style={{ marginTop: 16 }}>
        {KPIS.map(({ status, sub }, i) => {
          const n = countBy(items, status);
          return (
            <button key={status} type="button" className="kpi rise" style={{ ['--i' as string]: i }} disabled={n === 0}
              aria-pressed={filter === status} onClick={() => onFilter(filter === status ? null : status)}>
              <span className={`pill s-${status}`}>{VERDICT[status].chip}</span>
              <span className="n mono">{n}</span>
              <span className="muted" style={{ fontSize: '0.82rem' }}>{sub}</span>
            </button>
          );
        })}
      </div>
      <div className="strip" style={{ marginTop: 14 }} role="group" aria-label="Every requirement, in the city's order">
        {items.map((it) => (
          <button key={it.itemId} type="button" className={`bg-${it.worst}`} title={`${it.itemId}: ${VERDICT[it.worst].label}`}
            aria-label={`${it.itemId}: ${VERDICT[it.worst].label}`} aria-pressed={it.itemId === selected} onClick={() => onSelect(it.itemId)} />
        ))}
      </div>
    </section>
  );
}
