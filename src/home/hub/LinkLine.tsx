// A red line with a dot at each end that joins two quotes (the city's words and HCD's). It draws itself when it
// first appears and redraws, without the drawing, when the window is resized.
import { useEffect, useRef, useState, type RefObject } from 'react';
import { prefersReducedMotion } from '../../theme';
import { CurvePlanner, type Curve } from './CurvePlanner';
import { boxOf, useResizeTick } from './useCurves';
import './linkline.css';

const planner = new CurvePlanner();

interface Props {
  from: RefObject<HTMLElement | null>;
  to: RefObject<HTMLElement | null>;
  /** The line is drawn only while this is true. */
  active?: boolean;
  /** Milliseconds to wait before the first drawing. */
  delay?: number;
}

export function LinkLine({ from, to, active = true, delay = 0 }: Props) {
  const svg = useRef<SVGSVGElement>(null);
  const drawn = useRef(false);
  const [curve, setCurve] = useState<Curve | null>(null);
  const [animate, setAnimate] = useState(false);
  const tick = useResizeTick();

  useEffect(() => {
    const a = from.current;
    const b = to.current;
    const box = svg.current?.parentElement;
    if (!active || !a || !b || !box) {
      drawn.current = false;
      return;
    }
    const draw = (withMotion: boolean) => {
      setCurve(planner.plan(boxOf(a), boxOf(b), boxOf(box), 'h'));
      setAnimate(withMotion && !prefersReducedMotion());
    };
    if (drawn.current) {
      draw(false);
      return;
    }
    const timer = window.setTimeout(() => {
      drawn.current = true;
      draw(true);
    }, prefersReducedMotion() ? 0 : delay);
    return () => window.clearTimeout(timer);
  }, [active, delay, from, to, tick]);

  return (
    <svg ref={svg} className="ft-link" aria-hidden="true">
      {curve && (
        <>
          <path d={curve.d} pathLength={1} className={animate ? 'draw' : undefined} />
          {curve.ends.map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={4} />
          ))}
        </>
      )}
    </svg>
  );
}
