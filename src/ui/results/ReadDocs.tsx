// The two documents side by side: the city's lines and the state's own words. While reading, the line being read
// glows, the state side turns to the words that answer it, and each clash lights up on both sides with its number.
// After reading, a clash card can turn both documents back to that clash.
import { Fragment, useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import type { CityRun } from '../../contract/types';
import { prefersReducedMotion } from '../../theme';
import { day } from '../model';
import { NEW_TAB } from './AnswerDoc';
import type { Mark, Part } from './marks';
import type { CityLine, ReadModel } from './ReadModel';
import type { ScanFrame } from './ReadScan';

/** Turn both documents to clash `n`. `key` changes on every ask, so asking twice turns them again. */
export interface Focus {
  n: number;
  key: number;
}

interface Props {
  model: ReadModel;
  run: CityRun;
  frame: ScanFrame;
  focus: Focus | null;
}

const PULSE_MS = 1400;

/** Scrolls `box` so `el` sits `at` of the way down it. Never moves the page. */
function turnTo(box: HTMLElement | null, el: HTMLElement | null | undefined, at: number): void {
  if (!box || !el || typeof box.scrollTo !== 'function') return;
  const top = Math.max(0, el.offsetTop - box.clientHeight * at);
  box.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}

function Doc({ kicker, title, meta, label, body, foot, busy }: {
  kicker: string; title: string; meta: string | null; label: string; body: ReactNode; foot: ReactNode; busy: boolean;
}) {
  return (
    <section className="rd-doc" aria-label={label} aria-busy={busy}>
      <header className="rd-dh">
        <span className="rd-k">{kicker}</span>
        <b>{title}</b>
        {meta ? <span className="mono">{meta}</span> : null}
      </header>
      {body}
      <footer className="rd-ft">{foot}</footer>
    </section>
  );
}

function LineText({ line, shown }: { line: CityLine; shown: boolean }) {
  return <>{line.segments.map((s, k) => (s.mark && shown ? <mark key={k} data-n="old">{s.text}</mark> : s.text))}</>;
}

function Parts({ parts, visible }: { parts: Part[]; visible: (m: Mark) => boolean }) {
  const badged = new Set<Mark>();
  return (
    <>
      {parts.map((p, k) => {
        if (p.mark === null || !visible(p.mark)) return p.text;
        const badge = typeof p.mark === 'number' && !badged.has(p.mark);
        badged.add(p.mark);
        return (
          <Fragment key={k}>
            {badge ? <sup className="rd-n">{p.mark}</sup> : null}
            <mark data-n={String(p.mark)}>{p.text}</mark>
          </Fragment>
        );
      })}
    </>
  );
}

export function ReadDocs({ model, run, frame, focus }: Props) {
  const cityBox = useRef<HTMLOListElement>(null);
  const stateBox = useRef<HTMLDivElement>(null);
  // The clash a card just asked for glows for a moment; the timer marks that ask as done.
  const [doneKey, setDoneKey] = useState<number | null>(null);
  const pulse = focus && focus.key !== doneKey ? focus.n : null;
  const oldSeen = model.lines.some((l, k) => k < frame.read && l.segments.some((s) => s.mark));
  const visible = (m: Mark) => (m === 'old' ? oldSeen : frame.found.includes(m));

  useLayoutEffect(() => {
    if (frame.line !== null) turnTo(cityBox.current, cityBox.current?.children[frame.line] as HTMLElement, 0.4);
  }, [frame.line]);
  useLayoutEffect(() => {
    if (frame.block !== null) turnTo(stateBox.current, stateBox.current?.children[frame.block] as HTMLElement, 0.12);
  }, [frame.block]);
  // Once read, both documents turn to the first clash, where the cards begin; with no clash, to the first line that
  // has something in the state's text (an old law number).
  useLayoutEffect(() => {
    if (!frame.done) return;
    const pair = model.pairs[0];
    const line = pair ? pair.line : model.lines.findIndex((l) => l.look !== null);
    const block = pair ? pair.block : model.lines[line]?.look ?? null;
    if (line >= 0) turnTo(cityBox.current, cityBox.current?.children[line] as HTMLElement, 0.1);
    if (block !== null) turnTo(stateBox.current, stateBox.current?.children[block] as HTMLElement, 0.12);
  }, [frame.done, model]);
  useEffect(() => {
    const pair = focus ? model.pairs.find((p) => p.n === focus.n) : null;
    if (!focus || !pair) return undefined;
    turnTo(cityBox.current, cityBox.current?.children[pair.line] as HTMLElement, 0.3);
    if (pair.block !== null) turnTo(stateBox.current, stateBox.current?.children[pair.block] as HTMLElement, 0.12);
    const t = window.setTimeout(() => setDoneKey(focus.key), PULSE_MS);
    return () => window.clearTimeout(t);
  }, [focus, model]);

  const busy = !frame.done;
  const cityLines = (
    <ol className="rd-body rd-lines" ref={cityBox} tabIndex={0}>
      {model.lines.map((l, k) => {
        const shown = k < frame.read;
        const lit = l.pair !== null && frame.found.includes(l.pair);
        const cls = ['rd-ln', frame.line === k ? 'on' : shown ? 'done' : 'todo', shown ? `v-${l.status}` : '', lit ? 'lit' : '', pulse !== null && pulse === l.pair ? 'pulse' : ''];
        return (
          <li key={l.id} className={cls.filter(Boolean).join(' ')}>
            {lit ? <span className="rd-n">{l.pair}</span> : null}
            <span className="rd-tx"><LineText line={l} shown={shown} /></span>
            <span className="rd-meta">
              <span className="mono">{l.section ? `${l.section} · ` : ''}{l.id}</span>
              {shown ? <span className={`rs-chip rs-c-${l.status}`}>{l.chip}</span> : null}
            </span>
          </li>
        );
      })}
    </ol>
  );
  const stateText = (
    <div className="rd-body rd-blocks" ref={stateBox} tabIndex={0}>
      {model.blocks.map((b, k) => {
        const on = !frame.done && frame.block === k;
        const pulsed = pulse !== null && b.parts.some((p) => p.mark === pulse);
        const cls = ['rd-b', `rd-${b.kind}`, on ? 'on' : '', pulsed ? 'pulse' : ''].filter(Boolean).join(' ');
        return b.kind === 'head'
          ? <h4 key={k} className={cls}>{b.parts.map((p) => p.text).join('')}</h4>
          : <p key={k} className={cls}><Parts parts={b.parts} visible={visible} /></p>;
      })}
    </div>
  );
  const doc = model.doc;
  return (
    <div className="rd">
      <Doc
        kicker="The city" title={`${model.cityName}'s rules`} meta={`Saved ${day(run.saved)}`} label={`${model.cityName}'s rules`}
        body={cityLines} busy={busy}
        foot={<>{run.sourceLabel} <a href={run.sourceUrl} {...NEW_TAB}>Open the source</a></>}
      />
      {doc ? (
        <Doc
          kicker="The state" title={doc.title} meta={doc.dated ? `Dated ${doc.dated}` : null} label={doc.title}
          body={stateText} busy={busy}
          foot={<>Quoted word for word from the source. The headings are ours. <a href={doc.url} {...NEW_TAB}>Open the source</a></>}
        />
      ) : null}
    </div>
  );
}
