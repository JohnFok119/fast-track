// One card per clash, as on the homepage: what the city says beside what the state says, how they clash, and the time
// saved if it is cleared (an estimate). Either side opens the exact words and turns both documents to the clash.
// The plain words are Claude's, written ahead of time; without a summary the card shows the engine's own words.
import { useId, useState } from 'react';
import type { TimeEstimate } from '../../assist/clash-types';
import type { CityRun } from '../../contract/types';
import { CiteList, NEW_TAB } from './AnswerDoc';
import { citeView } from './ClashList';
import type { Pair, ReadModel } from './ReadModel';

interface Props {
  model: ReadModel;
  run: CityRun;
  onFocus: (n: number) => void;
}

/** "About 2 to 4 months", or "About 2 months" when both ends agree. */
export function timeRange(t: TimeEstimate): string {
  const unit = t.high === 1 ? t.unit.replace(/s$/, '') : t.unit;
  return t.low === t.high ? `About ${t.high} ${unit}` : `About ${t.low} to ${t.high} ${unit}`;
}

function TimeSaved({ time }: { time: TimeEstimate }) {
  return (
    <div className="cc-time">
      <span className="cc-tl">Time saved if it&apos;s cleared</span>
      <b>{timeRange(time)}</b>
      <em>Estimate</em>
      <small>{time.basis} Not measured.</small>
    </div>
  );
}

function Zoom({ id, pair, run }: { id: string; pair: Pair; run: CityRun }) {
  const lines = pair.itemIds.flatMap((itemId) => run.flags.filter((f) => f.itemId === itemId && f.ruleId === pair.ruleId));
  return (
    <div className="cc-zoom" id={id} role="region" aria-label={`Exact words, ${pair.title}`}>
      <blockquote className="cc-q cc-qc">
        <small>{run.name}&apos;s words</small>
        {lines.map((f) => <p key={f.itemId}>{f.itemText}</p>)}
        <span className="cc-src">
          <span className="mono">{pair.itemIds.join(', ')}</span> · {run.sourceLabel}{' '}
          <a href={run.sourceUrl} {...NEW_TAB}>Open the source</a>
        </span>
      </blockquote>
      <span className="cc-link" aria-hidden="true"><i /></span>
      <blockquote className="cc-q cc-qs">
        <small>The state&apos;s answer</small>
        <p>{pair.flag.why}</p>
        <CiteList cites={pair.flag.citations.map(citeView)} />
      </blockquote>
    </div>
  );
}

function ClashCard({ pair, run, open, onToggle }: { pair: Pair; run: CityRun; open: boolean; onToggle: () => void }) {
  const zoomId = `${useId()}-zoom`;
  const s = pair.summary;
  const first = run.flags.find((f) => f.itemId === pair.itemIds[0]);
  const side = (cls: string, label: string, text: string) => (
    <button type="button" className={`cc-side ${cls}`} aria-expanded={open} aria-controls={zoomId} onClick={onToggle}>
      <small>{label}</small>
      <span>{text}</span>
    </button>
  );
  return (
    <li className={open ? 'cc open' : 'cc'}>
      <div className="cc-top">
        <span className="cc-n" aria-hidden="true">{pair.n}</span>
        <h3>{pair.title}</h3>
        <span className="rs-chip rs-c-CONFLICTS">State says no</span>
        {pair.itemIds.length > 1 ? <span className="cc-lines">{pair.itemIds.length} lines</span> : null}
      </div>
      <div className="cc-sides">
        {side('cc-city', `${run.name} says`, s?.citySays ?? first?.itemText ?? '')}
        <span className="cc-x" aria-hidden="true">✕</span>
        {side('cc-state', 'The state says', s?.stateSays ?? pair.flag.why ?? '')}
      </div>
      {s ? <p className="cc-clash"><b>How they clash.</b> {s.clash}</p> : null}
      {s ? <TimeSaved time={s.time} /> : null}
      {open ? <Zoom id={zoomId} pair={pair} run={run} /> : null}
    </li>
  );
}

export function ClashCards({ model, run, onFocus }: Props) {
  const [open, setOpen] = useState<ReadonlySet<number>>(() => new Set());
  if (!model.pairs.length) {
    return <p className="cc-none">No line here clashes with state law. The lines below still need a look.</p>;
  }
  const toggle = (n: number) => {
    setOpen((was) => {
      const next = new Set(was);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
    onFocus(n);
  };
  return (
    <>
      <p className="cc-note">
        <b>Tap either side for the exact words.</b>
        {model.pairs.some((p) => p.summary) ? ' Summaries and time estimates by Claude, checked against the sources. The rule set, not Claude, decides what clashes.' : null}
      </p>
      <ol className="cc-list" aria-label="Clashes">
        {model.pairs.map((p) => <ClashCard key={p.n} pair={p} run={run} open={open.has(p.n)} onToggle={() => toggle(p.n)} />)}
      </ol>
    </>
  );
}
