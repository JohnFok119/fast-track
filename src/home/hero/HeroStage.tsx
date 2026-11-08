// The hero's right side: a pile of documents that folds into the Fast Track tile, then an app window that ticks off
// the clashes. Pure markup; the HeroTimeline decides when each part shows. Hidden from screen readers (it only repeats
// what the page already says).
import type { CSSProperties, RefObject } from 'react';
import { SproutLogo } from '../../brand/Logo';
import type { HeroContent, HeroLetter } from './HeroContent';

function slot(x: string, y: string, r: number, i: number): CSSProperties {
  return { '--x': x, '--y': y, '--r': `${r}deg`, '--i': i } as CSSProperties;
}

function LetterDoc({ letter, style }: { letter: HeroLetter; style: CSSProperties }) {
  return (
    <div className="doc" style={style}>
      <div className="dh lh">
        <b>HCD</b>
        <span>{letter.ref}</span>
      </div>
      <i />
      <i className="s" />
      {letter.line && <p className="qh l">{letter.line.quoted ? `“${letter.line.text}”` : letter.line.text}</p>}
      <i />
      <i className="s" />
    </div>
  );
}

function Pile({ content }: { content: HeroContent }) {
  const { ordinance, letters, statute, handbook } = content;
  return (
    <>
      <div className="doc" style={slot('0%', '4%', -7, 0)}>
        <div className="dh">
          <b>{ordinance.heading}</b>
          <span>{ordinance.ref}</span>
        </div>
        <i />
        <i className="s" />
        <p className="qh c">{ordinance.quotes[0]}</p>
        <i />
        <i className="s" />
        <p className="qh c">{ordinance.quotes[1]}</p>
        <i />
        <span className="bdg">{ordinance.badge}</span>
      </div>
      {letters[0] && <LetterDoc letter={letters[0]} style={slot('46%', '0%', 5, 1)} />}
      <div className="doc stat" style={slot('60%', '44%', -4, 2)}>
        <span className="sec">§</span>
        <b>{statute.heading}</b>
        <i />
        <i className="s" />
        <i />
      </div>
      <div className="doc cover" style={slot('4%', '54%', 6, 3)}>
        <small>HCD</small>
        <b>{handbook.title}</b>
        <small>{handbook.date}</small>
      </div>
      {letters[1] && <LetterDoc letter={letters[1]} style={slot('31%', '62%', -2, 4)} />}
    </>
  );
}

function Window({ content }: { content: HeroContent }) {
  return (
    <div className="win">
      <div className="win-top">
        <i />
        <i />
        <i />
        <span>{content.windowTitle}</span>
      </div>
      <div className="win-body">
        <h3 className="disp">
          {content.windowHeading}
          <br />
          Here&apos;s what&apos;s in the way.
        </h3>
        <p className="win-sub">{content.summary}</p>
        <div className="todo-h">To clear</div>
        {content.rows.map((row, k) => (
          <div className="todo" style={{ '--k': k } as CSSProperties} key={row.text}>
            <span className="cb" />
            <div>
              <span className="tt">{row.text}</span>
              <span className="tags">
                <em className="t-c">Conflicts</em>
                <em className="t-s">{row.tag}</em>
                <em className="t-d">Added to your draft</em>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function HeroStage({ content, stageRef }: { content: HeroContent; stageRef: RefObject<HTMLDivElement | null> }) {
  return (
    <div className="stage" ref={stageRef} aria-hidden="true">
      <Pile content={content} />
      <div className="ft-tile">
        <SproutLogo size={56} />
      </div>
      <Window content={content} />
      <svg className="cursor" viewBox="0 0 24 24">
        <path d="M5 3l14 8-6.5 1.5L9 19z" fill="#faf8f6" stroke="#281e15" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
