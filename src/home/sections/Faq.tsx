// The FAQ with the prototype banner, the plan to use AI, and what is next. The list lives in trust/faq.ts.
import { useMemo } from 'react';
import { buildFaq, type Seg } from '../trust/faq';
import { HomeFacts } from '../trust/facts';
import './faq.css';

function Text({ segs }: { segs: Seg[] }) {
  return (
    <>
      {segs.map((s, i) => {
        if (typeof s === 'string') return s;
        if ('u' in s) return <u key={i}>{s.u}</u>;
        if ('b' in s) return <strong key={i}>{s.b}</strong>;
        return <span key={i} className="claude-type">{s.claude}</span>;
      })}
    </>
  );
}

export function Faq() {
  const faq = useMemo(() => buildFaq(HomeFacts.fromData()), []);
  return (
    <section className="faq-sec pad" id="faq" aria-label="FAQ">
      <div className="wrap faq">
        <h2 className="disp" data-rv>FAQ</h2>
        <div>
          <div className="proto" data-rv>
            <span className="pt">Prototype</span>
            <p><Text segs={faq.banner} /></p>
          </div>
          {faq.items.map((item) => (
            <details key={item.question} open={item.open}>
              <summary><span className="disp">{item.question}</span></summary>
              {item.answer && <p><Text segs={item.answer} /></p>}
              {item.next && (
                <ul className="next">
                  {item.next.map((n) => (
                    <li key={n.title}>
                      <b>{n.title}</b>
                      <span>{n.text}</span>
                      {n.cite && <cite>{n.cite}</cite>}
                    </li>
                  ))}
                </ul>
              )}
              {item.note && <p className="note">{item.note}</p>}
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
