import { describe, expect, it } from 'vitest';
import { GuidedFlow } from '../../../src/ui/guided/GuidedFlow';

const data = {
  paths: [
    { id: 'adu-rent', pathway: 'ADU' as const },
    { id: 'sb9', pathway: 'SB9' as const },
  ],
  runs: [
    { city: 'irvine' as const, pathway: 'ADU' as const },
    { city: 'dana-point' as const, pathway: 'SB9' as const },
    { city: 'dana-point' as const, pathway: 'ADU' as const },
  ],
};

describe('GuidedFlow', () => {
  it('starts on the welcome card with only step 1 reachable', () => {
    const f = GuidedFlow.start(data);
    expect(f.step).toBe(0);
    expect(f.reachable).toBe(1);
  });

  it('opens step 2 after a build is picked, and step 6 once a city with a run is picked', () => {
    const f = GuidedFlow.start(data).go(1).pickPath('adu-rent');
    expect(f.reachable).toBe(2);
    expect(f.pickCity('irvine').reachable).toBe(6);
  });

  it('will not jump past what is reachable', () => {
    const f = GuidedFlow.start(data).go(1).pickPath('sb9');
    expect(f.go(5).step).toBe(2);
    expect(f.go(2).step).toBe(2);
    expect(f.go(1).step).toBe(1);
  });

  it('remembers the direction of the last move', () => {
    const f = GuidedFlow.start(data).go(1).pickPath('adu-rent').go(2).pickCity('irvine').go(3);
    expect(f.dir).toBe('fwd');
    expect(f.go(1).dir).toBe('back');
  });

  it('clears the city when the new build has no run for it', () => {
    const f = GuidedFlow.start(data).go(1).pickPath('adu-rent').pickCity('irvine').pickPath('sb9');
    expect(f.city).toBeNull();
    expect(f.reachable).toBe(2);
  });

  it('keeps the city when the new build still has a run for it', () => {
    const f = GuidedFlow.start(data).go(1).pickPath('adu-rent').pickCity('dana-point').pickPath('sb9');
    expect(f.city).toBe('dana-point');
    expect(f.run?.pathway).toBe('SB9');
  });

  it('ignores a city with no run for the picked build, and an unknown build', () => {
    const f = GuidedFlow.start(data).go(1).pickPath('sb9');
    expect(f.pickCity('irvine').city).toBeNull();
    expect(f.pickPath('nope').pathId).toBe('sb9');
  });

  it('restart forgets both answers and returns to the welcome card', () => {
    const f = GuidedFlow.start(data).go(1).pickPath('adu-rent').pickCity('irvine').go(4).restart();
    expect(f).toMatchObject({ step: 0, pathId: null, city: null, reachable: 1 });
  });

  it('never changes the flow it was called on', () => {
    const f = GuidedFlow.start(data);
    f.go(1);
    expect(f.step).toBe(0);
  });
});
