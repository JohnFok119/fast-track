// The checked list on the left, the picked line's source open beside it. On a phone the source opens under the line.
import { useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import type { CityRun } from '../../contract/types';
import { prefersReducedMotion } from '../../theme';
import type { Item } from '../model';
import { ClashList, type Line } from './ClashList';
import { Locator, SourcePane } from './SourcePane';
import { useMedia } from './useMedia';

/** Below this width the two columns stack, as in the Paper prototype. */
export const NARROW = '(max-width: 960px)';

interface Props {
  run: CityRun;
  items: Item[];
}

interface RowProps {
  line: Line;
  on: boolean;
  /** The source pane, when it opens under this line. */
  below: ReactNode;
  register: (id: string, el: HTMLButtonElement | null) => void;
  onPick: () => void;
  onKey: (e: KeyboardEvent<HTMLButtonElement>) => void;
}

function Row({ line, on, below, register, onPick, onKey }: RowProps) {
  return (
    <li className={on ? 'rs-r sel' : 'rs-r'}>
      <button type="button" aria-pressed={on} tabIndex={on ? 0 : -1} ref={(el) => register(line.id, el)} onClick={onPick} onKeyDown={onKey}>
        <span className="rs-t">
          <span className="rs-tx">{line.text}</span>
          <small className="mono"><Locator line={line} /></small>
        </span>
        <span className={`rs-chip rs-c-${line.status}`}>{line.chip}</span>
      </button>
      {below}
    </li>
  );
}

/** The picked line, and how a click, a key or the pane's buttons move it. Keys also move the focus. */
function usePicker(list: ClashList, narrow: boolean) {
  const [pickedId, setPickedId] = useState(list.first);
  const buttons = useRef(new Map<string, HTMLButtonElement>());
  const moved = useRef(false);

  // On a phone the source above closes as a new one opens below, so bring the picked line back into view.
  useLayoutEffect(() => {
    if (!narrow || !moved.current || !pickedId) return;
    const top = buttons.current.get(pickedId)?.getBoundingClientRect().top ?? 0;
    if (top < 0 || top > window.innerHeight * 0.6) {
      window.scrollTo({ top: window.scrollY + top - 16, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }
  }, [pickedId, narrow]);

  const register = (id: string, el: HTMLButtonElement | null) => {
    if (el) buttons.current.set(id, el);
    else buttons.current.delete(id);
  };
  const go = (id: string, focus: boolean) => {
    moved.current = true;
    setPickedId(id);
    if (focus) buttons.current.get(id)?.focus();
  };
  const onKey = (e: KeyboardEvent<HTMLButtonElement>, id: string) => {
    const to = list.move(id, e.key);
    if (!to) return;
    e.preventDefault();
    go(to, true);
  };
  return { pickedId, register, go, onKey };
}

function Head({ list, narrow }: { list: ClashList; narrow: boolean }) {
  return (
    <>
      <h1 className="gd-q rs-h">{list.heading}</h1>
      <ul className="rs-tally" aria-label="Lines by status">
        {list.tally.map((t) => (
          <li key={t.status}><span className={`rs-chip rs-c-${t.status}`}>{t.label}</span><b className="mono">{t.n}</b></li>
        ))}
      </ul>
      <p className="rs-sub">
        {narrow
          ? "Pick a line to open the city's words and the state's answer under it."
          : "Pick a line to see the city's words beside the state's answer. The arrow keys move between lines."}
      </p>
    </>
  );
}

export function Clash({ run, items }: Props) {
  const list = useMemo(() => new ClashList(items), [items]);
  const narrow = useMedia(NARROW);
  const { pickedId, register, go, onKey } = usePicker(list, narrow);
  const pane = pickedId ? list.pane(pickedId) : null;
  // On a phone the pane moves to the next line, so its buttons move the focus there too.
  const source = pane ? <SourcePane pane={pane} run={run} onGo={(id) => go(id, narrow)} /> : null;

  return (
    <div className="rs-b1">
      <div className="rs-main">
        <Head list={list} narrow={narrow} />
        <ol className="rs-rows">
          {list.lines.map((line) => (
            <Row
              key={line.id}
              line={line}
              on={line.id === pickedId}
              below={narrow && line.id === pickedId ? source : null}
              register={register}
              onPick={() => go(line.id, false)}
              onKey={(e) => onKey(e, line.id)}
            />
          ))}
        </ol>
      </div>
      {narrow ? null : <div className="rs-side">{source}</div>}
    </div>
  );
}
