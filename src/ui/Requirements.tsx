// The city's requirements, verdict first, and the detail for the selected one with every source.
import type { Citation, Flag } from '../contract/types';
import { VERDICT } from '../letter/verdict';
import { citeMeta, type Item } from './model';

function Cite({ c }: { c: Citation }) {
  return (
    <a className="cite" href={c.url} target="_blank" rel="noopener noreferrer">
      <span className="go" aria-hidden="true">↗</span>
      <div className="t">{c.label}</div>
      <div className="m">{citeMeta(c)}</div>
    </a>
  );
}

function FlagBody({ flag, multi }: { flag: Flag; multi: boolean }) {
  if (flag.status === 'UNKNOWN') return null;
  return (
    <div className="blk">
      {multi ? <span className={`pill s-${flag.status}`}>{VERDICT[flag.status].label}{flag.mapping ? ` · ${flag.mapping.old}` : ''}</span> : null}
      <div className="blk"><div className="lbl">Why</div><p>{flag.why}</p></div>
      {flag.mapping ? (
        <div className="blk">
          <div className="lbl">Old number, new number</div>
          <p className="mono">{flag.mapping.old} → {flag.mapping.now}</p>
          {flag.mapping.exactSection ? null : <p className="muted" style={{ fontSize: '0.85rem' }}>No single exact replacement section, so we do not name one.</p>}
        </div>
      ) : null}
      <div className="blk"><div className="lbl">Sources ({flag.citations.length})</div>
        <div className="cites">{flag.citations.map((c) => <Cite key={`${c.sourceId}-${c.section ?? ''}-${c.page ?? ''}`} c={c} />)}</div>
      </div>
      {flag.note ? <div className="blk"><div className="lbl">Limits</div><p>{flag.note}</p></div> : null}
    </div>
  );
}

export function Detail({ item, onLetter }: { item: Item | undefined; onLetter: () => void }) {
  if (!item) return <aside className="card detail muted">Pick a line to see why, with every source.</aside>;
  const multi = item.flags.filter((f) => f.status !== 'UNKNOWN').length > 1;
  return (
    <aside className="card detail pop" key={item.itemId} aria-live="polite">
      <div className="lbl">Line {item.itemId}</div>
      {item.statuses.map((s) => (
        <div key={s} className={`verdict v-${s}`}><div className="t">{VERDICT[s].label}</div><p>{VERDICT[s].explain}</p></div>
      ))}
      <div className="blk"><div className="lbl">What the city wrote</div><div className="said">{item.text}</div></div>
      {item.flags.map((f) => <FlagBody key={`${f.itemId}-${f.ruleId ?? 'none'}`} flag={f} multi={multi} />)}
      {item.needsAttention ? (
        <div className="blk"><button type="button" className="btn solid" onClick={onLetter}>Write the letter</button></div>
      ) : null}
    </aside>
  );
}

interface ListProps { items: Item[]; selected: string | null; onSelect: (id: string) => void }

export function RequirementList({ items, selected, onSelect }: ListProps) {
  return (
    <ol className="rows" aria-label="Requirements">
      {items.map((it, i) => (
        <li key={it.itemId}>
          <button type="button" className={`row ${i < 8 ? 'rise' : ''}`} style={{ ['--i' as string]: i }} aria-pressed={it.itemId === selected} onClick={() => onSelect(it.itemId)}>
            <span className="r1">
              <span style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{it.statuses.map((s) => <span key={s} className={`pill s-${s}`}>{VERDICT[s].label}</span>)}</span>
              <span className="mono muted" style={{ fontSize: '0.75rem' }}>{it.itemId}</span>
            </span>
            <span className="q">{it.text}</span>
          </button>
        </li>
      ))}
    </ol>
  );
}
