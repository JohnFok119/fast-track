// The flat drawing of the house, shown when the 3D view cannot run. It builds through the same stages as the 3D one.
import type { CSSProperties } from 'react';
import { BuildPlan, type PartName } from './buildPlan';

const plan = new BuildPlan();
const STUD_XS = [108, 129, 150, 171, 192, 213, 234, 255, 272];
const MARKS = [[138, 210], [190, 170], [242, 210]] as const;
const SPECKS = [[40, 256, 2], [96, 268, 2.4], [150, 258, 1.8], [214, 270, 2.2], [268, 254, 2], [320, 266, 2.4]] as const;
const order = (i: number) => ({ '--i': i }) as CSSProperties;

const SOIL = (
  <>
    <rect className="h-soil" x="10" y="240" width="340" height="40" rx="6" />
    <g className="h-speck">{SPECKS.map(([cx, cy, r]) => <circle key={cx} cx={cx} cy={cy} r={r} />)}</g>
    <line className="h-soilline" x1="10" y1="240" x2="350" y2="240" strokeWidth="2" />
    <line className="h-lot" x1="92" y1="246" x2="288" y2="246" strokeWidth="2" strokeDasharray="6 6" />
  </>
);

const STAKE = (
  <>
    <line className="h-stake" x1="62" y1="198" x2="62" y2="240" strokeWidth="3" strokeLinecap="round" />
    <path className="h-flag" d="M62 198 L88 205 L62 212 Z" />
  </>
);

const STUDS = (
  <>
    {STUD_XS.map((x, i) => <line key={x} className="stud" style={order(i)} x1={x} y1="152" x2={x} y2="226" />)}
    <line className="stud" style={order(9)} x1="104" y1="151" x2="276" y2="151" strokeWidth="6" />
  </>
);

/** Door, path, a tree and speed lines. */
const FINISH = (
  <>
    <rect className="h-door" x="174" y="188" width="32" height="38" rx="2" strokeWidth="2" />
    <circle className="h-knob" cx="200" cy="208" r="2" />
    <path className="h-path" d="M178 240 L202 240 L214 280 L166 280 Z" />
    <rect className="h-trunk" x="314" y="200" width="6" height="40" />
    <circle className="h-tree1" cx="317" cy="190" r="20" />
    <circle className="h-tree2" cx="306" cy="200" r="13" />
    <g className="lg-speed h-speed" strokeWidth="4" strokeLinecap="round">
      <line x1="44" y1="168" x2="78" y2="168" />
      <line x1="30" y1="190" x2="78" y2="190" />
      <line x1="50" y1="212" x2="78" y2="212" />
    </g>
  </>
);

/** Clash marks: a cross that turns into a check once fixed. */
const MARK_BADGES = MARKS.map(([cx, cy], i) => (
  <g key={cx} className="mk" style={order(i)}>
    <circle cx={cx} cy={cy} r="11" />
    <text x={cx} y={cy + 4.5} className="x">✕</text>
    <text x={cx} y={cy + 4.5} className="ok">✓</text>
  </g>
));

export function FlatHouse({ stage }: { stage: number }) {
  const layer = (part: PartName, kind: string) => `hl ${kind}${plan.shows(part, stage) ? ' in' : ''}`;
  const off = (part: PartName) => (plan.shows(part, stage) ? '' : ' off');
  return (
    <svg className={`st-house${plan.lit(stage) ? ' lit' : ''}`} viewBox="0 0 360 290" role="img" aria-label="A house being built in stages: lot, foundation, frame, walls, roof, finished">
      <path className={`ghost${off('outline')}`} d="M104 240 V152 H276 V240 M90 153 L190 92 L290 153 Z" />
      <g className={layer('lot', 'hl-lot')}>
        {SOIL}
        <g className={`pin${off('stakes')}`}>{STAKE}</g>
      </g>
      <g className={layer('slab', 'hl-found')}>
        <rect className="h-conc" x="98" y="226" width="184" height="14" rx="2" />
        <rect className="h-conc-top" x="98" y="226" width="184" height="3" />
      </g>
      <g className={`${layer('frame', 'hl-frame')} h-timber`} strokeLinecap="round" strokeWidth="5">{STUDS}</g>
      <g className={layer('walls', 'hl-wall')}>
        <rect className="h-wall" x="104" y="150" width="172" height="76" strokeWidth="2" />
        <rect className="win" x="120" y="164" width="36" height="26" rx="2" strokeWidth="2" />
        <rect className="win" x="224" y="164" width="36" height="26" rx="2" strokeWidth="2" />
      </g>
      <g className={layer('roof', 'hl-roof')}>
        <path className="h-roof" d="M90 153 L190 92 L290 153 Z" />
        <rect className="h-roof" x="236" y="104" width="16" height="30" />
      </g>
      <g className={layer('finish', 'hl-done')}>{FINISH}</g>
      <g className={`${layer('marks', 'hl-marks')}${plan.fixed(stage) ? ' fixed' : ''}`}>{MARK_BADGES}</g>
    </svg>
  );
}
