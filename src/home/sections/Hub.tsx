// "Permit limbo. Cleared to build.": sources flow into Fast Track and out as one list.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SproutLogo } from '../../brand/Logo';
import { prefersReducedMotion } from '../../theme';
import { CurvePlanner } from '../hub/CurvePlanner';
import { HOME_RUN, HOME_SOURCES } from '../hub/homeData';
import { HubModel } from '../hub/HubModel';
import { FeedIcon } from '../hub/icons';
import { boxOf, useResizeTick } from '../hub/useCurves';
import { useInView } from '../reveal';
import './hub.css';

const planner = new CurvePlanner();
/** The output cards slide in for about a second; curves drawn before that point at the wrong spot, so draw again. */
const SETTLE_MS = 1500;

interface FlowPath {
  d: string;
  out: boolean;
}

export function Hub() {
  const model = useMemo(() => new HubModel(HOME_RUN, HOME_SOURCES), []);
  const hub = useRef<HTMLDivElement>(null);
  const flows = useRef<SVGSVGElement>(null);
  const core = useRef<HTMLDivElement>(null);
  const [paths, setPaths] = useState<FlowPath[]>([]);
  const [reached, setReached] = useState(false);
  const tick = useResizeTick();
  const onReach = useCallback(() => setReached(true), []);
  useInView(hub, onReach);

  useEffect(() => {
    if (!reached) return;
    const draw = () => {
      const root = hub.current;
      const svg = flows.current;
      const c = core.current;
      if (!root || !svg || !c || getComputedStyle(svg).display === 'none') {
        setPaths([]);
        return;
      }
      const container = boxOf(root);
      const coreBox = boxOf(c);
      const next: FlowPath[] = [];
      root.querySelectorAll('.hub-feed').forEach((el) => next.push({ d: planner.plan(boxOf(el), coreBox, container).d, out: false }));
      root.querySelectorAll('.hub-item').forEach((el) => next.push({ d: planner.plan(coreBox, boxOf(el), container).d, out: true }));
      setPaths(next);
    };
    draw();
    const later = window.setTimeout(draw, prefersReducedMotion() ? 0 : SETTLE_MS);
    return () => window.clearTimeout(later);
  }, [reached, tick]);

  return (
    <section className="hub-sec pad" id="how" aria-label="What Fast Track does">
      <div className="wrap center">
        <h2 className="disp hub-h" data-rv>
          <span className="strike">Permit limbo.</span> <span className="land">Cleared to build.</span>
        </h2>
        <p className="lede" data-rv>
          Fast Track reads the city&apos;s requirements next to state law and HCD&apos;s letters, and turns them into{' '}
          <strong>one list you can act on</strong>.
        </p>
        <div className="hub" id="hub" ref={hub} data-rv>
          <div className="hub-feeds">
            {[model.sides.city, model.sides.state].map((side, k) => (
              <div className="hub-col" key={k}>
                {side.map((feed) => (
                  <div className="hub-feed" key={feed.id}>
                    <span className="ic"><FeedIcon kind={feed.kind} /></span>
                    {feed.label}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="hub-core" ref={core}><SproutLogo size={64} /></div>
          <div className="hub-out">
            {model.outputs.map((item, i) => (
              <div className="hub-item" style={{ '--d': i } as React.CSSProperties} key={item.label}>
                <i />
                {item.label}
                {item.status === 'CONFLICTS'
                  ? <span className="chip conf">✕ Conflicts</span>
                  : <span className="chip unk">? Unknown</span>}
              </div>
            ))}
          </div>
          <svg className="hub-flows" ref={flows} aria-hidden="true">
            {paths.map((p, i) => <path key={i} d={p.d} className={p.out ? 'outp' : undefined} />)}
          </svg>
        </div>
      </div>
    </section>
  );
}
