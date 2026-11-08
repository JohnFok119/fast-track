// The six steps of the story, Lot to Keys. Laws, numbers, quotes, dates and citations come from StoryFacts.
import { useRef, type CSSProperties, type RefObject } from 'react';
import { APP_URL } from '../links';
import type { Cite, Quote, StoryFacts } from './facts';
import { LinkLine } from './LinkLine';

const delay = (d: number) => ({ '--d': d }) as CSSProperties;

/** A quote with its key words in bold, in straight quote marks as in the source. */
function Quoted({ quote }: { quote: Quote }) {
  const at = quote.strong ? quote.text.indexOf(quote.strong) : -1;
  if (at < 0) return <>"{quote.text}"</>;
  return <>"{quote.text.slice(0, at)}<strong>{quote.strong}</strong>{quote.text.slice(at + quote.strong.length)}"</>;
}

function Source({ cite, className }: { cite: Cite; className: string }) {
  if (!cite.url) return <span className={className}>{cite.text}</span>;
  return <a className={className} href={cite.url} title={cite.title} target="_blank" rel="noreferrer">{cite.text}</a>;
}

interface StepProps {
  className: string;
  facts: StoryFacts;
  current: boolean;
}

function Lot({ className, facts }: StepProps) {
  return (
    <article className={className}>
      <span className="ey">01 · The lot</span>
      <h3 className="disp">It starts with a lot you already have.</h3>
      <div className="lotcard pop">
        <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
          <path className="pin-body" d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7z" />
          <circle className="pin-dot" cx="12" cy="9" r="2.6" />
        </svg>
        <div><b>{facts.city}</b><span>City found from the lot</span></div>
      </div>
      <p>No city picker. <strong>No forms.</strong></p>
    </article>
  );
}

function Build({ className, facts }: StepProps) {
  return (
    <article className={className}>
      <span className="ey">02 · What you're building</span>
      <h3 className="disp">Pick what you're building.</h3>
      <div className="pills">
        <span className="pl pop" style={delay(0)}>Backyard home</span>
        <span className="pl sel pop" style={delay(1)}>{`Duplex (${facts.lawName})`}</span>
        <span className="pl pop" style={delay(2)}>Lot split</span>
      </div>
      <p>That's <strong>the only question</strong>.</p>
    </article>
  );
}

function Read({ className, facts, current }: StepProps) {
  const city = useRef<HTMLSpanElement>(null);
  const hcd = useRef<HTMLSpanElement>(null);
  return (
    <article className={className}>
      <span className="ey">03 · Read</span>
      <h3 className="disp">The city's rules, next to state law.</h3>
      <div className="docs pop">
        <div className="mdoc"><b>City code</b><i /><i /><span className="q c" ref={city}><Quoted quote={facts.cityQuote} /></span><i /></div>
        <div className="mdoc"><b>HCD letter</b><i /><span className="q l" ref={hcd}><Quoted quote={facts.hcdQuote} /></span><i /><i /></div>
        <LinkLine from={city} to={hcd} active={current} />
      </div>
      <p>Line by line, <strong>joined where they clash</strong>.</p>
    </article>
  );
}

function Clash({ className, facts }: StepProps) {
  return (
    <article className={className}>
      <span className="ey">04 · Clash</span>
      <h3 className="disp">Every line the state says the city can't require.</h3>
      <div className="clash">
        <span className="chip conf pop" style={delay(0)}>{`✕ ${facts.conflicts} of ${facts.total} lines`}</span>
        <div className="crow pop" style={delay(1)}>
          <div className="a">Each home <strong>{facts.floorCap} sq ft max</strong></div>
          <span className="xx" aria-hidden="true">✕</span>
          <div className="b">HCD: <strong>must be removed</strong>.</div>
        </div>
        <div className="crow pop" style={delay(2)}>
          <div className="a">Duplex homes: <strong>{facts.oneStory}</strong></div>
          <span className="xx" aria-hidden="true">✕</span>
          <div className="b">Far below the usual <strong>{facts.usual}</strong>.</div>
        </div>
      </div>
      <p>In <strong>plain words</strong>, each with its source.</p>
    </article>
  );
}

function Fix({ className, facts, current }: StepProps) {
  const ask = useRef<HTMLSpanElement>(null);
  const cite = useRef<HTMLSpanElement>(null);
  return (
    <article className={className}>
      <span className="ey">05 · Fix</span>
      <h3 className="disp">A draft you send yourself.</h3>
      <div className="card dk letter pop">
        <span className="dr">Draft · not sent</span><i /><i className="s" />
        <span className="ask" ref={ask}>Please remove the <strong>{facts.floorCap} sq ft cap</strong>.</span>
        <i />
        <span className="cite" ref={cite}><Source cite={facts.floorCite} className="cite-link" /></span>
        <LinkLine from={ask} to={cite} dir="v" active={current} />
      </div>
      <p><strong>Every ask cites</strong> the law or HCD letter behind it.</p>
    </article>
  );
}

function Keys({ className, facts }: StepProps) {
  const { amount, unit, cite } = facts.clock;
  return (
    <article className={className}>
      <span className="ey">06 · Keys</span>
      <h3 className="disp">Hold the city to its clock.</h3>
      <div className="card clock pop">
        <svg width="92" height="92" viewBox="0 0 92 92" role="img" aria-label={`${amount} ${unit}`}>
          <circle className="track" cx="46" cy="46" r="38" fill="none" strokeWidth="8" />
          <circle className="ring" cx="46" cy="46" r="38" fill="none" strokeWidth="8" strokeLinecap="round" transform="rotate(-90 46 46)" />
          <text className="num" x="46" y="50" textAnchor="middle">{amount}</text>
          <text className="unit" x="46" y="65" textAnchor="middle">{unit}</text>
        </svg>
        <div>
          <b>{`To approve or deny a complete ${facts.lawName} application.`}</b>
          <span>Miss it, and it's <strong>deemed approved</strong>.</span>
          <Source cite={cite} className="src" />
        </div>
      </div>
      <a className="btn btn-esp pop cta" style={delay(2)} href={APP_URL}>Check your lot →</a>
    </article>
  );
}

const STEPS = [Lot, Build, Read, Clash, Fix, Keys];

interface Props {
  facts: StoryFacts;
  current: number;
  reached: number;
  listRef: RefObject<HTMLDivElement | null>;
}

export function StorySteps({ facts, current, reached, listRef }: Props) {
  return (
    <div className="st-steps" ref={listRef}>
      {STEPS.map((Step, i) => (
        <Step key={i} facts={facts} current={i === current} className={`st-step${i <= reached ? ' on' : ''}${i === current ? ' cur' : ''}`} />
      ))}
    </div>
  );
}
