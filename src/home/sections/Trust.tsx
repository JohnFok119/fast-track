// "Built to be trusted.": three tiles, each one small moving picture and a few words.
// The citations in the pictures come from a real rule (see HomeFacts); the animation runs when a tile reveals.
import { useMemo } from 'react';
import { HomeFacts } from '../trust/facts';
import './trust.css';

export function Trust() {
  const { trust } = useMemo(() => HomeFacts.fromData(), []);
  return (
    <section className="trust dark smooth pad" id="trust" aria-label="Built to be trusted">
      <div className="wrap center">
        <h2 className="disp trust-h" data-rv>Built to be trusted.</h2>
        <p className="lede" data-rv>No confident wrong answers.</p>
        <div className="tgrid">
          <div className="trt" data-rv>
            <div className="tv tv-rules" aria-hidden="true">
              {trust.chips.map((chip, k) => (
                <span className="chip-d" style={{ '--k': k } as React.CSSProperties} key={chip}>{chip}<i>{'✓'}</i></span>
              ))}
            </div>
            <b>Grounded in the law</b>
          </div>
          <div className="trt" data-rv>
            <div className="tv tv-unk" aria-hidden="true">
              {(['c', 'c', 'u'] as const).map((kind, k) => (
                <div className="ur" key={k}>
                  <i />
                  <span className={kind} style={{ '--k': k } as React.CSSProperties}>{kind === 'c' ? '✕' : '?'}</span>
                </div>
              ))}
            </div>
            <b>Never guesses</b>
          </div>
          <div className="trt" data-rv>
            <div className="tv tv-date" aria-hidden="true">
              <span className="chip-d">{trust.dated}</span>
              <span className="ok">{'✓'} Checked {trust.checked}</span>
            </div>
            <b>Sourced and dated</b>
          </div>
        </div>
      </div>
    </section>
  );
}
