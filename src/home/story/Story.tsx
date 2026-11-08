// "From soil to keys.": the scroll story. A house builds stage by stage, in 3D or as a flat drawing, while six steps
// tell how Fast Track clears the way. The 3D house and three.js load only when the section nears the screen.
import { useRef, type CSSProperties } from 'react';
import { BuildPlan, STAGE_NAMES } from './buildPlan';
import { StoryFacts } from './facts';
import { FlatHouse } from './FlatHouse';
import { useHouse3d, useStagePicker } from './hooks';
import { StorySteps } from './StorySteps';
import './story.css';

const FACTS = StoryFacts.load();
const plan = new BuildPlan();

function Rail({ stage }: { stage: number }) {
  return (
    <div className="rail" aria-hidden="true">
      <i style={{ '--p': plan.progress(stage) } as CSSProperties} />
      {STAGE_NAMES.map((name, i) => (
        <span key={name} className={i < stage ? 'done' : i === stage ? 'cur' : undefined}>{name}</span>
      ))}
    </div>
  );
}

export function Story() {
  const section = useRef<HTMLElement>(null);
  const steps = useRef<HTMLDivElement>(null);
  const host = useRef<HTMLDivElement>(null);
  const { current, reached } = useStagePicker(steps, STAGE_NAMES.length);
  const mode = useHouse3d(section, host, current);
  return (
    <section ref={section} id="story" className="story pad" aria-label="From soil to keys">
      <div className="wrap">
        <h2 className="disp center st-title" data-rv>From soil to keys.</h2>
        <p className="lede center" data-rv>Scroll. The house goes up as Fast Track clears the way.</p>
        <div className="st-grid">
          <div className="st-stage" data-house={mode}>
            <div
              className="house3d"
              ref={host}
              role="img"
              aria-label="3D model of a house being built in stages: lot, foundation, frame, walls, roof, finished"
            />
            <FlatHouse stage={current} />
            <Rail stage={current} />
          </div>
          <StorySteps facts={FACTS} current={current} reached={reached} listRef={steps} />
        </div>
      </div>
    </section>
  );
}
