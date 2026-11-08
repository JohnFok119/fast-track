// Browser helpers for the curves: read an element's box, and know when the window was resized.
import { useEffect, useState } from 'react';
import type { Box } from './CurvePlanner';

export function boxOf(el: Element): Box {
  const r = el.getBoundingClientRect();
  return { left: r.left, top: r.top, right: r.right, bottom: r.bottom };
}

/** A number that goes up each time the window is resized, so a component can redraw its curves. */
export function useResizeTick(): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const onResize = () => setTick((t) => t + 1);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return tick;
}
