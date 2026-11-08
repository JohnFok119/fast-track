// The source, open: the city's own words for the picked line, then the state's answer with each source linked.
import type { CityRun } from '../../contract/types';
import { day } from '../model';
import type { Answer, Line, Pane } from './ClashList';
import { Wire } from './Wire';

interface Props {
  pane: Pane;
  run: CityRun;
  onGo: (id: string) => void;
}

const NEW_TAB = { target: '_blank', rel: 'noopener noreferrer' } as const;

/** Where a line sits: the section its quote names, if any, then its id, which never breaks across lines. */
export function Locator({ line }: { line: Line }) {
  return <>{line.section ? `${line.section} · ` : null}<span className="rs-nw">{line.id}</span></>;
}

function AnswerDoc({ answer }: { answer: Answer }) {
  const { renumber } = answer;
  return (
    <article className="rs-doc">
      <div className="rs-dh">
        <span className={`rs-chip rs-c-${answer.status}`}>{answer.verdict}</span>
        <b>{answer.status === 'UNKNOWN' ? 'No rule covers it yet' : "The state's answer"}</b>
      </div>
      <i aria-hidden="true" />
      <i className="s" aria-hidden="true" />
      <p className={`rs-q rs-a-${answer.status}`}>{answer.text}</p>
      {renumber ? (
        <dl className="rs-map">
          <div><dt>The city cites</dt><dd className="mono">{renumber.old}</dd></div>
          <div><dt>Now</dt><dd className="mono">{renumber.now}</dd></div>
          <div><dt>Exact new section</dt><dd className="mono">{renumber.exact}</dd></div>
        </dl>
      ) : null}
      {answer.cites.length ? (
        <ul className="rs-cites">
          {answer.cites.map((c) => (
            <li key={`${c.url} ${c.label} ${c.meta.join()}`}>
              <a href={c.url} {...NEW_TAB}>{c.label}</a>
              <span className="mono">{c.meta.map((m, k) => <span key={m}>{k ? ' · ' : ''}<span className="rs-nw">{m}</span></span>)}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {answer.note ? <p className="rs-note">{answer.note}</p> : null}
    </article>
  );
}

export function SourcePane({ pane, run, onGo }: Props) {
  const { line } = pane;
  return (
    <section className="rs-src" aria-labelledby="rs-src-h">
      <h2 id="rs-src-h" className="rs-src-h">The source, open</h2>
      <div className="rs-docs" key={line.id}>
        <article className="rs-doc">
          <div className="rs-dh">
            <b>The city asks</b>
            <span className="mono"><Locator line={line} /></span>
          </div>
          <i aria-hidden="true" />
          <i className="s" aria-hidden="true" />
          <p className={`rs-q rs-q-${line.status}`}>{pane.quote.map((s, k) => (s.mark ? <mark key={k}>{s.text}</mark> : s.text))}</p>
          <i aria-hidden="true" />
          <p className="rs-from">
            {run.sourceLabel} Saved {day(run.saved)}. <a href={run.sourceUrl} {...NEW_TAB}>Open the source</a>
          </p>
        </article>
        {pane.answers.map((a, k) => <AnswerDoc key={k} answer={a} />)}
        <Wire />
      </div>
      <div className="rs-pn">
        <button type="button" className="btn" disabled={!pane.prev} onClick={() => pane.prev && onGo(pane.prev)}>Previous line</button>
        <span className="mono">{`${pane.index} of ${pane.total}`}</span>
        <button type="button" className="btn" disabled={!pane.next} onClick={() => pane.next && onGo(pane.next)}>Next line</button>
      </div>
    </section>
  );
}
