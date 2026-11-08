// One clash row: the city's words and HCD's answer side by side. Tapping the row opens the exact wording and source.
import { useId, useRef } from 'react';
import { LinkLine } from '../hub/LinkLine';
import type { ShowcaseRow as Row } from './ShowcaseModel';

interface Props {
  row: Row;
  open: boolean;
  onToggle: (id: string) => void;
}

export function ShowcaseRow({ row, open, onToggle }: Props) {
  const detailId = useId();
  const cityRef = useRef<HTMLQuoteElement>(null);
  const hcdRef = useRef<HTMLQuoteElement>(null);
  const { before, mark, after } = row.hcdParts;
  const where = [row.sourceName, row.page, `checked ${row.checked}`].filter(Boolean).join(' · ');

  return (
    <div className={open ? 'row open' : 'row'}>
      <button type="button" className="sum" aria-expanded={open} aria-controls={detailId} onClick={() => onToggle(row.id)}>
        <span className="a"><span className="clamp">{row.cityQuote}</span></span>
        <span className="xx" aria-hidden="true">✕</span>
        <span className="b">
          <span className="clamp">{row.hcdQuote}</span>
          {row.page && <span className="pg">{row.page}</span>}
        </span>
      </button>
      {open && (
        <div className="zoom" id={detailId}>
          <blockquote ref={cityRef}>
            {row.cityQuote}
            {row.section && <span>{row.section}</span>}
          </blockquote>
          <blockquote className="st" ref={hcdRef}>
            {before}{mark && <mark>{mark}</mark>}{after}
            <span>
              {where} · <a href={row.sourceUrl} target="_blank" rel="noopener noreferrer">Open the source</a>
            </span>
          </blockquote>
          <LinkLine from={cityRef} to={hcdRef} />
        </div>
      )}
    </div>
  );
}
