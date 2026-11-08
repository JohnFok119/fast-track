// Eases each part of the 3D house toward "built" once the story reaches its stage, and back when the reader scrolls
// up. Works on plain position, scale and opacity fields, so it runs without WebGL and is tested in node.

export type MoveKind = 'rise' | 'drop' | 'grow' | 'pop';

export interface Animatable {
  visible: boolean;
  position: { y: number };
  scale: { y: number; setScalar(s: number): unknown };
}

export interface Fadeable {
  visible: boolean;
  material: { opacity: number };
}

export interface StageWindow {
  from: number;
  until?: number;
  /** Seconds to wait before moving, so parts arrive one after another. */
  delay?: number;
}

export interface MoveSpec extends StageWindow {
  kind: MoveKind;
  /** How far a rising or dropping part travels. */
  dy?: number;
}

export interface PartHandle {
  /** 0 when gone, 1 when built. */
  readonly t: number;
}

type Target =
  | { kind: MoveKind; obj: Animatable; base: number; dy: number }
  | { kind: 'fade'; obj: Fadeable; max: number }
  | { kind: 'value' };

interface Part extends PartHandle {
  t: number;
  target: number;
  wait: number;
  from: number;
  until: number;
  delay: number;
  view: Target;
}

const SPEED = 6.5;
const SNAP = 0.0015;
const easeCubic = (t: number) => 1 - Math.pow(1 - t, 3);
/** Overshoots a little and settles, like a part set down. */
const easeBack = (t: number) => 1 + 2.4 * Math.pow(t - 1, 3) + 1.4 * Math.pow(t - 1, 2);

function show(view: Target, t: number): void {
  if (view.kind === 'value') return;
  if (view.kind === 'fade') {
    view.obj.material.opacity = t * view.max;
    view.obj.visible = t > 0.01;
    return;
  }
  const { obj } = view;
  obj.visible = t > 0.002;
  const e = view.kind === 'grow' ? easeCubic(t) : easeBack(t);
  if (view.kind === 'rise') obj.position.y = view.base - (1 - e) * view.dy;
  else if (view.kind === 'drop') obj.position.y = view.base + (1 - e) * view.dy;
  else if (view.kind === 'grow') obj.scale.y = Math.max(0.001, e);
  else obj.scale.setScalar(Math.max(0.001, e));
}

export class PartAnimator {
  private readonly parts: Part[] = [];

  add(obj: Animatable, spec: MoveSpec): PartHandle {
    return this.push(spec, { kind: spec.kind, obj, base: obj.position.y, dy: spec.dy ?? 0 });
  }

  addFade(obj: Fadeable, spec: StageWindow & { max: number }): PartHandle {
    return this.push(spec, { kind: 'fade', obj, max: spec.max });
  }

  addValue(spec: StageWindow): PartHandle {
    return this.push(spec, { kind: 'value' });
  }

  /** Moves every part one frame toward where the stage wants it. Reduced motion jumps straight there. */
  update(stage: number, dt: number, reduceMotion: boolean): void {
    for (const p of this.parts) {
      const want = stage >= p.from && stage < p.until ? 1 : 0;
      if (want !== p.target) {
        p.target = want;
        p.wait = want ? p.delay : 0;
      }
      if (reduceMotion) p.t = p.target;
      else if (p.wait > 0) p.wait -= dt;
      else {
        p.t += (p.target - p.t) * (1 - Math.exp(-dt * SPEED));
        if (Math.abs(p.target - p.t) < SNAP) p.t = p.target;
      }
      show(p.view, p.t);
    }
  }

  private push(spec: StageWindow, view: Target): PartHandle {
    const part: Part = {
      t: 0,
      target: 0,
      wait: 0,
      from: spec.from,
      until: spec.until ?? Number.POSITIVE_INFINITY,
      delay: spec.delay ?? 0,
      view,
    };
    this.parts.push(part);
    return part;
  }
}
