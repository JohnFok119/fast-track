// The three steps: pick what you're building, we read both sides, see every clash.
import { useCallback, useMemo, useRef, useState } from 'react';
import { HOME_PATHS, HOME_RUN } from '../hub/homeData';
import { PinIcon } from '../hub/icons';
import { LinkLine } from '../hub/LinkLine';
import { StepsModel } from '../hub/StepsModel';
import { useInView } from '../reveal';
import './steps.css';

const LINK_DELAY_MS = 700;

export function Steps() {
  const model = useMemo(() => new StepsModel(HOME_RUN, HOME_PATHS), []);
  const docs = useRef<HTMLDivElement>(null);
  const cityQuote = useRef<HTMLSpanElement>(null);
  const hcdQuote = useRef<HTMLSpanElement>(null);
  const [seen, setSeen] = useState(false);
  const onSeen = useCallback(() => setSeen(true), []);
  useInView(docs, onSeen);
  const { clash } = model;

  return (
    <section className="steps-sec pad" aria-label="Three steps">
      <div className="wrap center">
        <h2 className="disp steps-h" data-rv>Three steps. No permit jargon.</h2>
        <p className="lede" data-rv>Your lot&apos;s city comes with it. Tell us what you&apos;re building.</p>
        <div className="steps3">
          <div className="s3" data-rv>
            <div className="viz">
              <div>
                <div className="pills">
                  {model.pills.map((p) => (
                    <span key={p.label} className={p.selected ? 'pl sel' : 'pl'}>{p.label}</span>
                  ))}
                </div>
                <div className="lotcard">
                  <PinIcon />
                  <div><b>{model.cityName}</b><span>City found from the lot</span></div>
                </div>
              </div>
            </div>
            <h3 className="disp">Pick what you&apos;re building.</h3>
            <p>Backyard home, duplex or lot split. That&apos;s the only question.</p>
          </div>
          <div className="s3" data-rv>
            <div className="viz">
              <div className="docs" ref={docs}>
                <div className="mdoc">
                  <b>City code</b><i /><span className="q c" ref={cityQuote}>
                    {clash ? <>&quot;<strong>{clash.cityPhrase}</strong>&quot;</> : 'The city\'s words'}
                  </span><i />
                </div>
                <div className="mdoc">
                  <b>HCD letter</b><span className="q l" ref={hcdQuote}>
                    {clash ? <>&quot;<strong>{clash.hcdSentence}</strong>&quot;</> : 'HCD\'s words'}
                  </span><i /><i />
                </div>
                <LinkLine from={cityQuote} to={hcdQuote} active={seen} delay={LINK_DELAY_MS} />
              </div>
            </div>
            <h3 className="disp">We read both sides.</h3>
            <p>The city&apos;s rules next to state law and HCD&apos;s letters, joined where they clash.</p>
          </div>
          <div className="s3" data-rv>
            <div className="viz">
              <div className="crow">
                <div className="a">{clash ? <>{model.cityName}: <strong>{clash.cityPhrase}</strong></> : model.cityName}</div>
                <span className="xx" aria-hidden="true">✕</span>
                <div className="b">{clash ? <>HCD: <strong>{clash.hcdSentence}</strong></> : 'HCD'}</div>
              </div>
            </div>
            <h3 className="disp">See every clash.</h3>
            <p>In plain words, with the exact text, the source and the date we checked it.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
