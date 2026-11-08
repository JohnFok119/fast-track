// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { HeroStageDriver } from '../../src/home/hero/HeroStageDriver';

function makeStage(): HTMLElement {
  document.body.innerHTML = `<div class="stage"><div class="todo"><span class="cb"></span></div><div class="todo"><span class="cb"></span></div><svg class="cursor"></svg></div>`;
  return document.querySelector('.stage') as HTMLElement;
}

describe('HeroStageDriver', () => {
  it('shows one phase at a time', () => {
    const stage = makeStage();
    const d = new HeroStageDriver(stage);
    d.setPhase('p2');
    d.setPhase('p3');
    expect(stage.classList.contains('p2')).toBe(false);
    expect(stage.classList.contains('p3')).toBe(true);
  });

  it('ticks a row and clears the ticks on reset, without touching the phase', () => {
    const stage = makeStage();
    const d = new HeroStageDriver(stage);
    d.setPhase('p5');
    d.tick(1);
    expect(stage.querySelectorAll('.todo')[1]?.classList.contains('done')).toBe(true);
    d.reset();
    expect(stage.querySelectorAll('.done')).toHaveLength(0);
    expect(stage.classList.contains('p5')).toBe(true);
  });

  it('shows, presses and hides the cursor', () => {
    const stage = makeStage();
    const cursor = stage.querySelector('.cursor') as SVGElement;
    const d = new HeroStageDriver(stage);
    d.moveCursor(0);
    expect(cursor.classList.contains('show')).toBe(true);
    d.press(true);
    expect(cursor.classList.contains('click')).toBe(true);
    d.press(false);
    d.hideCursor();
    expect(cursor.classList.contains('show')).toBe(false);
    expect(cursor.classList.contains('click')).toBe(false);
  });
});
