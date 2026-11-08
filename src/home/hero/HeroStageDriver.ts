// Draws the hero timeline's events on the stage element: phase classes, ticked rows and the little cursor.
import type { HeroPhase, HeroSink } from './HeroTimeline';

const PHASES: HeroPhase[] = ['p1', 'p2', 'p3', 'p4', 'p5'];

export class HeroStageDriver implements HeroSink {
  private readonly todos: HTMLElement[];
  private readonly cursor: SVGElement | null;

  constructor(private readonly stage: HTMLElement) {
    this.todos = [...stage.querySelectorAll<HTMLElement>('.todo')];
    this.cursor = stage.querySelector<SVGElement>('.cursor');
  }

  setPhase(phase: HeroPhase): void {
    this.stage.classList.remove(...PHASES);
    this.stage.classList.add(phase);
  }

  reset(): void {
    this.todos.forEach((t) => t.classList.remove('done'));
    this.hideCursor();
    this.cursor?.style.removeProperty('left');
    this.cursor?.style.removeProperty('top');
  }

  moveCursor(row: number): void {
    const box = this.todos[row]?.querySelector('.cb');
    if (!this.cursor || !box) return;
    const s = this.stage.getBoundingClientRect();
    const r = box.getBoundingClientRect();
    this.cursor.style.left = `${r.left - s.left + r.width / 2 - 4}px`;
    this.cursor.style.top = `${r.top - s.top + r.height / 2 - 3}px`;
    this.cursor.classList.add('show');
  }

  press(down: boolean): void {
    this.cursor?.classList.toggle('click', down);
  }

  tick(row: number): void {
    this.todos[row]?.classList.add('done');
  }

  hideCursor(): void {
    this.cursor?.classList.remove('show', 'click');
  }
}
