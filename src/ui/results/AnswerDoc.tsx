// The state's answer to one line, as a small document: the verdict, the engine's words, any renumbering, and each
// source with its date, page and the day it was checked. Every word and link comes from the engine's flag.
import type { Answer, Cite } from './ClashList';

export const NEW_TAB = { target: '_blank', rel: 'noopener noreferrer' } as const;

/** Each source as a link, then its date, page, section and check date, each kept whole on one line. */
export function CiteList({ cites }: { cites: Cite[] }) {
  if (!cites.length) return null;
  return (
    <ul className="rs-cites">
      {cites.map((c) => (
        <li key={`${c.url} ${c.label} ${c.meta.join()}`}>
          <a href={c.url} {...NEW_TAB}>{c.label}</a>
          <span className="mono">{c.meta.map((m, k) => <span key={m}>{k ? ' · ' : ''}<span className="rs-nw">{m}</span></span>)}</span>
        </li>
      ))}
    </ul>
  );
}

export function AnswerDoc({ answer }: { answer: Answer }) {
  const { renumber } = answer;
  return (
    <article className="rs-doc">
      <div className="rs-dh">
        <span className={`rs-chip rs-c-${answer.status}`}>{answer.verdict}</span>
        <b>{answer.status === 'UNKNOWN' ? 'No rule covers it yet' : "The state's answer"}</b>
      </div>
      <p className={`rs-q rs-a-${answer.status}`}>{answer.text}</p>
      {renumber ? (
        <dl className="rs-map">
          <div><dt>The city cites</dt><dd className="mono">{renumber.old}</dd></div>
          <div><dt>Now</dt><dd className="mono">{renumber.now}</dd></div>
          <div><dt>Exact new section</dt><dd className="mono">{renumber.exact}</dd></div>
        </dl>
      ) : null}
      <CiteList cites={answer.cites} />
      {answer.note ? <p className="rs-note">{answer.note}</p> : null}
    </article>
  );
}
