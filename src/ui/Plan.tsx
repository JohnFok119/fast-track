// Step 4: the idea-to-move-in timeline, the ways to go faster, the next steps, and who handles what. Everything shown
// comes from the contract.
import type { Contact, Pathway, Phase, Step } from '../contract/types';
import { FasterPaths } from './faster/FasterPaths';
import { BuildingIcon, StateIcon } from './icons';
import { citeMeta } from './model';

const KIND_WORD: Record<Phase['kind'], string> = { LAW: 'Law', ASSUMPTION: 'Assumption', SKIPPED: 'Skipped', UNKNOWN: 'Unknown' };

export function PhaseNotes({ phases }: { phases: Phase[] }) {
  // Assumption rows are explained once, in the legend.
  const noted = phases.filter((p) => p.kind !== 'ASSUMPTION' && (p.note || p.citation));
  return (
    <ul className="tl-notes">
      {noted.map((p) => (
        <li key={p.id}><b>{p.label}.</b> {p.note}{' '}
          {p.citation ? <a href={p.citation.url} target="_blank" rel="noopener noreferrer">{p.citation.label} · {citeMeta(p.citation)}</a> : null}
        </li>
      ))}
    </ul>
  );
}

export function Timeline({ phases }: { phases: Phase[] }) {
  const longest = Math.max(...phases.map((p) => p.drawMonths ?? 0), 1);
  return (
    <div className="tl">
      {phases.map((p, i) => {
        const width = p.drawMonths ? `${Math.max((p.drawMonths / longest) * 100, 3)}%` : '100%';
        const tip = [p.note, p.citation ? `${p.citation.label} · ${citeMeta(p.citation)}` : null].filter(Boolean).join(' · ');
        return (
          <div className="r rise" key={p.id} style={{ ['--i' as string]: i }} title={tip}>
            <span>{p.label}</span>
            <span className="track"><span className={`fill k-${p.kind}`} style={{ width }} /></span>
            <span style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'flex-end' }}>
              <b style={{ fontWeight: 600 }}>{p.value}</b>
              {p.citation ? <a className={`badge ${p.kind === 'LAW' ? 'law' : ''}`} href={p.citation.url} target="_blank" rel="noopener noreferrer">{KIND_WORD[p.kind]}</a>
                : <span className="badge">{KIND_WORD[p.kind]}</span>}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function Legend() {
  return (
    <div className="legend">
      <span><i className="k-LAW" />Law: the city's legal deadline</span>
      <span><i className="k-ASSUMPTION" />Assumption: the event brief's estimate, not measured</span>
      <span><i className="k-SKIPPED" />Skipped on this path</span>
      <span><i className="k-UNKNOWN" />Unknown</span>
    </div>
  );
}

export function Steps({ steps, pushBack }: { steps: Step[]; pushBack: number }) {
  const all = [...(pushBack ? [{ text: `Clear the ${pushBack} flagged line${pushBack === 1 ? '' : 's'} first: send the letter.`, kind: 'ADVICE' as const }] : []), ...steps];
  return (
    <ol className="steps">
      {all.map((s, i) => (
        <li key={s.text}><b>{i + 1}</b>
          <span>{s.text}{' '}
            {s.citation ? <a className="badge law" href={s.citation.url} target="_blank" rel="noopener noreferrer" title={citeMeta(s.citation)}>Law</a> : <span className="badge">Advice</span>}
          </span>
        </li>
      ))}
    </ol>
  );
}

export function Who({ contacts, escalation }: { contacts: Contact[]; escalation: Contact }) {
  const card = (c: Contact, esc: boolean) => (
    <div className={`c ${esc ? 'esc' : ''}`} key={c.office}>
      <span className="ic">{esc ? <StateIcon /> : <BuildingIcon />}</span>
      <span><b style={{ fontWeight: 600 }}>{c.office}</b><br /><span className="muted" style={{ fontSize: '0.85rem' }}>{c.handles}</span>{' '}
        <a href={c.citation.url} target="_blank" rel="noopener noreferrer" className="muted" style={{ fontSize: '0.8rem' }}>Source</a></span>
    </div>
  );
  return <div className="who">{contacts.map((c) => card(c, false))}{card(escalation, true)}</div>;
}

interface Props { pathway: Pathway; phases: Phase[]; steps: Step[]; pushBack: number; contacts: Contact[]; escalation: Contact }

export function Plan({ pathway, phases, steps, pushBack, contacts, escalation }: Props) {
  return (
    <>
      <section className="card" aria-labelledby="s4">
        <h2 className="h" id="s4"><span className="stepno">4</span>Your timeline, plans to move-in</h2>
        <p className="muted" style={{ fontSize: '0.85rem', margin: '-4px 0 12px' }}>Starts once you own the lot. Finding land and funding are not included.</p>
        <Timeline phases={phases} />
        <Legend />
        <PhaseNotes phases={phases} />
      </section>
      <FasterPaths pathway={pathway} />
      <div className="duo">
        <section className="card" aria-labelledby="s4b"><h2 className="h" id="s4b">Next steps</h2><Steps steps={steps} pushBack={pushBack} /></section>
        <section className="card" aria-labelledby="s5"><h2 className="h" id="s5"><span className="stepno">5</span>Who to contact</h2><Who contacts={contacts} escalation={escalation} /></section>
      </div>
    </>
  );
}
