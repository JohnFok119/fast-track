// A line drawn between two quotes once their step is current. It stays drawn after, and follows resizes.
import { useEffect, useRef, type RefObject } from 'react';
import { prefersReducedMotion } from '../../theme';
import { curve } from './curve';

const NS = 'http://www.w3.org/2000/svg';
const DRAW_DELAY_MS = 750;

function draw(svg: SVGSVGElement, a: HTMLElement, b: HTMLElement, dir: 'h' | 'v', animate: boolean): boolean {
  const box = svg.parentElement;
  if (!box || !a.offsetParent || !b.offsetParent) return false;
  const { d, ends } = curve(box.getBoundingClientRect(), a.getBoundingClientRect(), b.getBoundingClientRect(), dir);
  svg.replaceChildren();
  const path = document.createElementNS(NS, 'path');
  path.setAttribute('d', d);
  svg.append(path);
  if (animate && typeof path.getTotalLength === 'function') {
    path.style.setProperty('--len', String(Math.ceil(path.getTotalLength())));
    path.classList.add('draw');
  }
  for (const [x, y] of ends) {
    const dot = document.createElementNS(NS, 'circle');
    dot.setAttribute('cx', String(x));
    dot.setAttribute('cy', String(y));
    dot.setAttribute('r', '4');
    svg.append(dot);
  }
  return true;
}

interface Props {
  from: RefObject<HTMLElement | null>;
  to: RefObject<HTMLElement | null>;
  dir?: 'h' | 'v';
  /** True while the step is current. The line draws itself the first time, then stays. */
  active: boolean;
}

export function LinkLine({ from, to, dir = 'h', active }: Props) {
  const svg = useRef<SVGSVGElement>(null);
  const drawn = useRef(false);

  useEffect(() => {
    const el = svg.current;
    if (!el) return;
    const redraw = (animate: boolean) => {
      if (from.current && to.current) drawn.current = draw(el, from.current, to.current, dir, animate) || drawn.current;
    };
    const onResize = () => {
      if (drawn.current) redraw(false);
    };
    window.addEventListener('resize', onResize);
    let timer = 0;
    if (active) {
      const reduce = prefersReducedMotion();
      if (drawn.current) redraw(false);
      else timer = window.setTimeout(() => redraw(!reduce), reduce ? 0 : DRAW_DELAY_MS);
    }
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('resize', onResize);
    };
  }, [active, from, to, dir]);

  return <svg ref={svg} className="wl" aria-hidden="true" />;
}
