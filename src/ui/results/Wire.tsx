// Draws the copper wire from the city's words to the state's answer, and redraws it when the documents resize.
// Decoration only. It sits inside the documents' box, so their open animation moves the wire with them.
import { useLayoutEffect, useRef } from 'react';
import { wirePath } from './wire-path';

export function Wire() {
  const svg = useRef<SVGSVGElement>(null);

  useLayoutEffect(() => {
    const el = svg.current;
    const root = el?.parentElement;
    if (!el || !root) return undefined;
    const draw = () => {
      const [from, to] = root.querySelectorAll('.rs-q');
      const path = el.querySelector('path');
      const [a, b] = el.querySelectorAll('circle');
      if (!from || !to || !path || !a || !b) return;
      const wire = wirePath(from.getBoundingClientRect(), to.getBoundingClientRect(), root.getBoundingClientRect());
      path.setAttribute('d', wire.d);
      a.setAttribute('cx', String(wire.from.x));
      a.setAttribute('cy', String(wire.from.y));
      b.setAttribute('cx', String(wire.to.x));
      b.setAttribute('cy', String(wire.to.y));
    };
    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(root);
    return () => observer.disconnect();
  }, []);

  return (
    <svg className="rs-wire" ref={svg} aria-hidden="true">
      <path />
      <circle r="3.5" />
      <circle r="3.5" />
    </svg>
  );
}
