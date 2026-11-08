// The FAQ with the prototype banner, the plan to use AI, and what is next. The list lives in trust/faq.ts.
// Each question is a button that opens a region; the height animation is CSS (faq.css), so closing animates too.
import { useId, useMemo, useState } from 'react';
import { buildFaq, type FaqItem, type Seg } from '../trust/faq';
import { HomeFacts } from '../trust/facts';
import { OpenRows } from '../showcase/OpenRows';
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

function Answer({ item }: { item: FaqItem }) {
  return (
    <>
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
    </>
  );
}

function FaqRow({ item, open, onToggle }: { item: FaqItem; open: boolean; onToggle: () => void }) {
  const id = useId();
  const qid = `${id}-q`;
  const aid = `${id}-a`;
  return (
    <div className="faq-item" data-open={open}>
      <h3 className="faq-h">
        <button type="button" id={qid} className="faq-q" aria-expanded={open} aria-controls={aid} onClick={onToggle}>
          <span className="disp">{item.question}</span>
          <span className="faq-ic" aria-hidden="true">+</span>
        </button>
      </h3>
      <div id={aid} className="faq-a" role="region" aria-labelledby={qid} inert={!open}>
        <div className="faq-a-in">
          <Answer item={item} />
        </div>
      </div>
    </div>
  );
}

export function Faq() {
  const faq = useMemo(() => buildFaq(HomeFacts.fromData()), []);
  const [rows, setRows] = useState(() => new OpenRows(faq.items.filter((i) => i.open).map((i) => i.question)));
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
            <FaqRow key={item.question} item={item} open={rows.isOpen(item.question)} onToggle={() => setRows(rows.toggle(item.question))} />
          ))}
        </div>
      </div>
    </section>
  );
}
