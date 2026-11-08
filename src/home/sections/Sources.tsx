// "Every answer has a source.": four cards that are pictures of the documents. Titles and dates come from
// data/sources/index.json through SourceCards.
import { useMemo } from 'react';
import { SourceCards, type MiniDoc } from '../trust/sourceCards';
import './sources.css';

function Doc({ doc }: { doc: MiniDoc }) {
  return (
    <span className={`md ${doc.kind === 'hcd' ? '' : doc.kind}`.trim()} style={{ '--o': doc.offset } as React.CSSProperties}>
      <em>{doc.tag}</em>
      {doc.label}
      {doc.date && <small>{doc.date}</small>}
    </span>
  );
}

export function Sources() {
  const { cards, checked } = useMemo(() => {
    const all = SourceCards.fromData();
    return { cards: all.build(), checked: all.checkedOverall() };
  }, []);
  return (
    <section className="sources pad" id="sources" aria-label="Sources">
      <div className="wrap center">
        <h2 className="disp sources-h" data-rv>Every answer has a source.</h2>
        <p className="lede" data-rv>Each rule names where it comes from, the page, and the date we checked it.</p>
        <div className="srcgrid">
          {cards.map((card) => (
            <div className="sc" data-rv key={card.id}>
              <div className="sv">
                {card.book ? (
                  <span className="bk"><small>HCD</small>{card.book.name}{card.book.date && <small>{card.book.date}</small>}</span>
                ) : (
                  card.docs.map((d) => <Doc doc={d} key={d.tag + d.label} />)
                )}
              </div>
              <h3 className="disp">{card.title}</h3>
            </div>
          ))}
        </div>
        <p className="src checked">All checked {checked}.</p>
      </div>
    </section>
  );
}
