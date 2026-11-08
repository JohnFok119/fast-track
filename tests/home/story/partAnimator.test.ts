import { describe, expect, it } from 'vitest';
import { PartAnimator } from '../../../src/home/story/house/partAnimator';

interface FakePart {
  visible: boolean;
  position: { y: number };
  scale: { x: number; y: number; z: number; setScalar(s: number): void };
  material: { opacity: number };
}

function part(y = 0): FakePart {
  const scale = { x: 1, y: 1, z: 1, setScalar(s: number) { scale.x = s; scale.y = s; scale.z = s; } };
  return { visible: true, position: { y }, scale, material: { opacity: 1 } };
}

/** Runs the animator for a number of seconds in 1/60 s frames. */
function run(animator: PartAnimator, stage: number, seconds: number, reduce = false): void {
  for (let t = 0; t < seconds; t += 1 / 60) animator.update(stage, 1 / 60, reduce);
}

describe('PartAnimator', () => {
  it('hides a part before its stage and settles it in place once the story reaches it', () => {
    const animator = new PartAnimator();
    const slab = part(0.15);
    animator.add(slab, { from: 1, kind: 'rise', dy: 0.7 });
    run(animator, 0, 0.5);
    expect(slab.visible).toBe(false);
    run(animator, 1, 2);
    expect(slab.visible).toBe(true);
    expect(slab.position.y).toBeCloseTo(0.15, 3);
  });

  it('starts below its place when rising and above it when dropping', () => {
    const animator = new PartAnimator();
    const slab = part(0);
    const roof = part(0);
    animator.add(slab, { from: 1, kind: 'rise', dy: 1 });
    animator.add(roof, { from: 1, kind: 'drop', dy: 1 });
    animator.update(1, 1 / 60, false);
    expect(slab.position.y).toBeLessThan(0);
    expect(roof.position.y).toBeGreaterThan(0);
  });

  it('waits out a delay before moving', () => {
    const animator = new PartAnimator();
    const stud = part();
    const handle = animator.add(stud, { from: 2, kind: 'grow', delay: 0.5 });
    run(animator, 2, 0.3);
    expect(handle.t).toBe(0);
    run(animator, 2, 1.5);
    expect(handle.t).toBe(1);
    expect(stud.scale.y).toBeCloseTo(1);
  });

  it('jumps straight to the end state when motion is reduced', () => {
    const animator = new PartAnimator();
    const tree = part();
    const handle = animator.add(tree, { from: 5, kind: 'pop', delay: 0.4 });
    animator.update(5, 1 / 60, true);
    expect(handle.t).toBe(1);
    expect(tree.scale.x).toBe(1);
  });

  it('takes a part away again when scrolling back up, and after its last stage', () => {
    const animator = new PartAnimator();
    const stake = part();
    const outline = part();
    animator.add(stake, { from: 0, until: 5, kind: 'pop' });
    animator.addFade(outline, { from: 0, until: 4, max: 0.6 });
    run(animator, 3, 2);
    expect(outline.material.opacity).toBeCloseTo(0.6);
    run(animator, 4, 2);
    expect(outline.visible).toBe(false);
    expect(stake.visible).toBe(true);
    run(animator, 5, 2);
    expect(stake.visible).toBe(false);
  });

  it('tracks a plain value part, used to light the windows', () => {
    const animator = new PartAnimator();
    const lights = animator.addValue({ from: 5 });
    run(animator, 5, 2);
    expect(lights.t).toBe(1);
  });
});
