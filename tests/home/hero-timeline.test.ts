import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HeroTimeline, type HeroSink } from '../../src/home/hero/HeroTimeline';

function makeSink() {
  const log: string[] = [];
  const sink: HeroSink = {
    setPhase: (p) => log.push(`phase:${p}`),
    reset: () => log.push('reset'),
    moveCursor: (row) => log.push(`move:${row}`),
    press: (down) => log.push(`press:${down}`),
    tick: (row) => log.push(`tick:${row}`),
    hideCursor: () => log.push('hide'),
  };
  return { sink, log };
}

describe('HeroTimeline', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('runs the phases in order, then ticks each row, then folds back into the tile', () => {
    const { sink, log } = makeSink();
    new HeroTimeline(sink, 3).start();
    vi.advanceTimersByTime(14599);
    expect(log.filter((l) => l.startsWith('phase:'))).toEqual(['phase:p1', 'phase:p2', 'phase:p3', 'phase:p4', 'phase:p5']);
    expect(log.filter((l) => l.startsWith('tick:'))).toEqual(['tick:0', 'tick:1', 'tick:2']);
    expect(log.indexOf('phase:p4')).toBeLessThan(log.indexOf('tick:0'));
    expect(log.indexOf('hide')).toBeLessThan(log.indexOf('phase:p5'));
  });

  it('hits the prototype times', () => {
    const { sink, log } = makeSink();
    new HeroTimeline(sink, 3).start();
    vi.advanceTimersByTime(79);
    expect(log).toEqual(['reset']);
    vi.advanceTimersByTime(1);
    expect(log.at(-1)).toBe('phase:p1');
    vi.advanceTimersByTime(13300 - 80 - 1);
    expect(log).not.toContain('phase:p5');
    vi.advanceTimersByTime(1);
    expect(log.at(-1)).toBe('phase:p5');
  });

  it('restarts after 14600 ms with the tile still showing: no empty gap and no early phase reset', () => {
    const { sink, log } = makeSink();
    new HeroTimeline(sink, 3).start();
    vi.advanceTimersByTime(14600);
    expect(log.filter((l) => l === 'reset')).toHaveLength(2);
    // The second cycle starts from the end state (p5), and only moves to p1 80 ms later.
    expect(log.slice(log.lastIndexOf('reset'))).toEqual(['reset']);
    vi.advanceTimersByTime(80);
    expect(log.at(-1)).toBe('phase:p1');
    expect(log.filter((l) => l === 'phase:p1')).toHaveLength(2);
  });

  it('keeps looping for several cycles', () => {
    const { sink, log } = makeSink();
    new HeroTimeline(sink, 3).start();
    vi.advanceTimersByTime(14600 * 3 + 100);
    expect(log.filter((l) => l === 'phase:p5')).toHaveLength(3);
    expect(log.filter((l) => l === 'phase:p1')).toHaveLength(4);
  });

  it('stop clears every timer, including the click release', () => {
    const { sink, log } = makeSink();
    const t = new HeroTimeline(sink, 3);
    t.start();
    vi.advanceTimersByTime(7400); // just after the first click, before its release
    t.stop();
    expect(vi.getTimerCount()).toBe(0);
    const before = log.length;
    vi.advanceTimersByTime(60000);
    expect(log.length).toBe(before);
  });

  it('shows the end state at once for reduced motion and sets no timers', () => {
    const { sink, log } = makeSink();
    new HeroTimeline(sink, 3, { reducedMotion: true }).start();
    expect(vi.getTimerCount()).toBe(0);
    expect(log).toEqual(['phase:p4', 'tick:0', 'tick:1', 'tick:2']);
  });

  it('waits at the end of a cycle while off screen and restarts when it is seen again', () => {
    const { sink, log } = makeSink();
    const t = new HeroTimeline(sink, 3);
    t.start();
    vi.advanceTimersByTime(5000);
    t.setVisible(false);
    vi.advanceTimersByTime(14600 - 5000);
    expect(log.filter((l) => l === 'reset')).toHaveLength(1);
    expect(vi.getTimerCount()).toBe(0);
    t.setVisible(true);
    expect(log.filter((l) => l === 'reset')).toHaveLength(2);
  });
});
