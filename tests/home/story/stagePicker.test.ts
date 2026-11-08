import { describe, expect, it } from 'vitest';
import { StagePicker } from '../../../src/home/story/stagePicker';

describe('StagePicker', () => {
  it('starts on the first stage with only that step reached', () => {
    const picker = new StagePicker(6);
    expect(picker.current).toBe(0);
    expect(picker.isOn(0)).toBe(true);
    expect(picker.isOn(1)).toBe(false);
  });

  it('makes the step in the reading band current and reports the change', () => {
    const picker = new StagePicker(6);
    expect(picker.see([{ index: 3, visible: true }])).toBe(true);
    expect(picker.current).toBe(3);
    expect(picker.isCurrent(3)).toBe(true);
    expect(picker.see([{ index: 3, visible: true }])).toBe(false);
  });

  it('ignores steps leaving the band, so the stage holds between steps', () => {
    const picker = new StagePicker(6);
    picker.see([{ index: 2, visible: true }]);
    expect(picker.see([{ index: 2, visible: false }])).toBe(false);
    expect(picker.current).toBe(2);
  });

  it('keeps every reached step solid when scrolling back up', () => {
    const picker = new StagePicker(6);
    picker.see([{ index: 4, visible: true }]);
    picker.see([{ index: 1, visible: true }]);
    expect(picker.current).toBe(1);
    expect(picker.reached).toBe(4);
    expect([0, 1, 2, 3, 4, 5].map((i) => picker.isOn(i))).toEqual([true, true, true, true, true, false]);
  });

  it('takes the last visible step when several report at once, and ignores out-of-range steps', () => {
    const picker = new StagePicker(6);
    picker.see([{ index: 1, visible: true }, { index: 2, visible: true }, { index: 9, visible: true }, { index: -1, visible: true }]);
    expect(picker.current).toBe(2);
  });

  it('reads lower on phones, where the house is pinned at the top of the screen', () => {
    expect(StagePicker.rootMargin(false)).toBe('-45% 0px -45% 0px');
    expect(StagePicker.rootMargin(true)).toBe('-70% 0px -29% 0px');
  });
});
