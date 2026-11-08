// The slow serif ticker of cities and sources. Its words come from the engine and the source index.
import { Fragment } from 'react';
import { tickerItems } from '../hero/HeroContent';
import './ticker.css';

const ITEMS = tickerItems();

function TickerSet({ hidden }: { hidden?: boolean }) {
  return (
    <div className="tk-set" aria-hidden={hidden || undefined}>
      {ITEMS.map((item) => (
        <Fragment key={item}>
          <span>{item}</span>
          <i>✦</i>
        </Fragment>
      ))}
    </div>
  );
}

export function Ticker() {
  return (
    <section className="ticker" aria-label="Cities and sources so far">
      <div className="tk-row">
        <TickerSet />
        <TickerSet hidden />
      </div>
    </section>
  );
}
