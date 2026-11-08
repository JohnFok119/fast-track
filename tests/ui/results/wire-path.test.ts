import { describe, expect, it } from 'vitest';
import { wirePath } from '../../../src/ui/results/wire-path';

const box = (left: number, top: number, right: number, bottom: number) => ({ left, top, right, bottom });

describe('wirePath', () => {
  it("runs from the bottom right of the city's words to the top right of the state's answer, in pane coordinates", () => {
    const wire = wirePath(box(120, 300, 520, 380), box(120, 600, 520, 700), box(100, 200, 560, 900));
    expect(wire.from).toEqual({ x: 412, y: 180 });
    expect(wire.to).toEqual({ x: 412, y: 400 });
    expect(wire.d).toBe('M412 180 C 434 290, 434 290, 412 400');
  });

  it('keeps a visible bend when the two quotes sit close together', () => {
    const wire = wirePath(box(0, 0, 100, 50), box(0, 60, 100, 90), box(0, 0, 200, 200));
    expect(wire.d).toBe('M92 50 C 114 74, 114 36, 92 60');
  });

  it('rounds to a tenth of a pixel so the path stays short', () => {
    const wire = wirePath(box(0.33, 0, 100.337, 50.06), box(0, 120.04, 100.337, 150), box(0, 0, 200, 200));
    expect(wire.from).toEqual({ x: 92.3, y: 50.1 });
    expect(wire.to).toEqual({ x: 92.3, y: 120 });
  });
});
