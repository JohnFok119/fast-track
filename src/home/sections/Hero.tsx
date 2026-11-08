// The dark hero: headline, house-outline background, and the documents-to-window animation.
import { useEffect, useRef, type CSSProperties, type RefObject } from 'react';
import { runCheck } from '../../contract/api';
import { prefersReducedMotion } from '../../theme';
import { HeroContent } from '../hero/HeroContent';
import { HeroStage } from '../hero/HeroStage';
import { HeroStageDriver } from '../hero/HeroStageDriver';
import { HeroTimeline } from '../hero/HeroTimeline';
import { HOUSES } from '../hero/houses';
import { APP_URL } from '../links';
import './hero.css';

const CONTENT = HeroContent.from(runCheck('dana-point'));

function HouseBackdrop() {
  return (
    <svg className="hbg" viewBox="0 0 1000 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {HOUSES.map((h) => (
        <path
          key={h.d}
          d={h.d}
          className={h.lit ? 'on' : h.fill ? 'fill' : undefined}
          style={h.lit ? ({ '--d': h.lit } as CSSProperties) : undefined}
        />
      ))}
    </svg>
  );
}

function useHeroLoop(stageRef: RefObject<HTMLDivElement | null>): void {
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const timeline = new HeroTimeline(new HeroStageDriver(stage), CONTENT.rows.length, { reducedMotion: prefersReducedMotion() });
    const watcher = new IntersectionObserver((entries) => timeline.setVisible(entries.some((e) => e.isIntersecting)));
    watcher.observe(stage);
    timeline.start();
    return () => {
      watcher.disconnect();
      timeline.stop();
    };
  }, [stageRef]);
}

export function Hero() {
  const stageRef = useRef<HTMLDivElement>(null);
  useHeroLoop(stageRef);
  return (
    <section className="hero dark" aria-label="Fast Track">
      <HouseBackdrop />
      <div className="wrap">
        <div>
          <div className="badges">
            <span className="pillb">
              <b>Prototype</b>Not legal advice. Talk to a professional.
            </span>
            <span className="byline">
              Built at<span className="claude-type">Claude Impact Lab</span>
            </span>
          </div>
          <h1 className="disp">Get homes built on the fast track.</h1>
          <p className="lede">
            Fast Track checks a city&apos;s backyard-home and duplex rules <strong>against state law</strong>, line by line. Every clash
            comes with <strong>its source</strong> and a draft you send yourself.
          </p>
          <div className="trust">
            <a className="btn btn-cream" href={APP_URL}>
              Check your lot
            </a>
          </div>
        </div>
        <HeroStage content={CONTENT} stageRef={stageRef} />
      </div>
      <div className="fade" />
    </section>
  );
}
